import { z } from "zod";
import { env } from "../config/env";

// ── Storyboard JSON schema the LLM must produce ──
export interface StoryboardScene {
  id: number;
  duration_s: number;
  type: "hero" | "carousel" | "feature_list" | "demo" | "outro";
  text: string;
  assets: { type: string; id: string; placement: string; scale: string }[];
  animation: string;
  audio_clip: string | null;
  tts_instruction: string | null;
}

export interface Storyboard {
  project_title: string;
  aspect_ratio: string;
  scenes: StoryboardScene[];
  brand: { primary_color: string; logo_id: string | null };
  caption_short: string;
}

// Zod validation for LLM output — coerce/fix common LLM mistakes
const llmSceneSchema = z.object({
  id: z.number(),
  duration_s: z.number().min(1).max(30).default(3),
  type: z.enum(["hero", "carousel", "feature_list", "demo", "outro"]).catch("hero"),
  text: z.string().max(300).default(""),
  assets: z.array(z.object({
    type: z.string(),
    id: z.string(),
    placement: z.string().default("center"),
    scale: z.string().default("contain"),
  })).default([]),
  animation: z.string().default("fade_in_up"),
  audio_clip: z.string().nullable().default(null),
  tts_instruction: z.string().nullable().default(null),
});

const llmStoryboardSchema = z.object({
  project_title: z.string().default("Untitled"),
  aspect_ratio: z.enum(["9:16", "16:9", "1:1"]).default("9:16"),
  scenes: z.array(llmSceneSchema).min(1),
  brand: z.object({
    primary_color: z.string().default("#FF6B35"),
    logo_id: z.string().nullable().default(null),
  }).default({ primary_color: "#FF6B35", logo_id: null }),
  caption_short: z.string().max(280).default(""),
});

const SYSTEM_PROMPT = `You are a motion design storyboard AI. Given a marketing script and a list of uploaded assets, produce a JSON storyboard.

Rules:
- Output ONLY valid JSON (no markdown fences, no explanation).
- Each scene.text must be ≤ 180 characters.
- Reference uploaded asset IDs in scenes[].assets[].id.
- Supported scene types: hero, carousel, feature_list, demo, outro.
- Supported animations: fade_in_up, slide_left, zoom_in, bounce, scale_up, fade_out.
- Keep total duration between 15–60 seconds.
- Include a caption_short (≤ 280 chars) for social sharing.
- brand.primary_color should be extracted or inferred from context.

JSON schema:
{
  "project_title": string,
  "aspect_ratio": "9:16" | "16:9" | "1:1",
  "scenes": [{ "id": number, "duration_s": number, "type": string, "text": string, "assets": [{"type":"image"|"logo","id":string,"placement":"center"|"left"|"right"|"background","scale":"cover"|"contain"|"fill"}], "animation": string, "audio_clip": string|null, "tts_instruction": string|null }],
  "brand": { "primary_color": string, "logo_id": string|null },
  "caption_short": string
}`;

function buildUserPrompt(script: string, assetIds: { id: string; type: string; filename: string }[], aspectRatio: string): string {
  const assetList = assetIds.length > 0
    ? `\nUploaded assets:\n${assetIds.map(a => `- ${a.id} (${a.type}): ${a.filename}`).join("\n")}`
    : "\nNo custom assets uploaded — use placeholder references.";

  return `Script:\n"""${script}"""\n\nAspect ratio: ${aspectRatio}${assetList}\n\nProduce the storyboard JSON now.`;
}

// ── Timeout-aware fetch with proper error handling ──
const LLM_TIMEOUT_MS = 60000; // 60s for cloud APIs
const OLLAMA_TIMEOUT_MS = 120000; // 120s for local Ollama

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error(`LLM request timed out after ${Math.round(timeoutMs / 1000)}s — the model is too slow or unreachable.`);
    }
    // Network errors: ECONNREFUSED, ENOTFOUND, etc.
    const cause = err?.cause?.code || err?.code || err?.message || "unknown";
    throw new Error(`LLM network error (${cause}). Cannot reach ${new URL(url).hostname}. Check your LLM configuration.`);
  } finally {
    clearTimeout(timer);
  }
}

// ── OpenRouter call ──
async function callOpenRouter(messages: { role: string; content: string }[]): Promise<string> {
  if (!env.openrouterApiKey) {
    throw new Error("OpenRouter API key is not configured (OPENROUTER_API_KEY is empty).");
  }

  const res = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.openrouterApiKey}`,
      "HTTP-Referer": env.frontendUrl.split(",")[0].trim(),
      "X-Title": "Flash Motion",
    },
    body: JSON.stringify({
      model: env.openrouterModel,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
    }),
  }, LLM_TIMEOUT_MS);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenRouter HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned an empty response — no content in choices[0].message.content");
  }
  return content;
}

// ── Ollama call ──
async function callOllama(messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetchWithTimeout(`${env.ollamaUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: env.ollamaModel,
      messages,
      stream: false,
      options: { num_predict: 2000, temperature: 0.7 },
    }),
  }, OLLAMA_TIMEOUT_MS);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Ollama HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json() as { message?: { content?: string } };
  const content = data?.message?.content;
  if (!content) {
    throw new Error("Ollama returned an empty response — no message.content");
  }
  return content;
}

// ── Unified LLM call with fallback ──
async function callLLM(messages: { role: string; content: string }[]): Promise<string> {
  if (env.llmMode === "openrouter" || (env.llmMode === "auto" && env.openrouterApiKey)) {
    try {
      return await callOpenRouter(messages);
    } catch (err) {
      if (env.llmMode === "auto") {
        console.warn("[LLM] OpenRouter failed, falling back to Ollama:", (err as Error).message);
        try {
          return await callOllama(messages);
        } catch (ollamaErr) {
          throw new Error(
            `Both LLM providers failed.\n` +
            `OpenRouter: ${(err as Error).message}\n` +
            `Ollama: ${(ollamaErr as Error).message}\n` +
            `Configure OPENROUTER_API_KEY or ensure Ollama is running.`
          );
        }
      }
      throw err;
    }
  }

  return await callOllama(messages);
}

// ── Extract JSON from LLM response (handles markdown fences) ──
function extractJson(raw: string): string {
  // Strip markdown code fences
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  // Find first { ... last }
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end !== -1) return raw.slice(start, end + 1);
  return raw.trim();
}

export async function generateStoryboard(
  script: string,
  assets: { id: string; type: string; filename: string }[],
  aspectRatio: string,
): Promise<Storyboard> {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(script, assets, aspectRatio) },
  ];

  const raw = await callLLM(messages);
  const jsonStr = extractJson(raw);

  try {
    const parsed = JSON.parse(jsonStr);
    // Validate and coerce LLM output through strict Zod schema
    const storyboard = llmStoryboardSchema.parse(parsed);

    // Ensure total duration is within 15-60s range
    const totalDuration = storyboard.scenes.reduce((sum, s) => sum + s.duration_s, 0);
    if (totalDuration > 120) {
      // Scale down scene durations proportionally
      const factor = 60 / totalDuration;
      storyboard.scenes.forEach((s) => {
        s.duration_s = Math.max(1, Math.round(s.duration_s * factor));
      });
    }

    return storyboard as Storyboard;
  } catch (err) {
    console.error("[LLM] Failed to parse storyboard. Raw output:", raw.slice(0, 500));
    throw new Error(`Failed to parse storyboard from LLM response: ${(err as Error).message}`);
  }
}

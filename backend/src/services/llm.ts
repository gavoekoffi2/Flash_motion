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
  duration_s: z.number().min(1).max(30).default(4),
  type: z.enum(["hero", "carousel", "feature_list", "demo", "outro"]).catch("hero"),
  text: z.string().max(300).default(""),
  assets: z.array(z.object({
    type: z.string(),
    id: z.string(),
    placement: z.string().default("center"),
    scale: z.string().default("contain"),
  })).default([]),
  // Free-form string — engine accepts any hint (kinetic_typography, spring_pop, …)
  animation: z.string().default("kinetic_typography"),
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

const SYSTEM_PROMPT = `You are a senior After Effects motion designer writing a JSON storyboard for an automated cinematic video engine.
The engine renders kinetic typography, particle fields, animated gradients, 3D perspective tilts, parallax Ken-Burns, glow pulses,
spring-based pop-ins and masked reveals — each scene is a short but polished motion graphic.

Hard rules:
- Output ONLY valid JSON (no markdown fences, no prose, no trailing commas).
- Each scene.text must be ≤ 160 characters and written as ONE impactful idea (headline, benefit, quote, CTA).
  Do NOT write long paragraphs — the engine animates text word-by-word, so short & punchy reads best.
- When listing features/benefits, separate them with "•" so the engine can stagger each one.
- Total duration: 15–45 seconds. Each scene: 2.5–5 seconds (hero & outro can go up to 6s).
- Build 4–6 scenes total with a clear narrative arc: HOOK → VALUE → PROOF → CTA.
- Reference uploaded asset IDs in scenes[].assets[].id. If no relevant asset, leave assets empty.

Supported scene types (each has its own cinematic treatment):
- "hero":         opening hook — large headline, animated gradient + particles, kinetic title. Use for intros.
- "carousel":     3–4 image grid with 3D tilted staggered entrance. Use to showcase multiple products/features.
- "feature_list": bulleted benefits list with staggered card reveal (use "•" separators in text).
- "demo":         product/app screenshot with 3D perspective tilt + subtle float. Use for showing the thing in action.
- "outro":        closing CTA with logo pop-in, glow pulse, shimmering button. Always finish with this.

Supported animation hints (engine uses these as flavor cues — any of these is valid):
  kinetic_typography, cinematic_zoom, parallax_pan, mask_reveal, particle_drift,
  spring_pop, perspective_tilt, float_hover, glow_pulse, shimmer_sweep,
  word_stagger, bounce_in, scale_up, fade_in_up, slide_left, slide_right.

Writing guidelines for scene.text:
- Use strong verbs, numbers, and concrete nouns.
- Avoid filler words ("just", "very", "really").
- Write in the language of the user's script.
- Hero text = a hook (≤ 8 words ideal).
- Outro text = a CTA promise (≤ 8 words ideal).

Other fields:
- brand.primary_color: extract/infer from context (hex). Default "#0b0f1f" for dark premium, "#4f46e5" for SaaS, "#FF6B35" for e-commerce.
- caption_short: ≤ 240 chars social caption with 1–3 emoji max.
- aspect_ratio: "9:16" (Shorts/Reels), "16:9" (YouTube/landing), "1:1" (feed).
- tts_instruction: optional short voice direction (e.g. "energetic", "calm", "authoritative"). null if unsure.

JSON schema:
{
  "project_title": string,
  "aspect_ratio": "9:16" | "16:9" | "1:1",
  "scenes": [{
    "id": number,
    "duration_s": number,
    "type": "hero" | "carousel" | "feature_list" | "demo" | "outro",
    "text": string,
    "assets": [{"type":"image"|"logo","id":string,"placement":"center"|"left"|"right"|"background","scale":"cover"|"contain"|"fill"}],
    "animation": string,
    "audio_clip": string | null,
    "tts_instruction": string | null
  }],
  "brand": { "primary_color": string, "logo_id": string | null },
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

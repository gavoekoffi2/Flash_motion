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

const TEMPLATE_HINTS: Record<string, string> = {
  HeroPromo: "hero+feature_list+outro: strong product headline, key benefits, CTA",
  Testimonial: "hero+feature_list(customer quotes with names)+outro: social proof focus",
  EcommerceShowcase: "hero+carousel(product names/prices)+feature_list(benefits)+outro",
  Educational: "hero(intro)+feature_list(numbered steps)+demo(walkthrough)+outro: step-by-step",
  SaasLaunch: "hero(tagline)+demo(key feature)+feature_list(benefits)+outro: tech/startup tone",
};

function buildUserPrompt(script: string, assetIds: { id: string; type: string; filename: string }[], aspectRatio: string, template = "HeroPromo"): string {
  const assetList = assetIds.length > 0
    ? `\nUploaded assets:\n${assetIds.map(a => `- ${a.id} (${a.type}): ${a.filename}`).join("\n")}`
    : "\nNo custom assets uploaded — use placeholder references.";

  const hint = TEMPLATE_HINTS[template] || TEMPLATE_HINTS.HeroPromo;
  return `Script:\n"""${script}"""\n\nAspect ratio: ${aspectRatio}\nTemplate: ${template} — ${hint}${assetList}\n\nProduce the storyboard JSON now.`;
}

// ── OpenRouter call ──
async function callOpenRouter(messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.openrouterApiKey}`,
      "HTTP-Referer": env.frontendUrl,
      "X-Title": "Flash Motion",
    },
    body: JSON.stringify({
      model: env.openrouterModel,
      messages,
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${body}`);
  }

  const data = await res.json() as any;
  return data.choices[0].message.content;
}

// ── Ollama call ──
async function callOllama(messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch(`${env.ollamaUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: env.ollamaModel,
      messages,
      stream: false,
      options: { num_predict: 2000, temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Ollama error ${res.status}: ${body}`);
  }

  const data = await res.json() as any;
  return data.message.content;
}

// ── Unified LLM call with fallback ──
async function callLLM(messages: { role: string; content: string }[]): Promise<string> {
  if (env.llmMode === "openrouter" || (env.llmMode === "auto" && env.openrouterApiKey)) {
    try {
      return await callOpenRouter(messages);
    } catch (err) {
      if (env.llmMode === "auto") {
        console.warn("[LLM] OpenRouter failed, falling back to Ollama:", err);
        return await callOllama(messages);
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
  template = "HeroPromo",
): Promise<Storyboard> {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(script, assets, aspectRatio, template) },
  ];

  const raw = await callLLM(messages);
  const jsonStr = extractJson(raw);

  try {
    const storyboard = JSON.parse(jsonStr) as Storyboard;
    // Basic validation
    if (!storyboard.scenes || !Array.isArray(storyboard.scenes) || storyboard.scenes.length === 0) {
      throw new Error("Storyboard must contain at least one scene");
    }
    return storyboard;
  } catch (err) {
    throw new Error(`Failed to parse storyboard JSON: ${(err as Error).message}\nRaw LLM output: ${raw.slice(0, 500)}`);
  }
}

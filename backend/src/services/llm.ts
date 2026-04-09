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

// ── Per-template style guidance — each template has a distinct visual/tonal identity ──
// The Remotion engine renders any scene type with every template, but tailoring the copy
// to the template's mood dramatically improves perceived quality.
const TEMPLATE_STYLE_GUIDE: Record<string, string> = {
  HeroPromo:
    "Modern marketing promo. Bold product claims, benefit-driven headlines, confident CTA. Colors: vibrant brand (#FF6B35 default). Tone: energetic, aspirational.",
  Testimonial:
    "Customer trust & social proof. Hero = credibility hook, feature_list = short quote (≤ 20 words, in italics), demo = star rating + result, outro = 'Join them' CTA. Tone: warm, authentic, human. Use first-person quotes.",
  EcommerceShowcase:
    "Product showcase for e-commerce. Hero = product name + hook, carousel = list of 3-4 products with prices, feature_list = key benefits, demo = unboxing moment, outro = 'Shop now' CTA. Tone: desirable, urgent. Include prices (€/$) and discounts when possible.",
  Educational:
    "Step-by-step tutorial. Hero = 'How to X in Y steps', feature_list = numbered steps (use '•' separator, max 5 steps), demo = concrete example, outro = 'Learn more'. Tone: clear, instructive, friendly. Start each step with an action verb.",
  SaasLaunch:
    "SaaS / tech product launch. Hero = bold product name + one-line value prop, feature_list = 3 killer features, demo = dashboard screenshot, outro = 'Start free trial'. Tone: confident, technical but clear. Default color #4f46e5. Use tech vocabulary (faster, smarter, integrate, automate).",
  CinematicReels:
    "Cinematic short-film aesthetic (letterbox, film grain, serif). Hero = evocative one-liner (≤ 6 words), feature_list = 3 poetic beats, demo = moody image caption, outro = production title card. Tone: mysterious, poetic, premium. Use sensory verbs (glimpse, whisper, unfold). Short sentences only. Default color #0b0806.",
  NeonCyberpunk:
    "Futuristic cyberpunk aesthetic (neon cyan/magenta, glitch, scanlines). Hero = hacked/terminal style headline (ALL CAPS OK), feature_list = system features (e.g. '• NEURAL LINK ACTIVE'), demo = product/interface as a 'system', outro = 'ENTER THE GRID' CTA. Tone: edgy, techno, sci-fi. Vocab: protocol, override, signal, grid, future. Default color #00f0ff.",
  RestaurantMenu:
    "Fine dining / gastronomy. Hero = restaurant name + cuisine type, feature_list = 3-4 signature dishes (use '•' separator, each with short poetic description), demo = dish highlight with price, outro = 'Réservez votre table'. Tone: refined, sensory (taste, aroma, texture). Use French gastronomy vocabulary. Default color #c9a961 (gold).",
  FitnessMotivation:
    "High-energy fitness / sport motivation. Hero = punchy motivational hook (≤ 5 words, imperative), feature_list = 3 workout benefits or challenges, demo = transformation/result statement, outro = 'Join the movement' CTA. Tone: explosive, imperative, hyped. ALL CAPS acceptable. Use action verbs (crush, push, dominate, transform). Default color #ff0033.",
  RealEstateTour:
    "Luxury real estate tour. Hero = property type + location, feature_list = 3-4 premium features (surface, rooms, view, amenities), demo = highlight room + price, outro = 'Visitez maintenant' CTA. Tone: elegant, aspirational, premium. Use numbers (m², bedrooms, €). Default color #0a1f44 (navy).",
  EventCountdown:
    "Festive event announcement with countdown vibe. Hero = event name + date, feature_list = 3 attractions (lineup, activities, perks), demo = location + time, outro = 'Grab your tickets' CTA. Tone: excited, celebratory, urgent. Use time words (tonight, soon, last chance). Default color #6d28d9 (purple).",
};

const SYSTEM_PROMPT_BASE = `You are a senior After Effects motion designer writing a JSON storyboard for an automated cinematic video engine.
The engine renders kinetic typography, particle fields, animated gradients, 3D perspective tilts, parallax Ken-Burns, glow pulses,
spring-based pop-ins, masked reveals and crossfade transitions between every scene — each scene is a short but polished motion graphic.

Hard rules:
- Output ONLY valid JSON (no markdown fences, no prose, no trailing commas).
- Each scene.text must be ≤ 160 characters and written as ONE impactful idea (headline, benefit, quote, CTA).
  Do NOT write long paragraphs — the engine animates text word-by-word, so short & punchy reads best.
- When listing features/benefits, separate them with "•" so the engine can stagger each one.
- Total duration: 18–40 seconds. Each scene: 3–5 seconds (hero & outro can go up to 6s).
- Build 4–6 scenes total with a clear narrative arc: HOOK → VALUE → PROOF → CTA.
- Use ALL four scene types across the storyboard for visual variety — never repeat "hero" more than once.
- Reference uploaded asset IDs in scenes[].assets[].id. If no relevant asset, leave assets empty.

Supported scene types (each has its own cinematic treatment per template):
- "hero":         opening hook — large headline, animated gradient + particles, kinetic title. Use ONCE at start.
- "carousel":     3–4 item grid with 3D tilted staggered entrance. Use to showcase multiple things.
- "feature_list": bulleted benefits/features/quotes with staggered card reveal. Use "•" separators in text.
- "demo":         screenshot / product shot with 3D perspective tilt + subtle float. Use for showing the thing in action.
- "outro":        closing CTA with logo pop-in, glow pulse, shimmering button. Always finish with this.

Supported animation hints (any of these is valid):
  kinetic_typography, cinematic_zoom, parallax_pan, mask_reveal, particle_drift,
  spring_pop, perspective_tilt, float_hover, glow_pulse, shimmer_sweep,
  word_stagger, bounce_in, scale_up, fade_in_up, slide_left, slide_right.

Writing guidelines for scene.text:
- Use strong verbs, numbers, and concrete nouns.
- Avoid filler words ("just", "very", "really").
- Write in the same language as the user's script.
- Hero text = a hook (≤ 8 words ideal).
- Outro text = a CTA promise (≤ 8 words ideal).

Other fields:
- brand.primary_color: infer from template style guide below, or extract from script context (hex).
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

function buildSystemPrompt(template: string | undefined): string {
  const guide = (template && TEMPLATE_STYLE_GUIDE[template]) || TEMPLATE_STYLE_GUIDE.HeroPromo;
  return `${SYSTEM_PROMPT_BASE}

═══ SELECTED TEMPLATE: ${template || "HeroPromo"} ═══
${guide}

Tailor every scene.text to match this template's tone, vocabulary and style. The visual rendering is already handled by the engine — your job is to write copy that SOUNDS like this template's world.`;
}

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

// ── Gemini (Google AI Studio) call ──
async function callGemini(messages: { role: string; content: string }[]): Promise<string> {
  if (!env.geminiApiKey) {
    throw new Error("Gemini API key is not configured (GEMINI_API_KEY is empty).");
  }

  // Gemini's API takes a single contents array. Convert chat-style messages:
  // put the system message as systemInstruction, user messages as contents.
  const system = messages.find((m) => m.role === "system")?.content;
  const userParts = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.geminiModel)}:generateContent?key=${env.geminiApiKey}`;

  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
      contents: userParts,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    }),
  }, LLM_TIMEOUT_MS);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini HTTP ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json() as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    promptFeedback?: { blockReason?: string };
  };

  if (data?.promptFeedback?.blockReason) {
    throw new Error(`Gemini blocked the prompt: ${data.promptFeedback.blockReason}`);
  }

  const content = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
  if (!content) {
    throw new Error("Gemini returned an empty response — no candidates[0].content.parts[].text");
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

// ── Unified LLM call with fallback chain ──
// Mode priorities:
//   "gemini"     → Gemini only
//   "openrouter" → OpenRouter only
//   "ollama"     → Ollama only
//   "auto"       → Gemini → OpenRouter → Ollama (first configured provider wins,
//                  fallback to the next on failure)
async function callLLM(messages: { role: string; content: string }[]): Promise<string> {
  if (env.llmMode === "gemini") return callGemini(messages);
  if (env.llmMode === "openrouter") return callOpenRouter(messages);
  if (env.llmMode === "ollama") return callOllama(messages);

  // auto: try in order of configured keys
  const errors: string[] = [];

  if (env.geminiApiKey) {
    try {
      return await callGemini(messages);
    } catch (err) {
      console.warn("[LLM] Gemini failed, trying next provider:", (err as Error).message);
      errors.push(`Gemini: ${(err as Error).message}`);
    }
  }

  if (env.openrouterApiKey) {
    try {
      return await callOpenRouter(messages);
    } catch (err) {
      console.warn("[LLM] OpenRouter failed, trying next provider:", (err as Error).message);
      errors.push(`OpenRouter: ${(err as Error).message}`);
    }
  }

  try {
    return await callOllama(messages);
  } catch (err) {
    errors.push(`Ollama: ${(err as Error).message}`);
  }

  throw new Error(
    `All LLM providers failed.\n${errors.join("\n")}\n` +
    `Configure GEMINI_API_KEY, OPENROUTER_API_KEY, or ensure Ollama is running.`,
  );
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
  template?: string,
): Promise<Storyboard> {
  const messages = [
    { role: "system", content: buildSystemPrompt(template) },
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

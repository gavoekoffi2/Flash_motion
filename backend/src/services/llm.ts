import { env } from '../config/env';

export interface StoryboardScene {
  id: number;
  duration_s: number;
  type: 'hero' | 'carousel' | 'feature_list' | 'demo' | 'outro';
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
  brand: { primary_color: string; secondary_color?: string; accent_color?: string; logo_id: string | null };
  caption_short: string;
}

function extractJson(raw: string): string {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  return start !== -1 && end !== -1 ? raw.slice(start, end + 1).trim() : raw.trim();
}

async function callOpenRouter(messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = env.openrouterApiKey;
  if (!apiKey) throw new Error('No OpenRouter API key');
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
      'HTTP-Referer': env.appUrl,
    },
    body: JSON.stringify({
      model: env.openrouterModel || 'mistralai/mistral-7b-instruct',
      messages,
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error('OpenRouter error ' + res.status + ': ' + await res.text());
  const data = await res.json() as any;
  return data.choices[0].message.content;
}

async function callGemini(messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('No Google API key');
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      generationConfig: { temperature: 0.7 },
    }),
  });
  if (!res.ok) throw new Error('Gemini error ' + res.status + ': ' + await res.text());
  const data = await res.json() as any;
  return data.candidates[0].content.parts[0].text;
}

/**
 * Fallback: generate a storyboard deterministically from the script.
 * No LLM required. Splits text into scenes by sentences.
 */
function generateFallbackStoryboard(
  script: string,
  assets: { id: string; type: string; filename: string }[],
  aspectRatio: string,
  template: string,
  brandColor: string,
): Storyboard {
  // Split script into sentences
  const rawSentences = script
    .replace(/([.!?])\s+/g, '$1\n')
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 3);

  const maxScenes = 5;
  const sentences = rawSentences.slice(0, maxScenes * 2);

  // Group sentences into up to 5 scenes
  const sceneCount = Math.min(maxScenes, Math.max(2, Math.ceil(sentences.length / 2)));
  const chunkSize = Math.ceil(sentences.length / sceneCount);

  const sceneTypes: StoryboardScene['type'][] = ['hero', 'feature_list', 'carousel', 'demo', 'outro'];
  const animations = ['fadeIn', 'slideUp', 'zoomIn', 'slideLeft', 'fadeOut'];

  const scenes: StoryboardScene[] = [];
  for (let i = 0; i < sceneCount; i++) {
    const chunk = sentences.slice(i * chunkSize, (i + 1) * chunkSize);
    const text = chunk.join(' ').substring(0, 200);
    scenes.push({
      id: i + 1,
      duration_s: i === 0 ? 5 : i === sceneCount - 1 ? 4 : 6,
      type: sceneTypes[i] || 'demo',
      text,
      assets: [],
      animation: animations[i] || 'fadeIn',
      audio_clip: null,
      tts_instruction: null,
    });
  }

  // Extract a short title from first sentence
  const firstSentence = sentences[0] || 'Flash Motion';
  const title = firstSentence.replace(/[.!?,]/g, '').substring(0, 50);

  return {
    project_title: title,
    aspect_ratio: aspectRatio,
    scenes,
    brand: {
      primary_color: brandColor || '#6C63FF',
      logo_id: assets.find(a => a.type === 'logo')?.id || null,
    },
    caption_short: title.substring(0, 80),
  };
}

export async function generateStoryboard(
  script: string,
  assets: { id: string; type: string; filename: string }[],
  aspectRatio: string,
  template = 'HeroPromo',
  brandColor?: string,
): Promise<Storyboard> {
  const systemPrompt = `You are a motion design storyboard AI for short social media videos.
Given a script, produce a JSON storyboard with 3-5 scenes.
Each scene has: id (number), duration_s (4-8), type ("hero"|"feature_list"|"carousel"|"demo"|"outro"), text (string), assets (array), animation (string), audio_clip (null), tts_instruction (null).
Also include: project_title, aspect_ratio, brand (with primary_color), caption_short.
Output ONLY valid JSON, no markdown, no explanation.`;

  const userPrompt = `Script: "${script}"
Assets available: ${JSON.stringify(assets)}
Aspect ratio: ${aspectRatio}
Template: ${template}
Brand color: ${brandColor || '#6C63FF'}

Produce the storyboard JSON now.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  // Try LLM providers in order, fall back to deterministic generator
  const llmMode = env.llmMode;

  const tryProviders = llmMode === 'openrouter'
    ? [callOpenRouter]
    : llmMode === 'auto'
    ? [callOpenRouter, callGemini]
    : [];

  for (const callFn of tryProviders) {
    try {
      const raw = await callFn(messages);
      const parsed = JSON.parse(extractJson(raw)) as Storyboard;
      console.log('[LLM] Storyboard generated via', callFn.name);
      return parsed;
    } catch (err) {
      console.warn('[LLM] Provider failed:', (err as Error).message, '— trying next');
    }
  }

  // Deterministic fallback — always works, no API key required
  console.log('[LLM] Using deterministic fallback storyboard generator');
  return generateFallbackStoryboard(script, assets, aspectRatio, template, brandColor || '#6C63FF');
}

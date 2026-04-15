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

// ── Appel Ollama local (Gemma 4 ou tout autre modèle installé) ──
async function callOllama(messages: { role: string; content: string }[]): Promise<string> {
  const ollamaUrl = env.ollamaUrl || 'http://localhost:11434';
  const model = env.ollamaModel || 'gemma4';

  // Convertir les messages en prompt unique pour les modèles Ollama
  const systemMsg = messages.find(m => m.role === 'system')?.content || '';
  const userMsg = messages.find(m => m.role === 'user')?.content || '';

  const res = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user', content: userMsg },
      ],
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 2000,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Ollama error ${res.status}: ${errText}`);
  }

  const data = await res.json() as any;
  return data.message?.content || data.response || '';
}

// ── Appel OpenRouter (fallback cloud si configuré) ──
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
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error('OpenRouter error ' + res.status + ': ' + await res.text());
  const data = await res.json() as any;
  return data.choices[0].message.content;
}

// ── Prompt système optimisé pour les vidéos publicitaires professionnelles ──
function buildSystemPrompt(template: string): string {
  const templateGuidance: Record<string, string> = {
    LuxuryAd: 'Crée un storyboard élégant et haut de gamme. Textes courts, percutants, vocabulaire luxueux. Types de scènes: hero, feature_list, testimonial, outro.',
    DynamicProduct: 'Crée un storyboard dynamique pour produit tech/moderne. Textes énergiques, chiffres clés. Types: hero, feature_list, carousel, outro.',
    SocialMediaBurst: 'Crée un storyboard viral pour Reels/TikTok. Textes courts, accrocheurs, emojis bienvenus. Types: hero, feature_list, outro.',
    CinematicBrand: 'Crée un storyboard cinématographique pour marque. Textes narratifs et inspirants. Types: hero, feature_list, carousel, outro.',
    CinematicPromo: 'Crée un storyboard cinématique professionnel. Textes forts et visuels. Types: hero, feature_list, carousel, demo, outro.',
    HeroPromo: 'Crée un storyboard promotionnel impactant. Types: hero, feature_list, carousel, demo, outro.',
    EcommerceShowcase: 'Crée un storyboard e-commerce avec focus produit et CTA fort. Types: hero, carousel, feature_list, outro.',
    Testimonial: 'Crée un storyboard basé sur des témoignages clients. Types: hero, feature_list, outro.',
    SaasLaunch: 'Crée un storyboard pour lancement SaaS. Mets en avant les bénéfices et le CTA. Types: hero, feature_list, demo, outro.',
    Educational: 'Crée un storyboard éducatif structuré en étapes claires. Types: hero, feature_list, demo, outro.',
  };

  const guidance = templateGuidance[template] || templateGuidance['HeroPromo'];

  return `Tu es un expert en motion design et publicité vidéo professionnelle.
${guidance}

RÈGLES STRICTES:
1. Génère un storyboard JSON avec 3 à 5 scènes maximum.
2. Chaque scène doit avoir: id (number), duration_s (entre 4 et 8), type (voir ci-dessus), text (max 120 caractères, percutant), assets (tableau vide []), animation (string), audio_clip (null), tts_instruction (texte à lire à voix haute, naturel et fluide).
3. Le champ "text" doit être court, fort, et adapté à l'affichage vidéo.
4. Le champ "tts_instruction" doit être une phrase naturelle à lire, plus longue que "text" si besoin.
5. Inclure: project_title, aspect_ratio, brand (avec primary_color hex), caption_short.
6. Retourner UNIQUEMENT du JSON valide, sans markdown, sans explication, sans balises.

FORMAT JSON ATTENDU:
{
  "project_title": "...",
  "aspect_ratio": "9:16",
  "scenes": [
    {
      "id": 1,
      "duration_s": 5,
      "type": "hero",
      "text": "Texte court et percutant",
      "assets": [],
      "animation": "fade_in_up",
      "audio_clip": null,
      "tts_instruction": "Phrase naturelle pour la voix off de cette scène."
    }
  ],
  "brand": { "primary_color": "#6C63FF", "logo_id": null },
  "caption_short": "Résumé en 80 caractères max"
}`;
}

// ── Fallback déterministe (sans LLM) ──
function generateFallbackStoryboard(
  script: string,
  assets: { id: string; type: string; filename: string }[],
  aspectRatio: string,
  template: string,
  brandColor: string,
): Storyboard {
  const rawSentences = script
    .replace(/([.!?])\s+/g, '$1\n')
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 3);

  const maxScenes = 5;
  const sentences = rawSentences.slice(0, maxScenes * 2);
  const sceneCount = Math.min(maxScenes, Math.max(3, Math.ceil(sentences.length / 2)));
  const chunkSize = Math.ceil(sentences.length / sceneCount);

  const sceneTypes: StoryboardScene['type'][] = ['hero', 'feature_list', 'carousel', 'demo', 'outro'];
  const animations = ['fade_in_up', 'slide_left', 'zoom_in', 'slide_right', 'fade_out'];

  const scenes: StoryboardScene[] = [];
  for (let i = 0; i < sceneCount; i++) {
    const chunk = sentences.slice(i * chunkSize, (i + 1) * chunkSize);
    const text = chunk.join(' ').substring(0, 120);
    scenes.push({
      id: i + 1,
      duration_s: i === 0 ? 5 : i === sceneCount - 1 ? 4 : 5,
      type: sceneTypes[i] || 'demo',
      text,
      assets: [],
      animation: animations[i] || 'fade_in_up',
      audio_clip: null,
      tts_instruction: text,
    });
  }

  const title = (sentences[0] || 'Flash Motion').replace(/[.!?,]/g, '').substring(0, 50);
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

// ── Fonction principale de génération de storyboard ──
export async function generateStoryboard(
  script: string,
  assets: { id: string; type: string; filename: string }[],
  aspectRatio: string,
  template = 'HeroPromo',
  brandColor?: string,
): Promise<Storyboard> {
  const systemPrompt = buildSystemPrompt(template);

  const userPrompt = `Script publicitaire: "${script}"
Assets disponibles: ${JSON.stringify(assets)}
Format vidéo: ${aspectRatio}
Template: ${template}
Couleur de marque: ${brandColor || '#6C63FF'}

Génère le storyboard JSON maintenant.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const llmMode = env.llmMode;

  // Ordre de priorité: Ollama (Gemma local, gratuit) → OpenRouter (cloud) → Fallback
  const tryProviders: Array<(msgs: typeof messages) => Promise<string>> =
    llmMode === 'ollama'
      ? [callOllama]
      : llmMode === 'openrouter'
      ? [callOpenRouter]
      : llmMode === 'auto'
      ? [callOllama, callOpenRouter]  // Ollama (Gemma) en premier, OpenRouter en fallback
      : [callOllama];                 // Par défaut: Ollama local

  for (const callFn of tryProviders) {
    try {
      const raw = await callFn(messages);
      const parsed = JSON.parse(extractJson(raw)) as Storyboard;
      // Valider que le storyboard a bien des scènes
      if (!parsed.scenes || parsed.scenes.length === 0) {
        throw new Error('Storyboard vide reçu du LLM');
      }
      console.log('[LLM] Storyboard généré via', callFn.name, `(${parsed.scenes.length} scènes)`);
      return parsed;
    } catch (err) {
      console.warn('[LLM] Provider échoué:', (err as Error).message, '— essai suivant...');
    }
  }

  // Fallback déterministe — fonctionne toujours sans API
  console.log('[LLM] Utilisation du générateur de storyboard déterministe (fallback)');
  return generateFallbackStoryboard(script, assets, aspectRatio, template, brandColor || '#6C63FF');
}

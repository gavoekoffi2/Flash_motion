import { env } from "../config/env";

export interface TTSOptions {
  text: string;
  voice?: string;
  language?: string;
}

export interface TTSResult {
  audioUrl: string;
  duration: number; // en secondes
}

/**
 * Génère de l'audio TTS en utilisant ElevenLabs ou un service local.
 * Pour le MVP, on retourne un placeholder.
 * À intégrer avec ElevenLabs API ou Piper TTS.
 */
export async function generateTTS(options: TTSOptions): Promise<TTSResult> {
  const { text, voice = "default", language = "fr" } = options;

  if (env.ttsEngine === "elevenlabs" && env.elevenLabsApiKey) {
    return generateTTSElevenLabs(text, voice);
  }

  if (env.ttsEngine === "piper") {
    return generateTTSPiper(text, voice, language);
  }

  // Fallback: return placeholder
  console.warn("[TTS] No TTS engine configured, returning placeholder");
  return {
    audioUrl: null as any,
    duration: estimateTextDuration(text),
  };
}

/**
 * Génère du TTS via ElevenLabs API.
 */
async function generateTTSElevenLabs(text: string, voice: string): Promise<TTSResult> {
  try {
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM", {
      method: "POST",
      headers: {
        "xi-api-key": env.elevenLabsApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    // À implémenter: upload du buffer audio sur S3 et retourner l'URL signée
    const audioUrl = ""; // placeholder
    const duration = estimateTextDuration(text);

    return { audioUrl, duration };
  } catch (err) {
    console.error("[TTS] ElevenLabs error:", err);
    throw err;
  }
}

/**
 * Génère du TTS via Piper (local).
 */
async function generateTTSPiper(text: string, voice: string, language: string): Promise<TTSResult> {
  // À implémenter: appel à Piper TTS local
  // Pour le MVP, on retourne un placeholder
  console.warn("[TTS] Piper TTS not yet implemented");
  return {
    audioUrl: "",
    duration: estimateTextDuration(text),
  };
}

/**
 * Estime la durée d'un texte parlé (approximation).
 * Moyenne: 150 mots par minute = 2.5 mots par seconde.
 */
function estimateTextDuration(text: string): number {
  const wordCount = text.split(/\s+/).length;
  const wordsPerSecond = 2.5;
  return Math.ceil(wordCount / wordsPerSecond);
}

/**
 * Valide les options TTS.
 */
export function validateTTSOptions(options: any): boolean {
  if (!options.text || typeof options.text !== "string") {
    return false;
  }
  if (options.text.length > 5000) {
    return false;
  }
  return true;
}

/**
 * Génère du TTS pour toutes les scènes d'un projet.
 * Retourne un map sceneId -> TTSResult.
 */
export async function generateProjectTTS(
  scenes: Array<{ id: string; narration?: string; text?: string }>,
  projectId: string
): Promise<Record<string, { s3Key: string; duration: number }>> {
  const results: Record<string, { s3Key: string; duration: number }> = {};
  
  for (const scene of scenes) {
    const text = scene.narration || scene.text || "";
    if (!text.trim()) continue;
    
    try {
      const ttsResult = await generateTTS({ text });
      if (ttsResult.audioUrl) {
        results[scene.id] = {
          s3Key: ttsResult.audioUrl,
          duration: ttsResult.duration,
        };
      }
    } catch (err) {
      console.error(`[TTS] Failed for scene ${scene.id}:`, err);
    }
  }
  
  return results;
}

import { env } from "../config/env";
import { uploadToS3 } from "./storage";
import crypto from "crypto";

export interface TTSResult {
  s3Key: string;
  durationMs: number;
}

/**
 * Generate TTS audio for a given text using configured engine.
 * Supports: ElevenLabs (cloud), Piper (local), or none.
 */
export async function generateTTS(
  text: string,
  voice: string = "default",
  projectId: string,
): Promise<TTSResult | null> {
  if (env.ttsEngine === "none") return null;

  if (env.ttsEngine === "elevenlabs") {
    return generateElevenLabs(text, voice, projectId);
  }

  if (env.ttsEngine === "piper") {
    return generatePiper(text, voice, projectId);
  }

  return null;
}

async function generateElevenLabs(text: string, voice: string, projectId: string): Promise<TTSResult> {
  const voiceId = resolveElevenLabsVoice(voice);

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": env.elevenlabsApiKey,
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ElevenLabs TTS error ${res.status}: ${body}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const hash = crypto.randomBytes(6).toString("hex");
  const s3Key = `projects/${projectId}/tts/${hash}.mp3`;

  await uploadToS3(s3Key, buffer, "audio/mpeg");

  // Estimate duration: ~150 words per minute, avg 5 chars per word
  const wordCount = text.split(/\s+/).length;
  const durationMs = Math.max(1000, (wordCount / 150) * 60 * 1000);

  return { s3Key, durationMs };
}

async function generatePiper(text: string, _voice: string, projectId: string): Promise<TTSResult> {
  // Piper local TTS — requires piper binary on the system
  const { execFileSync } = await import("child_process");
  const hash = crypto.randomBytes(6).toString("hex");
  const tempPath = `/tmp/flash-motion/tts-${hash}.wav`;

  try {
    // Use execFileSync with stdin input to prevent shell injection
    execFileSync("piper", ["--model", env.piperModel, "--output_file", tempPath], {
      input: text,
      timeout: 30000,
    });

    const fs = await import("fs");
    const buffer = fs.readFileSync(tempPath);
    const s3Key = `projects/${projectId}/tts/${hash}.wav`;

    await uploadToS3(s3Key, buffer, "audio/wav");

    const wordCount = text.split(/\s+/).length;
    const durationMs = Math.max(1000, (wordCount / 150) * 60 * 1000);

    // Cleanup
    try { fs.unlinkSync(tempPath); } catch {}

    return { s3Key, durationMs };
  } catch (err) {
    console.error("[TTS] Piper error:", err);
    throw new Error(`Piper TTS failed: ${(err as Error).message}`);
  }
}

function resolveElevenLabsVoice(voice: string): string {
  const voices: Record<string, string> = {
    "default": "21m00Tcm4TlvDq8ikWAM",         // Rachel
    "female_neutral": "21m00Tcm4TlvDq8ikWAM",    // Rachel
    "male_neutral": "VR6AewLTigWG4xSOukaG",      // Arnold
    "female_energetic": "EXAVITQu4vr4xnSDxMaL",  // Bella
    "male_deep": "ErXwobaYiN019PkySvjV",         // Antoni
    "female_african_accent_short": "MF3mGyEYCl7XYWbV9V6O",  // Elli
  };
  return voices[voice] || voices["default"];
}

/**
 * Generate TTS for all scenes that have tts_instruction set.
 * Returns a map of scene_id -> s3Key.
 */
export async function generateProjectTTS(
  scenes: { id: number; text: string; tts_instruction: string | null }[],
  projectId: string,
): Promise<Record<number, TTSResult>> {
  if (env.ttsEngine === "none") return {};

  const results: Record<number, TTSResult> = {};

  for (const scene of scenes) {
    if (!scene.tts_instruction) continue;

    try {
      const result = await generateTTS(scene.text, scene.tts_instruction, projectId);
      if (result) {
        results[scene.id] = result;
      }
    } catch (err) {
      console.error(`[TTS] Scene ${scene.id} failed:`, err);
      // Continue with other scenes
    }
  }

  return results;
}

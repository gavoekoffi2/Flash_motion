import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";

// Voices for different languages
const VOICE_MAP: Record<string, string> = {
  fr: "fr-FR-DeniseNeural",
  en: "en-US-JennyNeural",
  ar: "ar-SA-ZariyahNeural",
  es: "es-ES-ElviraNeural",
  pt: "pt-BR-FranciscaNeural",
  de: "de-DE-KatjaNeural",
};

/**
 * Generate TTS audio for a single text, upload to S3, return public URL.
 * Returns null if TTS fails (render continues without audio).
 */
export async function generateSceneAudio(
  text: string,
  sceneId: number,
  jobId: string,
  lang: string = "fr",
  tempDir: string,
  s3: S3Client,
  bucket: string,
  s3InternalEndpoint: string,
  s3PublicEndpoint: string,
): Promise<string | null> {
  const clean = text.replace(/[\*\_\#\~\`]/g, "").trim();
  if (!clean || clean.length < 5) return null;

  const voice = VOICE_MAP[lang] || VOICE_MAP["fr"];
  const localPath = path.join(tempDir, `${jobId}_tts_scene${sceneId}.mp3`);
  const s3Key = `tts/${jobId}/scene${sceneId}.mp3`;

  try {
    // Generate audio via Microsoft Edge TTS (free, no API key)
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    await tts.toFile(localPath, clean);

    const buffer = fs.readFileSync(localPath);

    // Upload to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        Body: buffer,
        ContentType: "audio/mpeg",
      }),
    );

    // Get presigned URL (1 hour)
    const rawUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: bucket, Key: s3Key }),
      { expiresIn: 3600 },
    );

    // Rewrite internal MinIO URL to public endpoint
    const urlObj = new URL(rawUrl);
    const publicUrl = rawUrl.replace(urlObj.origin, s3PublicEndpoint);

    console.log(`[TTS] Scene ${sceneId} audio generated (${buffer.byteLength} bytes)`);
    return publicUrl;
  } catch (err) {
    console.warn(`[TTS] Scene ${sceneId} audio generation failed (non-fatal):`, (err as Error).message);
    return null;
  } finally {
    try {
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    } catch {}
  }
}

/**
 * Generate TTS for all scenes in a storyboard.
 * Returns a map of scene.id -> audio URL.
 */
export async function generateStoryboardAudio(
  scenes: Array<{ id: number; text: string; tts_instruction?: string | null }>,
  jobId: string,
  lang: string = "fr",
  tempDir: string,
  s3: S3Client,
  bucket: string,
  s3InternalEndpoint: string,
  s3PublicEndpoint: string,
): Promise<Record<number, string>> {
  console.log(`[TTS] Generating audio for ${scenes.length} scenes (lang: ${lang})...`);
  const audioUrls: Record<number, string> = {};

  // Generate in parallel (max 3 at a time to avoid rate limiting)
  const BATCH = 3;
  for (let i = 0; i < scenes.length; i += BATCH) {
    const batch = scenes.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (scene) => {
        const ttsText = scene.tts_instruction || scene.text;
        if (!ttsText) return;

        // Remove bullet separators for spoken text
        const spokenText = ttsText.replace(/\s*•\s*/g, ". ").trim();
        const url = await generateSceneAudio(
          spokenText,
          scene.id,
          jobId,
          lang,
          tempDir,
          s3,
          bucket,
          s3InternalEndpoint,
          s3PublicEndpoint,
        );
        if (url) audioUrls[scene.id] = url;
      }),
    );
  }

  console.log(`[TTS] Generated ${Object.keys(audioUrls).length}/${scenes.length} audio tracks`);
  return audioUrls;
}

import { env } from "../config/env";
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);

export interface TTSOptions {
  text: string;
  voice?: string;
  language?: string;
}

export interface TTSResult {
  audioUrl: string;
  duration: number;
}

export async function generateTTS(options: TTSOptions): Promise<TTSResult> {
  // Utilisation de la voix Microsoft Edge Neural (Gratuit, Haute Qualité)
  const { text, voice = "fr-FR-HenriNeural" } = options;
  console.log(`[TTS] Génération audio via Edge Neural TTS...`);
  
  try {
    const fileName = `tts_${Date.now()}.mp3`;
    const filePath = `/tmp/${fileName}`;
    
    // Appel à edge-tts (CLI installé sur le VPS)
    const safeText = text.replace(/"/g, '\\"');
    await execAsync(`edge-tts --voice "${voice}" --text "${safeText}" --write-media ${filePath}`);
    
    // À ce stade, dans un environnement prod, on uploadera sur MinIO/S3.
    // Pour l'instant on retourne une URL fictive qui sera traitée par le worker
    const audioUrl = `http://minio:9000/flashmotion-assets/temp/${fileName}`;

    return {
      audioUrl,
      duration: estimateTextDuration(text),
    };
  } catch (err) {
    console.error("[TTS] Erreur Edge TTS:", err);
    return { audioUrl: "", duration: estimateTextDuration(text) };
  }
}

function estimateTextDuration(text: string): number {
  const wordCount = text.split(/\s+/).length;
  const wordsPerSecond = 2.5;
  return Math.ceil(wordCount / wordsPerSecond);
}

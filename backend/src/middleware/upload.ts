import multer from "multer";
import { env } from "../config/env";

// SVG intentionally excluded — can contain embedded JavaScript (stored XSS)
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/mp3"];
const ALLOWED_FONT_TYPES = [
  "font/woff",
  "font/woff2",
  "font/ttf",
  "application/x-font-ttf",
  "application/x-font-woff",
  "application/font-woff",
];
const ALL_ALLOWED = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_AUDIO_TYPES, ...ALLOWED_FONT_TYPES];

// Magic byte signatures for allowed image types
const MAGIC_BYTES: Record<string, number[][]> = {
  "image/png": [[0x89, 0x50, 0x4E, 0x47]],
  "image/jpeg": [[0xFF, 0xD8, 0xFF]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header
};

/**
 * Verify that the file buffer matches expected magic bytes for the claimed MIME type.
 * Returns true for non-image types (audio/fonts) since they are less exploitable.
 */
export function verifyMagicBytes(buffer: Buffer, mimetype: string): boolean {
  const signatures = MAGIC_BYTES[mimetype];
  if (!signatures) return true; // No magic byte check for audio/fonts
  return signatures.some(sig =>
    sig.every((byte, i) => buffer.length > i && buffer[i] === byte)
  );
}

const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024,
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    if (ALL_ALLOWED.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed. Allowed: images (png, jpg, webp), audio (mp3, wav), fonts (woff, ttf)`));
    }
  },
});

export function getAssetType(mimetype: string): "IMAGE" | "LOGO" | "AUDIO" | "FONT" {
  if (ALLOWED_IMAGE_TYPES.includes(mimetype)) return "IMAGE";
  if (ALLOWED_AUDIO_TYPES.includes(mimetype)) return "AUDIO";
  if (ALLOWED_FONT_TYPES.includes(mimetype)) return "FONT";
  return "IMAGE";
}

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

// Magic byte signatures for allowed file types
const MAGIC_BYTES: Record<string, number[][]> = {
  // Images
  "image/png": [[0x89, 0x50, 0x4E, 0x47]],
  "image/jpeg": [[0xFF, 0xD8, 0xFF]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header
  // Audio
  "audio/mpeg": [[0xFF, 0xFB], [0xFF, 0xFA], [0xFF, 0xF3], [0xFF, 0xF2], [0x49, 0x44, 0x33]], // MP3 sync words + ID3 tag
  "audio/mp3": [[0xFF, 0xFB], [0xFF, 0xFA], [0xFF, 0xF3], [0xFF, 0xF2], [0x49, 0x44, 0x33]],
  "audio/wav": [[0x52, 0x49, 0x46, 0x46]], // RIFF header
  // Fonts
  "font/woff": [[0x77, 0x4F, 0x46, 0x46]],  // wOFF
  "font/woff2": [[0x77, 0x4F, 0x46, 0x32]], // wOF2
  "font/ttf": [[0x00, 0x01, 0x00, 0x00]],
  "application/x-font-ttf": [[0x00, 0x01, 0x00, 0x00]],
  "application/x-font-woff": [[0x77, 0x4F, 0x46, 0x46]],
  "application/font-woff": [[0x77, 0x4F, 0x46, 0x46]],
};

/**
 * Verify that the file buffer matches expected magic bytes for the claimed MIME type.
 */
export function verifyMagicBytes(buffer: Buffer, mimetype: string): boolean {
  const signatures = MAGIC_BYTES[mimetype];
  if (!signatures) return true; // No signatures defined for this type — allow
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

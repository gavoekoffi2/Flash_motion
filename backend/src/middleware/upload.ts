import multer from "multer";
import path from "path";
import { env } from "../config/env";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
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
      cb(new Error(`File type ${file.mimetype} not allowed. Allowed: images (png, jpg, webp, svg), audio (mp3, wav), fonts (woff, ttf)`));
    }
  },
});

export function getAssetType(mimetype: string): "IMAGE" | "LOGO" | "AUDIO" | "FONT" {
  if (mimetype === "image/svg+xml") return "LOGO";
  if (ALLOWED_IMAGE_TYPES.includes(mimetype)) return "IMAGE";
  if (ALLOWED_AUDIO_TYPES.includes(mimetype)) return "AUDIO";
  if (ALLOWED_FONT_TYPES.includes(mimetype)) return "FONT";
  return "IMAGE";
}

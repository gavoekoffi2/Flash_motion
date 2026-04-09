import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Fallback to root .env
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "4000", 10),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  databaseUrl: (() => {
    if (!process.env.DATABASE_URL) {
      console.error("[CONFIG] DATABASE_URL is required. Exiting.");
      process.exit(1);
    }
    return process.env.DATABASE_URL;
  })(),

  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",

  jwtSecret: (() => {
    const secret = process.env.JWT_SECRET || "dev-secret-change-me";
    if (secret === "dev-secret-change-me" && process.env.NODE_ENV !== "development") {
      console.error("[SECURITY] JWT_SECRET must be set in non-development environments. Exiting.");
      process.exit(1);
    }
    return secret;
  })(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  s3Endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
  s3AccessKey: process.env.S3_ACCESS_KEY || "minioadmin",
  s3SecretKey: process.env.S3_SECRET_KEY || "minioadmin",
  s3Bucket: process.env.S3_BUCKET || "flash-motion",
  s3Region: process.env.S3_REGION || "us-east-1",

  llmMode: (process.env.LLM_MODE || "auto") as "openrouter" | "ollama" | "gemini" | "auto",
  openrouterApiKey: process.env.OPENROUTER_API_KEY || "",
  openrouterModel: process.env.OPENROUTER_MODEL || "mistralai/mistral-7b-instruct",
  ollamaUrl: process.env.OLLAMA_URL || "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL || "mistral",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.0-flash",

  // TTS
  ttsEngine: (process.env.TTS_ENGINE || "none") as "none" | "elevenlabs" | "piper",
  elevenlabsApiKey: process.env.ELEVENLABS_API_KEY || "",
  piperModel: process.env.PIPER_MODEL || "fr_FR-upmc-medium",

  // Email (SMTP)
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFrom: process.env.SMTP_FROM || "noreply@flashmotion.dev",

  // Limits
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || "8", 10),
  maxAssetsPerProject: parseInt(process.env.MAX_ASSETS_PER_PROJECT || "20", 10),
  maxConcurrentRenders: parseInt(process.env.MAX_CONCURRENT_RENDERS || "1", 10),
  renderTimeoutMs: parseInt(process.env.RENDER_TIMEOUT_MS || "300000", 10),
  tempDir: process.env.TEMP_DIR || "/tmp/flash-motion",
  retentionDays: parseInt(process.env.RETENTION_DAYS || "30", 10),

  // App URL (for email links)
  appUrl: process.env.APP_URL || process.env.FRONTEND_URL || "http://localhost:3000",
} as const;

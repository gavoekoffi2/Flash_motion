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

  databaseUrl: process.env.DATABASE_URL!,

  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",

  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  s3Endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
  s3AccessKey: process.env.S3_ACCESS_KEY || "minioadmin",
  s3SecretKey: process.env.S3_SECRET_KEY || "minioadmin",
  s3Bucket: process.env.S3_BUCKET || "flash-motion",
  s3Region: process.env.S3_REGION || "us-east-1",

  llmMode: (process.env.LLM_MODE || "auto") as "openrouter" | "ollama" | "auto",
  openrouterApiKey: process.env.OPENROUTER_API_KEY || "",
  openrouterModel: process.env.OPENROUTER_MODEL || "mistralai/mistral-7b-instruct",
  ollamaUrl: process.env.OLLAMA_URL || "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL || "mistral",

  ttsEngine: (process.env.TTS_ENGINE || "none") as "none" | "elevenlabs" | "piper",
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || "",

  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || "8", 10),
  maxAssetsPerProject: parseInt(process.env.MAX_ASSETS_PER_PROJECT || "20", 10),
  maxConcurrentRenders: parseInt(process.env.MAX_CONCURRENT_RENDERS || "1", 10),
  renderTimeoutMs: parseInt(process.env.RENDER_TIMEOUT_MS || "300000", 10),
  tempDir: process.env.TEMP_DIR || "/tmp/flash-motion",
  retentionDays: parseInt(process.env.RETENTION_DAYS || "30", 10),

  // Logging & Monitoring
  sentryDsn: process.env.SENTRY_DSN || "",
} as const;

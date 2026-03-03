import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { ensureBucket } from "./config/s3";
import { prisma } from "./config/prisma";
import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";
import assetRoutes from "./routes/assets";

const app = express();

// ── Security ──
app.use(helmet());
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));

// ── Rate limiter ──
app.use("/api/", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Too many requests, please try again later" },
}));

// ── Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects", assetRoutes);

// ── Health check ──
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", version: "0.1.0", timestamp: new Date().toISOString() });
});

// ── Error handler ──
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Server] Unhandled error:", err);
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

// ── Start ──
async function start() {
  try {
    await prisma.$connect();
    console.log("[DB] Connected to PostgreSQL");
  } catch (err) {
    console.error("[DB] Connection failed:", err);
    process.exit(1);
  }

  try {
    await ensureBucket();
    console.log("[S3] Bucket ready");
  } catch (err) {
    console.warn("[S3] Bucket setup warning:", err);
  }

  app.listen(env.port, () => {
    console.log(`[Flash Motion API] Running on http://localhost:${env.port}`);
    console.log(`[Config] LLM mode: ${env.llmMode}, Env: ${env.nodeEnv}`);
  });
}

start();

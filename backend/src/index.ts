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
import adminRoutes from "./routes/admin";

const app = express();

// ── Security ──
app.use(helmet());
app.use(cors({
  origin: env.frontendUrl.split(",").map((o) => o.trim()),
  maxAge: 86400, // Cache preflight for 24h to reduce OPTIONS requests
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: false }));

// ── Rate limiter — general ──
app.use("/api/", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Rate limiter — strict for auth endpoints ──
app.use("/api/auth/login", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use("/api/auth/register", rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Too many registration attempts" },
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Rate limiter — strict for password reset ──
app.use("/api/auth/forgot-password", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many password reset attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use("/api/auth/reset-password", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many reset attempts" },
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects", assetRoutes);
app.use("/api/admin", adminRoutes);

// ── Health check ──
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", version: "0.1.0", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "unhealthy", timestamp: new Date().toISOString() });
  }
});

// ── Error handler ──
app.use((err: Error & { statusCode?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Server] Unhandled error:", err);
  const status = err.statusCode || 500;
  const message = env.nodeEnv === "production" && status === 500
    ? "Internal server error"
    : err.message || "Internal server error";
  res.status(status).json({ error: message });
});

// ── Start ──
async function start() {
  // Validate critical secrets in production
  if (env.nodeEnv === "production") {
    if (env.jwtSecret === "dev-secret-change-me" || env.jwtSecret.length < 20) {
      console.error("[SECURITY] JWT_SECRET is too weak for production. Exiting.");
      process.exit(1);
    }
    if (env.s3SecretKey === "minioadmin") {
      console.error("[SECURITY] S3_SECRET_KEY is using default credentials in production. Exiting.");
      process.exit(1);
    }
  }

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

  const server = app.listen(env.port, () => {
    console.log(`[Flash Motion API] Running on http://localhost:${env.port}`);
    console.log(`[Config] LLM mode: ${env.llmMode}, Env: ${env.nodeEnv}`);
  });

  // ── Graceful shutdown ──
  const shutdown = async (signal: string) => {
    console.log(`[Server] ${signal} received, shutting down gracefully...`);
    server.close(() => {
      console.log("[Server] HTTP server closed");
    });
    await prisma.$disconnect();
    console.log("[DB] Disconnected");
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start();

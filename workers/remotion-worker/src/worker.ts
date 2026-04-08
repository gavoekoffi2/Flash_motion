import { Worker, Job } from "bullmq";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { PrismaClient } from "@prisma/client";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// ── Config ──
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const S3_ENDPOINT = process.env.S3_ENDPOINT || "http://localhost:9000";
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || "minioadmin";
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || "minioadmin";
const S3_BUCKET = process.env.S3_BUCKET || "flash-motion";
const S3_REGION = process.env.S3_REGION || "us-east-1";
const TEMP_DIR = process.env.TEMP_DIR || "/tmp/flash-motion";
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_RENDERS || "1", 10);
const RENDER_TIMEOUT_MS = parseInt(process.env.RENDER_TIMEOUT_MS || "300000", 10);

function getRedisOpts() {
  const url = new URL(REDIS_URL);
  return {
    host: url.hostname,
    port: parseInt(url.port || "6379", 10),
    password: url.password || undefined,
  };
}

const prisma = new PrismaClient();
const s3 = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: { accessKeyId: S3_ACCESS_KEY, secretAccessKey: S3_SECRET_KEY },
  forcePathStyle: true,
});

// ── Email notification (optional — sends if SMTP configured) ──
async function sendRenderCompleteEmail(email: string, projectTitle: string, projectId: string) {
  const smtpHost = process.env.SMTP_HOST;
  if (!smtpHost) return; // Skip if no SMTP configured

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_PORT === "465",
      auth: { user: process.env.SMTP_USER || "", pass: process.env.SMTP_PASS || "" },
    });

    const appUrl = process.env.APP_URL || process.env.FRONTEND_URL || "http://localhost:3000";
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@flashmotion.dev",
      to: email,
      subject: `Votre vidéo "${projectTitle}" est prête ! — Flash Motion`,
      html: `<div style="font-family:system-ui;max-width:600px;margin:0 auto;padding:40px 20px">
        <h1 style="color:#FF6B35">Vidéo prête !</h1>
        <p>Le rendu de votre projet <strong>${projectTitle}</strong> est terminé.</p>
        <a href="${appUrl}/projects/${encodeURIComponent(projectId)}" style="display:inline-block;background:#FF6B35;color:white;padding:12px 30px;border-radius:8px;text-decoration:none;margin-top:20px">Voir et télécharger</a>
      </div>`,
    });
    console.log(`[Worker] Render notification sent to ${email}`);
  } catch (err) {
    console.warn("[Worker] Failed to send render email:", err);
  }
}

// ── Ensure temp directory ──
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

interface RenderJobData {
  jobId: string;
  projectId: string;
  storyboard: {
    project_title: string;
    aspect_ratio: string;
    scenes: any[];
    brand: { primary_color: string; logo_id: string | null };
  };
  assets: { id: string; type: string; s3Key: string }[];
  outputKey: string;
}

// ── Get signed URLs for assets ──
async function resolveAssetUrls(assets: RenderJobData["assets"]): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};
  const failed: string[] = [];
  for (const asset of assets) {
    try {
      const url = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: S3_BUCKET, Key: asset.s3Key }),
        { expiresIn: 86400 }, // 24h — renders can take a while
      );
      urls[asset.id] = url;
    } catch (err) {
      console.warn(`[Worker] Could not resolve URL for asset ${asset.id} (${asset.s3Key}):`, err);
      failed.push(asset.id);
    }
  }
  // Fail early if any assets can't be resolved — prevents broken renders
  if (failed.length > 0) {
    throw new Error(`Failed to resolve ${failed.length} asset(s): ${failed.join(", ")}. Check S3 connectivity.`);
  }
  console.log(`[Worker] Resolved ${Object.keys(urls).length} asset URLs`);
  return urls;
}

// ── Template registry ──
const TEMPLATES = [
  "HeroPromo",
  "Testimonial",
  "EcommerceShowcase",
  "Educational",
  "SaasLaunch",
  "CinematicReels",
  "NeonCyberpunk",
  "RestaurantMenu",
  "FitnessMotivation",
  "RealEstateTour",
  "EventCountdown",
];

// ── Determine composition based on template + aspect ratio ──
function getCompositionId(aspectRatio: string, template?: string): string {
  const base = template && TEMPLATES.includes(template) ? template : "HeroPromo";
  switch (aspectRatio) {
    case "16:9": return `${base}-16x9`;
    case "1:1": return `${base}-1x1`;
    case "9:16":
    default:
      return base;
  }
}

// ── Timeout wrapper ──
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

// ── Process render job ──
async function processRender(job: Job<RenderJobData>) {
  const { jobId, projectId, storyboard, assets, outputKey } = job.data;
  const outputPath = path.join(TEMP_DIR, `${jobId}.mp4`);

  console.log(`[Worker] Starting render for job ${jobId}, project ${projectId}`);
  console.log(`[Worker] Storyboard: ${storyboard.scenes.length} scenes, aspect: ${storyboard.aspect_ratio}`);

  // Update status to RENDERING
  await prisma.renderJob.update({
    where: { id: jobId },
    data: { status: "RENDERING", startedAt: new Date() },
  });

  try {
    // 1. Resolve asset URLs
    const assetUrls = await resolveAssetUrls(assets);

    // 2. Bundle Remotion project
    // Resolve path to the SOURCE .tsx entry point — works in both dev (tsx)
    // and prod (compiled to dist/ → need to walk back to src/).
    const candidates = [
      path.resolve(__dirname, "compositions/index.tsx"),
      path.resolve(__dirname, "../src/compositions/index.tsx"),
      path.resolve(process.cwd(), "src/compositions/index.tsx"),
      path.resolve(process.cwd(), "workers/remotion-worker/src/compositions/index.tsx"),
    ];
    const entryPoint = candidates.find((p) => fs.existsSync(p));
    if (!entryPoint) {
      throw new Error(
        `Could not locate Remotion entry point. Tried: ${candidates.join(", ")}`,
      );
    }
    console.log(`[Worker] Bundling Remotion project from ${entryPoint}...`);
    const bundleLocation = await withTimeout(
      bundle({
        entryPoint,
        webpackOverride: (config) => config,
      }),
      120000,
      "Remotion bundling",
    );

    // 3. Calculate total duration
    const totalDuration = storyboard.scenes.reduce(
      (sum: number, s: any) => sum + (s.duration_s || 3),
      0,
    );
    const fps = 30;
    // Get template from project in DB
    const projectRecord = await prisma.project.findUnique({ where: { id: projectId }, select: { template: true } });
    const template = projectRecord?.template || "HeroPromo";
    const compositionId = getCompositionId(storyboard.aspect_ratio, template);

    // 4. Select composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps: {
        scenes: storyboard.scenes,
        brand: storyboard.brand,
        assetUrls,
      },
    });

    // Override duration
    composition.durationInFrames = totalDuration * fps;

    // 5. Render video with timeout
    console.log(`[Worker] Rendering ${compositionId}: ${totalDuration}s, ${composition.width}x${composition.height}`);
    await withTimeout(
      renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: "h264",
        outputLocation: outputPath,
        inputProps: {
          scenes: storyboard.scenes,
          brand: storyboard.brand,
          assetUrls,
        },
        onProgress: ({ progress }) => {
          const pct = Math.round(progress * 100);
          if (pct % 10 === 0) {
            console.log(`[Worker] Render progress: ${pct}%`);
          }
        },
      }),
      RENDER_TIMEOUT_MS,
      "Video rendering",
    );

    console.log("[Worker] Render complete. Uploading to S3...");

    // 6. Upload to S3
    await prisma.renderJob.update({
      where: { id: jobId },
      data: { status: "UPLOADING" },
    });

    const fileBuffer = fs.readFileSync(outputPath);
    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: outputKey,
        Body: fileBuffer,
        ContentType: "video/mp4",
      }),
    );

    // 7. Mark as done
    await prisma.renderJob.update({
      where: { id: jobId },
      data: { status: "DONE", finishedAt: new Date() },
    });

    const project = await prisma.project.update({
      where: { id: projectId },
      data: { status: "DONE" },
      include: { user: { select: { email: true } } },
    });

    // Send email notification (non-blocking)
    sendRenderCompleteEmail(project.user.email, storyboard.project_title || "Votre projet", projectId).catch(() => {});

    console.log(`[Worker] Job ${jobId} completed successfully.`);
  } catch (err) {
    console.error(`[Worker] Job ${jobId} failed:`, err);

    await prisma.renderJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        error: (err as Error).message?.slice(0, 500),
        finishedAt: new Date(),
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { status: "FAILED" },
    });

    throw err;
  } finally {
    // Cleanup temp file
    try {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    } catch {}
  }
}

// ── Health check HTTP server (for Docker healthcheck) ──
import http from "http";
const HEALTH_PORT = parseInt(process.env.WORKER_HEALTH_PORT || "9000", 10);
let workerReady = false;

const healthServer = http.createServer((_req, res) => {
  if (workerReady) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", concurrency: MAX_CONCURRENT }));
  } else {
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "starting" }));
  }
});
healthServer.listen(HEALTH_PORT, () => {
  console.log(`[Worker] Health check on :${HEALTH_PORT}`);
});

// ── Start worker ──
console.log(`[Worker] Starting render worker (concurrency: ${MAX_CONCURRENT})...`);

const worker = new Worker<RenderJobData>("render", processRender, {
  connection: getRedisOpts(),
  concurrency: MAX_CONCURRENT,
});

worker.on("ready", () => {
  workerReady = true;
  console.log("[Worker] Worker ready and listening for jobs");
});

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("[Worker] Worker error:", err);
});

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`[Worker] Received ${signal}, shutting down...`);
  workerReady = false;
  healthServer.close();
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

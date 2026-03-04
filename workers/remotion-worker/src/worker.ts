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
  for (const asset of assets) {
    try {
      const url = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: S3_BUCKET, Key: asset.s3Key }),
        { expiresIn: 3600 },
      );
      urls[asset.id] = url;
    } catch (err) {
      console.warn(`[Worker] Could not resolve URL for asset ${asset.id} (${asset.s3Key}):`, err);
    }
  }
  console.log(`[Worker] Resolved ${Object.keys(urls).length}/${assets.length} asset URLs`);
  return urls;
}

// ── Template registry ──
const TEMPLATES = ["HeroPromo", "Testimonial", "EcommerceShowcase", "Educational", "SaasLaunch"];

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
    console.log("[Worker] Bundling Remotion project...");
    const bundleLocation = await withTimeout(
      bundle({
        entryPoint: path.resolve(__dirname, "compositions/index.ts"),
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

    await prisma.project.update({
      where: { id: projectId },
      data: { status: "DONE" },
    });

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

// ── Start worker ──
console.log(`[Worker] Starting render worker (concurrency: ${MAX_CONCURRENT})...`);

const worker = new Worker<RenderJobData>("render", processRender, {
  connection: getRedisOpts(),
  concurrency: MAX_CONCURRENT,
});

worker.on("ready", () => {
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
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

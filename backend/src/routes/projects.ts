import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { authMiddleware } from "../middleware/auth";
import { generateStoryboard } from "../services/llm";
import { enqueueRender, RenderJobData } from "../services/renderQueue";
import { generateOutputKey, getSignedDownloadUrl, deleteFromS3 } from "../services/storage";
import { checkAndResetQuota } from "../services/quota";
import { generateProjectTTS } from "../services/tts";

const router = Router();
router.use(authMiddleware);

// ── Validation schemas ──

const VALID_TEMPLATES = ["HeroPromo", "Testimonial", "EcommerceShowcase", "Educational", "SaasLaunch"] as const;

const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  script: z.string().min(10).max(10000),
  aspectRatio: z.enum(["9:16", "16:9", "1:1"]).default("9:16"),
  template: z.enum(VALID_TEMPLATES).default("HeroPromo"),
  brandConfig: z.object({
    primary_color: z.string().optional(),
    logo_id: z.string().optional(),
  }).optional(),
});

const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  script: z.string().min(10).max(10000).optional(),
  aspectRatio: z.enum(["9:16", "16:9", "1:1"]).optional(),
  brandConfig: z.object({
    primary_color: z.string().optional(),
    logo_id: z.string().optional(),
  }).optional(),
});

const storyboardSceneSchema = z.object({
  id: z.number(),
  duration_s: z.number().min(1).max(30),
  type: z.enum(["hero", "carousel", "feature_list", "demo", "outro"]),
  text: z.string().max(250),
  assets: z.array(z.object({
    type: z.string(),
    id: z.string(),
    placement: z.string(),
    scale: z.string(),
  })).default([]),
  animation: z.string(),
  audio_clip: z.string().nullable().default(null),
  tts_instruction: z.string().nullable().default(null),
});

const updateStoryboardSchema = z.object({
  storyboard: z.object({
    project_title: z.string(),
    aspect_ratio: z.enum(["9:16", "16:9", "1:1"]),
    scenes: z.array(storyboardSceneSchema).min(1).max(30),
    brand: z.object({
      primary_color: z.string(),
      logo_id: z.string().nullable(),
    }),
    caption_short: z.string().max(280).optional(),
  }),
});

// ── GET /api/projects — list user's projects (paginated) ──
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: { userId: req.user!.userId },
        orderBy: { updatedAt: "desc" },
        include: { _count: { select: { assets: true, renderJobs: true } } },
        skip,
        take: limit,
      }),
      prisma.project.count({ where: { userId: req.user!.userId } }),
    ]);

    return res.json({ projects, total, page, limit });
  } catch (err) {
    console.error("[Projects] List error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/projects — create new project ──
router.post("/", async (req: Request, res: Response) => {
  try {
    const data = createProjectSchema.parse(req.body);
    const project = await prisma.project.create({
      data: {
        userId: req.user!.userId,
        title: data.title,
        script: data.script,
        aspectRatio: data.aspectRatio,
        template: data.template,
        brandConfig: data.brandConfig || undefined,
      },
    });
    return res.status(201).json({ project });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: err.errors });
    }
    console.error("[Projects] Create error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/projects/:id — get project details ──
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
      include: {
        assets: { orderBy: { createdAt: "asc" } },
        renderJobs: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    return res.json({ project });
  } catch (err) {
    console.error("[Projects] Get error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── PUT /api/projects/:id — update project (validated) ──
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const data = updateProjectSchema.parse(req.body);

    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        title: data.title ?? project.title,
        script: data.script ?? project.script,
        aspectRatio: data.aspectRatio ?? project.aspectRatio,
        brandConfig: data.brandConfig !== undefined ? data.brandConfig : project.brandConfig,
      },
    });
    return res.json({ project: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: err.errors });
    }
    console.error("[Projects] Update error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/projects/:id/duplicate — duplicate a project ──
router.post("/:id/duplicate", async (req: Request, res: Response) => {
  try {
    const original = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!original) return res.status(404).json({ error: "Project not found" });

    const project = await prisma.project.create({
      data: {
        userId: req.user!.userId,
        title: `${original.title} (copie)`,
        script: original.script,
        aspectRatio: original.aspectRatio,
        template: original.template,
        storyboard: original.storyboard || undefined,
        brandConfig: original.brandConfig || undefined,
        status: original.storyboard ? "STORYBOARD_READY" : "DRAFT",
      },
    });
    return res.status(201).json({ project });
  } catch (err) {
    console.error("[Projects] Duplicate error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── DELETE /api/projects/:id — delete project + cleanup S3 assets ──
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
      include: { assets: true, renderJobs: true },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Cleanup S3 files (assets + rendered outputs)
    const s3Deletions: Promise<void>[] = [];
    for (const asset of project.assets) {
      s3Deletions.push(
        deleteFromS3(asset.s3Key).catch((err) =>
          console.warn(`[Projects] Failed to delete S3 asset ${asset.s3Key}:`, err),
        ) as Promise<void>,
      );
    }
    for (const job of project.renderJobs) {
      if (job.outputKey) {
        s3Deletions.push(
          deleteFromS3(job.outputKey).catch((err) =>
            console.warn(`[Projects] Failed to delete S3 output ${job.outputKey}:`, err),
          ) as Promise<void>,
        );
      }
    }
    await Promise.allSettled(s3Deletions);

    // Update storage quota
    const totalSizeMb = project.assets.reduce((sum, a) => sum + a.sizeMb, 0);
    if (totalSizeMb > 0) {
      await prisma.quota.updateMany({
        where: { userId: req.user!.userId },
        data: { storageUsedMb: { decrement: totalSizeMb } },
      });
    }

    await prisma.project.delete({ where: { id: req.params.id } });
    return res.json({ message: "Project deleted" });
  } catch (err) {
    console.error("[Projects] Delete error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/projects/:id/generate-storyboard — generate storyboard via LLM ──
router.post("/:id/generate-storyboard", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
      include: { assets: true },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Check and auto-reset quota
    const quota = await checkAndResetQuota(req.user!.userId);
    if (quota && quota.llmCallsToday >= quota.llmCallsLimit) {
      return res.status(429).json({ error: "Daily LLM quota exceeded" });
    }

    const assetList = project.assets.map((a) => ({
      id: a.id,
      type: a.type,
      filename: a.filename,
    }));

    const storyboard = await generateStoryboard(
      project.script,
      assetList,
      project.aspectRatio,
    );

    await prisma.$transaction([
      prisma.project.update({
        where: { id: project.id },
        data: {
          storyboard: storyboard as object,
          status: "STORYBOARD_READY",
        },
      }),
      ...(quota ? [prisma.quota.update({
        where: { userId: req.user!.userId },
        data: { llmCallsToday: { increment: 1 } },
      })] : []),
    ]);

    return res.json({ storyboard });
  } catch (err) {
    console.error("[Projects] Generate storyboard error:", err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

// ── PUT /api/projects/:id/storyboard — manually update storyboard (validated) ──
router.put("/:id/storyboard", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const data = updateStoryboardSchema.parse(req.body);
    await prisma.project.update({
      where: { id: project.id },
      data: {
        storyboard: data.storyboard as object,
        status: "STORYBOARD_READY",
      },
    });

    return res.json({ message: "Storyboard updated" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Storyboard validation error", details: err.errors });
    }
    console.error("[Projects] Update storyboard error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/projects/:id/generate-tts — generate TTS for storyboard scenes ──
router.post("/:id/generate-tts", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (!project.storyboard) {
      return res.status(400).json({ error: "Generate storyboard first" });
    }

    const storyboard = project.storyboard as any;
    const results = await generateProjectTTS(storyboard.scenes, project.id);

    // Update storyboard with TTS audio_clip references
    if (Object.keys(results).length > 0) {
      const updatedScenes = storyboard.scenes.map((scene: any) => {
        const ttsResult = results[scene.id];
        if (ttsResult) {
          return { ...scene, audio_clip: ttsResult.s3Key };
        }
        return scene;
      });

      await prisma.project.update({
        where: { id: project.id },
        data: { storyboard: { ...storyboard, scenes: updatedScenes } },
      });
    }

    return res.json({
      message: `TTS generated for ${Object.keys(results).length} scenes`,
      results,
    });
  } catch (err) {
    console.error("[Projects] TTS generation error:", err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

// ── POST /api/projects/:id/render — enqueue render job ──
router.post("/:id/render", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
      include: { assets: true },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (!project.storyboard) {
      return res.status(400).json({ error: "Generate storyboard first" });
    }

    // Check and auto-reset quota
    const quota = await checkAndResetQuota(req.user!.userId);
    if (quota && quota.rendersToday >= quota.rendersLimit) {
      return res.status(429).json({ error: "Daily render quota exceeded" });
    }

    // Use transaction for atomicity
    const renderJob = await prisma.$transaction(async (tx) => {
      const job = await tx.renderJob.create({
        data: { projectId: project.id },
      });

      const outputKey = generateOutputKey(project.id, job.id);
      const updatedJob = await tx.renderJob.update({
        where: { id: job.id },
        data: { outputKey },
      });

      await tx.project.update({
        where: { id: project.id },
        data: { status: "RENDERING" },
      });

      if (quota) {
        await tx.quota.update({
          where: { userId: req.user!.userId },
          data: { rendersToday: { increment: 1 } },
        });
      }

      return updatedJob;
    });

    const jobData: RenderJobData = {
      jobId: renderJob.id,
      projectId: project.id,
      storyboard: project.storyboard as object,
      assets: project.assets.map((a) => ({
        id: a.id,
        type: a.type,
        s3Key: a.s3Key,
      })),
      outputKey: renderJob.outputKey!,
    };

    await enqueueRender(jobData);

    return res.status(202).json({ renderJob: { id: renderJob.id, status: "QUEUED" } });
  } catch (err) {
    console.error("[Projects] Render error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/projects/:id/render/:jobId — get render status ──
router.get("/:id/render/:jobId", async (req: Request, res: Response) => {
  try {
    const job = await prisma.renderJob.findFirst({
      where: {
        id: req.params.jobId,
        projectId: req.params.id,
        project: { userId: req.user!.userId },
      },
    });
    if (!job) return res.status(404).json({ error: "Render job not found" });

    let downloadUrl: string | null = null;
    if (job.status === "DONE" && job.outputKey) {
      downloadUrl = await getSignedDownloadUrl(job.outputKey);
    }

    return res.json({ renderJob: { ...job, downloadUrl } });
  } catch (err) {
    console.error("[Projects] Render status error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

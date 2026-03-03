import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { authMiddleware } from "../middleware/auth";
import { generateStoryboard } from "../services/llm";
import { enqueueRender, RenderJobData } from "../services/renderQueue";
import { generateOutputKey, getSignedDownloadUrl } from "../services/storage";
import { v4 as uuid } from "crypto";

const router = Router();
router.use(authMiddleware);

const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  script: z.string().min(10).max(10000),
  aspectRatio: z.enum(["9:16", "16:9", "1:1"]).default("9:16"),
  brandConfig: z.object({
    primary_color: z.string().optional(),
    logo_id: z.string().optional(),
  }).optional(),
});

const updateStoryboardSchema = z.object({
  storyboard: z.any(),
});

// GET /api/projects — list user's projects
router.get("/", async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user!.userId },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { assets: true, renderJobs: true } } },
    });
    return res.json({ projects });
  } catch (err) {
    console.error("[Projects] List error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/projects — create new project
router.post("/", async (req: Request, res: Response) => {
  try {
    const data = createProjectSchema.parse(req.body);
    const project = await prisma.project.create({
      data: {
        userId: req.user!.userId,
        title: data.title,
        script: data.script,
        aspectRatio: data.aspectRatio,
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

// GET /api/projects/:id — get project details
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

// PUT /api/projects/:id — update project
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        title: req.body.title || project.title,
        script: req.body.script || project.script,
        aspectRatio: req.body.aspectRatio || project.aspectRatio,
        brandConfig: req.body.brandConfig !== undefined ? req.body.brandConfig : project.brandConfig,
      },
    });
    return res.json({ project: updated });
  } catch (err) {
    console.error("[Projects] Update error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/projects/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    await prisma.project.delete({ where: { id: req.params.id } });
    return res.json({ message: "Project deleted" });
  } catch (err) {
    console.error("[Projects] Delete error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/projects/:id/generate-storyboard — generate storyboard via LLM
router.post("/:id/generate-storyboard", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
      include: { assets: true },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Check quota
    const quota = await prisma.quota.findUnique({ where: { userId: req.user!.userId } });
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

    await prisma.project.update({
      where: { id: project.id },
      data: {
        storyboard: storyboard as any,
        status: "STORYBOARD_READY",
      },
    });

    // Increment quota
    if (quota) {
      await prisma.quota.update({
        where: { userId: req.user!.userId },
        data: { llmCallsToday: { increment: 1 } },
      });
    }

    return res.json({ storyboard });
  } catch (err) {
    console.error("[Projects] Generate storyboard error:", err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

// PUT /api/projects/:id/storyboard — manually update storyboard
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
        storyboard: data.storyboard,
        status: "STORYBOARD_READY",
      },
    });

    return res.json({ message: "Storyboard updated" });
  } catch (err) {
    console.error("[Projects] Update storyboard error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/projects/:id/render — enqueue render job
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

    // Check render quota
    const quota = await prisma.quota.findUnique({ where: { userId: req.user!.userId } });
    if (quota && quota.rendersToday >= quota.rendersLimit) {
      return res.status(429).json({ error: "Daily render quota exceeded" });
    }

    const renderJob = await prisma.renderJob.create({
      data: { projectId: project.id },
    });

    const outputKey = generateOutputKey(project.id, renderJob.id);

    await prisma.renderJob.update({
      where: { id: renderJob.id },
      data: { outputKey },
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
      outputKey,
    };

    await enqueueRender(jobData);

    await prisma.project.update({
      where: { id: project.id },
      data: { status: "RENDERING" },
    });

    // Increment quota
    if (quota) {
      await prisma.quota.update({
        where: { userId: req.user!.userId },
        data: { rendersToday: { increment: 1 } },
      });
    }

    return res.status(202).json({ renderJob: { id: renderJob.id, status: "QUEUED" } });
  } catch (err) {
    console.error("[Projects] Render error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/projects/:id/render/:jobId — get render status
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

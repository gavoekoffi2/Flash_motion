import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { authMiddleware, adminOnly } from "../middleware/auth";

const VALID_RENDER_STATUSES = ["QUEUED", "RENDERING", "UPLOADING", "DONE", "FAILED"] as const;

const router = Router();
router.use(authMiddleware);
router.use(adminOnly);

// GET /api/admin/stats — platform statistics
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [userCount, projectCount, renderCount, activeRenders] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.renderJob.count(),
      prisma.renderJob.count({ where: { status: { in: ["QUEUED", "RENDERING"] } } }),
    ]);

    return res.json({
      users: userCount,
      projects: projectCount,
      totalRenders: renderCount,
      activeRenders,
    });
  } catch (err) {
    console.error("[Admin] Stats error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/users — list all users
router.get("/users", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true, email: true, name: true, role: true, plan: true,
          createdAt: true, _count: { select: { projects: true } },
          quota: { select: { llmCallsToday: true, rendersToday: true, storageUsedMb: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    return res.json({ users, total, page, limit });
  } catch (err) {
    console.error("[Admin] List users error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/users/:id/quota — update user quota
const quotaSchema = z.object({
  llmCallsLimit: z.number().int().min(0).optional(),
  rendersLimit: z.number().int().min(0).optional(),
  storageLimitMb: z.number().min(0).optional(),
});

router.put("/users/:id/quota", async (req: Request, res: Response) => {
  try {
    const { llmCallsLimit, rendersLimit, storageLimitMb } = quotaSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const quota = await prisma.quota.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        llmCallsLimit: llmCallsLimit ?? 20,
        rendersLimit: rendersLimit ?? 5,
        storageLimitMb: storageLimitMb ?? 500,
      },
      update: {
        ...(llmCallsLimit !== undefined && { llmCallsLimit }),
        ...(rendersLimit !== undefined && { rendersLimit }),
        ...(storageLimitMb !== undefined && { storageLimitMb }),
      },
    });

    return res.json({ quota });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: err.errors });
    }
    console.error("[Admin] Update quota error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/users/:id/plan — update user plan
const planSchema = z.object({ plan: z.enum(["FREE", "PRO", "ENTERPRISE"]) });

router.put("/users/:id/plan", async (req: Request, res: Response) => {
  try {
    const { plan } = planSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "User not found" });

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { plan },
      select: { id: true, email: true, plan: true },
    });

    return res.json({ user });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation error", details: err.errors });
    console.error("[Admin] Update plan error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/render-jobs — list all render jobs
router.get("/render-jobs", async (req: Request, res: Response) => {
  try {
    const rawStatus = req.query.status as string | undefined;
    const status = rawStatus && VALID_RENDER_STATUSES.includes(rawStatus as any) ? rawStatus : undefined;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    const where = status ? { status: status as any } : {};
    const [jobs, total] = await Promise.all([
      prisma.renderJob.findMany({
        where,
        include: {
          project: { select: { title: true, userId: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.renderJob.count({ where }),
    ]);

    return res.json({ jobs, total, page, limit });
  } catch (err) {
    console.error("[Admin] List render jobs error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

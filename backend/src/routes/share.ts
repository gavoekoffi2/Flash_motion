import { Router, Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { authMiddleware } from "../middleware/auth";
import { getSignedDownloadUrl } from "../services/storage";

const router = Router();

// POST /api/projects/:id/share — generate or return existing share token (auth required)
router.post("/:id/share", authMiddleware, async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
      include: { renderJobs: { where: { status: "DONE" }, orderBy: { createdAt: "desc" }, take: 1 } },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (project.renderJobs.length === 0) {
      return res.status(400).json({ error: "Project has no completed render to share" });
    }

    // Reuse existing token or generate new one
    let token = project.shareToken;
    if (!token) {
      token = crypto.randomBytes(20).toString("hex");
      await prisma.project.update({ where: { id: project.id }, data: { shareToken: token } });
    }

    return res.json({ shareToken: token, shareUrl: `/share/${token}` });
  } catch (err) {
    console.error("[Share] Generate token error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/projects/:id/share — revoke share token
router.delete("/:id/share", authMiddleware, async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    await prisma.project.update({ where: { id: project.id }, data: { shareToken: null } });
    return res.json({ message: "Share link revoked" });
  } catch (err) {
    console.error("[Share] Revoke error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/share/:token — public endpoint, no auth required
router.get("/public/:token", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: { shareToken: req.params.token },
      include: {
        renderJobs: {
          where: { status: "DONE" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
    if (!project || !project.shareToken) {
      return res.status(404).json({ error: "Share link not found or expired" });
    }

    const renderJob = project.renderJobs[0];
    if (!renderJob || !renderJob.outputKey) {
      return res.status(404).json({ error: "No video available for this share link" });
    }

    const downloadUrl = await getSignedDownloadUrl(renderJob.outputKey, 3600);

    return res.json({
      project: {
        title: project.title,
        aspectRatio: project.aspectRatio,
        template: project.template,
      },
      video: {
        downloadUrl,
        finishedAt: renderJob.finishedAt,
      },
    });
  } catch (err) {
    console.error("[Share] Public get error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

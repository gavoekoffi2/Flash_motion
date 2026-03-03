import { Router, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { authMiddleware } from "../middleware/auth";
import { uploadMiddleware, getAssetType } from "../middleware/upload";
import { uploadToS3, generateS3Key, getSignedDownloadUrl, deleteFromS3 } from "../services/storage";
import { env } from "../config/env";
import sharp from "sharp";

const router = Router();
router.use(authMiddleware);

// POST /api/projects/:projectId/assets — upload assets
router.post(
  "/:projectId/assets",
  uploadMiddleware.array("files", 10),
  async (req: Request, res: Response) => {
    try {
      const project = await prisma.project.findFirst({
        where: { id: req.params.projectId, userId: req.user!.userId },
        include: { _count: { select: { assets: true } } },
      });
      if (!project) return res.status(404).json({ error: "Project not found" });

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files provided" });
      }

      // Check asset count limit
      if (project._count.assets + files.length > env.maxAssetsPerProject) {
        return res.status(400).json({
          error: `Max ${env.maxAssetsPerProject} assets per project. Current: ${project._count.assets}`,
        });
      }

      const uploaded = [];

      for (const file of files) {
        let buffer = file.buffer;
        const assetType = getAssetType(file.mimetype);

        // Auto-resize images if too large (keep under 1920px width)
        if (assetType === "IMAGE" && (file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/webp")) {
          const metadata = await sharp(buffer).metadata();
          if (metadata.width && metadata.width > 1920) {
            buffer = await sharp(buffer)
              .resize({ width: 1920, withoutEnlargement: true })
              .toBuffer();
          }
        }

        const s3Key = generateS3Key(project.id, file.originalname);
        await uploadToS3(s3Key, buffer, file.mimetype);

        const asset = await prisma.asset.create({
          data: {
            projectId: project.id,
            type: assetType,
            filename: file.originalname,
            mimeType: file.mimetype,
            sizeMb: parseFloat((buffer.length / (1024 * 1024)).toFixed(3)),
            s3Key,
            metadata: {
              originalSize: file.size,
              processedSize: buffer.length,
            },
          },
        });

        uploaded.push(asset);
      }

      return res.status(201).json({ assets: uploaded });
    } catch (err) {
      console.error("[Assets] Upload error:", err);
      return res.status(500).json({ error: (err as Error).message });
    }
  },
);

// GET /api/projects/:projectId/assets — list assets
router.get("/:projectId/assets", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.projectId, userId: req.user!.userId },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const assets = await prisma.asset.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "asc" },
    });

    // Generate signed URLs for preview
    const assetsWithUrls = await Promise.all(
      assets.map(async (a) => ({
        ...a,
        previewUrl: await getSignedDownloadUrl(a.s3Key, 3600),
      })),
    );

    return res.json({ assets: assetsWithUrls });
  } catch (err) {
    console.error("[Assets] List error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/projects/:projectId/assets/:assetId
router.delete("/:projectId/assets/:assetId", async (req: Request, res: Response) => {
  try {
    const asset = await prisma.asset.findFirst({
      where: {
        id: req.params.assetId,
        projectId: req.params.projectId,
        project: { userId: req.user!.userId },
      },
    });
    if (!asset) return res.status(404).json({ error: "Asset not found" });

    await deleteFromS3(asset.s3Key);
    await prisma.asset.delete({ where: { id: asset.id } });

    return res.json({ message: "Asset deleted" });
  } catch (err) {
    console.error("[Assets] Delete error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

import { Router, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { authMiddleware } from "../middleware/auth";
import { uploadMiddleware, getAssetType, verifyMagicBytes } from "../middleware/upload";
import { uploadToS3, generateS3Key, getSignedDownloadUrl, deleteFromS3 } from "../services/storage";
import { s3Available } from "../config/s3";
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
      if (!s3Available) {
        return res.status(503).json({ error: "Storage service unavailable. Please ensure S3/MinIO is running." });
      }

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

      // Check storage quota
      const quota = await prisma.quota.findUnique({ where: { userId: req.user!.userId } });
      if (quota) {
        const totalNewSizeMb = files.reduce((sum, f) => sum + f.size / (1024 * 1024), 0);
        if (quota.storageUsedMb + totalNewSizeMb > quota.storageLimitMb) {
          return res.status(429).json({
            error: `Storage quota exceeded. Used: ${quota.storageUsedMb.toFixed(1)}MB / ${quota.storageLimitMb}MB`,
          });
        }
      }

      const uploaded = [];
      let totalUploadedMb = 0;

      for (const file of files) {
        // Verify magic bytes match claimed MIME type (prevent spoofed Content-Type)
        if (!verifyMagicBytes(file.buffer, file.mimetype)) {
          return res.status(400).json({
            error: `File "${file.originalname}" content does not match its declared type (${file.mimetype})`,
          });
        }

        let buffer = file.buffer;
        const assetType = getAssetType(file.mimetype);

        // Auto-resize images if too large (keep under 1920px width)
        if (assetType === "IMAGE" && (file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/webp")) {
          try {
            const metadata = await sharp(buffer).metadata();
            if (metadata.width && metadata.width > 1920) {
              buffer = await sharp(buffer)
                .resize({ width: 1920, withoutEnlargement: true })
                .toBuffer();
            }
          } catch (err) {
            console.warn(`[Assets] Sharp resize failed for ${file.originalname}:`, err);
          }
        }

        const sizeMb = parseFloat((buffer.length / (1024 * 1024)).toFixed(3));
        const s3Key = generateS3Key(project.id, file.originalname);
        await uploadToS3(s3Key, buffer, file.mimetype);

        const asset = await prisma.asset.create({
          data: {
            projectId: project.id,
            type: assetType,
            filename: file.originalname,
            mimeType: file.mimetype,
            sizeMb,
            s3Key,
            metadata: {
              originalSize: file.size,
              processedSize: buffer.length,
            },
          },
        });

        totalUploadedMb += sizeMb;
        uploaded.push(asset);
      }

      // Update storage quota
      if (quota && totalUploadedMb > 0) {
        await prisma.quota.update({
          where: { userId: req.user!.userId },
          data: { storageUsedMb: { increment: totalUploadedMb } },
        });
      }

      return res.status(201).json({ assets: uploaded });
    } catch (err) {
      console.error("[Assets] Upload error:", err);
      return res.status(500).json({ error: "Asset upload failed" });
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

    // Generate signed URLs for preview — per-asset error handling
    const assetsWithUrls = await Promise.all(
      assets.map(async (a) => {
        try {
          const previewUrl = await getSignedDownloadUrl(a.s3Key, 3600);
          return { ...a, previewUrl };
        } catch {
          return { ...a, previewUrl: null };
        }
      }),
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

    // Update storage quota (floor at 0)
    if (asset.sizeMb > 0) {
      await prisma.$executeRaw`
        UPDATE "Quota" SET "storageUsedMb" = GREATEST(0, "storageUsedMb" - ${asset.sizeMb})
        WHERE "userId" = ${req.user!.userId}
      `;
    }

    return res.json({ message: "Asset deleted" });
  } catch (err) {
    console.error("[Assets] Delete error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

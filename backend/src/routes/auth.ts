import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { authMiddleware } from "../middleware/auth";
import { sendWelcomeEmail, sendPasswordResetEmail, generateResetToken } from "../services/email";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    env.jwtSecret as jwt.Secret,
    { expiresIn: env.jwtExpiresIn } as jwt.SignOptions,
  );
}

const userSelect = { id: true, email: true, name: true, role: true, plan: true, createdAt: true };

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        name: data.name,
        quota: { create: {} },
      },
    });

    const token = signToken(user);

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name || undefined).catch(() => {});

    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, plan: user.plan },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: err.errors });
    }
    console.error("[Auth] Register error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, plan: user.plan },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: err.errors });
    }
    console.error("[Auth] Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/auth/me
router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { ...userSelect, quota: { select: { llmCallsToday: true, llmCallsLimit: true, rendersToday: true, rendersLimit: true, storageUsedMb: true, storageLimitMb: true } } },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ user });
  } catch (err) {
    console.error("[Auth] Me error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/auth/profile — update name, email
router.put("/profile", authMiddleware, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(1).max(100).optional(),
      email: z.string().email().optional(),
    });
    const data = schema.parse(req.body);

    if (data.email) {
      const existing = await prisma.user.findFirst({ where: { email: data.email, NOT: { id: req.user!.userId } } });
      if (existing) return res.status(409).json({ error: "Email already in use" });
    }

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { ...(data.name && { name: data.name }), ...(data.email && { email: data.email }) },
      select: userSelect,
    });
    return res.json({ user });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation error", details: err.errors });
    console.error("[Auth] Profile error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/auth/password — change password
router.put("/password", authMiddleware, async (req: Request, res: Response) => {
  try {
    const schema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) });
    const data = schema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(data.currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect" });

    const hashed = await bcrypt.hash(data.newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    return res.json({ message: "Password updated" });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation error", details: err.errors });
    console.error("[Auth] Password change error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) return res.json({ message: "If that email exists, a reset link has been sent." });

    const resetToken = generateResetToken();
    const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    });

    await sendPasswordResetEmail(email, resetToken);

    return res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("[Auth] Forgot password error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const schema = z.object({ token: z.string().min(1), newPassword: z.string().min(8) });
    const data = schema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: { resetToken: data.token, resetTokenExp: { gte: new Date() } },
    });
    if (!user) return res.status(400).json({ error: "Invalid or expired reset token" });

    const hashed = await bcrypt.hash(data.newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExp: null },
    });

    return res.json({ message: "Password reset successfully" });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation error", details: err.errors });
    console.error("[Auth] Reset password error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

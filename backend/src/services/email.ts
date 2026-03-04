import { env } from "../config/env";
import crypto from "crypto";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email via SMTP (nodemailer-compatible).
 * Falls back to console.log if no SMTP configured.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!env.smtpHost) {
    console.log(`[Email] (no SMTP) Would send to ${options.to}: ${options.subject}`);
    return true;
  }

  try {
    // Dynamic import to avoid requiring nodemailer when not configured
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: { user: env.smtpUser, pass: env.smtpPass },
    });

    await transporter.sendMail({
      from: env.smtpFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`[Email] Sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (err) {
    console.error(`[Email] Failed to send to ${options.to}:`, err);
    return false;
  }
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ── Email templates ──

export async function sendWelcomeEmail(email: string, name?: string) {
  return sendEmail({
    to: email,
    subject: "Bienvenue sur Flash Motion !",
    html: `
      <div style="font-family:system-ui;max-width:600px;margin:0 auto;padding:40px 20px">
        <h1 style="color:#FF6B35;margin-bottom:20px">Bienvenue ${name || ""} !</h1>
        <p>Votre compte Flash Motion est prêt. Vous pouvez maintenant :</p>
        <ul>
          <li>Créer votre premier projet vidéo</li>
          <li>Uploader vos images et logos</li>
          <li>Générer des storyboards avec l'IA</li>
          <li>Produire des vidéos motion design pro</li>
        </ul>
        <a href="${env.appUrl}/dashboard" style="display:inline-block;background:#FF6B35;color:white;padding:12px 30px;border-radius:8px;text-decoration:none;margin-top:20px">
          Commencer
        </a>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${env.appUrl}/reset-password?token=${token}`;
  return sendEmail({
    to: email,
    subject: "Réinitialisation de votre mot de passe — Flash Motion",
    html: `
      <div style="font-family:system-ui;max-width:600px;margin:0 auto;padding:40px 20px">
        <h1 style="color:#FF6B35;margin-bottom:20px">Réinitialiser votre mot de passe</h1>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous :</p>
        <a href="${resetUrl}" style="display:inline-block;background:#FF6B35;color:white;padding:12px 30px;border-radius:8px;text-decoration:none;margin-top:20px">
          Réinitialiser le mot de passe
        </a>
        <p style="color:#999;font-size:12px;margin-top:30px">Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
      </div>
    `,
  });
}

export async function sendRenderCompleteEmail(email: string, projectTitle: string, projectId: string) {
  return sendEmail({
    to: email,
    subject: `Votre vidéo "${projectTitle}" est prête ! — Flash Motion`,
    html: `
      <div style="font-family:system-ui;max-width:600px;margin:0 auto;padding:40px 20px">
        <h1 style="color:#FF6B35;margin-bottom:20px">Vidéo prête !</h1>
        <p>Le rendu de votre projet <strong>${projectTitle}</strong> est terminé.</p>
        <a href="${env.appUrl}/projects/${projectId}" style="display:inline-block;background:#FF6B35;color:white;padding:12px 30px;border-radius:8px;text-decoration:none;margin-top:20px">
          Voir et télécharger
        </a>
      </div>
    `,
  });
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    setSubmitting(true);
    try {
      await register(name, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription.");
    } finally {
      setSubmitting(false);
    }
  }

  const perks = ["10 templates motion design pro", "IA Gemma 4 pour storyboards", "Voix off automatique", "Export MP4 haute qualité"];

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #f43f5e, transparent)" }} />
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }} />

      <div className="w-full max-w-lg relative z-10 animate-scale-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-base transition-transform group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", boxShadow: "0 0 25px rgba(139,92,246,0.5)" }}>
              FM
            </div>
            <span className="font-black text-xl">Flash<span className="gradient-text">Motion</span></span>
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-2 text-white">Créez votre compte 🚀</h1>
          <p className="text-dark-300 text-sm">Commencez à générer des vidéos pro gratuitement</p>
        </div>

        {/* Avantages */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {perks.map((p, i) => (
            <div key={i} className="flex items-center gap-2 glass rounded-xl px-3 py-2">
              <span className="text-green-400 text-xs">✓</span>
              <span className="text-xs text-dark-200">{p}</span>
            </div>
          ))}
        </div>

        <div className="glass-strong rounded-3xl p-8" style={{ boxShadow: "0 0 60px rgba(139,92,246,0.1)" }}>
          {error && (
            <div className="badge badge-error w-full justify-center mb-6 py-3 rounded-xl text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">Nom complet</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">👤</span>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Votre nom" required className="input-premium pl-11" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">Adresse email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">✉</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="vous@exemple.com" required className="input-premium pl-11" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">Mot de passe</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">🔒</span>
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Min. 8 caractères" required
                  className="input-premium pl-11 pr-12" />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors text-sm">
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        background: password.length >= (i + 1) * 2
                          ? i < 2 ? "#f43f5e" : i === 2 ? "#f59e0b" : "#4ade80"
                          : "rgba(255,255,255,0.1)"
                      }} />
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={submitting}
              className="btn-primary w-full py-3.5 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Création du compte...
                </span>
              ) : "🚀 Créer mon compte gratuitement"}
            </button>
          </form>

          <p className="text-center text-sm text-dark-400 mt-6">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Se connecter →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

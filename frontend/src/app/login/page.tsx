"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Email ou mot de passe incorrect.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }} />

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-base transition-transform group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)", boxShadow: "0 0 25px rgba(139,92,246,0.5)" }}>
              FM
            </div>
            <span className="font-black text-xl">Flash<span className="gradient-text">Motion</span></span>
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-2 text-white">Bon retour 👋</h1>
          <p className="text-dark-300 text-sm">Connectez-vous pour créer vos vidéos</p>
        </div>

        <div className="glass-strong rounded-3xl p-8" style={{ boxShadow: "0 0 60px rgba(139,92,246,0.1)" }}>
          {error && (
            <div className="badge badge-error w-full justify-center mb-6 py-3 rounded-xl text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">Adresse email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 text-base">✉</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="vous@exemple.com" required className="input-premium pl-11" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-dark-200">Mot de passe</label>
                <Link href="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 text-base">🔒</span>
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  className="input-premium pl-11 pr-12" />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors text-sm">
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="btn-primary w-full py-3.5 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion...
                </span>
              ) : "Se connecter →"}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-dark-700" />
            <span className="text-xs text-dark-500">ou</span>
            <div className="flex-1 h-px bg-dark-700" />
          </div>

          <p className="text-center text-sm text-dark-400">
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Créer un compte gratuitement →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

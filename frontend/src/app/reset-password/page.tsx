"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (!token) {
      setError("Token de réinitialisation manquant");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-500 mb-2">Flash Motion</h1>
          <p className="text-gray-400">Nouveau mot de passe</p>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          {success ? (
            <div className="text-center py-4">
              <div className="text-green-400 text-4xl mb-4">&check;</div>
              <p className="text-gray-300 mb-2">Mot de passe réinitialisé avec succès !</p>
              <p className="text-xs text-gray-500">Redirection vers la connexion...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-2 rounded-lg text-sm">{error}</div>
              )}
              {!token && (
                <div className="bg-yellow-900/30 border border-yellow-800 text-yellow-300 px-4 py-2 rounded-lg text-sm">
                  Token de réinitialisation manquant. Utilisez le lien reçu par email.
                </div>
              )}
              <div>
                <label htmlFor="reset-new-password" className="block text-sm text-gray-400 mb-1">Nouveau mot de passe</label>
                <input
                  id="reset-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label htmlFor="reset-confirm-password" className="block text-sm text-gray-400 mb-1">Confirmer le mot de passe</label>
                <input
                  id="reset-confirm-password"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
              </button>
              <div className="text-center">
                <Link href="/login" className="text-sm text-gray-400 hover:text-white">
                  Retour à la connexion
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

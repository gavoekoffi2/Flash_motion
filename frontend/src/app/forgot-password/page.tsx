"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
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
          <Link href="/" className="text-2xl font-bold text-brand-500 hover:text-brand-400 transition-colors mb-2 inline-block">Flash Motion</Link>
          <p className="text-gray-400">Réinitialiser votre mot de passe</p>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-green-400 text-4xl mb-4">&check;</div>
              <p className="text-gray-300 mb-2">
                Si un compte existe avec cette adresse email, un lien de réinitialisation a été envoyé.
              </p>
              <p className="text-xs text-gray-500 mb-4">Vérifiez votre boîte mail et vos spams.</p>
              <Link href="/login" className="text-brand-400 hover:text-brand-300 text-sm">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-2 rounded-lg text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Adresse email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="votre@email.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                {loading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
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

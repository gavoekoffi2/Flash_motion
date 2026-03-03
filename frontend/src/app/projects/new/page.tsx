"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

export default function NewProjectPage() {
  const { user, loading, checkAuth } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { checkAuth(); }, [checkAuth]);
  useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading, router]);

  if (loading || !user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { project } = await api.createProject({ title, script, aspectRatio });
      router.push(`/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-dark-700 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-white">
            &larr; Retour
          </button>
          <h1 className="text-lg font-semibold">Nouveau Projet</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-2 rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Titre du projet</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Ex: Promo Produit X"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Script / Texte</label>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              required
              rows={8}
              minLength={10}
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
              placeholder="Collez votre script marketing ici. Chaque paragraphe peut devenir une scène..."
            />
            <p className="text-xs text-gray-500 mt-1">{script.length} caractères — min. 10</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Format vidéo</label>
            <div className="flex gap-3">
              {["9:16", "16:9", "1:1"].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    aspectRatio === ratio
                      ? "border-brand-500 bg-brand-500/10 text-brand-400"
                      : "border-dark-700 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  {ratio === "9:16" && "Portrait (9:16)"}
                  {ratio === "16:9" && "Paysage (16:9)"}
                  {ratio === "1:1" && "Carré (1:1)"}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || script.length < 10}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {submitting ? "Création..." : "Créer le projet"}
          </button>
        </form>
      </main>
    </div>
  );
}

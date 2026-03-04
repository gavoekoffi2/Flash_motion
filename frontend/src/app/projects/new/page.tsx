"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import TemplateSelector from "@/components/TemplateSelector";

export default function NewProjectPage() {
  const { user, loading, checkAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [template, setTemplate] = useState("HeroPromo");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { checkAuth(); }, [checkAuth]);
  useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading, router]);

  if (loading || !user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { project } = await api.createProject({ title, script, aspectRatio, template });
      toast("Projet créé avec succès", "success");
      router.push(`/projects/${project.id}`);
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-dark-700 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-white">
              &larr; Retour
            </button>
            <h1 className="text-lg font-semibold">Nouveau Projet</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className={step === 1 ? "text-brand-400 font-medium" : ""}>1. Template</span>
            <span>&rarr;</span>
            <span className={step === 2 ? "text-brand-400 font-medium" : ""}>2. Contenu</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <TemplateSelector selected={template} onSelect={setTemplate} />

            <div>
              <label className="block text-sm text-gray-400 mb-2">Format vidéo</label>
              <div className="flex gap-3">
                {[
                  { value: "9:16", label: "Portrait (9:16)", desc: "Stories, Reels, TikTok" },
                  { value: "16:9", label: "Paysage (16:9)", desc: "YouTube, Web" },
                  { value: "1:1", label: "Carré (1:1)", desc: "Instagram, Facebook" },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setAspectRatio(r.value)}
                    className={`flex-1 px-4 py-3 rounded-lg border text-left transition-colors ${
                      aspectRatio === r.value
                        ? "border-brand-500 bg-brand-500/10 text-brand-400"
                        : "border-dark-700 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    <div className="font-medium text-sm">{r.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Continuer &rarr;
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-gray-400 hover:text-white"
            >
              &larr; Changer le template
            </button>

            <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 flex items-center gap-3 text-sm">
              <span className="text-gray-400">Template :</span>
              <span className="text-brand-400 font-medium">{template}</span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">Format :</span>
              <span className="text-brand-400 font-medium">{aspectRatio}</span>
            </div>

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
                rows={10}
                minLength={10}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
                placeholder="Collez votre script marketing ici. Chaque paragraphe peut devenir une scène..."
              />
              <p className="text-xs text-gray-500 mt-1">{script.length} caractères — min. 10</p>
            </div>

            <button
              type="submit"
              disabled={submitting || script.length < 10}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {submitting ? "Création..." : "Créer le projet"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

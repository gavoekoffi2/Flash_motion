"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import AssetUploader from "@/components/AssetUploader";
import AssetManager from "@/components/AssetManager";
import StoryboardEditor from "@/components/StoryboardEditor";

type Tab = "script" | "assets" | "storyboard" | "render";

export default function ProjectPage() {
  const { user, loading, checkAuth } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>("script");
  const [generating, setGenerating] = useState(false);
  const [savingStoryboard, setSavingStoryboard] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderJob, setRenderJob] = useState<any>(null);
  const [editingScript, setEditingScript] = useState(false);
  const [scriptDraft, setScriptDraft] = useState("");
  const [savingScript, setSavingScript] = useState(false);

  useEffect(() => { checkAuth(); }, [checkAuth]);
  useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading, router]);

  const loadProject = useCallback(async () => {
    try {
      const { project: p } = await api.getProject(projectId);
      setProject(p);
      if (p.renderJobs && p.renderJobs.length > 0) setRenderJob(p.renderJobs[0]);
    } catch (err: any) {
      toast(err.message, "error");
    }
  }, [projectId, toast]);

  const loadAssets = useCallback(async () => {
    try {
      const { assets: a } = await api.listAssets(projectId);
      setAssets(a);
    } catch (err) {
      console.error(err);
    }
  }, [projectId]);

  useEffect(() => {
    if (user) {
      loadProject();
      loadAssets();
    }
  }, [user, loadProject, loadAssets]);

  // Poll render status
  useEffect(() => {
    if (!renderJob || renderJob.status === "DONE" || renderJob.status === "FAILED") return;
    const interval = setInterval(async () => {
      try {
        const { renderJob: updated } = await api.getRenderStatus(projectId, renderJob.id);
        setRenderJob(updated);
        if (updated.status === "DONE") {
          toast("Vidéo prête au téléchargement !", "success");
          loadProject();
        } else if (updated.status === "FAILED") {
          toast("Le rendu a échoué", "error");
          loadProject();
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [renderJob, projectId, loadProject, toast]);

  if (loading || !user || !project) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">Chargement...</div>;
  }

  async function handleGenerateStoryboard() {
    setGenerating(true);
    try {
      const { storyboard } = await api.generateStoryboard(projectId);
      setProject({ ...project, storyboard, status: "STORYBOARD_READY" });
      setTab("storyboard");
      toast("Storyboard généré avec succès", "success");
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveStoryboard(storyboard: any) {
    setSavingStoryboard(true);
    try {
      await api.updateStoryboard(projectId, storyboard);
      setProject({ ...project, storyboard });
      toast("Storyboard sauvegardé", "success");
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setSavingStoryboard(false);
    }
  }

  async function handleStartRender() {
    setRendering(true);
    try {
      const { renderJob: job } = await api.startRender(projectId);
      setRenderJob(job);
      setProject({ ...project, status: "RENDERING" });
      setTab("render");
      toast("Rendu lancé", "info");
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setRendering(false);
    }
  }

  async function handleSaveScript() {
    setSavingScript(true);
    try {
      await api.updateProject(projectId, { script: scriptDraft });
      setProject({ ...project, script: scriptDraft });
      setEditingScript(false);
      toast("Script mis à jour", "success");
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setSavingScript(false);
    }
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "script", label: "Script", icon: "\u270F" },
    { key: "assets", label: `Assets (${assets.length})`, icon: "\uD83D\uDDBC" },
    { key: "storyboard", label: "Storyboard", icon: "\uD83C\uDFAC" },
    { key: "render", label: "Rendu", icon: "\u25B6" },
  ];

  const renderProgress = renderJob ? {
    QUEUED: { pct: 10, label: "En file d'attente...", color: "bg-blue-500" },
    RENDERING: { pct: 50, label: "Rendu vidéo en cours...", color: "bg-yellow-500" },
    UPLOADING: { pct: 85, label: "Upload de la vidéo...", color: "bg-brand-500" },
    DONE: { pct: 100, label: "Terminé !", color: "bg-green-500" },
    FAILED: { pct: 100, label: "Échoué", color: "bg-red-500" },
  }[renderJob.status as string] || { pct: 0, label: "", color: "bg-gray-500" } : null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-dark-700 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-white">&larr;</button>
            <div>
              <h1 className="font-semibold">{project.title}</h1>
              <span className="text-xs text-gray-500">
                {project.aspectRatio} &middot; {project.template || "HeroPromo"} &middot; {project.status}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {project.storyboard && (
              <button
                onClick={handleStartRender}
                disabled={rendering || project.status === "RENDERING"}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {rendering ? "Lancement..." : "Lancer le rendu"}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 text-sm border-b-2 transition-colors flex items-center gap-1.5 ${
                  tab === t.key
                    ? "border-brand-500 text-brand-400"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Script Tab */}
        {tab === "script" && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm text-gray-400">Script du projet</h3>
                {!editingScript && (
                  <button
                    onClick={() => { setScriptDraft(project.script); setEditingScript(true); }}
                    className="text-xs text-brand-400 hover:text-brand-300"
                  >
                    Modifier
                  </button>
                )}
              </div>
              {editingScript ? (
                <div className="space-y-3">
                  <textarea
                    value={scriptDraft}
                    onChange={(e) => setScriptDraft(e.target.value)}
                    rows={12}
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveScript}
                      disabled={savingScript}
                      className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      {savingScript ? "Sauvegarde..." : "Sauvegarder"}
                    </button>
                    <button
                      onClick={() => setEditingScript(false)}
                      className="text-gray-400 hover:text-white px-4 py-2 text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">{project.script}</pre>
              )}
            </div>
            <button
              onClick={handleGenerateStoryboard}
              disabled={generating}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {generating ? "Génération en cours..." : project.storyboard ? "Re-générer le Storyboard (IA)" : "Générer le Storyboard (IA)"}
            </button>
            {generating && (
              <div className="bg-dark-800 rounded-lg p-4 border border-dark-700">
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full animate-pulse-bar"></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Le LLM analyse votre script et génère le storyboard...</p>
              </div>
            )}
          </div>
        )}

        {/* Assets Tab */}
        {tab === "assets" && (
          <div className="space-y-6 animate-fade-in">
            <AssetUploader projectId={projectId} onUploaded={() => { loadAssets(); toast("Assets uploadés", "success"); }} />
            <AssetManager projectId={projectId} assets={assets} onChanged={loadAssets} />
          </div>
        )}

        {/* Storyboard Tab */}
        {tab === "storyboard" && (
          <div className="animate-fade-in">
            {project.storyboard ? (
              <StoryboardEditor
                storyboard={project.storyboard}
                assets={assets}
                onSave={handleSaveStoryboard}
                saving={savingStoryboard}
              />
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-400 mb-4">Aucun storyboard généré</p>
                <button
                  onClick={() => { setTab("script"); handleGenerateStoryboard(); }}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Générer le Storyboard
                </button>
              </div>
            )}
          </div>
        )}

        {/* Render Tab */}
        {tab === "render" && (
          <div className="animate-fade-in space-y-4">
            {renderJob ? (
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Rendu #{renderJob.id.slice(0, 8)}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    renderJob.status === "DONE" ? "bg-green-600" :
                    renderJob.status === "FAILED" ? "bg-red-600" :
                    renderJob.status === "RENDERING" ? "bg-yellow-600" :
                    "bg-blue-600"
                  }`}>
                    {renderJob.status}
                  </span>
                </div>

                {renderProgress && renderJob.status !== "DONE" && renderJob.status !== "FAILED" && (
                  <div>
                    <div className="h-2.5 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${renderProgress.color} rounded-full transition-all duration-500`}
                        style={{ width: `${renderProgress.pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">{renderProgress.label}</p>
                      <p className="text-xs text-gray-500">{renderProgress.pct}%</p>
                    </div>
                  </div>
                )}

                {renderJob.status === "DONE" && renderJob.downloadUrl && (
                  <div className="space-y-4">
                    <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                      <p className="text-green-400 text-sm font-medium mb-1">Vidéo prête !</p>
                      <p className="text-xs text-gray-400">
                        Rendu terminé le {renderJob.finishedAt ? new Date(renderJob.finishedAt).toLocaleString("fr-FR") : ""}
                      </p>
                    </div>

                    {/* Video preview */}
                    <div className="bg-dark-900 rounded-lg overflow-hidden border border-dark-700">
                      <video
                        src={renderJob.downloadUrl}
                        controls
                        className="w-full max-h-[500px]"
                        poster=""
                      />
                    </div>

                    <div className="flex gap-3">
                      <a
                        href={renderJob.downloadUrl}
                        download
                        className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Télécharger MP4
                      </a>
                      <button
                        onClick={handleStartRender}
                        className="bg-dark-700 hover:bg-dark-900 text-gray-300 px-4 py-3 rounded-lg text-sm"
                      >
                        Re-rendre
                      </button>
                    </div>
                  </div>
                )}

                {renderJob.status === "FAILED" && (
                  <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                    <p className="text-red-400 text-sm font-medium mb-1">Le rendu a échoué</p>
                    <p className="text-xs text-gray-400 mb-3">{renderJob.error || "Erreur inconnue"}</p>
                    <button
                      onClick={handleStartRender}
                      className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Relancer le rendu
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-400 mb-4">Aucun rendu lancé</p>
                {project.storyboard ? (
                  <button
                    onClick={handleStartRender}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Lancer le rendu
                  </button>
                ) : (
                  <p className="text-sm text-gray-500">Générez d&apos;abord un storyboard</p>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import AssetUploader from "@/components/AssetUploader";
import AssetManager from "@/components/AssetManager";
import StoryboardEditor from "@/components/StoryboardEditor";

type Tab = "script" | "assets" | "storyboard" | "render";

export default function ProjectPage() {
  const { user, loading, checkAuth } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>("script");
  const [generating, setGenerating] = useState(false);
  const [savingStoryboard, setSavingStoryboard] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderJob, setRenderJob] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => { checkAuth(); }, [checkAuth]);
  useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading, router]);

  const loadProject = useCallback(async () => {
    try {
      const { project: p } = await api.getProject(projectId);
      setProject(p);
      if (p.renderJobs?.length > 0) setRenderJob(p.renderJobs[0]);
    } catch (err: any) {
      setError(err.message);
    }
  }, [projectId]);

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
        if (updated.status === "DONE" || updated.status === "FAILED") {
          loadProject();
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [renderJob, projectId, loadProject]);

  if (loading || !user || !project) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">Chargement...</div>;
  }

  async function handleGenerateStoryboard() {
    setError("");
    setGenerating(true);
    try {
      const { storyboard } = await api.generateStoryboard(projectId);
      setProject({ ...project, storyboard, status: "STORYBOARD_READY" });
      setTab("storyboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveStoryboard(storyboard: any) {
    setSavingStoryboard(true);
    try {
      await api.updateStoryboard(projectId, storyboard);
      setProject({ ...project, storyboard });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingStoryboard(false);
    }
  }

  async function handleStartRender() {
    setError("");
    setRendering(true);
    try {
      const { renderJob: job } = await api.startRender(projectId);
      setRenderJob(job);
      setProject({ ...project, status: "RENDERING" });
      setTab("render");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRendering(false);
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "script", label: "Script" },
    { key: "assets", label: `Assets (${assets.length})` },
    { key: "storyboard", label: "Storyboard" },
    { key: "render", label: "Rendu" },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-dark-700 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-white">&larr;</button>
            <div>
              <h1 className="font-semibold">{project.title}</h1>
              <span className="text-xs text-gray-500">{project.aspectRatio} &middot; {project.status}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {project.storyboard && (
              <button
                onClick={handleStartRender}
                disabled={rendering}
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
                className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                  tab === t.key
                    ? "border-brand-500 text-brand-400"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>
        )}

        {/* Script Tab */}
        {tab === "script" && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
              <h3 className="text-sm text-gray-400 mb-2">Script du projet</h3>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">{project.script}</pre>
            </div>
            <button
              onClick={handleGenerateStoryboard}
              disabled={generating}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {generating ? "Génération en cours..." : "Générer le Storyboard (IA)"}
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
            <AssetUploader projectId={projectId} onUploaded={loadAssets} />
            <AssetManager projectId={projectId} assets={assets} onChanged={loadAssets} />
          </div>
        )}

        {/* Storyboard Tab */}
        {tab === "storyboard" && (
          <div className="animate-fade-in">
            {project.storyboard ? (
              <StoryboardEditor
                storyboard={project.storyboard}
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

                {(renderJob.status === "QUEUED" || renderJob.status === "RENDERING" || renderJob.status === "UPLOADING") && (
                  <div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full animate-pulse-bar"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {renderJob.status === "QUEUED" && "En attente dans la file..."}
                      {renderJob.status === "RENDERING" && "Rendu vidéo en cours..."}
                      {renderJob.status === "UPLOADING" && "Upload de la vidéo..."}
                    </p>
                  </div>
                )}

                {renderJob.status === "DONE" && renderJob.downloadUrl && (
                  <div className="space-y-3">
                    <p className="text-green-400 text-sm">Vidéo prête !</p>
                    <a
                      href={renderJob.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Télécharger MP4
                    </a>
                  </div>
                )}

                {renderJob.status === "FAILED" && (
                  <div>
                    <p className="text-red-400 text-sm">{renderJob.error || "Le rendu a échoué"}</p>
                    <button
                      onClick={handleStartRender}
                      className="mt-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm"
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

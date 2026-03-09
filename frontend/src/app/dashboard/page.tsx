"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function DashboardPage() {
  const { user, loading, checkAuth, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      api.listProjects()
        .then(({ projects }) => setProjects(projects))
        .catch(console.error)
        .finally(() => setLoadingProjects(false));
    }
  }, [user]);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400">Chargement...</div>;
  if (!user) return <div className="flex items-center justify-center min-h-screen text-gray-400">Redirection...</div>;

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Supprimer ce projet ? Cette action est irréversible.")) return;
    setDeletingId(id);
    try {
      await api.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast("Projet supprimé", "success");
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDuplicate(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { project } = await api.duplicateProject(id);
      setProjects((prev) => [project, ...prev]);
      toast("Projet dupliqué", "success");
    } catch (err: any) {
      toast(err.message, "error");
    }
  }

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-600",
    STORYBOARD_READY: "bg-blue-600",
    RENDERING: "bg-yellow-600",
    DONE: "bg-green-600",
    FAILED: "bg-red-600",
  };

  const statusLabels: Record<string, string> = {
    DRAFT: "Brouillon",
    STORYBOARD_READY: "Prêt",
    RENDERING: "Rendu...",
    DONE: "Terminé",
    FAILED: "Échoué",
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-dark-700 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-brand-500">Flash Motion</h1>
          <div className="flex items-center gap-4">
            <Link href="/settings" className="text-sm text-gray-400 hover:text-white transition-colors">
              Paramètres
            </Link>
            <span className="text-sm text-gray-400">{user.name || user.email}</span>
            <button onClick={logout} className="text-sm text-gray-400 hover:text-white transition-colors">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">Mes Projets</h2>
          <Link
            href="/projects/new"
            className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            + Nouveau Projet
          </Link>
        </div>

        {loadingProjects ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-dark-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-dark-700 rounded w-full mb-2" />
                <div className="h-3 bg-dark-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4">&#x1F3AC;</div>
            <h3 className="text-xl font-medium mb-2">Aucun projet</h3>
            <p className="text-gray-400 mb-6">Créez votre première vidéo motion design</p>
            <Link
              href="/projects/new"
              className="inline-block bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Créer un projet
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="block bg-dark-800 border border-dark-700 rounded-xl p-5 hover:border-brand-500/50 transition-colors animate-fade-in group relative"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium truncate flex-1">{p.title}</h3>
                  <span className={`${statusColors[p.status] || "bg-gray-600"} text-xs px-2 py-0.5 rounded-full ml-2`}>
                    {statusLabels[p.status] || p.status}
                  </span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                  {p.script?.slice(0, 120)}...
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{p.aspectRatio}</span>
                  <span>{p.template || "HeroPromo"}</span>
                  <span>{p._count?.assets || 0} assets</span>
                  <span>{new Date(p.updatedAt).toLocaleDateString("fr-FR")}</span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-1 mt-3 md:absolute md:top-2 md:right-2 md:mt-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleDuplicate(e, p.id)}
                    className="bg-dark-700 hover:bg-dark-900 text-gray-300 text-xs px-2 py-1 rounded"
                    title="Dupliquer"
                  >
                    Dupliquer
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, p.id)}
                    disabled={deletingId === p.id}
                    className="bg-red-900/60 hover:bg-red-900 text-red-300 text-xs px-2 py-1 rounded"
                    title="Supprimer"
                  >
                    {deletingId === p.id ? "..." : "Suppr."}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

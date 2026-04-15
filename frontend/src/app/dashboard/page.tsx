"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  DRAFT:            { label: "Brouillon",  color: "#94a3b8", bg: "rgba(148,163,184,0.1)", icon: "✏️" },
  STORYBOARD_READY: { label: "Prêt",       color: "#22d3ee", bg: "rgba(34,211,238,0.1)",  icon: "📋" },
  RENDERING:        { label: "Rendu...",   color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  icon: "⚙️" },
  DONE:             { label: "Terminé",    color: "#4ade80", bg: "rgba(74,222,128,0.1)",  icon: "✅" },
  FAILED:           { label: "Échoué",     color: "#fb7185", bg: "rgba(251,113,133,0.1)", icon: "❌" },
};

const TEMPLATE_GRADIENTS: Record<string, string> = {
  LuxuryAd:        "linear-gradient(135deg, #92400e, #d97706)",
  DynamicProduct:  "linear-gradient(135deg, #0c4a6e, #06b6d4)",
  SocialMediaBurst:"linear-gradient(135deg, #9d174d, #f43f5e)",
  CinematicBrand:  "linear-gradient(135deg, #1e3a5f, #4a90e2)",
  CinematicPromo:  "linear-gradient(135deg, #4c1d95, #8b5cf6)",
  HeroPromo:       "linear-gradient(135deg, #4c1d95, #7c3aed)",
  EcommerceShowcase:"linear-gradient(135deg, #831843, #f093fb)",
  Testimonial:     "linear-gradient(135deg, #1e1b4b, #667eea)",
  SaasLaunch:      "linear-gradient(135deg, #1e1b4b, #a18cd1)",
  Educational:     "linear-gradient(135deg, #0c4a6e, #4facfe)",
};

export default function DashboardPage() {
  const { user, loading, checkAuth, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => { checkAuth(); }, [checkAuth]);
  useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading, router]);
  useEffect(() => {
    if (user) {
      api.listProjects()
        .then(({ projects }) => setProjects(projects))
        .catch(console.error)
        .finally(() => setLoadingProjects(false));
    }
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen mesh-bg">
      <div className="w-10 h-10 rounded-full border-2 border-brand-500/30 border-t-brand-500 animate-spin" />
    </div>
  );
  if (!user) return null;

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault(); e.stopPropagation();
    if (!confirm("Supprimer ce projet ? Cette action est irréversible.")) return;
    setDeletingId(id);
    try {
      await api.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      toast("Projet supprimé", "success");
    } catch (err: any) { toast(err.message, "error"); }
    finally { setDeletingId(null); }
  }

  async function handleDuplicate(e: React.MouseEvent, id: string) {
    e.preventDefault(); e.stopPropagation();
    try {
      const { project } = await api.duplicateProject(id);
      setProjects(prev => [project, ...prev]);
      toast("Projet dupliqué ✓", "success");
    } catch (err: any) { toast(err.message, "error"); }
  }

  const filtered = filter === "ALL" ? projects : projects.filter(p => p.status === filter);
  const stats = {
    total: projects.length,
    done: projects.filter(p => p.status === "DONE").length,
    rendering: projects.filter(p => p.status === "RENDERING").length,
  };

  return (
    <div className="min-h-screen mesh-bg">
      {/* Navbar */}
      <nav className="glass-strong border-b border-brand-500/10 sticky top-0 z-40">
        <div className="container-xl px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>FM</div>
            <span className="font-black">Flash<span className="gradient-text">Motion</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-dark-300 hidden sm:block">
              Bonjour, <span className="text-white font-medium">{user.name}</span> 👋
            </span>
            <Link href="/projects/new" className="btn-primary text-sm py-2 px-4">
              + Nouvelle vidéo
            </Link>
            <button onClick={logout} className="btn-ghost text-sm py-2 px-3">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="container-xl px-6 py-10">
        {/* Header + Stats */}
        <div className="mb-10">
          <h1 className="text-3xl font-black mb-2">Mes vidéos <span className="gradient-text">motion design</span></h1>
          <p className="text-dark-300 mb-8">Gérez et créez vos vidéos professionnelles</p>

          <div className="grid grid-cols-3 gap-4 max-w-lg">
            {[
              { label: "Total", value: stats.total, color: "#8b5cf6", icon: "🎬" },
              { label: "Terminées", value: stats.done, color: "#4ade80", icon: "✅" },
              { label: "En rendu", value: stats.rendering, color: "#fbbf24", icon: "⚙️" },
            ].map((s, i) => (
              <div key={i} className="glass-card rounded-2xl p-4 text-center">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-dark-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["ALL", "DRAFT", "STORYBOARD_READY", "RENDERING", "DONE", "FAILED"].map(f => {
            const cfg = f === "ALL" ? { label: "Tous", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" } : STATUS_CONFIG[f];
            return (
              <button key={f} onClick={() => setFilter(f)}
                className="text-xs px-3 py-1.5 rounded-full border transition-all font-medium"
                style={{
                  background: filter === f ? cfg.bg : "transparent",
                  borderColor: filter === f ? cfg.color + "60" : "rgba(255,255,255,0.08)",
                  color: filter === f ? cfg.color : "#64748b",
                }}>
                {f === "ALL" ? "Tous" : cfg.label}
                {f !== "ALL" && <span className="ml-1.5 opacity-60">
                  {projects.filter(p => p.status === f).length}
                </span>}
              </button>
            );
          })}
        </div>

        {/* Grille projets */}
        {loadingProjects ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden">
                <div className="h-36 shimmer-loading" />
                <div className="p-4 space-y-2">
                  <div className="h-4 rounded shimmer-loading w-3/4" />
                  <div className="h-3 rounded shimmer-loading w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-6 animate-bounce-subtle">🎬</div>
            <h3 className="text-xl font-bold mb-3 text-white">
              {filter === "ALL" ? "Aucune vidéo pour l'instant" : `Aucun projet "${STATUS_CONFIG[filter]?.label}"`}
            </h3>
            <p className="text-dark-300 mb-8 max-w-sm mx-auto">
              Créez votre première vidéo motion design en quelques clics avec l'IA.
            </p>
            <Link href="/projects/new" className="btn-primary">
              🚀 Créer ma première vidéo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {/* Card "Nouveau projet" */}
            <Link href="/projects/new"
              className="glass-card rounded-2xl overflow-hidden border-dashed border-2 flex flex-col items-center justify-center gap-3 p-8 min-h-[220px] group"
              style={{ borderColor: "rgba(139,92,246,0.2)" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
                +
              </div>
              <span className="text-sm font-medium text-brand-400 group-hover:text-brand-300 transition-colors">
                Nouvelle vidéo
              </span>
            </Link>

            {filtered.map(project => {
              const cfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.DRAFT;
              const gradient = TEMPLATE_GRADIENTS[project.template] || "linear-gradient(135deg, #4c1d95, #7c3aed)";
              return (
                <Link key={project.id} href={`/projects/${project.id}`}
                  className="glass-card rounded-2xl overflow-hidden group block">
                  {/* Thumbnail */}
                  <div className="h-36 relative overflow-hidden" style={{ background: gradient }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-xl
                        group-hover:scale-110 transition-transform duration-300">
                        {project.status === "DONE" ? "▶" : cfg.icon}
                      </div>
                    </div>
                    {/* Particules décoratives */}
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-white/30"
                        style={{ left: `${20 + i * 30}%`, top: `${25 + i * 20}%`, animation: `float ${2+i}s ease-in-out infinite`, animationDelay: `${i*0.5}s` }} />
                    ))}
                    {/* Status badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
                      {cfg.icon} {cfg.label}
                    </div>
                    {/* Template badge */}
                    <div className="absolute bottom-3 left-3 text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-white/70 backdrop-blur-sm">
                      {project.template || "HeroPromo"}
                    </div>
                  </div>

                  {/* Infos */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-white truncate mb-1 group-hover:text-brand-300 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-dark-400 mb-3">
                      {new Date(project.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2" onClick={e => e.preventDefault()}>
                      <button onClick={e => handleDuplicate(e, project.id)}
                        className="flex-1 text-xs py-1.5 rounded-lg text-dark-300 hover:text-white transition-colors"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        Dupliquer
                      </button>
                      <button onClick={e => handleDelete(e, project.id)} disabled={deletingId === project.id}
                        className="flex-1 text-xs py-1.5 rounded-lg text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-50"
                        style={{ background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.15)" }}>
                        {deletingId === project.id ? "..." : "Supprimer"}
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

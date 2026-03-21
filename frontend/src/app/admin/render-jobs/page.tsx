"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";

const STATUSES = ["", "QUEUED", "RENDERING", "UPLOADING", "DONE", "FAILED"] as const;

const statusColors: Record<string, string> = {
  QUEUED: "bg-gray-600",
  RENDERING: "bg-yellow-600",
  UPLOADING: "bg-blue-600",
  DONE: "bg-green-600",
  FAILED: "bg-red-600",
};

const statusLabels: Record<string, string> = {
  QUEUED: "En attente",
  RENDERING: "Rendu...",
  UPLOADING: "Upload...",
  DONE: "Terminé",
  FAILED: "Échoué",
};

export default function AdminRenderJobsPage() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAdminRenderJobs(page, limit, statusFilter || undefined);
      setJobs(data.jobs);
      setTotal(data.total);
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, toast]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const totalPages = Math.ceil(total / limit);

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Rendus</h2>
          <p className="text-sm text-gray-400 mt-1">{total} job{total !== 1 ? "s" : ""} au total</p>
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="">Tous les statuts</option>
            {STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                {statusLabels[s] || s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-dark-900 border border-dark-700 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-dark-700 rounded w-1/3 mb-2" />
              <div className="h-3 bg-dark-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400">Aucun job de rendu trouvé</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700 text-left text-gray-400">
                  <th className="pb-3 pr-4 font-medium">Projet</th>
                  <th className="pb-3 pr-4 font-medium">Statut</th>
                  <th className="pb-3 pr-4 font-medium">Moteur</th>
                  <th className="pb-3 pr-4 font-medium">Créé le</th>
                  <th className="pb-3 pr-4 font-medium">Démarré</th>
                  <th className="pb-3 font-medium">Terminé</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                    <td className="py-3 pr-4">
                      <span className="font-medium">{job.project?.title || job.projectId}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`${statusColors[job.status] || "bg-gray-600"} text-xs px-2 py-0.5 rounded-full`}>
                        {statusLabels[job.status] || job.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{job.engine || "—"}</td>
                    <td className="py-3 pr-4 text-gray-400">{formatDate(job.createdAt)}</td>
                    <td className="py-3 pr-4 text-gray-400">{formatDate(job.startedAt)}</td>
                    <td className="py-3 text-gray-400">{formatDate(job.finishedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="bg-dark-900 border border-dark-700 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium truncate flex-1 mr-2">
                    {job.project?.title || job.projectId}
                  </p>
                  <span className={`${statusColors[job.status] || "bg-gray-600"} text-xs px-2 py-0.5 rounded-full shrink-0`}>
                    {statusLabels[job.status] || job.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                  <span>Moteur: {job.engine || "—"}</span>
                  <span>Créé : {formatDate(job.createdAt)}</span>
                  {job.startedAt && <span>Démarré: {formatDate(job.startedAt)}</span>}
                  {job.finishedAt && <span>Terminé: {formatDate(job.finishedAt)}</span>}
                </div>
                {job.error && (
                  <p className="text-xs text-red-400 mt-2 truncate" title={job.error}>
                    {job.error}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg bg-dark-900 border border-dark-700 hover:border-brand-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              <span className="text-sm text-gray-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg bg-dark-900 border border-dark-700 hover:border-brand-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

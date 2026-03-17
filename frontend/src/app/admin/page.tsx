"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Stats {
  users: number;
  projects: number;
  totalRenders: number;
  activeRenders: number;
}

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAdminStats()
      .then(setStats)
      .catch((err: any) => toast(err.message, "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  const cards = stats
    ? [
        { label: "Utilisateurs", value: stats.users },
        { label: "Projets", value: stats.projects },
        { label: "Rendus totaux", value: stats.totalRenders },
        { label: "Rendus actifs", value: stats.activeRenders },
      ]
    : [];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-8">Tableau de bord admin</h2>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-dark-900 border border-dark-700 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-dark-700 rounded w-1/2 mb-3" />
              <div className="h-8 bg-dark-700 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-dark-900 border border-dark-700 rounded-xl p-6"
            >
              <p className="text-sm text-gray-400 mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-brand-500">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/users"
          className="bg-dark-900 border border-dark-700 rounded-xl p-6 hover:border-brand-500/50 transition-colors"
        >
          <h3 className="font-medium mb-1">Utilisateurs</h3>
          <p className="text-sm text-gray-400">Gerer les comptes, plans et quotas</p>
        </Link>
        <Link
          href="/admin/render-jobs"
          className="bg-dark-900 border border-dark-700 rounded-xl p-6 hover:border-brand-500/50 transition-colors"
        >
          <h3 className="font-medium mb-1">Rendus</h3>
          <p className="text-sm text-gray-400">Voir tous les jobs de rendu</p>
        </Link>
        <Link
          href="/dashboard"
          className="bg-dark-900 border border-dark-700 rounded-xl p-6 hover:border-brand-500/50 transition-colors"
        >
          <h3 className="font-medium mb-1">Application</h3>
          <p className="text-sm text-gray-400">Retourner au tableau de bord utilisateur</p>
        </Link>
      </div>
    </div>
  );
}

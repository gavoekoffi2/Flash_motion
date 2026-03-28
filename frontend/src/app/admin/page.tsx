"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function adminFetch(path: string, token: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export default function AdminPage() {
  const { user, loading, checkAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user && user.role !== "ADMIN") { router.push("/dashboard"); toast("Acces admin requis", "error"); }
  }, [user, loading, router, toast]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    const token = localStorage.getItem("fm_token") || "";
    Promise.all([
      adminFetch("/admin/stats", token),
      adminFetch("/admin/users?limit=50", token),
    ]).then(([s, u]) => {
      setStats(s);
      setUsers(u.users || []);
    }).catch((err) => toast(err.message, "error"))
      .finally(() => setLoadingData(false));
  }, [user, toast]);

  if (loading || !user) return null;
  if (user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-dark-700 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white">&larr; Dashboard</Link>
            <h1 className="text-lg font-semibold">Admin</h1>
          </div>
          <span className="text-xs text-brand-400 bg-brand-500/10 px-2 py-1 rounded">ADMIN</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        {loadingData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl p-5 animate-pulse h-24" />)}
          </div>
        ) : stats && (
          <section>
            <h2 className="text-sm font-medium text-gray-400 mb-4">Vue d&apos;ensemble</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Utilisateurs" value={stats.users} color="text-brand-400" />
              <StatCard label="Projets" value={stats.projects} color="text-blue-400" />
              <StatCard label="Rendus total" value={stats.totalRenders} color="text-green-400" />
              <StatCard label="Rendus actifs" value={stats.activeRenders} color="text-yellow-400" />
            </div>
          </section>
        )}

        {/* Users */}
        <section>
          <h2 className="text-sm font-medium text-gray-400 mb-4">Utilisateurs ({users.length})</h2>
          <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700 text-gray-500 text-xs">
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Nom</th>
                  <th className="text-left px-4 py-3">Plan</th>
                  <th className="text-left px-4 py-3">Projets</th>
                  <th className="text-left px-4 py-3">LLM</th>
                  <th className="text-left px-4 py-3">Rendus</th>
                  <th className="text-left px-4 py-3">Stockage</th>
                  <th className="text-left px-4 py-3">Inscrit</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                    <td className="px-4 py-3 text-gray-300 font-mono text-xs">{u.email}</td>
                    <td className="px-4 py-3 text-gray-400">{u.name || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.plan === "PRO" ? "bg-brand-600" : u.plan === "ENTERPRISE" ? "bg-purple-600" : "bg-dark-600"}`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{u._count?.projects ?? 0}</td>
                    <td className="px-4 py-3 text-gray-400">{u.quota?.llmCallsToday ?? 0}</td>
                    <td className="px-4 py-3 text-gray-400">{u.quota?.rendersToday ?? 0}</td>
                    <td className="px-4 py-3 text-gray-400">{u.quota?.storageUsedMb?.toFixed(1) ?? 0} MB</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString("fr-FR")}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Aucun utilisateur</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

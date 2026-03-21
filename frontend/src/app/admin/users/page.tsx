"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import type { AdminUser } from "@/lib/types";

const PLANS: ("FREE" | "PRO" | "ENTERPRISE")[] = ["FREE", "PRO", "ENTERPRISE"];

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editingQuota, setEditingQuota] = useState<string | null>(null);
  const [quotaForm, setQuotaForm] = useState({ llmCallsLimit: 0, rendersLimit: 0, storageLimitMb: 0 });
  const [savingQuota, setSavingQuota] = useState(false);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const limit = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAdminUsers(page, limit);
      setUsers(data.users);
      setTotal(data.total);
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.ceil(total / limit);

  async function handlePlanChange(userId: string, plan: "FREE" | "PRO" | "ENTERPRISE") {
    setChangingPlan(userId);
    try {
      await api.updateUserPlan(userId, plan);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, plan } : u)));
      toast("Plan mis à jour", "success");
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setChangingPlan(null);
    }
  }

  function openQuotaEditor(user: AdminUser) {
    setEditingQuota(user.id);
    setQuotaForm({
      llmCallsLimit: 0,
      rendersLimit: 0,
      storageLimitMb: 0,
    });
  }

  async function handleQuotaSave() {
    if (!editingQuota) return;
    setSavingQuota(true);
    try {
      await api.updateUserQuota(editingQuota, quotaForm);
      toast("Quotas mis à jour", "success");
      setEditingQuota(null);
      fetchUsers();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setSavingQuota(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Utilisateurs</h2>
      <p className="text-sm text-gray-400 mb-6">{total} utilisateur{total !== 1 ? "s" : ""} au total</p>

      {/* Quota edit modal */}
      {editingQuota && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Modifier les quotas</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Limite appels LLM / jour</label>
                <input
                  type="number"
                  min={0}
                  value={quotaForm.llmCallsLimit}
                  onChange={(e) => setQuotaForm((f) => ({ ...f, llmCallsLimit: Number(e.target.value) }))}
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Limite rendus / jour</label>
                <input
                  type="number"
                  min={0}
                  value={quotaForm.rendersLimit}
                  onChange={(e) => setQuotaForm((f) => ({ ...f, rendersLimit: Number(e.target.value) }))}
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Limite stockage (Mo)</label>
                <input
                  type="number"
                  min={0}
                  value={quotaForm.storageLimitMb}
                  onChange={(e) => setQuotaForm((f) => ({ ...f, storageLimitMb: Number(e.target.value) }))}
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingQuota(null)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleQuotaSave}
                disabled={savingQuota}
                className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {savingQuota ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-dark-900 border border-dark-700 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-dark-700 rounded w-1/3 mb-2" />
              <div className="h-3 bg-dark-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700 text-left text-gray-400">
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">Nom</th>
                  <th className="pb-3 pr-4 font-medium">Role</th>
                  <th className="pb-3 pr-4 font-medium">Plan</th>
                  <th className="pb-3 pr-4 font-medium">Projets</th>
                  <th className="pb-3 pr-4 font-medium">Stockage</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                    <td className="py-3 pr-4">{u.email}</td>
                    <td className="py-3 pr-4 text-gray-400">{u.name || "—"}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          u.role === "ADMIN" ? "bg-brand-600/20 text-brand-500" : "bg-dark-700 text-gray-300"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={u.plan}
                        disabled={changingPlan === u.id}
                        onChange={(e) => handlePlanChange(u.id, e.target.value as "FREE" | "PRO" | "ENTERPRISE")}
                        className="bg-dark-800 border border-dark-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-brand-500 disabled:opacity-50"
                      >
                        {PLANS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{u._count.projects}</td>
                    <td className="py-3 pr-4 text-gray-400">
                      {u.quota ? `${u.quota.storageUsedMb.toFixed(1)} Mo` : "—"}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => openQuotaEditor(u)}
                        className="text-xs text-brand-500 hover:text-brand-400 transition-colors"
                      >
                        Quotas
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {users.map((u) => (
              <div key={u.id} className="bg-dark-900 border border-dark-700 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{u.email}</p>
                    <p className="text-sm text-gray-400">{u.name || "—"}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      u.role === "ADMIN" ? "bg-brand-600/20 text-brand-500" : "bg-dark-700 text-gray-300"
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span>{u._count.projects} projet{u._count.projects !== 1 ? "s" : ""}</span>
                  <span>{u.quota ? `${u.quota.storageUsedMb.toFixed(1)} Mo` : "—"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={u.plan}
                    disabled={changingPlan === u.id}
                    onChange={(e) => handlePlanChange(u.id, e.target.value as "FREE" | "PRO" | "ENTERPRISE")}
                    className="bg-dark-800 border border-dark-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-brand-500 disabled:opacity-50"
                  >
                    {PLANS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => openQuotaEditor(u)}
                    className="text-xs text-brand-500 hover:text-brand-400 transition-colors"
                  >
                    Quotas
                  </button>
                </div>
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

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import type { Quota, User } from "@/lib/types";

export default function SettingsPage() {
  const { user, loading } = useRequireAuth();
  const { checkAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [quota, setQuota] = useState<Quota | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      // Load quota info
      api.me().then(({ user: u }) => {
        const q = (u as User & { quota?: Quota }).quota;
        if (q) setQuota(q);
      }).catch((err: any) => {
        toast("Impossible de charger les quotas", "error");
      });
    }
  }, [user]);

  if (loading || !user) return <div className="flex items-center justify-center min-h-screen text-gray-400">Chargement...</div>;

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({ name: name || undefined, email: email !== user!.email ? email : undefined });
      toast("Profil mis à jour", "success");
      checkAuth();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast("Les mots de passe ne correspondent pas", "error");
      return;
    }
    setChangingPassword(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      toast("Mot de passe mis à jour", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-dark-700 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-white min-h-[44px] min-w-[44px] px-2">&larr; Retour</button>
          <h1 className="text-lg font-semibold">Paramètres</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Section */}
        <section className="bg-dark-800 border border-dark-700 rounded-xl p-6 animate-fade-in">
          <h2 className="text-lg font-medium mb-4">Profil</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label htmlFor="settings-name" className="block text-sm text-gray-400 mb-1">Nom</label>
              <input
                id="settings-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label htmlFor="settings-email" className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                id="settings-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm transition-colors"
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
              <span className="text-xs text-gray-500">Plan : <span className="text-brand-400 font-medium">{user.plan}</span></span>
            </div>
          </form>
        </section>

        {/* Password Section */}
        <section className="bg-dark-800 border border-dark-700 rounded-xl p-6 animate-fade-in">
          <h2 className="text-lg font-medium mb-4">Changer le mot de passe</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="settings-current-password" className="block text-sm text-gray-400 mb-1">Mot de passe actuel</label>
              <input
                id="settings-current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label htmlFor="settings-new-password" className="block text-sm text-gray-400 mb-1">Nouveau mot de passe</label>
              <input
                id="settings-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label htmlFor="settings-confirm-password" className="block text-sm text-gray-400 mb-1">Confirmer le nouveau mot de passe</label>
              <input
                id="settings-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              type="submit"
              disabled={changingPassword}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm transition-colors"
            >
              {changingPassword ? "Modification..." : "Modifier le mot de passe"}
            </button>
          </form>
        </section>

        {/* Quota Section */}
        {quota && (
          <section className="bg-dark-800 border border-dark-700 rounded-xl p-6 animate-fade-in">
            <h2 className="text-lg font-medium mb-4">Utilisation & Quotas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <QuotaCard
                label="Appels LLM (aujourd'hui)"
                used={quota.llmCallsToday}
                limit={quota.llmCallsLimit}
              />
              <QuotaCard
                label="Rendus (aujourd'hui)"
                used={quota.rendersToday}
                limit={quota.rendersLimit}
              />
              <QuotaCard
                label="Stockage"
                used={parseFloat(quota.storageUsedMb?.toFixed(1) || "0")}
                limit={quota.storageLimitMb}
                unit="MB"
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function QuotaCard({ label, used, limit, unit }: { label: string; used: number; limit: number; unit?: string }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const barColor = pct > 80 ? "bg-red-500" : pct > 50 ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-lg p-4">
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      <p className="text-lg font-semibold">
        {used} <span className="text-sm text-gray-500">/ {limit} {unit || ""}</span>
      </p>
      <div className="h-1.5 bg-dark-700 rounded-full mt-2 overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

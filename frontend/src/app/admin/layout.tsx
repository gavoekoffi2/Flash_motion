"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth();
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Chargement...
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Redirection...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-dark-700 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl font-bold text-brand-500">
              Flash Motion <span className="text-sm font-normal text-gray-400">Admin</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-4">
              <Link href="/admin" className="text-sm text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/users" className="text-sm text-gray-400 hover:text-white transition-colors">
                Utilisateurs
              </Link>
              <Link href="/admin/render-jobs" className="text-sm text-gray-400 hover:text-white transition-colors">
                Rendus
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
              Retour app
            </Link>
            <span className="text-sm text-gray-400">{user.name || user.email}</span>
            <button onClick={logout} className="text-sm text-gray-400 hover:text-white transition-colors">
              Deconnexion
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

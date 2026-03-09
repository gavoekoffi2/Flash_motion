"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";

/**
 * Shared auth guard hook — checks auth and redirects to /login if not authenticated.
 * Returns { user, loading } for conditional rendering.
 */
export function useRequireAuth() {
  const { user, loading, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  return { user, loading };
}

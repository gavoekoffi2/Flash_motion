"use client";

import { create } from "zustand";
import { api } from "@/lib/api";

interface AuthState {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (email, password) => {
    const { user } = await api.login(email, password);
    set({ user });
  },

  register: async (email, password, name) => {
    const { user } = await api.register(email, password, name);
    set({ user });
  },

  logout: () => {
    api.logout();
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      if (!api.getToken()) {
        set({ user: null, loading: false });
        return;
      }
      const { user } = await api.me();
      set({ user, loading: false });
    } catch {
      api.logout();
      set({ user: null, loading: false });
    }
  },
}));

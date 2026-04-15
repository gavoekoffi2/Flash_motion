"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<{ toast: (msg: string, type?: ToastType) => void }>({
  toast: () => {},
});

const TOAST_CONFIG: Record<ToastType, { icon: string; color: string; bg: string; border: string }> = {
  success: { icon: "✓", color: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.25)" },
  error:   { icon: "✕", color: "#fb7185", bg: "rgba(251,113,133,0.08)", border: "rgba(251,113,133,0.25)" },
  warning: { icon: "⚠", color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.25)" },
  info:    { icon: "ℹ", color: "#22d3ee", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.25)" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t, i) => {
          const cfg = TOAST_CONFIG[t.type];
          return (
            <div key={t.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium pointer-events-auto animate-slide-up"
              style={{
                background: "rgba(8,13,26,0.95)",
                border: `1px solid ${cfg.border}`,
                backdropFilter: "blur(20px)",
                boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${cfg.color}20`,
                animationDelay: `${i * 50}ms`,
                minWidth: "280px",
                maxWidth: "380px",
              }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                {cfg.icon}
              </div>
              <span style={{ color: "#e2e8f0" }}>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

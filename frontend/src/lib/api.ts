import type { User, Project, Asset, Storyboard, RenderJob } from "./types";

function getApiBase(): string {
  // Explicit env var takes priority
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // In the browser on a deployed site, use relative /api (Netlify proxy)
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return "/api";
  }
  // Local development fallback
  return "http://localhost:4000/api";
}

const API_BASE = getApiBase();

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window === "undefined") return;
    if (token) {
      localStorage.setItem("fm_token", token);
    } else {
      localStorage.removeItem("fm_token");
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("fm_token");
    }
    return this.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    let res: Response;
    try {
      res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
      });
    } catch {
      throw new Error(
        "Impossible de contacter le serveur. Vérifiez votre connexion ou réessayez plus tard.",
      );
    }

    if (!res.ok) {
      // Try to parse JSON error body; if it's an HTML page (proxy/CDN error), fall through
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const body = await res.json().catch(() => null);
        if (body?.error) throw new Error(body.error);
      }

      switch (res.status) {
        case 401:
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        case 403:
          throw new Error("Accès refusé.");
        case 404:
          throw new Error(
            "Service indisponible (404). Le serveur backend n'est pas encore configuré ou la route est introuvable.",
          );
        case 429:
          throw new Error("Trop de requêtes. Veuillez patienter quelques instants.");
        case 502:
        case 503:
        case 504:
          throw new Error("Le serveur backend est temporairement indisponible. Réessayez dans quelques instants.");
        default:
          throw new Error(`Erreur serveur (${res.status}). Veuillez réessayer.`);
      }
    }

    return res.json();
  }

  // ── Auth ──
  async register(email: string, password: string, name?: string) {
    const data = await this.request<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async me() {
    return this.request<{ user: User }>("/auth/me");
  }

  logout() {
    this.setToken(null);
  }

  async updateProfile(data: { name?: string; email?: string }) {
    return this.request<{ user: User }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>("/auth/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // ── Projects ──
  async listProjects(page = 1, limit = 20) {
    return this.request<{ projects: Project[]; total: number; page: number; limit: number }>(
      `/projects?page=${page}&limit=${limit}`,
    );
  }

  async getProject(id: string) {
    return this.request<{ project: Project }>(`/projects/${encodeURIComponent(id)}`);
  }

  async createProject(data: { title: string; script: string; aspectRatio?: string; template?: string }) {
    return this.request<{ project: Project }>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: Partial<Pick<Project, "title" | "script" | "aspectRatio" | "brandConfig">>) {
    return this.request<{ project: Project }>(`/projects/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string) {
    return this.request<{ message: string }>(`/projects/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  async duplicateProject(id: string) {
    return this.request<{ project: Project }>(`/projects/${encodeURIComponent(id)}/duplicate`, {
      method: "POST",
    });
  }

  // ── Storyboard ──
  async generateStoryboard(projectId: string) {
    return this.request<{ storyboard: Storyboard }>(`/projects/${encodeURIComponent(projectId)}/generate-storyboard`, {
      method: "POST",
    });
  }

  async updateStoryboard(projectId: string, storyboard: Storyboard) {
    return this.request<{ message: string }>(`/projects/${encodeURIComponent(projectId)}/storyboard`, {
      method: "PUT",
      body: JSON.stringify({ storyboard }),
    });
  }

  // ── Render ──
  async startRender(projectId: string) {
    return this.request<{ renderJob: RenderJob }>(`/projects/${encodeURIComponent(projectId)}/render`, {
      method: "POST",
    });
  }

  async getRenderStatus(projectId: string, jobId: string) {
    return this.request<{ renderJob: RenderJob }>(
      `/projects/${encodeURIComponent(projectId)}/render/${encodeURIComponent(jobId)}`,
    );
  }

  // ── Assets ──
  async uploadAssets(projectId: string, files: File[]) {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    return this.request<{ assets: Asset[] }>(`/projects/${encodeURIComponent(projectId)}/assets`, {
      method: "POST",
      body: formData,
    });
  }

  async listAssets(projectId: string) {
    return this.request<{ assets: Asset[] }>(`/projects/${encodeURIComponent(projectId)}/assets`);
  }

  async deleteAsset(projectId: string, assetId: string) {
    return this.request<{ message: string }>(
      `/projects/${encodeURIComponent(projectId)}/assets/${encodeURIComponent(assetId)}`,
      { method: "DELETE" },
    );
  }
}

export const api = new ApiClient();

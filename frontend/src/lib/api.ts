import type { User, Project, Asset, Storyboard, RenderJob } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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

    // Set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(body.error || `Request failed: ${res.status}`);
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

  // ── Projects ──
  async listProjects(page = 1, limit = 20) {
    return this.request<{ projects: Project[]; total: number; page: number; limit: number }>(
      `/projects?page=${page}&limit=${limit}`,
    );
  }

  async getProject(id: string) {
    return this.request<{ project: Project }>(`/projects/${encodeURIComponent(id)}`);
  }

  async createProject(data: { title: string; script: string; aspectRatio?: string }) {
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

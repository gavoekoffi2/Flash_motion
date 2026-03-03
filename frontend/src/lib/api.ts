const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      if (typeof window !== "undefined") localStorage.setItem("fm_token", token);
    } else {
      if (typeof window !== "undefined") localStorage.removeItem("fm_token");
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
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
      delete headers["Content-Type"];
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

  // Auth
  async register(email: string, password: string, name?: string) {
    const data = await this.request<{ token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async me() {
    return this.request<{ user: any }>("/auth/me");
  }

  logout() {
    this.setToken(null);
  }

  // Projects
  async listProjects() {
    return this.request<{ projects: any[] }>("/projects");
  }

  async getProject(id: string) {
    return this.request<{ project: any }>(`/projects/${id}`);
  }

  async createProject(data: { title: string; script: string; aspectRatio?: string }) {
    return this.request<{ project: any }>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: any) {
    return this.request<{ project: any }>(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string) {
    return this.request<{ message: string }>(`/projects/${id}`, { method: "DELETE" });
  }

  async generateStoryboard(projectId: string) {
    return this.request<{ storyboard: any }>(`/projects/${projectId}/generate-storyboard`, {
      method: "POST",
    });
  }

  async updateStoryboard(projectId: string, storyboard: any) {
    return this.request<{ message: string }>(`/projects/${projectId}/storyboard`, {
      method: "PUT",
      body: JSON.stringify({ storyboard }),
    });
  }

  async startRender(projectId: string) {
    return this.request<{ renderJob: any }>(`/projects/${projectId}/render`, {
      method: "POST",
    });
  }

  async getRenderStatus(projectId: string, jobId: string) {
    return this.request<{ renderJob: any }>(`/projects/${projectId}/render/${jobId}`);
  }

  // Assets
  async uploadAssets(projectId: string, files: File[]) {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    return this.request<{ assets: any[] }>(`/projects/${projectId}/assets`, {
      method: "POST",
      body: formData,
    });
  }

  async listAssets(projectId: string) {
    return this.request<{ assets: any[] }>(`/projects/${projectId}/assets`);
  }

  async deleteAsset(projectId: string, assetId: string) {
    return this.request<{ message: string }>(`/projects/${projectId}/assets/${assetId}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();

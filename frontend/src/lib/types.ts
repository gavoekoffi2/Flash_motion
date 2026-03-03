// ── Shared types mirroring backend models ──

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  plan: "FREE" | "PRO" | "ENTERPRISE";
  createdAt?: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  script: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  status: ProjectStatus;
  storyboard: Storyboard | null;
  brandConfig: BrandConfig | null;
  createdAt: string;
  updatedAt: string;
  assets?: Asset[];
  renderJobs?: RenderJob[];
  _count?: { assets: number; renderJobs: number };
}

export type ProjectStatus = "DRAFT" | "STORYBOARD_READY" | "RENDERING" | "DONE" | "FAILED";

export interface BrandConfig {
  primary_color?: string;
  logo_id?: string | null;
}

export interface Asset {
  id: string;
  projectId: string;
  type: "IMAGE" | "LOGO" | "AUDIO" | "FONT";
  filename: string;
  mimeType: string;
  sizeMb: number;
  s3Key: string;
  previewUrl?: string | null;
  createdAt: string;
}

export interface SceneAsset {
  type: string;
  id: string;
  placement: "center" | "left" | "right" | "background";
  scale: "cover" | "contain" | "fill";
}

export interface StoryboardScene {
  id: number;
  duration_s: number;
  type: "hero" | "carousel" | "feature_list" | "demo" | "outro";
  text: string;
  assets: SceneAsset[];
  animation: string;
  audio_clip: string | null;
  tts_instruction: string | null;
}

export interface Storyboard {
  project_title: string;
  aspect_ratio: "9:16" | "16:9" | "1:1";
  scenes: StoryboardScene[];
  brand: { primary_color: string; logo_id: string | null };
  caption_short?: string;
}

export type RenderStatus = "QUEUED" | "RENDERING" | "UPLOADING" | "DONE" | "FAILED";

export interface RenderJob {
  id: string;
  projectId: string;
  status: RenderStatus;
  engine: string;
  outputKey: string | null;
  error: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  downloadUrl?: string | null;
}

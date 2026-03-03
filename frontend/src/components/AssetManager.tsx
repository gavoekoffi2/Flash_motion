"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface Asset {
  id: string;
  type: string;
  filename: string;
  mimeType: string;
  sizeMb: number;
  previewUrl?: string;
}

interface Props {
  projectId: string;
  assets: Asset[];
  onChanged: () => void;
}

export default function AssetManager({ projectId, assets, onChanged }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(assetId: string) {
    if (!confirm("Supprimer cet asset ?")) return;
    setDeleting(assetId);
    try {
      await api.deleteAsset(projectId, assetId);
      onChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  }

  if (assets.length === 0) {
    return <p className="text-sm text-gray-500">Aucun asset uploadé</p>;
  }

  const typeIcon: Record<string, string> = {
    IMAGE: "\uD83D\uDDBC\uFE0F",
    LOGO: "\u2B50",
    AUDIO: "\uD83C\uDFB5",
    FONT: "\uD83D\uDD24",
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {assets.map((asset) => (
        <div key={asset.id} className="bg-dark-900 border border-dark-700 rounded-lg p-3 group relative">
          {/* Preview */}
          <div className="aspect-square mb-2 rounded bg-dark-800 flex items-center justify-center overflow-hidden">
            {asset.type === "IMAGE" || asset.type === "LOGO" ? (
              asset.previewUrl ? (
                <img src={asset.previewUrl} alt={asset.filename} className="object-contain w-full h-full" />
              ) : (
                <span className="text-3xl">{typeIcon[asset.type]}</span>
              )
            ) : (
              <span className="text-3xl">{typeIcon[asset.type] || "\uD83D\uDCC1"}</span>
            )}
          </div>

          {/* Info */}
          <p className="text-xs truncate" title={asset.filename}>{asset.filename}</p>
          <p className="text-xs text-gray-500">{asset.sizeMb.toFixed(2)} MB</p>

          {/* ID for storyboard reference */}
          <p className="text-[10px] text-gray-600 font-mono mt-1 truncate" title={asset.id}>
            ID: {asset.id.slice(0, 8)}
          </p>

          {/* Delete */}
          <button
            onClick={() => handleDelete(asset.id)}
            disabled={deleting === asset.id}
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-900/80 text-red-300 text-xs px-2 py-0.5 rounded transition-opacity"
          >
            {deleting === asset.id ? "..." : "\u2715"}
          </button>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { api } from "@/lib/api";

interface Props {
  projectId: string;
  onUploaded: () => void;
}

const ACCEPTED = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
  "image/svg+xml": [".svg"],
  "audio/mpeg": [".mp3"],
  "audio/wav": [".wav"],
  "font/woff": [".woff"],
  "font/woff2": [".woff2"],
  "application/x-font-ttf": [".ttf"],
};

export default function AssetUploader({ projectId, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setError("");
    setUploading(true);
    try {
      await api.uploadAssets(projectId, files);
      onUploaded();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }, [projectId, onUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: 8 * 1024 * 1024,
    maxFiles: 10,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-brand-500 bg-brand-500/5" : "border-dark-700 hover:border-gray-500"
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p className="text-brand-400">Upload en cours...</p>
        ) : isDragActive ? (
          <p className="text-brand-400">Déposez les fichiers ici...</p>
        ) : (
          <div>
            <p className="text-gray-400 mb-1">Glissez-déposez vos fichiers ici</p>
            <p className="text-xs text-gray-500">
              Images (PNG, JPG, WebP), Logo (SVG), Audio (MP3, WAV), Fonts (WOFF, TTF) — Max 8 MB
            </p>
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}

"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { api } from "@/lib/api";

interface Props {
  projectId: string;
  onUploaded: () => void;
}

interface FilePreview {
  file: File;
  preview: string | null;
}

// SVG excluded — can contain embedded JavaScript (XSS risk), rejected by backend
const ACCEPTED = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
  "audio/mpeg": [".mp3"],
  "audio/wav": [".wav"],
  "font/woff": [".woff"],
  "font/woff2": [".woff2"],
  "application/x-font-ttf": [".ttf"],
};

export default function AssetUploader({ projectId, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [pendingFiles, setPendingFiles] = useState<FilePreview[]>([]);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((files: File[]) => {
    const previews = files.map((file) => ({
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setPendingFiles((prev) => [...prev, ...previews]);
  }, []);

  async function handleUpload() {
    if (pendingFiles.length === 0) return;
    setError("");
    setUploading(true);
    setProgress(0);
    try {
      const files = pendingFiles.map((f) => f.file);
      await api.uploadAssets(projectId, files);
      // Cleanup preview URLs
      pendingFiles.forEach((f) => { if (f.preview) URL.revokeObjectURL(f.preview); });
      setPendingFiles([]);
      setProgress(100);
      onUploaded();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function removeFile(index: number) {
    setPendingFiles((prev) => {
      const removed = prev[index];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: 8 * 1024 * 1024,
    maxFiles: 10,
    disabled: uploading,
  });

  const totalSize = pendingFiles.reduce((sum, f) => sum + f.file.size, 0);

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          uploading ? "opacity-50 cursor-not-allowed" :
          isDragActive ? "border-brand-500 bg-brand-500/5" : "border-dark-700 hover:border-gray-500"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-brand-400">Déposez les fichiers ici...</p>
        ) : (
          <div>
            <div className="text-3xl mb-2 text-gray-500">+</div>
            <p className="text-gray-400 mb-1">Glissez-déposez vos fichiers ici ou cliquez pour parcourir</p>
            <p className="text-xs text-gray-500">
              Images (PNG, JPG, WebP), Audio (MP3, WAV), Fonts (WOFF, TTF) — Max 8 MB par fichier
            </p>
          </div>
        )}
      </div>

      {/* File preview list */}
      {pendingFiles.length > 0 && (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {pendingFiles.length} fichier{pendingFiles.length > 1 ? "s" : ""} — {(totalSize / (1024 * 1024)).toFixed(2)} MB
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  pendingFiles.forEach((f) => { if (f.preview) URL.revokeObjectURL(f.preview); });
                  setPendingFiles([]);
                }}
                className="text-xs text-gray-400 hover:text-white"
              >
                Tout retirer
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm transition-colors"
              >
                {uploading ? "Upload..." : "Uploader"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {pendingFiles.map((fp, idx) => (
              <div key={idx} className="bg-dark-900 border border-dark-700 rounded-lg p-2 relative group">
                <div className="aspect-square rounded bg-dark-800 flex items-center justify-center overflow-hidden mb-1">
                  {fp.preview ? (
                    <img src={fp.preview} alt="" className="object-contain w-full h-full" />
                  ) : (
                    <span className="text-2xl text-gray-500">
                      {fp.file.type.startsWith("audio/") ? "\uD83C\uDFB5" : "\uD83D\uDD24"}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 truncate">{fp.file.name}</p>
                <p className="text-[10px] text-gray-600">{(fp.file.size / 1024).toFixed(0)} KB</p>
                <button
                  onClick={() => removeFile(idx)}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-900/80 text-red-300 text-xs w-5 h-5 rounded-full flex items-center justify-center transition-opacity"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          {uploading && (
            <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full animate-pulse-bar" />
            </div>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}

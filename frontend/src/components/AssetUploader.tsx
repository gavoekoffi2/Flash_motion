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

interface UploadProgress {
  fileName: string;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export default function AssetUploader({ projectId, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  const onDrop = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      setError("");
      setUploading(true);
      setUploadProgress(files.map((f) => ({ fileName: f.name, status: "pending" })));

      let successCount = 0;

      // Upload files one at a time to track per-file status
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress((prev) => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: "uploading" };
          return updated;
        });

        try {
          await api.uploadAssets(projectId, [file]);
          successCount++;
          setUploadProgress((prev) => {
            const updated = [...prev];
            updated[i] = { ...updated[i], status: "success" };
            return updated;
          });
        } catch (err: any) {
          setUploadProgress((prev) => {
            const updated = [...prev];
            updated[i] = {
              ...updated[i],
              status: "error",
              error: err.message || "Erreur lors de l'upload",
            };
            return updated;
          });
        }
      }

      setUploading(false);

      // Notify parent if at least one file uploaded successfully
      if (successCount > 0) {
        onUploaded();
        setTimeout(() => setUploadProgress([]), 2000);
      }
    },
    [projectId, onUploaded],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: 8 * 1024 * 1024,
    maxFiles: 10,
    disabled: uploading,
  });

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-brand-500 bg-brand-500/10 scale-105"
            : "border-dark-700 hover:border-gray-500 hover:bg-dark-800/50"
        } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="space-y-2">
            <p className="text-brand-400 font-medium">Upload en cours...</p>
            <p className="text-xs text-gray-500">
              {uploadProgress.filter((p) => p.status === "success").length} /{" "}
              {uploadProgress.length} fichiers
            </p>
          </div>
        ) : isDragActive ? (
          <div className="space-y-2">
            <p className="text-brand-400 font-medium">Déposez les fichiers ici</p>
            <p className="text-xs text-gray-500">Ils seront ajoutés à votre projet</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-4xl">📁</div>
            <div>
              <p className="text-gray-300 font-medium mb-1">
                Glissez-déposez vos fichiers ici
              </p>
              <p className="text-xs text-gray-500 mb-3">ou cliquez pour sélectionner</p>
            </div>
            <p className="text-xs text-gray-600 border-t border-dark-700 pt-3">
              Images (PNG, JPG, WebP, SVG) • Audio (MP3, WAV) • Fonts (WOFF, TTF)
              <br />
              Max 8 MB par fichier • 10 fichiers max
            </p>
          </div>
        )}
      </div>

      {/* Progress List */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2 bg-dark-900 rounded-lg p-4 border border-dark-700">
          {uploadProgress.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-gray-300 truncate flex-1 mr-3">{item.fileName}</span>
              <span
                className={`text-xs font-medium shrink-0 ${
                  item.status === "success"
                    ? "text-green-400"
                    : item.status === "error"
                      ? "text-red-400"
                      : item.status === "uploading"
                        ? "text-brand-400"
                        : "text-gray-500"
                }`}
              >
                {item.status === "success"
                  ? "✓ OK"
                  : item.status === "error"
                    ? "✗ Erreur"
                    : item.status === "uploading"
                      ? "En cours..."
                      : "En attente"}
              </span>
              {item.error && (
                <p className="text-xs text-red-400 w-full mt-1">{item.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

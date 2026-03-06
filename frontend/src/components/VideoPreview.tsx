"use client";
import { useState, useEffect } from "react";
import { Storyboard } from "@/lib/types";

interface Props {
  storyboard: Storyboard | null;
  isLoading?: boolean;
}

export default function VideoPreview({ storyboard, isLoading }: Props) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying || !storyboard) return;

    const currentScene = storyboard.scenes[currentSceneIndex];
    const timer = setTimeout(() => {
      if (currentSceneIndex < storyboard.scenes.length - 1) {
        setCurrentSceneIndex(currentSceneIndex + 1);
      } else {
        setIsPlaying(false);
      }
    }, (currentScene?.duration_s || 3) * 1000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentSceneIndex, storyboard]);

  if (!storyboard) {
    return (
      <div className="bg-dark-900 rounded-lg border border-dark-700 p-8 text-center">
        <p className="text-gray-500">
          Générez un storyboard pour voir un aperçu de votre vidéo
        </p>
      </div>
    );
  }

  const currentScene = storyboard.scenes[currentSceneIndex];
  const progress = ((currentSceneIndex + 1) / storyboard.scenes.length) * 100;

  return (
    <div className="space-y-4">
      {/* Preview Area */}
      <div
        className="bg-gradient-to-br rounded-lg overflow-hidden aspect-video flex items-center justify-center relative"
        style={{
          backgroundImage: `linear-gradient(135deg, ${storyboard.brand.primary_color}dd 0%, ${storyboard.brand.primary_color} 100%)`,
        }}
      >
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Génération du storyboard...</p>
          </div>
        ) : (
          <div className="text-center text-white px-8">
            <h2 className="text-4xl font-bold mb-4">{currentScene.text}</h2>
            <p className="text-sm text-white/70">
              Scène {currentSceneIndex + 1} / {storyboard.scenes.length}
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-3 bg-dark-900 rounded-lg p-4 border border-dark-700">
        {/* Progress Bar */}
        <div className="w-full bg-dark-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-brand-500 h-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentSceneIndex(Math.max(0, currentSceneIndex - 1))}
              disabled={currentSceneIndex === 0}
              className="px-3 py-2 bg-dark-800 hover:bg-dark-700 disabled:opacity-50 rounded-lg text-sm transition-colors"
            >
              ← Précédent
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isPlaying ? "⏸ Pause" : "▶ Lire"}
            </button>

            <button
              onClick={() => setCurrentSceneIndex(Math.min(storyboard.scenes.length - 1, currentSceneIndex + 1))}
              disabled={currentSceneIndex === storyboard.scenes.length - 1}
              className="px-3 py-2 bg-dark-800 hover:bg-dark-700 disabled:opacity-50 rounded-lg text-sm transition-colors"
            >
              Suivant →
            </button>
          </div>

          <span className="text-xs text-gray-500">
            {currentSceneIndex + 1} / {storyboard.scenes.length}
          </span>
        </div>

        {/* Scene Info */}
        <div className="text-xs text-gray-400 space-y-1 border-t border-dark-700 pt-3">
          <p>
            <strong>Type:</strong> {currentScene.type}
          </p>
          <p>
            <strong>Durée:</strong> {currentScene.duration_s}s
          </p>
          <p>
            <strong>Animation:</strong> {currentScene.animation}
          </p>
          {currentScene.assets?.length > 0 && (
            <p>
              <strong>Assets:</strong> {currentScene.assets.length} fichier(s)
            </p>
          )}
        </div>
      </div>

      {/* Scene Thumbnails */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-400">Scènes</p>
        <div className="grid grid-cols-4 gap-2">
          {storyboard.scenes.map((scene, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentSceneIndex(idx);
                setIsPlaying(false);
              }}
              className={`aspect-video rounded-lg text-xs font-medium transition-all ${
                idx === currentSceneIndex
                  ? "ring-2 ring-brand-500 bg-brand-500/20"
                  : "bg-dark-800 hover:bg-dark-700"
              }`}
              style={{
                backgroundColor: idx === currentSceneIndex ? `${storyboard.brand.primary_color}33` : undefined,
              }}
            >
              <div className="flex flex-col items-center justify-center h-full text-white">
                <span className="text-lg">#{idx + 1}</span>
                <span className="text-xs opacity-70">{scene.duration_s}s</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

interface Scene {
  id: number;
  duration_s: number;
  type: string;
  text: string;
  assets: { type: string; id: string; placement: string; scale: string }[];
  animation: string;
  audio_clip: string | null;
  tts_instruction: string | null;
}

interface Storyboard {
  project_title: string;
  aspect_ratio: string;
  scenes: Scene[];
  brand: { primary_color: string; logo_id: string | null };
  caption_short: string;
}

interface Props {
  storyboard: Storyboard;
  onSave: (storyboard: Storyboard) => void;
  saving: boolean;
}

export default function StoryboardEditor({ storyboard, onSave, saving }: Props) {
  const [data, setData] = useState<Storyboard>(storyboard);

  function updateScene(index: number, field: keyof Scene, value: any) {
    const updated = { ...data };
    updated.scenes = [...updated.scenes];
    updated.scenes[index] = { ...updated.scenes[index], [field]: value };
    setData(updated);
  }

  function moveScene(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= data.scenes.length) return;
    const updated = { ...data, scenes: [...data.scenes] };
    [updated.scenes[index], updated.scenes[newIndex]] = [updated.scenes[newIndex], updated.scenes[index]];
    // Re-number IDs
    updated.scenes = updated.scenes.map((s, i) => ({ ...s, id: i + 1 }));
    setData(updated);
  }

  function deleteScene(index: number) {
    if (data.scenes.length <= 1) return;
    const updated = { ...data };
    updated.scenes = data.scenes.filter((_, i) => i !== index).map((s, i) => ({ ...s, id: i + 1 }));
    setData(updated);
  }

  const totalDuration = data.scenes.reduce((sum, s) => sum + s.duration_s, 0);

  const animationOptions = ["fade_in_up", "slide_left", "zoom_in", "bounce", "scale_up", "fade_out"];
  const typeOptions = ["hero", "carousel", "feature_list", "demo", "outro"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Storyboard — {data.scenes.length} scènes</h3>
          <p className="text-sm text-gray-400">Durée totale : {totalDuration}s</p>
        </div>
        <button
          onClick={() => onSave(data)}
          disabled={saving}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </div>

      {/* Scenes */}
      {data.scenes.map((scene, idx) => (
        <div key={scene.id} className="bg-dark-900 border border-dark-700 rounded-lg p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-dark-700 px-2 py-0.5 rounded font-mono">#{scene.id}</span>
              <select
                value={scene.type}
                onChange={(e) => updateScene(idx, "type", e.target.value)}
                className="bg-dark-800 border border-dark-700 rounded px-2 py-1 text-sm"
              >
                {typeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input
                type="number"
                value={scene.duration_s}
                onChange={(e) => updateScene(idx, "duration_s", parseInt(e.target.value) || 1)}
                min={1}
                max={30}
                className="bg-dark-800 border border-dark-700 rounded px-2 py-1 text-sm w-16"
              />
              <span className="text-xs text-gray-500">sec</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => moveScene(idx, -1)} disabled={idx === 0} className="text-gray-500 hover:text-white disabled:opacity-30 px-1">&uarr;</button>
              <button onClick={() => moveScene(idx, 1)} disabled={idx === data.scenes.length - 1} className="text-gray-500 hover:text-white disabled:opacity-30 px-1">&darr;</button>
              <button onClick={() => deleteScene(idx)} disabled={data.scenes.length <= 1} className="text-red-500 hover:text-red-400 disabled:opacity-30 px-1 ml-2">&times;</button>
            </div>
          </div>

          <textarea
            value={scene.text}
            onChange={(e) => updateScene(idx, "text", e.target.value)}
            rows={2}
            maxLength={180}
            className="w-full bg-dark-800 border border-dark-700 rounded px-3 py-2 text-sm resize-none"
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{scene.text.length}/180 caractères</span>
            <select
              value={scene.animation}
              onChange={(e) => updateScene(idx, "animation", e.target.value)}
              className="bg-dark-800 border border-dark-700 rounded px-2 py-1"
            >
              {animationOptions.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {scene.assets.length > 0 && (
            <div className="text-xs text-gray-500">
              Assets: {scene.assets.map((a) => `${a.id.slice(0, 8)} (${a.placement})`).join(", ")}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

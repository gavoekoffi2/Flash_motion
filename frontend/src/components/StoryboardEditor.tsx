"use client";

import { useState, useEffect } from "react";

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

interface Asset {
  id: string;
  type: string;
  filename: string;
  previewUrl?: string;
}

interface Props {
  storyboard: Storyboard;
  assets?: Asset[];
  onSave: (storyboard: Storyboard) => void;
  saving: boolean;
}

export default function StoryboardEditor({ storyboard, assets = [], onSave, saving }: Props) {
  const [data, setData] = useState<Storyboard>(storyboard);
  // Re-sync when parent passes a new storyboard (e.g. after AI regeneration)
  useEffect(() => { setData(storyboard); }, [storyboard]);
  const [expandedScene, setExpandedScene] = useState<number | null>(null);
  const [showAssetPicker, setShowAssetPicker] = useState<number | null>(null);

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
    updated.scenes = updated.scenes.map((s, i) => ({ ...s, id: i + 1 }));
    setData(updated);
  }

  function deleteScene(index: number) {
    if (data.scenes.length <= 1) return;
    const updated = { ...data };
    updated.scenes = data.scenes.filter((_, i) => i !== index).map((s, i) => ({ ...s, id: i + 1 }));
    setData(updated);
  }

  function addScene() {
    const newScene: Scene = {
      id: data.scenes.length + 1,
      duration_s: 3,
      type: "feature_list",
      text: "Nouveau texte ici.",
      assets: [],
      animation: "kinetic_typography",
      audio_clip: null,
      tts_instruction: null,
    };
    setData({ ...data, scenes: [...data.scenes, newScene] });
  }

  function addAssetToScene(sceneIndex: number, asset: Asset) {
    const sceneAsset = {
      type: asset.type.toLowerCase(),
      id: asset.id,
      placement: "center" as const,
      scale: "contain" as const,
    };
    const updated = { ...data, scenes: [...data.scenes] };
    updated.scenes[sceneIndex] = {
      ...updated.scenes[sceneIndex],
      assets: [...updated.scenes[sceneIndex].assets, sceneAsset],
    };
    setData(updated);
    setShowAssetPicker(null);
  }

  function removeAssetFromScene(sceneIndex: number, assetIndex: number) {
    const updated = { ...data, scenes: [...data.scenes] };
    updated.scenes[sceneIndex] = {
      ...updated.scenes[sceneIndex],
      assets: updated.scenes[sceneIndex].assets.filter((_, i) => i !== assetIndex),
    };
    setData(updated);
  }

  const totalDuration = data.scenes.reduce((sum, s) => sum + s.duration_s, 0);

  const animationOptions = [
    "kinetic_typography",
    "cinematic_zoom",
    "parallax_pan",
    "mask_reveal",
    "spring_pop",
    "perspective_tilt",
    "float_hover",
    "glow_pulse",
    "shimmer_sweep",
    "word_stagger",
    "particle_drift",
    "fade_in_up",
    "slide_left",
    "slide_right",
    "zoom_in",
    "bounce",
    "scale_up",
    "fade_out",
  ];
  const typeOptions = ["hero", "carousel", "feature_list", "demo", "outro"];
  const placementOptions = ["center", "left", "right", "background"];
  const scaleOptions = ["cover", "contain", "fill"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Storyboard — {data.scenes.length} scènes</h3>
          <p className="text-sm text-gray-400">Durée totale : {totalDuration}s</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={addScene}
            className="bg-dark-700 hover:bg-dark-900 text-gray-300 px-3 py-2 rounded-lg text-sm transition-colors"
          >
            + Ajouter scène
          </button>
          <button
            onClick={() => onSave(data)}
            disabled={saving}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>

      {/* Timeline bar */}
      <div className="flex rounded-lg overflow-hidden h-3 bg-dark-700">
        {data.scenes.map((scene, idx) => {
          const widthPct = totalDuration > 0 ? (scene.duration_s / totalDuration) * 100 : 0;
          const colors: Record<string, string> = {
            hero: "bg-brand-500",
            carousel: "bg-blue-500",
            feature_list: "bg-green-500",
            demo: "bg-purple-500",
            outro: "bg-yellow-500",
          };
          return (
            <div
              key={scene.id}
              className={`${colors[scene.type] || "bg-gray-500"} h-full border-r border-dark-900 cursor-pointer hover:opacity-80 transition-opacity`}
              style={{ width: `${widthPct}%` }}
              title={`#${scene.id} ${scene.type} (${scene.duration_s}s)`}
              onClick={() => setExpandedScene(expandedScene === idx ? null : idx)}
            />
          );
        })}
      </div>

      {/* Brand color */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-400">Couleur principale :</span>
        <input
          type="color"
          value={data.brand.primary_color}
          onChange={(e) => setData({ ...data, brand: { ...data.brand, primary_color: e.target.value } })}
          className="w-8 h-8 rounded border border-dark-700 cursor-pointer"
        />
        <span className="font-mono text-xs text-gray-500">{data.brand.primary_color}</span>
      </div>

      {/* Scenes */}
      {data.scenes.map((scene, idx) => (
        <div
          key={scene.id}
          className={`bg-dark-900 border rounded-lg overflow-hidden animate-fade-in transition-colors ${
            expandedScene === idx ? "border-brand-500/50" : "border-dark-700"
          }`}
        >
          {/* Compact header */}
          <div
            className="p-4 cursor-pointer flex items-center justify-between"
            onClick={() => setExpandedScene(expandedScene === idx ? null : idx)}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs bg-dark-700 px-2 py-0.5 rounded font-mono">#{scene.id}</span>
              <span className="text-xs text-gray-400 bg-dark-800 px-2 py-0.5 rounded">{scene.type}</span>
              <span className="text-xs text-gray-500">{scene.duration_s}s</span>
              <span className="text-xs text-gray-500">{scene.animation}</span>
              <span className="text-sm text-gray-300 truncate max-w-[150px] sm:max-w-[300px]">{scene.text}</span>
            </div>
            <div className="flex items-center gap-1">
              {scene.assets.length > 0 && (
                <span className="text-xs text-gray-500 mr-2">{scene.assets.length} assets</span>
              )}
              <button onClick={(e) => { e.stopPropagation(); moveScene(idx, -1); }} disabled={idx === 0} className="text-gray-500 hover:text-white disabled:opacity-30 px-1">&uarr;</button>
              <button onClick={(e) => { e.stopPropagation(); moveScene(idx, 1); }} disabled={idx === data.scenes.length - 1} className="text-gray-500 hover:text-white disabled:opacity-30 px-1">&darr;</button>
              <button onClick={(e) => { e.stopPropagation(); deleteScene(idx); }} disabled={data.scenes.length <= 1} className="text-red-500 hover:text-red-400 disabled:opacity-30 px-1 ml-2">&times;</button>
            </div>
          </div>

          {/* Expanded details */}
          {expandedScene === idx && (
            <div className="px-4 pb-4 space-y-3 border-t border-dark-700 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                  <select
                    value={scene.type}
                    onChange={(e) => updateScene(idx, "type", e.target.value)}
                    className="w-full bg-dark-800 border border-dark-700 rounded px-2 py-1.5 text-sm"
                  >
                    {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Durée (s)</label>
                  <input
                    type="number"
                    value={scene.duration_s}
                    onChange={(e) => updateScene(idx, "duration_s", parseInt(e.target.value) || 1)}
                    min={1}
                    max={30}
                    className="w-full bg-dark-800 border border-dark-700 rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Animation</label>
                  <select
                    value={scene.animation}
                    onChange={(e) => updateScene(idx, "animation", e.target.value)}
                    className="w-full bg-dark-800 border border-dark-700 rounded px-2 py-1.5 text-sm"
                  >
                    {animationOptions.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Texte</label>
                <textarea
                  value={scene.text}
                  onChange={(e) => updateScene(idx, "text", e.target.value)}
                  rows={2}
                  maxLength={250}
                  className="w-full bg-dark-800 border border-dark-700 rounded px-3 py-2 text-sm resize-none"
                />
                <span className="text-xs text-gray-600">{scene.text.length}/250</span>
              </div>

              {/* Assets section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-500">Assets de la scène</label>
                  {assets.length > 0 && (
                    <button
                      onClick={() => setShowAssetPicker(showAssetPicker === idx ? null : idx)}
                      className="text-xs text-brand-400 hover:text-brand-300"
                    >
                      + Ajouter asset
                    </button>
                  )}
                </div>

                {scene.assets.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {scene.assets.map((a, ai) => (
                      <div key={ai} className="flex items-center gap-1 bg-dark-800 border border-dark-700 rounded px-2 py-1 text-xs">
                        <span className="text-gray-400">{a.id.slice(0, 8)}</span>
                        <select
                          value={a.placement}
                          onChange={(e) => {
                            const updated = { ...data, scenes: [...data.scenes] };
                            updated.scenes[idx].assets[ai] = { ...a, placement: e.target.value };
                            setData(updated);
                          }}
                          className="bg-dark-900 border-none text-xs px-1"
                        >
                          {placementOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <select
                          value={a.scale}
                          onChange={(e) => {
                            const updated = { ...data, scenes: [...data.scenes] };
                            updated.scenes[idx].assets[ai] = { ...a, scale: e.target.value };
                            setData(updated);
                          }}
                          className="bg-dark-900 border-none text-xs px-1"
                        >
                          {scaleOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={() => removeAssetFromScene(idx, ai)} className="text-red-400 hover:text-red-300 ml-1">&times;</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Asset picker dropdown */}
                {showAssetPicker === idx && (
                  <div className="bg-dark-800 border border-dark-700 rounded-lg p-2 max-h-48 overflow-y-auto">
                    {assets.filter((a) => a.type === "IMAGE" || a.type === "LOGO").map((asset) => (
                      <button
                        key={asset.id}
                        onClick={() => addAssetToScene(idx, asset)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-dark-700 text-left text-sm"
                      >
                        {asset.previewUrl && (
                          <img src={asset.previewUrl} alt="" className="w-8 h-8 rounded object-cover" />
                        )}
                        <span className="text-gray-300 truncate">{asset.filename}</span>
                        <span className="text-xs text-gray-500 ml-auto">{asset.type}</span>
                      </button>
                    ))}
                    {assets.filter((a) => a.type === "IMAGE" || a.type === "LOGO").length === 0 && (
                      <p className="text-xs text-gray-500 p-2">Aucun asset image disponible</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

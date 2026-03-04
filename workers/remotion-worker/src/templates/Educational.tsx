import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
} from "remotion";

export interface EducationalProps {
  scenes: any[];
  brand: { primary_color: string; logo_id: string | null };
  assetUrls: Record<string, string>;
}

function SafeImg({ src, style }: { src: string | null | undefined; style: React.CSSProperties }) {
  if (!src) return null;
  return <Img src={src} style={style} />;
}

function EducationalScene({ scene, brand, assetUrls, fps, sceneIndex, totalScenes }: {
  scene: any; brand: any; assetUrls: Record<string, string>; fps: number; sceneIndex: number; totalScenes: number;
}) {
  const frame = useCurrentFrame();
  const bgColor = brand.primary_color || "#1e3a5f";
  const accentLight = "#4FC3F7";
  const primaryAsset = scene.assets?.[0];
  const imageUrl = primaryAsset?.url || (primaryAsset?.id ? assetUrls[primaryAsset.id] : null) || null;

  const fadeIn = interpolate(frame, [0, fps * 0.4], [0, 1], { extrapolateRight: "clamp" });
  const slideUp = interpolate(frame, [0, fps * 0.5], [25, 0], { extrapolateRight: "clamp" });

  // Intro / title
  if (scene.type === "hero") {
    return (
      <AbsoluteFill style={{ backgroundColor: bgColor, justifyContent: "center", alignItems: "center", padding: 50 }}>
        {/* Step indicator */}
        <div style={{ position: "absolute", top: 50, left: 50, right: 50, display: "flex", gap: 8 }}>
          {Array.from({ length: totalScenes }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              backgroundColor: i <= sceneIndex ? accentLight : "rgba(255,255,255,0.15)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
        <div style={{ opacity: fadeIn, transform: `translateY(${slideUp}px)`, textAlign: "center", maxWidth: "85%" }}>
          {imageUrl && (
            <div style={{ width: 120, height: 120, margin: "0 auto 30px", borderRadius: 20, overflow: "hidden", border: `3px solid ${accentLight}33` }}>
              <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <p style={{ fontSize: 46, fontWeight: 800, color: "#fff", lineHeight: 1.2, margin: 0 }}>
            {scene.text}
          </p>
        </div>
      </AbsoluteFill>
    );
  }

  // Step / feature — numbered steps
  if (scene.type === "feature_list" || scene.type === "demo") {
    const stepBounce = spring({ frame, fps, config: { damping: 8, mass: 0.6 } });
    return (
      <AbsoluteFill style={{ backgroundColor: bgColor, padding: 50 }}>
        {/* Progress bar */}
        <div style={{ position: "absolute", top: 50, left: 50, right: 50, display: "flex", gap: 8 }}>
          {Array.from({ length: totalScenes }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              backgroundColor: i <= sceneIndex ? accentLight : "rgba(255,255,255,0.15)",
            }} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", paddingTop: 40 }}>
          {/* Step number */}
          <div style={{
            width: 70, height: 70, borderRadius: 35, backgroundColor: accentLight, display: "flex",
            alignItems: "center", justifyContent: "center", marginBottom: 25,
            transform: `scale(${interpolate(stepBounce, [0, 1], [0.3, 1])})`,
            fontSize: 32, fontWeight: 800, color: bgColor,
          }}>
            {sceneIndex + 1}
          </div>
          {/* Image */}
          {imageUrl && (
            <div style={{ width: "90%", marginBottom: 25, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", opacity: fadeIn }}>
              <SafeImg src={imageUrl} style={{ width: "100%", objectFit: "contain" }} />
            </div>
          )}
          {/* Text */}
          <div style={{ opacity: fadeIn, transform: `translateY(${slideUp}px)` }}>
            <p style={{ fontSize: 34, fontWeight: 600, color: "#fff", lineHeight: 1.4, margin: 0 }}>
              {scene.text}
            </p>
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // Outro / summary
  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, justifyContent: "center", alignItems: "center", padding: 50 }}>
      <div style={{ opacity: fadeIn, textAlign: "center" }}>
        {imageUrl && (
          <div style={{ width: 90, height: 90, margin: "0 auto 25px" }}>
            <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}
        <p style={{ fontSize: 40, fontWeight: 700, color: "#fff", lineHeight: 1.3, margin: "0 0 30px", maxWidth: "85%" }}>
          {scene.text}
        </p>
        <div style={{
          background: accentLight, color: bgColor, padding: "14px 40px", borderRadius: 50,
          fontSize: 22, fontWeight: 700, display: "inline-block",
          opacity: interpolate(frame, [fps * 0.6, fps * 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          En savoir plus
        </div>
      </div>
    </AbsoluteFill>
  );
}

export const Educational: React.FC<EducationalProps> = ({ scenes, brand, assetUrls }) => {
  const { fps } = useVideoConfig();
  let frameOffset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {scenes.map((scene, i) => {
        const durationFrames = scene.duration_s * fps;
        const from = frameOffset;
        frameOffset += durationFrames;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={durationFrames}>
            <EducationalScene scene={scene} brand={brand} assetUrls={assetUrls} fps={fps} sceneIndex={i} totalScenes={scenes.length} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export default Educational;

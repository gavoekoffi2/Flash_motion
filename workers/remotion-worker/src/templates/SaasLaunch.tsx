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

export interface SaasLaunchProps {
  scenes: any[];
  brand: { primary_color: string; logo_id: string | null };
  assetUrls: Record<string, string>;
}

function SafeImg({ src, style }: { src: string | null | undefined; style: React.CSSProperties }) {
  if (!src) return null;
  return <Img src={src} style={style} />;
}

function SaasScene({ scene, brand, assetUrls, fps }: { scene: any; brand: any; assetUrls: Record<string, string>; fps: number }) {
  const frame = useCurrentFrame();
  const bgColor = brand.primary_color || "#0f172a";
  const gradientEnd = "#6366f1";
  const primaryAsset = scene.assets?.[0];
  const imageUrl = primaryAsset?.url || (primaryAsset?.id ? assetUrls[primaryAsset.id] : null) || null;

  const fadeIn = interpolate(frame, [0, fps * 0.4], [0, 1], { extrapolateRight: "clamp" });
  const slideUp = interpolate(frame, [0, fps * 0.5], [30, 0], { extrapolateRight: "clamp" });
  const scaleSpring = spring({ frame, fps, config: { damping: 60 } });

  // Hero — big headline + gradient bg
  if (scene.type === "hero") {
    return (
      <AbsoluteFill style={{ background: `linear-gradient(135deg, ${bgColor} 0%, ${gradientEnd} 100%)` }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: 200, background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: 150, background: "rgba(255,255,255,0.03)" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", padding: 50, zIndex: 1 }}>
          {imageUrl && (
            <div style={{ width: 80, height: 80, marginBottom: 30, opacity: fadeIn, transform: `scale(${interpolate(scaleSpring, [0, 1], [0.5, 1])})` }}>
              <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          )}
          <div style={{ opacity: fadeIn, transform: `translateY(${slideUp}px)`, textAlign: "center" }}>
            <p style={{ fontSize: 50, fontWeight: 800, color: "#fff", lineHeight: 1.15, margin: 0, maxWidth: "90%" }}>
              {scene.text}
            </p>
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // Demo — app screenshot with device frame
  if (scene.type === "demo") {
    return (
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${bgColor} 0%, ${gradientEnd}33 100%)` }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", padding: 40 }}>
          {imageUrl && (
            <div style={{
              width: "88%", borderRadius: 16, overflow: "hidden",
              boxShadow: "0 30px 80px rgba(0,0,0,0.5)", border: "2px solid rgba(255,255,255,0.1)",
              marginBottom: 25, opacity: fadeIn,
              transform: `scale(${interpolate(scaleSpring, [0, 1], [0.9, 1])}) perspective(1000px) rotateX(${interpolate(frame, [0, fps * 0.6], [5, 0], { extrapolateRight: "clamp" })}deg)`,
            }}>
              <SafeImg src={imageUrl} style={{ width: "100%", objectFit: "contain" }} />
            </div>
          )}
          <p style={{ fontSize: 30, fontWeight: 600, color: "rgba(255,255,255,0.9)", textAlign: "center", margin: 0, opacity: fadeIn, transform: `translateY(${slideUp}px)` }}>
            {scene.text}
          </p>
        </div>
      </AbsoluteFill>
    );
  }

  // Feature list — icon + text cards
  if (scene.type === "feature_list") {
    const lines = scene.text.split(/[•·\n]+/).filter((l: string) => l.trim());
    return (
      <AbsoluteFill style={{ backgroundColor: bgColor, justifyContent: "center", padding: 50 }}>
        {imageUrl && (
          <div style={{ width: "45%", margin: "0 auto 30px", opacity: fadeIn }}>
            <SafeImg src={imageUrl} style={{ width: "100%", objectFit: "contain", borderRadius: 12 }} />
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {lines.map((line: string, i: number) => {
            const delay = i * fps * 0.15;
            const itemOpacity = interpolate(frame, [delay, delay + fps * 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const itemX = interpolate(frame, [delay, delay + fps * 0.4], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 16, opacity: itemOpacity,
                transform: `translateX(${itemX}px)`, padding: "12px 20px",
                backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, borderLeft: `3px solid ${gradientEnd}`,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: gradientEnd, flexShrink: 0 }} />
                <p style={{ fontSize: 26, fontWeight: 500, color: "#fff", margin: 0 }}>{line.trim()}</p>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }

  // Outro — CTA
  return (
    <AbsoluteFill style={{ background: `linear-gradient(135deg, ${bgColor} 0%, ${gradientEnd} 100%)`, justifyContent: "center", alignItems: "center" }}>
      <div style={{ opacity: fadeIn, textAlign: "center", padding: 50 }}>
        {imageUrl && (
          <div style={{ width: 70, height: 70, margin: "0 auto 25px" }}>
            <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}
        <p style={{ fontSize: 44, fontWeight: 800, color: "#fff", lineHeight: 1.2, margin: "0 0 35px" }}>
          {scene.text}
        </p>
        <div style={{
          background: "#fff", color: bgColor, padding: "16px 50px", borderRadius: 50,
          fontSize: 22, fontWeight: 700, display: "inline-block",
          transform: `scale(${interpolate(scaleSpring, [0, 1], [0.8, 1])})`,
        }}>
          Essai Gratuit
        </div>
      </div>
    </AbsoluteFill>
  );
}

export const SaasLaunch: React.FC<SaasLaunchProps> = ({ scenes, brand, assetUrls }) => {
  const { fps } = useVideoConfig();
  let frameOffset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {scenes.map((scene) => {
        const durationFrames = scene.duration_s * fps;
        const from = frameOffset;
        frameOffset += durationFrames;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={durationFrames}>
            <SaasScene scene={scene} brand={brand} assetUrls={assetUrls} fps={fps} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export default SaasLaunch;

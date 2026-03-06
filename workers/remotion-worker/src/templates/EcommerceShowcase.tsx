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

export interface EcommerceShowcaseProps {
  scenes: any[];
  brand: { primary_color: string; logo_id: string | null };
  assetUrls: Record<string, string>;
}

function SafeImg({ src, style }: { src: string | null | undefined; style: React.CSSProperties }) {
  if (!src) return null;
  return <Img src={src} style={style} />;
}

function EcommerceScene({ scene, brand, assetUrls, fps }: { scene: any; brand: any; assetUrls: Record<string, string>; fps: number }) {
  const frame = useCurrentFrame();
  const bgColor = brand.primary_color || "#0f0f0f";
  const accentColor = "#FF6B35";
  const primaryAsset = scene.assets?.[0];
  const imageUrl = primaryAsset?.url || (primaryAsset?.id ? assetUrls[primaryAsset.id] : null) || null;

  const fadeIn = interpolate(frame, [0, fps * 0.35], [0, 1], { extrapolateRight: "clamp" });
  const scaleIn = spring({ frame, fps, config: { damping: 50, stiffness: 100 } });

  // Hero — big product shot
  if (scene.type === "hero") {
    return (
      <AbsoluteFill style={{ backgroundColor: bgColor }}>
        {/* Gradient accent */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
          background: `linear-gradient(to top, ${accentColor}22, transparent)`,
        }} />
        {/* Product image */}
        {imageUrl && (
          <div style={{
            position: "absolute", top: "8%", left: "10%", right: "10%", height: "55%",
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: `scale(${interpolate(scaleIn, [0, 1], [0.85, 1])})`,
          }}>
            <SafeImg src={imageUrl} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.6))" }} />
          </div>
        )}
        <div style={{ position: "absolute", bottom: "8%", left: 0, right: 0, textAlign: "center", padding: "0 40px", opacity: fadeIn }}>
          <p style={{ fontSize: 44, fontWeight: 800, color: "#fff", lineHeight: 1.2, margin: 0 }}>
            {scene.text}
          </p>
        </div>
      </AbsoluteFill>
    );
  }

  // Carousel — product grid
  if (scene.type === "carousel") {
    return (
      <AbsoluteFill style={{ backgroundColor: bgColor, justifyContent: "center", alignItems: "center", padding: 40 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 30 }}>
          {scene.assets.map((asset: any, i: number) => {
            const url = asset.url || (asset.id ? assetUrls[asset.id] : null);
            const delay = i * fps * 0.15;
            const itemOpacity = interpolate(frame, [delay, delay + fps * 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const itemY = interpolate(frame, [delay, delay + fps * 0.4], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={asset.id || i} style={{
                width: "45%", aspectRatio: "1", borderRadius: 20, overflow: "hidden",
                backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                opacity: itemOpacity, transform: `translateY(${itemY}px)`,
              }}>
                {url ? <SafeImg src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: 30 }}>{i + 1}</div>}
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: 32, fontWeight: 700, color: "#fff", textAlign: "center", margin: 0, opacity: fadeIn }}>
          {scene.text}
        </p>
      </AbsoluteFill>
    );
  }

  // Feature — specs / price
  if (scene.type === "feature_list") {
    return (
      <AbsoluteFill style={{ backgroundColor: bgColor, justifyContent: "center", padding: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40, opacity: fadeIn }}>
          {imageUrl && (
            <div style={{ width: "40%", flexShrink: 0 }}>
              <SafeImg src={imageUrl} style={{ width: "100%", objectFit: "contain", borderRadius: 16 }} />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 34, fontWeight: 700, color: "#fff", lineHeight: 1.4, margin: 0 }}>
              {scene.text}
            </p>
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // Outro / CTA — price tag + buy button
  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, justifyContent: "center", alignItems: "center" }}>
      <div style={{ opacity: fadeIn, textAlign: "center", transform: `scale(${interpolate(scaleIn, [0, 1], [0.9, 1])})` }}>
        {imageUrl && (
          <div style={{ width: 80, height: 80, marginBottom: 20, margin: "0 auto 20px" }}>
            <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}
        <p style={{ fontSize: 42, fontWeight: 800, color: "#fff", lineHeight: 1.2, margin: "0 0 30px" }}>
          {scene.text}
        </p>
        <div style={{
          background: accentColor, color: "#fff", padding: "16px 50px", borderRadius: 50,
          fontSize: 24, fontWeight: 700, display: "inline-block",
          opacity: interpolate(frame, [fps * 0.8, fps * 1.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          Acheter maintenant
        </div>
      </div>
    </AbsoluteFill>
  );
}

export const EcommerceShowcase: React.FC<EcommerceShowcaseProps> = ({ scenes, brand, assetUrls }) => {
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
            <EcommerceScene scene={scene} brand={brand} assetUrls={assetUrls} fps={fps} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export default EcommerceShowcase;

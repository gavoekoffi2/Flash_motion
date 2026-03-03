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

// ── Types ──
interface SceneAsset {
  type: string;
  id: string;
  placement: string;
  scale: string;
  url?: string;
}

interface Scene {
  id: number;
  duration_s: number;
  type: string;
  text: string;
  assets: SceneAsset[];
  animation: string;
}

interface Brand {
  primary_color: string;
  logo_id: string | null;
}

export interface HeroPromoProps {
  scenes: Scene[];
  brand: Brand;
  assetUrls: Record<string, string>;
}

// ── Animation helpers — all scene types supported ──
function useAnimation(animation: string, frame: number, fps: number, durationFrames: number) {
  switch (animation) {
    case "fade_in_up":
      return {
        opacity: interpolate(frame, [0, fps * 0.5], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateY(${interpolate(frame, [0, fps * 0.5], [40, 0], { extrapolateRight: "clamp" })}px)`,
      };
    case "slide_left":
      return {
        opacity: interpolate(frame, [0, fps * 0.3], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateX(${interpolate(frame, [0, fps * 0.5], [100, 0], { extrapolateRight: "clamp" })}px)`,
      };
    case "zoom_in": {
      const scale = spring({ frame, fps, config: { damping: 80 } });
      return {
        opacity: interpolate(frame, [0, fps * 0.3], [0, 1], { extrapolateRight: "clamp" }),
        transform: `scale(${interpolate(scale, [0, 1], [0.8, 1])})`,
      };
    }
    case "bounce": {
      const bounceVal = spring({ frame, fps, config: { damping: 6, mass: 0.5 } });
      return {
        opacity: 1,
        transform: `scale(${interpolate(bounceVal, [0, 1], [0.5, 1])})`,
      };
    }
    case "scale_up": {
      const scaleVal = spring({ frame, fps, config: { damping: 50 } });
      return {
        opacity: 1,
        transform: `scale(${interpolate(scaleVal, [0, 1], [0.9, 1])})`,
      };
    }
    case "fade_out":
      return {
        opacity: interpolate(frame, [durationFrames - fps, durationFrames], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        transform: "translateY(0)",
      };
    case "carousel": {
      const slideX = interpolate(frame, [0, fps * 0.6], [200, 0], { extrapolateRight: "clamp" });
      const fadeIn = interpolate(frame, [0, fps * 0.4], [0, 1], { extrapolateRight: "clamp" });
      return { opacity: fadeIn, transform: `translateX(${slideX}px)` };
    }
    default:
      return {
        opacity: interpolate(frame, [0, fps * 0.3], [0, 1], { extrapolateRight: "clamp" }),
        transform: "none",
      };
  }
}

// ── Safe Image component with fallback ──
function SafeImg({ src, style }: { src: string | null | undefined; style: React.CSSProperties }) {
  if (!src) return null;
  return <Img src={src} style={style} />;
}

// ── Scene Renderer — handles all scene types ──
function SceneRenderer({
  scene,
  brand,
  assetUrls,
}: {
  scene: Scene;
  brand: Brand;
  assetUrls: Record<string, string>;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = scene.duration_s * fps;
  const anim = useAnimation(scene.animation, frame, fps, durationFrames);

  const primaryAsset = scene.assets[0];
  const imageUrl = primaryAsset?.url || (primaryAsset?.id ? assetUrls[primaryAsset.id] : null) || null;
  const bgColor = brand.primary_color || "#1a1a2e";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Background image (blurred) */}
      {imageUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "blur(30px) brightness(0.3)", transform: "scale(1.2)" }}>
          <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

      {/* Main animated content */}
      <div
        style={{
          ...anim,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
          zIndex: 1,
          width: "100%",
          height: "100%",
        }}
      >
        {/* HERO */}
        {scene.type === "hero" && (
          <>
            {imageUrl && (
              <div style={{ width: "70%", maxHeight: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 30 }}>
                <SafeImg src={imageUrl} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }} />
              </div>
            )}
            <p style={{ fontSize: 48, fontWeight: 700, color: "#fff", lineHeight: 1.3, textShadow: "0 2px 20px rgba(0,0,0,0.5)", margin: 0, textAlign: "center", maxWidth: "85%" }}>
              {scene.text}
            </p>
            <div
              style={{
                marginTop: 40,
                opacity: interpolate(frame, [fps * 1, fps * 1.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                transform: `translateY(${interpolate(frame, [fps * 1, fps * 1.5], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
              }}
            >
              <div style={{ background: "white", color: bgColor, padding: "14px 40px", borderRadius: 50, fontSize: 22, fontWeight: 700 }}>
                En savoir plus
              </div>
            </div>
          </>
        )}

        {/* CAROUSEL */}
        {scene.type === "carousel" && (
          <>
            <div style={{ display: "flex", gap: 20, width: "90%", justifyContent: "center", marginBottom: 30, flexWrap: "wrap" }}>
              {scene.assets.map((asset, i) => {
                const url = asset.url || (asset.id ? assetUrls[asset.id] : null);
                const delay = i * fps * 0.2;
                const slideOpacity = interpolate(frame, [delay, delay + fps * 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const slideX = interpolate(frame, [delay, delay + fps * 0.5], [60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                return (
                  <div
                    key={asset.id || i}
                    style={{
                      opacity: slideOpacity,
                      transform: `translateX(${slideX}px)`,
                      width: scene.assets.length <= 2 ? "45%" : "30%",
                      aspectRatio: "1",
                      borderRadius: 16,
                      overflow: "hidden",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    }}
                  >
                    {url ? (
                      <SafeImg src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: "rgba(255,255,255,0.3)" }}>
                        {i + 1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 36, fontWeight: 700, color: "#fff", lineHeight: 1.3, textShadow: "0 2px 20px rgba(0,0,0,0.5)", margin: 0, textAlign: "center", maxWidth: "85%" }}>
              {scene.text}
            </p>
          </>
        )}

        {/* FEATURE LIST */}
        {scene.type === "feature_list" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "90%" }}>
            {imageUrl && (
              <div style={{ width: "40%", marginBottom: 30 }}>
                <SafeImg src={imageUrl} style={{ width: "100%", objectFit: "contain", borderRadius: 12 }} />
              </div>
            )}
            <p style={{ fontSize: 38, fontWeight: 700, color: "#fff", lineHeight: 1.4, textShadow: "0 2px 20px rgba(0,0,0,0.5)", margin: 0, textAlign: "center", maxWidth: "85%" }}>
              {scene.text}
            </p>
          </div>
        )}

        {/* DEMO */}
        {scene.type === "demo" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "90%" }}>
            {imageUrl && (
              <div style={{ width: "85%", marginBottom: 20, borderRadius: 12, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", border: "2px solid rgba(255,255,255,0.15)" }}>
                <SafeImg src={imageUrl} style={{ width: "100%", objectFit: "contain" }} />
              </div>
            )}
            <p style={{ fontSize: 30, fontWeight: 600, color: "#fff", lineHeight: 1.3, textShadow: "0 2px 10px rgba(0,0,0,0.5)", margin: 0, textAlign: "center", maxWidth: "80%", opacity: 0.9 }}>
              {scene.text}
            </p>
          </div>
        )}

        {/* OUTRO */}
        {scene.type === "outro" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {imageUrl && (
              <div style={{ width: 120, height: 120, marginBottom: 30 }}>
                <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
            )}
            <p style={{ fontSize: 42, fontWeight: 700, color: "#fff", lineHeight: 1.3, textShadow: "0 2px 20px rgba(0,0,0,0.5)", margin: 0, textAlign: "center", maxWidth: "85%" }}>
              {scene.text}
            </p>
          </div>
        )}

        {/* Fallback for unknown types */}
        {!["hero", "carousel", "feature_list", "demo", "outro"].includes(scene.type) && (
          <>
            {imageUrl && (
              <div style={{ width: "60%", marginBottom: 20 }}>
                <SafeImg src={imageUrl} style={{ maxWidth: "100%", objectFit: "contain", borderRadius: 16 }} />
              </div>
            )}
            <p style={{ fontSize: 36, fontWeight: 700, color: "#fff", lineHeight: 1.3, textShadow: "0 2px 20px rgba(0,0,0,0.5)", margin: 0, textAlign: "center", maxWidth: "85%" }}>
              {scene.text}
            </p>
          </>
        )}
      </div>

      {/* Scene number indicator */}
      <div style={{ position: "absolute", bottom: 20, right: 20, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
        {scene.id}
      </div>
    </AbsoluteFill>
  );
}

// ── Main composition ──
export const HeroPromo: React.FC<HeroPromoProps> = ({ scenes, brand, assetUrls }) => {
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
            <SceneRenderer scene={scene} brand={brand} assetUrls={assetUrls} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export default HeroPromo;

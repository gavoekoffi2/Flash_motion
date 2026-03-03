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

// ── Animation helpers ──
function useAnimation(animation: string, frame: number, fps: number, durationFrames: number) {
  const progress = frame / durationFrames;

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
    default:
      return { opacity: 1, transform: "none" };
  }
}

// ── Scene component ──
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
  const { fps, width, height } = useVideoConfig();
  const durationFrames = scene.duration_s * fps;
  const anim = useAnimation(scene.animation, frame, fps, durationFrames);

  const primaryAsset = scene.assets[0];
  const imageUrl = primaryAsset?.url || (primaryAsset?.id ? assetUrls[primaryAsset.id] : null);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: brand.primary_color || "#1a1a2e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Background image (blurred) */}
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            filter: "blur(30px) brightness(0.3)",
            transform: "scale(1.2)",
          }}
        >
          <Img src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

      {/* Main content */}
      <div
        style={{
          ...anim,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          zIndex: 1,
          width: "100%",
          height: "100%",
        }}
      >
        {/* Product image */}
        {imageUrl && scene.type === "hero" && (
          <div
            style={{
              width: "70%",
              maxHeight: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 30,
            }}
          >
            <Img
              src={imageUrl}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                borderRadius: 16,
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}
            />
          </div>
        )}

        {/* Text */}
        <div
          style={{
            textAlign: "center",
            maxWidth: "85%",
          }}
        >
          <p
            style={{
              fontSize: scene.type === "hero" ? 48 : 36,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.3,
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
              margin: 0,
            }}
          >
            {scene.text}
          </p>
        </div>

        {/* CTA for hero scenes */}
        {scene.type === "hero" && (
          <div
            style={{
              marginTop: 40,
              opacity: interpolate(frame, [fps * 1, fps * 1.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              transform: `translateY(${interpolate(frame, [fps * 1, fps * 1.5], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
            }}
          >
            <div
              style={{
                background: "white",
                color: brand.primary_color || "#1a1a2e",
                padding: "14px 40px",
                borderRadius: 50,
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              En savoir plus
            </div>
          </div>
        )}
      </div>

      {/* Scene number indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          fontSize: 12,
          color: "rgba(255,255,255,0.3)",
        }}
      >
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

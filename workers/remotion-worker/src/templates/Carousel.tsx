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

interface CarouselProps {
  scenes: Scene[];
  brand: Brand;
  assetUrls: Record<string, string>;
}

function SafeImg({ src, style }: { src: string | null | undefined; style: React.CSSProperties }) {
  if (!src) return null;
  return <Img src={src} style={style} />;
}

function CarouselScene({
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

  const assetCount = scene.assets?.length || 0;
  const itemWidth = 0.35;
  const gap = 0.05;

  const animationProgress = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 100, mass: 0.5 },
    durationInFrames: fps * 1.5,
  });

  const slideX = interpolate(
    animationProgress,
    [0, 1],
    [100, 0],
    { extrapolateRight: "clamp" }
  );

  const opacity = interpolate(
    frame,
    [0, 30],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: brand.primary_color || "#000",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        padding: "40px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: `${gap * 100}%`,
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          marginBottom: "60px",
          transform: `translateX(${slideX}px)`,
          opacity,
        }}
      >
        {scene.assets?.map((asset, i) => {
          const url = assetUrls[asset.id];
          return (
            <div
              key={asset.id || i}
              style={{
                width: `${itemWidth * 100}%`,
                aspectRatio: "1",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                backgroundColor: "rgba(255,255,255,0.1)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {url ? (
                <SafeImg
                  src={url}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: (asset.scale || "cover") as ("cover" | "contain" | "fill" | "none" | "scale-down"),
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 40,
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  {i + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <h1
        style={{
          fontSize: 60,
          fontWeight: 700,
          color: "#fff",
          textAlign: "center",
          maxWidth: "90%",
          textShadow: "0 5px 15px rgba(0,0,0,0.5)",
          margin: 0,
          opacity: interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [0, 30], [50, 0], { extrapolateRight: "clamp" })}px)`,
        }}
      >
        {scene.text}
      </h1>
    </AbsoluteFill>
  );
}

export const Carousel: React.FC<CarouselProps> = ({ scenes, brand, assetUrls }) => {
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
            <CarouselScene scene={scene} brand={brand} assetUrls={assetUrls} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export default Carousel;

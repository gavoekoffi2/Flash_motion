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

interface FeatureListProps {
  scenes: Scene[];
  brand: Brand;
  assetUrls: Record<string, string>;
}

function SafeImg({ src, style }: { src: string | null | undefined; style: React.CSSProperties }) {
  if (!src) return null;
  return <Img src={src} style={style} />;
}

function FeatureListScene({
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
  const itemsPerRow = Math.min(3, assetCount);

  const animationProgress = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 100, mass: 0.5 },
    durationInFrames: fps * 1.5,
  });

  const scaleIn = interpolate(
    animationProgress,
    [0, 1],
    [0.8, 1],
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
        padding: "60px 40px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`,
          gap: "40px",
          width: "100%",
          maxWidth: "900px",
          marginBottom: "60px",
          opacity,
          transform: `scale(${scaleIn})`,
        }}
      >
        {scene.assets?.map((asset, i) => {
          const url = assetUrls[asset.id];
          const itemDelay = (i * 100) / fps;
          const itemOpacity = interpolate(
            frame,
            [itemDelay, itemDelay + 30],
            [0, 1],
            { extrapolateRight: "clamp" }
          );

          return (
            <div
              key={asset.id || i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                opacity: itemOpacity,
                transform: `translateY(${interpolate(frame, [itemDelay, itemDelay + 30], [30, 0], { extrapolateRight: "clamp" })}px)`,
              }}
            >
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: "20px",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                }}
              >
                {url ? (
                  <SafeImg
                    src={url}
                    style={{
                      width: "80%",
                      height: "80%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: 40,
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    {i + 1}
                  </div>
                )}
              </div>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#fff",
                  textAlign: "center",
                  margin: 0,
                  textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                }}
              >
                Fonctionnalité {i + 1}
              </p>
            </div>
          );
        })}
      </div>

      <h1
        style={{
          fontSize: 56,
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

export const FeatureList: React.FC<FeatureListProps> = ({ scenes, brand, assetUrls }) => {
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
            <FeatureListScene scene={scene} brand={brand} assetUrls={assetUrls} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export default FeatureList;

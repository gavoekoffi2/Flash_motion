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

interface DemoProps {
  scenes: Scene[];
  brand: Brand;
  assetUrls: Record<string, string>;
}

function SafeImg({ src, style }: { src: string | null | undefined; style: React.CSSProperties }) {
  if (!src) return null;
  return <Img src={src} style={style} />;
}

function DemoScene({
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

  const imageUrl = scene.assets?.[0]?.id ? assetUrls[scene.assets[0].id] : null;

  const animationProgress = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 100, mass: 0.5 },
    durationInFrames: fps * 1.5,
  });

  const scaleIn = interpolate(
    animationProgress,
    [0, 1],
    [0.9, 1],
    { extrapolateRight: "clamp" }
  );

  const rotateIn = interpolate(
    animationProgress,
    [0, 1],
    [-5, 0],
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
      {imageUrl && (
        <div
          style={{
            width: "85%",
            maxWidth: "800px",
            marginBottom: "40px",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            border: "3px solid rgba(255,255,255,0.15)",
            opacity,
            transform: `scale(${scaleIn}) rotateZ(${rotateIn}deg)`,
          }}
        >
          <SafeImg
            src={imageUrl}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              objectFit: "contain",
            }}
          />
        </div>
      )}

      <h2
        style={{
          fontSize: 48,
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
      </h2>

      <div
        style={{
          position: "absolute",
          bottom: "30px",
          left: "30px",
          right: "30px",
          height: "3px",
          backgroundColor: "rgba(255,255,255,0.2)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            backgroundColor: "#fff",
            width: `${(frame / (scene.duration_s * fps)) * 100}%`,
            borderRadius: "2px",
          }}
        />
      </div>
    </AbsoluteFill>
  );
}

export const Demo: React.FC<DemoProps> = ({ scenes, brand, assetUrls }) => {
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
            <DemoScene scene={scene} brand={brand} assetUrls={assetUrls} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export default Demo;

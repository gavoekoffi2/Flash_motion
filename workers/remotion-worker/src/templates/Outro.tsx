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

interface OutroProps {
  scenes: Scene[];
  brand: Brand;
  assetUrls: Record<string, string>;
}

function SafeImg({ src, style }: { src: string | null | undefined; style: React.CSSProperties }) {
  if (!src) return null;
  return <Img src={src} style={style} />;
}

function OutroScene({
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

  const logoUrl = scene.assets?.[0]?.id ? assetUrls[scene.assets[0].id] : null;

  const animationProgress = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 100, mass: 0.5 },
    durationInFrames: fps * 2,
  });

  const scaleIn = interpolate(
    animationProgress,
    [0, 1],
    [0.5, 1],
    { extrapolateRight: "clamp" }
  );

  const rotateIn = interpolate(
    animationProgress,
    [0, 1],
    [180, 0],
    { extrapolateRight: "clamp" }
  );

  const opacity = interpolate(
    frame,
    [0, 40],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  const exitOpacity = interpolate(
    frame,
    [scene.duration_s * fps - 40, scene.duration_s * fps],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${brand.primary_color || "#000"} 0%, ${brand.primary_color || "#000"}dd 100%)`,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        padding: "40px",
      }}
    >
      {/* Animated background circles */}
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.05)",
          top: "10%",
          right: "10%",
          transform: `scale(${interpolate(frame, [0, scene.duration_s * fps], [0.8, 1.2], { extrapolateRight: "clamp" })})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.03)",
          bottom: "10%",
          left: "10%",
          transform: `scale(${interpolate(frame, [0, scene.duration_s * fps], [1.2, 0.8], { extrapolateRight: "clamp" })})`,
        }}
      />

      {/* Logo */}
      {logoUrl && (
        <div
          style={{
            width: "150px",
            height: "150px",
            marginBottom: "40px",
            opacity: opacity * exitOpacity,
            transform: `scale(${scaleIn}) rotateZ(${rotateIn}deg)`,
          }}
        >
          <SafeImg
            src={logoUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.3))",
            }}
          />
        </div>
      )}

      {/* Main CTA Text */}
      <h1
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: "#fff",
          textAlign: "center",
          maxWidth: "90%",
          textShadow: "0 10px 30px rgba(0,0,0,0.5)",
          margin: 0,
          marginBottom: "30px",
          opacity: opacity * exitOpacity,
          transform: `translateY(${interpolate(frame, [0, 40], [50, 0], { extrapolateRight: "clamp" })}px)`,
          lineHeight: 1.2,
        }}
      >
        {scene.text}
      </h1>

      {/* Animated button */}
      <div
        style={{
          paddingX: "40px",
          paddingY: "16px",
          backgroundColor: "#fff",
          borderRadius: "50px",
          opacity: opacity * exitOpacity,
          transform: `scale(${interpolate(frame, [40, 80], [0.9, 1], { extrapolateRight: "clamp" })})`,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}
      >
        <p
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: brand.primary_color || "#000",
            margin: 0,
            textAlign: "center",
          }}
        >
          Commencer maintenant
        </p>
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          width: "100px",
          height: "4px",
          backgroundColor: "#fff",
          borderRadius: "2px",
          opacity: opacity * exitOpacity,
          transform: `scaleX(${interpolate(frame, [0, 60], [0, 1], { extrapolateRight: "clamp" })})`,
        }}
      />
    </AbsoluteFill>
  );
}

export const Outro: React.FC<OutroProps> = ({ scenes, brand, assetUrls }) => {
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
            <OutroScene scene={scene} brand={brand} assetUrls={assetUrls} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export default Outro;

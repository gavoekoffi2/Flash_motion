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

export interface TestimonialProps {
  scenes: any[];
  brand: { primary_color: string; logo_id: string | null };
  assetUrls: Record<string, string>;
}

function SafeImg({ src, style }: { src: string | null | undefined; style: React.CSSProperties }) {
  if (!src) return null;
  return <Img src={src} style={style} />;
}

function TestimonialScene({ scene, brand, assetUrls, fps }: { scene: any; brand: any; assetUrls: Record<string, string>; fps: number }) {
  const frame = useCurrentFrame();
  const durationFrames = scene.duration_s * fps;
  const bgColor = brand.primary_color || "#1a1a2e";
  const primaryAsset = scene.assets?.[0];
  const imageUrl = primaryAsset?.url || (primaryAsset?.id ? assetUrls[primaryAsset.id] : null) || null;

  const fadeIn = interpolate(frame, [0, fps * 0.4], [0, 1], { extrapolateRight: "clamp" });
  const slideUp = interpolate(frame, [0, fps * 0.5], [30, 0], { extrapolateRight: "clamp" });

  if (scene.type === "hero" || scene.type === "intro") {
    return (
      <AbsoluteFill style={{ backgroundColor: bgColor, justifyContent: "center", alignItems: "center", padding: 60 }}>
        <div style={{ opacity: fadeIn, transform: `translateY(${slideUp}px)`, textAlign: "center", maxWidth: "85%" }}>
          <p style={{ fontSize: 52, fontWeight: 800, color: "#fff", lineHeight: 1.2, margin: 0 }}>
            {scene.text}
          </p>
          <div style={{
            marginTop: 30, width: 60, height: 4, backgroundColor: "rgba(255,255,255,0.4)", borderRadius: 2, margin: "30px auto 0",
          }} />
        </div>
      </AbsoluteFill>
    );
  }

  if (scene.type === "testimonial" || scene.type === "feature_list") {
    const quoteScale = spring({ frame, fps, config: { damping: 60 } });
    return (
      <AbsoluteFill style={{ backgroundColor: bgColor, justifyContent: "center", alignItems: "center", padding: 50 }}>
        {/* Quote mark */}
        <div style={{
          position: "absolute", top: 80, left: 60, fontSize: 200, color: "rgba(255,255,255,0.08)",
          fontFamily: "Georgia, serif", lineHeight: 1,
          transform: `scale(${interpolate(quoteScale, [0, 1], [0.5, 1])})`,
        }}>
          &ldquo;
        </div>
        {/* Avatar */}
        {imageUrl && (
          <div style={{
            width: 100, height: 100, borderRadius: 50, overflow: "hidden", marginBottom: 30, border: "3px solid rgba(255,255,255,0.3)",
            opacity: fadeIn, transform: `scale(${interpolate(quoteScale, [0, 1], [0.8, 1])})`,
          }}>
            <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div style={{ opacity: fadeIn, transform: `translateY(${slideUp}px)`, textAlign: "center", maxWidth: "80%", zIndex: 1 }}>
          <p style={{ fontSize: 34, fontWeight: 500, color: "#fff", lineHeight: 1.5, fontStyle: "italic", margin: 0 }}>
            &ldquo;{scene.text}&rdquo;
          </p>
        </div>
      </AbsoluteFill>
    );
  }

  // Stars / rating scene
  if (scene.type === "demo" || scene.type === "carousel") {
    const stars = "★★★★★";
    return (
      <AbsoluteFill style={{ backgroundColor: bgColor, justifyContent: "center", alignItems: "center", padding: 50 }}>
        <div style={{ opacity: fadeIn, textAlign: "center" }}>
          <div style={{ fontSize: 50, color: "#FFD700", letterSpacing: 8, marginBottom: 30 }}>{stars}</div>
          <p style={{ fontSize: 36, fontWeight: 600, color: "#fff", lineHeight: 1.4, margin: 0, maxWidth: "80%" }}>
            {scene.text}
          </p>
        </div>
      </AbsoluteFill>
    );
  }

  // Outro
  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, justifyContent: "center", alignItems: "center" }}>
      {imageUrl && (
        <div style={{ width: 100, height: 100, marginBottom: 30, opacity: fadeIn }}>
          <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
      )}
      <div style={{ opacity: fadeIn, transform: `translateY(${slideUp}px)`, textAlign: "center" }}>
        <p style={{ fontSize: 40, fontWeight: 700, color: "#fff", lineHeight: 1.3, margin: 0 }}>
          {scene.text}
        </p>
      </div>
    </AbsoluteFill>
  );
}

export const Testimonial: React.FC<TestimonialProps> = ({ scenes, brand, assetUrls }) => {
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
            <TestimonialScene scene={scene} brand={brand} assetUrls={assetUrls} fps={fps} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export default Testimonial;

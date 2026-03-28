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

// ── Color utilities ──
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 26, g: 26, b: 46 };
}

function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.max(0, r - amount)},${Math.max(0, g - amount)},${Math.max(0, b - amount)})`;
}

function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.min(255, r + amount)},${Math.min(255, g + amount)},${Math.min(255, b + amount)})`;
}

function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

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
  secondary_color?: string;
  accent_color?: string;
  text_color?: string;
  logo_id: string | null;
}

export interface CinematicPromoProps {
  scenes: Scene[];
  brand: Brand;
  assetUrls: Record<string, string>;
}

// ── Safe Image ──
function SafeImg({
  src,
  style,
}: {
  src: string | null | undefined;
  style: React.CSSProperties;
}) {
  if (!src) return null;
  return <Img src={src} style={style} />;
}

// ── Resolve brand colors with smart defaults ──
function resolveBrand(brand: Brand) {
  const primary = brand.primary_color || "#6C63FF";
  const secondary = brand.secondary_color || darken(primary, 50);
  const accent = brand.accent_color || lighten(primary, 70);
  const textColor = brand.text_color || "#ffffff";
  const dark = darken(primary, 90);
  return { primary, secondary, accent, textColor, dark };
}

// ── Kinetic Text (word-by-word stagger with spring) ──
function KineticText({
  text,
  style,
  wordStyle,
  frame,
  fps,
  startDelay = 0,
  staggerFrames = 3,
}: {
  text: string;
  style?: React.CSSProperties;
  wordStyle?: React.CSSProperties;
  frame: number;
  fps: number;
  startDelay?: number;
  staggerFrames?: number;
}) {
  const words = text.split(" ");
  return (
    <span
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "baseline",
        gap: "0.3em",
        ...style,
      }}
    >
      {words.map((word, i) => {
        const delay = startDelay + i * staggerFrames;
        const wordFrame = Math.max(0, frame - delay);
        const progress = spring({
          frame: wordFrame,
          fps,
          config: { damping: 55, stiffness: 200, mass: 0.7 },
        });
        const translateY = interpolate(progress, [0, 1], [70, 0]);
        const opacity = interpolate(wordFrame, [0, 10], [0, 1], {
          extrapolateRight: "clamp",
        });
        return (
          <span
            key={i}
            style={{
              opacity,
              transform: `translateY(${translateY}px)`,
              display: "inline-block",
              ...wordStyle,
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}

// ── Floating Orb (blurred gradient sphere) ──
function FloatingOrb({
  x,
  y,
  size,
  color,
  frame,
  phaseX = 0,
  phaseY = 0,
  speedX = 1,
  speedY = 1,
}: {
  x: number;
  y: number;
  size: number;
  color: string;
  frame: number;
  phaseX?: number;
  phaseY?: number;
  speedX?: number;
  speedY?: number;
}) {
  const dx = Math.sin((frame / 180 + phaseX) * speedX) * 80;
  const dy = Math.cos((frame / 220 + phaseY) * speedY) * 60;
  return (
    <div
      style={{
        position: "absolute",
        left: x + dx,
        top: y + dy,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 40% 40%, ${rgba(color, 0.55)}, ${rgba(color, 0.05)})`,
        filter: "blur(70px)",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
    />
  );
}

// ── Rising Particles ──
function ParticleField({
  frame,
  width,
  height,
  color,
}: {
  frame: number;
  width: number;
  height: number;
  color: string;
}) {
  const COUNT = 18;
  return (
    <>
      {Array.from({ length: COUNT }, (_, i) => {
        const sx = (i * 137.508) % 1;
        const sy = (i * 234.567) % 1;
        const ss = (i * 89.123) % 1;
        const speed = 0.4 + ss * 0.7;
        const drift = Math.sin(frame / 100 + i * 0.9) * 25;
        const rise = (frame * speed) % (height + 20);
        const py = height - rise;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: sx * width + drift,
              top: py,
              width: 2 + ss * 4,
              height: 2 + ss * 4,
              borderRadius: "50%",
              backgroundColor: rgba(color, 0.15 + ss * 0.25),
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
}

// ── Animated gradient background ──
function GradientBg({
  frame,
  fps,
  primary,
  secondary,
  accent,
  dark,
}: {
  frame: number;
  fps: number;
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
}) {
  const angle = 135 + Math.sin(frame / 300) * 20;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, ${dark} 0%, ${darken(secondary, 20)} 40%, ${darken(primary, 60)} 100%)`,
      }}
    />
  );
}

// ── Animated underline reveal ──
function AnimatedLine({
  frame,
  color,
  delay = 0,
  width: maxW = 240,
}: {
  frame: number;
  color: string;
  delay?: number;
  width?: number;
}) {
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps: 30,
    config: { damping: 80, stiffness: 200 },
  });
  const w = interpolate(progress, [0, 1], [0, maxW]);
  return (
    <div
      style={{
        width: w,
        height: 3,
        background: `linear-gradient(90deg, ${color}, ${rgba(color, 0)})`,
        borderRadius: 2,
        margin: "10px auto 0",
        boxShadow: `0 0 12px ${rgba(color, 0.7)}`,
      }}
    />
  );
}

// ── Scene transition wrapper ──
function useSceneTransition(frame: number, fps: number, durationFrames: number) {
  const exitStart = durationFrames - Math.round(fps * 0.45);
  const exitProg = interpolate(frame, [exitStart, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const enterProg = interpolate(frame, [0, Math.round(fps * 0.4)], [0, 1], {
    extrapolateRight: "clamp",
  });
  const opacity =
    frame < Math.round(fps * 0.4)
      ? enterProg
      : frame > exitStart
        ? 1 - exitProg
        : 1;
  const scale =
    frame < Math.round(fps * 0.4)
      ? interpolate(enterProg, [0, 1], [1.06, 1])
      : frame > exitStart
        ? interpolate(exitProg, [0, 1], [1, 0.96])
        : 1;
  return { opacity, scale };
}

// ────────────────────────────────────────────────────────────
// SCENE RENDERERS
// ────────────────────────────────────────────────────────────

// ── HERO SCENE ──
function HeroScene({
  scene,
  brand,
  assetUrls,
  frame,
  fps,
  width,
  height,
}: {
  scene: Scene;
  brand: Brand;
  assetUrls: Record<string, string>;
  frame: number;
  fps: number;
  width: number;
  height: number;
}) {
  const { primary, secondary, accent, textColor, dark } = resolveBrand(brand);
  const isPortrait = height > width;

  const primaryAsset = scene.assets[0];
  const imageUrl =
    primaryAsset?.url ||
    (primaryAsset?.id ? assetUrls[primaryAsset.id] : null) ||
    null;
  const logoUrl = brand.logo_id ? assetUrls[brand.logo_id] : null;

  // Logo drop-in
  const logoSpring = spring({ frame, fps, config: { damping: 60, stiffness: 180 } });
  const logoY = interpolate(logoSpring, [0, 1], [-100, 0]);
  const logoOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  // Image reveal (clip + scale)
  const imgDelay = fps * 0.15;
  const imgSpring = spring({
    frame: Math.max(0, frame - imgDelay),
    fps,
    config: { damping: 55, stiffness: 100 },
  });
  const imgScale = interpolate(imgSpring, [0, 1], [1.18, 1]);
  const imgOpacity = interpolate(frame, [imgDelay, imgDelay + fps * 0.7], [0, 1], {
    extrapolateRight: "clamp",
  });
  const clipRight = interpolate(imgSpring, [0, 1], [100, 0]);

  // CTA pulse
  const pulseCycle = (frame % (fps * 1.8)) / (fps * 1.8);
  const pulse = 1 + Math.sin(pulseCycle * Math.PI * 2) * 0.04;

  const ctaOpacity = interpolate(frame, [fps * 1.6, fps * 2.2], [0, 1], {
    extrapolateRight: "clamp",
  });
  const ctaY = interpolate(frame, [fps * 1.6, fps * 2.2], [30, 0], {
    extrapolateRight: "clamp",
  });

  // Rotating ring
  const ringOpacity = interpolate(frame, [fps * 0.4, fps * 1.2], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <GradientBg frame={frame} fps={fps} primary={primary} secondary={secondary} accent={accent} dark={dark} />

      {/* Orbs */}
      <FloatingOrb x={width * 0.15} y={height * 0.2} size={width * 0.75} color={primary} frame={frame} phaseX={0} phaseY={0.3} />
      <FloatingOrb x={width * 0.85} y={height * 0.75} size={width * 0.55} color={secondary} frame={frame} phaseX={1.6} phaseY={2.2} speedX={0.7} speedY={0.8} />
      <FloatingOrb x={width * 0.5} y={height * 0.95} size={width * 0.45} color={accent} frame={frame} phaseX={3.1} phaseY={0.8} speedX={1.1} speedY={0.6} />

      {/* Particles */}
      <ParticleField frame={frame} width={width} height={height} color={accent} />

      {/* Rotating decorative rings */}
      <div
        style={{
          position: "absolute",
          right: -width * 0.12,
          bottom: -width * 0.12,
          width: width * 0.72,
          height: width * 0.72,
          borderRadius: "50%",
          border: `2px solid ${rgba(primary, 0.18)}`,
          opacity: ringOpacity,
          transform: `rotate(${frame * 0.18}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -width * 0.06,
          bottom: -width * 0.06,
          width: width * 0.58,
          height: width * 0.58,
          borderRadius: "50%",
          border: `1px solid ${rgba(accent, 0.12)}`,
          opacity: ringOpacity,
          transform: `rotate(${-frame * 0.13}deg)`,
        }}
      />

      {/* Content layer */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: isPortrait ? "60px 48px" : "40px 80px",
          gap: isPortrait ? 28 : 20,
        }}
      >
        {/* Logo */}
        {logoUrl && (
          <div style={{ opacity: logoOpacity, transform: `translateY(${logoY}px)` }}>
            <SafeImg
              src={logoUrl}
              style={{ height: isPortrait ? 64 : 52, width: "auto", objectFit: "contain" }}
            />
          </div>
        )}

        {/* Hero image */}
        {imageUrl && (
          <div
            style={{
              width: isPortrait ? "88%" : "58%",
              borderRadius: 22,
              overflow: "hidden",
              boxShadow: `0 30px 90px ${rgba(primary, 0.55)}, 0 0 0 1px ${rgba(primary, 0.18)}`,
              opacity: imgOpacity,
              transform: `scale(${imgScale})`,
              clipPath: `inset(0 ${clipRight}% 0 0 round 22px)`,
            }}
          >
            <SafeImg
              src={imageUrl}
              style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}
            />
          </div>
        )}

        {/* Headline */}
        <div style={{ textAlign: "center", maxWidth: "92%" }}>
          <KineticText
            text={scene.text}
            frame={frame}
            fps={fps}
            startDelay={imageUrl ? fps * 0.9 : fps * 0.25}
            staggerFrames={4}
            style={{ justifyContent: "center" }}
            wordStyle={{
              fontSize: isPortrait
                ? Math.max(44, 72 - Math.max(0, scene.text.length - 25) * 0.8)
                : Math.max(32, 52 - Math.max(0, scene.text.length - 40) * 0.5),
              fontWeight: 800,
              color: textColor,
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
              textShadow: `0 4px 30px ${rgba(primary, 0.85)}`,
            }}
          />
          <AnimatedLine frame={frame} color={accent} delay={fps * 1.3} width={isPortrait ? 200 : 260} />
        </div>

        {/* CTA */}
        <div
          style={{
            opacity: ctaOpacity,
            transform: `scale(${pulse}) translateY(${ctaY}px)`,
            marginTop: 8,
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${primary}, ${accent})`,
              color: getLuminance(primary) > 0.55 ? "#000" : "#fff",
              padding: isPortrait ? "18px 52px" : "14px 42px",
              borderRadius: 100,
              fontSize: isPortrait ? 26 : 20,
              fontWeight: 700,
              boxShadow: `0 12px 45px ${rgba(primary, 0.65)}, 0 0 0 1px ${rgba(accent, 0.25)}`,
              letterSpacing: "0.02em",
            }}
          >
            Découvrir →
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── FEATURE LIST SCENE ──
function FeatureListScene({
  scene,
  brand,
  assetUrls,
  frame,
  fps,
  width,
  height,
}: {
  scene: Scene;
  brand: Brand;
  assetUrls: Record<string, string>;
  frame: number;
  fps: number;
  width: number;
  height: number;
}) {
  const { primary, secondary, accent, textColor, dark } = resolveBrand(brand);
  const isPortrait = height > width;

  // Split on bullet separators
  const allParts = scene.text
    .split(/[•·|—\n]+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 2);

  const title = allParts[0] || scene.text;
  const features = allParts.length > 1 ? allParts.slice(1, 5) : [];
  const icons = ["◆", "★", "✦", "●"];

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <GradientBg frame={frame} fps={fps} primary={primary} secondary={secondary} accent={accent} dark={dark} />
      <FloatingOrb x={width * 0.08} y={height * 0.35} size={width * 0.65} color={secondary} frame={frame} phaseX={2.1} phaseY={0.4} />
      <FloatingOrb x={width * 0.92} y={height * 0.65} size={width * 0.45} color={accent} frame={frame} phaseX={0.4} phaseY={1.9} speedX={0.8} />
      <ParticleField frame={frame} width={width} height={height} color={primary} />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: isPortrait ? "60px 44px" : "40px 80px",
          gap: isPortrait ? 24 : 18,
        }}
      >
        {/* Section title */}
        <div style={{ textAlign: "center", marginBottom: features.length > 0 ? 0 : 10 }}>
          <KineticText
            text={title}
            frame={frame}
            fps={fps}
            startDelay={0}
            staggerFrames={3}
            wordStyle={{
              fontSize: isPortrait ? 50 : 40,
              fontWeight: 800,
              color: textColor,
              letterSpacing: "-0.02em",
              textShadow: `0 3px 25px ${rgba(primary, 0.8)}`,
            }}
          />
          <AnimatedLine frame={frame} color={accent} delay={fps * 0.5} width={isPortrait ? 180 : 220} />
        </div>

        {/* Feature cards */}
        {features.map((feat, i) => {
          const delay = fps * (0.45 + i * 0.22);
          const cardSpring = spring({
            frame: Math.max(0, frame - delay),
            fps,
            config: { damping: 58, stiffness: 160 },
          });
          const cardX = interpolate(cardSpring, [0, 1], [180, 0]);
          const cardOpacity = interpolate(Math.max(0, frame - delay), [0, 10], [0, 1], {
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                opacity: cardOpacity,
                transform: `translateX(${cardX}px)`,
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: isPortrait ? "20px 28px" : "15px 22px",
                borderRadius: 18,
                background: rgba(primary, 0.12),
                border: `1px solid ${rgba(accent, 0.22)}`,
                width: "96%",
                boxShadow: `0 8px 32px ${rgba(primary, 0.2)}, inset 0 1px 0 ${rgba(textColor, 0.06)}`,
              }}
            >
              <div
                style={{
                  width: isPortrait ? 46 : 40,
                  height: isPortrait ? 46 : 40,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${primary}, ${accent})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isPortrait ? 20 : 17,
                  flexShrink: 0,
                  boxShadow: `0 4px 22px ${rgba(primary, 0.55)}`,
                  color: getLuminance(primary) > 0.55 ? "#000" : "#fff",
                }}
              >
                {icons[i % icons.length]}
              </div>
              <span
                style={{
                  fontSize: isPortrait ? 26 : 21,
                  color: rgba(textColor, 0.92),
                  fontWeight: 500,
                  lineHeight: 1.35,
                  letterSpacing: "0.005em",
                }}
              >
                {feat}
              </span>
            </div>
          );
        })}

        {/* Fallback: no bullets — show kinetic full text */}
        {features.length === 0 && (
          <KineticText
            text={scene.text}
            frame={frame}
            fps={fps}
            startDelay={fps * 0.4}
            staggerFrames={4}
            wordStyle={{
              fontSize: isPortrait ? 38 : 30,
              fontWeight: 500,
              color: rgba(textColor, 0.85),
              lineHeight: 1.6,
              textShadow: `0 2px 15px ${rgba(primary, 0.5)}`,
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
}

// ── CAROUSEL SCENE ──
function CarouselScene({
  scene,
  brand,
  assetUrls,
  frame,
  fps,
  width,
  height,
}: {
  scene: Scene;
  brand: Brand;
  assetUrls: Record<string, string>;
  frame: number;
  fps: number;
  width: number;
  height: number;
}) {
  const { primary, secondary, accent, textColor, dark } = resolveBrand(brand);
  const isPortrait = height > width;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <GradientBg frame={frame} fps={fps} primary={primary} secondary={secondary} accent={accent} dark={dark} />
      <FloatingOrb x={width * 0.5} y={height * 0.55} size={width * 0.9} color={secondary} frame={frame} phaseX={0.4} phaseY={1.1} speedX={0.6} speedY={0.5} />
      <ParticleField frame={frame} width={width} height={height} color={accent} />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: isPortrait ? "44px 32px" : "32px 60px",
          gap: 28,
        }}
      >
        {/* Image grid */}
        <div
          style={{
            display: "flex",
            flexDirection: isPortrait ? "column" : "row",
            gap: 16,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {scene.assets.map((asset, i) => {
            const delay = i * fps * 0.17;
            const prog = spring({
              frame: Math.max(0, frame - delay),
              fps,
              config: { damping: 52, stiffness: 130 },
            });
            const dy = interpolate(prog, [0, 1], [110, 0]);
            const sc = interpolate(prog, [0, 1], [0.78, 1]);
            const op = interpolate(Math.max(0, frame - delay), [0, 14], [0, 1], {
              extrapolateRight: "clamp",
            });
            const url = asset.url || (asset.id ? assetUrls[asset.id] : null);
            const n = scene.assets.length;

            return (
              <div
                key={asset.id || i}
                style={{
                  opacity: op,
                  transform: `translateY(${dy}px) scale(${sc})`,
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: `0 22px 65px ${rgba(primary, 0.45)}, 0 0 0 1px ${rgba(accent, 0.14)}`,
                  width: isPortrait
                    ? "88%"
                    : n === 1
                      ? "60%"
                      : n === 2
                        ? "46%"
                        : "31%",
                  flexShrink: 0,
                  background: rgba(primary, 0.25),
                  aspectRatio: "4/3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {url ? (
                  <SafeImg src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 44, opacity: 0.25, color: textColor }}>{i + 1}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Caption */}
        <KineticText
          text={scene.text}
          frame={frame}
          fps={fps}
          startDelay={fps * 0.65}
          staggerFrames={3}
          wordStyle={{
            fontSize: isPortrait ? 34 : 26,
            fontWeight: 600,
            color: textColor,
            textShadow: `0 2px 18px ${rgba(primary, 0.65)}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
}

// ── DEMO SCENE ──
function DemoScene({
  scene,
  brand,
  assetUrls,
  frame,
  fps,
  width,
  height,
}: {
  scene: Scene;
  brand: Brand;
  assetUrls: Record<string, string>;
  frame: number;
  fps: number;
  width: number;
  height: number;
}) {
  const { primary, secondary, accent, textColor, dark } = resolveBrand(brand);
  const isPortrait = height > width;

  const primaryAsset = scene.assets[0];
  const imageUrl =
    primaryAsset?.url ||
    (primaryAsset?.id ? assetUrls[primaryAsset.id] : null) ||
    null;

  const screenDelay = fps * 0.2;
  const screenSpring = spring({
    frame: Math.max(0, frame - screenDelay),
    fps,
    config: { damping: 58, stiffness: 100 },
  });
  const screenScale = interpolate(screenSpring, [0, 1], [0.88, 1]);
  const screenOpacity = interpolate(Math.max(0, frame - screenDelay), [0, 14], [0, 1], {
    extrapolateRight: "clamp",
  });
  const clipRight = interpolate(screenSpring, [0, 1], [100, 0]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <GradientBg frame={frame} fps={fps} primary={primary} secondary={secondary} accent={accent} dark={dark} />
      <FloatingOrb x={width * 0.82} y={height * 0.2} size={width * 0.55} color={accent} frame={frame} phaseX={1.1} phaseY={2.1} />
      <FloatingOrb x={width * 0.18} y={height * 0.8} size={width * 0.45} color={secondary} frame={frame} phaseX={0.7} phaseY={0.5} speedX={0.9} />
      <ParticleField frame={frame} width={width} height={height} color={primary} />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: isPortrait ? "50px 40px" : "38px 60px",
          gap: 28,
        }}
      >
        {imageUrl && (
          <div
            style={{
              width: isPortrait ? "92%" : "78%",
              opacity: screenOpacity,
              transform: `scale(${screenScale})`,
              clipPath: `inset(0 ${clipRight}% 0 0 round 16px)`,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: `0 28px 90px ${rgba(primary, 0.55)}, 0 0 0 1px ${rgba(accent, 0.18)}`,
            }}
          >
            {/* Browser chrome */}
            <div
              style={{
                background: darken(dark, 20),
                padding: "11px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {(["#ff5f57", "#febc2e", "#28c840"] as const).map((c, idx) => (
                <div
                  key={idx}
                  style={{ width: 11, height: 11, borderRadius: "50%", background: c }}
                />
              ))}
              <div
                style={{
                  flex: 1,
                  background: rgba(textColor, 0.08),
                  borderRadius: 6,
                  height: 22,
                  marginLeft: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 11, color: rgba(textColor, 0.35) }}>
                  app.flashmotion.io
                </span>
              </div>
            </div>
            <SafeImg src={imageUrl} style={{ width: "100%", display: "block", objectFit: "cover" }} />
          </div>
        )}

        <KineticText
          text={scene.text}
          frame={frame}
          fps={fps}
          startDelay={fps * 0.85}
          staggerFrames={3}
          wordStyle={{
            fontSize: isPortrait ? 32 : 26,
            fontWeight: 600,
            color: textColor,
            textShadow: `0 2px 18px ${rgba(primary, 0.65)}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
}

// ── OUTRO SCENE ──
function OutroScene({
  scene,
  brand,
  assetUrls,
  frame,
  fps,
  width,
  height,
}: {
  scene: Scene;
  brand: Brand;
  assetUrls: Record<string, string>;
  frame: number;
  fps: number;
  width: number;
  height: number;
}) {
  const { primary, secondary, accent, textColor, dark } = resolveBrand(brand);
  const isPortrait = height > width;

  const logoUrl = brand.logo_id ? assetUrls[brand.logo_id] : null;
  const primaryAsset = scene.assets[0];
  const imgUrl =
    primaryAsset?.url || (primaryAsset?.id ? assetUrls[primaryAsset.id] : null) || null;
  const finalImgUrl = logoUrl || imgUrl;

  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 38, stiffness: 110, mass: 1.6 },
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.2, 1]);
  const logoRotate = interpolate(logoSpring, [0, 1], [-18, 0]);
  const logoOpacity = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  const glowPulse = 0.65 + Math.sin(frame / 18) * 0.35;

  // Confetti particles
  const CONFETTI = 24;
  const confettiColors = [primary, accent, secondary, textColor, lighten(primary, 60)];

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <GradientBg frame={frame} fps={fps} primary={primary} secondary={secondary} accent={accent} dark={dark} />

      <FloatingOrb x={width * 0.5} y={height * 0.3} size={width * 1.3} color={primary} frame={frame} phaseX={0} phaseY={0.4} speedX={0.4} speedY={0.35} />
      <FloatingOrb x={width * 0.2} y={height * 0.85} size={width * 0.65} color={accent} frame={frame} phaseX={2.2} phaseY={1.1} speedX={0.65} speedY={0.55} />

      {/* Confetti */}
      {Array.from({ length: CONFETTI }, (_, i) => {
        const sx = (i * 113.45) % 1;
        const ss = (i * 197.3) % 1;
        const delay = i * 2;
        const pf = Math.max(0, frame - delay);
        const vy = 2.2 + ss * 3.5;
        const y = (pf * vy) % (height + 30) - 30;
        const rot = frame * (sx * 8 - 4);
        const color = confettiColors[i % confettiColors.length];
        const op = interpolate(pf, [0, 12], [0, 0.75], { extrapolateRight: "clamp" });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: sx * width,
              top: y,
              width: 5 + ss * 6,
              height: 10 + ss * 10,
              background: color,
              borderRadius: ss > 0.5 ? "50%" : 2,
              opacity: op,
              transform: `rotate(${rot}deg)`,
            }}
          />
        );
      })}

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          gap: isPortrait ? 36 : 28,
        }}
      >
        {/* Logo with glow */}
        {finalImgUrl && (
          <div
            style={{
              opacity: logoOpacity,
              transform: `scale(${logoScale}) rotate(${logoRotate}deg)`,
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: `0 0 ${70 * glowPulse}px ${rgba(primary, glowPulse)}, 0 0 ${140 * glowPulse}px ${rgba(accent, glowPulse * 0.45)}`,
            }}
          >
            <SafeImg
              src={finalImgUrl}
              style={{
                width: isPortrait ? 160 : 120,
                height: isPortrait ? 160 : 120,
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        )}

        {/* Outro headline */}
        <div style={{ textAlign: "center", maxWidth: "90%" }}>
          <KineticText
            text={scene.text}
            frame={frame}
            fps={fps}
            startDelay={finalImgUrl ? fps * 0.55 : 0}
            staggerFrames={5}
            wordStyle={{
              fontSize: isPortrait ? 66 : 50,
              fontWeight: 900,
              color: textColor,
              letterSpacing: "-0.025em",
              textShadow: `0 4px 35px ${rgba(primary, 0.95)}, 0 0 70px ${rgba(accent, 0.45)}`,
            }}
          />
        </div>

        {/* Glowing underline */}
        <div
          style={{
            height: 4,
            width: interpolate(frame, [fps * 1.1, fps * 2.2], [0, isPortrait ? 320 : 380], {
              extrapolateRight: "clamp",
            }),
            background: `linear-gradient(90deg, ${rgba(primary, 0)}, ${primary}, ${accent}, ${rgba(accent, 0)})`,
            borderRadius: 4,
            boxShadow: `0 0 22px ${rgba(primary, 0.85)}`,
          }}
        />

        {/* Tagline */}
        <div
          style={{
            opacity: interpolate(frame, [fps * 1.6, fps * 2.4], [0, 0.55], {
              extrapolateRight: "clamp",
            }),
            transform: `translateY(${interpolate(frame, [fps * 1.6, fps * 2.4], [22, 0], { extrapolateRight: "clamp" })}px)`,
            fontSize: isPortrait ? 22 : 18,
            color: rgba(textColor, 0.55),
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          Made with Flash Motion
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Master Scene Router ──
function CinematicScene({
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
  const trans = useSceneTransition(frame, fps, durationFrames);

  const commonProps = { scene, brand, assetUrls, frame, fps, width, height };

  const content = (() => {
    switch (scene.type) {
      case "hero":
        return <HeroScene {...commonProps} />;
      case "feature_list":
        return <FeatureListScene {...commonProps} />;
      case "carousel":
        return <CarouselScene {...commonProps} />;
      case "demo":
        return <DemoScene {...commonProps} />;
      case "outro":
        return <OutroScene {...commonProps} />;
      default:
        return <HeroScene {...commonProps} />;
    }
  })();

  return (
    <AbsoluteFill
      style={{
        opacity: trans.opacity,
        transform: `scale(${trans.scale})`,
        fontFamily: "'Inter', 'Helvetica Neue', 'Arial', sans-serif",
      }}
    >
      {content}
    </AbsoluteFill>
  );
}

// ── Main Composition ──
export const CinematicPromo: React.FC<CinematicPromoProps> = ({
  scenes,
  brand,
  assetUrls,
}) => {
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
            <CinematicScene scene={scene} brand={brand} assetUrls={assetUrls} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export default CinematicPromo;

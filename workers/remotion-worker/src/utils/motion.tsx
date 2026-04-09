import React from "react";
import {
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
} from "remotion";
import {
  easeOutCubic,
  easeOutExpo,
  easeOutQuart,
  easeOutBack,
  progress,
  impulse,
} from "./easing";

// ═══════════════════════════════════════════════════════════════════
//  SAFE IMAGE — graceful fallback when URL is missing
// ═══════════════════════════════════════════════════════════════════
export function SafeImg({
  src,
  style,
}: {
  src: string | null | undefined;
  style?: React.CSSProperties;
}) {
  if (!src) return null;
  return <Img src={src} style={style} />;
}

// ═══════════════════════════════════════════════════════════════════
//  SCENE LIFECYCLE — wraps scene content with enter + exit transitions
//  Each scene smoothly eases in and out for cinematic continuity.
// ═══════════════════════════════════════════════════════════════════
type LifecycleMotion = "fade" | "zoom" | "slideUp" | "blur" | "scaleDown";

export function SceneLifecycle({
  children,
  durationInFrames,
  enter = "zoom",
  exit = "fade",
  enterDuration = 18,
  exitDuration = 14, // = SCENE_OVERLAP_FRAMES — keeps crossfade aligned
  style,
}: {
  children: React.ReactNode;
  durationInFrames: number;
  enter?: LifecycleMotion;
  exit?: LifecycleMotion;
  enterDuration?: number;
  exitDuration?: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const inP = easeOutExpo(progress(frame, 0, enterDuration));
  const outP = easeOutCubic(
    progress(frame, durationInFrames - exitDuration, durationInFrames),
  );

  let scale = 1;
  let translateY = 0;
  let blur = 0;

  if (enter === "zoom") scale *= interpolate(inP, [0, 1], [1.12, 1]);
  if (enter === "scaleDown") scale *= interpolate(inP, [0, 1], [0.88, 1]);
  if (enter === "slideUp") translateY += interpolate(inP, [0, 1], [80, 0]);
  if (enter === "blur") blur += interpolate(inP, [0, 1], [24, 0]);

  if (exit === "zoom") scale *= interpolate(outP, [0, 1], [1, 1.08]);
  if (exit === "scaleDown") scale *= interpolate(outP, [0, 1], [1, 0.92]);
  if (exit === "slideUp") translateY += interpolate(outP, [0, 1], [0, -60]);
  if (exit === "blur") blur += interpolate(outP, [0, 1], [0, 20]);

  const opacity = inP * (1 - outP);

  return (
    <div
      style={{
        ...style,
        position: "absolute",
        inset: 0,
        opacity,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        filter: blur > 0.1 ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  KINETIC TYPOGRAPHY — staggered reveal of words/chars/lines
//  The backbone of After Effects-style title animation.
// ═══════════════════════════════════════════════════════════════════
export function KineticText({
  text,
  start = 0,
  mode = "word",
  stagger = 3,
  perItemDuration = 16,
  riseDistance = 32,
  style,
  itemStyle,
}: {
  text: string;
  start?: number;
  mode?: "word" | "char" | "line";
  stagger?: number;
  perItemDuration?: number;
  riseDistance?: number;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();

  let items: string[];
  if (mode === "char") {
    items = Array.from(text);
  } else if (mode === "line") {
    items = text
      .split(/\n|(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  } else {
    items = text.split(/\s+/).filter(Boolean);
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: mode === "char" ? 0 : "0.3em",
        justifyContent: "center",
        alignItems: "baseline",
        ...style,
      }}
    >
      {items.map((item, i) => {
        const localStart = start + i * stagger;
        const p = easeOutExpo(
          progress(frame, localStart, localStart + perItemDuration),
        );
        const rise = (1 - p) * riseDistance;
        const itemScale = 0.88 + p * 0.12;
        const blurAmount = (1 - p) * 10;
        return (
          <span
            key={`${i}-${item}`}
            style={{
              display: "inline-block",
              opacity: p,
              transform: `translateY(${rise}px) scale(${itemScale})`,
              filter: blurAmount > 0.5 ? `blur(${blurAmount}px)` : undefined,
              whiteSpace: mode === "char" ? "pre" : undefined,
              willChange: "transform, opacity",
              ...itemStyle,
            }}
          >
            {item === " " ? "\u00A0" : item}
          </span>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  ANIMATED GRADIENT BACKGROUND — living, breathing gradient
// ═══════════════════════════════════════════════════════════════════
export function AnimatedGradient({
  colors,
  angle = 135,
  oscillateAngle = 20,
  speed = 0.01,
}: {
  colors: string[];
  angle?: number;
  oscillateAngle?: number;
  speed?: number;
}) {
  const frame = useCurrentFrame();
  const a = angle + Math.sin(frame * speed) * oscillateAngle;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(${a}deg, ${colors.join(", ")})`,
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
//  GRADIENT ORBS — giant blurred color blobs that drift for depth
// ═══════════════════════════════════════════════════════════════════
export function GradientOrbs({
  colors = ["#ff6b3555", "#6366f155", "#06b6d455"],
  count = 3,
  seed = 1,
  blur = 90,
}: {
  colors?: string[];
  count?: number;
  seed?: number;
  blur?: number;
}) {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const orbs = Array.from({ length: count }, (_, i) => {
    const rx = random(`orb-${seed}-${i}-x`);
    const ry = random(`orb-${seed}-${i}-y`);
    const rs = random(`orb-${seed}-${i}-s`);
    const driftSpeed = 1.8 + rs * 1.5;
    const cx =
      rx * width + Math.sin(frame / (fps * driftSpeed) + i * 1.1) * 120;
    const cy =
      ry * height + Math.cos(frame / (fps * (driftSpeed + 0.3)) + i * 0.7) * 120;
    const size = 340 + rs * 420;
    const color = colors[i % colors.length];
    return { cx, cy, size, color, i };
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {orbs.map((o) => (
        <div
          key={o.i}
          style={{
            position: "absolute",
            left: o.cx - o.size / 2,
            top: o.cy - o.size / 2,
            width: o.size,
            height: o.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            filter: `blur(${blur}px)`,
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  PARTICLE FIELD — drifting specs for depth & motion
// ═══════════════════════════════════════════════════════════════════
export function ParticleField({
  count = 40,
  color = "rgba(255,255,255,0.55)",
  seed = 1,
  maxSize = 6,
}: {
  count?: number;
  color?: string;
  seed?: number;
  maxSize?: number;
}) {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const particles = Array.from({ length: count }, (_, i) => {
    const rx = random(`pt-${seed}-${i}-x`);
    const ry = random(`pt-${seed}-${i}-y`);
    const rs = random(`pt-${seed}-${i}-s`);
    const size = 1.5 + rs * maxSize;
    const vy = 0.3 + rs * 1.5;
    const x = rx * width + Math.sin(frame / (fps * (1.2 + rs))) * 45;
    const rawY = ry * height - frame * vy;
    const y = ((rawY % height) + height) % height;
    const op = 0.25 + rs * 0.75;
    return { x, y, size, op, i };
  });
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {particles.map((p) => (
        <div
          key={p.i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: p.size,
            background: color,
            opacity: p.op,
            filter: "blur(1.2px)",
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  NOISE / GRAIN overlay — adds cinematic texture
// ═══════════════════════════════════════════════════════════════════
export function NoiseOverlay({ opacity = 0.08 }: { opacity?: number }) {
  const svg = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='220' height='220' filter='url(%23n)' opacity='0.65'/></svg>")`;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: svg,
        backgroundSize: "220px 220px",
        mixBlendMode: "overlay",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
//  GLOW PULSE — pulsating radial glow around a focal point
// ═══════════════════════════════════════════════════════════════════
export function GlowPulse({
  color,
  size = 520,
  intensityMax = 0.55,
  speed = 0.7,
}: {
  color: string;
  size?: number;
  intensityMax?: number;
  speed?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = 0.5 + Math.sin(frame / (fps * speed)) * 0.5;
  const alpha = Math.round(pulse * intensityMax * 255)
    .toString(16)
    .padStart(2, "0");
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}${alpha} 0%, transparent 65%)`,
        filter: "blur(50px)",
        pointerEvents: "none",
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
//  KEN BURNS — slow cinematic zoom + drift for hero images
// ═══════════════════════════════════════════════════════════════════
export function useKenBurns(
  durationFrames: number,
  intensity = 0.1,
): React.CSSProperties {
  const frame = useCurrentFrame();
  const t = Math.min(1, frame / Math.max(1, durationFrames));
  const scale = 1 + intensity * t;
  const tx = Math.sin(t * Math.PI) * 14;
  const ty = Math.cos(t * Math.PI * 0.7) * 10;
  return {
    transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
    transformOrigin: "center center",
  };
}

// ═══════════════════════════════════════════════════════════════════
//  MASK REVEAL — clip-path wipe reveal
// ═══════════════════════════════════════════════════════════════════
export function MaskReveal({
  children,
  start = 0,
  duration = 22,
  direction = "left",
  style,
}: {
  children: React.ReactNode;
  start?: number;
  duration?: number;
  direction?: "left" | "right" | "up" | "down" | "circle";
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const p = easeOutQuart(progress(frame, start, start + duration));
  let clip = "";
  if (direction === "left") clip = `inset(0 ${(1 - p) * 100}% 0 0)`;
  else if (direction === "right") clip = `inset(0 0 0 ${(1 - p) * 100}%)`;
  else if (direction === "up") clip = `inset(${(1 - p) * 100}% 0 0 0)`;
  else if (direction === "down") clip = `inset(0 0 ${(1 - p) * 100}% 0)`;
  else clip = `circle(${p * 75}% at 50% 50%)`;
  return (
    <div style={{ ...style, clipPath: clip, WebkitClipPath: clip }}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  POP-IN — spring-based scale entry for focal elements
// ═══════════════════════════════════════════════════════════════════
export function usePopIn(
  startFrame: number,
  opts?: { damping?: number; stiffness?: number; mass?: number },
): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - startFrame,
    fps,
    config: {
      damping: opts?.damping ?? 12,
      stiffness: opts?.stiffness ?? 130,
      mass: opts?.mass ?? 0.6,
    },
  });
}

// ═══════════════════════════════════════════════════════════════════
//  ANIMATED UNDERLINE — draws a line under a title
// ═══════════════════════════════════════════════════════════════════
export function AnimatedUnderline({
  color,
  width = 140,
  height = 5,
  start = 0,
  duration = 22,
  glow = true,
}: {
  color: string;
  width?: number;
  height?: number;
  start?: number;
  duration?: number;
  glow?: boolean;
}) {
  const frame = useCurrentFrame();
  const p = easeOutExpo(progress(frame, start, start + duration));
  return (
    <div
      style={{
        width: width * p,
        height,
        background: color,
        borderRadius: height,
        boxShadow: glow ? `0 0 24px ${color}, 0 0 50px ${color}aa` : undefined,
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
//  CTA BUTTON — animated with shimmer sweep
// ═══════════════════════════════════════════════════════════════════
export function CTAButton({
  text,
  bg = "#ffffff",
  color = "#0a0a0a",
  startFrame = 0,
}: {
  text: string;
  bg?: string;
  color?: string;
  startFrame?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 10, stiffness: 140, mass: 0.5 },
  });
  const scale = interpolate(s, [0, 1], [0.55, 1]);
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const shimmerX = ((Math.max(0, frame - startFrame)) * 6) % 520;

  return (
    <div
      style={{
        display: "inline-block",
        position: "relative",
        overflow: "hidden",
        background: bg,
        color,
        padding: "20px 56px",
        borderRadius: 100,
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: 0.6,
        opacity,
        transform: `scale(${scale})`,
        boxShadow: `0 24px 50px rgba(0,0,0,0.35), 0 0 80px ${bg}55`,
      }}
    >
      <span style={{ position: "relative", zIndex: 1 }}>{text}</span>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: shimmerX - 160,
          width: 90,
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
          transform: "skewX(-22deg)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  FLOATING CARD — subtle sinusoidal vertical float (y = ±n px)
// ═══════════════════════════════════════════════════════════════════
export function useFloat(amplitude = 8, periodSeconds = 3): string {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const y = Math.sin(frame / (fps * periodSeconds) * Math.PI * 2) * amplitude;
  return `translateY(${y}px)`;
}

// ═══════════════════════════════════════════════════════════════════
//  3D PERSPECTIVE TILT — gentle parallax rotation that settles
// ═══════════════════════════════════════════════════════════════════
export function usePerspectiveSettle(
  startFrame: number,
  duration = 30,
  fromAngle = 12,
): string {
  const frame = useCurrentFrame();
  const p = easeOutExpo(progress(frame, startFrame, startFrame + duration));
  const angle = (1 - p) * fromAngle;
  return `perspective(1400px) rotateX(${angle}deg)`;
}

// ═══════════════════════════════════════════════════════════════════
//  SHAKE / IMPACT — small punch when an element lands
// ═══════════════════════════════════════════════════════════════════
export function useImpact(startFrame: number, duration = 10): string {
  const frame = useCurrentFrame();
  const p = progress(frame, startFrame, startFrame + duration);
  const decay = Math.exp(-5 * p);
  const dx = Math.sin(p * Math.PI * 6) * 8 * decay;
  const dy = Math.cos(p * Math.PI * 4) * 4 * decay;
  return `translate(${dx}px, ${dy}px)`;
}

// ═══════════════════════════════════════════════════════════════════
//  GRID PATTERN BG — subtle modern tech backdrop
// ═══════════════════════════════════════════════════════════════════
export function GridPattern({
  color = "rgba(255,255,255,0.06)",
  size = 60,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        maskImage:
          "radial-gradient(circle at 50% 50%, black 40%, transparent 85%)",
        WebkitMaskImage:
          "radial-gradient(circle at 50% 50%, black 40%, transparent 85%)",
        pointerEvents: "none",
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
//  COUNTER-UP — animates a number from 0 to target
// ═══════════════════════════════════════════════════════════════════
export function useCounterUp(
  target: number,
  startFrame: number,
  duration = 30,
): number {
  const frame = useCurrentFrame();
  const p = easeOutExpo(progress(frame, startFrame, startFrame + duration));
  return Math.round(target * p);
}

// ═══════════════════════════════════════════════════════════════════
//  CROSS-SCENE TRANSITIONS
//  Each scene's render Sequence is extended by SCENE_OVERLAP_FRAMES
//  beyond its logical end. The next scene starts at the logical end,
//  so both scenes render simultaneously during the overlap window —
//  creating a true crossfade as the exit fades out and the enter fades in.
// ═══════════════════════════════════════════════════════════════════
export const SCENE_OVERLAP_FRAMES = 14;

export interface SceneSequenceItem<T> {
  scene: T;
  from: number;
  durationInFrames: number;
  isLast: boolean;
}

export function buildSceneSequences<
  T extends { duration_s: number },
>(scenes: T[], fps: number): SceneSequenceItem<T>[] {
  const result: SceneSequenceItem<T>[] = [];
  let logicalOffset = 0;
  for (let i = 0; i < scenes.length; i++) {
    const original = scenes[i];
    const isLast = i === scenes.length - 1;
    const baseFrames = Math.max(1, Math.round(original.duration_s * fps));
    const renderedFrames = isLast ? baseFrames : baseFrames + SCENE_OVERLAP_FRAMES;
    // Inflate scene.duration_s so the inner scene component computes the
    // SAME extended duration when it does scene.duration_s * fps. This keeps
    // SceneLifecycle's exit window aligned with the actual render length.
    const extendedScene = {
      ...original,
      duration_s: renderedFrames / fps,
    } as T;
    result.push({
      scene: extendedScene,
      from: logicalOffset,
      durationInFrames: renderedFrames,
      isLast,
    });
    logicalOffset += baseFrames;
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════
//  ASSET URL RESOLVER — scene.assets[0] → resolved URL (or null)
// ═══════════════════════════════════════════════════════════════════
export function firstAssetUrl(
  scene: any,
  assetUrls: Record<string, string>,
): string | null {
  const a = scene.assets?.[0];
  if (!a) return null;
  return a.url || (a.id ? assetUrls[a.id] : null) || null;
}

// ═══════════════════════════════════════════════════════════════════
//  TEXT SPLITTING — break scene text into lines on bullets + sentences
// ═══════════════════════════════════════════════════════════════════
const LINE_SPLIT_REGEX = /[•·\n]+|(?<=[.!?])\s+/;

export function splitToLines(text: string, limit = 4): string[] {
  return text
    .split(LINE_SPLIT_REGEX)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, limit);
}

// ═══════════════════════════════════════════════════════════════════
// ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
// ▰  AFTER EFFECTS-QUALITY PRIMITIVES                                ▰
// ▰  Advanced motion design components for cinematic storytelling.  ▰
// ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
//  CINEMATIC POST-FX — global overlay: film grain + vignette + flare
//  Drop this as the TOP-MOST child of an AbsoluteFill to instantly
//  elevate any composition to cinematic quality.
// ═══════════════════════════════════════════════════════════════════
export function CinematicPostFX({
  grain = 0.09,
  vignette = 0.55,
  scanlines = false,
  warmth = 0.08,
  chromaticAberration = 0.4,
}: {
  grain?: number;
  vignette?: number;
  scanlines?: boolean;
  warmth?: number;
  chromaticAberration?: number;
}) {
  const frame = useCurrentFrame();
  // Shifting grain seed per frame for authentic 24fps film look
  const grainSeed = Math.floor(frame / 2) * 37;
  return (
    <>
      {/* Subtle teal/orange color grade — the cinematic lookup-table look */}
      {warmth > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, rgba(255,140,60,${warmth}) 0%, transparent 40%, rgba(20,40,80,${warmth * 0.7}) 100%)`,
            mixBlendMode: "overlay",
            pointerEvents: "none",
          }}
        />
      )}
      {/* Chromatic aberration — a faint red/blue fringe on the edges */}
      {chromaticAberration > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at center, transparent 55%, rgba(255,0,80,${chromaticAberration * 0.08}) 85%, rgba(0,100,255,${chromaticAberration * 0.1}) 100%)`,
            mixBlendMode: "screen",
            pointerEvents: "none",
          }}
        />
      )}
      {/* Vignette — darken the edges */}
      {vignette > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,${vignette}) 100%)`,
            pointerEvents: "none",
          }}
        />
      )}
      {/* Animated film grain — re-seeds every couple frames */}
      {grain > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='g${grainSeed}'><feTurbulence type='fractalNoise' baseFrequency='1.7' numOctaves='2' seed='${grainSeed}'/></filter><rect width='180' height='180' filter='url(%23g${grainSeed})' opacity='0.9'/></svg>")`,
            backgroundSize: "180px 180px",
            mixBlendMode: "overlay",
            opacity: grain,
            pointerEvents: "none",
          }}
        />
      )}
      {scanlines && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, transparent 2px, transparent 4px)",
            mixBlendMode: "multiply",
            opacity: 0.35,
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  GLITCH FX — RGB split + horizontal slice displacement
//  Authentic digital glitch for sci-fi / cyberpunk moments.
// ═══════════════════════════════════════════════════════════════════
export function GlitchFX({
  children,
  intensity = 1,
  startFrame = 0,
  glitchEvery = 60,
}: {
  children: React.ReactNode;
  intensity?: number;
  startFrame?: number;
  glitchEvery?: number;
}) {
  const frame = useCurrentFrame();
  const active = frame >= startFrame;
  // Burst every N frames for ~4 frames
  const cycle = Math.max(0, frame - startFrame) % glitchEvery;
  const burst = cycle < 4 ? 1 : 0;
  const offsetR = active ? (random(`gr-${Math.floor(frame / 3)}`) - 0.5) * 12 * intensity : 0;
  const offsetB = active ? (random(`gb-${Math.floor(frame / 3)}`) - 0.5) * 12 * intensity : 0;
  const sliceY = burst ? random(`gy-${frame}`) * 100 : 0;
  const sliceH = burst ? 4 + random(`gh-${frame}`) * 20 : 0;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Red channel */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${offsetR}px)`,
          mixBlendMode: "screen",
          filter: "url(#none)", // keep filter slot so browser caches
          opacity: 0.85,
        }}
      >
        <div style={{ position: "absolute", inset: 0, filter: "saturate(2) hue-rotate(-20deg)" }}>
          {children}
        </div>
      </div>
      {/* Blue channel */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${offsetB}px)`,
          mixBlendMode: "screen",
          opacity: 0.85,
        }}
      >
        <div style={{ position: "absolute", inset: 0, filter: "saturate(2) hue-rotate(180deg)" }}>
          {children}
        </div>
      </div>
      {/* Base */}
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
      {/* Horizontal glitch slice */}
      {burst > 0 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: `${sliceY}%`,
            width: "100%",
            height: `${sliceH}px`,
            background: "rgba(255,255,255,0.08)",
            mixBlendMode: "difference",
            transform: `translateX(${(random(`sx-${frame}`) - 0.5) * 30}px)`,
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  TYPEWRITER TEXT — character-by-character reveal with blinking cursor
// ═══════════════════════════════════════════════════════════════════
export function TypewriterText({
  text,
  start = 0,
  cps = 22,
  cursor = true,
  cursorChar = "▊",
  style,
}: {
  text: string;
  start?: number;
  cps?: number;
  cursor?: boolean;
  cursorChar?: string;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, frame - start);
  const count = Math.min(text.length, Math.floor((elapsed / fps) * cps));
  const visible = text.slice(0, count);
  const showCursor = cursor && (Math.floor(frame / (fps * 0.5)) % 2 === 0 || count < text.length);
  return (
    <div style={style}>
      {visible}
      {showCursor && (
        <span style={{ opacity: 0.85, display: "inline-block", marginLeft: 2 }}>
          {cursorChar}
        </span>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  WAVY TEXT — per-character sine-wave vertical offset
// ═══════════════════════════════════════════════════════════════════
export function WavyText({
  text,
  amplitude = 8,
  wavelength = 0.4,
  speed = 0.08,
  style,
  itemStyle,
}: {
  text: string;
  amplitude?: number;
  wavelength?: number;
  speed?: number;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const chars = Array.from(text);
  return (
    <div style={{ display: "inline-flex", ...style }}>
      {chars.map((ch, i) => {
        const y = Math.sin(frame * speed + i * wavelength) * amplitude;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${y}px)`,
              whiteSpace: "pre",
              ...itemStyle,
            }}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  MORPHING BLOB — SVG path that smoothly morphs between organic shapes
//  Used as a dynamic background accent or masked reveal shape.
// ═══════════════════════════════════════════════════════════════════
export function MorphingBlob({
  color = "#ff6b35",
  size = 420,
  speed = 0.012,
  seed = 1,
  opacity = 0.55,
  style,
}: {
  color?: string;
  size?: number;
  speed?: number;
  seed?: number;
  opacity?: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  // Build a smooth closed path with 8 control points oscillating around a circle
  const points = 8;
  const cx = 200;
  const cy = 200;
  const baseR = 140;
  const pathPoints: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const wobble =
      Math.sin(frame * speed + i * 0.8 + seed) * 28 +
      Math.cos(frame * speed * 1.7 + i * 1.3 + seed) * 20;
    const r = baseR + wobble;
    pathPoints.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  // Catmull-Rom-to-Bezier approximation: connect with quadratic Beziers
  const d = pathPoints
    .map((p, i) => {
      const next = pathPoints[(i + 1) % points];
      const mx = (p[0] + next[0]) / 2;
      const my = (p[1] + next[1]) / 2;
      return i === 0 ? `M ${mx} ${my}` : `Q ${p[0]} ${p[1]} ${mx} ${my}`;
    })
    .join(" ") + " Z";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      style={{ opacity, ...style }}
    >
      <defs>
        <radialGradient id={`blob-grad-${seed}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="60%" stopColor={color} stopOpacity="0.7" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <filter id={`blob-blur-${seed}`}>
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <path d={d} fill={`url(#blob-grad-${seed})`} filter={`url(#blob-blur-${seed})`} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  LIGHT LEAK — diagonal cinematic light sweep (like film burn)
// ═══════════════════════════════════════════════════════════════════
export function LightLeak({
  color = "rgba(255,180,80,0.45)",
  startFrame = 0,
  duration = 60,
  angle = -20,
}: {
  color?: string;
  startFrame?: number;
  duration?: number;
  angle?: number;
}) {
  const frame = useCurrentFrame();
  const p = progress(frame, startFrame, startFrame + duration);
  // Sweep from left to right with smooth in/out
  const pos = interpolate(p, [0, 0.5, 1], [-40, 50, 140]);
  const op = Math.sin(p * Math.PI); // 0 → 1 → 0
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(${angle}deg, transparent ${pos - 15}%, ${color} ${pos}%, transparent ${pos + 15}%)`,
        mixBlendMode: "screen",
        opacity: op * 0.9,
        pointerEvents: "none",
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
//  LENS FLARE — anamorphic streak (the JJ Abrams look)
// ═══════════════════════════════════════════════════════════════════
export function LensFlare({
  x = 50,
  y = 40,
  color = "rgba(255,255,255,0.9)",
  startFrame = 0,
  duration = 30,
  width = "70%",
}: {
  x?: number;
  y?: number;
  color?: string;
  startFrame?: number;
  duration?: number;
  width?: string;
}) {
  const frame = useCurrentFrame();
  const p = easeOutExpo(progress(frame, startFrame, startFrame + duration));
  const op = Math.sin(p * Math.PI) * 0.9;
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        width,
        height: 5,
        background: `linear-gradient(90deg, transparent 0%, ${color} 45%, ${color} 55%, transparent 100%)`,
        filter: "blur(3px)",
        opacity: op,
        pointerEvents: "none",
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
//  CINEMATIC BARS — top/bottom letterbox for that 2.35:1 look
// ═══════════════════════════════════════════════════════════════════
export function CinematicBars({
  heightPct = 12,
  startFrame = 0,
  duration = 16,
}: {
  heightPct?: number;
  startFrame?: number;
  duration?: number;
}) {
  const frame = useCurrentFrame();
  const p = easeOutExpo(progress(frame, startFrame, startFrame + duration));
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: `${heightPct * p}%`,
          background: "#000",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: `${heightPct * p}%`,
          background: "#000",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  RING PULSE — expanding circles radiating from a point (like radar)
// ═══════════════════════════════════════════════════════════════════
export function RingPulse({
  x = 50,
  y = 50,
  color = "#ffffff",
  count = 3,
  maxSize = 520,
  startFrame = 0,
  period = 50,
}: {
  x?: number;
  y?: number;
  color?: string;
  count?: number;
  maxSize?: number;
  startFrame?: number;
  period?: number;
}) {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const offset = (i / count) * period;
        const t = ((Math.max(0, frame - startFrame) + offset) % period) / period;
        const size = maxSize * easeOutCubic(t);
        const op = (1 - t) * 0.55;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              borderRadius: "50%",
              border: `2px solid ${color}`,
              opacity: op,
            }}
          />
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  NUMBER TICKER — odometer-style rolling number (for stats / counters)
// ═══════════════════════════════════════════════════════════════════
export function NumberTicker({
  value,
  startFrame = 0,
  duration = 40,
  prefix = "",
  suffix = "",
  style,
}: {
  value: number;
  startFrame?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const p = easeOutExpo(progress(frame, startFrame, startFrame + duration));
  const current = Math.round(value * p);
  const formatted = current.toLocaleString();
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  CAMERA SHAKE — cinematic micro-shake (AE "wiggle(freq, amp)")
// ═══════════════════════════════════════════════════════════════════
export function useCameraShake(
  frequency = 2,
  amplitude = 3,
): React.CSSProperties {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const dx = (random(`shake-x-${Math.floor(t * frequency * 7)}`) - 0.5) * amplitude * 2;
  const dy = (random(`shake-y-${Math.floor(t * frequency * 7)}`) - 0.5) * amplitude * 2;
  return { transform: `translate(${dx}px, ${dy}px)` };
}

// ═══════════════════════════════════════════════════════════════════
//  PARALLAX LAYERS — 3 depth planes drift at different speeds
// ═══════════════════════════════════════════════════════════════════
export function ParallaxLayers({
  layers,
}: {
  layers: { content: React.ReactNode; depth: number }[];
}) {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {layers.map((layer, i) => {
        const driftX = Math.sin(frame * 0.006) * (30 * layer.depth);
        const driftY = Math.cos(frame * 0.005) * (16 * layer.depth);
        const scale = 1 + layer.depth * 0.04;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              transform: `translate(${driftX}px, ${driftY}px) scale(${scale})`,
            }}
          >
            {layer.content}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  FLOATING SHAPES — geometric decorative shapes drifting in background
// ═══════════════════════════════════════════════════════════════════
export function FloatingShapes({
  color = "rgba(255,255,255,0.08)",
  count = 8,
  seed = 1,
}: {
  color?: string;
  count?: number;
  seed?: number;
}) {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const shapes = Array.from({ length: count }, (_, i) => {
    const rx = random(`fs-${seed}-${i}-x`);
    const ry = random(`fs-${seed}-${i}-y`);
    const rs = random(`fs-${seed}-${i}-s`);
    const rt = random(`fs-${seed}-${i}-t`);
    const size = 28 + rs * 120;
    const x = rx * width + Math.sin(frame / (fps * (2 + rs))) * 36;
    const y = ry * height + Math.cos(frame / (fps * (2.5 + rs))) * 36;
    const rotation = frame * (0.3 + rs * 0.8) * (rt > 0.5 ? 1 : -1);
    const shape = Math.floor(rt * 3); // 0=square, 1=circle, 2=triangle
    return { x, y, size, rotation, shape, i };
  });
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {shapes.map((s) => {
        const common: React.CSSProperties = {
          position: "absolute",
          left: s.x - s.size / 2,
          top: s.y - s.size / 2,
          width: s.size,
          height: s.size,
          transform: `rotate(${s.rotation}deg)`,
        };
        if (s.shape === 0)
          return (
            <div
              key={s.i}
              style={{
                ...common,
                background: color,
                borderRadius: 8,
              }}
            />
          );
        if (s.shape === 1)
          return (
            <div
              key={s.i}
              style={{ ...common, border: `3px solid ${color}`, borderRadius: "50%" }}
            />
          );
        return (
          <div
            key={s.i}
            style={{
              ...common,
              width: 0,
              height: 0,
              background: "transparent",
              borderLeft: `${s.size / 2}px solid transparent`,
              borderRight: `${s.size / 2}px solid transparent`,
              borderBottom: `${s.size}px solid ${color}`,
            }}
          />
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  SWEEP HIGHLIGHT — horizontal light bar sweeping across a region
// ═══════════════════════════════════════════════════════════════════
export function SweepHighlight({
  startFrame = 0,
  duration = 40,
  color = "rgba(255,255,255,0.35)",
}: {
  startFrame?: number;
  duration?: number;
  color?: string;
}) {
  const frame = useCurrentFrame();
  const p = easeOutExpo(progress(frame, startFrame, startFrame + duration));
  const x = interpolate(p, [0, 1], [-30, 130]);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(100deg, transparent ${x - 15}%, ${color} ${x}%, transparent ${x + 15}%)`,
        pointerEvents: "none",
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
//  TEXT BURST — words explode outward from a center point on entry
// ═══════════════════════════════════════════════════════════════════
export function TextBurst({
  text,
  start = 0,
  duration = 26,
  style,
  itemStyle,
}: {
  text: string;
  start?: number;
  duration?: number;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <div
      style={{
        display: "flex",
        gap: "0.35em",
        justifyContent: "center",
        flexWrap: "wrap",
        ...style,
      }}
    >
      {words.map((w, i) => {
        const localStart = start + i * 2;
        const p = easeOutBack(progress(frame, localStart, localStart + duration));
        const angle = (random(`tb-${i}`) - 0.5) * 0.6;
        const dist = (1 - p) * 120;
        const rot = (1 - p) * angle * 40;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) rotate(${rot}deg) scale(${0.4 + p * 0.6})`,
              ...itemStyle,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  GRADIENT BORDER RING — animated gradient border (for cards/frames)
// ═══════════════════════════════════════════════════════════════════
export function GradientBorderRing({
  children,
  borderWidth = 3,
  radius = 20,
  colors = ["#ff6b35", "#6366f1", "#06b6d4", "#ff6b35"],
  speed = 0.02,
  style,
}: {
  children: React.ReactNode;
  borderWidth?: number;
  radius?: number;
  colors?: string[];
  speed?: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const angle = (frame * speed * 360) % 360;
  return (
    <div
      style={{
        position: "relative",
        padding: borderWidth,
        borderRadius: radius,
        background: `conic-gradient(from ${angle}deg, ${colors.join(", ")})`,
        ...style,
      }}
    >
      <div
        style={{
          borderRadius: radius - borderWidth,
          overflow: "hidden",
          background: "#0a0a0a",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  SOUND WAVE BARS — stylised audio bars (visual only, no real audio)
// ═══════════════════════════════════════════════════════════════════
export function SoundWaveBars({
  count = 24,
  color = "#ffffff",
  width = 360,
  height = 60,
  speed = 0.12,
}: {
  count?: number;
  color?: string;
  width?: number;
  height?: number;
  speed?: number;
}) {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        width,
        height,
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const h = (Math.sin(frame * speed + i * 0.6) * 0.5 + 0.6) * height;
        return (
          <div
            key={i}
            style={{
              width: (width - (count - 1) * 4) / count,
              height: h,
              background: color,
              borderRadius: 2,
              boxShadow: `0 0 12px ${color}99`,
            }}
          />
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  TEMPLATE ROOT — shared composition shell with auto-applied PostFX.
//  Every template wraps its scenes in this component so the cinematic
//  layer (grain, vignette, chromatic aberration, color grade) is
//  guaranteed on every single render. Pass `postFX` to customize or
//  `postFX={false}` to opt out.
// ═══════════════════════════════════════════════════════════════════
export type TemplatePostFX = Partial<{
  grain: number;
  vignette: number;
  scanlines: boolean;
  warmth: number;
  chromaticAberration: number;
}>;

export function TemplateRoot({
  children,
  backgroundColor = "#000",
  postFX,
}: {
  children: React.ReactNode;
  backgroundColor?: string;
  postFX?: TemplatePostFX | false;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor,
        overflow: "hidden",
      }}
    >
      {children}
      {postFX !== false && <CinematicPostFX {...(postFX || {})} />}
    </div>
  );
}

// Re-export for templates
export { easeOutCubic, easeOutExpo, easeOutQuart, easeOutBack, progress, impulse };

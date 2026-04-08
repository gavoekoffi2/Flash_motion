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

// Re-export for templates
export { easeOutCubic, easeOutExpo, easeOutQuart, easeOutBack, progress, impulse };

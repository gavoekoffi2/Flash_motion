import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  random,
} from "remotion";
import {
  SafeImg,
  SceneLifecycle,
  KineticText,
  GradientOrbs,
  GridPattern,
  NoiseOverlay,
  GlowPulse,
  CTAButton,
  AnimatedUnderline,
  usePopIn,
  useFloat,
  easeOutExpo,
  easeOutBack,
  progress,
  buildSceneSequences,
} from "../utils/motion";

export interface NeonCyberpunkProps {
  scenes: any[];
  brand: { primary_color: string; logo_id: string | null };
  assetUrls: Record<string, string>;
}

const CYAN = "#00f0ff";
const MAGENTA = "#ff00aa";
const VIOLET = "#7a00ff";
const INK = "#030014";

function firstUrl(scene: any, assetUrls: Record<string, string>): string | null {
  const a = scene.assets?.[0];
  if (!a) return null;
  return a.url || (a.id ? assetUrls[a.id] : null) || null;
}

// ── Scanlines overlay ──
function Scanlines() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "repeating-linear-gradient(0deg, rgba(0,240,255,0.06) 0px, transparent 2px, transparent 4px)",
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
}

// ── Glitch blocks: random flickering rectangles ──
function GlitchBlocks({ seed = 1 }: { seed?: number }) {
  const frame = useCurrentFrame();
  const blocks = Array.from({ length: 6 }, (_, i) => {
    const phase = Math.floor(frame / 8 + i * 3);
    const on = random(`glitch-${seed}-${phase}-${i}`) > 0.72;
    if (!on) return null;
    const x = random(`gx-${seed}-${phase}-${i}`) * 100;
    const y = random(`gy-${seed}-${phase}-${i}`) * 100;
    const w = 40 + random(`gw-${seed}-${phase}-${i}`) * 220;
    const h = 2 + random(`gh-${seed}-${phase}-${i}`) * 8;
    const color = i % 2 === 0 ? CYAN : MAGENTA;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: w,
          height: h,
          background: color,
          opacity: 0.55,
          mixBlendMode: "screen",
          boxShadow: `0 0 12px ${color}`,
        }}
      />
    );
  });
  return <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{blocks}</div>;
}

// ── Neon frame border ──
function NeonFrame({ color = CYAN }: { color?: string }) {
  const frame = useCurrentFrame();
  const p = easeOutExpo(progress(frame, 4, 26));
  return (
    <div
      style={{
        position: "absolute",
        top: `${(1 - p) * 10 + 5}%`,
        left: `${(1 - p) * 10 + 5}%`,
        right: `${(1 - p) * 10 + 5}%`,
        bottom: `${(1 - p) * 10 + 5}%`,
        border: `2px solid ${color}`,
        boxShadow: `0 0 30px ${color}, inset 0 0 30px ${color}44`,
        opacity: p,
        pointerEvents: "none",
      }}
    />
  );
}

// ── Chromatic aberration wrapper for text ──
function ChromaticText({
  text,
  style,
}: {
  text: string;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const offset = 2 + Math.sin(frame * 0.4) * 1.5;
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        style={{
          position: "absolute",
          left: -offset,
          top: 0,
          color: CYAN,
          mixBlendMode: "screen",
          ...style,
        }}
      >
        {text}
      </div>
      <div
        style={{
          position: "absolute",
          left: offset,
          top: 0,
          color: MAGENTA,
          mixBlendMode: "screen",
          ...style,
        }}
      >
        {text}
      </div>
      <div style={{ position: "relative", color: "#fff", ...style }}>{text}</div>
    </div>
  );
}

// ── Hero — glitchy title ──
function CyberHero({
  scene,
  brand,
  assetUrls,
}: {
  scene: any;
  brand: any;
  assetUrls: Record<string, string>;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = scene.duration_s * fps;
  const imageUrl = firstUrl(scene, assetUrls);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="zoom"
      exit="blur"
      style={{
        background: `radial-gradient(ellipse at 60% 40%, ${VIOLET}55 0%, ${INK} 65%)`,
      }}
    >
      <GridPattern color="rgba(0,240,255,0.12)" size={60} />
      <GradientOrbs colors={[`${CYAN}44`, `${MAGENTA}44`, `${VIOLET}55`]} count={3} seed={scene.id} />
      <GlowPulse color={CYAN} size={680} intensityMax={0.4} speed={0.5} />
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            filter: "brightness(0.3) saturate(1.6) hue-rotate(200deg) blur(3px)",
            mixBlendMode: "screen",
          }}
        >
          <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <NeonFrame color={CYAN} />
      <GlitchBlocks seed={1} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "12% 8%",
          textAlign: "center",
          zIndex: 5,
        }}
      >
        <div
          style={{
            fontSize: 16,
            color: CYAN,
            letterSpacing: 10,
            fontFamily: "'Courier New', monospace",
            textTransform: "uppercase",
            marginBottom: 26,
            textShadow: `0 0 12px ${CYAN}`,
            opacity: easeOutExpo(progress(frame, 0, 20)),
          }}
        >
          &gt; SYSTEM.LOAD //
        </div>
        <KineticText
          text={scene.text}
          start={6}
          mode="word"
          stagger={4}
          perItemDuration={20}
          riseDistance={36}
          style={{ maxWidth: "92%" }}
          itemStyle={{
            fontSize: 58,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.1,
            letterSpacing: -0.5,
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            textTransform: "uppercase",
            textShadow: `0 0 18px ${CYAN}, 0 0 36px ${CYAN}, 4px 4px 0 ${MAGENTA}66`,
          }}
        />
        <div style={{ marginTop: 34 }}>
          <AnimatedUnderline color={MAGENTA} width={200} height={4} start={fps * 1.1} duration={24} />
        </div>
      </div>
      <Scanlines />
      <NoiseOverlay opacity={0.1} />
    </SceneLifecycle>
  );
}

// ── Feature scene — terminal card style ──
function CyberFeature({
  scene,
  brand,
  assetUrls,
}: {
  scene: any;
  brand: any;
  assetUrls: Record<string, string>;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = scene.duration_s * fps;
  const imageUrl = firstUrl(scene, assetUrls);
  const float = useFloat(5, 3.5);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="slideUp"
      exit="fade"
      style={{
        background: `linear-gradient(160deg, ${INK} 0%, #1a0033 100%)`,
      }}
    >
      <GridPattern color="rgba(255,0,170,0.1)" size={50} />
      <GradientOrbs colors={[`${MAGENTA}33`, `${CYAN}22`]} count={2} seed={scene.id + 7} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "14% 8%",
          zIndex: 5,
          transform: float,
        }}
      >
        {/* Terminal header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 26,
            fontFamily: "'Courier New', monospace",
            fontSize: 14,
            color: CYAN,
            letterSpacing: 3,
            opacity: easeOutExpo(progress(frame, 0, 20)),
          }}
        >
          <div
            style={{ width: 12, height: 12, borderRadius: 6, background: MAGENTA, boxShadow: `0 0 10px ${MAGENTA}` }}
          />
          <div
            style={{ width: 12, height: 12, borderRadius: 6, background: "#ffcc00", boxShadow: "0 0 10px #ffcc00" }}
          />
          <div
            style={{ width: 12, height: 12, borderRadius: 6, background: CYAN, boxShadow: `0 0 10px ${CYAN}` }}
          />
          <div style={{ marginLeft: 14 }}>root@cyber:~$ exec --scene</div>
        </div>

        {imageUrl && (
          <div
            style={{
              width: "85%",
              marginBottom: 26,
              border: `2px solid ${CYAN}`,
              boxShadow: `0 0 36px ${CYAN}66, inset 0 0 20px ${MAGENTA}33`,
              opacity: easeOutExpo(progress(frame, 6, 26)),
              filter: "brightness(0.85) saturate(1.2) hue-rotate(-10deg)",
              overflow: "hidden",
            }}
          >
            <SafeImg src={imageUrl} style={{ width: "100%", objectFit: "cover" }} />
          </div>
        )}

        <KineticText
          text={scene.text}
          start={fps * 0.5}
          mode="word"
          stagger={3}
          perItemDuration={16}
          style={{ justifyContent: "flex-start" }}
          itemStyle={{
            fontSize: 34,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.3,
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            textShadow: `0 0 10px ${CYAN}88, 2px 2px 0 ${MAGENTA}55`,
          }}
        />
      </div>
      <GlitchBlocks seed={scene.id + 5} />
      <Scanlines />
      <NoiseOverlay opacity={0.09} />
    </SceneLifecycle>
  );
}

// ── Outro — big glitched logo + CTA ──
function CyberOutro({
  scene,
  brand,
  assetUrls,
}: {
  scene: any;
  brand: any;
  assetUrls: Record<string, string>;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = scene.duration_s * fps;
  const imageUrl = firstUrl(scene, assetUrls);
  const logoSpring = usePopIn(3, { damping: 10, stiffness: 150 });

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="zoom"
      exit="fade"
      style={{
        background: `radial-gradient(circle at center, ${VIOLET}66 0%, ${INK} 70%)`,
      }}
    >
      <GridPattern color="rgba(0,240,255,0.1)" size={60} />
      <GradientOrbs colors={[`${CYAN}55`, `${MAGENTA}44`]} count={4} seed={scene.id + 22} />
      <GlowPulse color={MAGENTA} size={700} intensityMax={0.45} speed={0.6} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "10% 8%",
          textAlign: "center",
          zIndex: 5,
        }}
      >
        {imageUrl && (
          <div
            style={{
              width: 130,
              height: 130,
              marginBottom: 32,
              transform: `scale(${interpolate(logoSpring, [0, 1], [0.4, 1])})`,
              filter: `drop-shadow(0 0 30px ${CYAN}) drop-shadow(0 0 50px ${MAGENTA})`,
            }}
          >
            <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}
        <div
          style={{
            fontSize: 14,
            color: CYAN,
            letterSpacing: 10,
            fontFamily: "'Courier New', monospace",
            marginBottom: 18,
            opacity: easeOutExpo(progress(frame, 4, 24)),
            textShadow: `0 0 12px ${CYAN}`,
          }}
        >
          // END_OF_LINE
        </div>
        <KineticText
          text={scene.text}
          start={8}
          stagger={4}
          perItemDuration={18}
          style={{ marginBottom: 36, maxWidth: "92%" }}
          itemStyle={{
            fontSize: 50,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.12,
            letterSpacing: -0.4,
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            textTransform: "uppercase",
            textShadow: `0 0 16px ${CYAN}, 3px 3px 0 ${MAGENTA}66`,
          }}
        />
        <CTAButton text="ENTER THE GRID" bg={CYAN} color={INK} startFrame={fps * 1.2} />
      </div>
      <NeonFrame color={MAGENTA} />
      <GlitchBlocks seed={99} />
      <Scanlines />
      <NoiseOverlay opacity={0.1} />
    </SceneLifecycle>
  );
}

function CyberDispatch({
  scene,
  brand,
  assetUrls,
}: {
  scene: any;
  brand: any;
  assetUrls: Record<string, string>;
}) {
  switch (scene.type) {
    case "hero":
      return <CyberHero scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "outro":
      return <CyberOutro scene={scene} brand={brand} assetUrls={assetUrls} />;
    default:
      return <CyberFeature scene={scene} brand={brand} assetUrls={assetUrls} />;
  }
}

export const NeonCyberpunk: React.FC<NeonCyberpunkProps> = ({ scenes, brand, assetUrls }) => {
  const { fps } = useVideoConfig();
  const seqs = buildSceneSequences(scenes, fps);
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {seqs.map(({ scene, from, durationInFrames }) => (
        <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
          <CyberDispatch scene={scene} brand={brand} assetUrls={assetUrls} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export default NeonCyberpunk;

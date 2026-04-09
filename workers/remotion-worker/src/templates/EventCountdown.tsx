import React, { useMemo } from "react";
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
  ParticleField,
  NoiseOverlay,
  GlowPulse,
  CTAButton,
  AnimatedUnderline,
  usePopIn,
  useFloat,
  easeOutExpo,
  progress,
  buildSceneSequences,
  firstAssetUrl,
} from "../utils/motion";

export interface EventCountdownProps {
  scenes: any[];
  brand: { primary_color: string; logo_id: string | null };
  assetUrls: Record<string, string>;
}

const PURPLE = "#6d28d9";
const PINK = "#ec4899";
const GOLD = "#fbbf24";
const INK = "#1a0333";

const CONFETTI_COLORS = [PINK, GOLD, "#fff", PURPLE, "#06b6d4"];

// ── Confetti pieces — falling colored squares ──
function Confetti({ seed = 1 }: { seed?: number }) {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  // Static per-piece seed values never change — compute once per seed.
  const staticPieces = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        i,
        rx: random(`conf-x-${seed}-${i}`),
        ry: random(`conf-y-${seed}-${i}`),
        rs: random(`conf-s-${seed}-${i}`),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    [seed],
  );
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {staticPieces.map(({ i, rx, ry, rs, color }) => {
        const vy = 1.5 + rs * 3;
        const x = rx * width + Math.sin(frame / (fps * 0.6) + i) * 60;
        const rawY = ry * height - frame * vy;
        const y = ((rawY % (height + 80)) + height + 80) % (height + 80);
        const size = 6 + rs * 10;
        const rot = frame * (2 + rs * 4) + i * 20;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size * 0.6,
              background: color,
              transform: `rotate(${rot}deg)`,
              opacity: 0.85,
              boxShadow: `0 0 8px ${color}66`,
            }}
          />
        );
      })}
    </div>
  );
}

// ── Big digit tile (like countdown flip clock) ──
function DigitTile({
  label,
  value,
  startFrame,
  delay = 0,
}: {
  label: string;
  value: string;
  startFrame: number;
  delay?: number;
}) {
  const frame = useCurrentFrame();
  const spring = usePopIn(startFrame + delay, { damping: 11, stiffness: 140 });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `scale(${interpolate(spring, [0, 1], [0.2, 1])}) rotate(${(1 - spring) * -10}deg)`,
      }}
    >
      <div
        style={{
          padding: "18px 24px",
          minWidth: 110,
          background: `linear-gradient(180deg, ${PINK} 0%, ${PURPLE} 100%)`,
          borderRadius: 18,
          fontSize: 72,
          fontWeight: 900,
          color: "#fff",
          fontFamily: "'Arial Black', 'Impact', sans-serif",
          textAlign: "center",
          boxShadow: `0 20px 50px ${PURPLE}55, 0 0 60px ${PINK}44, inset 0 2px 0 rgba(255,255,255,0.3)`,
          border: "2px solid rgba(255,255,255,0.2)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 12,
          fontSize: 13,
          color: GOLD,
          letterSpacing: 4,
          textTransform: "uppercase",
          fontWeight: 800,
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ── Hero — event title with confetti ──
function EventHero({
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
  const imageUrl = firstAssetUrl(scene, assetUrls);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="zoom"
      exit="fade"
      style={{
        background: `linear-gradient(135deg, ${PURPLE} 0%, ${PINK} 60%, ${INK} 100%)`,
      }}
    >
      <GradientOrbs colors={[`${PINK}66`, `${GOLD}44`, `${PURPLE}55`]} count={4} seed={scene.id} />
      <GlowPulse color={GOLD} size={700} intensityMax={0.4} speed={0.6} />
      <ParticleField count={50} color="rgba(255,255,255,0.55)" seed={scene.id} maxSize={5} />
      <Confetti seed={scene.id} />
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.22,
            filter: "brightness(0.8) saturate(1.4) blur(2px)",
            mixBlendMode: "screen",
          }}
        >
          <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

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
            fontSize: 18,
            color: GOLD,
            letterSpacing: 8,
            textTransform: "uppercase",
            fontWeight: 900,
            marginBottom: 22,
            opacity: easeOutExpo(progress(frame, 0, 22)),
            textShadow: `0 0 18px ${GOLD}99`,
          }}
        >
          ✨ L'Événement de l'Année ✨
        </div>
        <KineticText
          text={scene.text}
          start={6}
          mode="word"
          stagger={5}
          perItemDuration={22}
          riseDistance={44}
          style={{ maxWidth: "94%" }}
          itemStyle={{
            fontSize: 70,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.05,
            letterSpacing: -1.2,
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            textShadow: `0 6px 30px rgba(0,0,0,0.5), 0 0 40px ${PINK}99`,
          }}
        />
        <div style={{ marginTop: 32 }}>
          <AnimatedUnderline color={GOLD} width={200} height={5} start={fps * 1.3} duration={22} />
        </div>
      </div>
      <NoiseOverlay opacity={0.06} />
    </SceneLifecycle>
  );
}

// ── Countdown scene — big digit tiles ──
function CountdownScene({
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

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="slideUp"
      exit="fade"
      style={{
        background: `radial-gradient(ellipse at center, ${PURPLE} 0%, ${INK} 75%)`,
      }}
    >
      <GradientOrbs colors={[`${PINK}55`, `${PURPLE}44`]} count={3} seed={scene.id + 7} />
      <ParticleField count={40} color="rgba(251,191,36,0.4)" seed={scene.id + 8} maxSize={4} />
      <Confetti seed={scene.id + 3} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "10% 6%",
          textAlign: "center",
          zIndex: 5,
        }}
      >
        <div
          style={{
            fontSize: 22,
            color: GOLD,
            letterSpacing: 6,
            textTransform: "uppercase",
            fontWeight: 900,
            marginBottom: 30,
            opacity: easeOutExpo(progress(frame, 0, 20)),
            textShadow: `0 0 16px ${GOLD}`,
          }}
        >
          Plus que...
        </div>

        <div
          style={{
            display: "flex",
            gap: 22,
            marginBottom: 38,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <DigitTile label="Jours" value="07" startFrame={2} delay={0} />
          <DigitTile label="Heures" value="14" startFrame={2} delay={4} />
          <DigitTile label="Minutes" value="32" startFrame={2} delay={8} />
        </div>

        <KineticText
          text={scene.text}
          start={fps * 0.8}
          mode="word"
          stagger={3}
          perItemDuration={16}
          style={{ maxWidth: "90%" }}
          itemStyle={{
            fontSize: 38,
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.2,
            letterSpacing: -0.3,
            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        />
      </div>
      <NoiseOverlay opacity={0.07} />
    </SceneLifecycle>
  );
}

// ── Detail scene — event info ──
function EventDetail({
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
  const imageUrl = firstAssetUrl(scene, assetUrls);
  const float = useFloat(8, 3.5);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="slideUp"
      exit="fade"
      style={{
        background: `linear-gradient(160deg, ${PINK} 0%, ${PURPLE} 50%, ${INK} 100%)`,
      }}
    >
      <GradientOrbs colors={[`${GOLD}44`, `${PINK}44`]} count={3} seed={scene.id + 11} />
      <Confetti seed={scene.id + 6} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "12% 8%",
          zIndex: 5,
          transform: float,
        }}
      >
        {imageUrl && (
          <div
            style={{
              width: "88%",
              alignSelf: "center",
              marginBottom: 26,
              borderRadius: 24,
              overflow: "hidden",
              border: "3px solid rgba(255,255,255,0.35)",
              boxShadow: `0 24px 60px rgba(0,0,0,0.45), 0 0 80px ${PINK}55`,
              opacity: easeOutExpo(progress(frame, 4, 26)),
              transform: `scale(${0.9 + easeOutExpo(progress(frame, 4, 26)) * 0.1})`,
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
          perItemDuration={18}
          riseDistance={34}
          itemStyle={{
            fontSize: 36,
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.25,
            letterSpacing: -0.3,
            textShadow: `0 4px 22px rgba(0,0,0,0.5), 0 0 24px ${GOLD}44`,
          }}
        />
      </div>
      <NoiseOverlay opacity={0.06} />
    </SceneLifecycle>
  );
}

// ── Outro — big CTA ──
function EventOutro({
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
  const imageUrl = firstAssetUrl(scene, assetUrls);
  const logoSpring = usePopIn(2, { damping: 10, stiffness: 150 });

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="zoom"
      exit="fade"
      style={{
        background: `radial-gradient(circle at center, ${PINK} 0%, ${PURPLE} 40%, ${INK} 90%)`,
      }}
    >
      <GradientOrbs colors={[`${GOLD}55`, `${PINK}44`]} count={4} seed={scene.id + 22} />
      <GlowPulse color={GOLD} size={720} intensityMax={0.5} speed={0.5} />
      <ParticleField count={56} color="rgba(255,255,255,0.55)" seed={scene.id + 44} maxSize={6} />
      <Confetti seed={scene.id + 9} />

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
              marginBottom: 30,
              transform: `scale(${interpolate(logoSpring, [0, 1], [0.3, 1])}) rotate(${(1 - logoSpring) * -20}deg)`,
              filter: `drop-shadow(0 0 36px ${GOLD}) drop-shadow(0 0 60px ${PINK}88)`,
            }}
          >
            <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}
        <div
          style={{
            fontSize: 22,
            color: GOLD,
            letterSpacing: 6,
            textTransform: "uppercase",
            fontWeight: 900,
            marginBottom: 22,
            opacity: easeOutExpo(progress(frame, 4, 22)),
            textShadow: `0 0 20px ${GOLD}`,
          }}
        >
          ✦ Soyez des nôtres ✦
        </div>
        <KineticText
          text={scene.text}
          start={10}
          stagger={4}
          perItemDuration={20}
          style={{ marginBottom: 38, maxWidth: "92%" }}
          itemStyle={{
            fontSize: 58,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.1,
            letterSpacing: -0.8,
            textShadow: `0 6px 30px rgba(0,0,0,0.5), 0 0 40px ${PINK}88`,
          }}
        />
        <CTAButton text="Réserver ma place" bg={GOLD} color={INK} startFrame={fps * 1.3} />
      </div>
      <NoiseOverlay opacity={0.06} />
    </SceneLifecycle>
  );
}

function EventDispatch({
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
      return <EventHero scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "feature_list":
      return <CountdownScene scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "outro":
      return <EventOutro scene={scene} brand={brand} assetUrls={assetUrls} />;
    default:
      return <EventDetail scene={scene} brand={brand} assetUrls={assetUrls} />;
  }
}

export const EventCountdown: React.FC<EventCountdownProps> = ({ scenes, brand, assetUrls }) => {
  const { fps } = useVideoConfig();
  const seqs = buildSceneSequences(scenes, fps);
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {seqs.map(({ scene, from, durationInFrames }) => (
        <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
          <EventDispatch scene={scene} brand={brand} assetUrls={assetUrls} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export default EventCountdown;

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import {
  SafeImg,
  SceneLifecycle,
  KineticText,
  GradientOrbs,
  NoiseOverlay,
  CTAButton,
  AnimatedUnderline,
  useKenBurns,
  usePopIn,
  useImpact,
  easeOutExpo,
  easeOutBack,
  progress,
  buildSceneSequences,
} from "../utils/motion";

export interface FitnessMotivationProps {
  scenes: any[];
  brand: { primary_color: string; logo_id: string | null };
  assetUrls: Record<string, string>;
}

const RED = "#ff0033";
const RED_DARK = "#b8001f";
const BLACK = "#0a0a0a";
const YELLOW = "#ffc300";

function firstUrl(scene: any, assetUrls: Record<string, string>): string | null {
  const a = scene.assets?.[0];
  if (!a) return null;
  return a.url || (a.id ? assetUrls[a.id] : null) || null;
}

// ── Diagonal stripes aggressive backdrop ──
function DiagonalStripes({ color = RED, opacity = 0.08 }: { color?: string; opacity?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `repeating-linear-gradient(45deg, ${color} 0px, ${color} 40px, transparent 40px, transparent 120px)`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}

// ── Sharp accent bar slashes across the frame ──
function AccentSlash({
  startFrame,
  color = RED,
  top = "40%",
  height = 16,
}: {
  startFrame: number;
  color?: string;
  top?: string;
  height?: number;
}) {
  const frame = useCurrentFrame();
  const p = easeOutExpo(progress(frame, startFrame, startFrame + 22));
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        height,
        background: color,
        transform: `skewY(-4deg) scaleX(${p})`,
        transformOrigin: "left center",
        boxShadow: `0 0 30px ${color}aa`,
      }}
    />
  );
}

// ── Hero — explosive intro ──
function FitHero({
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
  const burns = useKenBurns(durationFrames, 0.18);
  const impact = useImpact(8, 14);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="zoom"
      exit="fade"
      style={{ backgroundColor: BLACK }}
    >
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            ...burns,
            filter: "brightness(0.48) saturate(1.25) contrast(1.25)",
          }}
        >
          <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${BLACK}cc 0%, transparent 50%, ${RED}33 100%)`,
        }}
      />
      <DiagonalStripes color={RED} opacity={0.1} />
      <AccentSlash startFrame={6} top="32%" height={12} />
      <AccentSlash startFrame={12} top="66%" height={6} color={YELLOW} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "10% 8%",
          zIndex: 5,
          transform: impact,
        }}
      >
        <div
          style={{
            fontSize: 20,
            color: RED,
            fontWeight: 900,
            letterSpacing: 6,
            textTransform: "uppercase",
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            marginBottom: 18,
            opacity: easeOutExpo(progress(frame, 0, 20)),
            textShadow: `0 0 20px ${RED}`,
          }}
        >
          NO EXCUSES.
        </div>
        <KineticText
          text={scene.text}
          start={6}
          mode="word"
          stagger={4}
          perItemDuration={18}
          riseDistance={50}
          style={{ justifyContent: "flex-start", maxWidth: "94%" }}
          itemStyle={{
            fontSize: 78,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 0.98,
            letterSpacing: -2,
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            textTransform: "uppercase",
            textShadow: `4px 4px 0 ${RED}, 8px 8px 0 ${BLACK}`,
            fontStyle: "italic",
          }}
        />
        <div style={{ marginTop: 28 }}>
          <AnimatedUnderline color={YELLOW} width={220} height={6} start={fps * 1.2} duration={22} />
        </div>
      </div>
      <NoiseOverlay opacity={0.1} />
    </SceneLifecycle>
  );
}

// ── Workout / stat scene ──
function FitStat({
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
  const burns = useKenBurns(durationFrames, 0.08);
  const badgePop = usePopIn(5, { damping: 8, stiffness: 140 });

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="slideUp"
      exit="fade"
      style={{ backgroundColor: BLACK }}
    >
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            ...burns,
            filter: "brightness(0.45) saturate(1.2) contrast(1.15) grayscale(0.35)",
          }}
        >
          <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, transparent 40%, ${BLACK}dd 100%)`,
        }}
      />
      <DiagonalStripes color={RED} opacity={0.07} />
      <AccentSlash startFrame={4} top="20%" height={8} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "10% 8% 12% 8%",
          zIndex: 5,
        }}
      >
        {/* Aggressive badge */}
        <div
          style={{
            display: "inline-block",
            background: RED,
            color: "#fff",
            padding: "10px 26px",
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: 4,
            textTransform: "uppercase",
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            marginBottom: 22,
            transform: `scale(${interpolate(badgePop, [0, 1], [0, 1])}) skewX(-8deg)`,
            alignSelf: "flex-start",
            boxShadow: `0 10px 30px ${RED}66`,
          }}
        >
          PUSH HARDER
        </div>
        <KineticText
          text={scene.text}
          start={fps * 0.4}
          mode="word"
          stagger={3}
          perItemDuration={16}
          riseDistance={36}
          style={{ justifyContent: "flex-start" }}
          itemStyle={{
            fontSize: 48,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.08,
            letterSpacing: -0.8,
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            textTransform: "uppercase",
            textShadow: `3px 3px 0 ${RED_DARK}, 0 4px 24px rgba(0,0,0,0.7)`,
          }}
        />
      </div>
      <NoiseOverlay opacity={0.09} />
    </SceneLifecycle>
  );
}

// ── Outro — explosive CTA ──
function FitOutro({
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
  const logoSpring = usePopIn(2, { damping: 10, stiffness: 150 });

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="zoom"
      exit="fade"
      style={{
        background: `radial-gradient(ellipse at center, ${RED_DARK} 0%, ${BLACK} 65%)`,
      }}
    >
      <GradientOrbs colors={[`${RED}55`, `${BLACK}`]} count={3} seed={scene.id + 33} />
      <DiagonalStripes color="#fff" opacity={0.04} />
      <AccentSlash startFrame={6} top="28%" height={10} color={YELLOW} />
      <AccentSlash startFrame={10} top="72%" height={10} />

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
              width: 120,
              height: 120,
              marginBottom: 30,
              transform: `scale(${interpolate(logoSpring, [0, 1], [0.4, 1])}) rotate(${(1 - logoSpring) * -20}deg)`,
              filter: `drop-shadow(0 0 30px ${RED}) drop-shadow(0 0 50px ${YELLOW}55)`,
            }}
          >
            <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}
        <div
          style={{
            fontSize: 22,
            color: YELLOW,
            fontWeight: 900,
            letterSpacing: 8,
            textTransform: "uppercase",
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            marginBottom: 20,
            textShadow: `0 0 20px ${YELLOW}99`,
            opacity: easeOutExpo(progress(frame, 6, 24)),
          }}
        >
          ★ BE UNSTOPPABLE ★
        </div>
        <KineticText
          text={scene.text}
          start={10}
          stagger={4}
          perItemDuration={18}
          riseDistance={42}
          style={{ marginBottom: 36, maxWidth: "92%" }}
          itemStyle={{
            fontSize: 62,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1,
            letterSpacing: -1.5,
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            textTransform: "uppercase",
            fontStyle: "italic",
            textShadow: `4px 4px 0 ${RED}, 8px 8px 0 ${BLACK}`,
          }}
        />
        <CTAButton text="JOIN NOW" bg={YELLOW} color={BLACK} startFrame={fps * 1.3} />
      </div>
      <NoiseOverlay opacity={0.1} />
    </SceneLifecycle>
  );
}

function FitDispatch({
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
      return <FitHero scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "outro":
      return <FitOutro scene={scene} brand={brand} assetUrls={assetUrls} />;
    default:
      return <FitStat scene={scene} brand={brand} assetUrls={assetUrls} />;
  }
}

export const FitnessMotivation: React.FC<FitnessMotivationProps> = ({ scenes, brand, assetUrls }) => {
  const { fps } = useVideoConfig();
  const seqs = buildSceneSequences(scenes, fps);
  return (
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      {seqs.map(({ scene, from, durationInFrames }) => (
        <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
          <FitDispatch scene={scene} brand={brand} assetUrls={assetUrls} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export default FitnessMotivation;

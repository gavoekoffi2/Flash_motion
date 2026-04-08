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

export interface EducationalProps {
  scenes: any[];
  brand: { primary_color: string; logo_id: string | null };
  assetUrls: Record<string, string>;
}

const ACCENT = "#4FC3F7";
const ACCENT_SOFT = "#4FC3F744";

function firstUrl(scene: any, assetUrls: Record<string, string>): string | null {
  const a = scene.assets?.[0];
  if (!a) return null;
  return a.url || (a.id ? assetUrls[a.id] : null) || null;
}

// ── Progress dots at top ──
function ProgressDots({
  total,
  current,
  startFrame,
}: {
  total: number;
  current: number;
  startFrame: number;
}) {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 60,
        right: 60,
        display: "flex",
        gap: 10,
        zIndex: 5,
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const p = easeOutExpo(progress(frame, startFrame + i * 3, startFrame + 16 + i * 3));
        const active = i <= current;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 3,
              background: active ? ACCENT : "rgba(255,255,255,0.15)",
              boxShadow: active ? `0 0 14px ${ACCENT}aa` : undefined,
              opacity: p,
              transform: `scaleX(${p})`,
              transformOrigin: "left center",
            }}
          />
        );
      })}
    </div>
  );
}

// ── Intro / title ──
function IntroScene({
  scene,
  brand,
  assetUrls,
  sceneIndex,
  totalScenes,
}: {
  scene: any;
  brand: any;
  assetUrls: Record<string, string>;
  sceneIndex: number;
  totalScenes: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = scene.duration_s * fps;
  const bg = brand.primary_color || "#0a1e3c";
  const imageUrl = firstUrl(scene, assetUrls);
  const logoSpring = usePopIn(5, { damping: 14, stiffness: 110 });

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="zoom"
      exit="fade"
      style={{
        background: `linear-gradient(160deg, ${bg} 0%, #041024 100%)`,
      }}
    >
      <GridPattern color="rgba(79,195,247,0.08)" size={70} />
      <GradientOrbs
        colors={[`${ACCENT}44`, `${bg}`, `${ACCENT}22`]}
        count={3}
        seed={scene.id}
      />
      <GlowPulse color={ACCENT} size={620} intensityMax={0.35} />
      <ProgressDots total={totalScenes} current={sceneIndex} startFrame={0} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "8% 6%",
          textAlign: "center",
        }}
      >
        {imageUrl && (
          <div
            style={{
              width: 140,
              height: 140,
              marginBottom: 38,
              borderRadius: 30,
              overflow: "hidden",
              border: `3px solid ${ACCENT_SOFT}`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 80px ${ACCENT}33`,
              transform: `scale(${interpolate(logoSpring, [0, 1], [0.5, 1])})`,
            }}
          >
            <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <KineticText
          text={scene.text}
          start={fps * 0.3}
          stagger={4}
          perItemDuration={20}
          riseDistance={40}
          style={{ maxWidth: "88%" }}
          itemStyle={{
            fontSize: 54,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.12,
            letterSpacing: -0.6,
            textShadow: "0 6px 30px rgba(0,0,0,0.5)",
          }}
        />
        <div style={{ marginTop: 30 }}>
          <AnimatedUnderline color={ACCENT} width={170} height={5} start={fps * 1.2} duration={22} />
        </div>
      </div>
      <NoiseOverlay opacity={0.06} />
    </SceneLifecycle>
  );
}

// ── Step / feature — numbered card with animated icon ──
function StepScene({
  scene,
  brand,
  assetUrls,
  sceneIndex,
  totalScenes,
}: {
  scene: any;
  brand: any;
  assetUrls: Record<string, string>;
  sceneIndex: number;
  totalScenes: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = scene.duration_s * fps;
  const bg = brand.primary_color || "#0a1e3c";
  const imageUrl = firstUrl(scene, assetUrls);
  const numberSpring = usePopIn(4, { damping: 8, stiffness: 120 });
  const float = useFloat(6, 3.2);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="slideUp"
      exit="fade"
      style={{
        background: `linear-gradient(150deg, ${bg} 0%, #030a18 100%)`,
      }}
    >
      <GridPattern color="rgba(79,195,247,0.05)" size={70} />
      <GradientOrbs colors={[`${ACCENT}33`, `${bg}`]} count={3} seed={scene.id + 10} />
      <ProgressDots total={totalScenes} current={sceneIndex} startFrame={0} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "12% 7% 8% 7%",
        }}
      >
        {/* Number badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 30,
            transform: float,
          }}
        >
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              background: `linear-gradient(135deg, ${ACCENT}, #2196F3)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 42,
              fontWeight: 900,
              transform: `scale(${interpolate(numberSpring, [0, 1], [0, 1])}) rotate(${(1 - numberSpring) * -25}deg)`,
              boxShadow: `0 14px 40px ${ACCENT}55, 0 0 60px ${ACCENT}44`,
              flexShrink: 0,
            }}
          >
            {sceneIndex + 1}
          </div>
          <div
            style={{
              flex: 1,
              height: 3,
              background: `linear-gradient(90deg, ${ACCENT}, transparent)`,
              opacity: easeOutExpo(progress(frame, 10, 28)),
              transformOrigin: "left",
              transform: `scaleX(${easeOutExpo(progress(frame, 10, 28))})`,
            }}
          />
        </div>

        {imageUrl && (
          <div
            style={{
              width: "88%",
              marginBottom: 30,
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid ${ACCENT_SOFT}`,
              boxShadow: `0 30px 70px rgba(0,0,0,0.6), 0 0 60px ${ACCENT}22`,
              opacity: easeOutExpo(progress(frame, 8, 26)),
              transform: `scale(${0.9 + easeOutExpo(progress(frame, 8, 26)) * 0.1})`,
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
          riseDistance={28}
          style={{ justifyContent: "flex-start" }}
          itemStyle={{
            fontSize: 34,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.35,
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
          }}
        />
      </div>
      <NoiseOverlay opacity={0.05} />
    </SceneLifecycle>
  );
}

// ── Outro — checkmark + CTA ──
function CompletionScene({
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
  const bg = brand.primary_color || "#0a1e3c";
  const imageUrl = firstUrl(scene, assetUrls);
  const checkSpring = usePopIn(2, { damping: 9, stiffness: 130 });

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="zoom"
      exit="fade"
      style={{
        background: `radial-gradient(ellipse at center, ${ACCENT}22 0%, ${bg} 70%)`,
      }}
    >
      <GridPattern color="rgba(79,195,247,0.08)" size={70} />
      <GradientOrbs colors={[`${ACCENT}44`, `${bg}`]} count={4} seed={scene.id + 20} />
      <GlowPulse color={ACCENT} size={720} intensityMax={0.45} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "8% 6%",
          textAlign: "center",
        }}
      >
        {/* Big checkmark / logo */}
        {imageUrl ? (
          <div
            style={{
              width: 130,
              height: 130,
              marginBottom: 38,
              transform: `scale(${interpolate(checkSpring, [0, 1], [0.3, 1])})`,
              filter: `drop-shadow(0 0 40px ${ACCENT})`,
            }}
          >
            <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        ) : (
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              background: `linear-gradient(135deg, ${ACCENT}, #2196F3)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 80,
              color: "#fff",
              fontWeight: 900,
              marginBottom: 38,
              transform: `scale(${interpolate(checkSpring, [0, 1], [0.2, 1])}) rotate(${(1 - checkSpring) * -20}deg)`,
              boxShadow: `0 20px 60px ${ACCENT}55, 0 0 100px ${ACCENT}66`,
            }}
          >
            ✓
          </div>
        )}
        <KineticText
          text={scene.text}
          start={8}
          stagger={4}
          perItemDuration={18}
          style={{ maxWidth: "90%", marginBottom: 40 }}
          itemStyle={{
            fontSize: 50,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.15,
            letterSpacing: -0.5,
            textShadow: "0 6px 30px rgba(0,0,0,0.5)",
          }}
        />
        <CTAButton text="En savoir plus" bg={ACCENT} color={bg} startFrame={fps * 1.2} />
      </div>
      <NoiseOverlay opacity={0.06} />
    </SceneLifecycle>
  );
}

function EducationalSceneDispatch({
  scene,
  brand,
  assetUrls,
  sceneIndex,
  totalScenes,
}: {
  scene: any;
  brand: any;
  assetUrls: Record<string, string>;
  sceneIndex: number;
  totalScenes: number;
}) {
  switch (scene.type) {
    case "hero":
      return (
        <IntroScene
          scene={scene}
          brand={brand}
          assetUrls={assetUrls}
          sceneIndex={sceneIndex}
          totalScenes={totalScenes}
        />
      );
    case "feature_list":
    case "demo":
    case "carousel":
      return (
        <StepScene
          scene={scene}
          brand={brand}
          assetUrls={assetUrls}
          sceneIndex={sceneIndex}
          totalScenes={totalScenes}
        />
      );
    case "outro":
      return <CompletionScene scene={scene} brand={brand} assetUrls={assetUrls} />;
    default:
      return (
        <StepScene
          scene={scene}
          brand={brand}
          assetUrls={assetUrls}
          sceneIndex={sceneIndex}
          totalScenes={totalScenes}
        />
      );
  }
}

export const Educational: React.FC<EducationalProps> = ({ scenes, brand, assetUrls }) => {
  const { fps } = useVideoConfig();
  const seqs = buildSceneSequences(scenes, fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {seqs.map(({ scene, from, durationInFrames }, i) => (
        <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
          <EducationalSceneDispatch
            scene={scene}
            brand={brand}
            assetUrls={assetUrls}
            sceneIndex={i}
            totalScenes={scenes.length}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export default Educational;

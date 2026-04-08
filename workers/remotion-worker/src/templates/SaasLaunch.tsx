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
  ParticleField,
  NoiseOverlay,
  GlowPulse,
  CTAButton,
  AnimatedUnderline,
  usePopIn,
  useFloat,
  usePerspectiveSettle,
  easeOutExpo,
  easeOutBack,
  progress,
  buildSceneSequences,
} from "../utils/motion";

export interface SaasLaunchProps {
  scenes: any[];
  brand: { primary_color: string; logo_id: string | null };
  assetUrls: Record<string, string>;
}

const GRAD_START = "#4f46e5"; // indigo-600
const GRAD_END = "#9333ea"; // purple-600
const ACCENT = "#a78bfa"; // violet-400

function firstUrl(scene: any, assetUrls: Record<string, string>): string | null {
  const a = scene.assets?.[0];
  if (!a) return null;
  return a.url || (a.id ? assetUrls[a.id] : null) || null;
}

// ── Hero — big headline on animated gradient ──
function SaasHero({
  scene,
  brand,
  assetUrls,
}: {
  scene: any;
  brand: any;
  assetUrls: Record<string, string>;
}) {
  const { fps } = useVideoConfig();
  const durationFrames = scene.duration_s * fps;
  const bg = brand.primary_color || "#0b1024";
  const imageUrl = firstUrl(scene, assetUrls);
  const logoSpring = usePopIn(5, { damping: 12, stiffness: 140 });
  const float = useFloat(8, 3.5);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="zoom"
      exit="blur"
      style={{
        background: `linear-gradient(135deg, ${bg} 0%, ${GRAD_START}55 50%, ${GRAD_END}77 100%)`,
      }}
    >
      <GridPattern color="rgba(167,139,250,0.08)" size={60} />
      <GradientOrbs
        colors={[`${GRAD_START}55`, `${GRAD_END}55`, `${ACCENT}44`]}
        count={4}
        seed={scene.id}
        blur={110}
      />
      <GlowPulse color={ACCENT} size={700} intensityMax={0.35} />
      <ParticleField count={28} seed={scene.id + 5} color="rgba(167,139,250,0.55)" maxSize={5} />

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
              width: 110,
              height: 110,
              marginBottom: 34,
              transform: `scale(${interpolate(logoSpring, [0, 1], [0.4, 1])}) ${float}`,
              filter: `drop-shadow(0 0 40px ${ACCENT}aa)`,
            }}
          >
            <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}
        <KineticText
          text={scene.text}
          start={8}
          stagger={4}
          perItemDuration={20}
          riseDistance={45}
          style={{ maxWidth: "90%" }}
          itemStyle={{
            fontSize: 58,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.1,
            letterSpacing: -0.8,
            textShadow: "0 8px 40px rgba(0,0,0,0.5)",
          }}
        />
        <div style={{ marginTop: 30 }}>
          <AnimatedUnderline color={ACCENT} width={180} height={5} start={fps * 1.3} duration={22} />
        </div>
      </div>
      <NoiseOverlay opacity={0.07} />
    </SceneLifecycle>
  );
}

// ── Demo — app screenshot with 3D perspective ──
function SaasDemo({
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
  const bg = brand.primary_color || "#0b1024";
  const imageUrl = firstUrl(scene, assetUrls);
  const tilt = usePerspectiveSettle(0, 32, 14);
  const float = useFloat(8, 3.8);
  const scaleP = easeOutExpo(progress(frame, 0, 26));

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="slideUp"
      exit="scaleDown"
      style={{
        background: `linear-gradient(180deg, ${bg} 0%, ${GRAD_START}33 100%)`,
      }}
    >
      <GridPattern color="rgba(167,139,250,0.06)" size={60} />
      <GradientOrbs colors={[`${GRAD_START}44`, `${bg}`, `${ACCENT}33`]} count={3} seed={scene.id + 10} />
      <GlowPulse color={ACCENT} size={600} intensityMax={0.28} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "6% 5%",
        }}
      >
        {imageUrl && (
          <div
            style={{
              width: "90%",
              marginBottom: 32,
              borderRadius: 22,
              overflow: "hidden",
              boxShadow: `0 50px 100px rgba(0,0,0,0.7), 0 0 100px ${ACCENT}44`,
              border: "2px solid rgba(167,139,250,0.25)",
              opacity: scaleP,
              transform: `${tilt} ${float} scale(${0.88 + scaleP * 0.12})`,
            }}
          >
            <SafeImg src={imageUrl} style={{ width: "100%", objectFit: "cover" }} />
          </div>
        )}
        <KineticText
          text={scene.text}
          start={fps * 0.7}
          stagger={3}
          perItemDuration={14}
          style={{ maxWidth: "82%" }}
          itemStyle={{
            fontSize: 32,
            fontWeight: 700,
            color: "rgba(255,255,255,0.95)",
            lineHeight: 1.3,
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
          }}
        />
      </div>
      <NoiseOverlay opacity={0.06} />
    </SceneLifecycle>
  );
}

// ── Feature list — card list with icons ──
function SaasFeatures({
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
  const bg = brand.primary_color || "#0b1024";
  const imageUrl = firstUrl(scene, assetUrls);
  const lines = scene.text
    .split(/[•·\n]+|(?<=[.!?])\s+/)
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0)
    .slice(0, 5);
  const showLines = lines.length > 0 ? lines : [scene.text];

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="slideUp"
      exit="fade"
      style={{
        background: `linear-gradient(145deg, ${bg} 0%, ${GRAD_END}22 100%)`,
      }}
    >
      <GridPattern color="rgba(167,139,250,0.06)" size={60} />
      <GradientOrbs colors={[`${GRAD_START}33`, `${bg}`]} count={3} seed={scene.id + 20} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "9% 7%",
        }}
      >
        {imageUrl && (
          <div
            style={{
              width: "55%",
              margin: "0 auto 32px",
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: `0 30px 60px rgba(0,0,0,0.55), 0 0 60px ${ACCENT}33`,
              opacity: easeOutExpo(progress(frame, 0, 22)),
              transform: `scale(${0.9 + easeOutExpo(progress(frame, 0, 22)) * 0.1})`,
            }}
          >
            <SafeImg src={imageUrl} style={{ width: "100%", objectFit: "cover" }} />
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {showLines.map((line: string, i: number) => {
            const start = fps * 0.4 + i * 8;
            const p = easeOutExpo(progress(frame, start, start + 20));
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "16px 24px",
                  background:
                    "linear-gradient(90deg, rgba(167,139,250,0.18), rgba(167,139,250,0.05))",
                  borderRadius: 14,
                  borderLeft: `4px solid ${ACCENT}`,
                  backdropFilter: "blur(8px)",
                  opacity: p,
                  transform: `translateX(${(1 - p) * 55}px)`,
                  boxShadow: p > 0.5 ? `0 10px 30px rgba(0,0,0,0.25)` : undefined,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${GRAD_START}, ${GRAD_END})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 20,
                    fontWeight: 900,
                    flexShrink: 0,
                    boxShadow: `0 0 20px ${ACCENT}66`,
                  }}
                >
                  ✓
                </div>
                <p style={{ fontSize: 28, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.3 }}>
                  {line}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <NoiseOverlay opacity={0.05} />
    </SceneLifecycle>
  );
}

// ── Carousel — feature cards grid ──
function SaasCarousel({
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
  const bg = brand.primary_color || "#0b1024";

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="fade"
      exit="fade"
      style={{
        background: `linear-gradient(145deg, ${bg} 0%, ${GRAD_END}33 100%)`,
      }}
    >
      <GridPattern color="rgba(167,139,250,0.06)" size={60} />
      <GradientOrbs colors={[`${GRAD_START}33`, `${bg}`, `${ACCENT}22`]} count={3} seed={scene.id + 30} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "5% 4%",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 22,
            flexWrap: "wrap",
            justifyContent: "center",
            width: "94%",
            marginBottom: 36,
          }}
        >
          {(scene.assets.length > 0 ? scene.assets : [null, null, null]).map((asset: any, i: number) => {
            const url = asset ? asset.url || (asset.id ? assetUrls[asset.id] : null) : null;
            const delay = 4 + i * 6;
            const p = easeOutBack(progress(frame, delay, delay + 22));
            const y = (1 - p) * 50;
            const tilt = (1 - p) * (i % 2 === 0 ? -10 : 10);
            return (
              <div
                key={asset?.id || i}
                style={{
                  width: scene.assets.length <= 2 ? "44%" : "29%",
                  aspectRatio: "1",
                  borderRadius: 22,
                  overflow: "hidden",
                  background: "linear-gradient(145deg, rgba(167,139,250,0.15), rgba(255,255,255,0.03))",
                  border: `1px solid ${ACCENT}44`,
                  opacity: Math.max(0, p),
                  transform: `perspective(1100px) rotateY(${tilt}deg) translateY(${y}px) scale(${0.82 + Math.max(0, p) * 0.18})`,
                  boxShadow: `0 24px 60px rgba(0,0,0,0.55), 0 0 40px ${ACCENT}22`,
                }}
              >
                {url ? (
                  <SafeImg src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "rgba(255,255,255,0.2)",
                      fontSize: 48,
                      fontWeight: 900,
                    }}
                  >
                    {i + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <KineticText
          text={scene.text}
          start={fps * 0.9}
          stagger={3}
          perItemDuration={16}
          style={{ maxWidth: "90%" }}
          itemStyle={{
            fontSize: 36,
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.2,
            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        />
      </div>
      <NoiseOverlay opacity={0.06} />
    </SceneLifecycle>
  );
}

// ── Outro — free trial CTA ──
function SaasOutro({
  scene,
  brand,
  assetUrls,
}: {
  scene: any;
  brand: any;
  assetUrls: Record<string, string>;
}) {
  const { fps } = useVideoConfig();
  const durationFrames = scene.duration_s * fps;
  const bg = brand.primary_color || "#0b1024";
  const imageUrl = firstUrl(scene, assetUrls);
  const logoSpring = usePopIn(0);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="zoom"
      exit="fade"
      style={{
        background: `linear-gradient(135deg, ${bg} 0%, ${GRAD_START} 50%, ${GRAD_END} 100%)`,
      }}
    >
      <GridPattern color="rgba(255,255,255,0.08)" size={60} />
      <GradientOrbs colors={["#ffffff33", `${GRAD_END}55`, `${ACCENT}44`]} count={4} seed={scene.id + 40} />
      <GlowPulse color="#ffffff" size={800} intensityMax={0.4} />
      <ParticleField count={40} seed={scene.id + 50} maxSize={5} />

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
              width: 120,
              height: 120,
              marginBottom: 34,
              transform: `scale(${interpolate(logoSpring, [0, 1], [0.35, 1])})`,
              filter: "drop-shadow(0 0 50px rgba(255,255,255,0.5))",
            }}
          >
            <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}
        <KineticText
          text={scene.text}
          start={6}
          stagger={4}
          perItemDuration={18}
          style={{ marginBottom: 42, maxWidth: "90%" }}
          itemStyle={{
            fontSize: 52,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.15,
            letterSpacing: -0.6,
            textShadow: "0 6px 30px rgba(0,0,0,0.5)",
          }}
        />
        <CTAButton text="Essai Gratuit" bg="#ffffff" color={GRAD_START} startFrame={fps * 1.2} />
      </div>
      <NoiseOverlay opacity={0.07} />
    </SceneLifecycle>
  );
}

function SaasSceneDispatch({
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
      return <SaasHero scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "demo":
      return <SaasDemo scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "feature_list":
      return <SaasFeatures scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "carousel":
      return <SaasCarousel scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "outro":
      return <SaasOutro scene={scene} brand={brand} assetUrls={assetUrls} />;
    default:
      return <SaasHero scene={scene} brand={brand} assetUrls={assetUrls} />;
  }
}

export const SaasLaunch: React.FC<SaasLaunchProps> = ({ scenes, brand, assetUrls }) => {
  const { fps } = useVideoConfig();
  const seqs = buildSceneSequences(scenes, fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {seqs.map(({ scene, from, durationInFrames }) => (
        <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
          <SaasSceneDispatch scene={scene} brand={brand} assetUrls={assetUrls} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export default SaasLaunch;

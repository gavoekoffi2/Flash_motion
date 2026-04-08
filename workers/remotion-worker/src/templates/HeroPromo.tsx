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
  ParticleField,
  NoiseOverlay,
  GlowPulse,
  MaskReveal,
  AnimatedUnderline,
  CTAButton,
  useKenBurns,
  usePopIn,
  useFloat,
  usePerspectiveSettle,
  easeOutExpo,
  progress,
  buildSceneSequences,
} from "../utils/motion";

// ── Types ──
interface SceneAsset {
  type: string;
  id: string;
  placement?: string;
  scale?: string;
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

export interface HeroPromoProps {
  scenes: Scene[];
  brand: Brand;
  assetUrls: Record<string, string>;
}

// Utility — resolve first asset URL from a scene
function firstAssetUrl(scene: Scene, assetUrls: Record<string, string>): string | null {
  const a = scene.assets?.[0];
  if (!a) return null;
  return a.url || (a.id ? assetUrls[a.id] : null) || null;
}

// ── HERO SCENE — full-bleed image + kinetic headline + glowing CTA ──
function HeroScene({
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
  const durationFrames = scene.duration_s * fps;
  const imageUrl = firstAssetUrl(scene, assetUrls);
  const bg = brand.primary_color || "#0b0f1f";
  const accent = "#ffffff";
  const burns = useKenBurns(durationFrames, 0.12);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="zoom"
      exit="blur"
      style={{ backgroundColor: bg }}
    >
      {/* Animated backdrop */}
      <GradientOrbs
        colors={[`${bg}ee`, `${accent}22`, `${bg}cc`]}
        count={4}
        seed={scene.id}
      />
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            ...burns,
            filter: "brightness(0.45) saturate(1.1)",
          }}
        >
          <SafeImg
            src={imageUrl}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.65) 100%)",
        }}
      />
      <ParticleField count={35} seed={scene.id} maxSize={5} />
      <GlowPulse color={accent} size={700} intensityMax={0.25} />

      {/* Foreground content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "7% 6%",
          textAlign: "center",
        }}
      >
        <KineticText
          text={scene.text}
          start={6}
          stagger={4}
          perItemDuration={20}
          riseDistance={50}
          style={{ maxWidth: "88%" }}
          itemStyle={{
            fontSize: 62,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.08,
            letterSpacing: -1,
            textShadow: "0 8px 40px rgba(0,0,0,0.6)",
          }}
        />
        <div style={{ marginTop: 32 }}>
          <AnimatedUnderline
            color={accent}
            width={180}
            height={6}
            start={fps * 0.9}
            duration={24}
          />
        </div>
        <div style={{ marginTop: 54 }}>
          <CTAButton
            text="Découvrir"
            bg="#ffffff"
            color={bg}
            startFrame={fps * 1.3}
          />
        </div>
      </div>

      <NoiseOverlay opacity={0.08} />
    </SceneLifecycle>
  );
}

// ── CAROUSEL SCENE — product grid with 3D tilt stagger ──
function CarouselScene({
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
  const durationFrames = scene.duration_s * fps;
  const bg = brand.primary_color || "#0b0f1f";

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="slideUp"
      exit="fade"
      style={{ backgroundColor: bg }}
    >
      <GradientOrbs colors={[`${bg}`, "#ffffff18"]} count={3} seed={scene.id + 10} />
      <ParticleField count={25} seed={scene.id + 20} maxSize={4} />

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
            width: "92%",
            marginBottom: 36,
          }}
        >
          {(scene.assets.length > 0 ? scene.assets : [null, null, null]).map((asset, i) => {
            const url = asset
              ? asset.url || (asset.id ? assetUrls[asset.id] : null)
              : null;
            const delay = 4 + i * 6;
            const p = easeOutExpo(progress(frame, delay, delay + 22));
            const scale = 0.78 + p * 0.22;
            const tilt = (1 - p) * (i % 2 === 0 ? -8 : 8);
            const translateY = (1 - p) * 70;
            const shadowStrength = p * 0.6;
            const widthPct =
              scene.assets.length <= 2
                ? "44%"
                : scene.assets.length === 3
                  ? "29%"
                  : "22%";
            return (
              <div
                key={asset?.id || i}
                style={{
                  opacity: p,
                  transform: `perspective(1200px) rotateY(${tilt}deg) translateY(${translateY}px) scale(${scale})`,
                  width: widthPct,
                  aspectRatio: "1",
                  borderRadius: 22,
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  boxShadow: `0 ${20 * shadowStrength}px ${60 * shadowStrength}px rgba(0,0,0,0.6)`,
                }}
              >
                {url ? (
                  <SafeImg
                    src={url}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "rgba(255,255,255,0.25)",
                      fontSize: 50,
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
          start={fps * 0.8}
          stagger={3}
          perItemDuration={16}
          style={{ maxWidth: "90%" }}
          itemStyle={{
            fontSize: 40,
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.22,
            textShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
        />
      </div>

      <NoiseOverlay opacity={0.06} />
    </SceneLifecycle>
  );
}

// ── FEATURE LIST SCENE — bullet reveal with icons ──
function FeatureListScene({
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
  const durationFrames = scene.duration_s * fps;
  const bg = brand.primary_color || "#0b0f1f";
  const imageUrl = firstAssetUrl(scene, assetUrls);
  const lines = scene.text
    .split(/[•·\n]+|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 5);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="slideUp"
      exit="scaleDown"
      style={{ backgroundColor: bg }}
    >
      <GradientOrbs
        colors={[`${bg}`, "#ffffff14"]}
        count={3}
        seed={scene.id + 30}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "8% 7%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {imageUrl && (
          <div
            style={{
              width: "55%",
              margin: "0 auto 30px",
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
              transform: `scale(${0.92 + easeOutExpo(progress(frame, 0, 22)) * 0.08})`,
              opacity: easeOutExpo(progress(frame, 0, 22)),
            }}
          >
            <SafeImg
              src={imageUrl}
              style={{ width: "100%", objectFit: "cover" }}
            />
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {(lines.length > 0 ? lines : [scene.text]).map((line, i) => {
            const start = fps * 0.3 + i * 8;
            const p = easeOutExpo(progress(frame, start, start + 20));
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  padding: "18px 28px",
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
                  borderRadius: 16,
                  borderLeft: "4px solid #fff",
                  backdropFilter: "blur(8px)",
                  opacity: p,
                  transform: `translateX(${(1 - p) * 60}px)`,
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    background: "#fff",
                    boxShadow: "0 0 22px #fff",
                    flexShrink: 0,
                  }}
                />
                <p
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: "#fff",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
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

// ── DEMO SCENE — 3D-tilted screenshot with floating text ──
function DemoScene({
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
  const durationFrames = scene.duration_s * fps;
  const bg = brand.primary_color || "#0b0f1f";
  const imageUrl = firstAssetUrl(scene, assetUrls);
  const tilt = usePerspectiveSettle(0, 30, 10);
  const floatY = useFloat(6, 3.5);
  const scaleP = easeOutExpo(progress(frame, 0, 26));

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="fade"
      exit="blur"
      style={{ backgroundColor: bg }}
    >
      <GradientOrbs
        colors={["#ffffff18", `${bg}`, "#ffffff10"]}
        count={3}
        seed={scene.id + 40}
      />
      <GlowPulse color="#ffffff" size={620} intensityMax={0.22} />

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
              width: "84%",
              marginBottom: 40,
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 40px 100px rgba(0,0,0,0.65)",
              border: "2px solid rgba(255,255,255,0.18)",
              opacity: scaleP,
              transform: `${tilt} ${floatY} scale(${0.9 + scaleP * 0.1})`,
            }}
          >
            <SafeImg src={imageUrl} style={{ width: "100%", objectFit: "cover" }} />
          </div>
        )}
        <KineticText
          text={scene.text}
          start={fps * 0.6}
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

// ── OUTRO SCENE — logo + CTA with shimmer ──
function OutroScene({
  scene,
  brand,
  assetUrls,
}: {
  scene: Scene;
  brand: Brand;
  assetUrls: Record<string, string>;
}) {
  const { fps } = useVideoConfig();
  const durationFrames = scene.duration_s * fps;
  const bg = brand.primary_color || "#0b0f1f";
  const imageUrl = firstAssetUrl(scene, assetUrls);
  const logoSpring = usePopIn(0, { damping: 11, stiffness: 150 });
  const logoScale = interpolate(logoSpring, [0, 1], [0.3, 1]);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="zoom"
      exit="fade"
      style={{ backgroundColor: bg }}
    >
      <GradientOrbs
        colors={["#ffffff33", `${bg}`, "#ffffff1a"]}
        count={4}
        seed={scene.id + 50}
      />
      <GlowPulse color="#ffffff" size={800} intensityMax={0.4} />
      <ParticleField count={50} seed={scene.id + 60} maxSize={5} />

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
              marginBottom: 36,
              transform: `scale(${logoScale}) rotate(${(1 - logoSpring) * -15}deg)`,
              filter: "drop-shadow(0 0 40px rgba(255,255,255,0.4))",
            }}
          >
            <SafeImg
              src={imageUrl}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        )}
        <KineticText
          text={scene.text}
          start={6}
          stagger={4}
          perItemDuration={18}
          style={{ maxWidth: "90%", marginBottom: 40 }}
          itemStyle={{
            fontSize: 54,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.15,
            letterSpacing: -0.5,
            textShadow: "0 6px 30px rgba(0,0,0,0.55)",
          }}
        />
        <CTAButton
          text="Commencer maintenant"
          bg="#ffffff"
          color={bg}
          startFrame={fps * 1.1}
        />
      </div>

      <NoiseOverlay opacity={0.07} />
    </SceneLifecycle>
  );
}

// ── Dispatcher ──
function SceneRenderer({
  scene,
  brand,
  assetUrls,
}: {
  scene: Scene;
  brand: Brand;
  assetUrls: Record<string, string>;
}) {
  switch (scene.type) {
    case "hero":
      return <HeroScene scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "carousel":
      return <CarouselScene scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "feature_list":
      return (
        <FeatureListScene scene={scene} brand={brand} assetUrls={assetUrls} />
      );
    case "demo":
      return <DemoScene scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "outro":
      return <OutroScene scene={scene} brand={brand} assetUrls={assetUrls} />;
    default:
      return <HeroScene scene={scene} brand={brand} assetUrls={assetUrls} />;
  }
}

// ── Main composition ──
export const HeroPromo: React.FC<HeroPromoProps> = ({ scenes, brand, assetUrls }) => {
  const { fps } = useVideoConfig();
  const seqs = buildSceneSequences(scenes, fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {seqs.map(({ scene, from, durationInFrames }) => (
        <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
          <SceneRenderer scene={scene} brand={brand} assetUrls={assetUrls} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export default HeroPromo;

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
  GlowPulse,
  CTAButton,
  AnimatedUnderline,
  usePopIn,
  useFloat,
  usePerspectiveSettle,
  useKenBurns,
  easeOutExpo,
  easeOutBack,
  progress,
  buildSceneSequences,
} from "../utils/motion";

export interface EcommerceShowcaseProps {
  scenes: any[];
  brand: { primary_color: string; logo_id: string | null };
  assetUrls: Record<string, string>;
}

function firstUrl(scene: any, assetUrls: Record<string, string>): string | null {
  const a = scene.assets?.[0];
  if (!a) return null;
  return a.url || (a.id ? assetUrls[a.id] : null) || null;
}

const ACCENT = "#FF6B35";

// ── Hero — premium product spotlight ──
function ProductHero({
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
  const bg = brand.primary_color || "#0a0a0a";
  const imageUrl = firstUrl(scene, assetUrls);
  const float = useFloat(10, 3);
  const productSpring = usePopIn(2, { damping: 14, stiffness: 110 });
  const scale = interpolate(productSpring, [0, 1], [0.78, 1]);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="zoom"
      exit="scaleDown"
      style={{ backgroundColor: bg }}
    >
      <GradientOrbs
        colors={[`${ACCENT}33`, `${bg}`, `${ACCENT}22`]}
        count={4}
        seed={scene.id}
        blur={100}
      />
      <GlowPulse color={ACCENT} size={700} intensityMax={0.4} />

      {/* Large product */}
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "12%",
            right: "12%",
            height: "55%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `${float} scale(${scale})`,
            opacity: productSpring,
          }}
        >
          <SafeImg
            src={imageUrl}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              filter: `drop-shadow(0 40px 80px rgba(0,0,0,0.7)) drop-shadow(0 0 100px ${ACCENT}55)`,
            }}
          />
        </div>
      )}

      {/* Headline */}
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          left: 0,
          right: 0,
          padding: "0 7%",
          textAlign: "center",
        }}
      >
        <KineticText
          text={scene.text}
          start={fps * 0.5}
          stagger={4}
          perItemDuration={20}
          riseDistance={40}
          itemStyle={{
            fontSize: 54,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.1,
            letterSpacing: -0.8,
            textShadow: "0 6px 30px rgba(0,0,0,0.6)",
          }}
        />
        <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
          <AnimatedUnderline color={ACCENT} width={180} height={5} start={fps * 1.2} duration={22} />
        </div>
      </div>
      <NoiseOverlay opacity={0.07} />
    </SceneLifecycle>
  );
}

// ── Product carousel — 3D tilted grid ──
function ProductCarousel({
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
  const bg = brand.primary_color || "#0a0a0a";

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="slideUp"
      exit="fade"
      style={{ backgroundColor: bg }}
    >
      <GradientOrbs colors={[`${ACCENT}22`, `${bg}`, "#ffffff08"]} count={3} seed={scene.id + 10} />

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
        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            justifyContent: "center",
            width: "94%",
            marginBottom: 38,
          }}
        >
          {(scene.assets.length > 0 ? scene.assets : [null, null, null, null]).map(
            (asset: any, i: number) => {
              const url = asset ? asset.url || (asset.id ? assetUrls[asset.id] : null) : null;
              const delay = 4 + i * 7;
              const p = easeOutBack(progress(frame, delay, delay + 22));
              const tilt = (1 - p) * (i % 2 === 0 ? -15 : 15);
              const y = (1 - p) * 60;
              return (
                <div
                  key={asset?.id || i}
                  style={{
                    width: scene.assets.length <= 2 ? "44%" : "28%",
                    aspectRatio: "1",
                    borderRadius: 24,
                    overflow: "hidden",
                    background:
                      "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                    border: `1px solid ${ACCENT}33`,
                    opacity: Math.max(0, p),
                    transform: `perspective(1200px) rotateY(${tilt}deg) translateY(${y}px) scale(${0.82 + Math.max(0, p) * 0.18})`,
                    boxShadow: `0 25px 60px rgba(0,0,0,0.6), 0 0 40px ${ACCENT}22`,
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
                        color: "rgba(255,255,255,0.2)",
                        fontSize: 44,
                        fontWeight: 900,
                      }}
                    >
                      {i + 1}
                    </div>
                  )}
                </div>
              );
            },
          )}
        </div>
        <KineticText
          text={scene.text}
          start={fps * 1}
          stagger={3}
          perItemDuration={16}
          style={{ maxWidth: "90%" }}
          itemStyle={{
            fontSize: 38,
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

// ── Feature list — specs with price tag ──
function FeatureList({
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
  const bg = brand.primary_color || "#0a0a0a";
  const imageUrl = firstUrl(scene, assetUrls);
  const burns = useKenBurns(durationFrames, 0.1);
  const lines = scene.text
    .split(/[•·\n]+|(?<=[.!?])\s+/)
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0)
    .slice(0, 5);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="fade"
      exit="scaleDown"
      style={{ backgroundColor: bg }}
    >
      <GradientOrbs colors={[`${ACCENT}22`, `${bg}`]} count={3} seed={scene.id + 20} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          padding: "5% 5%",
          gap: 40,
          flexDirection: "column",
        }}
      >
        {imageUrl && (
          <div
            style={{
              width: "60%",
              maxHeight: "45%",
              overflow: "hidden",
              borderRadius: 20,
              boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 60px ${ACCENT}33`,
              border: "1px solid rgba(255,255,255,0.15)",
              ...burns,
            }}
          >
            <SafeImg src={imageUrl} style={{ width: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "90%" }}>
          {(lines.length > 0 ? lines : [scene.text]).map((line: string, i: number) => {
            const start = fps * 0.3 + i * 8;
            const p = easeOutExpo(progress(frame, start, start + 20));
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "16px 26px",
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  borderLeft: `4px solid ${ACCENT}`,
                  opacity: p,
                  transform: `translateX(${(1 - p) * 60}px)`,
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    background: ACCENT,
                    boxShadow: `0 0 20px ${ACCENT}`,
                    flexShrink: 0,
                  }}
                />
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

// ── Demo scene — product in 3D rotation ──
function ProductDemo({
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
  const bg = brand.primary_color || "#0a0a0a";
  const imageUrl = firstUrl(scene, assetUrls);
  const tilt = usePerspectiveSettle(0, 30, 15);
  const float = useFloat(10, 3.5);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="slideUp"
      exit="blur"
      style={{ backgroundColor: bg }}
    >
      <GradientOrbs colors={[`${ACCENT}33`, `${bg}`]} count={3} seed={scene.id + 30} />
      <GlowPulse color={ACCENT} size={600} intensityMax={0.35} />

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
              width: "80%",
              marginBottom: 36,
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: `0 40px 100px rgba(0,0,0,0.75), 0 0 80px ${ACCENT}44`,
              border: "2px solid rgba(255,255,255,0.15)",
              transform: `${tilt} ${float}`,
              opacity: easeOutExpo(progress(frame, 0, 24)),
            }}
          >
            <SafeImg src={imageUrl} style={{ width: "100%", objectFit: "cover" }} />
          </div>
        )}
        <KineticText
          text={scene.text}
          start={fps * 0.8}
          stagger={3}
          perItemDuration={14}
          style={{ maxWidth: "82%" }}
          itemStyle={{
            fontSize: 34,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.3,
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
          }}
        />
      </div>
      <NoiseOverlay opacity={0.06} />
    </SceneLifecycle>
  );
}

// ── Outro — buy CTA with shimmer ──
function BuyOutro({
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
  const bg = brand.primary_color || "#0a0a0a";
  const imageUrl = firstUrl(scene, assetUrls);
  const logoSpring = usePopIn(0);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="zoom"
      exit="fade"
      style={{
        background: `radial-gradient(ellipse at center, ${ACCENT}22 0%, ${bg} 65%)`,
      }}
    >
      <GradientOrbs colors={[`${ACCENT}44`, `${bg}`]} count={4} seed={scene.id + 40} />
      <GlowPulse color={ACCENT} size={750} intensityMax={0.5} />

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
              marginBottom: 32,
              transform: `scale(${interpolate(logoSpring, [0, 1], [0.4, 1])})`,
              filter: "drop-shadow(0 0 40px rgba(255,255,255,0.4))",
            }}
          >
            <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}
        <KineticText
          text={scene.text}
          start={5}
          stagger={4}
          perItemDuration={18}
          style={{ marginBottom: 40, maxWidth: "90%" }}
          itemStyle={{
            fontSize: 52,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.1,
            letterSpacing: -0.5,
            textShadow: "0 6px 30px rgba(0,0,0,0.6)",
          }}
        />
        <CTAButton text="Acheter maintenant" bg={ACCENT} color="#fff" startFrame={fps * 1.1} />
      </div>
      <NoiseOverlay opacity={0.07} />
    </SceneLifecycle>
  );
}

function EcommerceSceneDispatch({
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
      return <ProductHero scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "carousel":
      return <ProductCarousel scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "feature_list":
      return <FeatureList scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "demo":
      return <ProductDemo scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "outro":
      return <BuyOutro scene={scene} brand={brand} assetUrls={assetUrls} />;
    default:
      return <ProductHero scene={scene} brand={brand} assetUrls={assetUrls} />;
  }
}

export const EcommerceShowcase: React.FC<EcommerceShowcaseProps> = ({
  scenes,
  brand,
  assetUrls,
}) => {
  const { fps } = useVideoConfig();
  const seqs = buildSceneSequences(scenes, fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {seqs.map(({ scene, from, durationInFrames }) => (
        <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
          <EcommerceSceneDispatch scene={scene} brand={brand} assetUrls={assetUrls} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export default EcommerceShowcase;

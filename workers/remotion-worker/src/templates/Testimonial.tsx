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
  AnimatedUnderline,
  CTAButton,
  usePopIn,
  useFloat,
  easeOutExpo,
  easeOutBack,
  progress,
  buildSceneSequences,
} from "../utils/motion";

export interface TestimonialProps {
  scenes: any[];
  brand: { primary_color: string; logo_id: string | null };
  assetUrls: Record<string, string>;
}

function firstUrl(scene: any, assetUrls: Record<string, string>): string | null {
  const a = scene.assets?.[0];
  if (!a) return null;
  return a.url || (a.id ? assetUrls[a.id] : null) || null;
}

// ── Hero/Intro — elegant title card ──
function IntroScene({ scene, brand }: { scene: any; brand: any }) {
  const { fps } = useVideoConfig();
  const durationFrames = scene.duration_s * fps;
  const bg = brand.primary_color || "#101828";

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="zoom"
      exit="fade"
      style={{
        background: `radial-gradient(circle at 50% 40%, #ffffff12 0%, ${bg} 70%)`,
      }}
    >
      <GradientOrbs
        colors={[`${bg}`, "#ffffff22", "#ffffff10"]}
        count={3}
        seed={scene.id}
        blur={100}
      />
      <GlowPulse color="#ffffff" size={680} intensityMax={0.3} />

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
          start={5}
          mode="word"
          stagger={5}
          perItemDuration={22}
          riseDistance={45}
          style={{ maxWidth: "88%" }}
          itemStyle={{
            fontSize: 60,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: -0.8,
            lineHeight: 1.12,
            textShadow: "0 8px 40px rgba(0,0,0,0.5)",
          }}
        />
        <div style={{ marginTop: 36 }}>
          <AnimatedUnderline color="#fff" width={180} height={5} start={fps * 0.9} duration={22} />
        </div>
      </div>
      <NoiseOverlay opacity={0.07} />
    </SceneLifecycle>
  );
}

// ── Testimonial — quote with avatar, large quote mark, floating card ──
function QuoteScene({
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
  const bg = brand.primary_color || "#101828";
  const imageUrl = firstUrl(scene, assetUrls);
  const quotePop = usePopIn(0, { damping: 14, stiffness: 110 });
  const float = useFloat(6, 4);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="slideUp"
      exit="scaleDown"
      style={{
        background: `linear-gradient(145deg, ${bg} 0%, #000000 100%)`,
      }}
    >
      <GradientOrbs
        colors={["#ffffff14", `${bg}`, "#ffffff10"]}
        count={3}
        seed={scene.id + 11}
      />

      {/* Giant quote mark watermark */}
      <div
        style={{
          position: "absolute",
          top: "6%",
          left: "8%",
          fontSize: 380,
          fontFamily: "Georgia, 'Times New Roman', serif",
          color: "rgba(255,255,255,0.08)",
          lineHeight: 0.8,
          transform: `scale(${interpolate(quotePop, [0, 1], [0.4, 1])})`,
          transformOrigin: "top left",
        }}
      >
        &ldquo;
      </div>

      {/* Central quote card */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "10% 6%",
          transform: float,
        }}
      >
        {imageUrl && (
          <div
            style={{
              width: 130,
              height: 130,
              borderRadius: 65,
              overflow: "hidden",
              marginBottom: 32,
              border: "4px solid rgba(255,255,255,0.25)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(255,255,255,0.15)",
              transform: `scale(${interpolate(quotePop, [0, 1], [0.5, 1])})`,
            }}
          >
            <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <KineticText
          text={scene.text}
          start={fps * 0.5}
          mode="word"
          stagger={4}
          perItemDuration={18}
          riseDistance={30}
          style={{ maxWidth: "82%" }}
          itemStyle={{
            fontSize: 38,
            fontWeight: 500,
            color: "#fff",
            fontStyle: "italic",
            lineHeight: 1.5,
            textShadow: "0 2px 20px rgba(0,0,0,0.4)",
          }}
        />
      </div>
      <NoiseOverlay opacity={0.06} />
    </SceneLifecycle>
  );
}

// ── Rating — 5 stars pop in one by one with bounce ──
function RatingScene({ scene, brand }: { scene: any; brand: any }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = scene.duration_s * fps;
  const bg = brand.primary_color || "#101828";

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="fade"
      exit="fade"
      style={{
        background: `radial-gradient(ellipse at center, #1a2440 0%, ${bg} 70%)`,
      }}
    >
      <GradientOrbs
        colors={["#FFD70022", `${bg}`, "#ffffff10"]}
        count={3}
        seed={scene.id + 21}
      />
      <GlowPulse color="#FFD700" size={600} intensityMax={0.3} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "5% 6%",
          textAlign: "center",
        }}
      >
        {/* Stars */}
        <div style={{ display: "flex", gap: 14, marginBottom: 44 }}>
          {[0, 1, 2, 3, 4].map((i) => {
            const start = 4 + i * 6;
            const p = easeOutBack(progress(frame, start, start + 18));
            return (
              <div
                key={i}
                style={{
                  fontSize: 80,
                  color: "#FFD700",
                  textShadow: "0 0 40px #FFD700, 0 4px 20px rgba(0,0,0,0.4)",
                  opacity: p,
                  transform: `scale(${Math.max(0, p)}) rotate(${(1 - p) * -25}deg)`,
                }}
              >
                ★
              </div>
            );
          })}
        </div>
        <KineticText
          text={scene.text}
          start={fps * 1.2}
          stagger={3}
          perItemDuration={16}
          style={{ maxWidth: "85%" }}
          itemStyle={{
            fontSize: 42,
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.2,
            textShadow: "0 4px 24px rgba(0,0,0,0.4)",
          }}
        />
      </div>
      <NoiseOverlay opacity={0.06} />
    </SceneLifecycle>
  );
}

// ── Outro — logo + CTA ──
function OutroScene({
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
  const bg = brand.primary_color || "#101828";
  const imageUrl = firstUrl(scene, assetUrls);
  const logoSpring = usePopIn(0, { damping: 12, stiffness: 140 });

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="zoom"
      exit="fade"
      style={{
        background: `linear-gradient(180deg, ${bg} 0%, #000 100%)`,
      }}
    >
      <GradientOrbs colors={["#ffffff22", `${bg}`]} count={3} seed={scene.id + 31} />
      <GlowPulse color="#ffffff" size={700} intensityMax={0.35} />

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
              width: 130,
              height: 130,
              marginBottom: 36,
              transform: `scale(${interpolate(logoSpring, [0, 1], [0.3, 1])})`,
              filter: "drop-shadow(0 0 40px rgba(255,255,255,0.35))",
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
          style={{ marginBottom: 40, maxWidth: "90%" }}
          itemStyle={{
            fontSize: 50,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.15,
            letterSpacing: -0.5,
            textShadow: "0 6px 30px rgba(0,0,0,0.5)",
          }}
        />
        <CTAButton text="Nous rejoindre" bg="#ffffff" color={bg} startFrame={fps * 1.1} />
      </div>
      <NoiseOverlay opacity={0.07} />
    </SceneLifecycle>
  );
}

// Dispatcher
function TestimonialSceneDispatch({
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
      return <IntroScene scene={scene} brand={brand} />;
    case "testimonial":
    case "feature_list":
      return <QuoteScene scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "demo":
    case "carousel":
      return <RatingScene scene={scene} brand={brand} />;
    case "outro":
      return <OutroScene scene={scene} brand={brand} assetUrls={assetUrls} />;
    default:
      return <IntroScene scene={scene} brand={brand} />;
  }
}

export const Testimonial: React.FC<TestimonialProps> = ({ scenes, brand, assetUrls }) => {
  const { fps } = useVideoConfig();
  const seqs = buildSceneSequences(scenes, fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {seqs.map(({ scene, from, durationInFrames }) => (
        <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
          <TestimonialSceneDispatch scene={scene} brand={brand} assetUrls={assetUrls} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export default Testimonial;

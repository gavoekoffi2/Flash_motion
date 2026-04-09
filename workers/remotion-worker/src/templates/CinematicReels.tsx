import React, { useMemo } from "react";
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
  AnimatedUnderline,
  CTAButton,
  useKenBurns,
  usePopIn,
  easeOutExpo,
  progress,
  buildSceneSequences,
  firstAssetUrl,
  splitToLines,
} from "../utils/motion";

export interface CinematicReelsProps {
  scenes: any[];
  brand: { primary_color: string; logo_id: string | null };
  assetUrls: Record<string, string>;
}

const AMBER = "#e8a33d";
const DEEP = "#0b0806";

// ── Cinematic letterbox bars — animate in from top/bottom ──
function LetterboxBars({ barRatio = 0.1 }: { barRatio?: number }) {
  const frame = useCurrentFrame();
  const p = easeOutExpo(progress(frame, 0, 22));
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: `${barRatio * 100}%`,
          background: "#000",
          transform: `translateY(${(1 - p) * -100}%)`,
          zIndex: 10,
          boxShadow: "0 4px 30px rgba(0,0,0,0.8)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: `${barRatio * 100}%`,
          background: "#000",
          transform: `translateY(${(1 - p) * 100}%)`,
          zIndex: 10,
          boxShadow: "0 -4px 30px rgba(0,0,0,0.8)",
        }}
      />
    </>
  );
}

// ── Film-grain scanlines overlay ──
function FilmGrain() {
  return (
    <>
      <NoiseOverlay opacity={0.18} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, transparent 1px, transparent 3px)",
          pointerEvents: "none",
        }}
      />
      {/* Sepia/warm color grade */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(232,163,61,0.06) 0%, rgba(0,0,0,0.15) 100%)",
          pointerEvents: "none",
          mixBlendMode: "overlay",
        }}
      />
    </>
  );
}

// ── Cinematic Hero — full-bleed image with letterbox + big kinetic title ──
function CinematicHero({
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
  const bg = brand.primary_color || DEEP;
  const imageUrl = firstAssetUrl(scene, assetUrls);
  const burns = useKenBurns(durationFrames, 0.15);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="zoom"
      exit="blur"
      style={{ backgroundColor: bg }}
    >
      {/* Background image with Ken Burns */}
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            ...burns,
            filter: "brightness(0.42) saturate(0.85) contrast(1.15)",
          }}
        >
          <SafeImg
            src={imageUrl}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      <GradientOrbs
        colors={[`${AMBER}22`, "#000000"]}
        count={2}
        seed={scene.id}
        blur={120}
      />

      <LetterboxBars barRatio={0.09} />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "14% 8%",
          textAlign: "center",
          zIndex: 5,
        }}
      >
        <div
          style={{
            opacity: easeOutExpo(progress(frame, 0, 22)),
            fontSize: 18,
            fontWeight: 400,
            color: AMBER,
            letterSpacing: 8,
            textTransform: "uppercase",
            marginBottom: 22,
          }}
        >
          — CINEMATIC —
        </div>
        <KineticText
          text={scene.text}
          start={8}
          mode="word"
          stagger={5}
          perItemDuration={22}
          riseDistance={40}
          style={{ maxWidth: "92%" }}
          itemStyle={{
            fontSize: 64,
            fontWeight: 300,
            color: "#fff",
            lineHeight: 1.1,
            letterSpacing: -0.5,
            fontFamily: "Georgia, 'Times New Roman', serif",
            textShadow: "0 6px 30px rgba(0,0,0,0.85)",
          }}
        />
        <div style={{ marginTop: 32 }}>
          <AnimatedUnderline
            color={AMBER}
            width={160}
            height={2}
            start={fps * 1.2}
            duration={26}
            glow={false}
          />
        </div>
      </div>

      <FilmGrain />
    </SceneLifecycle>
  );
}

// ── Cinematic storyboard/demo — letterboxed image + caption ──
function CinematicShot({
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
  const bg = brand.primary_color || DEEP;
  const imageUrl = firstAssetUrl(scene, assetUrls);
  const burns = useKenBurns(durationFrames, 0.08);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="fade"
      exit="fade"
      style={{ backgroundColor: bg }}
    >
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            ...burns,
            filter: "brightness(0.65) saturate(0.9) contrast(1.1)",
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
            "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.85) 100%)",
        }}
      />
      <LetterboxBars barRatio={0.09} />

      {/* Caption at bottom */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "14%",
          padding: "0 8%",
          textAlign: "center",
          zIndex: 5,
        }}
      >
        <KineticText
          text={scene.text}
          start={fps * 0.4}
          mode="word"
          stagger={3}
          perItemDuration={16}
          itemStyle={{
            fontSize: 36,
            fontWeight: 400,
            color: "#fff",
            fontFamily: "Georgia, serif",
            lineHeight: 1.35,
            letterSpacing: 0.3,
            textShadow: "0 4px 24px rgba(0,0,0,0.9)",
          }}
        />
      </div>
      <FilmGrain />
    </SceneLifecycle>
  );
}

// ── Feature list — minimalist cinematic list ──
function CinematicList({
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
  const bg = brand.primary_color || DEEP;
  const imageUrl = firstAssetUrl(scene, assetUrls);
  const lines = useMemo(() => splitToLines(scene.text, 4), [scene.text]);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="slideUp"
      exit="fade"
      style={{ backgroundColor: bg }}
    >
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            filter: "brightness(0.28) saturate(0.7) blur(6px)",
          }}
        >
          <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <GradientOrbs colors={[`${AMBER}15`, "#000"]} count={3} seed={scene.id + 10} />
      <LetterboxBars barRatio={0.09} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "14% 10%",
          zIndex: 5,
        }}
      >
        {(lines.length > 0 ? lines : [scene.text]).map((line: string, i: number) => {
          const start = 8 + i * 10;
          const p = easeOutExpo(progress(frame, start, start + 22));
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "14px 0",
                borderBottom: i < lines.length - 1 ? `1px solid ${AMBER}33` : undefined,
                opacity: p,
                transform: `translateX(${(1 - p) * 50}px)`,
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 400,
                  color: AMBER,
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                  minWidth: 40,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <p
                style={{
                  fontSize: 30,
                  fontWeight: 400,
                  color: "#fff",
                  margin: 0,
                  fontFamily: "Georgia, serif",
                  lineHeight: 1.3,
                }}
              >
                {line}
              </p>
            </div>
          );
        })}
      </div>
      <FilmGrain />
    </SceneLifecycle>
  );
}

// ── Cinematic Outro — logo + title card ──
function CinematicOutro({
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
  const bg = brand.primary_color || DEEP;
  const imageUrl = firstAssetUrl(scene, assetUrls);
  const logoSpring = usePopIn(4);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="fade"
      exit="fade"
      style={{ backgroundColor: bg }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, ${AMBER}15 0%, #000 70%)`,
        }}
      />
      <LetterboxBars barRatio={0.09} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "14% 8%",
          textAlign: "center",
          zIndex: 5,
        }}
      >
        {imageUrl && (
          <div
            style={{
              width: 110,
              height: 110,
              marginBottom: 36,
              transform: `scale(${interpolate(logoSpring, [0, 1], [0.6, 1])})`,
              filter: "drop-shadow(0 0 30px rgba(232,163,61,0.6))",
            }}
          >
            <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}
        <div
          style={{
            fontSize: 16,
            color: AMBER,
            letterSpacing: 10,
            textTransform: "uppercase",
            marginBottom: 20,
            opacity: easeOutExpo(progress(useCurrentFrame(), 6, 22)),
          }}
        >
          — FIN —
        </div>
        <KineticText
          text={scene.text}
          start={10}
          stagger={4}
          perItemDuration={20}
          style={{ marginBottom: 38, maxWidth: "92%" }}
          itemStyle={{
            fontSize: 52,
            fontWeight: 300,
            color: "#fff",
            lineHeight: 1.15,
            letterSpacing: -0.3,
            fontFamily: "Georgia, serif",
            textShadow: "0 6px 30px rgba(0,0,0,0.8)",
          }}
        />
        <CTAButton text="Voir le film" bg={AMBER} color="#0b0806" startFrame={fps * 1.4} />
      </div>
      <FilmGrain />
    </SceneLifecycle>
  );
}

function CinematicDispatch({
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
      return <CinematicHero scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "demo":
    case "carousel":
      return <CinematicShot scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "feature_list":
      return <CinematicList scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "outro":
      return <CinematicOutro scene={scene} brand={brand} assetUrls={assetUrls} />;
    default:
      return <CinematicShot scene={scene} brand={brand} assetUrls={assetUrls} />;
  }
}

export const CinematicReels: React.FC<CinematicReelsProps> = ({ scenes, brand, assetUrls }) => {
  const { fps } = useVideoConfig();
  const seqs = buildSceneSequences(scenes, fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {seqs.map(({ scene, from, durationInFrames }) => (
        <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
          <CinematicDispatch scene={scene} brand={brand} assetUrls={assetUrls} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export default CinematicReels;

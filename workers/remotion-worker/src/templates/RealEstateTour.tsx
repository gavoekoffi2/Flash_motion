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
  AnimatedUnderline,
  CTAButton,
  useKenBurns,
  usePopIn,
  useFloat,
  easeOutExpo,
  progress,
  buildSceneSequences,
} from "../utils/motion";

export interface RealEstateTourProps {
  scenes: any[];
  brand: { primary_color: string; logo_id: string | null };
  assetUrls: Record<string, string>;
}

const NAVY = "#0a1f44";
const NAVY_DARK = "#050f26";
const GOLD = "#d4af37";
const GOLD_LIGHT = "#f0d67c";
const CREAM = "#f5efe0";

function firstUrl(scene: any, assetUrls: Record<string, string>): string | null {
  const a = scene.assets?.[0];
  if (!a) return null;
  return a.url || (a.id ? assetUrls[a.id] : null) || null;
}

// ── Gold corner accents for luxury feel ──
function CornerAccents({ startFrame = 0 }: { startFrame?: number }) {
  const frame = useCurrentFrame();
  const p = easeOutExpo(progress(frame, startFrame, startFrame + 24));
  const sz = 90 * p;
  const corner = (pos: React.CSSProperties) => (
    <div
      style={{
        position: "absolute",
        width: sz,
        height: sz,
        borderColor: GOLD,
        borderStyle: "solid",
        opacity: p,
        ...pos,
      }}
    />
  );
  return (
    <>
      {corner({ top: 48, left: 48, borderWidth: "2px 0 0 2px" })}
      {corner({ top: 48, right: 48, borderWidth: "2px 2px 0 0" })}
      {corner({ bottom: 48, left: 48, borderWidth: "0 0 2px 2px" })}
      {corner({ bottom: 48, right: 48, borderWidth: "0 2px 2px 0" })}
    </>
  );
}

// ── Property info strip (bed/bath/sqft style) ──
function InfoStrip({ startFrame = 10 }: { startFrame?: number }) {
  const frame = useCurrentFrame();
  const p = easeOutExpo(progress(frame, startFrame, startFrame + 22));
  const item = (label: string, val: string, i: number) => (
    <div
      key={i}
      style={{
        textAlign: "center",
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`,
      }}
    >
      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: GOLD,
          fontFamily: "Georgia, serif",
          marginBottom: 4,
        }}
      >
        {val}
      </div>
      <div
        style={{
          fontSize: 11,
          color: CREAM,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
  return (
    <div
      style={{
        display: "flex",
        gap: 50,
        padding: "18px 40px",
        border: `1px solid ${GOLD}66`,
        background: `${NAVY_DARK}cc`,
        backdropFilter: "blur(8px)",
      }}
    >
      {item("Chambres", "4", 0)}
      <div style={{ width: 1, background: `${GOLD}33` }} />
      {item("Salles d'eau", "3", 1)}
      <div style={{ width: 1, background: `${GOLD}33` }} />
      {item("m²", "280", 2)}
    </div>
  );
}

// ── Hero — luxury property intro ──
function EstateHero({
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
  const burns = useKenBurns(durationFrames, 0.13);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="fade"
      exit="fade"
      style={{ backgroundColor: NAVY_DARK }}
    >
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            ...burns,
            filter: "brightness(0.55) saturate(1.1) contrast(1.08)",
          }}
        >
          <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, ${NAVY}55 0%, transparent 40%, ${NAVY_DARK}cc 100%)`,
        }}
      />
      <CornerAccents startFrame={4} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "14% 10%",
          textAlign: "center",
          zIndex: 5,
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: GOLD,
            letterSpacing: 12,
            textTransform: "uppercase",
            fontFamily: "Georgia, serif",
            marginBottom: 24,
            opacity: easeOutExpo(progress(frame, 0, 22)),
          }}
        >
          Propriété Exclusive
        </div>
        <KineticText
          text={scene.text}
          start={8}
          mode="word"
          stagger={5}
          perItemDuration={22}
          riseDistance={38}
          style={{ maxWidth: "92%" }}
          itemStyle={{
            fontSize: 60,
            fontWeight: 400,
            color: CREAM,
            lineHeight: 1.12,
            letterSpacing: -0.4,
            fontFamily: "Georgia, 'Didot', serif",
            textShadow: "0 6px 30px rgba(0,0,0,0.7)",
          }}
        />
        <div style={{ marginTop: 30 }}>
          <AnimatedUnderline color={GOLD} width={160} height={2} start={fps * 1.3} duration={24} glow={false} />
        </div>
      </div>
      <NoiseOverlay opacity={0.08} />
    </SceneLifecycle>
  );
}

// ── Room tour scene ──
function EstateRoom({
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
  const burns = useKenBurns(durationFrames, 0.11);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="slideUp"
      exit="fade"
      style={{ backgroundColor: NAVY_DARK }}
    >
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            ...burns,
            filter: "brightness(0.65) saturate(1.05) contrast(1.05)",
          }}
        >
          <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, transparent 30%, ${NAVY_DARK}ee 100%)`,
        }}
      />
      <CornerAccents startFrame={6} />

      {/* Bottom caption */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "12%",
          padding: "0 10%",
          textAlign: "center",
          zIndex: 5,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: GOLD,
            letterSpacing: 8,
            textTransform: "uppercase",
            fontFamily: "Georgia, serif",
            marginBottom: 14,
            opacity: easeOutExpo(progress(frame, 4, 22)),
          }}
        >
          ✦ Tour Privé ✦
        </div>
        <KineticText
          text={scene.text}
          start={fps * 0.4}
          mode="word"
          stagger={3}
          perItemDuration={18}
          riseDistance={28}
          itemStyle={{
            fontSize: 38,
            fontWeight: 400,
            color: CREAM,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            lineHeight: 1.3,
            letterSpacing: 0.2,
            textShadow: "0 4px 20px rgba(0,0,0,0.8)",
          }}
        />
      </div>
      <NoiseOverlay opacity={0.08} />
    </SceneLifecycle>
  );
}

// ── Features / specs list ──
function EstateSpecs({
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
  const lines = scene.text
    .split(/[•·\n]+|(?<=[.!?])\s+/)
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0)
    .slice(0, 4);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="fade"
      exit="fade"
      style={{
        background: `linear-gradient(160deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`,
      }}
    >
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.22,
            filter: "brightness(0.6) saturate(0.7) blur(4px)",
          }}
        >
          <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <GradientOrbs colors={[`${GOLD}18`, `${NAVY}00`]} count={2} seed={scene.id + 12} />
      <CornerAccents startFrame={3} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "14% 12%",
          zIndex: 5,
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: GOLD,
            letterSpacing: 10,
            textTransform: "uppercase",
            fontFamily: "Georgia, serif",
            marginBottom: 8,
            opacity: easeOutExpo(progress(frame, 0, 20)),
            textAlign: "center",
          }}
        >
          Caractéristiques
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
          <AnimatedUnderline color={GOLD} width={80} height={1} start={6} duration={22} glow={false} />
        </div>
        {(lines.length > 0 ? lines : [scene.text]).map((line: string, i: number) => {
          const start = 12 + i * 10;
          const p = easeOutExpo(progress(frame, start, start + 22));
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "16px 0",
                borderBottom: i < lines.length - 1 ? `1px solid ${GOLD}33` : undefined,
                opacity: p,
                transform: `translateX(${(1 - p) * 40}px)`,
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  color: GOLD,
                  fontFamily: "Georgia, serif",
                  flexShrink: 0,
                }}
              >
                ◆
              </div>
              <p
                style={{
                  fontSize: 30,
                  fontWeight: 400,
                  color: CREAM,
                  margin: 0,
                  fontFamily: "Georgia, serif",
                  lineHeight: 1.35,
                  flex: 1,
                }}
              >
                {line}
              </p>
            </div>
          );
        })}
      </div>
      <NoiseOverlay opacity={0.07} />
    </SceneLifecycle>
  );
}

// ── Outro — elegant CTA ──
function EstateOutro({
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
  const logoSpring = usePopIn(4);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="fade"
      exit="fade"
      style={{
        background: `radial-gradient(ellipse at center, ${NAVY} 0%, ${NAVY_DARK} 70%)`,
      }}
    >
      <GradientOrbs colors={[`${GOLD}22`, `${NAVY}00`]} count={3} seed={scene.id + 44} />
      <CornerAccents startFrame={2} />

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
              width: 110,
              height: 110,
              marginBottom: 32,
              transform: `scale(${interpolate(logoSpring, [0, 1], [0.5, 1])})`,
              filter: `drop-shadow(0 0 30px ${GOLD}66)`,
            }}
          >
            <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}
        <div
          style={{
            fontSize: 13,
            color: GOLD,
            letterSpacing: 12,
            textTransform: "uppercase",
            fontFamily: "Georgia, serif",
            marginBottom: 22,
            opacity: easeOutExpo(progress(frame, 4, 22)),
          }}
        >
          ✦ Votre Prochaine Adresse ✦
        </div>
        <KineticText
          text={scene.text}
          start={10}
          stagger={4}
          perItemDuration={20}
          style={{ marginBottom: 38, maxWidth: "92%" }}
          itemStyle={{
            fontSize: 50,
            fontWeight: 400,
            color: CREAM,
            lineHeight: 1.15,
            letterSpacing: -0.3,
            fontFamily: "Georgia, 'Didot', serif",
          }}
        />
        <CTAButton text="Planifier une visite" bg={GOLD} color={NAVY} startFrame={fps * 1.3} />
      </div>
      <NoiseOverlay opacity={0.08} />
    </SceneLifecycle>
  );
}

function EstateDispatch({
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
      return <EstateHero scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "feature_list":
      return <EstateSpecs scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "outro":
      return <EstateOutro scene={scene} brand={brand} assetUrls={assetUrls} />;
    default:
      return <EstateRoom scene={scene} brand={brand} assetUrls={assetUrls} />;
  }
}

export const RealEstateTour: React.FC<RealEstateTourProps> = ({ scenes, brand, assetUrls }) => {
  const { fps } = useVideoConfig();
  const seqs = buildSceneSequences(scenes, fps);
  return (
    <AbsoluteFill style={{ backgroundColor: NAVY_DARK }}>
      {seqs.map(({ scene, from, durationInFrames }) => (
        <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
          <EstateDispatch scene={scene} brand={brand} assetUrls={assetUrls} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export default RealEstateTour;

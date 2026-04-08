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

export interface RestaurantMenuProps {
  scenes: any[];
  brand: { primary_color: string; logo_id: string | null };
  assetUrls: Record<string, string>;
}

const CREAM = "#faf5eb";
const CREAM_DARK = "#f0e6d2";
const DARK = "#2d1810";
const GOLD = "#c9a961";
const GOLD_DARK = "#8a6f35";

function firstUrl(scene: any, assetUrls: Record<string, string>): string | null {
  const a = scene.assets?.[0];
  if (!a) return null;
  return a.url || (a.id ? assetUrls[a.id] : null) || null;
}

// ── Elegant ornament divider ──
function Ornament({ startFrame = 0 }: { startFrame?: number }) {
  const frame = useCurrentFrame();
  const p = easeOutExpo(progress(frame, startFrame, startFrame + 24));
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        opacity: p,
      }}
    >
      <div style={{ width: 60 * p, height: 1, background: GOLD }} />
      <div
        style={{
          fontSize: 22,
          color: GOLD,
          fontFamily: "Georgia, serif",
          transform: `rotate(${p * 45}deg)`,
        }}
      >
        ✦
      </div>
      <div style={{ width: 60 * p, height: 1, background: GOLD }} />
    </div>
  );
}

// ── Paper texture ──
function PaperTexture() {
  return (
    <>
      <NoiseOverlay opacity={0.12} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(138,111,53,0.18) 100%)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

// ── Hero — elegant restaurant intro ──
function MenuHero({
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
  const burns = useKenBurns(durationFrames, 0.12);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="fade"
      exit="fade"
      style={{ backgroundColor: DARK }}
    >
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            ...burns,
            filter: "brightness(0.45) saturate(1.1) contrast(1.05)",
          }}
        >
          <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)",
        }}
      />

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
        <div
          style={{
            fontSize: 14,
            color: GOLD,
            letterSpacing: 10,
            textTransform: "uppercase",
            fontFamily: "Georgia, serif",
            marginBottom: 22,
            opacity: easeOutExpo(progress(frame, 0, 22)),
          }}
        >
          Le Menu · Est. 2026
        </div>
        <Ornament startFrame={4} />
        <div style={{ marginTop: 28, marginBottom: 26 }}>
          <KineticText
            text={scene.text}
            start={10}
            mode="word"
            stagger={5}
            perItemDuration={22}
            riseDistance={32}
            style={{ maxWidth: "94%" }}
            itemStyle={{
              fontSize: 64,
              fontWeight: 400,
              color: CREAM,
              fontFamily: "Georgia, 'Playfair Display', serif",
              fontStyle: "italic",
              lineHeight: 1.12,
              letterSpacing: -0.3,
              textShadow: "0 6px 30px rgba(0,0,0,0.7)",
            }}
          />
        </div>
        <Ornament startFrame={30} />
      </div>
      <PaperTexture />
    </SceneLifecycle>
  );
}

// ── Dish scene — featured menu item ──
function DishScene({
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
  const burns = useKenBurns(durationFrames, 0.1);
  const float = useFloat(4, 4);

  return (
    <SceneLifecycle
      durationInFrames={durationFrames}
      enter="slideUp"
      exit="fade"
      style={{ backgroundColor: CREAM }}
    >
      {/* Split layout: image left, text right */}
      <div style={{ position: "absolute", inset: 0, display: "flex" }}>
        <div style={{ flex: 1.2, position: "relative", overflow: "hidden" }}>
          {imageUrl && (
            <div style={{ position: "absolute", inset: 0, ...burns }}>
              <SafeImg
                src={imageUrl}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}
          {/* Gradient fade into cream */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(90deg, transparent 60%, ${CREAM} 100%)`,
            }}
          />
        </div>
      </div>

      {/* Text overlay bottom half */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "8% 9% 11% 9%",
          background: `linear-gradient(180deg, transparent 0%, ${CREAM}ee 30%, ${CREAM} 60%)`,
          zIndex: 5,
          transform: float,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: GOLD_DARK,
            letterSpacing: 8,
            textTransform: "uppercase",
            fontFamily: "Georgia, serif",
            marginBottom: 16,
            opacity: easeOutExpo(progress(frame, 4, 22)),
          }}
        >
          Spécialité de la Maison
        </div>
        <KineticText
          text={scene.text}
          start={fps * 0.3}
          mode="word"
          stagger={3}
          perItemDuration={18}
          riseDistance={24}
          style={{ justifyContent: "flex-start", marginBottom: 18 }}
          itemStyle={{
            fontSize: 42,
            fontWeight: 400,
            color: DARK,
            fontFamily: "Georgia, 'Playfair Display', serif",
            lineHeight: 1.2,
            letterSpacing: -0.2,
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <AnimatedUnderline color={GOLD} width={140} height={2} start={fps * 1} duration={24} glow={false} />
        </div>
      </div>
      <PaperTexture />
    </SceneLifecycle>
  );
}

// ── Menu list ──
function MenuList({
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
        background: `linear-gradient(180deg, ${CREAM} 0%, ${CREAM_DARK} 100%)`,
      }}
    >
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.12,
            filter: "sepia(0.6) blur(2px)",
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
          justifyContent: "center",
          padding: "12% 10%",
          zIndex: 5,
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: 13,
            color: GOLD_DARK,
            letterSpacing: 9,
            textTransform: "uppercase",
            fontFamily: "Georgia, serif",
            marginBottom: 16,
            opacity: easeOutExpo(progress(frame, 0, 20)),
          }}
        >
          Nos Signatures
        </div>
        <div style={{ marginBottom: 24 }}>
          <Ornament startFrame={4} />
        </div>
        {(lines.length > 0 ? lines : [scene.text]).map((line: string, i: number) => {
          const start = 10 + i * 10;
          const p = easeOutExpo(progress(frame, start, start + 22));
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 20,
                padding: "14px 0",
                borderBottom: i < lines.length - 1 ? `1px dashed ${GOLD}66` : undefined,
                opacity: p,
                transform: `translateY(${(1 - p) * 20}px)`,
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  color: GOLD,
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                  minWidth: 32,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <p
                style={{
                  fontSize: 28,
                  fontWeight: 400,
                  color: DARK,
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
      <PaperTexture />
    </SceneLifecycle>
  );
}

// ── Outro — elegant CTA ──
function MenuOutro({
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
        background: `radial-gradient(ellipse at center, ${CREAM} 0%, ${CREAM_DARK} 100%)`,
      }}
    >
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
              filter: "drop-shadow(0 12px 30px rgba(45,24,16,0.25))",
            }}
          >
            <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}
        <Ornament startFrame={0} />
        <div style={{ marginTop: 26 }}>
          <KineticText
            text={scene.text}
            start={10}
            stagger={4}
            perItemDuration={20}
            style={{ marginBottom: 34, maxWidth: "92%" }}
            itemStyle={{
              fontSize: 48,
              fontWeight: 400,
              color: DARK,
              lineHeight: 1.15,
              fontFamily: "Georgia, 'Playfair Display', serif",
              fontStyle: "italic",
              letterSpacing: -0.2,
            }}
          />
        </div>
        <CTAButton text="Réserver une table" bg={GOLD} color={CREAM} startFrame={fps * 1.3} />
      </div>
      <PaperTexture />
    </SceneLifecycle>
  );
}

function MenuDispatch({
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
      return <MenuHero scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "feature_list":
      return <MenuList scene={scene} brand={brand} assetUrls={assetUrls} />;
    case "outro":
      return <MenuOutro scene={scene} brand={brand} assetUrls={assetUrls} />;
    default:
      return <DishScene scene={scene} brand={brand} assetUrls={assetUrls} />;
  }
}

export const RestaurantMenu: React.FC<RestaurantMenuProps> = ({ scenes, brand, assetUrls }) => {
  const { fps } = useVideoConfig();
  const seqs = buildSceneSequences(scenes, fps);
  return (
    <AbsoluteFill style={{ backgroundColor: CREAM }}>
      {seqs.map(({ scene, from, durationInFrames }) => (
        <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
          <MenuDispatch scene={scene} brand={brand} assetUrls={assetUrls} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export default RestaurantMenu;

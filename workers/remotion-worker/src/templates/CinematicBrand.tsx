/**
 * CinematicBrand — Template de marque cinématographique
 * Effets : letterbox cinéma, texte révélé, orbes lumineux, transitions épiques, split reveal
 */
import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  Audio,
} from "remotion";

// ── Utilitaires ──
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 5, g: 5, b: 15 };
}
function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}
function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.max(0, r - amount)},${Math.max(0, g - amount)},${Math.max(0, b - amount)})`;
}
function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.min(255, r + amount)},${Math.min(255, g + amount)},${Math.min(255, b + amount)})`;
}

// ── Types ──
interface SceneAsset { type: string; id: string; placement: string; scale: string; url?: string; }
interface Scene { id: number; duration_s: number; type: string; text: string; assets: SceneAsset[]; animation: string; }
interface Brand { primary_color: string; secondary_color?: string; accent_color?: string; logo_id: string | null; }
export interface CinematicBrandProps { scenes: Scene[]; brand: Brand; assetUrls: Record<string, string>; audioUrls?: Record<number, string>; }

function SafeImg({ src, style }: { src: string | null | undefined; style: React.CSSProperties }) {
  if (!src) return null;
  return <Img src={src} style={style} />;
}

// ── Bandes cinéma (letterbox) ──
function Letterbox({ frame, fps, height }: { frame: number; fps: number; height: number }) {
  const barHeight = height * 0.1;
  const progress = spring({ frame, fps, config: { damping: 80, stiffness: 100, mass: 0.8 } });
  const barSize = interpolate(progress, [0, 1], [0, barHeight]);
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: barSize, background: "#000000", zIndex: 50 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: barSize, background: "#000000", zIndex: 50 }} />
    </>
  );
}

// ── Texte révélé par masque ──
function RevealText({ text, frame, fps, delay = 0, style, direction = "up" }: {
  text: string; frame: number; fps: number; delay?: number;
  style?: React.CSSProperties; direction?: "up" | "left" | "right";
}) {
  const f = Math.max(0, frame - delay);
  const progress = spring({ frame: f, fps, config: { damping: 60, stiffness: 120, mass: 0.9 } });
  const translateY = direction === "up" ? interpolate(progress, [0, 1], [100, 0]) : 0;
  const translateX = direction === "left" ? interpolate(progress, [0, 1], [-80, 0]) : direction === "right" ? interpolate(progress, [0, 1], [80, 0]) : 0;
  const opacity = interpolate(f, [0, fps * 0.2], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ overflow: "hidden", display: "inline-block" }}>
      <div style={{ transform: `translateY(${translateY}px) translateX(${translateX}px)`, opacity, ...style }}>
        {text}
      </div>
    </div>
  );
}

// ── Orbe lumineux ──
function LightOrb({ x, y, size, color, frame, phase = 0 }: { x: number; y: number; size: number; color: string; frame: number; phase?: number }) {
  const dx = Math.sin((frame / 200 + phase) * 1.2) * 50;
  const dy = Math.cos((frame / 250 + phase) * 0.9) * 40;
  const pulse = 0.7 + Math.sin(frame / 40 + phase) * 0.3;
  return (
    <div style={{
      position: "absolute",
      left: x + dx,
      top: y + dy,
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${rgba(color, 0.8)} 0%, ${rgba(color, 0.3)} 40%, transparent 70%)`,
      filter: `blur(${size * 0.4}px)`,
      opacity: pulse,
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
    }} />
  );
}

// ── Ligne de scan ──
function ScanLine({ frame, fps, delay, color, width: lineWidth }: { frame: number; fps: number; delay: number; color: string; width: number }) {
  const f = Math.max(0, frame - delay);
  const progress = spring({ frame: f, fps, config: { damping: 100, stiffness: 200 } });
  const width = interpolate(progress, [0, 1], [0, lineWidth]);
  const opacity = interpolate(f, [0, fps * 0.1, fps * 2, fps * 2.5], [0, 1, 1, 0], { extrapolateRight: "clamp" });
  return (
    <div style={{
      height: 1,
      width,
      background: `linear-gradient(90deg, transparent, ${color}, ${lighten(color, 80)}, ${color}, transparent)`,
      boxShadow: `0 0 10px ${color}, 0 0 20px ${rgba(color, 0.5)}`,
      opacity,
    }} />
  );
}

// ── Scène Ouverture Cinématique ──
function OpeningScene({ scene, brand, assetUrls, frame, fps, width, height }: {
  scene: Scene; brand: Brand; assetUrls: Record<string, string>; frame: number; fps: number; width: number; height: number;
}) {
  const primary = brand.primary_color || "#4A90E2";
  const accent = brand.accent_color || lighten(primary, 80);
  const isPortrait = height > width;

  const bgAsset = scene.assets.find(a => a.type === "background" || a.type === "image") || scene.assets[0];
  const bgUrl = bgAsset ? (bgAsset.url || assetUrls[bgAsset.id]) : null;
  const logoAsset = scene.assets.find(a => a.type === "logo");
  const logoUrl = logoAsset ? (logoAsset.url || assetUrls[logoAsset.id]) : null;

  const zoomScale = interpolate(frame, [0, fps * scene.duration_s], [1.05, 1.15]);

  return (
    <AbsoluteFill>
      {/* Image de fond avec zoom lent */}
      {bgUrl ? (
        <AbsoluteFill style={{ transform: `scale(${zoomScale})`, transformOrigin: "center" }}>
          <SafeImg src={bgUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{
          background: `linear-gradient(160deg, #000000 0%, ${darken(primary, 70)} 50%, #000000 100%)`,
        }} />
      )}
      {/* Overlay cinématique */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.7) 100%)" }} />
      {/* Orbes lumineux */}
      <LightOrb x={width * 0.2} y={height * 0.3} size={300} color={primary} frame={frame} phase={0} />
      <LightOrb x={width * 0.8} y={height * 0.7} size={200} color={accent} frame={frame} phase={2} />
      {/* Letterbox */}
      <Letterbox frame={frame} fps={fps} height={height} />
      {/* Contenu */}
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: isPortrait ? "80px 50px" : "60px 80px" }}>
        {/* Logo */}
        {logoUrl && (
          <div style={{
            opacity: interpolate(frame, [fps * 0.5, fps * 1.0], [0, 1], { extrapolateRight: "clamp" }),
            transform: `scale(${interpolate(spring({ frame: Math.max(0, frame - fps * 0.5), fps, config: { damping: 70, stiffness: 100 } }), [0, 1], [0.8, 1])})`,
            filter: `drop-shadow(0 0 30px ${rgba(primary, 0.7)})`,
          }}>
            <SafeImg src={logoUrl} style={{ width: isPortrait ? 100 : 80, height: isPortrait ? 100 : 80, objectFit: "contain" }} />
          </div>
        )}
        {/* Ligne de scan */}
        <ScanLine frame={frame} fps={fps} delay={fps * 0.3} color={primary} width={isPortrait ? 200 : 300} />
        {/* Titre principal */}
        <div style={{ textAlign: "center", maxWidth: "85%" }}>
          <RevealText
            text={scene.text}
            frame={frame}
            fps={fps}
            delay={fps * 0.4}
            direction="up"
            style={{
              fontSize: isPortrait ? 68 : 54,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textShadow: `0 0 60px ${rgba(primary, 0.8)}, 0 4px 30px rgba(0,0,0,0.9)`,
              lineHeight: 1.1,
            }}
          />
        </div>
        {/* Sous-titre */}
        <div style={{ overflow: "hidden" }}>
          <div style={{
            opacity: interpolate(frame, [fps * 1.0, fps * 1.5], [0, 1], { extrapolateRight: "clamp" }),
            transform: `translateY(${interpolate(frame, [fps * 1.0, fps * 1.5], [20, 0], { extrapolateRight: "clamp" })}px)`,
            fontSize: isPortrait ? 18 : 15,
            color: rgba("#FFFFFF", 0.65),
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            textAlign: "center",
          }}>
            Une histoire à raconter
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── Scène Narrative ──
function NarrativeScene({ scene, brand, assetUrls, frame, fps, width, height }: {
  scene: Scene; brand: Brand; assetUrls: Record<string, string>; frame: number; fps: number; width: number; height: number;
}) {
  const primary = brand.primary_color || "#4A90E2";
  const accent = brand.accent_color || lighten(primary, 80);
  const isPortrait = height > width;

  const imageAsset = scene.assets.find(a => a.type === "image" || a.type === "product") || scene.assets[0];
  const imageUrl = imageAsset ? (imageAsset.url || assetUrls[imageAsset.id]) : null;

  const zoomScale = interpolate(frame, [0, fps * scene.duration_s], [1.0, 1.06]);

  return (
    <AbsoluteFill>
      {/* Image avec zoom lent */}
      {imageUrl ? (
        <AbsoluteFill style={{ transform: `scale(${zoomScale})`, transformOrigin: "center" }}>
          <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ background: `linear-gradient(135deg, #000000 0%, ${darken(primary, 60)} 100%)` }} />
      )}
      {/* Overlay gradient */}
      <AbsoluteFill style={{ background: isPortrait ? "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 60%)" : "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%)" }} />
      {/* Orbes */}
      <LightOrb x={width * 0.15} y={height * 0.5} size={250} color={primary} frame={frame} phase={1} />
      {/* Letterbox */}
      <Letterbox frame={frame} fps={fps} height={height} />
      {/* Texte */}
      <div style={{
        position: "absolute",
        bottom: isPortrait ? "15%" : "20%",
        left: isPortrait ? "5%" : "5%",
        right: isPortrait ? "5%" : "55%",
        padding: isPortrait ? "0 20px" : "0 40px",
      }}>
        {/* Ligne décorative */}
        <div style={{
          height: 3,
          width: interpolate(spring({ frame: Math.max(0, frame - fps * 0.2), fps, config: { damping: 80, stiffness: 120 } }), [0, 1], [0, 80]),
          background: primary,
          boxShadow: `0 0 15px ${primary}`,
          marginBottom: 20,
          borderRadius: 3,
        }} />
        {/* Texte principal */}
        <RevealText
          text={scene.text}
          frame={frame}
          fps={fps}
          delay={fps * 0.3}
          direction="up"
          style={{
            fontSize: isPortrait ? 42 : 36,
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1.4,
            textShadow: "0 4px 30px rgba(0,0,0,0.9)",
          }}
        />
        {/* Détail */}
        <div style={{
          marginTop: 16,
          opacity: interpolate(frame, [fps * 0.8, fps * 1.3], [0, 1], { extrapolateRight: "clamp" }),
          fontSize: isPortrait ? 16 : 14,
          color: rgba(accent, 0.8),
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}>
          Découvrez notre vision
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Scène Split Reveal ──
function SplitRevealScene({ scene, brand, assetUrls, frame, fps, width, height }: {
  scene: Scene; brand: Brand; assetUrls: Record<string, string>; frame: number; fps: number; width: number; height: number;
}) {
  const primary = brand.primary_color || "#4A90E2";
  const accent = brand.accent_color || lighten(primary, 80);
  const isPortrait = height > width;

  const images = scene.assets
    .filter(a => a.type === "image" || a.type === "product")
    .map(a => a.url || assetUrls[a.id])
    .filter(Boolean);

  const leftProgress = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 70, stiffness: 100, mass: 1 } });
  const rightProgress = spring({ frame: Math.max(0, frame - fps * 0.3), fps, config: { damping: 70, stiffness: 100, mass: 1 } });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#000000" }} />
      {/* Split panels */}
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "50%",
        height: "100%",
        overflow: "hidden",
        transform: `translateX(${interpolate(leftProgress, [0, 1], [-100, 0])}%)`,
      }}>
        {images[0] ? (
          <SafeImg src={images[0]} style={{ width: "200%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: `linear-gradient(160deg, ${darken(primary, 50)}, ${darken(primary, 80)})` }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1))" }} />
      </div>
      <div style={{
        position: "absolute",
        right: 0,
        top: 0,
        width: "50%",
        height: "100%",
        overflow: "hidden",
        transform: `translateX(${interpolate(rightProgress, [0, 1], [100, 0])}%)`,
      }}>
        {images[1] ? (
          <SafeImg src={images[1]} style={{ width: "200%", height: "100%", objectFit: "cover", marginLeft: "-100%" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: `linear-gradient(160deg, ${darken(accent, 50)}, ${darken(accent, 80)})` }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(270deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1))" }} />
      </div>
      {/* Ligne centrale */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: 0,
        bottom: 0,
        width: 2,
        background: `linear-gradient(180deg, transparent, ${primary}, ${accent}, transparent)`,
        boxShadow: `0 0 20px ${primary}`,
        transform: "translateX(-50%)",
        opacity: interpolate(frame, [fps * 0.3, fps * 0.6], [0, 1], { extrapolateRight: "clamp" }),
      }} />
      {/* Letterbox */}
      <Letterbox frame={frame} fps={fps} height={height} />
      {/* Texte centré */}
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          textAlign: "center",
          padding: "20px 40px",
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(10px)",
          borderRadius: 16,
          border: `1px solid ${rgba(primary, 0.4)}`,
          maxWidth: "80%",
          opacity: interpolate(frame, [fps * 0.5, fps * 1.0], [0, 1], { extrapolateRight: "clamp" }),
          transform: `scale(${interpolate(spring({ frame: Math.max(0, frame - fps * 0.5), fps, config: { damping: 60, stiffness: 120 } }), [0, 1], [0.9, 1])})`,
        }}>
          <p style={{
            fontSize: isPortrait ? 38 : 30,
            fontWeight: 800,
            color: "#FFFFFF",
            margin: 0,
            lineHeight: 1.3,
            textShadow: `0 0 30px ${rgba(primary, 0.6)}`,
          }}>
            {scene.text}
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── Scène Finale Cinématique ──
function FinaleScene({ scene, brand, assetUrls, frame, fps, width, height }: {
  scene: Scene; brand: Brand; assetUrls: Record<string, string>; frame: number; fps: number; width: number; height: number;
}) {
  const primary = brand.primary_color || "#4A90E2";
  const accent = brand.accent_color || lighten(primary, 80);
  const isPortrait = height > width;

  const logoAsset = scene.assets.find(a => a.type === "logo") || scene.assets[0];
  const logoUrl = logoAsset ? (logoAsset.url || assetUrls[logoAsset.id]) : null;

  const mainProgress = spring({ frame, fps, config: { damping: 60, stiffness: 80, mass: 1.2 } });
  const glowPulse = 0.6 + Math.sin(frame / 25) * 0.4;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#000000" }} />
      {/* Orbes */}
      <LightOrb x={width * 0.5} y={height * 0.5} size={500} color={primary} frame={frame} phase={0} />
      <LightOrb x={width * 0.3} y={height * 0.4} size={200} color={accent} frame={frame} phase={3} />
      <LightOrb x={width * 0.7} y={height * 0.6} size={180} color={primary} frame={frame} phase={1.5} />
      {/* Letterbox */}
      <Letterbox frame={frame} fps={fps} height={height} />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: isPortrait ? 32 : 24, padding: 60 }}>
        {/* Logo */}
        {logoUrl && (
          <div style={{
            opacity: interpolate(frame, [0, fps * 0.6], [0, 1], { extrapolateRight: "clamp" }),
            transform: `scale(${interpolate(mainProgress, [0, 1], [0.5, 1])})`,
            filter: `drop-shadow(0 0 50px ${rgba(primary, glowPulse)})`,
          }}>
            <SafeImg src={logoUrl} style={{ width: isPortrait ? 120 : 90, height: isPortrait ? 120 : 90, objectFit: "contain" }} />
          </div>
        )}
        {/* Titre */}
        <RevealText
          text={scene.text}
          frame={frame}
          fps={fps}
          delay={fps * 0.3}
          direction="up"
          style={{
            fontSize: isPortrait ? 62 : 50,
            fontWeight: 900,
            color: "#FFFFFF",
            textAlign: "center",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            textShadow: `0 0 60px ${rgba(primary, glowPulse)}, 0 4px 30px rgba(0,0,0,0.9)`,
            maxWidth: "85%",
          }}
        />
        {/* Ligne */}
        <ScanLine frame={frame} fps={fps} delay={fps * 0.8} color={primary} width={isPortrait ? 180 : 260} />
        {/* Tagline */}
        <div style={{
          opacity: interpolate(frame, [fps * 1.2, fps * 1.8], [0, 0.8], { extrapolateRight: "clamp" }),
          fontSize: isPortrait ? 16 : 13,
          color: rgba(accent, 0.9),
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          textAlign: "center",
        }}>
          Flash Motion &nbsp;·&nbsp; Cinematic Excellence
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── Routeur de scènes ──
function BrandScene({ scene, brand, assetUrls, audioUrls }: {
  scene: Scene; brand: Brand; assetUrls: Record<string, string>; audioUrls?: Record<number, string>;
}) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const durationFrames = scene.duration_s * fps;
  const exitOpacity = interpolate(frame, [durationFrames - 12, durationFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const commonProps = { scene, brand, assetUrls, frame, fps, width, height };
  const content = (() => {
    switch (scene.type) {
      case "hero": return <OpeningScene {...commonProps} />;
      case "feature_list": return <NarrativeScene {...commonProps} />;
      case "carousel": return <SplitRevealScene {...commonProps} />;
      case "demo": return <NarrativeScene {...commonProps} />;
      case "outro": case "cta": return <FinaleScene {...commonProps} />;
      default: return <OpeningScene {...commonProps} />;
    }
  })();

  const audioUrl = audioUrls?.[scene.id];
  return (
    <AbsoluteFill style={{ opacity: exitOpacity, fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}>
      {content}
      {audioUrl && <Audio src={audioUrl} volume={0.9} startFrom={0} endAt={scene.duration_s * 30} />}
    </AbsoluteFill>
  );
}

// ── Composition principale ──
export const CinematicBrand: React.FC<CinematicBrandProps> = ({ scenes, brand, assetUrls, audioUrls }) => {
  const { fps } = useVideoConfig();
  let frameOffset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {scenes.map((scene) => {
        const durationFrames = scene.duration_s * fps;
        const from = frameOffset;
        frameOffset += durationFrames;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={durationFrames}>
            <BrandScene scene={scene} brand={brand} assetUrls={assetUrls} audioUrls={audioUrls} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export default CinematicBrand;

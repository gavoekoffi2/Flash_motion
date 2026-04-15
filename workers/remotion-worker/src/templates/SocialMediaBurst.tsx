/**
 * SocialMediaBurst — Template social media ultra-dynamique (Reels, TikTok, Stories)
 * Effets : texte pop, couleurs vives, transitions rapides, emojis animés, compteurs
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
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 30, g: 10, b: 60 };
}
function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}
function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.min(255, r + amount)},${Math.min(255, g + amount)},${Math.min(255, b + amount)})`;
}
function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.max(0, r - amount)},${Math.max(0, g - amount)},${Math.max(0, b - amount)})`;
}

// ── Types ──
interface SceneAsset { type: string; id: string; placement: string; scale: string; url?: string; }
interface Scene { id: number; duration_s: number; type: string; text: string; assets: SceneAsset[]; animation: string; }
interface Brand { primary_color: string; secondary_color?: string; accent_color?: string; logo_id: string | null; }
export interface SocialMediaBurstProps { scenes: Scene[]; brand: Brand; assetUrls: Record<string, string>; audioUrls?: Record<number, string>; }

function SafeImg({ src, style }: { src: string | null | undefined; style: React.CSSProperties }) {
  if (!src) return null;
  return <Img src={src} style={style} />;
}

// ── Texte pop avec rebond ──
function PopText({ text, frame, fps, delay = 0, style }: {
  text: string; frame: number; fps: number; delay?: number; style?: React.CSSProperties;
}) {
  const f = Math.max(0, frame - delay);
  const progress = spring({ frame: f, fps, config: { damping: 12, stiffness: 400, mass: 0.4 } });
  const scale = interpolate(progress, [0, 1], [0, 1]);
  const opacity = interpolate(f, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ transform: `scale(${scale})`, opacity, display: "inline-block", ...style }}>
      {text}
    </div>
  );
}

// ── Badge animé ──
function AnimatedBadge({ text, frame, fps, delay, color, x, y }: {
  text: string; frame: number; fps: number; delay: number; color: string; x: string; y: string;
}) {
  const f = Math.max(0, frame - delay);
  const progress = spring({ frame: f, fps, config: { damping: 15, stiffness: 350, mass: 0.3 } });
  const scale = interpolate(progress, [0, 1], [0, 1]);
  const rotate = interpolate(progress, [0, 1], [-15, 0]);
  const opacity = interpolate(f, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `scale(${scale}) rotate(${rotate}deg)`,
      opacity,
      background: color,
      color: "#FFFFFF",
      borderRadius: 50,
      padding: "8px 18px",
      fontSize: 16,
      fontWeight: 900,
      boxShadow: `0 8px 30px ${rgba(color, 0.6)}`,
      whiteSpace: "nowrap",
      zIndex: 20,
    }}>
      {text}
    </div>
  );
}

// ── Fond dégradé vibrant ──
function VibrantBackground({ frame, primary, secondary }: { frame: number; primary: string; secondary: string }) {
  const hueShift = Math.sin(frame / 60) * 10;
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(${135 + hueShift}deg, ${darken(primary, 30)} 0%, ${darken(secondary, 20)} 50%, ${darken(primary, 50)} 100%)`,
    }} />
  );
}

// ── Scène Accroche Sociale ──
function HookScene({ scene, brand, assetUrls, frame, fps, width, height }: {
  scene: Scene; brand: Brand; assetUrls: Record<string, string>; frame: number; fps: number; width: number; height: number;
}) {
  const primary = brand.primary_color || "#FF006E";
  const secondary = brand.secondary_color || "#8338EC";
  const accent = brand.accent_color || "#FFBE0B";
  const isPortrait = height > width;

  const imageAsset = scene.assets.find(a => a.type === "product" || a.type === "image") || scene.assets[0];
  const imageUrl = imageAsset ? (imageAsset.url || assetUrls[imageAsset.id]) : null;

  const words = scene.text.split(" ");
  const firstWord = words[0] || "";
  const restWords = words.slice(1).join(" ");

  return (
    <AbsoluteFill>
      <VibrantBackground frame={frame} primary={primary} secondary={secondary} />
      {/* Image de fond floutée */}
      {imageUrl && (
        <AbsoluteFill style={{ opacity: 0.25, filter: "blur(20px)" }}>
          <SafeImg src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      )}
      {/* Overlay */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)" }} />
      {/* Image principale */}
      {imageUrl && (
        <div style={{
          position: "absolute",
          right: isPortrait ? "5%" : "5%",
          bottom: isPortrait ? "20%" : "10%",
          width: isPortrait ? "85%" : "40%",
          opacity: interpolate(frame, [fps * 0.3, fps * 0.7], [0, 1], { extrapolateRight: "clamp" }),
          transform: `scale(${interpolate(spring({ frame: Math.max(0, frame - fps * 0.3), fps, config: { damping: 50, stiffness: 80 } }), [0, 1], [0.8, 1])})`,
        }}>
          <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: `0 30px 80px rgba(0,0,0,0.7)` }}>
            <SafeImg src={imageUrl} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
          </div>
        </div>
      )}
      {/* Texte accroche */}
      <div style={{
        position: "absolute",
        top: isPortrait ? "8%" : "15%",
        left: "5%",
        right: "5%",
        textAlign: "center",
      }}>
        {/* Premier mot en grand */}
        <PopText
          text={firstWord}
          frame={frame}
          fps={fps}
          delay={2}
          style={{
            fontSize: isPortrait ? 100 : 80,
            fontWeight: 900,
            color: accent,
            lineHeight: 1,
            display: "block",
            textShadow: `0 0 40px ${rgba(accent, 0.8)}, 4px 4px 0px ${rgba(primary, 0.8)}`,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
          }}
        />
        {/* Reste du texte */}
        {restWords && (
          <PopText
            text={restWords}
            frame={frame}
            fps={fps}
            delay={fps * 0.3}
            style={{
              fontSize: isPortrait ? 48 : 38,
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.2,
              display: "block",
              textShadow: "0 4px 20px rgba(0,0,0,0.8)",
              marginTop: 8,
            }}
          />
        )}
      </div>
      {/* Badges animés */}
      <AnimatedBadge text="🔥 TRENDING" frame={frame} fps={fps} delay={fps * 0.8} color={primary} x="5%" y="60%" />
      <AnimatedBadge text="⚡ NOUVEAU" frame={frame} fps={fps} delay={fps * 1.0} color={secondary} x="55%" y="65%" />
    </AbsoluteFill>
  );
}

// ── Scène Liste Bénéfices ──
function BenefitsScene({ scene, brand, assetUrls, frame, fps, width, height }: {
  scene: Scene; brand: Brand; assetUrls: Record<string, string>; frame: number; fps: number; width: number; height: number;
}) {
  const primary = brand.primary_color || "#FF006E";
  const secondary = brand.secondary_color || "#8338EC";
  const accent = brand.accent_color || "#FFBE0B";
  const isPortrait = height > width;

  const benefits = scene.text.split(/[•\-\/\|]/).map(b => b.trim()).filter(Boolean);
  const emojis = ["✅", "🚀", "💡", "⭐", "🎯", "💎"];

  return (
    <AbsoluteFill>
      <VibrantBackground frame={frame} primary={secondary} secondary={primary} />
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.4)" }} />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: isPortrait ? "60px 30px" : "40px 60px", gap: 20 }}>
        {/* Titre */}
        <PopText
          text="Pourquoi nous choisir ?"
          frame={frame}
          fps={fps}
          delay={0}
          style={{
            fontSize: isPortrait ? 36 : 28,
            fontWeight: 900,
            color: accent,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 8,
          }}
        />
        {/* Benefits */}
        {benefits.slice(0, 5).map((benefit, i) => {
          const delay = fps * 0.2 + i * fps * 0.18;
          const f = Math.max(0, frame - delay);
          const progress = spring({ frame: f, fps, config: { damping: 20, stiffness: 300, mass: 0.4 } });
          const scale = interpolate(progress, [0, 1], [0, 1]);
          const opacity = interpolate(f, [0, 5], [0, 1], { extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              width: "100%",
              maxWidth: 500,
              transform: `scale(${scale})`,
              opacity,
              background: "rgba(255,255,255,0.08)",
              border: `2px solid ${rgba(primary, 0.4)}`,
              borderRadius: 16,
              padding: isPortrait ? "14px 20px" : "10px 16px",
            }}>
              <span style={{ fontSize: isPortrait ? 28 : 24, flexShrink: 0 }}>{emojis[i % emojis.length]}</span>
              <span style={{
                fontSize: isPortrait ? 20 : 16,
                fontWeight: 700,
                color: "#FFFFFF",
                lineHeight: 1.3,
              }}>
                {benefit}
              </span>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── Scène CTA Social ──
function CtaSocial({ scene, brand, assetUrls, frame, fps, width, height }: {
  scene: Scene; brand: Brand; assetUrls: Record<string, string>; frame: number; fps: number; width: number; height: number;
}) {
  const primary = brand.primary_color || "#FF006E";
  const secondary = brand.secondary_color || "#8338EC";
  const accent = brand.accent_color || "#FFBE0B";
  const isPortrait = height > width;

  const logoAsset = scene.assets.find(a => a.type === "logo") || scene.assets[0];
  const logoUrl = logoAsset ? (logoAsset.url || assetUrls[logoAsset.id]) : null;

  const pulseScale = 1 + Math.sin(frame / 12) * 0.04;
  const arrowBounce = Math.sin(frame / 10) * 6;

  return (
    <AbsoluteFill>
      <VibrantBackground frame={frame} primary={primary} secondary={secondary} />
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.35)" }} />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: isPortrait ? 28 : 22, padding: 50 }}>
        {/* Logo */}
        {logoUrl && (
          <div style={{
            opacity: interpolate(frame, [0, fps * 0.4], [0, 1], { extrapolateRight: "clamp" }),
            transform: `scale(${interpolate(spring({ frame, fps, config: { damping: 15, stiffness: 300 } }), [0, 1], [0, 1])})`,
          }}>
            <SafeImg src={logoUrl} style={{ width: isPortrait ? 80 : 60, height: isPortrait ? 80 : 60, objectFit: "contain" }} />
          </div>
        )}
        {/* Texte principal */}
        <PopText
          text={scene.text}
          frame={frame}
          fps={fps}
          delay={fps * 0.2}
          style={{
            fontSize: isPortrait ? 56 : 44,
            fontWeight: 900,
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 1.2,
            textShadow: `0 0 40px ${rgba(primary, 0.8)}, 3px 3px 0 ${rgba(secondary, 0.6)}`,
            maxWidth: "90%",
            display: "block",
          }}
        />
        {/* Flèche animée */}
        <div style={{
          fontSize: isPortrait ? 40 : 32,
          transform: `translateY(${arrowBounce}px)`,
          opacity: interpolate(frame, [fps * 0.6, fps * 1.0], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          👇
        </div>
        {/* Bouton CTA */}
        <div style={{
          transform: `scale(${pulseScale})`,
          opacity: interpolate(frame, [fps * 0.7, fps * 1.2], [0, 1], { extrapolateRight: "clamp" }),
          background: `linear-gradient(135deg, ${primary}, ${secondary})`,
          color: "#FFFFFF",
          padding: isPortrait ? "20px 60px" : "16px 50px",
          borderRadius: 60,
          fontSize: isPortrait ? 22 : 18,
          fontWeight: 900,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          boxShadow: `0 0 50px ${rgba(primary, 0.7)}, 0 15px 50px rgba(0,0,0,0.5)`,
          cursor: "default",
          textAlign: "center",
        }}>
          Profiter maintenant 🔥
        </div>
        {/* Urgence */}
        <div style={{
          opacity: interpolate(frame, [fps * 1.2, fps * 1.6], [0, 1], { extrapolateRight: "clamp" }),
          fontSize: isPortrait ? 16 : 13,
          color: rgba(accent, 0.9),
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontWeight: 700,
          textAlign: "center",
        }}>
          ⏰ Offre limitée — Ne ratez pas ça !
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── Routeur de scènes ──
function SocialScene({ scene, brand, assetUrls, audioUrls }: {
  scene: Scene; brand: Brand; assetUrls: Record<string, string>; audioUrls?: Record<number, string>;
}) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const durationFrames = scene.duration_s * fps;
  const exitOpacity = interpolate(frame, [durationFrames - 8, durationFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const commonProps = { scene, brand, assetUrls, frame, fps, width, height };
  const content = (() => {
    switch (scene.type) {
      case "hero": return <HookScene {...commonProps} />;
      case "feature_list": return <BenefitsScene {...commonProps} />;
      case "carousel": return <BenefitsScene {...commonProps} />;
      case "outro": case "cta": return <CtaSocial {...commonProps} />;
      default: return <HookScene {...commonProps} />;
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
export const SocialMediaBurst: React.FC<SocialMediaBurstProps> = ({ scenes, brand, assetUrls, audioUrls }) => {
  const { fps } = useVideoConfig();
  let frameOffset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#1A0A2E" }}>
      {scenes.map((scene) => {
        const durationFrames = scene.duration_s * fps;
        const from = frameOffset;
        frameOffset += durationFrames;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={durationFrames}>
            <SocialScene scene={scene} brand={brand} assetUrls={assetUrls} audioUrls={audioUrls} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export default SocialMediaBurst;

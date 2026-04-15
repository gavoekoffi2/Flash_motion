/**
 * LuxuryAd — Template publicitaire haut de gamme
 * Effets : particules dorées, texte cinématique, transitions fluides, fond dégradé animé
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

// ── Utilitaires couleurs ──
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 20, g: 15, b: 5 };
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
export interface LuxuryAdProps { scenes: Scene[]; brand: Brand; assetUrls: Record<string, string>; audioUrls?: Record<number, string>; }

function SafeImg({ src, style }: { src: string | null | undefined; style: React.CSSProperties }) {
  if (!src) return null;
  return <Img src={src} style={style} />;
}

// ── Particule scintillante ──
function GoldParticle({ x, y, size, frame, delay, speed }: { x: number; y: number; size: number; frame: number; delay: number; speed: number }) {
  const f = Math.max(0, frame - delay);
  const opacity = interpolate(Math.sin((f * speed) / 30 + delay), [-1, 1], [0.1, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(Math.sin((f * speed * 0.7) / 30 + delay * 1.3), [-1, 1], [0.4, 1.2]);
  const moveY = (f * speed * 0.3) % 100;
  return (
    <div style={{
      position: "absolute",
      left: `${x}%`,
      top: `${(y - moveY + 100) % 100}%`,
      width: size,
      height: size,
      borderRadius: "50%",
      background: "radial-gradient(circle, #FFD700, #FFA500, transparent)",
      opacity,
      transform: `scale(${scale})`,
      filter: `blur(${size * 0.3}px)`,
      pointerEvents: "none",
    }} />
  );
}

// ── Ligne décorative animée ──
function AnimatedLine({ frame, fps, delay = 0, color, width: lineWidth, top, left }: { frame: number; fps: number; delay?: number; color: string; width: number; top: string; left: string }) {
  const progress = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 80, stiffness: 120, mass: 0.5 } });
  return (
    <div style={{
      position: "absolute",
      top,
      left,
      height: 2,
      width: interpolate(progress, [0, 1], [0, lineWidth]),
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      boxShadow: `0 0 12px ${color}`,
      borderRadius: 2,
    }} />
  );
}

// ── Texte cinématique lettre par lettre ──
function CinematicText({ text, frame, fps, startDelay = 0, style, letterStyle }: {
  text: string; frame: number; fps: number; startDelay?: number;
  style?: React.CSSProperties; letterStyle?: React.CSSProperties;
}) {
  const letters = text.split("");
  return (
    <span style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.02em", ...style }}>
      {letters.map((letter, i) => {
        const delay = startDelay + i * 2;
        const f = Math.max(0, frame - delay);
        const progress = spring({ frame: f, fps, config: { damping: 60, stiffness: 180, mass: 0.6 } });
        const opacity = interpolate(f, [0, 8], [0, 1], { extrapolateRight: "clamp" });
        const translateY = interpolate(progress, [0, 1], [40, 0]);
        const blur = interpolate(f, [0, 12], [8, 0], { extrapolateRight: "clamp" });
        return (
          <span key={i} style={{
            opacity,
            transform: `translateY(${translateY}px)`,
            filter: `blur(${blur}px)`,
            display: "inline-block",
            whiteSpace: letter === " " ? "pre" : "normal",
            ...letterStyle,
          }}>
            {letter === " " ? "\u00A0" : letter}
          </span>
        );
      })}
    </span>
  );
}

// ── Fond dégradé animé ──
function AnimatedBackground({ frame, primary, secondary, accent }: { frame: number; primary: string; secondary: string; accent: string }) {
  const angle = interpolate(frame, [0, 300], [135, 225], { extrapolateRight: "clamp" });
  const shift = Math.sin(frame / 80) * 15;
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(${angle}deg, ${darken(primary, 80)} 0%, ${darken(secondary, 60)} ${40 + shift}%, ${darken(accent, 70)} 100%)`,
    }} />
  );
}

// ── Scène Hero Luxe ──
function HeroLuxury({ scene, brand, assetUrls, frame, fps, width, height }: {
  scene: Scene; brand: Brand; assetUrls: Record<string, string>; frame: number; fps: number; width: number; height: number;
}) {
  const primary = brand.primary_color || "#C9A84C";
  const secondary = brand.secondary_color || "#8B6914";
  const accent = brand.accent_color || "#FFD700";
  const isPortrait = height > width;

  const logoAsset = scene.assets.find(a => a.type === "logo") || scene.assets[0];
  const logoUrl = logoAsset ? (logoAsset.url || assetUrls[logoAsset.id]) : null;

  const titleProgress = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 50, stiffness: 100, mass: 1 } });
  const subtitleOpacity = interpolate(frame, [fps * 0.8, fps * 1.4], [0, 1], { extrapolateRight: "clamp" });
  const lineProgress = spring({ frame: Math.max(0, frame - fps * 0.5), fps, config: { damping: 80, stiffness: 120 } });

  const particles = Array.from({ length: 18 }, (_, i) => ({
    x: (i * 37 + 5) % 95,
    y: (i * 53 + 10) % 90,
    size: 3 + (i % 4) * 2,
    delay: i * 8,
    speed: 0.4 + (i % 3) * 0.2,
  }));

  return (
    <AbsoluteFill>
      <AnimatedBackground frame={frame} primary={primary} secondary={secondary} accent={accent} />
      {/* Particules dorées */}
      {particles.map((p, i) => <GoldParticle key={i} {...p} frame={frame} />)}
      {/* Vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />
      {/* Contenu centré */}
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: isPortrait ? 32 : 24, padding: 60 }}>
        {/* Logo */}
        {logoUrl && (
          <div style={{
            opacity: interpolate(frame, [0, fps * 0.6], [0, 1], { extrapolateRight: "clamp" }),
            transform: `scale(${interpolate(titleProgress, [0, 1], [0.7, 1])})`,
            filter: `drop-shadow(0 0 30px ${rgba(accent, 0.8)})`,
          }}>
            <SafeImg src={logoUrl} style={{ width: isPortrait ? 120 : 90, height: isPortrait ? 120 : 90, objectFit: "contain" }} />
          </div>
        )}
        {/* Ligne décorative supérieure */}
        <AnimatedLine frame={frame} fps={fps} delay={fps * 0.3} color={accent} width={isPortrait ? 200 : 280} top="0" left="0" />
        {/* Titre principal */}
        <div style={{ textAlign: "center", maxWidth: "90%" }}>
          <CinematicText
            text={scene.text}
            frame={frame}
            fps={fps}
            startDelay={fps * 0.2}
            letterStyle={{
              fontSize: isPortrait ? 72 : 56,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textShadow: `0 0 40px ${rgba(accent, 0.6)}, 0 4px 20px rgba(0,0,0,0.8)`,
              fontFamily: "'Georgia', 'Times New Roman', serif",
            }}
          />
        </div>
        {/* Ligne décorative centrale */}
        <div style={{
          height: 2,
          width: interpolate(lineProgress, [0, 1], [0, isPortrait ? 160 : 220]),
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          boxShadow: `0 0 20px ${rgba(accent, 0.9)}`,
          borderRadius: 2,
        }} />
        {/* Sous-titre */}
        <div style={{
          opacity: subtitleOpacity,
          transform: `translateY(${interpolate(frame, [fps * 0.8, fps * 1.4], [20, 0], { extrapolateRight: "clamp" })}px)`,
          fontSize: isPortrait ? 22 : 18,
          color: rgba(accent, 0.85),
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          fontWeight: 400,
          textAlign: "center",
        }}>
          ✦ &nbsp; Découvrez l'exception &nbsp; ✦
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── Scène Feature Luxe ──
function FeatureLuxury({ scene, brand, assetUrls, frame, fps, width, height }: {
  scene: Scene; brand: Brand; assetUrls: Record<string, string>; frame: number; fps: number; width: number; height: number;
}) {
  const primary = brand.primary_color || "#C9A84C";
  const accent = brand.accent_color || "#FFD700";
  const isPortrait = height > width;

  const imageAsset = scene.assets.find(a => a.type === "product" || a.type === "image") || scene.assets[0];
  const imageUrl = imageAsset ? (imageAsset.url || assetUrls[imageAsset.id]) : null;

  const imgProgress = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 60, stiffness: 80, mass: 1.2 } });
  const textOpacity = interpolate(frame, [fps * 0.5, fps * 1.0], [0, 1], { extrapolateRight: "clamp" });
  const textY = interpolate(frame, [fps * 0.5, fps * 1.0], [30, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <AnimatedBackground frame={frame} primary={primary} secondary={darken(primary, 40)} accent={accent} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)" }} />
      <AbsoluteFill style={{
        display: "flex",
        flexDirection: isPortrait ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        padding: isPortrait ? "60px 40px" : "40px 80px",
        gap: isPortrait ? 40 : 60,
      }}>
        {/* Image produit */}
        {imageUrl && (
          <div style={{
            flex: isPortrait ? "none" : 1,
            display: "flex",
            justifyContent: "center",
            transform: `scale(${interpolate(imgProgress, [0, 1], [0.8, 1])}) translateX(${interpolate(imgProgress, [0, 1], [-40, 0])}px)`,
            opacity: interpolate(frame, [0, fps * 0.4], [0, 1], { extrapolateRight: "clamp" }),
          }}>
            <div style={{
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 60px ${rgba(accent, 0.3)}`,
              border: `1px solid ${rgba(accent, 0.4)}`,
            }}>
              <SafeImg src={imageUrl} style={{ width: isPortrait ? 280 : 320, height: isPortrait ? 280 : 320, objectFit: "cover" }} />
            </div>
          </div>
        )}
        {/* Texte */}
        <div style={{
          flex: 1,
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          textAlign: isPortrait ? "center" : "left",
        }}>
          <div style={{
            width: 50,
            height: 3,
            background: `linear-gradient(90deg, ${accent}, transparent)`,
            marginBottom: 20,
            marginLeft: isPortrait ? "auto" : 0,
            marginRight: isPortrait ? "auto" : 0,
            boxShadow: `0 0 15px ${rgba(accent, 0.8)}`,
          }} />
          <p style={{
            fontSize: isPortrait ? 44 : 38,
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1.3,
            margin: 0,
            textShadow: `0 4px 20px rgba(0,0,0,0.8)`,
            fontFamily: "'Georgia', serif",
          }}>
            {scene.text}
          </p>
          <div style={{
            marginTop: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
            justifyContent: isPortrait ? "center" : "flex-start",
            opacity: interpolate(frame, [fps * 1.0, fps * 1.5], [0, 1], { extrapolateRight: "clamp" }),
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent, boxShadow: `0 0 12px ${accent}` }} />
            <span style={{ fontSize: 14, color: rgba(accent, 0.8), letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Qualité premium
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── Scène Testimonial Luxe ──
function TestimonialLuxury({ scene, brand, assetUrls, frame, fps, width, height }: {
  scene: Scene; brand: Brand; assetUrls: Record<string, string>; frame: number; fps: number; width: number; height: number;
}) {
  const primary = brand.primary_color || "#C9A84C";
  const accent = brand.accent_color || "#FFD700";
  const isPortrait = height > width;

  const avatarAsset = scene.assets.find(a => a.type === "avatar" || a.type === "image") || scene.assets[0];
  const avatarUrl = avatarAsset ? (avatarAsset.url || assetUrls[avatarAsset.id]) : null;

  const quoteOpacity = interpolate(frame, [0, fps * 0.6], [0, 1], { extrapolateRight: "clamp" });
  const quoteScale = spring({ frame, fps, config: { damping: 70, stiffness: 100, mass: 0.8 } });

  return (
    <AbsoluteFill>
      <AnimatedBackground frame={frame} primary={primary} secondary={darken(primary, 50)} accent={accent} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(0,0,0,0.65) 100%)" }} />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 32 }}>
        {/* Guillemets décoratifs */}
        <div style={{
          fontSize: isPortrait ? 120 : 90,
          color: rgba(accent, 0.25),
          lineHeight: 0.8,
          fontFamily: "Georgia, serif",
          opacity: quoteOpacity,
          transform: `scale(${interpolate(quoteScale, [0, 1], [0.5, 1])})`,
          userSelect: "none",
        }}>
          "
        </div>
        {/* Citation */}
        <p style={{
          fontSize: isPortrait ? 38 : 30,
          fontWeight: 500,
          color: "#FFFFFF",
          textAlign: "center",
          lineHeight: 1.6,
          maxWidth: "85%",
          fontStyle: "italic",
          fontFamily: "Georgia, serif",
          textShadow: "0 4px 20px rgba(0,0,0,0.7)",
          opacity: quoteOpacity,
          transform: `translateY(${interpolate(frame, [0, fps * 0.6], [30, 0], { extrapolateRight: "clamp" })}px)`,
        }}>
          {scene.text}
        </p>
        {/* Avatar + nom */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: interpolate(frame, [fps * 0.7, fps * 1.2], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [fps * 0.7, fps * 1.2], [20, 0], { extrapolateRight: "clamp" })}px)`,
        }}>
          {avatarUrl ? (
            <div style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              overflow: "hidden",
              border: `2px solid ${rgba(accent, 0.7)}`,
              boxShadow: `0 0 20px ${rgba(accent, 0.4)}`,
            }}>
              <SafeImg src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ) : (
            <div style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${primary}, ${accent})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              color: "#000",
              fontWeight: 700,
            }}>
              ★
            </div>
          )}
          <div>
            <div style={{ width: 60, height: 1, background: rgba(accent, 0.6), marginBottom: 6 }} />
            <span style={{ fontSize: 13, color: rgba(accent, 0.8), letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Client satisfait
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── Scène CTA Luxe ──
function CtaLuxury({ scene, brand, assetUrls, frame, fps, width, height }: {
  scene: Scene; brand: Brand; assetUrls: Record<string, string>; frame: number; fps: number; width: number; height: number;
}) {
  const primary = brand.primary_color || "#C9A84C";
  const accent = brand.accent_color || "#FFD700";
  const isPortrait = height > width;

  const logoAsset = scene.assets.find(a => a.type === "logo") || scene.assets[0];
  const logoUrl = logoAsset ? (logoAsset.url || assetUrls[logoAsset.id]) : null;

  const mainProgress = spring({ frame, fps, config: { damping: 55, stiffness: 90, mass: 1.1 } });
  const btnOpacity = interpolate(frame, [fps * 0.8, fps * 1.4], [0, 1], { extrapolateRight: "clamp" });
  const btnScale = spring({ frame: Math.max(0, frame - fps * 0.8), fps, config: { damping: 60, stiffness: 200, mass: 0.5 } });
  const glowPulse = interpolate(Math.sin(frame / 20), [-1, 1], [0.6, 1.0]);

  const particles = Array.from({ length: 24 }, (_, i) => ({
    x: (i * 29 + 3) % 95,
    y: (i * 41 + 7) % 90,
    size: 2 + (i % 5) * 1.5,
    delay: i * 6,
    speed: 0.3 + (i % 4) * 0.15,
  }));

  return (
    <AbsoluteFill>
      <AnimatedBackground frame={frame} primary={primary} secondary={darken(primary, 50)} accent={accent} />
      {particles.map((p, i) => <GoldParticle key={i} {...p} frame={frame} />)}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)" }} />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: isPortrait ? 36 : 28, padding: 60 }}>
        {/* Logo */}
        {logoUrl && (
          <div style={{
            opacity: interpolate(frame, [0, fps * 0.5], [0, 1], { extrapolateRight: "clamp" }),
            transform: `scale(${interpolate(mainProgress, [0, 1], [0.6, 1])})`,
            filter: `drop-shadow(0 0 40px ${rgba(accent, glowPulse)})`,
          }}>
            <SafeImg src={logoUrl} style={{ width: isPortrait ? 100 : 80, height: isPortrait ? 100 : 80, objectFit: "contain" }} />
          </div>
        )}
        {/* Titre CTA */}
        <div style={{ textAlign: "center", maxWidth: "88%" }}>
          <CinematicText
            text={scene.text}
            frame={frame}
            fps={fps}
            startDelay={fps * 0.15}
            letterStyle={{
              fontSize: isPortrait ? 64 : 50,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              textShadow: `0 0 50px ${rgba(accent, 0.7)}, 0 4px 30px rgba(0,0,0,0.9)`,
              fontFamily: "Georgia, serif",
            }}
          />
        </div>
        {/* Ligne dorée */}
        <div style={{
          height: 2,
          width: interpolate(mainProgress, [0, 1], [0, isPortrait ? 200 : 280]),
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          boxShadow: `0 0 25px ${rgba(accent, glowPulse)}`,
          borderRadius: 2,
        }} />
        {/* Bouton CTA */}
        <div style={{
          opacity: btnOpacity,
          transform: `scale(${interpolate(btnScale, [0, 1], [0.8, 1])})`,
          background: `linear-gradient(135deg, ${primary}, ${accent})`,
          color: "#000000",
          padding: isPortrait ? "18px 60px" : "14px 50px",
          borderRadius: 60,
          fontSize: isPortrait ? 22 : 18,
          fontWeight: 800,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          boxShadow: `0 0 40px ${rgba(accent, 0.6)}, 0 10px 40px rgba(0,0,0,0.5)`,
          cursor: "default",
        }}>
          Découvrir maintenant
        </div>
        {/* Tagline */}
        <div style={{
          opacity: interpolate(frame, [fps * 1.4, fps * 2.0], [0, 0.6], { extrapolateRight: "clamp" }),
          fontSize: isPortrait ? 14 : 12,
          color: rgba(accent, 0.7),
          letterSpacing: "0.3em",
          textTransform: "uppercase",
        }}>
          Flash Motion &nbsp;•&nbsp; L'excellence en mouvement
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── Routeur de scènes ──
function LuxuryScene({ scene, brand, assetUrls, audioUrls }: {
  scene: Scene; brand: Brand; assetUrls: Record<string, string>; audioUrls?: Record<number, string>;
}) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const durationFrames = scene.duration_s * fps;

  // Transition de sortie (fade out les 12 dernières frames)
  const exitOpacity = interpolate(frame, [durationFrames - 12, durationFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const commonProps = { scene, brand, assetUrls, frame, fps, width, height };
  const content = (() => {
    switch (scene.type) {
      case "hero": return <HeroLuxury {...commonProps} />;
      case "feature_list": return <FeatureLuxury {...commonProps} />;
      case "testimonial": return <TestimonialLuxury {...commonProps} />;
      case "outro": case "cta": return <CtaLuxury {...commonProps} />;
      default: return <HeroLuxury {...commonProps} />;
    }
  })();

  const audioUrl = audioUrls?.[scene.id];
  return (
    <AbsoluteFill style={{ opacity: exitOpacity, fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      {content}
      {audioUrl && <Audio src={audioUrl} volume={0.9} startFrom={0} endAt={scene.duration_s * 30} />}
    </AbsoluteFill>
  );
}

// ── Composition principale ──
export const LuxuryAd: React.FC<LuxuryAdProps> = ({ scenes, brand, assetUrls, audioUrls }) => {
  const { fps } = useVideoConfig();
  let frameOffset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0805" }}>
      {scenes.map((scene) => {
        const durationFrames = scene.duration_s * fps;
        const from = frameOffset;
        frameOffset += durationFrames;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={durationFrames}>
            <LuxuryScene scene={scene} brand={brand} assetUrls={assetUrls} audioUrls={audioUrls} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export default LuxuryAd;

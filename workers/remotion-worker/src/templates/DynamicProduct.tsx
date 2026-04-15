/**
 * DynamicProduct — Template produit dynamique style agence moderne
 * Effets : split-screen, zoom cinématique, texte glitch, néon, transitions énergiques
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
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 10, g: 10, b: 20 };
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
export interface DynamicProductProps { scenes: Scene[]; brand: Brand; assetUrls: Record<string, string>; audioUrls?: Record<number, string>; }

function SafeImg({ src, style }: { src: string | null | undefined; style: React.CSSProperties }) {
  if (!src) return null;
  return <Img src={src} style={style} />;
}

// ── Texte avec effet glitch ──
function GlitchText({ text, frame, fps, startDelay = 0, style }: {
  text: string; frame: number; fps: number; startDelay?: number; style?: React.CSSProperties;
}) {
  const f = Math.max(0, frame - startDelay);
  const progress = spring({ frame: f, fps, config: { damping: 40, stiffness: 200, mass: 0.5 } });
  const opacity = interpolate(f, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  const glitchActive = f > 4 && f < 18;
  const glitchX = glitchActive ? (Math.sin(f * 7.3) * 4) : 0;
  const glitchY = glitchActive ? (Math.cos(f * 5.1) * 2) : 0;
  const scaleX = interpolate(progress, [0, 1], [1.15, 1]);

  return (
    <div style={{ position: "relative", display: "inline-block", opacity, transform: `scaleX(${scaleX})`, ...style }}>
      {/* Couche glitch rouge */}
      {glitchActive && (
        <span style={{
          position: "absolute",
          left: glitchX + 2,
          top: glitchY,
          color: "rgba(255,50,50,0.6)",
          clipPath: `inset(${20 + Math.sin(f) * 15}% 0 ${30 + Math.cos(f) * 10}% 0)`,
          pointerEvents: "none",
          ...style,
        }}>{text}</span>
      )}
      {/* Couche glitch cyan */}
      {glitchActive && (
        <span style={{
          position: "absolute",
          left: -glitchX - 2,
          top: -glitchY,
          color: "rgba(0,255,255,0.5)",
          clipPath: `inset(${50 + Math.cos(f * 1.3) * 20}% 0 ${10 + Math.sin(f * 0.7) * 8}% 0)`,
          pointerEvents: "none",
          ...style,
        }}>{text}</span>
      )}
      {/* Texte principal */}
      <span style={{ position: "relative", zIndex: 2 }}>{text}</span>
    </div>
  );
}

// ── Barre d'énergie animée ──
function EnergyBar({ frame, fps, delay, color, width: barWidth, height: barHeight = 4 }: {
  frame: number; fps: number; delay: number; color: string; width: number; height?: number;
}) {
  const progress = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 60, stiffness: 150 } });
  return (
    <div style={{
      height: barHeight,
      width: interpolate(progress, [0, 1], [0, barWidth]),
      background: `linear-gradient(90deg, ${color}, ${lighten(color, 60)})`,
      boxShadow: `0 0 15px ${color}, 0 0 30px ${rgba(color, 0.5)}`,
      borderRadius: barHeight,
    }} />
  );
}

// ── Fond géométrique dynamique ──
function GeometricBackground({ frame, primary, accent }: { frame: number; primary: string; accent: string }) {
  const angle = (frame * 0.3) % 360;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Fond de base */}
      <AbsoluteFill style={{ background: `linear-gradient(160deg, #050510 0%, ${darken(primary, 80)} 50%, #050510 100%)` }} />
      {/* Cercle décoratif 1 */}
      <div style={{
        position: "absolute",
        right: "-15%",
        top: "-15%",
        width: "60%",
        aspectRatio: "1",
        borderRadius: "50%",
        border: `2px solid ${rgba(primary, 0.25)}`,
        transform: `rotate(${angle}deg)`,
      }} />
      {/* Cercle décoratif 2 */}
      <div style={{
        position: "absolute",
        right: "-5%",
        top: "-5%",
        width: "40%",
        aspectRatio: "1",
        borderRadius: "50%",
        border: `1px solid ${rgba(accent, 0.3)}`,
        transform: `rotate(${-angle * 0.7}deg)`,
      }} />
      {/* Grille de points */}
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(${rgba(primary, 0.15)} 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        opacity: 0.6,
      }} />
    </AbsoluteFill>
  );
}

// ── Scène Hero Produit ──
function HeroDynamic({ scene, brand, assetUrls, frame, fps, width, height }: {
  scene: Scene; brand: Brand; assetUrls: Record<string, string>; frame: number; fps: number; width: number; height: number;
}) {
  const primary = brand.primary_color || "#00D4FF";
  const accent = brand.accent_color || lighten(primary, 50);
  const isPortrait = height > width;

  const imageAsset = scene.assets.find(a => a.type === "product" || a.type === "image") || scene.assets[0];
  const imageUrl = imageAsset ? (imageAsset.url || assetUrls[imageAsset.id]) : null;

  const imgProgress = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 50, stiffness: 80, mass: 1.3 } });
  const zoomScale = interpolate(frame, [0, fps * scene.duration_s], [1, 1.08]);

  return (
    <AbsoluteFill>
      <GeometricBackground frame={frame} primary={primary} accent={accent} />
      {/* Image produit avec zoom lent */}
      {imageUrl && (
        <div style={{
          position: "absolute",
          right: isPortrait ? "5%" : "3%",
          top: "50%",
          transform: `translateY(-50%) scale(${interpolate(imgProgress, [0, 1], [0.7, 1])}) scale(${zoomScale})`,
          opacity: interpolate(frame, [0, fps * 0.5], [0, 1], { extrapolateRight: "clamp" }),
          width: isPortrait ? "80%" : "45%",
        }}>
          <div style={{
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: `0 40px 100px rgba(0,0,0,0.8), 0 0 80px ${rgba(primary, 0.4)}`,
            border: `1px solid ${rgba(primary, 0.5)}`,
          }}>
            <SafeImg src={imageUrl} style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }} />
          </div>
          {/* Reflet */}
          <div style={{
            position: "absolute",
            bottom: -40,
            left: "10%",
            right: "10%",
            height: 40,
            background: `linear-gradient(180deg, ${rgba(primary, 0.15)}, transparent)`,
            filter: "blur(8px)",
            transform: "scaleY(-1)",
          }} />
        </div>
      )}
      {/* Contenu textuel */}
      <div style={{
        position: "absolute",
        left: isPortrait ? "5%" : "5%",
        top: "50%",
        transform: "translateY(-50%)",
        width: isPortrait ? "90%" : "50%",
        padding: isPortrait ? "0 20px" : "0 40px",
      }}>
        {/* Tag catégorie */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: rgba(primary, 0.15),
          border: `1px solid ${rgba(primary, 0.4)}`,
          borderRadius: 30,
          padding: "6px 16px",
          marginBottom: 20,
          opacity: interpolate(frame, [fps * 0.2, fps * 0.6], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateX(${interpolate(frame, [fps * 0.2, fps * 0.6], [-30, 0], { extrapolateRight: "clamp" })}px)`,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: primary, boxShadow: `0 0 8px ${primary}` }} />
          <span style={{ fontSize: 12, color: primary, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
            Nouveau produit
          </span>
        </div>
        {/* Titre avec glitch */}
        <GlitchText
          text={scene.text}
          frame={frame}
          fps={fps}
          startDelay={fps * 0.3}
          style={{
            fontSize: isPortrait ? 56 : 48,
            fontWeight: 900,
            color: "#FFFFFF",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            textShadow: `0 0 40px ${rgba(primary, 0.6)}`,
            display: "block",
            marginBottom: 24,
          }}
        />
        {/* Barre d'énergie */}
        <EnergyBar frame={frame} fps={fps} delay={fps * 0.8} color={primary} width={isPortrait ? 200 : 280} />
        {/* Sous-titre */}
        <div style={{
          marginTop: 20,
          opacity: interpolate(frame, [fps * 1.0, fps * 1.5], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [fps * 1.0, fps * 1.5], [15, 0], { extrapolateRight: "clamp" })}px)`,
          fontSize: isPortrait ? 18 : 16,
          color: rgba("#FFFFFF", 0.6),
          letterSpacing: "0.05em",
        }}>
          Performance · Innovation · Design
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Scène Features Produit ──
function FeaturesDynamic({ scene, brand, assetUrls, frame, fps, width, height }: {
  scene: Scene; brand: Brand; assetUrls: Record<string, string>; frame: number; fps: number; width: number; height: number;
}) {
  const primary = brand.primary_color || "#00D4FF";
  const accent = brand.accent_color || lighten(primary, 50);
  const isPortrait = height > width;

  // Extraire les features du texte (séparées par • ou /)
  const rawFeatures = scene.text.split(/[•\/\|]/).map(f => f.trim()).filter(Boolean);
  const features = rawFeatures.length > 1 ? rawFeatures : [scene.text];

  return (
    <AbsoluteFill>
      <GeometricBackground frame={frame} primary={primary} accent={accent} />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: isPortrait ? "60px 40px" : "40px 80px", gap: 32 }}>
        {/* Titre section */}
        <div style={{
          opacity: interpolate(frame, [0, fps * 0.4], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [0, fps * 0.4], [-20, 0], { extrapolateRight: "clamp" })}px)`,
          fontSize: isPortrait ? 20 : 16,
          color: primary,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          fontWeight: 700,
          textAlign: "center",
        }}>
          ◈ &nbsp; Caractéristiques &nbsp; ◈
        </div>
        {/* Liste de features */}
        <div style={{ display: "flex", flexDirection: "column", gap: isPortrait ? 20 : 16, width: "100%", maxWidth: 600 }}>
          {features.map((feature, i) => {
            const delay = fps * 0.3 + i * fps * 0.2;
            const itemProgress = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 60, stiffness: 150, mass: 0.6 } });
            const opacity = interpolate(Math.max(0, frame - delay), [0, fps * 0.3], [0, 1], { extrapolateRight: "clamp" });
            return (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity,
                transform: `translateX(${interpolate(itemProgress, [0, 1], [-50, 0])}px)`,
                background: rgba(primary, 0.08),
                border: `1px solid ${rgba(primary, 0.25)}`,
                borderRadius: 12,
                padding: isPortrait ? "16px 24px" : "12px 20px",
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${primary}, ${accent})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 900,
                  color: "#000",
                  flexShrink: 0,
                  boxShadow: `0 0 20px ${rgba(primary, 0.5)}`,
                }}>
                  {i + 1}
                </div>
                <span style={{
                  fontSize: isPortrait ? 22 : 18,
                  fontWeight: 600,
                  color: "#FFFFFF",
                  lineHeight: 1.3,
                }}>
                  {feature}
                </span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── Scène Showcase Produit ──
function ShowcaseDynamic({ scene, brand, assetUrls, frame, fps, width, height }: {
  scene: Scene; brand: Brand; assetUrls: Record<string, string>; frame: number; fps: number; width: number; height: number;
}) {
  const primary = brand.primary_color || "#00D4FF";
  const accent = brand.accent_color || lighten(primary, 50);
  const isPortrait = height > width;

  const images = scene.assets
    .filter(a => a.type === "product" || a.type === "image")
    .map(a => a.url || assetUrls[a.id])
    .filter(Boolean);

  return (
    <AbsoluteFill>
      <GeometricBackground frame={frame} primary={primary} accent={accent} />
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, gap: 30 }}>
        {/* Grille d'images */}
        {images.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: images.length === 1 ? "1fr" : images.length === 2 ? "1fr 1fr" : "1fr 1fr 1fr",
            gap: 16,
            width: "100%",
            maxWidth: isPortrait ? 400 : 700,
          }}>
            {images.slice(0, 3).map((url, i) => {
              const delay = i * fps * 0.15;
              const itemProgress = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 55, stiffness: 120, mass: 0.8 } });
              return (
                <div key={i} style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  aspectRatio: "1",
                  transform: `scale(${interpolate(itemProgress, [0, 1], [0.7, 1])}) translateY(${interpolate(itemProgress, [0, 1], [30, 0])}px)`,
                  opacity: interpolate(Math.max(0, frame - delay), [0, fps * 0.3], [0, 1], { extrapolateRight: "clamp" }),
                  boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 30px ${rgba(primary, 0.3)}`,
                  border: `1px solid ${rgba(primary, 0.3)}`,
                }}>
                  <SafeImg src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              );
            })}
          </div>
        )}
        {/* Texte */}
        <div style={{
          opacity: interpolate(frame, [fps * 0.5, fps * 1.0], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [fps * 0.5, fps * 1.0], [20, 0], { extrapolateRight: "clamp" })}px)`,
          textAlign: "center",
          maxWidth: "90%",
        }}>
          <p style={{
            fontSize: isPortrait ? 36 : 28,
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1.4,
            margin: 0,
            textShadow: `0 4px 20px rgba(0,0,0,0.8)`,
          }}>
            {scene.text}
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── Scène CTA Dynamique ──
function CtaDynamic({ scene, brand, assetUrls, frame, fps, width, height }: {
  scene: Scene; brand: Brand; assetUrls: Record<string, string>; frame: number; fps: number; width: number; height: number;
}) {
  const primary = brand.primary_color || "#00D4FF";
  const accent = brand.accent_color || lighten(primary, 50);
  const isPortrait = height > width;

  const logoAsset = scene.assets.find(a => a.type === "logo") || scene.assets[0];
  const logoUrl = logoAsset ? (logoAsset.url || assetUrls[logoAsset.id]) : null;

  const mainProgress = spring({ frame, fps, config: { damping: 50, stiffness: 100, mass: 1 } });
  const btnProgress = spring({ frame: Math.max(0, frame - fps * 0.7), fps, config: { damping: 55, stiffness: 200, mass: 0.5 } });
  const pulseScale = 1 + Math.sin(frame / 15) * 0.03;

  return (
    <AbsoluteFill>
      <GeometricBackground frame={frame} primary={primary} accent={accent} />
      {/* Halo central */}
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: isPortrait ? 400 : 500,
          height: isPortrait ? 400 : 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${rgba(primary, 0.12)} 0%, transparent 70%)`,
          transform: `scale(${pulseScale})`,
        }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: isPortrait ? 32 : 24, padding: 60 }}>
        {/* Logo */}
        {logoUrl && (
          <div style={{
            opacity: interpolate(frame, [0, fps * 0.4], [0, 1], { extrapolateRight: "clamp" }),
            transform: `scale(${interpolate(mainProgress, [0, 1], [0.5, 1])})`,
            filter: `drop-shadow(0 0 30px ${rgba(primary, 0.8)})`,
          }}>
            <SafeImg src={logoUrl} style={{ width: isPortrait ? 90 : 70, height: isPortrait ? 90 : 70, objectFit: "contain" }} />
          </div>
        )}
        {/* Titre */}
        <GlitchText
          text={scene.text}
          frame={frame}
          fps={fps}
          startDelay={fps * 0.2}
          style={{
            fontSize: isPortrait ? 60 : 48,
            fontWeight: 900,
            color: "#FFFFFF",
            textAlign: "center",
            letterSpacing: "-0.02em",
            textShadow: `0 0 50px ${rgba(primary, 0.7)}, 0 4px 30px rgba(0,0,0,0.9)`,
            display: "block",
            maxWidth: "90%",
          }}
        />
        {/* Barre d'énergie */}
        <EnergyBar frame={frame} fps={fps} delay={fps * 0.6} color={primary} width={isPortrait ? 180 : 250} height={3} />
        {/* Bouton CTA */}
        <div style={{
          opacity: interpolate(frame, [fps * 0.8, fps * 1.3], [0, 1], { extrapolateRight: "clamp" }),
          transform: `scale(${interpolate(btnProgress, [0, 1], [0.7, 1])})`,
          background: `linear-gradient(135deg, ${primary}, ${accent})`,
          color: "#000000",
          padding: isPortrait ? "18px 56px" : "14px 48px",
          borderRadius: 8,
          fontSize: isPortrait ? 20 : 16,
          fontWeight: 900,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          boxShadow: `0 0 50px ${rgba(primary, 0.6)}, 0 10px 40px rgba(0,0,0,0.5)`,
          cursor: "default",
        }}>
          Commander maintenant
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── Routeur de scènes ──
function DynamicScene({ scene, brand, assetUrls, audioUrls }: {
  scene: Scene; brand: Brand; assetUrls: Record<string, string>; audioUrls?: Record<number, string>;
}) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const durationFrames = scene.duration_s * fps;
  const exitOpacity = interpolate(frame, [durationFrames - 10, durationFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const commonProps = { scene, brand, assetUrls, frame, fps, width, height };
  const content = (() => {
    switch (scene.type) {
      case "hero": return <HeroDynamic {...commonProps} />;
      case "feature_list": return <FeaturesDynamic {...commonProps} />;
      case "carousel": return <ShowcaseDynamic {...commonProps} />;
      case "outro": case "cta": return <CtaDynamic {...commonProps} />;
      default: return <HeroDynamic {...commonProps} />;
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
export const DynamicProduct: React.FC<DynamicProductProps> = ({ scenes, brand, assetUrls, audioUrls }) => {
  const { fps } = useVideoConfig();
  let frameOffset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#050510" }}>
      {scenes.map((scene) => {
        const durationFrames = scene.duration_s * fps;
        const from = frameOffset;
        frameOffset += durationFrames;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={durationFrames}>
            <DynamicScene scene={scene} brand={brand} assetUrls={assetUrls} audioUrls={audioUrls} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export default DynamicProduct;

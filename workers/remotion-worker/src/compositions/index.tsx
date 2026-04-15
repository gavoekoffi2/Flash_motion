import { registerRoot } from "remotion";
import { Composition } from "remotion";
import React from "react";
import { HeroPromo, HeroPromoProps } from "../templates/HeroPromo";
import { CinematicPromo } from "../templates/CinematicPromo";
import { Carousel } from "../templates/Carousel";
import { FeatureList } from "../templates/FeatureList";
import { Demo } from "../templates/Demo";
import { Outro } from "../templates/Outro";
import { EcommerceShowcase } from "../templates/EcommerceShowcase";
import { Testimonial } from "../templates/Testimonial";
import { Educational } from "../templates/Educational";
import { SaasLaunch } from "../templates/SaasLaunch";
// ── Nouveaux templates professionnels ──
import { LuxuryAd } from "../templates/LuxuryAd";
import { DynamicProduct } from "../templates/DynamicProduct";
import { SocialMediaBurst } from "../templates/SocialMediaBurst";
import { CinematicBrand } from "../templates/CinematicBrand";

// 30fps pour une fluidité professionnelle (les nouveaux templates l'exigent)
const FPS = 30;

const defaultProps: HeroPromoProps = {
  scenes: [
    { id: 1, duration_s: 4, type: "hero", text: "Découvrez le produit X.", assets: [], animation: "fade_in_up" },
    { id: 2, duration_s: 3, type: "feature_list", text: "Un design élégant.", assets: [], animation: "slide_left" },
    { id: 3, duration_s: 3, type: "outro", text: "Commandez maintenant.", assets: [], animation: "zoom_in" },
  ],
  brand: { primary_color: "#FF6B35", logo_id: null },
  assetUrls: {},
};

const defaultMultiProps = {
  scenes: [
    { id: 1, duration_s: 4, type: "hero", text: "Bienvenue", assets: [], animation: "fade_in_up" },
    { id: 2, duration_s: 3, type: "feature_list", text: "Nos avantages", assets: [], animation: "slide_left" },
    { id: 3, duration_s: 3, type: "outro", text: "Rejoignez-nous", assets: [], animation: "zoom_in" },
  ],
  brand: { primary_color: "#FF6B35", logo_id: null },
  assetUrls: {},
};

const defaultCinematicProps = {
  scenes: [
    { id: 1, duration_s: 5, type: "hero", text: "Découvrez quelque chose d'extraordinaire.", assets: [], animation: "fade_in_up" },
    { id: 2, duration_s: 4, type: "feature_list", text: "Performance • Design élégant • Résultats prouvés", assets: [], animation: "slide_left" },
    { id: 3, duration_s: 4, type: "outro", text: "Commencez aujourd'hui.", assets: [], animation: "zoom_in" },
  ],
  brand: { primary_color: "#6C63FF", secondary_color: "#3D37B5", accent_color: "#C77DFF", logo_id: null },
  assetUrls: {},
};

const totalDuration = defaultProps.scenes.reduce((sum: number, s: any) => sum + s.duration_s, 0);
const totalMultiDuration = defaultMultiProps.scenes.reduce((sum: number, s: any) => sum + s.duration_s, 0);

type AnyComp = React.ComponentType<Record<string, unknown>>;

function makeCompositions(id: string, component: AnyComp, props: object, duration: number) {
  return (
    <>
      <Composition id={id} component={component} durationInFrames={duration * FPS} fps={FPS} width={720} height={1280} defaultProps={props} />
      <Composition id={id + "-16x9"} component={component} durationInFrames={duration * FPS} fps={FPS} width={1280} height={720} defaultProps={props} />
      <Composition id={id + "-1x1"} component={component} durationInFrames={duration * FPS} fps={FPS} width={1080} height={1080} defaultProps={props} />
    </>
  );
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {makeCompositions("HeroPromo", HeroPromo as unknown as AnyComp, defaultProps, totalDuration)}
      {makeCompositions("Carousel", Carousel as unknown as AnyComp, defaultMultiProps, totalMultiDuration)}
      {makeCompositions("FeatureList", FeatureList as unknown as AnyComp, defaultMultiProps, totalMultiDuration)}
      {makeCompositions("Demo", Demo as unknown as AnyComp, defaultMultiProps, totalMultiDuration)}
      {makeCompositions("Outro", Outro as unknown as AnyComp, defaultMultiProps, totalMultiDuration)}
      {makeCompositions("EcommerceShowcase", EcommerceShowcase as unknown as AnyComp, defaultMultiProps, totalMultiDuration)}
      {makeCompositions("Testimonial", Testimonial as unknown as AnyComp, defaultMultiProps, totalMultiDuration)}
      {makeCompositions("Educational", Educational as unknown as AnyComp, defaultMultiProps, totalMultiDuration)}
      {makeCompositions("SaasLaunch", SaasLaunch as unknown as AnyComp, defaultMultiProps, totalMultiDuration)}
      {makeCompositions("CinematicPromo", CinematicPromo as unknown as AnyComp, defaultCinematicProps, defaultCinematicProps.scenes.reduce((s, sc) => s + sc.duration_s, 0))}
      {/* ── Nouveaux templates professionnels ── */}
      {makeCompositions("LuxuryAd", LuxuryAd as unknown as AnyComp, {
        scenes: [
          { id: 1, duration_s: 5, type: "hero", text: "L'Excellence Redéfinie", assets: [], animation: "fade_in_up" },
          { id: 2, duration_s: 5, type: "feature_list", text: "Craftsmanship d'exception pour les connaisseurs.", assets: [], animation: "slide_left" },
          { id: 3, duration_s: 4, type: "outro", text: "Découvrez l'exception.", assets: [], animation: "zoom_in" },
        ],
        brand: { primary_color: "#C9A84C", secondary_color: "#8B6914", accent_color: "#FFD700", logo_id: null },
        assetUrls: {},
      }, 14)}
      {makeCompositions("DynamicProduct", DynamicProduct as unknown as AnyComp, {
        scenes: [
          { id: 1, duration_s: 5, type: "hero", text: "Nouveau Produit Révolutionnaire", assets: [], animation: "glitch" },
          { id: 2, duration_s: 4, type: "feature_list", text: "Performance • Innovation • Design", assets: [], animation: "slide_left" },
          { id: 3, duration_s: 4, type: "outro", text: "Commander maintenant", assets: [], animation: "zoom_in" },
        ],
        brand: { primary_color: "#00D4FF", accent_color: "#7B2FFF", logo_id: null },
        assetUrls: {},
      }, 13)}
      {makeCompositions("SocialMediaBurst", SocialMediaBurst as unknown as AnyComp, {
        scenes: [
          { id: 1, duration_s: 4, type: "hero", text: "INCROYABLE Offre du moment", assets: [], animation: "pop" },
          { id: 2, duration_s: 4, type: "feature_list", text: "Livraison gratuite • -50% • Qualité premium", assets: [], animation: "slide_left" },
          { id: 3, duration_s: 3, type: "outro", text: "Profitez maintenant !", assets: [], animation: "bounce" },
        ],
        brand: { primary_color: "#FF006E", secondary_color: "#8338EC", accent_color: "#FFBE0B", logo_id: null },
        assetUrls: {},
      }, 11)}
      {makeCompositions("CinematicBrand", CinematicBrand as unknown as AnyComp, {
        scenes: [
          { id: 1, duration_s: 6, type: "hero", text: "Notre Vision", assets: [], animation: "cinematic" },
          { id: 2, duration_s: 5, type: "feature_list", text: "Nous créons l'avenir avec passion et innovation.", assets: [], animation: "reveal" },
          { id: 3, duration_s: 5, type: "outro", text: "Rejoignez l'aventure.", assets: [], animation: "finale" },
        ],
        brand: { primary_color: "#4A90E2", secondary_color: "#1A3A6E", accent_color: "#7EC8E3", logo_id: null },
        assetUrls: {},
      }, 16)}
    </>
  );
};

registerRoot(RemotionRoot);

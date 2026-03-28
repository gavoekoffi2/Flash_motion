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

// Reduced from 30fps/1080p to 24fps/720p for faster rendering on VPS
const FPS = 24;

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
      <Composition id={id + "-1x1"} component={component} durationInFrames={duration * FPS} fps={FPS} width={720} height={720} defaultProps={props} />
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
    </>
  );
};

registerRoot(RemotionRoot);

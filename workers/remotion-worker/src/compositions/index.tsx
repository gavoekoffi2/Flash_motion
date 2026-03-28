import { registerRoot } from "remotion";
import { Composition } from "remotion";
import React from "react";
import { HeroPromo, HeroPromoProps } from "../templates/HeroPromo";
import { Carousel } from "../templates/Carousel";
import { FeatureList } from "../templates/FeatureList";
import { Demo } from "../templates/Demo";
import { Outro } from "../templates/Outro";
import { EcommerceShowcase } from "../templates/EcommerceShowcase";
import { Testimonial } from "../templates/Testimonial";
import { Educational } from "../templates/Educational";
import { SaasLaunch } from "../templates/SaasLaunch";

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

const totalDuration = defaultProps.scenes.reduce((sum: number, s: any) => sum + s.duration_s, 0);
const totalMultiDuration = defaultMultiProps.scenes.reduce((sum: number, s: any) => sum + s.duration_s, 0);

type AnyComp = React.ComponentType<Record<string, unknown>>;

function makeCompositions(id: string, component: AnyComp, props: object, duration: number) {
  return (
    <>
      <Composition id={id} component={component} durationInFrames={duration * FPS} fps={FPS} width={1080} height={1920} defaultProps={props} />
      <Composition id={id + "-16x9"} component={component} durationInFrames={duration * FPS} fps={FPS} width={1920} height={1080} defaultProps={props} />
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
    </>
  );
};

registerRoot(RemotionRoot);

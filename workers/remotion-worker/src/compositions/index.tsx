import { registerRoot } from "remotion";
import { Composition } from "remotion";
import React from "react";
import { HeroPromo } from "../templates/HeroPromo";
import { Testimonial } from "../templates/Testimonial";
import { EcommerceShowcase } from "../templates/EcommerceShowcase";
import { Educational } from "../templates/Educational";
import { SaasLaunch } from "../templates/SaasLaunch";

const FPS = 30;

const defaultProps = {
  scenes: [
    { id: 1, duration_s: 4, type: "hero", text: "Titre principal accrocheur ici.", assets: [], animation: "fade_in_up" },
    { id: 2, duration_s: 3, type: "feature_list", text: "Des fonctionnalités puissantes.", assets: [], animation: "slide_left" },
    { id: 3, duration_s: 3, type: "outro", text: "Commencez maintenant.", assets: [], animation: "zoom_in" },
  ],
  brand: { primary_color: "#FF6B35", logo_id: null },
  assetUrls: {},
};

const totalDuration = defaultProps.scenes.reduce((sum, s) => sum + s.duration_s, 0);

// Helper to generate all aspect ratio variants for a template
function TemplateVariants({ id, Component }: { id: string; Component: React.FC<any> }) {
  return (
    <>
      <Composition id={id} component={Component} durationInFrames={totalDuration * FPS} fps={FPS} width={1080} height={1920} defaultProps={defaultProps} />
      <Composition id={`${id}-16x9`} component={Component} durationInFrames={totalDuration * FPS} fps={FPS} width={1920} height={1080} defaultProps={defaultProps} />
      <Composition id={`${id}-1x1`} component={Component} durationInFrames={totalDuration * FPS} fps={FPS} width={1080} height={1080} defaultProps={defaultProps} />
    </>
  );
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <TemplateVariants id="HeroPromo" Component={HeroPromo} />
      <TemplateVariants id="Testimonial" Component={Testimonial} />
      <TemplateVariants id="EcommerceShowcase" Component={EcommerceShowcase} />
      <TemplateVariants id="Educational" Component={Educational} />
      <TemplateVariants id="SaasLaunch" Component={SaasLaunch} />
    </>
  );
};

registerRoot(RemotionRoot);

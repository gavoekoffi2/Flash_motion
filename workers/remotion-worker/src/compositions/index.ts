import { registerRoot } from "remotion";
import { Composition } from "remotion";
import React from "react";
import { HeroPromo, HeroPromoProps } from "../templates/HeroPromo";

const FPS = 30;

// Default props for studio preview
const defaultProps: HeroPromoProps = {
  scenes: [
    {
      id: 1,
      duration_s: 4,
      type: "hero",
      text: "Découvrez le produit X — révolutionnez votre quotidien.",
      assets: [],
      animation: "fade_in_up",
    },
    {
      id: 2,
      duration_s: 3,
      type: "feature_list",
      text: "Un design élégant. Des performances incroyables.",
      assets: [],
      animation: "slide_left",
    },
    {
      id: 3,
      duration_s: 3,
      type: "outro",
      text: "Disponible maintenant — Commandez sur notre site.",
      assets: [],
      animation: "zoom_in",
    },
  ],
  brand: {
    primary_color: "#FF6B35",
    logo_id: null,
  },
  assetUrls: {},
};

const totalDuration = defaultProps.scenes.reduce((sum, s) => sum + s.duration_s, 0);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HeroPromo"
        component={HeroPromo}
        durationInFrames={totalDuration * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
      {/* 16:9 variant */}
      <Composition
        id="HeroPromo-16x9"
        component={HeroPromo}
        durationInFrames={totalDuration * FPS}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
      {/* 1:1 variant */}
      <Composition
        id="HeroPromo-1x1"
        component={HeroPromo}
        durationInFrames={totalDuration * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={defaultProps}
      />
    </>
  );
};

registerRoot(RemotionRoot);

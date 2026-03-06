import { registerRoot } from "remotion";
import { Composition } from "remotion";
import React from "react";
import { HeroPromo, HeroPromoProps } from "../templates/HeroPromo";
import { Carousel } from "../templates/Carousel";
import { FeatureList } from "../templates/FeatureList";
import { Demo } from "../templates/Demo";
import { Outro } from "../templates/Outro";

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

const defaultCarouselProps = {
  scenes: [
    {
      id: 1,
      duration_s: 5,
      type: "carousel",
      text: "Nos produits phares",
      assets: [],
      animation: "fade_in_up",
    },
  ],
  brand: {
    primary_color: "#FF6B35",
    logo_id: null,
  },
  assetUrls: {},
};

const defaultFeatureListProps = {
  scenes: [
    {
      id: 1,
      duration_s: 6,
      type: "feature_list",
      text: "Les meilleures fonctionnalités",
      assets: [],
      animation: "fade_in_up",
    },
  ],
  brand: {
    primary_color: "#FF6B35",
    logo_id: null,
  },
  assetUrls: {},
};

const defaultDemoProps = {
  scenes: [
    {
      id: 1,
      duration_s: 5,
      type: "demo",
      text: "Découvrez notre interface intuitive",
      assets: [],
      animation: "fade_in_up",
    },
  ],
  brand: {
    primary_color: "#FF6B35",
    logo_id: null,
  },
  assetUrls: {},
};

const defaultOutroProps = {
  scenes: [
    {
      id: 1,
      duration_s: 5,
      type: "outro",
      text: "Rejoignez nos milliers de clients satisfaits",
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
const totalCarouselDuration = defaultCarouselProps.scenes.reduce((sum, s) => sum + s.duration_s, 0);
const totalFeatureListDuration = defaultFeatureListProps.scenes.reduce((sum, s) => sum + s.duration_s, 0);
const totalDemoDuration = defaultDemoProps.scenes.reduce((sum, s) => sum + s.duration_s, 0);
const totalOutroDuration = defaultOutroProps.scenes.reduce((sum, s) => sum + s.duration_s, 0);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* HeroPromo compositions */}
      <Composition
        id="HeroPromo"
        component={HeroPromo}
        durationInFrames={totalDuration * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
      <Composition
        id="HeroPromo-16x9"
        component={HeroPromo}
        durationInFrames={totalDuration * FPS}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
      <Composition
        id="HeroPromo-1x1"
        component={HeroPromo}
        durationInFrames={totalDuration * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={defaultProps}
      />

      {/* Carousel compositions */}
      <Composition
        id="Carousel"
        component={Carousel}
        durationInFrames={totalCarouselDuration * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={defaultCarouselProps}
      />
      <Composition
        id="Carousel-16x9"
        component={Carousel}
        durationInFrames={totalCarouselDuration * FPS}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={defaultCarouselProps}
      />
      <Composition
        id="Carousel-1x1"
        component={Carousel}
        durationInFrames={totalCarouselDuration * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={defaultCarouselProps}
      />

      {/* FeatureList compositions */}
      <Composition
        id="FeatureList"
        component={FeatureList}
        durationInFrames={totalFeatureListDuration * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={defaultFeatureListProps}
      />
      <Composition
        id="FeatureList-16x9"
        component={FeatureList}
        durationInFrames={totalFeatureListDuration * FPS}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={defaultFeatureListProps}
      />
      <Composition
        id="FeatureList-1x1"
        component={FeatureList}
        durationInFrames={totalFeatureListDuration * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={defaultFeatureListProps}
      />

      {/* Demo compositions */}
      <Composition
        id="Demo"
        component={Demo}
        durationInFrames={totalDemoDuration * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={defaultDemoProps}
      />
      <Composition
        id="Demo-16x9"
        component={Demo}
        durationInFrames={totalDemoDuration * FPS}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={defaultDemoProps}
      />
      <Composition
        id="Demo-1x1"
        component={Demo}
        durationInFrames={totalDemoDuration * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={defaultDemoProps}
      />

      {/* Outro compositions */}
      <Composition
        id="Outro"
        component={Outro}
        durationInFrames={totalOutroDuration * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={defaultOutroProps}
      />
      <Composition
        id="Outro-16x9"
        component={Outro}
        durationInFrames={totalOutroDuration * FPS}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={defaultOutroProps}
      />
      <Composition
        id="Outro-1x1"
        component={Outro}
        durationInFrames={totalOutroDuration * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={defaultOutroProps}
      />
    </>
  );
};

registerRoot(RemotionRoot);

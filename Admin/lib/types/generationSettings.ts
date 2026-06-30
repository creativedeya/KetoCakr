export interface GenerationSettings {
  backgroundColor: "black" | "dark-slate" | "white" | "transparent";
  viewingAngle: "overhead" | "45-degree" | "side" | "close-up";
  lightingStyle: "studio" | "natural" | "warm" | "cool" | "dramatic";
  backgroundTexture: "slate" | "wood" | "marble" | "plain" | "linen";
}

export const DEFAULT_GENERATION_SETTINGS: GenerationSettings = {
  backgroundColor: "black",
  viewingAngle: "overhead",
  lightingStyle: "studio",
  backgroundTexture: "slate",
};

export const GENERATION_PRESETS: Record<string, GenerationSettings> = {
  CLASSIC: {
    backgroundColor: "black",
    viewingAngle: "overhead",
    lightingStyle: "studio",
    backgroundTexture: "slate",
  },
  WARM: {
    backgroundColor: "dark-slate",
    viewingAngle: "45-degree",
    lightingStyle: "warm",
    backgroundTexture: "wood",
  },
  MINIMALIST: {
    backgroundColor: "white",
    viewingAngle: "overhead",
    lightingStyle: "natural",
    backgroundTexture: "plain",
  },
  DRAMATIC: {
    backgroundColor: "black",
    viewingAngle: "side",
    lightingStyle: "dramatic",
    backgroundTexture: "slate",
  },
};

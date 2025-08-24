
// src/lib/types/settings.ts
export type A11yAppearance = {
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  highContrast: boolean;
  reduceMotion: boolean;
  density: "comfortable" | "compact";
};

import { colors, componentStates, radii, spacing, typography } from "@/theme/tokens";

export const styleContract = {
  sourceOfTruth: {
    cssTokens: "src/index.css",
    tailwindTheme: "tailwind.config.ts",
    uiPrimitives: "src/components/ui",
  },
  palette: colors,
  spacing,
  radii,
  typography,
  componentStates,
  interactionRules: {
    buttons: "Primary uses solid purple, disabled uses opacity 0.5.",
    inputs: "40px control height with bordered surface and visible focus ring color.",
    cards: "Rounded border card with subtle border and elevated hierarchy.",
    loading: "Every submit action must expose explicit loading text/state.",
    errors: "Inline error text under forms and action-level failure message.",
  },
} as const;

export type StyleContract = typeof styleContract;

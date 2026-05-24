export { colors } from "./tokens.js";

/** LinearGradient color stops (hex). Match web `from-primary to-primary/85` etc. */
export const gradients = {
  primary: ["#7c3aed", "#6d28d9"] as const,
  primarySoft: ["#ede9fe", "#faf9fc"] as const,
  chatMine: ["#7c3aed", "#6d28d9"] as const,
  chatTheirs: ["#ffffff", "#f5f3f8"] as const,
  chatBg: ["#faf9fc", "#f2eff7"] as const,
  avatar: ["#7c3aed", "#9333ea"] as const,
  mapFade: ["rgba(250,249,252,0.85)", "rgba(250,249,252,0.25)", "transparent"] as const,
};

/** expo-linear-gradient expects a mutable string array */
export function gradientColors(stops: readonly string[]): [string, string, ...string[]] {
  return [...stops] as [string, string, ...string[]];
}

/** Web `bg-gradient-to-l` — purple stronger on the right in RTL */
export const gradientPrimaryHorizontal = {
  start: { x: 1, y: 0.5 },
  end: { x: 0, y: 0.5 },
} as const;

export const darkColors = {
  background: "#130d17",
  foreground: "#f4f0f8",
  card: "#241a2a",
  cardForeground: "#f4f0f8",
  primary: "#9364ed",
  primaryForeground: "#130d17",
  secondary: "#2d2633",
  secondaryForeground: "#efe9f7",
  muted: "#282030",
  mutedForeground: "#8e859a",
  accent: "#302241",
  accentForeground: "#c6adf9",
  destructive: "#a12626",
  destructiveForeground: "#ffffff",
  border: "#32293a",
  input: "#32293a",
  ring: "#9364ed",
  success: "#2eb873",
  warning: "#e2b122",
  info: "#3b92ed",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl2: 20,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 20,
};

export const typography = {
  h1: 30,
  h2: 24,
  h3: 20,
  body: 16,
  bodySm: 14,
  caption: 12,
};

export const componentStates = {
  button: {
    height: 46,
    disabledOpacity: 0.5,
  },
  input: {
    height: 44,
    borderWidth: 1,
  },
  card: {
    borderWidth: 1,
  },
};

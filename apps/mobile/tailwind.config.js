const { colors: themeColors } = require("./tailwind.colors.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./index.ts", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Tajawal_400Regular", "system-ui", "sans-serif"],
        arabic: ["Tajawal_500Medium", "Tajawal_400Regular", "system-ui", "sans-serif"],
        display: ["Tajawal_800ExtraBold", "Tajawal_700Bold", "system-ui", "sans-serif"],
        mono: ["Inter_600SemiBold", "Tajawal_400Regular", "monospace"],
      },
      colors: {
        border: themeColors.border,
        input: themeColors.input,
        ring: themeColors.ring,
        background: themeColors.background,
        foreground: themeColors.foreground,
        primary: {
          DEFAULT: themeColors.primary,
          foreground: themeColors.primaryForeground,
        },
        secondary: {
          DEFAULT: themeColors.secondary,
          foreground: themeColors.secondaryForeground,
        },
        destructive: {
          DEFAULT: themeColors.destructive,
          foreground: themeColors.destructiveForeground,
        },
        muted: {
          DEFAULT: themeColors.muted,
          foreground: themeColors.mutedForeground,
        },
        accent: {
          DEFAULT: themeColors.accent,
          foreground: themeColors.accentForeground,
        },
        popover: {
          DEFAULT: themeColors.card,
          foreground: themeColors.cardForeground,
        },
        card: {
          DEFAULT: themeColors.card,
          foreground: themeColors.cardForeground,
        },
        success: {
          DEFAULT: themeColors.success,
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: themeColors.warning,
          foreground: themeColors.foreground,
        },
        info: {
          DEFAULT: themeColors.info,
          foreground: "#ffffff",
        },
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "8px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        glow: "0 4px 28px -6px rgba(124, 58, 237, 0.42)",
        elevated: "0 6px 18px -4px rgba(26, 19, 35, 0.11)",
        "elevated-lg": "0 18px 44px -10px rgba(26, 19, 35, 0.16)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

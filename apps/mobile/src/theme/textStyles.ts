import type { TextStyle } from "react-native";
import { colors } from "./tokens";

export const fonts = {
  arabic: "Tajawal_500Medium",
  arabicRegular: "Tajawal_400Regular",
  arabicBold: "Tajawal_700Bold",
  display: "Tajawal_800ExtraBold",
  sans: "Inter_600SemiBold",
} as const;

export const rtlText: TextStyle = {
  writingDirection: "rtl",
  textAlign: "right",
};

export const ltrText: TextStyle = {
  writingDirection: "ltr",
  textAlign: "left",
};

export const textPresets = {
  caption: {
    fontFamily: fonts.arabic,
    fontSize: 11,
    lineHeight: 16,
    color: colors.mutedForeground,
    ...rtlText,
  } satisfies TextStyle,
  captionBold: {
    fontFamily: fonts.arabicBold,
    fontSize: 11,
    lineHeight: 15,
    color: colors.foreground,
    ...rtlText,
  } satisfies TextStyle,
  body: {
    fontFamily: fonts.arabic,
    fontSize: 15,
    lineHeight: 22,
    color: colors.foreground,
    ...rtlText,
  } satisfies TextStyle,
  bodySm: {
    fontFamily: fonts.arabic,
    fontSize: 14,
    lineHeight: 20,
    color: colors.foreground,
    ...rtlText,
  } satisfies TextStyle,
  title: {
    fontFamily: fonts.arabicBold,
    fontSize: 18,
    lineHeight: 25,
    color: colors.foreground,
    ...rtlText,
  } satisfies TextStyle,
  heading: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 26,
    color: colors.foreground,
    ...rtlText,
  } satisfies TextStyle,
  labelMuted: {
    fontFamily: fonts.arabic,
    fontSize: 13,
    lineHeight: 18,
    color: colors.mutedForeground,
    ...rtlText,
  } satisfies TextStyle,
} as const;

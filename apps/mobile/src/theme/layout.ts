import type { ViewStyle } from "react-native";
import { colors } from "./tokens";

/** Replaces invalid RN `inset: 0` / Tailwind `inset-0`. */
export const fillAbsolute: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

/**
 * Row layout — use with `I18nManager.forceRTL(true)` (same as web `flex` in `dir="rtl"`).
 * Do not combine with `flex-row-reverse` (double-mirrors).
 */
export const row: ViewStyle = { flexDirection: "row", alignItems: "center" };
export const rowBetween: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
};
export const rowWrap: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
};

export const cardSurface: ViewStyle = {
  borderRadius: 18,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.card,
  padding: 16,
};

export const listRow: ViewStyle = {
  minHeight: 56,
  borderRadius: 14,
  paddingHorizontal: 12,
  paddingVertical: 10,
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
};

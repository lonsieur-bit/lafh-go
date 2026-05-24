import type { ViewStyle } from "react-native";
import { colors } from "./tokens";

export const figmaCard: ViewStyle = {
  borderRadius: 20,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.card,
  shadowColor: "#1a1323",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 14,
  elevation: 3,
};

export const figmaIconBox: ViewStyle = {
  width: 44,
  height: 44,
  borderRadius: 14,
  backgroundColor: `${colors.primary}18`,
  alignItems: "center",
  justifyContent: "center",
};

export function statusColors(status: "completed" | "active" | "cancelled" | "pending") {
  if (status === "completed") {
    return { bg: `${colors.success}18`, text: colors.success };
  }
  if (status === "cancelled") {
    return { bg: `${colors.destructive}18`, text: colors.destructive };
  }
  if (status === "active") {
    return { bg: `${colors.warning}18`, text: colors.warning };
  }
  return { bg: colors.secondary, text: colors.mutedForeground };
}

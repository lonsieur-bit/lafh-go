import { Platform } from "react-native";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/tokens";

/** Visible tab row height (icons + labels), excluding home-indicator inset. */
export const TAB_BAR_CONTENT_HEIGHT = 56;

type TabBarOptionsConfig = {
  /** Reserve space above the tab bar for scroll content. Disable on full-bleed home (hidden tab bar). */
  scenePadding?: boolean;
};

/**
 * Bottom tab bar that clears the iPhone home indicator / swipe area.
 */
export function useBottomTabBarOptions(
  config: TabBarOptionsConfig = {},
): Pick<BottomTabNavigationOptions, "tabBarStyle" | "sceneStyle"> {
  const { scenePadding = true } = config;
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === "android" ? 8 : 0);
  const totalHeight = TAB_BAR_CONTENT_HEIGHT + bottomInset;

  return {
    tabBarStyle: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
      height: totalHeight,
      paddingTop: 8,
      paddingBottom: bottomInset + 6,
    },
    ...(scenePadding
      ? {
          sceneStyle: {
            paddingBottom: totalHeight,
          },
        }
      : {
          sceneStyle: {
            paddingBottom: 0,
          },
        }),
  };
}

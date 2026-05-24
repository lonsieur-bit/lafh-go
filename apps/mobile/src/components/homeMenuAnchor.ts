import { Dimensions } from "react-native";
import type { HomeMenuAnchor } from "@/components/HomeNavMenu";

export const MENU_PANEL_WIDTH = 232;

/** Window coordinates for menu panel — must be used inside a `direction: 'ltr'` overlay (see HomeNavMenu). */
export function measureHomeMenuAnchor(
  measureInWindow: (
    callback: (x: number, y: number, width: number, height: number) => void,
  ) => void,
  panelWidth: number,
  onAnchor: (anchor: HomeMenuAnchor) => void,
) {
  measureInWindow((x, y, buttonWidth, buttonHeight) => {
    const screenWidth = Dimensions.get("window").width;
    const top = y + buttonHeight + 4;
    let left = x;
    if (left + panelWidth > screenWidth - 8) {
      left = Math.max(8, x + buttonWidth - panelWidth);
    }
    onAnchor({ top, left: Math.max(8, left) });
  });
}

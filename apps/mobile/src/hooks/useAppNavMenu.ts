import { useCallback, useRef, useState } from "react";
import { View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeMenuAction, HomeMenuAnchor } from "@/components/HomeNavMenu";
import { measureHomeMenuAnchor, MENU_PANEL_WIDTH } from "@/components/homeMenuAnchor";
import type { AppStackParamList } from "@/navigation/types";

export function useAppNavMenu(navigation: NativeStackNavigationProp<AppStackParamList>) {
  const menuButtonRef = useRef<View>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HomeMenuAnchor | null>(null);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setMenuAnchor(null);
  }, []);

  const toggleMenu = useCallback(() => {
    if (menuOpen) {
      closeMenu();
      return;
    }
    const node = menuButtonRef.current;
    if (!node) return;
    measureHomeMenuAnchor(
      (cb) => node.measureInWindow(cb),
      MENU_PANEL_WIDTH,
      (anchor) => {
        setMenuAnchor(anchor);
        setMenuOpen(true);
      },
    );
  }, [closeMenu, menuOpen]);

  const onMenuSelect = useCallback(
    (action: HomeMenuAction) => {
      closeMenu();
      switch (action) {
        case "notifications":
          navigation.navigate("Notifications");
          break;
        case "wallet":
          navigation.navigate("Wallet");
          break;
        case "orders":
          navigation.navigate("Orders");
          break;
        case "promo":
          navigation.navigate("Referral");
          break;
        case "settings":
          navigation.navigate("Settings");
          break;
        default:
          break;
      }
    },
    [closeMenu, navigation],
  );

  return {
    menuButtonRef,
    menuOpen,
    menuAnchor,
    menuPanelWidth: MENU_PANEL_WIDTH,
    toggleMenu,
    closeMenu,
    onMenuSelect,
  };
}

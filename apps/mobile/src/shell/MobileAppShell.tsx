import { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RoleToggle } from "@/components/RoleToggle";
import { colors } from "@/theme/tokens";

interface MobileAppShellProps {
  children: ReactNode;
  showRoleToggle?: boolean;
}

/** Full-bleed app chrome (no demo phone frame). */
export function MobileAppShell({ children, showRoleToggle = false }: MobileAppShellProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {showRoleToggle ? (
        <View
          style={{
            position: "absolute",
            top: insets.top + 8,
            right: 16,
            zIndex: 50,
          }}
          pointerEvents="box-none"
        >
          <RoleToggle />
        </View>
      ) : null}
      {children}
    </View>
  );
}

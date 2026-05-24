import { Pressable, Text, View } from "react-native";
import { CarFront, UserCircle2 } from "lucide-react-native";
import { useAppState } from "@/state/AppStateContext";
import { colors } from "@/theme/tokens";
import { fonts } from "@/theme/textStyles";

/** Compact راكب / كابتن switch — mirrors web AppShell pill. */
export function RoleToggle() {
  const { appRole, setAppRole } = useAppState();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 999,
        padding: 4,
      }}
    >
      <Pressable
        onPress={() => setAppRole("rider")}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: appRole === "rider" ? colors.primary : "transparent",
        }}
      >
        <UserCircle2 size={14} color={appRole === "rider" ? colors.primaryForeground : colors.mutedForeground} />
        <Text
          style={{
            fontFamily: fonts.arabicBold,
            fontSize: 12,
            color: appRole === "rider" ? colors.primaryForeground : colors.mutedForeground,
          }}
        >
          راكب
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setAppRole("captain")}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: appRole === "captain" ? colors.primary : "transparent",
        }}
      >
        <CarFront size={14} color={appRole === "captain" ? colors.primaryForeground : colors.mutedForeground} />
        <Text
          style={{
            fontFamily: fonts.arabicBold,
            fontSize: 12,
            color: appRole === "captain" ? colors.primaryForeground : colors.mutedForeground,
          }}
        >
          كابتن
        </Text>
      </Pressable>
    </View>
  );
}

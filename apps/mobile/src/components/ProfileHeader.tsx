import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowRight } from "lucide-react-native";
import { useAppState } from "@/state/AppStateContext";
import { formatProfilePhone } from "@/lib/formatProfilePhone";
import { colors } from "@/theme/tokens";
import { ltrText, textPresets } from "@/theme/textStyles";

type Props = {
  onBack: () => void;
  roleLabel?: string;
};

export function ProfileHeader({ onBack, roleLabel }: Props) {
  const insets = useSafeAreaInsets();
  const { isLoggedIn, profileDisplayName, profilePhone } = useAppState();

  const displayName =
    isLoggedIn && profileDisplayName?.trim()
      ? profileDisplayName.trim()
      : isLoggedIn
        ? "حسابي"
        : "ضيف";

  const phoneFormatted = isLoggedIn ? formatProfilePhone(profilePhone) : null;

  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.secondary,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowRight size={18} color={colors.foreground} />
        </Pressable>

        <View style={{ flex: 1, alignItems: "flex-end", minWidth: 0 }}>
          <Text style={[textPresets.title, { textAlign: "right" }]} numberOfLines={1}>
            {displayName}
          </Text>
          {phoneFormatted ? (
            <Text style={[textPresets.caption, ltrText, { marginTop: 4, textAlign: "right" }]}>{phoneFormatted}</Text>
          ) : roleLabel ? (
            <Text style={[textPresets.caption, { marginTop: 4, textAlign: "right" }]}>{roleLabel}</Text>
          ) : null}
        </View>

        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: colors.secondary,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image source={require("../../assets/luffa-logo.webp")} style={{ width: 32, height: 32 }} />
        </View>
      </View>
    </View>
  );
}

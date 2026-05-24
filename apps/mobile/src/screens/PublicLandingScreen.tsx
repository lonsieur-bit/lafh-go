import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Car, CircleUserRound } from "lucide-react-native";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { LucideIcon } from "lucide-react-native";
import type { RootStackParamList } from "@/navigation/types";
import { useAppState } from "@/state/AppStateContext";
import { requiresAuth } from "@/lib/authGate";
import { colors, gradientColors, gradients } from "@/theme/tokens";
import { fonts } from "@/theme/textStyles";

type Props = NativeStackScreenProps<RootStackParamList, "PublicLanding">;

const LOGO = require("../../assets/luffa-logo.webp");

/** Soft outline — visible but not harsh on white */
const CARD_BORDER = "#d4cce8";

type RoleVariant = "rider" | "captain";

const roles: {
  variant: RoleVariant;
  label: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  {
    variant: "rider",
    label: "راكب",
    description: "احجز رحلة، شحن بضائع، أو طلب سطحة",
    Icon: CircleUserRound,
  },
  {
    variant: "captain",
    label: "كابتن",
    description: "استقبل الطلبات وابدأ الكسب مع لفة",
    Icon: Car,
  },
];

function RoleCard({
  label,
  description,
  Icon,
  variant,
  onPress,
}: {
  label: string;
  description: string;
  Icon: LucideIcon;
  variant: RoleVariant;
  onPress: () => void;
}) {
  return (
    <View
      style={{
        width: "100%",
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: CARD_BORDER,
        backgroundColor: colors.card,
        padding: 10,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={({ pressed }) => ({
          width: "100%",
          alignItems: "center",
          paddingVertical: 32,
          paddingHorizontal: 24,
          borderRadius: 12,
          backgroundColor: pressed ? colors.secondary : "transparent",
        })}
      >
        <View style={{ width: "100%", alignItems: "center", marginBottom: 16 }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              alignSelf: "center",
              backgroundColor: colors.secondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={26} color={colors.primary} strokeWidth={2} style={{ alignSelf: "center" }} />
          </View>
        </View>

        <Text
          style={{
            fontFamily: fonts.arabicBold,
            fontSize: 17,
            color: colors.foreground,
            textAlign: "center",
            width: "100%",
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: fonts.arabic,
            marginTop: 6,
            fontSize: 13,
            lineHeight: 20,
            color: colors.mutedForeground,
            textAlign: "center",
            width: "100%",
            paddingHorizontal: 8,
          }}
          numberOfLines={2}
        >
          {description}
        </Text>
      </Pressable>
    </View>
  );
}

export function PublicLandingScreen({ navigation }: Props) {
  const { setAppRole, setPendingAuth } = useAppState();
  const insets = useSafeAreaInsets();
  const mustLogin = requiresAuth();

  const enterApp = (role: RoleVariant) => {
    setAppRole(role);
    setPendingAuth(mustLogin ? { mode: "login", role } : null);
    navigation.replace("MainApp");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={gradientColors([...gradients.primarySoft, colors.background])}
        locations={[0, 0.55, 1]}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 32,
            paddingBottom: insets.bottom + 28,
            paddingHorizontal: 24,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1, justifyContent: "center", minHeight: 520 }}>
            <View style={{ width: "100%", alignItems: "center", marginBottom: 40 }}>
              <View
                style={{
                  width: 108,
                  height: 108,
                  alignSelf: "center",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 24,
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    width: 108,
                    height: 108,
                    borderRadius: 54,
                    backgroundColor: `${colors.primary}12`,
                  }}
                />
                <View
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: 26,
                    backgroundColor: colors.card,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: `${colors.primary}20`,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.15,
                    shadowRadius: 16,
                    elevation: 6,
                  }}
                >
                  <Image
                    source={LOGO}
                    style={{ width: 60, height: 60, alignSelf: "center" }}
                    resizeMode="contain"
                    accessibilityLabel="لفة"
                  />
                </View>
              </View>

              <Text
                style={{
                  fontFamily: fonts.arabic,
                  fontSize: 15,
                  color: colors.mutedForeground,
                  textAlign: "center",
                  marginBottom: 6,
                }}
              >
                مرحباً بك في
              </Text>
              <Text
                style={{
                  fontFamily: fonts.display,
                  fontSize: 32,
                  color: colors.foreground,
                  textAlign: "center",
                  lineHeight: 40,
                }}
              >
                لفة
              </Text>
            </View>

            <View style={{ width: "100%", gap: 20 }}>
              {roles.map((role) => (
                <RoleCard
                  key={role.variant}
                  label={role.label}
                  description={role.description}
                  Icon={role.Icon}
                  variant={role.variant}
                  onPress={() => enterApp(role.variant)}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

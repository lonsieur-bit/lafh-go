import { useCallback } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppHeader, StackScreenLayout } from "@/components/layout";
import { colors, gradientColors, gradientPrimaryHorizontal, gradients } from "@/theme/tokens";
import { ltrText, textPresets } from "@/theme/textStyles";
import { LinearGradient } from "expo-linear-gradient";
import { Gift, Wallet } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import type { AppStackParamList } from "@/navigation/types";
import type { CaptainStackParamList, CaptainTabParamList } from "@/navigation/CaptainNavigator";
import { useStackBack } from "@/navigation/useStackBack";
import { useCurrency, fixArabicMojibake, isSupabaseReady } from "@luffa/shared";
import { useAppState } from "@/state/AppStateContext";

type RiderProps = NativeStackScreenProps<AppStackParamList, "Wallet">;
type CaptainTabProps = BottomTabScreenProps<CaptainTabParamList, "CaptainWallet">;
type Props = RiderProps | CaptainTabProps;

function isCaptainTabProps(props: Props): props is CaptainTabProps {
  return props.route.name === "CaptainWallet";
}

export function WalletScreen(props: Props) {
  const { navigation: tabOrStackNav } = props;
  const parentStack = useNavigation<NativeStackNavigationProp<CaptainStackParamList>>();
  const onBack = useStackBack();
  const { walletBalance, walletTransactions, appRole, refreshCaptainWallet } = useAppState();
  const { format } = useCurrency();
  const isCaptain = appRole === "captain" || isCaptainTabProps(props);

  useFocusEffect(
    useCallback(() => {
      if (isCaptain && isSupabaseReady()) {
        void refreshCaptainWallet();
      }
    }, [isCaptain, refreshCaptainWallet]),
  );

  const openTopUp = (giftOnly: boolean) => {
    if (isCaptainTabProps(props)) {
      parentStack.navigate("CaptainWalletTopUp", { giftOnly });
      return;
    }
    (tabOrStackNav as NativeStackNavigationProp<AppStackParamList>).navigate("WalletTopUp", { giftOnly });
  };

  return (
    <StackScreenLayout header={<AppHeader title={isCaptain ? "أرباحي" : "المحفظة"} onBack={isCaptain ? undefined : onBack} />}>
      <View style={{ borderRadius: 16, overflow: "hidden", width: "100%" }}>
        <LinearGradient
          colors={gradientColors(gradients.primary)}
          start={gradientPrimaryHorizontal.start}
          end={gradientPrimaryHorizontal.end}
          style={{ padding: 20 }}
        >
          <View
            style={{
              position: "absolute",
              top: -40,
              left: -40,
              width: 112,
              height: 112,
              borderRadius: 56,
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
            pointerEvents="none"
          />
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[textPresets.caption, { color: "rgba(255,255,255,0.85)" }]}>
                {isCaptain ? "أرباح الرحلات" : "الرصيد المتاح"}
              </Text>
              <Text
                style={[
                  textPresets.heading,
                  { color: "#ffffff", marginTop: 4, fontFamily: textPresets.title.fontFamily },
                  ltrText,
                ]}
              >
                {format(walletBalance)}
              </Text>
            </View>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Wallet width={24} height={24} color="#ffffff" />
            </View>
          </View>

          <View style={{ marginTop: 16, gap: 10 }}>
            {!isCaptain ? (
              <Pressable
                onPress={() => openTopUp(false)}
                style={{
                  width: "100%",
                  minHeight: 44,
                  borderRadius: 12,
                  backgroundColor: "#ffffff",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: colors.primary, fontSize: 15, fontFamily: textPresets.title.fontFamily }}>
                  شحن المحفظة
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => openTopUp(true)}
              style={{
                width: "100%",
                minHeight: 44,
                borderRadius: 12,
                backgroundColor: isCaptain ? "#ffffff" : "rgba(255,255,255,0.18)",
                borderWidth: isCaptain ? 0 : 1,
                borderColor: "rgba(255,255,255,0.35)",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Gift width={18} height={18} color={isCaptain ? colors.primary : "#ffffff"} />
              <Text
                style={{
                  color: isCaptain ? colors.primary : "#ffffff",
                  fontSize: 15,
                  fontFamily: textPresets.title.fontFamily,
                }}
              >
                {isCaptain ? "شحن برمز بطاقة هدية" : "بطاقة هدية / كرت شحن"}
              </Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>

      <View style={{ width: "100%" }}>
        <Text style={[textPresets.labelMuted, { marginBottom: 12 }]}>
          {isCaptain ? "سجل الأرباح" : "المعاملات"}
        </Text>
        <View style={{ gap: 10 }}>
          {walletTransactions.length === 0 ? (
            <Text style={[textPresets.caption, { color: colors.mutedForeground, textAlign: "center", paddingVertical: 24 }]}>
              {isCaptain ? "لا توجد أرباح مسجّلة بعد" : "لا توجد معاملات بعد"}
            </Text>
          ) : (
            walletTransactions.map((tx) => (
              <View
                key={tx.id}
                style={{
                  padding: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                }}
              >
                <Text style={[textPresets.body, { color: colors.foreground, fontFamily: textPresets.title.fontFamily }]}>
                  {fixArabicMojibake(tx.title)}
                </Text>
                <Text style={[textPresets.caption, { marginTop: 5, color: colors.mutedForeground }]} numberOfLines={1}>
                  {fixArabicMojibake(tx.subtitle)}
                </Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8, alignItems: "center" }}>
                  <Text style={[textPresets.caption, ltrText, { color: colors.mutedForeground }]}>{tx.time}</Text>
                  <Text
                    style={[textPresets.body, ltrText, { color: tx.positive ? colors.success : colors.foreground }]}
                  >
                    {tx.amount}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </StackScreenLayout>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { AppHeader, PrimaryButton, StackScreenLayout } from "@/components/layout";
import { figmaCard, figmaIconBox } from "@/theme/figmaStyles";
import { colors, gradientColors, gradientPrimaryHorizontal, gradients } from "@/theme/tokens";
import { ltrText, textPresets } from "@/theme/textStyles";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle2, CreditCard, Gift, Smartphone, Wallet } from "lucide-react-native";
import { Pressable, Text, TextInput, View } from "react-native";
import type { AppStackParamList } from "@/navigation/types";
import type { CaptainStackParamList } from "@/navigation/CaptainNavigator";
import { useAppState } from "@/state/AppStateContext";
import { isSupabaseReady, useCurrency } from "@luffa/shared";

type RiderProps = NativeStackScreenProps<AppStackParamList, "WalletTopUp">;
type CaptainProps = NativeStackScreenProps<CaptainStackParamList, "CaptainWalletTopUp">;
type Props = RiderProps | CaptainProps;

const presetAmounts = [25, 50, 100, 200];

type PaymentMethod = "rechargeCard" | "mada" | "mastercard" | "applepay";

const methodRows: { key: PaymentMethod; label: string; Icon: typeof Wallet }[] = [
  { key: "rechargeCard", label: "كرت شحن / بطاقة هدية", Icon: Gift },
  { key: "mada", label: "مدى **** 4532", Icon: CreditCard },
  { key: "mastercard", label: "MasterCard **** 8891", Icon: CreditCard },
  { key: "applepay", label: "Apple Pay", Icon: Smartphone },
];

const fieldInput = {
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.secondary,
  paddingHorizontal: 14,
  paddingVertical: 12,
  color: colors.foreground,
  fontSize: 15,
  fontFamily: textPresets.body.fontFamily,
} as const;

const DEMO_GIFT_CODES = "LFG-1234-5678 أو RHC-1234-5678 (تجريبي)";

export function WalletTopUpScreen({ route }: Props) {
  const navigation = useNavigation();
  const onBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
  }, [navigation]);
  const giftOnly = route.params?.giftOnly === true;
  const { topUpWallet, redeemGiftCard, isLoggedIn, walletBalance, appRole } = useAppState();
  const { format, symbol } = useCurrency();
  const [amount, setAmount] = useState("50");
  const [method, setMethod] = useState<PaymentMethod>("rechargeCard");
  const [rechargeCode, setRechargeCode] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [redeemedAmount, setRedeemedAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (giftOnly) setMethod("rechargeCard");
  }, [giftOnly]);

  const isGiftCard = giftOnly || method === "rechargeCard";
  const screenTitle = giftOnly ? "بطاقة هدية" : "شحن الرصيد";

  const numericAmount = useMemo(() => Number(amount || 0), [amount]);
  const validAmount = Number.isFinite(numericAmount) && numericAmount > 0;
  const selectedPreset = presetAmounts.find((p) => String(p) === amount);

  const resetResultState = () => {
    if (isDone) {
      setIsDone(false);
      setRedeemedAmount(0);
    }
  };

  const handleTopUp = async () => {
    setError("");
    setLoading(true);
    try {
      if (isGiftCard) {
        if (rechargeCode.trim().length < 6) {
          setError("أدخل كود بطاقة الهدية كاملاً.");
          return;
        }
        if (!isLoggedIn) {
          setError("سجّل الدخول أولاً لاستخدام بطاقة الهدية.");
          return;
        }
        const credited = await redeemGiftCard(rechargeCode);
        setRedeemedAmount(credited);
        setIsDone(true);
        return;
      }
      if (!validAmount) {
        setError("أدخل مبلغًا صحيحًا.");
        return;
      }
      topUpWallet(numericAmount);
      setRedeemedAmount(numericAmount);
      setIsDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل الشحن");
    } finally {
      setLoading(false);
    }
  };

  const confirmLabel = loading
    ? "جارٍ المعالجة..."
    : isDone
      ? "تم"
      : isGiftCard
        ? "تفعيل البطاقة"
        : `تأكيد الشحن${validAmount ? ` (${format(numericAmount)})` : ""}`;

  return (
    <StackScreenLayout
      header={<AppHeader title={screenTitle} onBack={onBack} />}
      footer={
        <PrimaryButton
          label={isDone ? "العودة للمحفظة" : confirmLabel}
          onPress={isDone ? onBack : handleTopUp}
          disabled={loading}
        />
      }
      contentContainerStyle={{ gap: 16, paddingTop: 12 }}
    >
      <View style={{ borderRadius: 16, overflow: "hidden" }}>
        <LinearGradient
          colors={gradientColors(gradients.primary)}
          start={gradientPrimaryHorizontal.start}
          end={gradientPrimaryHorizontal.end}
          style={{ padding: 18 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", textAlign: "right" }}>رصيدك الحالي</Text>
              <Text
                style={[
                  textPresets.heading,
                  { color: "#ffffff", marginTop: 6, fontFamily: textPresets.title.fontFamily },
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
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,0.18)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Wallet width={24} height={24} color="#ffffff" />
            </View>
          </View>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 12, textAlign: "right" }}>
            {isGiftCard
              ? "أدخل رمز البطاقة — تُضاف القيمة فورًا إلى رصيدك"
              : "شحن فوري — يُضاف الرصيد مباشرة بعد التأكيد"}
          </Text>
        </LinearGradient>
      </View>

      {isDone ? (
        <View
          style={{
            ...figmaCard,
            padding: 24,
            alignItems: "center",
            borderColor: `${colors.success}50`,
            backgroundColor: `${colors.success}0A`,
          }}
        >
          <CheckCircle2 width={48} height={48} color={colors.success} />
          <Text style={[textPresets.title, { marginTop: 14, textAlign: "center" }]}>
            {isGiftCard ? "تم تفعيل البطاقة" : "تم الشحن بنجاح"}
          </Text>
          <Text style={[textPresets.body, ltrText, { marginTop: 8, color: colors.primary, textAlign: "center" }]}>
            +{format(redeemedAmount)}
          </Text>
          <Text style={[textPresets.caption, { marginTop: 8, textAlign: "center", color: colors.mutedForeground }]}>
            الرصيد الجديد {format(walletBalance)}
          </Text>
        </View>
      ) : null}

      {!isDone ? (
        <>
          {!giftOnly ? (
            <View style={{ ...figmaCard, padding: 18 }}>
              <Text style={[textPresets.labelMuted, { marginBottom: 14, textAlign: "right" }]}>طريقة الشحن</Text>
              <View style={{ gap: 10 }}>
                {methodRows.map(({ key, label, Icon }) => {
                  const selected = method === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => {
                        resetResultState();
                        setMethod(key);
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        borderRadius: 16,
                        paddingHorizontal: 14,
                        paddingVertical: 13,
                        minHeight: 56,
                        borderWidth: 2,
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected ? `${colors.primary}0D` : colors.secondary,
                      }}
                    >
                      <View
                        style={{
                          ...figmaIconBox,
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: selected ? `${colors.primary}18` : colors.card,
                        }}
                      >
                        <Icon width={20} height={20} color={selected ? colors.primary : colors.foreground} />
                      </View>
                      <Text
                        style={[
                          textPresets.body,
                          { flex: 1, textAlign: "right" },
                          selected && { color: colors.primary, fontFamily: textPresets.title.fontFamily },
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {isGiftCard ? (
            <View style={{ ...figmaCard, padding: 18 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
                <Text style={[textPresets.labelMuted, { textAlign: "right" }]}>كود بطاقة الهدية</Text>
                <Gift width={20} height={20} color={colors.primary} />
              </View>
              <Text style={[textPresets.caption, { marginBottom: 12, textAlign: "right", color: colors.mutedForeground }]}>
                {appRole === "captain"
                  ? "يمكن للكباتن شحن الرصيد من بطاقات الشركاء — القيمة تُحدد تلقائياً من البطاقة."
                  : "قيمة الشحن تُحدد تلقائياً من البطاقة. يعمل للعملاء والكباتن."}
              </Text>
              <TextInput
                value={rechargeCode}
                onChangeText={(t) => {
                  resetResultState();
                  setRechargeCode(t.toUpperCase().replace(/[^A-Z0-9-]/g, ""));
                }}
                placeholder="LFG-1234-5678"
                placeholderTextColor={colors.mutedForeground}
                style={[fieldInput, ltrText, { textAlign: "center", letterSpacing: 1 }]}
                autoCapitalize="characters"
              />
              {!isSupabaseReady() ? (
                <Text style={[textPresets.caption, { marginTop: 10, textAlign: "center", color: colors.mutedForeground }]}>
                  تجريبي: {DEMO_GIFT_CODES}
                </Text>
              ) : null}
            </View>
          ) : (
            <View style={{ ...figmaCard, padding: 18 }}>
              <Text style={[textPresets.labelMuted, { marginBottom: 12, textAlign: "right" }]}>المبلغ ({symbol})</Text>
              <TextInput
                value={amount}
                onChangeText={(text) => {
                  resetResultState();
                  setAmount(text.replace(/[^0-9.]/g, ""));
                }}
                keyboardType="decimal-pad"
                style={[
                  fieldInput,
                  ltrText,
                  {
                    textAlign: "center",
                    fontSize: 28,
                    fontFamily: textPresets.title.fontFamily,
                    paddingVertical: 16,
                  },
                ]}
              />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14, justifyContent: "center" }}>
                {presetAmounts.map((p) => {
                  const active = selectedPreset === p;
                  return (
                    <Pressable
                      key={p}
                      onPress={() => {
                        resetResultState();
                        setAmount(String(p));
                      }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 22,
                        borderWidth: active ? 0 : 1,
                        borderColor: colors.border,
                        backgroundColor: active ? colors.primary : colors.secondary,
                        minWidth: 72,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={[
                          textPresets.bodySm,
                          ltrText,
                          { color: active ? colors.primaryForeground : colors.foreground },
                        ]}
                      >
                        {format(p)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {error ? (
            <Text style={[textPresets.caption, { color: colors.destructive, textAlign: "center" }]}>{error}</Text>
          ) : null}
        </>
      ) : null}
    </StackScreenLayout>
  );
}

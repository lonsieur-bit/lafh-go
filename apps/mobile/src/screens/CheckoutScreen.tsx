import { useMemo, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Banknote, CreditCard, Smartphone, Tag, Wallet, X } from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { AppHeader, PrimaryButton, StackScreenLayout } from "@/components/layout";
import type { AppStackParamList } from "@/navigation/types";
import { useStackBack } from "@/navigation/useStackBack";
import type { PaymentMethod } from "@/state/AppStateContext";
import { useAppState } from "@/state/AppStateContext";
import { validateCouponCode } from "@/shared/checkoutPromos";
import { isSupabaseReady, SERVICE_TYPE_LABELS, useCurrency, type ServiceType } from "@luffa/shared";
import { redirectToAuth, requiresAuth } from "@/lib/authGate";
import { figmaCard } from "@/theme/figmaStyles";
import { colors } from "@/theme/tokens";
import { fonts, ltrText, rtlText, textPresets } from "@/theme/textStyles";

type Props = NativeStackScreenProps<AppStackParamList, "Checkout">;

type MethodRow = { key: PaymentMethod; label: string; Icon: typeof CreditCard };

const methods: MethodRow[] = [
  { key: "mada", label: "مدى **** 4532", Icon: CreditCard },
  { key: "mastercard", label: "MasterCard **** 8891", Icon: CreditCard },
  { key: "applepay", label: "Apple Pay", Icon: Smartphone },
  { key: "cash", label: "نقدي عند الوصول", Icon: Banknote },
  { key: "wallet", label: "", Icon: Wallet },
];

const fieldInput = {
  flex: 1,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.secondary,
  paddingHorizontal: 12,
  paddingVertical: 11,
  color: colors.foreground,
  fontSize: 14,
  fontFamily: fonts.arabic,
} as const;

function SummaryRow({
  label,
  value,
  discount,
}: {
  label: string;
  value: string;
  discount?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
      }}
    >
      <Text style={[textPresets.body, ltrText, discount && { color: colors.success }]}>{value}</Text>
      <Text style={[textPresets.body, discount && { color: colors.success }]}>{label}</Text>
    </View>
  );
}

function PromoInputRow({
  label,
  placeholder,
  value,
  onChangeText,
  onApply,
  applying,
  Icon,
  ltr,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  onApply: () => void;
  applying: boolean;
  Icon: typeof Tag;
  ltr?: boolean;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={[textPresets.caption, { textAlign: "right", color: colors.mutedForeground }]}>{label}</Text>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <Pressable
          onPress={onApply}
          disabled={applying || !value.trim()}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: value.trim() ? colors.primary : colors.muted,
            opacity: applying || !value.trim() ? 0.6 : 1,
          }}
        >
          {applying ? (
            <ActivityIndicator size="small" color={colors.primaryForeground} />
          ) : (
            <Text style={[textPresets.bodySm, { color: colors.primaryForeground, fontFamily: fonts.arabicBold }]}>تطبيق</Text>
          )}
        </Pressable>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.mutedForeground}
            style={[fieldInput, ltr ? ltrText : rtlText, ltr && { textAlign: "center", letterSpacing: 1 }]}
            autoCapitalize={ltr ? "characters" : "none"}
          />
          <Icon size={18} color={colors.primary} />
        </View>
      </View>
    </View>
  );
}

function fareLineLabel(serviceType: ServiceType) {
  if (serviceType === "cargo") return "أجرة الشحن";
  if (serviceType === "tow") return "أجرة السطحة";
  return "أجرة الرحلة";
}

function discountLineLabel(serviceType: ServiceType) {
  if (serviceType === "cargo" || serviceType === "tow") return "خصم الطلب";
  return "خصم الرحلة";
}

export function CheckoutScreen({ navigation }: Props) {
  const onBack = useStackBack("Booking");
  const { bookingDraft, walletBalance, isLoggedIn, setPendingAuth } = useAppState();
  const { format } = useCurrency();
  const serviceType = bookingDraft.serviceType;
  const serviceLabel = SERVICE_TYPE_LABELS[serviceType];
  const supabaseReady = isSupabaseReady();
  const [method, setMethod] = useState<PaymentMethod>("mada");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLabel, setCouponLabel] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const finalTotal = useMemo(
    () => Math.max(0, Math.round((bookingDraft.total - couponDiscount) * 100) / 100),
    [bookingDraft.total, couponDiscount],
  );

  const walletLabel =
    finalTotal > walletBalance
      ? `محفظة لفة (${format(walletBalance)} — غير كافٍ)`
      : `محفظة لفة (${format(walletBalance)})`;

  const applyCoupon = () => {
    setError("");
    setApplyingCoupon(true);
    const result = validateCouponCode(couponInput, bookingDraft.total);
    setApplyingCoupon(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setCouponDiscount(result.amount);
    setCouponLabel(result.label);
  };

  const clearCoupon = () => {
    setCouponInput("");
    setCouponDiscount(0);
    setCouponLabel(null);
    setError("");
  };

  const pay = async () => {
    if (loading) return;
    if (requiresAuth() && !isLoggedIn) {
      redirectToAuth(navigation, setPendingAuth, "rider", "login", isLoggedIn);
      return;
    }
    if (method === "wallet" && walletBalance < finalTotal) {
      setError("رصيد المحفظة غير كافٍ. اختر وسيلة دفع أخرى أو شحن المحفظة.");
      return;
    }
    setError("");
    setLoading(true);
    const isFreight = bookingDraft.serviceType === "cargo" || bookingDraft.serviceType === "tow";
    navigation.navigate(isFreight ? "FreightMatching" : "SearchCaptain", { method });
    setLoading(false);
  };

  return (
    <StackScreenLayout
      header={<AppHeader title="الدفع" onBack={onBack} />}
      footer={
        <PrimaryButton
          label={loading ? "جارٍ تأكيد الطلب..." : `تأكيد الطلب · ${format(finalTotal)}`}
          onPress={pay}
          disabled={loading}
        />
      }
      contentContainerStyle={{ gap: 16, paddingTop: 12 }}
    >
      <View style={{ ...figmaCard, padding: 18 }}>
        {!supabaseReady ? (
          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.warning,
              backgroundColor: `${colors.warning}1A`,
              padding: 10,
              marginBottom: 12,
            }}
          >
            <Text style={[textPresets.caption, { color: colors.warning }]}>
              Supabase غير مفعّل. سيتم إنشاء الطلب محليًا على هذا الجهاز.
            </Text>
          </View>
        ) : null}

        <SummaryRow label="فئة الخدمة" value={serviceLabel} />
        <SummaryRow label={fareLineLabel(serviceType)} value={format(bookingDraft.baseFare)} />
        <SummaryRow label="إضافات" value={format(bookingDraft.extrasTotal)} />
        <SummaryRow label={discountLineLabel(serviceType)} value={`-${format(bookingDraft.discount)}`} discount />
        {couponLabel ? (
          <SummaryRow label={couponLabel} value={`-${format(couponDiscount)}`} discount />
        ) : null}
        <SummaryRow label="ضريبة القيمة المضافة" value={format(bookingDraft.vat)} />

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            marginTop: 8,
            paddingTop: 14,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={[textPresets.title, ltrText, { color: colors.primary }]}>{format(finalTotal)}</Text>
          <Text style={textPresets.title}>الإجمالي</Text>
        </View>
      </View>

      <View style={{ ...figmaCard, padding: 18, gap: 16 }}>
        <Text style={[textPresets.labelMuted, { textAlign: "right" }]}>كود الخصم</Text>

        {couponLabel ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 12,
              borderRadius: 12,
              backgroundColor: `${colors.success}12`,
              borderWidth: 1,
              borderColor: `${colors.success}40`,
            }}
          >
            <Pressable onPress={clearCoupon} hitSlop={8}>
              <X size={18} color={colors.mutedForeground} />
            </Pressable>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={[textPresets.bodySm, { color: colors.success, fontFamily: fonts.arabicBold }]}>{couponLabel}</Text>
              <Text style={[textPresets.caption, { color: colors.mutedForeground }]}>{couponInput.toUpperCase()}</Text>
            </View>
            <Tag size={18} color={colors.success} />
          </View>
        ) : (
          <PromoInputRow
            label="كود خصم"
            placeholder="مثال: LUFFA30"
            value={couponInput}
            onChangeText={(t) => setCouponInput(t.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            onApply={applyCoupon}
            applying={applyingCoupon}
            Icon={Tag}
            ltr
          />
        )}

        <Text style={[textPresets.caption, { textAlign: "right", color: colors.mutedForeground, lineHeight: 18 }]}>
          أكواد تجريبية: LUFFA30 · LF10 · WELCOME
        </Text>
      </View>

      <View style={{ ...figmaCard, padding: 18 }}>
        <Text style={[textPresets.labelMuted, { marginBottom: 14, textAlign: "right" }]}>وسيلة الدفع</Text>
        <View style={{ gap: 10 }}>
          {methods.map(({ key, label, Icon }) => {
            const text = key === "wallet" ? walletLabel : label;
            const selected = method === key;
            const walletDisabled = key === "wallet" && walletBalance < finalTotal;
            return (
              <Pressable
                key={key}
                onPress={() => {
                  if (walletDisabled) return;
                  setMethod(key);
                  setError("");
                }}
                style={{
                  width: "100%",
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  minHeight: 56,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  borderWidth: 2,
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? `${colors.primary}0D` : colors.secondary,
                  opacity: walletDisabled ? 0.5 : 1,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: selected ? `${colors.primary}40` : colors.border,
                  }}
                >
                  <Icon width={20} height={20} color={selected ? colors.primary : colors.foreground} strokeWidth={2} />
                </View>
                <Text
                  style={[
                    textPresets.body,
                    { flex: 1, textAlign: "right" },
                    selected && { color: colors.primary, fontFamily: textPresets.title.fontFamily },
                  ]}
                  numberOfLines={2}
                >
                  {text}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {error ? (
          <Text style={[textPresets.caption, { color: colors.destructive, marginTop: 12, textAlign: "center" }]}>{error}</Text>
        ) : null}
      </View>
    </StackScreenLayout>
  );
}

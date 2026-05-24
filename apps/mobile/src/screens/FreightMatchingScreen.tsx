import { useEffect, useRef, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Package, Truck } from "lucide-react-native";
import type { AppStackParamList } from "@/navigation/types";
import { useAppState } from "@/state/AppStateContext";
import { colors } from "@/theme/tokens";
import { fonts, ltrText, textPresets } from "@/theme/textStyles";
import {
  fetchFreightOrder,
  getSupabase,
  isSupabaseReady,
  riderFreightConfirm,
  type FreightOrderSnapshot,
} from "@luffa/shared";
import { freightMock } from "@/services/freightMock";
import { PrimaryButton } from "@/components/layout";

type Props = NativeStackScreenProps<AppStackParamList, "FreightMatching">;

const POLL_MS = 2000;

export function FreightMatchingScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { addOrderFromCheckout, orders, setOrders } = useAppState();
  const method = route.params.method;
  const [orderId, setOrderId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<FreightOrderSnapshot | null>(null);
  const [phase, setPhase] = useState<"creating" | "waiting" | "review" | "done" | "error">("creating");
  const [errorText, setErrorText] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void addOrderFromCheckout(method)
      .then((id) => {
        if (cancelled) return;
        setOrderId(id);
        setPhase("waiting");
      })
      .catch(() => {
        if (cancelled) return;
        setPhase("error");
        setErrorText("تعذر إنشاء الطلب.");
      });
    return () => {
      cancelled = true;
    };
  }, [addOrderFromCheckout, method]);

  const loadSnapshot = async (id: string): Promise<FreightOrderSnapshot | null> => {
    if (isSupabaseReady()) return fetchFreightOrder(id);
    return freightMock.get(id);
  };

  useEffect(() => {
    if (!orderId || phase === "creating" || phase === "error" || phase === "done") return;

    const poll = async () => {
      const snap = await loadSnapshot(orderId);
      if (!snap) return;
      setSnapshot(snap);

      if (snap.status === "active" && snap.riderConfirmedMatch) {
        setPhase("done");
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: "active",
                  statusLabel: snap.statusLabel,
                  price: `${(snap.captainQuoteSar ?? snap.riderOfferSar).toFixed(2)} ر.س`,
                  total: `${(snap.captainQuoteSar ?? snap.riderOfferSar).toFixed(2)} ر.س`,
                }
              : o,
          ),
        );
        navigation.reset({
          index: 1,
          routes: [{ name: "MainTabs" }, { name: "OrderDetails", params: { orderId } }],
        });
        return;
      }

      if (snap.captainConfirmedMatch && !snap.riderConfirmedMatch) {
        setPhase("review");
      }
    };

    void poll();
    const interval = setInterval(() => void poll(), POLL_MS);

    let channel: ReturnType<ReturnType<typeof getSupabase>["channel"]> | null = null;
    if (isSupabaseReady()) {
      const supabase = getSupabase();
      channel = supabase
        .channel(`freight-${orderId}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
          () => void poll(),
        )
        .subscribe();
    }

    return () => {
      clearInterval(interval);
      if (channel) void getSupabase().removeChannel(channel);
    };
  }, [orderId, phase, navigation, setOrders]);

  const confirmCaptainOffer = async () => {
    if (!orderId) return;
    setConfirming(true);
    try {
      if (isSupabaseReady()) {
        await riderFreightConfirm(orderId);
      } else {
        freightMock.riderConfirm(orderId);
      }
      const snap = await loadSnapshot(orderId);
      if (snap) setSnapshot(snap);
    } catch (e) {
      setErrorText(e instanceof Error ? e.message : "تعذر التأكيد");
    } finally {
      setConfirming(false);
    }
  };

  const isTow = snapshot?.serviceType === "tow";
  const Icon = isTow ? Truck : Package;
  const order = orders.find((o) => o.id === orderId);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + 24,
        paddingHorizontal: 24,
        paddingBottom: insets.bottom + 24,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
      }}
    >
      {phase === "creating" || (phase === "waiting" && !snapshot?.captainConfirmedMatch) ? (
        <>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[textPresets.title, { textAlign: "center" }]}>بانتظار عروض الكباتن</Text>
          <Text style={[textPresets.body, { textAlign: "center", color: colors.mutedForeground }]}>
            {isTow ? "طلب السطحة" : "طلب نقل البضائع"} — سيظهر عرض الكابتن هنا
          </Text>
          {order ? (
            <Text style={[textPresets.caption, { textAlign: "center" }]}>
              سعرك المقترح: {order.total}
            </Text>
          ) : null}
          <Text style={[textPresets.caption, { color: colors.warning, textAlign: "center" }]}>
            وضع تجريبي: افتح وضع الكابتن وقدّم عرضاً على نفس الطلب
          </Text>
        </>
      ) : null}

      {phase === "review" && snapshot ? (
        <View style={{ width: "100%", maxWidth: 360, gap: 14 }}>
          <View style={{ alignItems: "center", gap: 8 }}>
            <Icon size={32} color={colors.primary} />
            <Text style={[textPresets.title, { textAlign: "center" }]}>عرض الكابتن</Text>
          </View>
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 16,
              gap: 8,
            }}
          >
            <Text style={[textPresets.body, { textAlign: "right" }]}>
              {snapshot.from} → {snapshot.to}
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
              <Text style={[textPresets.body, ltrText, { fontFamily: fonts.arabicBold, color: colors.primary }]}>
                {(snapshot.captainQuoteSar ?? 0).toFixed(2)} ر.س
              </Text>
              <Text style={textPresets.caption}>سعر الكابتن</Text>
            </View>
            {snapshot.captainQuoteSar !== snapshot.riderOfferSar ? (
              <Text style={[textPresets.caption, { textAlign: "right", color: colors.mutedForeground }]}>
                سعرك كان {snapshot.riderOfferSar.toFixed(2)} ر.س
              </Text>
            ) : (
              <Text style={[textPresets.caption, { textAlign: "right", color: colors.success }]}>
                الكابتن قبل سعرك
              </Text>
            )}
          </View>
          <PrimaryButton
            label={confirming ? "جارٍ التأكيد..." : "موافقة على العرض وبدء الخدمة"}
            disabled={confirming}
            onPress={() => void confirmCaptainOffer()}
          />
          <Pressable onPress={() => navigation.goBack()} style={{ alignItems: "center", padding: 12 }}>
            <Text style={[textPresets.caption, { color: colors.mutedForeground }]}>إلغاء</Text>
          </Pressable>
        </View>
      ) : null}

      {phase === "error" ? (
        <>
          <Text style={[textPresets.body, { color: colors.destructive, textAlign: "center" }]}>{errorText}</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.primary }}>رجوع</Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

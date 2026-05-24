import { useEffect, useRef, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RefreshCcw, UserRoundSearch } from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AppStackParamList } from "@/navigation/types";
import { useAppState } from "@/state/AppStateContext";
import { colors } from "@/theme/tokens";
import { fonts, textPresets } from "@/theme/textStyles";
import { CancelOrderButton } from "@/components/CancelOrderButton";
import { fetchOrderRowById, getSupabase, isSupabaseReady } from "@luffa/shared";
import { captainMock } from "@/services/captainMock";

type Props = NativeStackScreenProps<AppStackParamList, "SearchCaptain">;

type SearchStatus = "creating" | "searching" | "busy";

const POLL_MS = 2000;
const MAX_WAIT_MS = 120000;

export function SearchCaptainScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { addOrderFromCheckout } = useAppState();
  const method = route.params.method;
  const supabaseReady = isSupabaseReady();
  const [status, setStatus] = useState<SearchStatus>("creating");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorText, setErrorText] = useState("");
  const startedAt = useRef(Date.now());

  useEffect(() => {
    let cancelled = false;
    void addOrderFromCheckout(method)
      .then((id) => {
        if (cancelled) return;
        setOrderId(id);
        setStatus("searching");
      })
      .catch(() => {
        if (cancelled) return;
        setErrorText("تعذر إنشاء الطلب.");
        setStatus("busy");
      });
    return () => {
      cancelled = true;
    };
  }, [addOrderFromCheckout, method]);

  useEffect(() => {
    if (status !== "searching" || !orderId) return;

    const poll = async () => {
      if (Date.now() - startedAt.current > MAX_WAIT_MS) {
        setStatus("busy");
        setErrorText("انتهت المهلة. لم يقبل أي كابتن بعد.");
        return;
      }

      if (isSupabaseReady()) {
        const row = await fetchOrderRowById(orderId);
        if (row?.captain_id) {
          navigation.reset({
            index: 1,
            routes: [{ name: "MainTabs" }, { name: "OrderDetails", params: { orderId } }],
          });
        }
        return;
      }

      if (captainMock.getActiveOrderId() === orderId) {
        navigation.reset({
          index: 1,
          routes: [{ name: "MainTabs" }, { name: "OrderDetails", params: { orderId } }],
        });
      }
    };

    const interval = setInterval(() => void poll(), POLL_MS);
    void poll();

    let channel: ReturnType<ReturnType<typeof getSupabase>["channel"]> | null = null;
    if (isSupabaseReady() && orderId) {
      const supabase = getSupabase();
      channel = supabase
        .channel(`order-${orderId}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
          (payload) => {
            const next = payload.new as { captain_id?: string };
            if (next.captain_id) {
              navigation.reset({
                index: 1,
                routes: [{ name: "MainTabs" }, { name: "OrderDetails", params: { orderId } }],
              });
            }
          },
        )
        .subscribe();
    }

    return () => {
      clearInterval(interval);
      if (channel && isSupabaseReady()) void getSupabase().removeChannel(channel);
    };
  }, [status, orderId, navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) }}>
      <View style={{ width: "100%", maxWidth: 400, alignItems: "center" }}>
        {status === "searching" || status === "creating" ? (
          <>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: `${colors.primary}1A`, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
            <Text style={[textPresets.heading, { textAlign: "center", marginBottom: 8 }]}>{status === "creating" ? "جارٍ إنشاء الطلب..." : "البحث عن كابتن"}</Text>
            <Text style={[textPresets.bodySm, { color: colors.mutedForeground, textAlign: "center", marginBottom: 16 }]}>بانتظار قبول كابتن قريب منك</Text>
            {!supabaseReady ? (
              <Text style={[textPresets.caption, { color: colors.warning, textAlign: "center" }]}>وضع تجريبي: اقبل الطلب من وضع الكابتن</Text>
            ) : null}
            {orderId ? (
              <View style={{ width: "100%", marginTop: 20 }}>
                <CancelOrderButton
                  orderId={orderId}
                  status="pending"
                  onCancelled={() =>
                    navigation.reset({
                      index: 0,
                      routes: [{ name: "MainTabs" }],
                    })
                  }
                />
              </View>
            ) : null}
          </>
        ) : (
          <>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: `${colors.warning}1A`, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <UserRoundSearch width={32} height={32} color={colors.warning} />
            </View>
            <Text style={[textPresets.heading, { textAlign: "center", marginBottom: 8 }]}>لا يوجد كابتن بعد</Text>
            <Text style={[textPresets.bodySm, { color: colors.mutedForeground, textAlign: "center", marginBottom: 20 }]}>{errorText || "حاول مرة أخرى"}</Text>
            <Pressable
              style={{ borderRadius: 12, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 8 }}
              onPress={() => {
                startedAt.current = Date.now();
                setErrorText("");
                setStatus("creating");
                void addOrderFromCheckout(method).then(setOrderId).then(() => setStatus("searching"));
              }}
            >
              <RefreshCcw width={16} height={16} color={colors.primaryForeground} />
              <Text style={[textPresets.bodySm, { color: colors.primaryForeground, fontFamily: textPresets.title.fontFamily }]}>إعادة المحاولة</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

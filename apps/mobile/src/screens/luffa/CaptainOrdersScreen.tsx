import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CaptainStackParamList } from "@/navigation/CaptainNavigator";
import { Pressable, ScrollView, Text, View } from "react-native";
import { AppHeader, StackScreenLayout } from "@/components/layout";
import { useAppState } from "@/state/AppStateContext";
import { fetchOrdersForCaptain, isSupabaseReady, resolveOrderStatusLabel } from "@luffa/shared";
import type { Order } from "@/shared/types";
import { colors } from "@/theme/tokens";
import { textPresets } from "@/theme/textStyles";
import { figmaCard } from "@/theme/figmaStyles";

type Tab = "active" | "completed" | "cancelled";

export function CaptainOrdersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<CaptainStackParamList>>();
  const { userId } = useAppState();
  const [tab, setTab] = useState<Tab>("active");
  const [orders, setOrders] = useState<Order[]>([]);

  const load = useCallback(async () => {
    if (!userId || !isSupabaseReady()) {
      setOrders([]);
      return;
    }
    const list = await fetchOrdersForCaptain(userId);
    setOrders(list);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const filtered = orders.filter((o) => {
    if (tab === "active") return o.status === "active" || o.status === "pending";
    if (tab === "completed") return o.status === "completed";
    return o.status === "cancelled";
  });

  return (
    <StackScreenLayout
      header={<AppHeader title="رحلاتي" />}
      contentContainerStyle={{ gap: 12, paddingTop: 8 }}
    >
      <View style={{ flexDirection: "row", gap: 8 }}>
        {(
          [
            { key: "active" as const, label: "نشطة" },
            { key: "completed" as const, label: "مكتملة" },
            { key: "cancelled" as const, label: "ملغاة" },
          ] as const
        ).map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 999,
              backgroundColor: tab === t.key ? colors.primary : colors.secondary,
              alignItems: "center",
            }}
          >
            <Text style={[textPresets.caption, { color: tab === t.key ? colors.primaryForeground : colors.foreground }]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
        {filtered.length === 0 ? (
          <Text style={[textPresets.caption, { textAlign: "center", color: colors.mutedForeground, marginTop: 24 }]}>لا توجد رحلات</Text>
        ) : (
          filtered.map((o) => (
            <Pressable
              key={o.id}
              onPress={() => navigation.navigate("CaptainOrderDetails", { orderId: o.id })}
              style={{ ...figmaCard, padding: 14, gap: 6 }}
            >
              <Text style={[textPresets.body, { fontFamily: textPresets.title.fontFamily, textAlign: "right" }]}>{o.from} → {o.to}</Text>
              <Text style={[textPresets.caption, { textAlign: "right", color: colors.mutedForeground }]}>
                {resolveOrderStatusLabel(o.status, o.statusLabel)} · {o.total}
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </StackScreenLayout>
  );
}

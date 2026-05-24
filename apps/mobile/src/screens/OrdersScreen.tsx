import { AppHeader, StackScreenLayout } from "@/components/layout";
import { figmaCard, statusColors } from "@/theme/figmaStyles";
import { colors } from "@/theme/tokens";
import { ltrText, textPresets } from "@/theme/textStyles";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Clock, Star } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import type { AppStackParamList } from "@/navigation/types";
import { useStackBack } from "@/navigation/useStackBack";
import type { Order } from "@/shared/types";
import { useAppState } from "@/state/AppStateContext";

type Props = NativeStackScreenProps<AppStackParamList, "Orders">;

function OrderCard({ item, onPress }: { item: Order; onPress: () => void }) {
  const badge = statusColors(item.status);

  return (
    <Pressable onPress={onPress} style={{ ...figmaCard, padding: 14 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
            backgroundColor: badge.bg,
          }}
        >
          <Text style={[textPresets.captionBold, { color: badge.text }]}>{item.statusLabel}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[textPresets.title, ltrText]}>{item.price}</Text>
          <Text style={[textPresets.caption, ltrText, { marginTop: 4, color: colors.mutedForeground }]}>
            {item.displayId}
          </Text>
        </View>
      </View>

      <View style={{ gap: 10, marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />
          <Text style={[textPresets.bodySm, { flex: 1 }]} numberOfLines={1}>
            {item.from}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.destructive }} />
          <Text style={[textPresets.bodySm, { flex: 1 }]} numberOfLines={1}>
            {item.to}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Clock width={14} height={14} color={colors.mutedForeground} />
          <Text style={[textPresets.caption, ltrText, { color: colors.mutedForeground }]}>
            {item.time} - {item.date}
          </Text>
        </View>
        {item.rating > 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Star width={14} height={14} color={colors.warning} fill={colors.warning} />
            <Text style={[textPresets.captionBold, ltrText]}>{item.rating.toFixed(1)}</Text>
          </View>
        ) : item.status === "active" ? (
          <Text style={[textPresets.captionBold, { color: colors.warning }]}>تتبع مباشر</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function OrdersScreen({ navigation }: Props) {
  const onBack = useStackBack();
  const { orders } = useAppState();

  return (
    <StackScreenLayout
      header={<AppHeader title="طلباتي" onBack={onBack} />}
      contentContainerStyle={{ gap: 14, paddingTop: 12 }}
    >
      {orders.length === 0 ? (
        <Text style={[textPresets.bodySm, { color: colors.mutedForeground, textAlign: "center", paddingVertical: 24 }]}>
          لا توجد طلبات حالياً
        </Text>
      ) : (
        orders.map((item) => (
          <OrderCard
            key={item.id}
            item={item}
            onPress={() => navigation.navigate("OrderDetails", { orderId: item.id })}
          />
        ))
      )}
    </StackScreenLayout>
  );
}

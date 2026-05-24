import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowRight } from "lucide-react-native";
import type { Order } from "@/shared/types";
import { statusColors } from "@/theme/figmaStyles";
import { colors } from "@/theme/tokens";
import { ltrText, textPresets } from "@/theme/textStyles";

type Props = {
  order: Order;
  onBack: () => void;
};

export function OrderDetailsHeader({ order, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const badge = statusColors(order.status);

  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingBottom: 14,
        paddingHorizontal: 20,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.secondary,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <ArrowRight size={18} color={colors.foreground} />
        </Pressable>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={[textPresets.bodySm, { color: colors.mutedForeground }]} numberOfLines={1}>
            {order.serviceLabel}
          </Text>
          <Text style={[textPresets.title, ltrText, { marginTop: 2 }]} numberOfLines={1}>
            {order.displayId}
          </Text>
        </View>

        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            backgroundColor: badge.bg,
            minWidth: 72,
            alignItems: "center",
          }}
        >
          <Text style={[textPresets.captionBold, { color: badge.text }]}>{order.statusLabel}</Text>
        </View>
      </View>
    </View>
  );
}

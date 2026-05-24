import { useState } from "react";
import { Alert, Pressable, Text } from "react-native";
import { canCancelOrder, cancelOrder, isSupabaseReady, mapCancelOrderError } from "@luffa/shared";
import { captainMock } from "@/services/captainMock";
import { freightMock } from "@/services/freightMock";
import { colors } from "@/theme/tokens";
import { fonts, textPresets } from "@/theme/textStyles";

type Props = {
  orderId: string;
  status: string;
  statusLabel?: string | null;
  onCancelled: () => void;
  /** Shorter label for tight layouts (e.g. active trip). */
  compact?: boolean;
};

export function CancelOrderButton({ orderId, status, statusLabel, onCancelled, compact }: Props) {
  const [loading, setLoading] = useState(false);

  if (!canCancelOrder({ status, statusLabel })) {
    return null;
  }

  const runCancel = async () => {
    setLoading(true);
    try {
      if (isSupabaseReady()) {
        await cancelOrder(orderId);
      } else {
        captainMock.cancel(orderId);
        const snap = freightMock.get(orderId);
        if (snap) {
          freightMock.cancel(orderId);
        }
      }
      onCancelled();
    } catch (err) {
      Alert.alert("تعذّر الإلغاء", mapCancelOrderError(err));
    } finally {
      setLoading(false);
    }
  };

  const confirm = () => {
    Alert.alert(
      "إلغاء الطلب",
      "هل أنت متأكد من إلغاء هذا الطلب؟",
      [
        { text: "لا", style: "cancel" },
        { text: "نعم، إلغاء", style: "destructive", onPress: () => void runCancel() },
      ],
    );
  };

  return (
    <Pressable
      onPress={confirm}
      disabled={loading}
      accessibilityRole="button"
      style={{
        paddingVertical: compact ? 12 : 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: `${colors.destructive}55`,
        backgroundColor: `${colors.destructive}0C`,
        alignItems: "center",
        opacity: loading ? 0.6 : 1,
      }}
    >
      <Text style={[textPresets.bodySm, { color: colors.destructive, fontFamily: fonts.arabicBold }]}>
        {loading ? "جارٍ الإلغاء..." : compact ? "إلغاء الرحلة" : "إلغاء الطلب"}
      </Text>
    </Pressable>
  );
}

import { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  Text,
  View,
  Vibration,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Navigation, X } from "lucide-react-native";
import type { CaptainOffer } from "@luffa/shared";
import { PrimaryButton } from "@/components/layout";
import { colors, radii } from "@/theme/tokens";
import { fonts, ltrText, textPresets } from "@/theme/textStyles";

type Props = {
  visible: boolean;
  offer: CaptainOffer | null;
  loading?: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
};

export function CaptainIncomingOfferSheet({
  visible,
  offer,
  loading = false,
  onAccept,
  onDecline,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const slideY = useRef(new Animated.Value(height)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const lastAnimatedOfferId = useRef<string | null>(null);

  useEffect(() => {
    const offerId = offer?.id ?? null;
    if (visible && offerId) {
      const isNewOffer = lastAnimatedOfferId.current !== offerId;
      if (isNewOffer) {
        lastAnimatedOfferId.current = offerId;
        Vibration.vibrate([0, 80, 60, 80]);
      }
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 180 }),
        Animated.timing(backdrop, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      if (!visible) lastAnimatedOfferId.current = null;
      Animated.parallel([
        Animated.timing(slideY, { toValue: height, duration: 260, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, offer?.id, height, slideY, backdrop]);

  if (!offer) return null;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Animated.View
          style={{
            ...{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
            backgroundColor: "rgba(15,10,22,0.55)",
            opacity: backdrop,
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="إغلاق" />
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ translateY: slideY }],
            backgroundColor: colors.card,
            borderTopLeftRadius: radii.xxl,
            borderTopRightRadius: radii.xxl,
            paddingTop: 10,
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 16,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: "#1a1323",
            shadowOffset: { width: 0, height: -6 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 24,
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 12 }}>
            <View style={{ width: 48, height: 5, borderRadius: 999, backgroundColor: colors.border }} />
          </View>

          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.secondary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} color={colors.foreground} />
            </Pressable>
            <View style={{ flex: 1, alignItems: "flex-end", paddingHorizontal: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: `${colors.primary}14`,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  marginBottom: 8,
                }}
              >
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />
                <Text style={{ fontFamily: fonts.arabicBold, fontSize: 12, color: colors.primary }}>طلب جديد</Text>
              </View>
              <Text style={[textPresets.title, { textAlign: "right", fontSize: 22 }]}>طلب قريب</Text>
              <Text style={[textPresets.caption, { color: colors.mutedForeground, marginTop: 4, textAlign: "right" }]}>
                على بعد {offer.distanceKm} كم · اقبل خلال دقائق
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: colors.secondary,
              borderRadius: 16,
              padding: 14,
              gap: 12,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
              <MapPin size={18} color={colors.success} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={[textPresets.caption, { color: colors.mutedForeground, textAlign: "right" }]}>من</Text>
                <Text style={[textPresets.body, { fontFamily: fonts.arabicBold, textAlign: "right", marginTop: 2 }]}>
                  {offer.from}
                </Text>
              </View>
            </View>
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
              <Navigation size={18} color={colors.primary} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={[textPresets.caption, { color: colors.mutedForeground, textAlign: "right" }]}>إلى</Text>
                <Text style={[textPresets.body, { fontFamily: fonts.arabicBold, textAlign: "right", marginTop: 2 }]}>
                  {offer.to}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 12, marginBottom: 18 }}>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={textPresets.caption}>إجمالي الرحلة</Text>
              <Text style={[textPresets.body, ltrText, { fontFamily: fonts.arabicBold, marginTop: 4 }]}>
                {offer.fareTotal.toFixed(2)} ر.س
              </Text>
            </View>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={textPresets.caption}>صافي أرباحك</Text>
              <Text
                style={[
                  textPresets.body,
                  ltrText,
                  { fontFamily: fonts.arabicBold, marginTop: 4, color: colors.success },
                ]}
              >
                {offer.captainNet.toFixed(2)} ر.س
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={onDecline}
              disabled={loading}
              style={{
                flex: 1,
                paddingVertical: 15,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
                opacity: loading ? 0.6 : 1,
              }}
            >
              <Text style={[textPresets.body, { fontFamily: fonts.arabicBold, color: colors.mutedForeground }]}>
                تجاهل
              </Text>
            </Pressable>
            <View style={{ flex: 2 }}>
              <PrimaryButton
                label={loading ? "جارٍ القبول..." : "قبول الطلب"}
                disabled={loading}
                onPress={onAccept}
              />
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

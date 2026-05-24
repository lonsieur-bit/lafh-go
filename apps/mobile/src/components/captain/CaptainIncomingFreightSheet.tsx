import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  Vibration,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Navigation, Package, Truck, X } from "lucide-react-native";
import type { CaptainOffer } from "@luffa/shared";
import { PrimaryButton } from "@/components/layout";
import { colors, radii } from "@/theme/tokens";
import { fonts, ltrText, textPresets } from "@/theme/textStyles";

type Props = {
  visible: boolean;
  offer: CaptainOffer | null;
  loading?: boolean;
  onAcceptRiderPrice: () => void;
  onSubmitQuote: (quoteSar: number) => void;
  onClose: () => void;
};

export function CaptainIncomingFreightSheet({
  visible,
  offer,
  loading = false,
  onAcceptRiderPrice,
  onSubmitQuote,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const slideY = useRef(new Animated.Value(height)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const [quote, setQuote] = useState("");
  const [mode, setMode] = useState<"choose" | "bid">("choose");

  useEffect(() => {
    if (visible && offer) {
      setMode("choose");
      setQuote("");
      Vibration.vibrate([0, 80, 60, 80]);
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 180 }),
        Animated.timing(backdrop, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideY, { toValue: height, duration: 260, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, offer, height, slideY, backdrop]);

  if (!offer) return null;

  const isTow = offer.serviceType === "tow";
  const ServiceIcon = isTow ? Truck : Package;
  const riderPrice = offer.riderOfferSar ?? offer.fareTotal;

  const submitBid = () => {
    const n = Number(quote.replace(/[^\d.]/g, ""));
    if (!Number.isFinite(n) || n <= 0) return;
    onSubmitQuote(n);
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15,10,22,0.55)",
            opacity: backdrop,
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} />
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
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 12 }}>
            <View style={{ width: 48, height: 5, borderRadius: 999, backgroundColor: colors.border }} />
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <Pressable onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" }}>
              <X size={18} color={colors.foreground} />
            </Pressable>
            <View style={{ flex: 1, alignItems: "flex-end", gap: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ fontFamily: fonts.arabicBold, fontSize: 12, color: colors.primary }}>
                  {isTow ? "طلب سطحة" : "نقل بضائع"}
                </Text>
                <ServiceIcon size={16} color={colors.primary} />
              </View>
              <Text style={[textPresets.title, { textAlign: "right" }]}>عرض على الطلب</Text>
            </View>
          </View>

          <View style={{ backgroundColor: colors.secondary, borderRadius: 14, padding: 14, gap: 10, marginBottom: 12 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <MapPin size={16} color={colors.success} />
              <Text style={[textPresets.body, { flex: 1, textAlign: "right" }]}>{offer.from}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Navigation size={16} color={colors.primary} />
              <Text style={[textPresets.body, { flex: 1, textAlign: "right" }]}>{offer.to}</Text>
            </View>
            {offer.freightNotes ? (
              <Text style={[textPresets.caption, { textAlign: "right", color: colors.mutedForeground }]}>{offer.freightNotes}</Text>
            ) : null}
          </View>

          <View style={{ alignItems: "flex-end", marginBottom: 16 }}>
            <Text style={textPresets.caption}>سعر الراكب المقترح</Text>
            <Text style={[textPresets.heading, ltrText, { marginTop: 4, color: colors.primary }]}>{riderPrice.toFixed(2)} ر.س</Text>
          </View>

          {mode === "choose" ? (
            <View style={{ gap: 10 }}>
              <PrimaryButton
                label={loading ? "جارٍ الإرسال..." : "قبول سعر الراكب"}
                disabled={loading}
                onPress={onAcceptRiderPrice}
              />
              <Pressable
                onPress={() => setMode("bid")}
                style={{
                  paddingVertical: 14,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                }}
              >
                <Text style={[textPresets.body, { fontFamily: fonts.arabicBold }]}>عرض سعر مختلف</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              <Text style={[textPresets.labelMuted, { textAlign: "right" }]}>سعرك (ر.س)</Text>
              <TextInput
                value={quote}
                onChangeText={(t) => setQuote(t.replace(/[^0-9.]/g, ""))}
                keyboardType="decimal-pad"
                placeholder={String(riderPrice)}
                placeholderTextColor={colors.mutedForeground}
                style={{
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.secondary,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  textAlign: "center",
                  fontSize: 22,
                  fontFamily: fonts.arabicBold,
                  color: colors.foreground,
                }}
              />
              <PrimaryButton label={loading ? "جارٍ الإرسال..." : "إرسال العرض"} disabled={loading} onPress={submitBid} />
              <Pressable onPress={() => setMode("choose")} style={{ alignItems: "center", paddingVertical: 8 }}>
                <Text style={[textPresets.caption, { color: colors.primary }]}>رجوع</Text>
              </Pressable>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, PanResponder, Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BellRing, Power } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CaptainIncomingOfferSheet } from "@/components/captain/CaptainIncomingOfferSheet";
import { CaptainIncomingFreightSheet } from "@/components/captain/CaptainIncomingFreightSheet";
import { getCaptainStackNavigation } from "@/navigation/captainStackNavigation";
import { useCaptainLocation } from "@/hooks/useCaptainLocation";
import { useCaptainOps } from "@/hooks/useCaptainOps";
import { notifyLocalNewOffer, setupCaptainNotifications } from "@/lib/captainNotifications";
import { useAppState } from "@/state/AppStateContext";
import { redirectToAuth, requiresAuth } from "@/lib/authGate";
import { useCurrency } from "@luffa/shared";
import { figmaCard } from "@/theme/figmaStyles";
import { colors } from "@/theme/tokens";
import { fonts, textPresets } from "@/theme/textStyles";

const CIRCLE_SIZE = 160;
const BORDER_WIDTH = 10;
const SWIPE_THRESHOLD = 72;
const TRACK_HEIGHT = 52;
const KNOB_SIZE = 44;

function SwipeToStop({ onStop }: { onStop: () => void }) {
  const knobX = useRef(new Animated.Value(0)).current;
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 4,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, g) => knobX.setValue(Math.max(-120, Math.min(0, g.dx))),
        onPanResponderRelease: (_, g) => {
          if (Math.abs(g.dx) >= SWIPE_THRESHOLD) onStop();
          Animated.spring(knobX, { toValue: 0, useNativeDriver: true, damping: 16 }).start();
        },
      }),
    [knobX, onStop],
  );

  return (
    <View style={{ width: "100%", maxWidth: 300, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: 12, gap: 10 }}>
      <Text style={[textPresets.caption, { fontFamily: fonts.arabicBold, color: colors.mutedForeground, textAlign: "center" }]}>اسحب للإيقاف</Text>
      <View {...panResponder.panHandlers} style={{ height: TRACK_HEIGHT, borderRadius: 12, backgroundColor: colors.secondary, overflow: "hidden", justifyContent: "center" }}>
        <Animated.View
          style={{
            position: "absolute",
            top: (TRACK_HEIGHT - KNOB_SIZE) / 2,
            right: 4,
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            borderRadius: 10,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            transform: [{ translateX: knobX }],
          }}
        />
      </View>
    </View>
  );
}

export default function CaptainHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { format } = useCurrency();
  const { captainOnline, offlineAlertsEnabled, setOfflineAlertsEnabled, isLoggedIn, userId, setPendingAuth } =
    useAppState();
  const ops = useCaptainOps({ watchOffers: true });
  const notifiedOfferIds = useRef(new Set<string>());
  const [sheetVisible, setSheetVisible] = useState(false);
  const [dismissedOfferId, setDismissedOfferId] = useState<string | null>(null);

  const topOffer = ops.offers[0] ?? null;
  const topOfferId = topOffer?.id ?? null;

  const onLocation = useCallback(
    (lat: number, lng: number) => {
      void ops.updateCaptainLocation(lat, lng);
    },
    [ops],
  );

  const { requestPermission } = useCaptainLocation(captainOnline, onLocation);

  useEffect(() => {
    void setupCaptainNotifications().catch(() => {
      /* Expo Go: push not fully supported */
    });
  }, []);

  useEffect(() => {
    if (!captainOnline || !topOfferId || ops.activeOrderId) {
      setSheetVisible(false);
      return;
    }
    if (topOfferId === dismissedOfferId) {
      setSheetVisible(false);
      return;
    }
    setSheetVisible(true);
    if (!notifiedOfferIds.current.has(topOfferId)) {
      notifiedOfferIds.current.add(topOfferId);
      void notifyLocalNewOffer("طلب جديد", `${topOffer!.from} → ${topOffer!.to}`);
    }
  }, [captainOnline, topOfferId, dismissedOfferId, topOffer, ops.activeOrderId]);

  const toggleOnline = async () => {
    if (requiresAuth() && !isLoggedIn) {
      redirectToAuth(navigation, setPendingAuth, "captain", "login", isLoggedIn);
      return;
    }
    if (captainOnline) {
      setSheetVisible(false);
      setDismissedOfferId(null);
      notifiedOfferIds.current.clear();
      await ops.goOffline();
      return;
    }
    setDismissedOfferId(null);
    const ok = await requestPermission();
    const lat = ops.location.lat;
    const lng = ops.location.lng;
    await ops.goOnline(lat, lng);
    if (!ok) await ops.goOnline(lat, lng);
  };

  const handleDecline = () => {
    if (!topOffer) return;
    setDismissedOfferId(topOffer.id);
    setSheetVisible(false);
    ops.declineOffer(topOffer.id);
  };

  const handleAcceptRide = async () => {
    if (!topOffer || topOffer.isFreight || ops.loading) return;
    try {
      const id = await ops.acceptOffer(topOffer);
      notifiedOfferIds.current.delete(topOffer.id);
      setSheetVisible(false);
      setDismissedOfferId(null);
      getCaptainStackNavigation(navigation).navigate("CaptainActiveTrip", { orderId: id });
    } catch (err) {
      const message = err instanceof Error ? err.message : "تعذّر قبول الطلب.";
      Alert.alert("تعذّر القبول", message);
      void ops.refreshOffers();
    }
  };

  const closeSheet = () => {
    if (topOffer) setDismissedOfferId(topOffer.id);
    setSheetVisible(false);
  };

  const handleFreightAcceptRiderPrice = async () => {
    if (!topOffer?.isFreight) return;
    if (ops.activeOrderId) {
      Alert.alert("رحلة نشطة", "أنهِ الرحلة الحالية قبل الرد على طلبات جديدة.");
      return;
    }
    try {
      await ops.respondFreightOffer(topOffer, { useRiderPrice: true });
      closeSheet();
    } catch (err) {
      Alert.alert("تعذّر الرد", err instanceof Error ? err.message : "حاول مرة أخرى.");
    }
  };

  const handleFreightSubmitQuote = async (quoteSar: number) => {
    if (!topOffer?.isFreight) return;
    if (ops.activeOrderId) {
      Alert.alert("رحلة نشطة", "أنهِ الرحلة الحالية قبل الرد على طلبات جديدة.");
      return;
    }
    try {
      await ops.respondFreightOffer(topOffer, { useRiderPrice: false, quoteSar });
      closeSheet();
    } catch (err) {
      Alert.alert("تعذّر الرد", err instanceof Error ? err.message : "حاول مرة أخرى.");
    }
  };

  const ringColor = captainOnline ? colors.success : colors.primary;
  const ringBg = captainOnline ? `${colors.success}18` : `${colors.primary}12`;
  const waitingCount = ops.offers.length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[textPresets.title, { fontSize: 20 }]}>وضع الكابتن</Text>
          <Text style={[textPresets.caption, { marginTop: 4 }]}>أرباح اليوم: {format(ops.earnings.todayNet)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, alignItems: "center", gap: 20 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={toggleOnline} style={{ alignItems: "center" }}>
          <View style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2, borderWidth: BORDER_WIDTH, borderColor: ringColor, backgroundColor: ringBg, alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Power size={44} color={ringColor} strokeWidth={2.2} />
            <Text style={{ fontFamily: fonts.arabicBold, fontSize: 16, color: ringColor }}>{captainOnline ? "قيد التشغيل" : "تشغيل"}</Text>
          </View>
        </Pressable>

        {captainOnline ? <SwipeToStop onStop={() => void ops.goOffline()} /> : null}

        {ops.activeOrderId ? (
          <Pressable
            onPress={() =>
              getCaptainStackNavigation(navigation).navigate("CaptainActiveTrip", { orderId: ops.activeOrderId! })
            }
            style={{
              width: "100%",
              maxWidth: 340,
              ...figmaCard,
              padding: 16,
              gap: 8,
              borderColor: colors.primary,
              backgroundColor: `${colors.primary}0A`,
            }}
          >
            <Text style={[textPresets.body, { fontFamily: fonts.arabicBold, textAlign: "center", color: colors.primary }]}>
              لديك رحلة نشطة
            </Text>
            <Text style={[textPresets.caption, { textAlign: "center", color: colors.mutedForeground, lineHeight: 18 }]}>
              أنهِ الرحلة الحالية لاستقبال طلبات جديدة
            </Text>
            <Text style={[textPresets.bodySm, { textAlign: "center", color: colors.primary, fontFamily: fonts.arabicBold }]}>
              متابعة الرحلة ←
            </Text>
          </Pressable>
        ) : null}

        <View style={{ width: "100%", maxWidth: 340, ...figmaCard, padding: 16, gap: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Pressable onPress={() => setOfflineAlertsEnabled(!offlineAlertsEnabled)} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: offlineAlertsEnabled ? colors.destructive : colors.secondary, alignItems: "center", justifyContent: "center" }} />
              <Text style={textPresets.bodySm}>مفعل</Text>
            </Pressable>
            <Text style={[textPresets.body, { fontFamily: fonts.arabicBold }]}>إشعار الطلبات القريبة</Text>
          </View>

          {captainOnline && !ops.activeOrderId && waitingCount > 0 ? (
            <Pressable onPress={() => setSheetVisible(true)} style={{ paddingVertical: 12, alignItems: "center", gap: 4 }}>
              <Text style={[textPresets.body, { fontFamily: fonts.arabicBold, color: colors.primary }]}>
                {waitingCount === 1 ? "طلب قريب بانتظارك" : `${waitingCount} طلبات قريبة`}
              </Text>
              <Text style={[textPresets.caption, { color: colors.mutedForeground }]}>اضغط لعرض التفاصيل</Text>
            </Pressable>
          ) : captainOnline ? (
            <Text style={[textPresets.caption, { textAlign: "center", color: colors.mutedForeground, paddingVertical: 8 }]}>
              بانتظار طلبات جديدة…
            </Text>
          ) : (
            <Text style={[textPresets.caption, { textAlign: "right", lineHeight: 18 }]}>شغّل الاستقبال لاستقبال الطلبات</Text>
          )}
        </View>

        {requiresAuth() && !userId ? (
          <Text style={[textPresets.caption, { textAlign: "center", color: colors.warning, paddingVertical: 8 }]}>
            سجّل الدخول ككابتن من الإعدادات لاستقبال طلبات حقيقية من قاعدة البيانات.
          </Text>
        ) : null}
        {!captainOnline ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: `${colors.warning}18`, borderWidth: 1, borderColor: `${colors.warning}40` }}>
            <BellRing size={14} color={colors.warning} />
            <Text style={{ fontFamily: fonts.arabicBold, fontSize: 12, color: colors.warning }}>وضع أوفلاين</Text>
          </View>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: `${colors.success}18`, borderWidth: 1, borderColor: `${colors.success}40` }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />
            <Text style={{ fontFamily: fonts.arabicBold, fontSize: 12, color: colors.success }}>متصل — تستقبل الطلبات</Text>
          </View>
        )}
      </ScrollView>

      {topOffer?.isFreight ? (
        <CaptainIncomingFreightSheet
          visible={sheetVisible && !!topOffer}
          offer={topOffer}
          loading={ops.loading}
          onAcceptRiderPrice={() => void handleFreightAcceptRiderPrice()}
          onSubmitQuote={(q) => void handleFreightSubmitQuote(q)}
          onClose={closeSheet}
        />
      ) : (
        <CaptainIncomingOfferSheet
          visible={sheetVisible && !!topOffer}
          offer={topOffer}
          loading={ops.loading}
          onAccept={() => void handleAcceptRide()}
          onDecline={handleDecline}
          onClose={closeSheet}
        />
      )}
    </View>
  );
}

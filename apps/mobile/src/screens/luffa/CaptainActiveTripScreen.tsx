import { useCallback, useEffect, useMemo, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, Text, View, Vibration } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CAPTAIN_TRIP_STATUS_LABELS,
  canCancelTripPhase,
  advanceCaptainTripPhase,
  computeCaptainNet,
  createInitialTripContext,
  fetchCaptainTripDetail,
  getActiveWaypoint,
  getCaptainTripPhaseUi,
  getTimelineTitleForPhase,
  isSupabaseReady,
  type CaptainTripContext,
  type TripWaypoint,
  updateCaptainTripStatus,
} from "@luffa/shared";
import { CancelOrderButton } from "@/components/CancelOrderButton";
import { OrderContactCard, alertMissingContact } from "@/components/OrderContactCard";
import { AppHeader, StackScreenLayout } from "@/components/layout";
import type { OrderContact } from "@luffa/shared";
import { AppMapView, MapMarker, hasNativeMapModule } from "@/components/maps/AppMapView";
import { CaptainTripPhasePanel } from "@/components/captain/CaptainTripPhasePanel";
import type { CaptainStackParamList } from "@/navigation/CaptainNavigator";
import { useCaptainOps } from "@/hooks/useCaptainOps";
import { openExternalMaps } from "@/lib/openExternalMaps";
import { regionForCoordinates, resolveLocationCoords } from "@/shared/mapSpots";
import { useAppState } from "@/state/AppStateContext";
import { captainMock } from "@/services/captainMock";
import { colors } from "@/theme/tokens";
import { textPresets } from "@/theme/textStyles";

type Props = NativeStackScreenProps<CaptainStackParamList, "CaptainActiveTrip">;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function enrichWaypoint(w: TripWaypoint): TripWaypoint {
  const resolved = resolveLocationCoords(w.label, w.lat, w.lng);
  if (!resolved) return w;
  return { ...w, lat: w.lat ?? resolved.latitude, lng: w.lng ?? resolved.longitude };
}

function coordFromWaypoint(w: TripWaypoint): { latitude: number; longitude: number } | null {
  return resolveLocationCoords(w.label, w.lat, w.lng);
}

export function CaptainActiveTripScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { completeTrip, loading } = useCaptainOps();
  const orderId = route.params.orderId;
  const [ctx, setCtx] = useState<CaptainTripContext | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [captainLatLng, setCaptainLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [riderContact, setRiderContact] = useState<OrderContact | null>(null);

  useEffect(() => {
    void (async () => {
      setLoadError(null);
      if (isSupabaseReady()) {
        try {
          const detail = await fetchCaptainTripDetail(orderId);
          if (!detail) {
            setLoadError("تعذّر تحميل تفاصيل الرحلة. قد يكون الطلب غير متاح.");
            return;
          }
          const { order, timelineTitles } = detail;
          const total = Number(order.total_sar ?? order.price_sar ?? 0);
          setRiderContact(detail.rider);
          const pickup = enrichWaypoint({
            label: order.from_location,
            lat: order.pickup_lat,
            lng: order.pickup_lng,
          });
          const destination = enrichWaypoint({
            label: order.to_location,
            lat: order.dropoff_lat,
            lng: order.dropoff_lng,
          });
          setCtx(
            createInitialTripContext({
              pickup,
              destination,
              intermediateStops: [],
              statusLabel: order.status_label,
              orderStatus: order.status,
              totalSar: total || undefined,
              captainNet: total ? computeCaptainNet(total) : undefined,
              timelineTitles,
            }),
          );
        } catch {
          setLoadError("تعذّر تحميل تفاصيل الرحلة. تحقق من الاتصال وحاول مرة أخرى.");
        }
      } else {
        const offer = captainMock.getActiveOffer();
        if (!offer) {
          setLoadError("لا توجد رحلة نشطة.");
          return;
        }
        const total = offer.fareTotal;
        setRiderContact({ id: "mock-rider", name: "أحمد الراكب", phone: "+966501234567" });
        setCtx(
          createInitialTripContext({
            pickup: enrichWaypoint({
              label: offer.from,
              lat: offer.pickupLat,
              lng: offer.pickupLng,
            }),
            destination: enrichWaypoint({
              label: offer.to,
              lat: offer.dropoffLat,
              lng: offer.dropoffLng,
            }),
            intermediateStops: offer.intermediateStops ?? [],
            statusLabel: CAPTAIN_TRIP_STATUS_LABELS.confirmed,
            totalSar: total,
            captainNet: offer.captainNet,
          }),
        );
      }
    })();
  }, [orderId]);

  const activeWaypoint = ctx ? getActiveWaypoint(ctx) : null;
  const mapCoord = activeWaypoint ? coordFromWaypoint(activeWaypoint) : null;
  const pickupCoord = ctx ? coordFromWaypoint(ctx.pickup) : null;
  const destCoord = ctx ? coordFromWaypoint(ctx.destination) : null;

  const distanceHint = useMemo(() => {
    if (!ctx || !captainLatLng || !mapCoord) return undefined;
    const km = haversineKm(captainLatLng.lat, captainLatLng.lng, mapCoord.latitude, mapCoord.longitude);
    const mins = Math.max(1, Math.round(km * 3));
    return `تقريباً ${km.toFixed(1)} كم · ${mins} د`;
  }, [ctx, captainLatLng, mapCoord]);

  useEffect(() => {
    if (pickupCoord) {
      setCaptainLatLng({ lat: pickupCoord.latitude + 0.012, lng: pickupCoord.longitude - 0.008 });
    }
  }, [pickupCoord?.latitude, pickupCoord?.longitude]);

  const region = useMemo(() => {
    const points = [pickupCoord, destCoord, mapCoord].filter(Boolean) as { latitude: number; longitude: number }[];
    return regionForCoordinates(points);
  }, [pickupCoord, destCoord, mapCoord]);

  const openMaps = useCallback(() => {
    if (!activeWaypoint) return;
    const coord = coordFromWaypoint(activeWaypoint);
    void openExternalMaps({
      latitude: coord?.latitude,
      longitude: coord?.longitude,
      label: activeWaypoint.label,
    });
  }, [activeWaypoint]);

  const persistPhase = async (next: CaptainTripContext) => {
    if (isSupabaseReady()) {
      await updateCaptainTripStatus(
        orderId,
        CAPTAIN_TRIP_STATUS_LABELS[next.phase],
        getTimelineTitleForPhase(next.phase, next),
      );
    }
  };

  const handlePrimary = async () => {
    if (!ctx || actionLoading || loading) return;
    const ui = getCaptainTripPhaseUi(ctx);

    if (ctx.phase === "completed") {
      navigation.navigate("CaptainTabs");
      return;
    }

    if (ctx.phase === "arrived_dropoff") {
      setActionLoading(true);
      try {
        if (ui.vibrateOnPrimary) Vibration.vibrate(40);
        await completeTrip(orderId);
        setCtx((c) => (c ? { ...c, phase: "completed" } : c));
      } finally {
        setActionLoading(false);
      }
      return;
    }

    setActionLoading(true);
    try {
      if (ui.vibrateOnPrimary) Vibration.vibrate([0, 50, 40, 50]);
      const next = advanceCaptainTripPhase(ctx);
      await persistPhase(next);
      setCtx(next);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSecondary = () => {
    if (!ctx) return;
    const ui = getCaptainTripPhaseUi(ctx);
    if (ctx.phase === "completed") {
      navigation.navigate("CaptainOrderDetails", { orderId });
      return;
    }
    if (ui.secondaryCta) openMaps();
  };

  const busy = loading || actionLoading;

  return (
    <StackScreenLayout
      header={<AppHeader title="رحلة نشطة" onBack={() => navigation.goBack()} />}
      contentContainerStyle={{ gap: 16, paddingBottom: insets.bottom + 16 }}
    >
      {loadError ? (
        <View
          style={{
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.destructive,
            backgroundColor: `${colors.destructive}12`,
            gap: 8,
          }}
        >
          <Text style={[textPresets.body, { textAlign: "right", color: colors.destructive }]}>{loadError}</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={[textPresets.bodySm, { color: colors.primary, textAlign: "center" }]}>العودة للرئيسية</Text>
          </Pressable>
        </View>
      ) : null}

      {ctx ? (
        <OrderContactCard
          title="العميل"
          contact={riderContact ?? { id: "unknown", name: "عميل", phone: null }}
          onChat={() => {
            if (!riderContact) {
              alertMissingContact("rider");
              return;
            }
            navigation.navigate("CaptainChat", {
              orderId,
              peerName: riderContact.name,
              peerPhone: riderContact.phone,
            });
          }}
        />
      ) : null}

      {ctx && hasNativeMapModule && MapMarker ? (
        <View style={{ height: 220, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: colors.border }}>
          <AppMapView
            key={`${region.latitude}-${region.longitude}-${activeWaypoint?.label ?? ""}`}
            style={{ flex: 1 }}
            initialRegion={region}
          >
            {pickupCoord ? (
              <MapMarker coordinate={pickupCoord}>
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: colors.success,
                    borderWidth: 2,
                    borderColor: "#fff",
                  }}
                />
              </MapMarker>
            ) : null}
            {destCoord ? (
              <MapMarker coordinate={destCoord}>
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: colors.primary,
                    borderWidth: 2,
                    borderColor: "#fff",
                  }}
                />
              </MapMarker>
            ) : null}
            {mapCoord &&
            mapCoord.latitude !== pickupCoord?.latitude &&
            mapCoord.latitude !== destCoord?.latitude ? (
              <MapMarker coordinate={mapCoord}>
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: colors.warning,
                    borderWidth: 2,
                    borderColor: "#fff",
                  }}
                />
              </MapMarker>
            ) : null}
          </AppMapView>
        </View>
      ) : null}

      {ctx ? (
        <CaptainTripPhasePanel
          ctx={ctx}
          distanceHint={distanceHint}
          loading={busy}
          onPrimary={() => void handlePrimary()}
          onSecondary={handleSecondary}
        />
      ) : null}

      {ctx && canCancelTripPhase(ctx.phase) ? (
        <CancelOrderButton
          orderId={orderId}
          status="active"
          statusLabel={CAPTAIN_TRIP_STATUS_LABELS[ctx.phase]}
          compact
          onCancelled={() => {
            setCaptainActiveOrderId(null);
            void refreshActive();
            void refreshOffers();
            navigation.navigate("CaptainTabs");
          }}
        />
      ) : null}
    </StackScreenLayout>
  );
}

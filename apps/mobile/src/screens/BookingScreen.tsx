import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Car, Clock, MapPinned, Navigation, Package, Pencil, Truck } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import {
  calculateTripFare,
  fetchServicePricingMap,
  type ServiceType,
  useCurrency,
} from "@luffa/shared";
import { ServiceWaitIndicator } from "@/components/ServiceWaitIndicator";
import { AppHeader, PrimaryButton, StackScreenLayout } from "@/components/layout";
import type { AppStackParamList } from "@/navigation/types";
import { useStackBack } from "@/navigation/useStackBack";
import { useAppState } from "@/state/AppStateContext";
import { redirectToAuth, requiresAuth } from "@/lib/authGate";
import { colors } from "@/theme/tokens";
import { textPresets } from "@/theme/textStyles";

type ServiceKey = ServiceType;

type ServiceOpt = {
  key: ServiceKey;
  label: string;
  shortLabel: string;
  fare: number;
  Icon: typeof Car;
};

const serviceOptions: ServiceOpt[] = [
  { key: "regular", label: "صغيرة", shortLabel: "صغيرة", fare: 25, Icon: Car },
  { key: "premium", label: "فارهة", shortLabel: "فارهة", fare: 45, Icon: Car },
  { key: "family", label: "عائلية", shortLabel: "عائلية", fare: 55, Icon: Car },
  { key: "bike", label: "دراجة", shortLabel: "دراجة", fare: 18, Icon: Navigation },
  { key: "cargo", label: "بضائع", shortLabel: "بضائع", fare: 70, Icon: Package },
  { key: "tow", label: "سطحة", shortLabel: "سطحة", fare: 95, Icon: Truck },
];

type Props = NativeStackScreenProps<AppStackParamList, "Booking">;

export function BookingScreen({ navigation, route }: Props) {
  const { bookingDraft, setBookingDraft, isLoggedIn, setPendingAuth } = useAppState();
  const { format } = useCurrency();
  const onBack = useStackBack("MainTabs");

  const [serviceType, setServiceType] = useState<ServiceKey>("regular");
  const [now, setNow] = useState(true);
  const [bags, setBags] = useState(false);
  const [roundTrip, setRoundTrip] = useState(false);
  const [distanceKm] = useState(5);
  const [waitMinutes] = useState(0);
  const [pickup, setPickup] = useState("حي النخيل");
  const [stops, setStops] = useState<string[]>([]);
  const [destination, setDestination] = useState("");

  const { data: pricingMap } = useQuery({
    queryKey: ["service-pricing"],
    queryFn: fetchServicePricingMap,
  });

  useEffect(() => {
    const svc = route.params?.service;
    if (
      svc === "regular" ||
      svc === "premium" ||
      svc === "family" ||
      svc === "bike" ||
      svc === "cargo" ||
      svc === "tow"
    ) {
      setServiceType(svc);
      return;
    }
    if (bookingDraft.serviceType) setServiceType(bookingDraft.serviceType);
  }, [route.params?.service, bookingDraft.serviceType]);

  useEffect(() => {
    const p = route.params;
    if (p?.pickup?.trim()) setPickup(p.pickup.trim());
    if (p?.scheduleNow !== undefined) setNow(p.scheduleNow);
    if (p?.destination?.trim()) setDestination(p.destination.trim());
    if (p?.stops?.length) setStops(p.stops.map((s) => s.trim()).filter(Boolean));
  }, [route.params?.pickup, route.params?.destination, route.params?.stops, route.params?.scheduleNow]);

  const pricing = pricingMap?.[serviceType];
  const hasValidDestination = destination.trim().length > 0;
  const isPassengerRide = serviceType !== "cargo" && serviceType !== "tow";

  const routePoints = useMemo(() => {
    const points: { key: string; label: string; value: string; dot: "pickup" | "stop" | "dest" }[] = [
      { key: "pickup", label: "من", value: pickup, dot: "pickup" },
    ];
    stops.forEach((s, i) => {
      if (s.trim()) points.push({ key: `stop-${i}`, label: `توقف ${i + 1}`, value: s, dot: "stop" });
    });
    points.push({ key: "dest", label: "إلى", value: destination, dot: "dest" });
    return points;
  }, [pickup, stops, destination]);

  const editRoute = () => {
    navigation.navigate("PlanRide", {
      service: serviceType,
      pickup: pickup.trim(),
      destination: destination.trim(),
      stops: stops.filter((s) => s.trim()),
    });
  };

  const totals = useMemo(() => {
    const extraStops = stops.filter((s) => s.trim()).length * 4;
    const extras = (bags ? 5 : 0) + (roundTrip ? 40 : 0) + extraStops;
    if (!pricing) {
      const base = serviceOptions.find((s) => s.key === serviceType)?.fare ?? 25;
      const discount = Math.round((base + extras) * 0.2 * 100) / 100;
      const vat = Math.round((base + extras - discount) * 0.15 * 100) / 100;
      return {
        base,
        extras,
        discount,
        vat,
        total: Math.round((base + extras - discount + vat) * 100) / 100,
      };
    }
    const breakdown = calculateTripFare(pricing, { distanceKm, waitMinutes, extrasSar: extras });
    const beforeTax = breakdown.total;
    const discount = Math.round(beforeTax * 0.2 * 100) / 100;
    const vat = Math.round((beforeTax - discount) * 0.15 * 100) / 100;
    return {
      base: breakdown.doorFee + breakdown.kmCharge + breakdown.waitCharge,
      extras: breakdown.extras,
      discount,
      vat,
      total: Math.round((beforeTax - discount + vat) * 100) / 100,
    };
  }, [pricing, serviceType, bags, roundTrip, stops, distanceKm, waitMinutes]);

  const bookingTitle =
    serviceType === "cargo" ? "طلب نقل بضائع" : serviceType === "tow" ? "طلب سطحة" : "حجز رحلة";
  const continueLabel =
    serviceType === "cargo"
      ? "متابعة تفاصيل الشحنة"
      : serviceType === "tow"
        ? "متابعة تفاصيل السطحة"
        : `تأكيد الرحلة · ${format(totals.total)}`;

  const onContinue = () => {
    if (!hasValidDestination) return;
    if (requiresAuth() && !isLoggedIn) {
      redirectToAuth(navigation, setPendingAuth, "rider", "login", isLoggedIn);
      return;
    }
    const finalDestination = destination.trim() || "مطار الملك خالد الدولي";
    setBookingDraft({
      serviceType,
      baseFare: totals.base,
      extrasTotal: totals.extras,
      discount: totals.discount,
      vat: totals.vat,
      total: totals.total,
      from: pickup.trim() || "موقعي الحالي",
      to: finalDestination,
    });
    const routeParams = {
      pickup: pickup.trim() || "موقعي الحالي",
      destination: finalDestination,
    };
    if (serviceType === "cargo") {
      navigation.navigate("CargoRequest", routeParams);
      return;
    }
    if (serviceType === "tow") {
      navigation.navigate("TowRequest", routeParams);
      return;
    }
    navigation.navigate("Checkout");
  };

  return (
    <StackScreenLayout
        header={<AppHeader title={bookingTitle} onBack={onBack} />}
        footer={
          <PrimaryButton
            label={continueLabel}
            onPress={onContinue}
            disabled={!hasValidDestination}
          />
        }
        contentContainerStyle={{ paddingTop: 8, gap: 0, paddingBottom: 8 }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 4,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: "#1a1323",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <View style={{ alignItems: "center", paddingTop: 20, paddingBottom: 12, width: 16 }}>
              {routePoints.map((point, idx) => (
                <View key={point.key} style={{ alignItems: "center", flex: idx < routePoints.length - 1 ? 1 : 0 }}>
                  {point.dot === "pickup" ? (
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success }} />
                  ) : point.dot === "stop" ? (
                    <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: colors.mutedForeground }} />
                  ) : (
                    <View style={{ width: 10, height: 10, backgroundColor: colors.primary }} />
                  )}
                  {idx < routePoints.length - 1 ? (
                    <View style={{ width: 2, flex: 1, minHeight: 20, backgroundColor: colors.border, marginVertical: 4 }} />
                  ) : null}
                </View>
              ))}
            </View>

            <View style={{ flex: 1 }}>
              {routePoints.map((point, idx) => (
                <View
                  key={point.key}
                  style={{
                    paddingVertical: 14,
                    borderBottomWidth: idx < routePoints.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text style={[textPresets.caption, { marginBottom: 4, textAlign: "right" }]}>{point.label}</Text>
                  <Text style={[textPresets.body, { textAlign: "right" }]}>{point.value.trim() || "—"}</Text>
                </View>
              ))}
            </View>
          </View>

          <Pressable
            onPress={editRoute}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              paddingVertical: 12,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              marginTop: 4,
            }}
          >
            <Pencil size={16} color={colors.primary} />
            <Text style={[textPresets.bodySm, { color: colors.primary }]}>تعديل المسار والتوقفات</Text>
            <MapPinned size={16} color={colors.primary} />
          </Pressable>
        </View>

        {/* Service category — read-only; change on home */}
        {(() => {
          const selected = serviceOptions.find((s) => s.key === serviceType) ?? serviceOptions[0];
          const Icon = selected.Icon;
          return (
            <View
              style={{
                marginTop: 8,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 14,
                gap: 8,
              }}
            >
              <Text style={[textPresets.labelMuted, { textAlign: "right" }]}>فئة الرحلة</Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[textPresets.body, { fontFamily: textPresets.title.fontFamily }]}>{selected.label}</Text>
                  <Text style={[textPresets.caption, { color: colors.mutedForeground, marginTop: 2 }]}>
                    {selected.fare} ر.س
                  </Text>
                </View>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: `${colors.primary}14`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon width={22} height={22} color={colors.primary} strokeWidth={1.75} />
                </View>
              </View>
              <ServiceWaitIndicator service={serviceType} />
            </View>
          );
        })()}

        {/* When — passenger rides; freight uses schedule on detail form */}
        {isPassengerRide ? (
          <View style={{ flexDirection: "row", gap: 8, marginTop: 20, marginBottom: 4 }}>
            <Pressable
              onPress={() => setNow(true)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 999,
                borderWidth: now ? 0 : 1,
                borderColor: colors.border,
                backgroundColor: now ? colors.primary : colors.secondary,
                alignItems: "center",
              }}
            >
              <Text style={[textPresets.bodySm, { color: now ? colors.primaryForeground : colors.foreground }]}>الآن</Text>
            </Pressable>
            <Pressable
              onPress={() => setNow(false)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 999,
                borderWidth: !now ? 0 : 1,
                borderColor: colors.border,
                backgroundColor: !now ? colors.primary : colors.secondary,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Clock width={14} height={14} color={!now ? colors.primaryForeground : colors.primary} />
              <Text style={[textPresets.bodySm, { color: !now ? colors.primaryForeground : colors.foreground }]}>جدولة</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Ride-only extras */}
        {isPassengerRide ? (
        <View style={{ marginTop: 24, gap: 0 }}>
          {[
            { label: "حقائب إضافية", active: bags, toggle: () => setBags((v) => !v) },
            { label: "ذهاب وعودة", active: roundTrip, toggle: () => setRoundTrip((v) => !v) },
          ].map((item, i) => (
            <Pressable
              key={item.label}
              onPress={item.toggle}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 16,
                borderTopWidth: i === 0 ? 1 : 0,
                borderBottomWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={textPresets.body}>{item.label}</Text>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: 2,
                  borderColor: item.active ? colors.primary : colors.border,
                  backgroundColor: item.active ? colors.primary : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.active ? (
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primaryForeground }} />
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
        ) : null}
    </StackScreenLayout>
  );
}

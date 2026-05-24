import { useEffect, useMemo, useRef, useState } from "react";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Briefcase,
  Clock,
  Home,
  MapPin,
  MapPinned,
  Plane,
  Plus,
  X,
  Zap,
} from "lucide-react-native";
import {
  I18nManager,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPickerSheet, type MapFieldKind } from "@/components/planRide/MapPickerSheet";
import { PrimaryButton } from "@/components/layout";
import type { AppStackParamList } from "@/navigation/types";
import { useStackBack } from "@/navigation/useStackBack";
import { DEFAULT_PICKUP, getRecentPlaces, type RecentPlace } from "@/shared/recentLocations";
import { spotForLabel } from "@/shared/mapSpots";
import { useAppState } from "@/state/AppStateContext";
import { colors } from "@/theme/tokens";
import { fonts, ltrText, rtlText, textPresets } from "@/theme/textStyles";

type Props = NativeStackScreenProps<AppStackParamList, "PlanRide">;

type FieldKey = "pickup" | "destination" | `stop-${number}`;
type ScheduleMode = "now" | "later";

const inputStyle = {
  fontFamily: fonts.arabic,
  fontSize: 15,
  color: colors.foreground,
  padding: 0,
  minHeight: 22,
  textAlign: "right" as const,
};

function placeIcon(kind: RecentPlace["kind"]) {
  if (kind === "home") return Home;
  if (kind === "work") return Briefcase;
  if (kind === "airport") return Plane;
  return Clock;
}

function scheduleSegmentIndex(m: ScheduleMode): number {
  return m === "now" ? 0 : 1;
}

function segmentTranslateX(segmentIndex: number, trackWidth: number): number {
  "worklet";
  const pad = 4;
  const segmentW = Math.max(0, (trackWidth - pad * 2) / 2);
  // DOM order: 0 = الآن, 1 = جدولة — in RTL, index 0 sits on the right
  const visualIndex = I18nManager.isRTL ? 1 - segmentIndex : segmentIndex;
  return pad + visualIndex * segmentW;
}

function ScheduleToggle({ mode, onChange }: { mode: ScheduleMode; onChange: (m: ScheduleMode) => void }) {
  const pillIndex = useSharedValue(scheduleSegmentIndex(mode));

  useEffect(() => {
    pillIndex.value = withSpring(scheduleSegmentIndex(mode), { damping: 18, stiffness: 220 });
  }, [mode, pillIndex]);

  const [trackWidth, setTrackWidth] = useState(0);
  const pad = 4;
  const segmentW = Math.max(0, (trackWidth - pad * 2) / 2);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: segmentTranslateX(pillIndex.value, trackWidth) }],
    width: segmentW,
  }));

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => {
        setTrackWidth(e.nativeEvent.layout.width);
      }}
      style={{
        flexDirection: "row",
        backgroundColor: colors.secondary,
        borderRadius: 16,
        padding: pad,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {trackWidth > 0 ? (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: pad,
              left: 0,
              bottom: pad,
              borderRadius: 12,
              backgroundColor: colors.primary,
            },
            pillStyle,
          ]}
        />
      ) : null}
      {(
        [
          { key: "now" as const, label: "الآن", Icon: Zap },
          { key: "later" as const, label: "جدولة", Icon: Clock },
        ] as const
      ).map(({ key, label, Icon }) => {
        const active = mode === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, zIndex: 1 }}
          >
            <Icon size={16} color={active ? colors.primaryForeground : colors.mutedForeground} />
            <Text
              style={{
                fontFamily: active ? fonts.arabicBold : fonts.arabic,
                fontSize: 14,
                color: active ? colors.primaryForeground : colors.foreground,
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function PlanRideScreen({ navigation, route }: Props) {
  const onBack = useStackBack("MainTabs");
  const { bookingDraft, setBookingDraft } = useAppState();
  const insets = useSafeAreaInsets();
  const recentPlaces = useMemo(() => getRecentPlaces(), []);

  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("now");
  const [scheduledAt, setScheduledAt] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [pickup, setPickup] = useState(route.params?.pickup?.trim() || DEFAULT_PICKUP);
  const [stops, setStops] = useState<string[]>(route.params?.stops ?? []);
  const [destination, setDestination] = useState(route.params?.destination?.trim() ?? "");
  const [activeField, setActiveField] = useState<FieldKey>(
    route.params?.focusField ?? (route.params?.destination ? "destination" : "destination"),
  );
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [mapPickedFields, setMapPickedFields] = useState<Set<FieldKey>>(() => new Set());

  const destRef = useRef<TextInput>(null);
  const pickupRef = useRef<TextInput>(null);

  useEffect(() => {
    const stopIdx = route.params?.openMapForStopIndex;
    if (stopIdx == null || stopIdx < 0) return;
    setActiveField(`stop-${stopIdx}` as FieldKey);
    setMapPickerOpen(true);
  }, [route.params?.openMapForStopIndex]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (activeField === "destination") destRef.current?.focus();
      if (activeField === "pickup") pickupRef.current?.focus();
    }, 400);
    return () => clearTimeout(t);
  }, [activeField]);

  const fieldLabel = useMemo(() => {
    if (activeField === "pickup") return "نقطة الانطلاق";
    if (activeField === "destination") return "الوجهة";
    const idx = Number(activeField.replace("stop-", ""));
    return `توقف ${idx + 1}`;
  }, [activeField]);

  const activeFieldKind = useMemo((): MapFieldKind => {
    if (activeField === "pickup") return "pickup";
    if (activeField === "destination") return "destination";
    return "stop";
  }, [activeField]);

  const activeFieldValue = useMemo(() => {
    if (activeField === "pickup") return pickup;
    if (activeField === "destination") return destination;
    const idx = Number(activeField.replace("stop-", ""));
    return stops[idx] ?? "";
  }, [activeField, pickup, destination, stops]);

  const applyPlace = (title: string, fromMap = false) => {
    if (activeField === "pickup") setPickup(title);
    else if (activeField === "destination") setDestination(title);
    else {
      const idx = Number(activeField.replace("stop-", ""));
      setStops((prev) => prev.map((s, i) => (i === idx ? title : s)));
    }
    if (fromMap) {
      setMapPickedFields((prev) => new Set(prev).add(activeField));
    }
  };

  const clearMapPicked = (key: FieldKey) => {
    setMapPickedFields((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const fieldPinColor = (key: FieldKey) => {
    if (key === "pickup") return colors.success;
    if (key === "destination") return colors.primary;
    return colors.mutedForeground;
  };

  const addStop = () => {
    if (stops.length >= 2) return;
    const newIdx = stops.length;
    setStops((prev) => [...prev, ""]);
    const newField = `stop-${newIdx}` as FieldKey;
    setActiveField(newField);
    setMapPickerOpen(true);
  };

  const removeStop = (idx: number) => {
    setStops((prev) => prev.filter((_, i) => i !== idx));
    setActiveField("destination");
  };

  const canContinue = destination.trim().length > 0 && pickup.trim().length > 0;

  const onContinue = () => {
    const pickupLabel = pickup.trim();
    const destLabel = destination.trim();
    const pickupSpot = spotForLabel(pickupLabel);
    const destSpot = spotForLabel(destLabel);
    setBookingDraft({
      ...bookingDraft,
      from: pickupLabel,
      to: destLabel,
      pickupLat: pickupSpot?.latitude,
      pickupLng: pickupSpot?.longitude,
      dropoffLat: destSpot?.latitude,
      dropoffLng: destSpot?.longitude,
    });
    navigation.navigate("Booking", {
      service: route.params?.service,
      pickup: pickupLabel,
      destination: destLabel,
      stops: stops.filter((s) => s.trim()),
      scheduleNow: scheduleMode === "now",
      scheduledAt: scheduleMode === "later" ? scheduledAt.toISOString() : undefined,
    });
  };

  const onDateChange = (_: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (date) setScheduledAt((prev) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), prev.getHours(), prev.getMinutes()));
  };

  const onTimeChange = (_: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") setShowTimePicker(false);
    if (date) setScheduledAt((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), date.getHours(), date.getMinutes()));
  };

  const routeRows: { key: FieldKey; label: string; value: string; dot: "pickup" | "stop" | "dest"; onChange: (t: string) => void; ref?: React.RefObject<TextInput | null> }[] = [
    {
      key: "pickup",
      label: "من",
      value: pickup,
      dot: "pickup",
      onChange: setPickup,
      ref: pickupRef,
    },
    ...stops.map((s, idx) => ({
      key: `stop-${idx}` as FieldKey,
      label: `توقف ${idx + 1}`,
      value: s,
      dot: "stop" as const,
      onChange: (t: string) => setStops((prev) => prev.map((x, i) => (i === idx ? t : x))),
    })),
    {
      key: "destination",
      label: "إلى",
      value: destination,
      dot: "dest",
      onChange: setDestination,
      ref: destRef,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12 }}>
        <Animated.View entering={FadeIn.duration(280)} style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
          <Pressable onPress={onBack} hitSlop={12} style={{ padding: 8, marginStart: -8 }}>
            <X size={22} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1, alignItems: "center", marginEnd: 30 }}>
            <Text style={[textPresets.title, { fontSize: 20 }]}>خطّط رحلتك</Text>
            <Text style={[textPresets.caption, { color: colors.mutedForeground, marginTop: 2 }]}>الآن أو لاحقاً · توقفات متعددة</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <ScheduleToggle mode={scheduleMode} onChange={setScheduleMode} />
        </Animated.View>

        {scheduleMode === "later" ? (
          <Animated.View entering={FadeInDown.delay(120).duration(350)} style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                alignItems: "center",
              }}
            >
              <Text style={textPresets.caption}>التاريخ</Text>
              <Text style={[textPresets.bodySm, ltrText]}>
                {scheduledAt.toLocaleDateString("ar-SA", { day: "numeric", month: "short" })}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShowTimePicker(true)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                alignItems: "center",
              }}
            >
              <Text style={textPresets.caption}>الوقت</Text>
              <Text style={[textPresets.bodySm, ltrText]}>
                {scheduledAt.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </Pressable>
          </Animated.View>
        ) : null}
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(140).duration(420)}
          style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 14,
            paddingVertical: 6,
            shadowColor: "#1a1323",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 20,
            elevation: 4,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "stretch" }}>
            <View style={{ width: 20, alignItems: "center", paddingTop: 20, paddingBottom: 12 }}>
              {routeRows.map((row, idx) => (
                <View key={row.key} style={{ alignItems: "center", flex: idx < routeRows.length - 1 ? 1 : 0 }}>
                  {row.dot === "pickup" ? (
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success }} />
                  ) : row.dot === "stop" ? (
                    <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: colors.mutedForeground }} />
                  ) : (
                    <View style={{ width: 10, height: 10, backgroundColor: colors.primary }} />
                  )}
                  {idx < routeRows.length - 1 ? (
                    <View style={{ width: 2, flex: 1, minHeight: 24, backgroundColor: colors.border, marginVertical: 4 }} />
                  ) : null}
                </View>
              ))}
            </View>

            <View style={{ flex: 1 }}>
              {routeRows.map((row, idx) => {
                const focused = activeField === row.key;
                const isStop = row.key.startsWith("stop-");
                const stopIdx = isStop ? Number(row.key.replace("stop-", "")) : -1;
                const fromMap = mapPickedFields.has(row.key);
                const pinColor = fieldPinColor(row.key);
                return (
                  <View
                    key={row.key}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderBottomWidth: idx < routeRows.length - 1 ? 1 : 0,
                      borderBottomColor: colors.border,
                      backgroundColor: focused ? `${pinColor}10` : fromMap ? `${pinColor}06` : "transparent",
                      marginHorizontal: -6,
                      paddingHorizontal: 6,
                      borderRadius: focused || fromMap ? 10 : 0,
                      borderWidth: fromMap ? 1 : 0,
                      borderColor: fromMap ? `${pinColor}55` : "transparent",
                    }}
                  >
                    <Pressable
                      onPress={() => {
                        setActiveField(row.key);
                        setMapPickerOpen(true);
                      }}
                      hitSlop={8}
                      style={{ padding: 8 }}
                      accessibilityLabel={`خريطة ${row.label}`}
                    >
                      <MapPinned size={18} color={fromMap ? pinColor : colors.mutedForeground} />
                    </Pressable>
                    <Pressable style={{ flex: 1, paddingVertical: 14 }} onPress={() => setActiveField(row.key)}>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 6, marginBottom: 4 }}>
                        {fromMap ? (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 4,
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                              borderRadius: 999,
                              backgroundColor: `${pinColor}18`,
                            }}
                          >
                            <MapPin size={10} color={pinColor} />
                            <Text style={[textPresets.caption, { color: pinColor, fontSize: 10, fontFamily: fonts.arabicBold }]}>
                              من الخريطة
                            </Text>
                          </View>
                        ) : null}
                        <Text style={[textPresets.caption, { color: colors.mutedForeground }]}>{row.label}</Text>
                      </View>
                      <TextInput
                        ref={row.ref}
                        value={row.value}
                        onChangeText={(t) => {
                          row.onChange(t);
                          clearMapPicked(row.key);
                        }}
                        onFocus={() => setActiveField(row.key)}
                        placeholder={
                          row.key === "destination" ? "إلى أين؟" : row.key === "pickup" ? "نقطة الانطلاق" : "عنوان التوقف"
                        }
                        placeholderTextColor={colors.mutedForeground}
                        style={[inputStyle, (focused || fromMap) && { color: pinColor }]}
                      />
                    </Pressable>
                    {isStop ? (
                      <Pressable onPress={() => removeStop(stopIdx)} hitSlop={8} style={{ padding: 8 }}>
                        <X size={16} color={colors.mutedForeground} />
                      </Pressable>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {stops.length < 2 ? (
          <Animated.View entering={FadeInDown.delay(180).duration(350)} style={{ gap: 8 }}>
            <Pressable
              onPress={addStop}
              style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 14, paddingHorizontal: 4 }}
            >
              <Plus size={18} color={colors.primary} />
              <Text style={[textPresets.bodySm, { color: colors.primary }]}>إضافة توقف</Text>
            </Pressable>
            <Text style={[textPresets.caption, { textAlign: "right", color: colors.mutedForeground, paddingHorizontal: 4 }]}>
              يفتح اختيار الموقع على الخريطة مباشرة لكل توقف
            </Text>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(200).duration(350)}>
          <Pressable
            onPress={() => setMapPickerOpen(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginTop: 8,
              padding: 14,
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: fieldPinColor(activeField),
              backgroundColor: `${fieldPinColor(activeField)}12`,
            }}
          >
            <MapPinned size={20} color={fieldPinColor(activeField)} />
            <View style={{ flex: 1 }}>
              <Text style={[textPresets.bodySm, { fontFamily: fonts.arabicBold, color: fieldPinColor(activeField) }]}>
                اختر {fieldLabel} على الخريطة
              </Text>
              <Text style={[textPresets.caption, { color: colors.mutedForeground, marginTop: 2, textAlign: "right" }]}>
                اضغط على الخريطة لوضع الدبوس · أخضر للانطلاق · بنفسجي للوجهة
              </Text>
            </View>
          </Pressable>
        </Animated.View>

        <Text style={[textPresets.labelMuted, { marginTop: 24, marginBottom: 10 }]}>المواقع الأخيرة</Text>
        {recentPlaces.map((place, index) => {
          const Icon = placeIcon(place.kind);
          return (
            <Animated.View key={place.id} entering={FadeInDown.delay(220 + index * 45).duration(380)}>
              <Pressable
                onPress={() => applyPlace(place.title)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: colors.secondary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[textPresets.body, { textAlign: "right" }]}>{place.title}</Text>
                  <Text style={[textPresets.caption, { color: colors.mutedForeground, textAlign: "right", marginTop: 2 }]}>
                    {place.subtitle}
                  </Text>
                </View>
                <MapPin size={16} color={colors.mutedForeground} />
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: insets.bottom + 12,
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <PrimaryButton label="متابعة للحجز" onPress={onContinue} disabled={!canContinue} />
      </View>

      <MapPickerSheet
        visible={mapPickerOpen}
        fieldLabel={fieldLabel}
        fieldKind={activeFieldKind}
        initialLabel={activeFieldValue}
        onClose={() => setMapPickerOpen(false)}
        onConfirm={(label) => applyPlace(label, true)}
      />

      {showDatePicker ? (
        <DateTimePicker value={scheduledAt} mode="date" display="default" onChange={onDateChange} minimumDate={new Date()} />
      ) : null}
      {showTimePicker ? (
        <DateTimePicker value={scheduledAt} mode="time" display="default" onChange={onTimeChange} />
      ) : null}
    </View>
  );
}

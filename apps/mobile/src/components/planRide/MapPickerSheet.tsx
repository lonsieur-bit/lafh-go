import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { AppMapView, MapMarker, hasNativeMapModule } from "@/components/maps/AppMapView";
import { MapPin, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DEFAULT_MAP_REGION,
  labelForCoordinate,
  RIYADH_MAP_SPOTS,
  spotForLabel,
  type MapSpot,
} from "@/shared/mapSpots";
import { colors } from "@/theme/tokens";
import { fonts, textPresets } from "@/theme/textStyles";

const hasNativeMap = hasNativeMapModule;

export type MapFieldKind = "pickup" | "destination" | "stop";

type Props = {
  visible: boolean;
  fieldLabel: string;
  fieldKind: MapFieldKind;
  initialLabel?: string;
  onClose: () => void;
  onConfirm: (label: string, coordinate: { latitude: number; longitude: number }) => void;
};

function pinColor(kind: MapFieldKind): string {
  if (kind === "pickup") return colors.success;
  if (kind === "destination") return colors.primary;
  return colors.mutedForeground;
}

function PinMarker({ kind, size = 40 }: { kind: MapFieldKind; size?: number }) {
  const color = pinColor(kind);
  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 3,
          borderColor: colors.card,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <MapPin size={size * 0.45} color={colors.primaryForeground} />
      </View>
      <View
        style={{
          width: 4,
          height: 10,
          backgroundColor: color,
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
          marginTop: -2,
        }}
      />
    </View>
  );
}

export function MapPickerSheet({
  visible,
  fieldLabel,
  fieldKind,
  initialLabel,
  onClose,
  onConfirm,
}: Props) {
  const insets = useSafeAreaInsets();
  const initialSpot = useMemo(() => (initialLabel ? spotForLabel(initialLabel) : undefined), [initialLabel]);

  const [selected, setSelected] = useState<MapSpot | null>(null);
  const [tapCoord, setTapCoord] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!visible) return;
    if (initialSpot) {
      setSelected(initialSpot);
      setTapCoord({ latitude: initialSpot.latitude, longitude: initialSpot.longitude });
    } else {
      const fallback = RIYADH_MAP_SPOTS[0];
      setSelected(fallback);
      setTapCoord({ latitude: fallback.latitude, longitude: fallback.longitude });
    }
  }, [visible, initialSpot]);

  const displayLabel = selected?.label ?? (tapCoord ? labelForCoordinate(tapCoord.latitude, tapCoord.longitude) : "");
  const markerCoord = tapCoord ?? (selected ? { latitude: selected.latitude, longitude: selected.longitude } : null);

  const selectSpot = (spot: MapSpot) => {
    setSelected(spot);
    setTapCoord({ latitude: spot.latitude, longitude: spot.longitude });
  };

  const onMapPress = (latitude: number, longitude: number) => {
    setTapCoord({ latitude, longitude });
    const label = labelForCoordinate(latitude, longitude);
    const match = RIYADH_MAP_SPOTS.find((s) => s.label === label);
    setSelected(match ?? null);
  };

  const confirm = () => {
    if (!markerCoord) return;
    const label = selected?.label ?? labelForCoordinate(markerCoord.latitude, markerCoord.longitude);
    onConfirm(label, markerCoord);
    onClose();
  };

  const kindHint =
    fieldKind === "pickup"
      ? "نقطة الانطلاق — دبوس أخضر"
      : fieldKind === "destination"
        ? "الوجهة — دبوس بنفسجي"
        : "توقف — دبوس رمادي";

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{
            paddingTop: insets.top + 8,
            paddingHorizontal: 16,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable onPress={onClose} hitSlop={12} style={{ padding: 8 }}>
              <X size={22} color={colors.foreground} />
            </Pressable>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={textPresets.title}>اختر من الخريطة</Text>
              <Text style={[textPresets.caption, { color: colors.mutedForeground, marginTop: 2 }]}>{fieldLabel}</Text>
              <Text style={[textPresets.caption, { color: pinColor(fieldKind), marginTop: 4, fontFamily: fonts.arabicBold }]}>
                {kindHint}
              </Text>
            </View>
            <View style={{ width: 38 }} />
          </View>
        </View>

        <View style={{ flex: 1, position: "relative" }}>
          {hasNativeMap && MapMarker && markerCoord ? (
            <AppMapView
              style={{ flex: 1 }}
              initialRegion={{
                ...DEFAULT_MAP_REGION,
                latitude: markerCoord.latitude,
                longitude: markerCoord.longitude,
              }}
              onPress={(e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                onMapPress(latitude, longitude);
              }}
            >
              <MapMarker
                coordinate={markerCoord}
                draggable
                onDragEnd={(e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  onMapPress(latitude, longitude);
                }}
              >
                <PinMarker kind={fieldKind} />
              </MapMarker>
            </AppMapView>
          ) : (
            <View style={{ flex: 1, backgroundColor: colors.secondary }}>
              {markerCoord ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                  <PinMarker kind={fieldKind} size={48} />
                  <Text style={[textPresets.caption, { marginTop: 16, textAlign: "center", paddingHorizontal: 24 }]}>
                    اختر موقعاً من القائمة أدناه أو استخدم الخريطة على جهازك
                  </Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Floating selected label */}
          {displayLabel ? (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 12,
                left: 16,
                right: 16,
                backgroundColor: colors.card,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: pinColor(fieldKind),
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                shadowColor: "#1a1323",
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <MapPin size={16} color={pinColor(fieldKind)} />
              <Text style={[textPresets.bodySm, { flex: 1, textAlign: "right", fontFamily: fonts.arabicBold }]} numberOfLines={2}>
                {displayLabel}
              </Text>
            </View>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}
          style={{ maxHeight: 56, borderTopWidth: 1, borderTopColor: colors.border }}
        >
          {RIYADH_MAP_SPOTS.map((spot) => {
            const active = selected?.id === spot.id;
            return (
              <Pressable
                key={spot.id}
                onPress={() => selectSpot(spot)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1.5,
                  borderColor: active ? pinColor(fieldKind) : colors.border,
                  backgroundColor: active ? `${pinColor(fieldKind)}18` : colors.card,
                }}
              >
                <Text
                  style={[
                    textPresets.caption,
                    active && { color: pinColor(fieldKind), fontFamily: fonts.arabicBold },
                  ]}
                >
                  {spot.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={{ padding: 16, paddingBottom: insets.bottom + 16, gap: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text style={[textPresets.caption, { textAlign: "center", color: colors.mutedForeground }]}>
            اضغط على الخريطة أو اسحب الدبوس · ثم أكّد
          </Text>
          <Pressable
            onPress={confirm}
            disabled={!markerCoord}
            style={{
              backgroundColor: markerCoord ? pinColor(fieldKind) : colors.muted,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              opacity: markerCoord ? 1 : 0.5,
            }}
          >
            <Text style={[textPresets.body, { color: colors.primaryForeground, fontFamily: fonts.arabicBold }]}>
              تأكيد {fieldLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

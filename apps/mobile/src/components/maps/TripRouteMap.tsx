import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { AppMapView, MapMarker, hasNativeMapModule } from "@/components/maps/AppMapView";
import { openExternalMaps } from "@/lib/openExternalMaps";
import { DEFAULT_MAP_REGION, regionForCoordinates, resolveLocationCoords } from "@/shared/mapSpots";
import { colors } from "@/theme/tokens";
import { fonts, textPresets } from "@/theme/textStyles";

type LocationInput = {
  label: string;
  lat?: number | null;
  lng?: number | null;
};

type Props = {
  pickup: LocationInput;
  destination: LocationInput;
  height?: number;
  highlight?: "pickup" | "destination" | "both";
  showOpenMaps?: boolean;
};

export function TripRouteMap({
  pickup,
  destination,
  height = 210,
  highlight = "both",
  showOpenMaps = true,
}: Props) {
  const pickupCoord = useMemo(
    () => resolveLocationCoords(pickup.label, pickup.lat, pickup.lng),
    [pickup.label, pickup.lat, pickup.lng],
  );
  const destCoord = useMemo(
    () => resolveLocationCoords(destination.label, destination.lat, destination.lng),
    [destination.label, destination.lat, destination.lng],
  );

  const region = useMemo(() => {
    const points = [pickupCoord, destCoord].filter(Boolean) as { latitude: number; longitude: number }[];
    return regionForCoordinates(points.length ? points : [{ latitude: DEFAULT_MAP_REGION.latitude, longitude: DEFAULT_MAP_REGION.longitude }]);
  }, [pickupCoord, destCoord]);

  const mapsTarget = useMemo(() => {
    if (highlight === "pickup" && pickupCoord) {
      return { ...pickupCoord, label: pickup.label };
    }
    if (highlight === "destination" && destCoord) {
      return { ...destCoord, label: destination.label };
    }
    if (pickupCoord) return { ...pickupCoord, label: pickup.label };
    if (destCoord) return { ...destCoord, label: destination.label };
    return { label: destination.label || pickup.label };
  }, [highlight, pickup, destination, pickupCoord, destCoord]);

  const mapKey = `${pickupCoord?.latitude ?? "p"}-${destCoord?.latitude ?? "d"}`;

  return (
    <View style={{ gap: 10 }}>
      {hasNativeMapModule && MapMarker ? (
        <View style={{ height, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: colors.border }}>
          <AppMapView key={mapKey} style={{ flex: 1 }} initialRegion={region}>
            {pickupCoord ? (
              <MapMarker coordinate={pickupCoord} title={pickup.label}>
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
              <MapMarker coordinate={destCoord} title={destination.label}>
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
          </AppMapView>
        </View>
      ) : (
        <View
          style={{
            height,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.secondary,
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <Text style={[textPresets.caption, { textAlign: "center", color: colors.mutedForeground }]}>
            الخريطة غير متاحة في Expo Go — استخدم «فتح في الخرائط»
          </Text>
        </View>
      )}

      {showOpenMaps ? (
        <Pressable
          onPress={() => void openExternalMaps(mapsTarget)}
          style={{
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: `${colors.primary}12`,
            alignItems: "center",
          }}
        >
          <Text style={[textPresets.bodySm, { color: colors.primary, fontFamily: fonts.arabicBold }]}>فتح في الخرائط</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

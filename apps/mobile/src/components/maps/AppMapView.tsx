import React, { type ComponentProps } from "react";
import { NativeModules, Platform, UIManager } from "react-native";
import { DEFAULT_MAP_REGION } from "@/shared/mapSpots";

type MapsModule = {
  default: React.ComponentType<Record<string, unknown>>;
  Marker: React.ComponentType<Record<string, unknown>>;
};

let MapsLib: MapsModule | null = null;
try {
  MapsLib = require("react-native-maps") as MapsModule;
} catch {
  MapsLib = null;
}

export const hasNativeMapModule =
  !!NativeModules.RNMapsAirModule || !!UIManager.getViewManagerConfig?.("AIRMap");

export const MapMarker = MapsLib?.Marker ?? null;

/** Default map props: Riyadh region; Arabic labels follow app locale (see app.json + iOS per-app language). */
export const defaultMapProps = {
  initialRegion: DEFAULT_MAP_REGION,
  showsCompass: false,
  showsMyLocationButton: false,
  toolbarEnabled: false,
  ...(Platform.OS === "ios" ? { userInterfaceStyle: "light" as const } : {}),
};

type MapViewProps = ComponentProps<NonNullable<typeof MapsLib>["default"]>;

type AppMapViewProps = Omit<MapViewProps, "initialRegion"> & {
  initialRegion?: MapViewProps["initialRegion"];
};

/**
 * Shared MapView for Luffa — uses Apple Maps on iOS (Expo Go) with Arabic when the app
 * locale is Arabic. Set iPhone → Settings → Luffa → Language → العربية after installing
 * a build with expo-localization, or use a device whose primary language is Arabic.
 */
export function AppMapView({ initialRegion, style, ...rest }: AppMapViewProps) {
  if (!MapsLib || !hasNativeMapModule) {
    return null;
  }

  const MapView = MapsLib.default;
  return (
    <MapView
      style={[{ flex: 1 }, style]}
      initialRegion={initialRegion ?? DEFAULT_MAP_REGION}
      showsCompass={false}
      showsMyLocationButton={false}
      toolbarEnabled={false}
      userInterfaceStyle={Platform.OS === "ios" ? "light" : undefined}
      {...rest}
    />
  );
}

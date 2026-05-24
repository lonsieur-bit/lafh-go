import { Alert, Linking, Platform } from "react-native";

export type MapTarget = {
  latitude?: number | null;
  longitude?: number | null;
  label?: string;
};

/** Open Apple/Google Maps for coordinates or address (with web fallback). */
export async function openExternalMaps(target: MapTarget): Promise<void> {
  const label = target.label?.trim() ?? "";
  const hasCoords = target.latitude != null && target.longitude != null;

  if (!hasCoords && !label) {
    Alert.alert("الموقع غير متاح", "لا يوجد موقع مسجّل لهذا الطلب.");
    return;
  }

  const webUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${target.latitude},${target.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${label}, السعودية`)}`;

  const nativeUrls: string[] = [];
  if (hasCoords) {
    const { latitude, longitude } = target;
    if (Platform.OS === "ios") {
      nativeUrls.push(`maps://?daddr=${latitude},${longitude}`);
      nativeUrls.push(`comgooglemaps://?daddr=${latitude},${longitude}`);
    } else {
      nativeUrls.push(`geo:${latitude},${longitude}?q=${latitude},${longitude}`);
      nativeUrls.push(`google.navigation:q=${latitude},${longitude}`);
    }
  } else {
    const q = encodeURIComponent(`${label}, السعودية`);
    if (Platform.OS === "ios") {
      nativeUrls.push(`maps://?q=${q}`);
      nativeUrls.push(`comgooglemaps://?q=${q}`);
    } else {
      nativeUrls.push(`geo:0,0?q=${q}`);
    }
  }

  for (const url of nativeUrls) {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return;
      }
    } catch {
      /* try next */
    }
  }

  try {
    await Linking.openURL(webUrl);
  } catch {
    Alert.alert("تعذّر فتح الخرائط", "ثبّت تطبيق الخرائط أو جرّب مرة أخرى.");
  }
}

import { useCallback, useEffect, useRef } from "react";
import * as Location from "expo-location";

export function useCaptainLocation(enabled: boolean, onLocation: (lat: number, lng: number) => void) {
  const onLocationRef = useRef(onLocation);
  onLocationRef.current = onLocation;

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let sub: Location.LocationSubscription | null = null;

    void (async () => {
      const ok = await requestPermission();
      if (!ok || cancelled) return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (!cancelled) onLocationRef.current(pos.coords.latitude, pos.coords.longitude);
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 20000, distanceInterval: 50 },
        (p) => onLocationRef.current(p.coords.latitude, p.coords.longitude),
      );
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [enabled, requestPermission]);

  return { requestPermission };
}

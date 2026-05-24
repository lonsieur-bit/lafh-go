export type MapSpot = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
};

export const RIYADH_MAP_SPOTS: MapSpot[] = [
  { id: "nakhil", label: "حي النخيل", latitude: 24.7495, longitude: 46.6753 },
  { id: "kingdom", label: "برج المملكة", latitude: 24.7111, longitude: 46.6743 },
  { id: "airport", label: "مطار الملك خالد الدولي", latitude: 24.9578, longitude: 46.6988 },
  { id: "mall", label: "العليا مول", latitude: 24.6908, longitude: 46.6853 },
  { id: "yasmin", label: "حي الياسمين", latitude: 24.8122, longitude: 46.6417 },
  { id: "ksu", label: "جامعة الملك سعود", latitude: 24.722, longitude: 46.6197 },
];

export const DEFAULT_MAP_REGION = {
  latitude: 24.742,
  longitude: 46.675,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const SNAP_THRESHOLD = 0.00012;

export function nearestSpot(latitude: number, longitude: number): { spot: MapSpot; distance: number } {
  let best = RIYADH_MAP_SPOTS[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const spot of RIYADH_MAP_SPOTS) {
    const d = (spot.latitude - latitude) ** 2 + (spot.longitude - longitude) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = spot;
    }
  }
  return { spot: best, distance: bestDist };
}

/** Pick nearest named spot when close enough, otherwise generic map label */
export function labelForCoordinate(latitude: number, longitude: number): string {
  const { spot, distance } = nearestSpot(latitude, longitude);
  if (distance < SNAP_THRESHOLD) return spot.label;
  return "موقع محدد على الخريطة";
}

export function spotForLabel(label: string): MapSpot | undefined {
  const trimmed = label.trim();
  const exact = RIYADH_MAP_SPOTS.find((s) => s.label === trimmed);
  if (exact) return exact;
  return RIYADH_MAP_SPOTS.find((s) => trimmed.includes(s.label) || s.label.includes(trimmed));
}

export function resolveLocationCoords(
  label: string,
  lat?: number | null,
  lng?: number | null,
): { latitude: number; longitude: number } | null {
  if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
    return { latitude: lat, longitude: lng };
  }
  const spot = spotForLabel(label);
  if (spot) return { latitude: spot.latitude, longitude: spot.longitude };
  return null;
}

export function regionForCoordinates(points: { latitude: number; longitude: number }[]) {
  if (!points.length) return DEFAULT_MAP_REGION;
  if (points.length === 1) {
    return {
      ...DEFAULT_MAP_REGION,
      latitude: points[0].latitude,
      longitude: points[0].longitude,
      latitudeDelta: 0.06,
      longitudeDelta: 0.06,
    };
  }
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latPad = Math.max(0.04, (maxLat - minLat) * 1.5 + 0.02);
  const lngPad = Math.max(0.04, (maxLng - minLng) * 1.5 + 0.02);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latPad,
    longitudeDelta: lngPad,
  };
}

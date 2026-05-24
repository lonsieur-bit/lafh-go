import { mockOrders } from "@/shared/mockData";

export type RecentPlace = {
  id: string;
  title: string;
  subtitle: string;
  kind: "home" | "work" | "airport" | "recent";
};

const DEFAULT_PLACES: RecentPlace[] = [
  { id: "home", title: "حي النخيل", subtitle: "المنزل · الرياض", kind: "home" },
  { id: "work", title: "برج المملكة", subtitle: "العمل · العليا", kind: "work" },
  { id: "airport", title: "مطار الملك خالد الدولي", subtitle: "مطار · الرياض", kind: "airport" },
  { id: "mall", title: "العليا مول", subtitle: "تسوق · الرياض", kind: "recent" },
  { id: "uni", title: "جامعة الملك سعود", subtitle: "جامعة · الرياض", kind: "recent" },
];

export const DEFAULT_PICKUP = "حي النخيل";

export function getRecentPlaces(limit = 8): RecentPlace[] {
  const fromTrips: RecentPlace[] = [];
  for (const o of mockOrders) {
    fromTrips.push({
      id: `trip-from-${o.id}`,
      title: o.from,
      subtitle: "رحلة سابقة · انطلاق",
      kind: "recent",
    });
    fromTrips.push({
      id: `trip-to-${o.id}`,
      title: o.to,
      subtitle: "رحلة سابقة · وصول",
      kind: "recent",
    });
  }

  const seen = new Set<string>();
  const merged: RecentPlace[] = [];
  for (const p of [...DEFAULT_PLACES, ...fromTrips]) {
    const key = p.title.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(p);
    if (merged.length >= limit) break;
  }
  return merged;
}

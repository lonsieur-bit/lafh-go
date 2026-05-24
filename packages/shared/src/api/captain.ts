import type { Order, OrderContact, OrderTimelineStep, Profile } from "../types";
import { profileToContact } from "./orders";
import { ORDER_STATUS_LABELS } from "../types";
import { formatMoney, DEFAULT_CURRENCY_SETTINGS } from "../currency";
import { fetchPlatformCurrencySettings } from "./platformSettings";
import type { Database } from "../supabase/database.types";
import { getSupabase, isSupabaseReady } from "../supabase/client";
import { fixArabicMojibake } from "../text/fixArabicMojibake";
import { mapOrderRow } from "./orders";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

export const CAPTAIN_COMMISSION_RATE = 0.8;
export const CAPTAIN_OFFER_RADIUS_KM = 15;

export type CaptainOffer = {
  id: string;
  from: string;
  to: string;
  fareTotal: number;
  captainNet: number;
  distanceKm: number;
  serviceLabel?: string;
  serviceType?: string;
  isFreight?: boolean;
  riderOfferSar?: number;
  freightNotes?: string | null;
  pickupLat?: number | null;
  pickupLng?: number | null;
  dropoffLat?: number | null;
  dropoffLng?: number | null;
  intermediateStops?: { label: string; lat?: number | null; lng?: number | null }[];
};

export type CaptainSession = {
  online: boolean;
  offlineAlertsEnabled: boolean;
  lat: number | null;
  lng: number | null;
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function computeCaptainNet(totalSar: number): number {
  return Math.round(totalSar * CAPTAIN_COMMISSION_RATE * 100) / 100;
}

function rowToOffer(row: OrderRow, captainLat?: number, captainLng?: number): CaptainOffer | null {
  const isFreight = row.service_type === "cargo" || row.service_type === "tow";
  if (isFreight && row.captain_confirmed_match) return null;

  const total = Number(row.total_sar ?? row.price_sar ?? 0);
  if (!total) return null;

  let distanceKm = 0;
  if (
    captainLat != null &&
    captainLng != null &&
    row.pickup_lat != null &&
    row.pickup_lng != null
  ) {
    distanceKm = haversineKm(captainLat, captainLng, row.pickup_lat, row.pickup_lng);
    if (distanceKm > CAPTAIN_OFFER_RADIUS_KM) return null;
  } else if (row.pickup_lat == null) {
    distanceKm = 2.5;
  }

  const riderOffer = Number(row.total_sar ?? row.price_sar ?? 0);

  return {
    id: row.id,
    from: row.from_location,
    to: row.to_location,
    fareTotal: total,
    captainNet: computeCaptainNet(total),
    distanceKm: Math.round(distanceKm * 10) / 10,
    serviceLabel: row.service_label ?? undefined,
    serviceType: row.service_type,
    isFreight,
    riderOfferSar: riderOffer,
    freightNotes: row.freight_notes ?? null,
    pickupLat: row.pickup_lat,
    pickupLng: row.pickup_lng,
  };
}

export async function setCaptainOnline(
  online: boolean,
  lat?: number,
  lng?: number,
  offlineAlerts?: boolean,
): Promise<void> {
  if (!isSupabaseReady()) return;
  const { error } = await getSupabase().rpc("captain_set_online", {
    p_online: online,
    p_lat: lat ?? null,
    p_lng: lng ?? null,
    p_offline_alerts: offlineAlerts ?? null,
  });
  if (error) throw error;
}

export async function fetchCaptainSession(profileId: string): Promise<CaptainSession | null> {
  if (!isSupabaseReady()) return null;
  const { data, error } = await getSupabase()
    .from("captain_sessions")
    .select("online, offline_alerts_enabled, lat, lng")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    online: data.online,
    offlineAlertsEnabled: data.offline_alerts_enabled,
    lat: data.lat,
    lng: data.lng,
  };
}

export async function fetchPendingOrdersNear(
  lat: number,
  lng: number,
  radiusKm = CAPTAIN_OFFER_RADIUS_KM,
): Promise<CaptainOffer[]> {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*")
    .eq("status", "pending")
    .is("captain_id", null)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];

  const offers: CaptainOffer[] = [];
  for (const row of data) {
    const offer = rowToOffer(row as OrderRow, lat, lng);
    if (offer && offer.distanceKm <= radiusKm) offers.push(offer);
  }
  return offers.sort((a, b) => a.distanceKm - b.distanceKm);
}

export async function acceptOrder(orderId: string): Promise<OrderRow> {
  if (!isSupabaseReady()) throw new Error("supabase_not_ready");
  const { data, error } = await getSupabase().rpc("captain_accept_order", { p_order_id: orderId });
  if (error) throw error;
  return data as OrderRow;
}

export async function fetchOrdersForCaptain(captainId: string): Promise<Order[]> {
  if (!isSupabaseReady()) return [];
  const supabase = getSupabase();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("captain_id", captainId)
    .order("created_at", { ascending: false });
  if (error || !orders?.length) return [];

  const currency = await fetchPlatformCurrencySettings();
  const ids = orders.map((o) => o.id);
  const [{ data: steps }, { data: lines }] = await Promise.all([
    supabase.from("order_timeline_steps").select("*").in("order_id", ids).order("sort_order"),
    supabase.from("order_receipt_lines").select("*").in("order_id", ids).order("sort_order"),
  ]);

  return orders.map((row) => {
    const timeline: OrderTimelineStep[] = (steps ?? [])
      .filter((s) => s.order_id === row.id)
      .map((s) => ({
        id: s.id,
        title: fixArabicMojibake(s.title),
        time: s.step_time ?? undefined,
        done: s.done,
      }));
    const receipt = (lines ?? [])
      .filter((l) => l.order_id === row.id)
      .map((l) => ({ label: fixArabicMojibake(l.label), amount: l.amount }));
    return mapOrderRow(row as OrderRow, timeline, receipt, undefined, currency);
  });
}

export async function fetchCaptainActiveOrder(captainId: string): Promise<OrderRow | null> {
  if (!isSupabaseReady()) return null;
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*")
    .eq("captain_id", captainId)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as OrderRow | null;
}

export async function updateCaptainTripStatus(
  orderId: string,
  statusLabel: string,
  stepTitle: string,
): Promise<void> {
  if (!isSupabaseReady()) return;
  const { error } = await getSupabase().rpc("captain_update_trip_status", {
    p_order_id: orderId,
    p_status_label: statusLabel,
    p_step_title: stepTitle,
  });
  if (error) throw error;
}

export async function completeCaptainTrip(orderId: string): Promise<number> {
  if (!isSupabaseReady()) throw new Error("supabase_not_ready");
  const { data, error } = await getSupabase().rpc("captain_complete_trip", { p_order_id: orderId });
  if (error) throw error;
  return Number(data ?? 0);
}

export async function fetchCaptainEarningsSummary(captainId: string): Promise<{
  todayNet: number;
  weekNet: number;
  tripCountToday: number;
}> {
  if (!isSupabaseReady()) return { todayNet: 0, weekNet: 0, tripCountToday: 0 };
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await getSupabase()
    .from("orders")
    .select("captain_net_sar, updated_at, status")
    .eq("captain_id", captainId)
    .eq("status", "completed");
  if (error || !data) return { todayNet: 0, weekNet: 0, tripCountToday: 0 };

  let todayNet = 0;
  let weekNet = 0;
  let tripCountToday = 0;
  for (const row of data) {
    const net = Number(row.captain_net_sar ?? 0);
    const t = row.updated_at ?? "";
    if (t >= startOfDay) {
      todayNet += net;
      tripCountToday += 1;
    }
    if (t >= startOfWeek) weekNet += net;
  }
  return {
    todayNet: Math.round(todayNet * 100) / 100,
    weekNet: Math.round(weekNet * 100) / 100,
    tripCountToday,
  };
}

export async function fetchOrderRowById(orderId: string): Promise<OrderRow | null> {
  if (!isSupabaseReady()) return null;
  const { data, error } = await getSupabase().from("orders").select("*").eq("id", orderId).maybeSingle();
  if (error) throw error;
  return data as OrderRow | null;
}

export async function fetchCaptainTripDetail(orderId: string): Promise<{
  order: OrderRow;
  timelineTitles: string[];
  rider: OrderContact | null;
} | null> {
  if (!isSupabaseReady()) return null;
  const supabase = getSupabase();
  const { data: order, error } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (error) throw error;
  if (!order) return null;
  const [{ data: steps }, riderProfile] = await Promise.all([
    supabase.from("order_timeline_steps").select("title").eq("order_id", orderId).order("sort_order"),
    order.rider_id
      ? supabase
          .from("profiles")
          .select("id, display_name, phone, role, referral_code, disabled")
          .eq("id", order.rider_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const rider =
    riderProfile.data != null
      ? profileToContact(riderProfile.data as Profile, "عميل")
      : null;

  return {
    order: order as OrderRow,
    timelineTitles: (steps ?? []).map((s) => s.title),
    rider,
  };
}

export async function registerPushToken(token: string, platform: string): Promise<void> {
  if (!isSupabaseReady()) return;
  const supabase = getSupabase();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user?.id) return;
  const { error } = await supabase.from("push_tokens").upsert(
    { profile_id: user.user.id, token, platform },
    { onConflict: "profile_id,token" },
  );
  if (error) throw error;
}

export { ORDER_STATUS_LABELS };

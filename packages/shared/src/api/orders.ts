import type {
  AdminOrderDetail,
  DriverRow,
  Order,
  OrderContact,
  OrderLineItem,
  OrderStatus,
  OrderTimelineStep,
  DriverInfo,
  Profile,
} from "../types";
import { ORDER_STATUS_LABELS } from "../types";
import { formatMoney, type PlatformCurrencySettings } from "../currency";
import { DEFAULT_CURRENCY_SETTINGS } from "../currency";
import type { Database } from "../supabase/database.types";
import { getSupabase, isSupabaseReady } from "../supabase/client";
import { fetchPlatformCurrencySettings } from "./platformSettings";
import { fixArabicMojibake, resolveOrderStatusLabel } from "../text/fixArabicMojibake";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type TimelineRow = Database["public"]["Tables"]["order_timeline_steps"]["Row"];
type ReceiptRow = Database["public"]["Tables"]["order_receipt_lines"]["Row"];

function profileToContact(profile: Profile, fallbackName: string): OrderContact {
  return {
    id: profile.id,
    name: profile.display_name?.trim() || fallbackName,
    phone: profile.phone,
  };
}

async function fetchOrderContacts(row: OrderRow): Promise<{ rider: OrderContact | null; captain: OrderContact | null }> {
  const ids = [row.rider_id, row.captain_id].filter(Boolean) as string[];
  if (!ids.length) return { rider: null, captain: null };

  const { data: profiles } = await getSupabase()
    .from("profiles")
    .select("id, display_name, phone, role, referral_code, disabled")
    .in("id", ids);
  const map = new Map((profiles ?? []).map((p) => [p.id, p as Profile]));

  return {
    rider: row.rider_id && map.get(row.rider_id) ? profileToContact(map.get(row.rider_id)!, "راكب") : null,
    captain: row.captain_id && map.get(row.captain_id) ? profileToContact(map.get(row.captain_id)!, "كابتن") : null,
  };
}

const defaultDriver: DriverInfo = {
  id: "d1",
  name: "سعود المطيري",
  nameEn: "Saud Al-Mutairi",
  rating: 4.9,
  trips: 1200,
  carModel: "تويوتا كامري 2022",
  plate: "A B C 1234",
  avatarColor: "bg-primary/15 text-primary",
};

function mapOrderRow(
  row: OrderRow,
  timeline: OrderTimelineStep[],
  receipt: OrderLineItem[],
  driver?: DriverInfo,
  currency: PlatformCurrencySettings = DEFAULT_CURRENCY_SETTINGS,
): Order {
  const date = row.trip_date
    ? row.trip_date.replace(/-/g, "/")
    : new Date(row.created_at).toLocaleDateString("ar-SA");
  return {
    id: row.id,
    displayId: row.display_id,
    from: row.from_location,
    to: row.to_location,
    date,
    time: row.trip_time ?? "",
    price: formatMoney(row.price_sar ?? row.total_sar, currency),
    status: row.status,
    statusLabel: resolveOrderStatusLabel(row.status, row.status_label),
    rating: Number(row.rating),
    serviceLabel: row.service_label ?? row.service_type,
    driver: driver ?? defaultDriver,
    timeline,
    receipt,
    discount: row.discount_sar ? `-${formatMoney(row.discount_sar, currency)}` : undefined,
    total: formatMoney(row.total_sar ?? row.price_sar, currency),
    pickupLat: row.pickup_lat,
    pickupLng: row.pickup_lng,
    dropoffLat: row.dropoff_lat,
    dropoffLng: row.dropoff_lng,
  };
}

export async function fetchOrdersForUser(riderId?: string): Promise<Order[]> {
  if (!isSupabaseReady()) return [];
  const supabase = getSupabase();
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (riderId) query = query.eq("rider_id", riderId);

  const { data: orders, error } = await query;
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
    const receipt: OrderLineItem[] = (lines ?? [])
      .filter((l) => l.order_id === row.id)
      .map((l) => ({ label: l.label, amount: l.amount }));
    return mapOrderRow(row, timeline, receipt, undefined, currency);
  });
}

export async function fetchAllOrdersAdmin(): Promise<OrderRow[]> {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getSupabase().from("orders").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateOrderStatusAdmin(
  orderId: string,
  status: OrderRow["status"],
  statusLabel: string,
): Promise<void> {
  const { error } = await getSupabase()
    .from("orders")
    .update({ status, status_label: statusLabel, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) throw error;
}

function mapTimelineRows(rows: TimelineRow[]): OrderTimelineStep[] {
  return rows.map((s) => ({
    id: s.id,
    title: fixArabicMojibake(s.title),
    time: s.step_time ?? undefined,
    done: s.done,
  }));
}

function mapReceiptRows(rows: ReceiptRow[]): OrderLineItem[] {
  return rows.map((l) => ({ label: fixArabicMojibake(l.label), amount: l.amount }));
}

export async function fetchOrderDetailAdmin(orderId: string): Promise<AdminOrderDetail | null> {
  if (!isSupabaseReady()) return null;
  const supabase = getSupabase();
  const { data: order, error } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (error) throw error;
  if (!order) return null;

  const profileIds = [order.rider_id, order.captain_id].filter(Boolean) as string[];
  const profilesPromise =
    profileIds.length > 0
      ? supabase.from("profiles").select("*").in("id", profileIds)
      : Promise.resolve({ data: [] as Profile[], error: null });
  const [{ data: profiles }, { data: driver }, { data: steps }, { data: lines }] = await Promise.all([
    profilesPromise,
    order.driver_id
      ? supabase.from("drivers").select("*").eq("id", order.driver_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("order_timeline_steps").select("*").eq("order_id", orderId).order("sort_order"),
    supabase.from("order_receipt_lines").select("*").eq("order_id", orderId).order("sort_order"),
  ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p as Profile]));
  return {
    order,
    rider: order.rider_id ? (profileMap.get(order.rider_id) ?? null) : null,
    captain: order.captain_id ? (profileMap.get(order.captain_id) ?? null) : null,
    driver: driver as DriverRow | null,
    timeline: mapTimelineRows(steps ?? []),
    receipt: mapReceiptRows(lines ?? []),
  };
}

export type OrderAdminUpdate = Partial<
  Pick<
    OrderRow,
    | "status"
    | "status_label"
    | "from_location"
    | "to_location"
    | "captain_id"
    | "driver_id"
    | "payment_method"
    | "service_label"
  >
>;

export async function updateOrderAdmin(orderId: string, updates: OrderAdminUpdate): Promise<void> {
  const payload: OrderAdminUpdate & { updated_at: string } = {
    ...updates,
    updated_at: new Date().toISOString(),
  };
  if (updates.status && !updates.status_label) {
    payload.status_label = ORDER_STATUS_LABELS[updates.status as OrderStatus];
  }
  const { error } = await getSupabase().from("orders").update(payload).eq("id", orderId);
  if (error) throw error;
}

export async function assignCaptainToOrder(orderId: string, captainId: string | null): Promise<void> {
  await updateOrderAdmin(orderId, { captain_id: captainId });
}

export async function updateTimelineStep(
  stepId: string,
  updates: { done?: boolean; step_time?: string | null },
): Promise<void> {
  const { error } = await getSupabase().from("order_timeline_steps").update(updates).eq("id", stepId);
  if (error) throw error;
}

export async function fetchDriversAdmin(): Promise<DriverRow[]> {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getSupabase().from("drivers").select("*").order("name_ar");
  if (error) throw error;
  return (data ?? []) as DriverRow[];
}

export async function insertOrderFromCheckout(params: {
  riderId: string;
  serviceType: OrderRow["service_type"];
  serviceLabel: string;
  from: string;
  to: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  baseFare: number;
  extrasTotal: number;
  discount: number;
  vat: number;
  total: number;
  paymentMethod: string;
  timelineTitles?: string[];
  freightNotes?: string;
}): Promise<string> {
  const id = `lf-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const supabase = getSupabase();
  const currency = await fetchPlatformCurrencySettings();

  const isFreight = params.serviceType === "cargo" || params.serviceType === "tow";
  const { error: orderErr } = await supabase.from("orders").insert({
    id,
    display_id: `#${id.toUpperCase()}`,
    rider_id: params.riderId,
    from_location: params.from,
    to_location: params.to,
    trip_date: now.toISOString().slice(0, 10),
    trip_time: `${hh}:${mm}`,
    price_sar: params.total,
    total_sar: params.total,
    discount_sar: params.discount > 0 ? params.discount : null,
    status: "pending",
    status_label: isFreight ? "بانتظار عروض الكباتن" : "بانتظار كابتن",
    service_type: params.serviceType,
    service_label: params.serviceLabel,
    payment_method: params.paymentMethod,
    pickup_lat: params.pickupLat ?? null,
    pickup_lng: params.pickupLng ?? null,
    dropoff_lat: params.dropoffLat ?? null,
    dropoff_lng: params.dropoffLng ?? null,
    freight_notes: params.freightNotes ?? null,
    captain_confirmed_match: false,
    rider_confirmed_match: false,
  });
  if (orderErr) throw orderErr;

  const timelineTitles =
    params.timelineTitles ??
    (isFreight ? ["تم إنشاء الطلب", "بانتظار عروض الكباتن"] : ["تم إنشاء الطلب", "بانتظار كابتن"]);
  const steps = timelineTitles.map((title, i) => ({
    order_id: id,
    sort_order: i + 1,
    title,
    step_time: i === 0 ? `${hh}:${mm}` : null,
    done: i === 0,
  }));
  await supabase.from("order_timeline_steps").insert(steps);

  await supabase.from("order_receipt_lines").insert([
    { order_id: id, sort_order: 1, label: "أجرة الرحلة", amount: formatMoney(params.baseFare, currency) },
    { order_id: id, sort_order: 2, label: "إضافات", amount: formatMoney(params.extrasTotal, currency) },
    { order_id: id, sort_order: 3, label: "ضريبة القيمة المضافة", amount: formatMoney(params.vat, currency) },
  ]);

  return id;
}

export async function cancelOrder(orderId: string): Promise<void> {
  if (!isSupabaseReady()) throw new Error("supabase_not_ready");
  const { error } = await getSupabase().rpc("cancel_order", { p_order_id: orderId });
  if (error) throw error;
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  if (!isSupabaseReady()) return null;
  const supabase = getSupabase();
  const { data: row, error } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (error || !row) return null;

  const currency = await fetchPlatformCurrencySettings();
  const [{ data: steps }, { data: lines }] = await Promise.all([
    supabase.from("order_timeline_steps").select("*").eq("order_id", orderId).order("sort_order"),
    supabase.from("order_receipt_lines").select("*").eq("order_id", orderId).order("sort_order"),
  ]);

  const contacts = await fetchOrderContacts(row as OrderRow);
  const order = mapOrderRow(
    row as OrderRow,
    mapTimelineRows(steps ?? []),
    mapReceiptRows(lines ?? []),
    undefined,
    currency,
  );
  return { ...order, ...contacts };
}

export { mapOrderRow, profileToContact, fetchOrderContacts };
export { formatMoney as formatSar } from "../currency";

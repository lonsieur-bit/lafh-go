import type { Database } from "../supabase/database.types";
import { getSupabase, isSupabaseReady } from "../supabase/client";
import { fetchOrderRowById } from "./captain";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

export type FreightServiceType = "cargo" | "tow";

export function isFreightServiceType(serviceType: string | null | undefined): serviceType is FreightServiceType {
  return serviceType === "cargo" || serviceType === "tow";
}

export type FreightOrderSnapshot = {
  id: string;
  serviceType: FreightServiceType;
  serviceLabel: string;
  from: string;
  to: string;
  riderOfferSar: number;
  captainQuoteSar: number | null;
  freightNotes: string | null;
  captainId: string | null;
  captainConfirmedMatch: boolean;
  riderConfirmedMatch: boolean;
  status: OrderRow["status"];
  statusLabel: string;
};

export function mapFreightSnapshot(row: OrderRow): FreightOrderSnapshot {
  return {
    id: row.id,
    serviceType: row.service_type as FreightServiceType,
    serviceLabel: row.service_label ?? row.service_type,
    from: row.from_location,
    to: row.to_location,
    riderOfferSar: Number(row.total_sar ?? row.price_sar ?? 0),
    captainQuoteSar: row.captain_quote_sar != null ? Number(row.captain_quote_sar) : null,
    freightNotes: row.freight_notes ?? null,
    captainId: row.captain_id,
    captainConfirmedMatch: Boolean(row.captain_confirmed_match),
    riderConfirmedMatch: Boolean(row.rider_confirmed_match),
    status: row.status,
    statusLabel: row.status_label ?? row.status,
  };
}

export async function fetchFreightOrder(orderId: string): Promise<FreightOrderSnapshot | null> {
  const row = await fetchOrderRowById(orderId);
  if (!row || !isFreightServiceType(row.service_type)) return null;
  return mapFreightSnapshot(row);
}

export async function captainFreightRespond(
  orderId: string,
  params: { useRiderPrice: boolean; quoteSar?: number },
): Promise<FreightOrderSnapshot> {
  if (!isSupabaseReady()) throw new Error("supabase_not_ready");
  const { data, error } = await getSupabase().rpc("captain_freight_respond", {
    p_order_id: orderId,
    p_use_rider_price: params.useRiderPrice,
    p_quote_sar: params.useRiderPrice ? null : (params.quoteSar ?? null),
  });
  if (error) throw new Error(error.message);
  return mapFreightSnapshot(data as OrderRow);
}

export async function riderFreightConfirm(orderId: string): Promise<FreightOrderSnapshot> {
  if (!isSupabaseReady()) throw new Error("supabase_not_ready");
  const { data, error } = await getSupabase().rpc("rider_freight_confirm", { p_order_id: orderId });
  if (error) throw new Error(error.message);
  return mapFreightSnapshot(data as OrderRow);
}

import type { GiftCardBatch, GiftCardFilters, PartnerStore, RechargeCardRow } from "../types";
import { getSupabase, getSessionUserId, isSupabaseReady } from "../supabase/client";

/** Internal store row for batches (not shown in admin UI). */
const DEFAULT_GIFT_STORE_ID = "b1000001-0000-4000-8000-000000000001";

function generateGiftCode(): string {
  return `LFG-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
}

async function resolveGiftStoreId(): Promise<string> {
  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from("partner_stores")
    .select("id")
    .eq("id", DEFAULT_GIFT_STORE_ID)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const { data: created, error } = await supabase
    .from("partner_stores")
    .insert({
      id: DEFAULT_GIFT_STORE_ID,
      name: "لفة",
      area: null,
      contact_phone: null,
      active: true,
    })
    .select("id")
    .single();
  if (!error && created?.id) return created.id;

  const { data: fallback } = await supabase.from("partner_stores").select("id").limit(1).maybeSingle();
  if (fallback?.id) return fallback.id;
  throw error ?? new Error("تعذر تهيئة متجر البطاقات");
}

export async function fetchPartnerStores(): Promise<PartnerStore[]> {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getSupabase()
    .from("partner_stores")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []) as PartnerStore[];
}

export async function createPartnerStore(input: {
  name: string;
  area?: string;
  contact_phone?: string;
}): Promise<PartnerStore> {
  const { data, error } = await getSupabase()
    .from("partner_stores")
    .insert({
      name: input.name,
      area: input.area ?? null,
      contact_phone: input.contact_phone ?? null,
      active: true,
    })
    .select()
    .single();
  if (error) throw error;
  return data as PartnerStore;
}

export async function updatePartnerStore(
  id: string,
  input: Partial<Pick<PartnerStore, "name" | "area" | "contact_phone" | "active">>,
): Promise<void> {
  const { error } = await getSupabase().from("partner_stores").update(input).eq("id", id);
  if (error) throw error;
}

export async function fetchGiftCardBatches(storeId?: string): Promise<GiftCardBatch[]> {
  if (!isSupabaseReady()) return [];
  let query = getSupabase()
    .from("gift_card_batches")
    .select("*, partner_stores(id, name, area, contact_phone, active, created_at)")
    .order("created_at", { ascending: false });
  if (storeId) query = query.eq("store_id", storeId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => {
    const store = row.partner_stores as PartnerStore | null;
    const { partner_stores: _, ...batch } = row as GiftCardBatch & { partner_stores?: PartnerStore };
    return { ...batch, store: store ?? undefined };
  });
}

export async function generateGiftCardBatch(params: {
  storeId?: string;
  amount: number;
  count: number;
  label: string;
}): Promise<{ batch: GiftCardBatch; cards: RechargeCardRow[] }> {
  const supabase = getSupabase();
  const userId = await getSessionUserId();
  const storeId = params.storeId ?? (await resolveGiftStoreId());

  const { data: batch, error: batchErr } = await supabase
    .from("gift_card_batches")
    .insert({
      store_id: storeId,
      label: params.label,
      amount_sar: params.amount,
      quantity: params.count,
      created_by: userId,
    })
    .select()
    .single();
  if (batchErr || !batch) throw batchErr ?? new Error("فشل إنشاء الدفعة");

  const codes = new Set<string>();
  const rows = Array.from({ length: params.count }).map(() => {
    let code = generateGiftCode();
    while (codes.has(code)) code = generateGiftCode();
    codes.add(code);
    return {
      code,
      amount_sar: params.amount,
      status: "new" as const,
      batch_id: batch.id,
      store_id: storeId,
    };
  });

  const { data: cards, error: cardsErr } = await supabase.from("recharge_cards").insert(rows).select();
  if (cardsErr) throw cardsErr;

  return { batch: batch as GiftCardBatch, cards: (cards ?? []) as RechargeCardRow[] };
}

export async function fetchGiftCards(filters: GiftCardFilters = {}): Promise<RechargeCardRow[]> {
  if (!isSupabaseReady()) return [];
  let query = getSupabase()
    .from("recharge_cards")
    .select(
      "*, gift_card_batches(id, store_id, label, amount_sar, quantity, created_by, created_at), partner_stores(id, name, area, contact_phone, active, created_at)",
    )
    .order("created_at", { ascending: false });
  if (filters.storeId) query = query.eq("store_id", filters.storeId);
  if (filters.batchId) query = query.eq("batch_id", filters.batchId);
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query.limit(500);
  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const batch = r.gift_card_batches as GiftCardBatch | null;
    const store = r.partner_stores as PartnerStore | null;
    return {
      id: r.id as string,
      code: r.code as string,
      amount_sar: Number(r.amount_sar),
      status: r.status as RechargeCardRow["status"],
      used_by: r.used_by as string | null,
      used_at: r.used_at as string | null,
      created_at: r.created_at as string,
      batch_id: r.batch_id as string | null,
      store_id: r.store_id as string | null,
      batch: batch ?? undefined,
      store: store ?? undefined,
    };
  });
}

export async function redeemGiftCard(code: string): Promise<number> {
  const { data, error } = await getSupabase().rpc("redeem_gift_card", { p_code: code.trim() });
  if (error) throw new Error(error.message);
  return Number(data);
}

/** @deprecated Use redeemGiftCard */
export async function redeemRechargeCard(code: string, _profileId?: string): Promise<number> {
  return redeemGiftCard(code);
}

export async function revokeGiftCard(id: string): Promise<void> {
  const { error } = await getSupabase().from("recharge_cards").delete().eq("id", id).eq("status", "new");
  if (error) throw error;
}

export function buildBatchCsv(cards: RechargeCardRow[], batch: GiftCardBatch): string {
  const header = "code,amount_sar,status,batch_label,created_at";
  const lines = cards.map((c) =>
    [c.code, c.amount_sar, c.status === "new" ? "new" : "used", batch.label, c.created_at].join(","),
  );
  return [header, ...lines].join("\n");
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

import type { RechargeCardRow } from "../types";
import { getSupabase, isSupabaseReady } from "../supabase/client";
import { fetchGiftCards, generateGiftCardBatch, redeemGiftCard, revokeGiftCard } from "./giftCards";

function generateCode(): string {
  return `RHC-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/** @deprecated Use fetchGiftCards */
export async function fetchRechargeCards(): Promise<RechargeCardRow[]> {
  return fetchGiftCards();
}

/** @deprecated Use generateGiftCardBatch with a store */
export async function generateRechargeBatch(amount: number, count: number): Promise<RechargeCardRow[]> {
  if (!isSupabaseReady()) return [];
  const supabase = getSupabase();
  const rows = Array.from({ length: count }).map(() => ({
    code: generateCode(),
    amount_sar: amount,
    status: "new" as const,
  }));
  const { data, error } = await supabase.from("recharge_cards").insert(rows).select();
  if (error) throw error;
  return (data ?? []) as RechargeCardRow[];
}

export { redeemGiftCard, redeemGiftCard as redeemRechargeCard, revokeGiftCard as revokeRechargeCard };

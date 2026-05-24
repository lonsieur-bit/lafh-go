import type { WalletTransaction } from "../types";
import { fixArabicMojibake } from "../text/fixArabicMojibake";
import { getSupabase, isSupabaseReady } from "../supabase/client";

function formatTxAmount(amount: number, positive: boolean): string {
  const sign = positive ? "+" : "-";
  return `${sign}${Math.abs(amount).toFixed(amount % 1 === 0 ? 0 : 2)} ر.س`;
}

function formatWalletTxTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} — ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export async function fetchWalletBalance(profileId: string): Promise<number> {
  if (!isSupabaseReady()) return 0;
  const { data, error } = await getSupabase().from("wallets").select("balance_sar").eq("profile_id", profileId).single();
  if (error || !data) return 0;
  return Number(data.balance_sar);
}

export async function fetchWalletTransactions(profileId: string): Promise<WalletTransaction[]> {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getSupabase()
    .from("wallet_transactions")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((t) => ({
    id: t.id,
    title: fixArabicMojibake(t.title),
    subtitle: fixArabicMojibake(t.subtitle ?? ""),
    amount: formatTxAmount(Number(t.amount_sar), t.positive),
    positive: t.positive,
    time: formatWalletTxTime(t.created_at),
  }));
}

export async function topUpWallet(profileId: string, amount: number, title = "شحن المحفظة"): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.rpc("rider_wallet_apply", {
    p_amount_sar: amount,
    p_positive: true,
    p_title: title,
    p_subtitle: "مباشر",
  });
  if (error) throw error;
}

export async function adjustWalletAdmin(
  profileId: string,
  delta: number,
  note: string,
): Promise<void> {
  const supabase = getSupabase();
  const balance = await fetchWalletBalance(profileId);
  const next = Math.max(0, balance + delta);
  await supabase.from("wallets").upsert({ profile_id: profileId, balance_sar: next });
  await supabase.from("wallet_transactions").insert({
    profile_id: profileId,
    title: delta >= 0 ? "تعديل إداري — إضافة" : "تعديل إداري — خصم",
    subtitle: note,
    amount_sar: Math.abs(delta),
    positive: delta >= 0,
  });
}

export async function deductWallet(profileId: string, amount: number, subtitle: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.rpc("rider_wallet_apply", {
    p_amount_sar: amount,
    p_positive: false,
    p_title: "دفع رحلة",
    p_subtitle: subtitle,
  });
  if (error) throw error;
}

export async function fetchAllWalletsAdmin(): Promise<{ profile_id: string; balance_sar: number }[]> {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getSupabase().from("wallets").select("profile_id, balance_sar");
  if (error) throw error;
  return data ?? [];
}

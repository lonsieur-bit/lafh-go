import type { Profile, ReferralProgramSettings, ReferralRow } from "../types";
import { getSupabase, isSupabaseReady } from "../supabase/client";

const DEFAULT_PROGRAM: ReferralProgramSettings = {
  default_reward_sar: 25,
  invitee_bonus_sar: 0,
  enabled: true,
  description_ar: "شارك كودك واكسب مكافأة عند كل تسجيل جديد.",
};

export async function fetchReferralProgramSettings(): Promise<ReferralProgramSettings> {
  if (!isSupabaseReady()) return DEFAULT_PROGRAM;
  const { data, error } = await getSupabase()
    .from("referral_program_settings")
    .select("default_reward_sar, invitee_bonus_sar, enabled, description_ar")
    .eq("id", "default")
    .maybeSingle();
  if (error || !data) return DEFAULT_PROGRAM;
  return {
    default_reward_sar: Number(data.default_reward_sar),
    invitee_bonus_sar: Number(data.invitee_bonus_sar),
    enabled: data.enabled,
    description_ar: data.description_ar,
  };
}

export async function updateReferralProgramSettings(
  updates: Partial<ReferralProgramSettings>,
): Promise<void> {
  const { error } = await getSupabase()
    .from("referral_program_settings")
    .upsert({
      id: "default",
      ...updates,
      updated_at: new Date().toISOString(),
    });
  if (error) throw error;
}

export async function recordReferral(inviterCode: string, _inviteeId?: string): Promise<void> {
  if (!isSupabaseReady()) return;
  const code = inviterCode.trim();
  if (!code) return;

  const program = await fetchReferralProgramSettings();
  if (!program.enabled) return;

  const { error } = await getSupabase().rpc("apply_referral_code", { p_code: code });
  if (error) throw error;
}

async function attachProfiles(rows: ReferralRow[]): Promise<ReferralRow[]> {
  const ids = new Set<string>();
  for (const r of rows) {
    if (r.inviter_id) ids.add(r.inviter_id);
    if (r.invitee_id) ids.add(r.invitee_id);
  }
  if (!ids.size) return rows;
  const { data: profiles } = await getSupabase()
    .from("profiles")
    .select("*")
    .in("id", [...ids]);
  const map = new Map((profiles ?? []).map((p) => [p.id, p as Profile]));
  return rows.map((r) => ({
    ...r,
    inviter: r.inviter_id ? (map.get(r.inviter_id) ?? null) : null,
    invitee: r.invitee_id ? (map.get(r.invitee_id) ?? null) : null,
  }));
}

export async function fetchReferralsAdmin(): Promise<ReferralRow[]> {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getSupabase()
    .from("referrals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return attachProfiles((data ?? []) as ReferralRow[]);
}

export async function createReferralAdmin(params: {
  inviterId: string;
  inviteeId: string;
  rewardSar: number;
  referralCode?: string;
}): Promise<void> {
  const supabase = getSupabase();
  const { data: inviter } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", params.inviterId)
    .single();
  const code = params.referralCode?.toUpperCase() ?? inviter?.referral_code ?? "MANUAL";

  const { error } = await supabase.from("referrals").insert({
    inviter_id: params.inviterId,
    invitee_id: params.inviteeId,
    referral_code: code,
    reward_sar: params.rewardSar,
  });
  if (error) throw error;
}

export async function updateReferralAdmin(
  id: string,
  updates: { reward_sar?: number; referral_code?: string },
): Promise<void> {
  const payload: { reward_sar?: number; referral_code?: string } = { ...updates };
  if (updates.referral_code) payload.referral_code = updates.referral_code.toUpperCase();
  const { error } = await getSupabase().from("referrals").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteReferralAdmin(id: string): Promise<void> {
  const { error } = await getSupabase().from("referrals").delete().eq("id", id);
  if (error) throw error;
}

export async function updateProfileReferralCode(profileId: string, code: string): Promise<void> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) throw new Error("الكود مطلوب");
  const { data: taken } = await getSupabase()
    .from("profiles")
    .select("id")
    .eq("referral_code", normalized)
    .neq("id", profileId)
    .maybeSingle();
  if (taken) throw new Error("هذا الكود مستخدم من مستخدم آخر");

  const { error } = await getSupabase()
    .from("profiles")
    .update({ referral_code: normalized })
    .eq("id", profileId);
  if (error) throw error;
}

export async function fetchReferralStats(profileId: string) {
  if (!isSupabaseReady()) return { invitesCount: 0, totalEarnings: 0 };
  const { data, error } = await getSupabase()
    .from("referrals")
    .select("reward_sar")
    .eq("inviter_id", profileId);
  if (error) throw error;
  const rows = data ?? [];
  return {
    invitesCount: rows.length,
    totalEarnings: rows.reduce((s, r) => s + Number(r.reward_sar), 0),
  };
}

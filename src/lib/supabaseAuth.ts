import {
  createSupabaseClient,
  DEMO_OTP,
  fetchAddresses,
  fetchNotifications,
  fetchOrdersForUser,
  fetchProfile,
  fetchReferralStats,
  fetchWalletBalance,
  fetchWalletTransactions,
  isSupabaseReady,
  recordReferral,
} from "@luffa/shared";

export async function signInRider(phone: string, otp: string, referralInput?: string): Promise<{ ok: boolean; userId?: string }> {
  const demoOk = /^\d{9}$/.test(phone) && otp === DEMO_OTP;
  if (!isSupabaseReady()) return { ok: demoOk };

  if (!demoOk) return { ok: false };

  const supabase = createSupabaseClient()!;
  const email = `${phone}@riders.luffa.go`;
  const password = `luffa-demo-${phone}`;

  let { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const signUp = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: phone, phone } },
    });
    if (signUp.error) return { ok: false };
    data = signUp.data;
  }

  const userId = data.session?.user?.id ?? data.user?.id;
  if (!userId) return { ok: false };

  if (referralInput?.trim()) {
    await recordReferral(referralInput.trim());
  }

  return { ok: true, userId };
}

export async function signOutRider(): Promise<void> {
  await createSupabaseClient()?.auth.signOut();
}

export async function loadRiderAppData(userId: string) {
  const [orders, addresses, notifications, balance, transactions, profile, referralStats] = await Promise.all([
    fetchOrdersForUser(userId),
    fetchAddresses(userId),
    fetchNotifications(userId),
    fetchWalletBalance(userId),
    fetchWalletTransactions(userId),
    fetchProfile(userId),
    fetchReferralStats(userId),
  ]);
  return {
    orders,
    addresses,
    notifications,
    walletBalance: balance,
    transactions,
    referralCode: profile?.referral_code ?? "",
    referralStats,
  };
}

export function getCurrentSessionUserId(): Promise<string | null> {
  const supabase = createSupabaseClient();
  if (!supabase) return Promise.resolve(null);
  return supabase.auth.getSession().then(({ data }) => data.session?.user?.id ?? null);
}

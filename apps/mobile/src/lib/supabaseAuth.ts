import {
  createSupabaseClient,
  fetchAddresses,
  fetchNotifications,
  fetchOrdersForUser,
  fetchProfile,
  fetchReferralStats,
  fetchWalletBalance,
  isSupabaseReady,
  recordReferral,
} from "@luffa/shared";

export type AuthAccountRole = "rider" | "captain";

export type AuthenticateMode = "login" | "register";

export type AuthErrorCode =
  | "invalid_phone"
  | "invalid_otp"
  | "invalid_name"
  | "invalid_credentials"
  | "wrong_role"
  | "already_registered"
  | "confirm_email"
  | "rate_limit"
  | "unknown";

function mapAuthApiError(message: string): AuthErrorCode {
  const msg = message.toLowerCase();
  if (msg.includes("rate limit") || msg.includes("too many")) return "rate_limit";
  if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
    return "already_registered";
  }
  if (msg.includes("email") && msg.includes("confirm")) return "confirm_email";
  if (msg.includes("invalid") && (msg.includes("login") || msg.includes("credentials"))) {
    return "invalid_credentials";
  }
  return "unknown";
}

export type AuthenticateParams = {
  phone: string;
  otp: string;
  role: AuthAccountRole;
  mode: AuthenticateMode;
  displayName?: string;
  referralInput?: string;
};

export type AuthenticateResult = {
  ok: boolean;
  userId?: string;
  role?: AuthAccountRole;
  errorCode?: AuthErrorCode;
};

const DEMO_OTP = /^\d{4,6}$/;

/** Supabase rejects some all-numeric local parts; use role.phone@domain */
function authEmail(phone: string, role: AuthAccountRole): string {
  return `${role}.${phone}@luffa.go`;
}

/** Legacy format from early builds — keep for existing accounts */
function legacyAuthEmail(phone: string, role: AuthAccountRole): string {
  return `${phone}@${role}.luffa.go`;
}

function authEmails(phone: string, role: AuthAccountRole): string[] {
  const primary = authEmail(phone, role);
  const legacy = legacyAuthEmail(phone, role);
  return primary === legacy ? [primary] : [primary, legacy];
}

function authPassword(phone: string): string {
  return `luffa-demo-${phone}`;
}

async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ userId: string } | null> {
  const supabase = createSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user?.id) return null;
  return { userId: data.user.id };
}

async function signInPhoneRole(phone: string, role: AuthAccountRole): Promise<{ userId: string } | null> {
  const password = authPassword(phone);
  for (const email of authEmails(phone, role)) {
    const hit = await signInWithEmail(email, password);
    if (hit) return hit;
  }
  return null;
}

async function updateProfile(
  userId: string,
  phone: string,
  role: AuthAccountRole,
  displayName?: string,
): Promise<void> {
  const supabase = createSupabaseClient();
  if (!supabase) return;

  const name = displayName?.trim() || `مستخدم ${phone.slice(-4)}`;
  const { error } = await supabase
    .from("profiles")
    .update({
      phone: `+966${phone}`,
      display_name: name,
      role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    await supabase.from("profiles").upsert({
      id: userId,
      phone: `+966${phone}`,
      display_name: name,
      role,
      updated_at: new Date().toISOString(),
    });
  }
}

async function finishAuth(
  userId: string,
  phone: string,
  role: AuthAccountRole,
  displayName?: string,
  referralInput?: string,
): Promise<AuthenticateResult> {
  await updateProfile(userId, phone, role, displayName);
  if (referralInput?.trim()) {
    try {
      await recordReferral(referralInput.trim());
    } catch {
      /* referral optional */
    }
  }
  const sessionUid = await getCurrentSessionUserId();
  if (!sessionUid) {
    return { ok: false, errorCode: "confirm_email" };
  }
  const profile = await fetchProfile(sessionUid);
  const resolvedRole = (profile?.role === "captain" ? "captain" : role) as AuthAccountRole;
  return { ok: true, userId: sessionUid, role: resolvedRole };
}

export function validatePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 9) return "أدخل رقم جوال من 9 أرقام (بدون 0).";
  if (!digits.startsWith("5")) return "رقم الجوال يجب أن يبدأ بـ 5.";
  return null;
}

export function validateOtp(otp: string): string | null {
  const digits = otp.replace(/\D/g, "");
  if (!DEMO_OTP.test(digits)) return "أدخل رمز تحقق من 4 إلى 6 أرقام.";
  return null;
}

export function authErrorMessage(code: AuthErrorCode | undefined, mode: AuthenticateMode): string {
  switch (code) {
    case "already_registered":
      return mode === "register"
        ? "هذا الرقم مسجّل مسبقاً. اختر «تسجيل الدخول» بنفس نوع الحساب (راكب أو كابتن)."
        : "تعذر تسجيل الدخول.";
    case "wrong_role":
      return "هذا الرقم مسجّل كنوع حساب آخر (راكب/كابتن). اختر النوع الصحيح أو استخدم رقماً مختلفاً.";
    case "invalid_credentials":
      return mode === "register"
        ? "تعذر إنشاء الحساب. إن كان الرقم مسجّلاً مسبقاً، اختر «تسجيل الدخول» أعلاه."
        : "تعذر تسجيل الدخول. إن لم يكن لديك حساب، اختر «إنشاء حساب» أعلاه.";
    case "rate_limit":
      return "تم إيقاف التسجيل مؤقتاً بسبب محاولات كثيرة. انتظر ساعة ثم جرّب «تسجيل الدخول»، أو أنشئ المستخدم من لوحة Supabase.";
    case "confirm_email":
      return "يُرجى تأكيد البريد من Supabase أو تعطيل تأكيد البريد في لوحة التحكم (Authentication → Email).";
    case "invalid_phone":
      return "رقم الجوال غير صالح.";
    case "invalid_otp":
      return "رمز التحقق غير صالح.";
    case "invalid_name":
      return "أدخل اسمك الكامل (حرفان على الأقل).";
    default:
      return mode === "login"
        ? "تعذر تسجيل الدخول. تأكد من الرقم والرمز ونوع الحساب."
        : "تعذر إنشاء الحساب. جرّب تسجيل الدخول إن كان الرقم مسجّلاً مسبقاً.";
  }
}

export async function authenticateUser(params: AuthenticateParams): Promise<AuthenticateResult> {
  const phone = params.phone.replace(/\D/g, "");
  const otp = params.otp.replace(/\D/g, "");

  const phoneErr = validatePhone(phone);
  if (phoneErr) return { ok: false, errorCode: "invalid_phone" };
  const otpErr = validateOtp(otp);
  if (otpErr) return { ok: false, errorCode: "invalid_otp" };

  if (params.mode === "register" && (!params.displayName || params.displayName.trim().length < 2)) {
    return { ok: false, errorCode: "invalid_name" };
  }

  if (!isSupabaseReady()) {
    return { ok: true, role: params.role };
  }

  const supabase = createSupabaseClient()!;
  const email = authEmail(phone, params.role);
  const password = authPassword(phone);

  if (params.mode === "register") {
    const signUp = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone,
          role: params.role,
          display_name: params.displayName?.trim(),
        },
      },
    });

    if (signUp.error) {
      const apiCode = mapAuthApiError(signUp.error.message);
      if (apiCode === "rate_limit") {
        const existing = await signInPhoneRole(phone, params.role);
        if (existing) {
          return finishAuth(
            existing.userId,
            phone,
            params.role,
            params.displayName,
            params.referralInput,
          );
        }
        return { ok: false, errorCode: "rate_limit" };
      }

      const existing = await signInPhoneRole(phone, params.role);
      if (existing) {
        return finishAuth(
          existing.userId,
          phone,
          params.role,
          params.displayName,
          params.referralInput,
        );
      }

      if (apiCode === "already_registered") {
        return { ok: false, errorCode: "already_registered" };
      }

      if (signUp.error.message.toLowerCase().includes("invalid") && signUp.error.message.toLowerCase().includes("email")) {
        const legacyTry = await supabase.auth.signUp({
          email: legacyAuthEmail(phone, params.role),
          password,
          options: {
            data: {
              phone,
              role: params.role,
              display_name: params.displayName?.trim(),
            },
          },
        });
        if (!legacyTry.error) {
          const uid = legacyTry.data.user?.id ?? legacyTry.data.session?.user?.id;
          if (uid) {
            return finishAuth(uid, phone, params.role, params.displayName, params.referralInput);
          }
        }
        if (legacyTry.error && mapAuthApiError(legacyTry.error.message) === "rate_limit") {
          return { ok: false, errorCode: "rate_limit" };
        }
      }

      return { ok: false, errorCode: apiCode === "unknown" ? "invalid_credentials" : apiCode };
    }

    if (!signUp.data.session?.user?.id) {
      const signedIn = await signInPhoneRole(phone, params.role);
      if (signedIn) {
        return finishAuth(
          signedIn.userId,
          phone,
          params.role,
          params.displayName,
          params.referralInput,
        );
      }
      if (signUp.data.user?.id) {
        return { ok: false, errorCode: "confirm_email" };
      }
      return { ok: false, errorCode: "unknown" };
    }

    return finishAuth(
      signUp.data.session.user.id,
      phone,
      params.role,
      params.displayName,
      params.referralInput,
    );
  }

  const signedIn = await signInPhoneRole(phone, params.role);
  if (!signedIn) {
    return { ok: false, errorCode: "invalid_credentials" };
  }

  return finishAuth(signedIn.userId, phone, params.role, undefined, params.referralInput);
}

/** @deprecated use authenticateUser */
export async function signInRider(phone: string, otp: string, referralInput?: string) {
  const result = await authenticateUser({
    phone,
    otp,
    role: "rider",
    mode: referralInput ? "register" : "login",
    referralInput,
    displayName: phone,
  });
  return { ok: result.ok, userId: result.userId };
}

export async function signOutRider(): Promise<void> {
  await createSupabaseClient()?.auth.signOut();
}

export async function loadRiderAppData(userId: string) {
  const [orders, addresses, notifications, balance, profile, referralStats] = await Promise.all([
    fetchOrdersForUser(userId),
    fetchAddresses(userId),
    fetchNotifications(userId),
    fetchWalletBalance(userId),
    fetchProfile(userId),
    fetchReferralStats(userId),
  ]);
  return {
    orders,
    addresses,
    notifications,
    walletBalance: balance,
    referralCode: profile?.referral_code ?? "",
    referralStats,
    profileRole: profile?.role,
    profileDisplayName: profile?.display_name ?? null,
    profilePhone: profile?.phone ?? null,
  };
}

export async function getCurrentSessionUserId(): Promise<string | null> {
  const supabase = createSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

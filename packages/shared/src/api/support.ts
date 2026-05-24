import type { Database } from "../supabase/database.types";
import { getSupabase, isSupabaseReady } from "../supabase/client";

export type SupportSubmissionRow = Database["public"]["Tables"]["support_submissions"]["Row"];
export type SupportSubmissionStatus = SupportSubmissionRow["status"];

export type SupportCategory =
  | "complaint"
  | "suggestion"
  | "general"
  | "trip"
  | "wallet"
  | "account"
  | "technical";

export const SUPPORT_CATEGORY_LABELS: Record<SupportCategory, string> = {
  complaint: "شكوى",
  suggestion: "اقتراح",
  general: "استفسار عام",
  trip: "رحلة / طلب",
  wallet: "المحفظة والدفع",
  account: "الحساب",
  technical: "مشكلة تقنية",
};

export type SubmitSupportMessageInput = {
  name: string;
  phone?: string | null;
  category: SupportCategory | string;
  subject?: string | null;
  message: string;
};

export function mapSupportSubmitError(err: unknown): string {
  const msg =
    err && typeof err === "object" && "message" in err
      ? String((err as { message: string }).message)
      : err instanceof Error
        ? err.message
        : String(err);
  if (msg.includes("name_required")) return "الاسم مطلوب.";
  if (msg.includes("message_too_short")) return "الرسالة قصيرة جداً (10 أحرف على الأقل).";
  return "تعذّر إرسال الرسالة. حاول مرة أخرى.";
}

export async function submitSupportMessage(input: SubmitSupportMessageInput): Promise<SupportSubmissionRow> {
  if (!isSupabaseReady()) throw new Error("supabase_not_ready");
  const { data, error } = await getSupabase().rpc("submit_support_message", {
    p_name: input.name,
    p_phone: input.phone ?? null,
    p_category: input.category,
    p_subject: input.subject ?? null,
    p_message: input.message,
  });
  if (error) throw error;
  return data as SupportSubmissionRow;
}

export async function fetchSupportSubmissionsAdmin(limit = 200): Promise<SupportSubmissionRow[]> {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getSupabase()
    .from("support_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as SupportSubmissionRow[];
}

export async function updateSupportSubmissionAdmin(
  id: string,
  updates: { status?: SupportSubmissionStatus; admin_notes?: string | null },
): Promise<void> {
  if (!isSupabaseReady()) return;
  const { error } = await getSupabase()
    .from("support_submissions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export function isComplaintOrSuggestion(category: string): boolean {
  return category === "complaint" || category === "suggestion";
}

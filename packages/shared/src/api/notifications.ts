import type { AppNotification } from "../types";
import { fixArabicMojibake } from "../text/fixArabicMojibake";
import { getSupabase, isSupabaseReady } from "../supabase/client";

export async function fetchNotifications(profileId: string): Promise<AppNotification[]> {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getSupabase()
    .from("notifications")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((n) => ({
    id: n.id,
    title: fixArabicMojibake(n.title),
    body: fixArabicMojibake(n.body),
    time: n.time_label ? fixArabicMojibake(n.time_label) : formatNotifTime(n.created_at),
    read: n.read,
    group: n.notif_group,
  }));
}

function formatNotifTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
}

export async function markNotificationRead(id: string): Promise<void> {
  await getSupabase().from("notifications").update({ read: true }).eq("id", id);
}

export async function markAllNotificationsRead(profileId: string): Promise<void> {
  await getSupabase().from("notifications").update({ read: true }).eq("profile_id", profileId);
}

export async function broadcastNotification(params: {
  profileIds?: string[];
  role?: "rider" | "captain";
  title: string;
  body: string;
}): Promise<number> {
  const supabase = getSupabase();
  let profileIds = params.profileIds ?? [];

  if (!profileIds.length && params.role) {
    const { data } = await supabase.from("profiles").select("id").eq("role", params.role);
    profileIds = (data ?? []).map((p) => p.id);
  }

  if (!profileIds.length) {
    const { data } = await supabase.from("profiles").select("id").in("role", ["rider", "captain"]);
    profileIds = (data ?? []).map((p) => p.id);
  }

  const rows = profileIds.map((profile_id) => ({
    profile_id,
    title: params.title,
    body: params.body,
    time_label: "الآن",
    read: false,
    notif_group: "today" as const,
  }));

  if (!rows.length) return 0;
  const { error } = await supabase.from("notifications").insert(rows);
  if (error) throw error;
  return rows.length;
}

export async function notifyProfileAdmin(profileId: string, title: string, body: string): Promise<void> {
  const { error } = await getSupabase().from("notifications").insert({
    profile_id: profileId,
    title,
    body,
    time_label: "الآن",
    read: false,
    notif_group: "today",
  });
  if (error) throw error;
}

export async function fetchAllNotificationsAdmin(limit = 100) {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getSupabase()
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

import type { Profile, EmployeePermissions, UserRole } from "../types";
import { getSupabase, isSupabaseReady } from "../supabase/client";

export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseReady()) return null;
  const { data, error } = await getSupabase().from("profiles").select("*").eq("id", userId).single();
  if (error || !data) return null;
  return data as Profile;
}

export async function fetchStaffProfiles(): Promise<Profile[]> {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("*")
    .in("role", ["rider", "captain", "admin", "employee"])
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function fetchAllProfilesAdmin(): Promise<Profile[]> {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getSupabase().from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function updateProfileRole(userId: string, role: UserRole): Promise<void> {
  const { error } = await getSupabase().from("profiles").update({ role }).eq("id", userId);
  if (error) throw error;
}

export async function updateProfileDisabled(userId: string, disabled: boolean): Promise<void> {
  const { error } = await getSupabase().from("profiles").update({ disabled }).eq("id", userId);
  if (error) throw error;
}

export async function fetchCaptainsAdmin(): Promise<Profile[]> {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("*")
    .eq("role", "captain")
    .eq("disabled", false)
    .order("display_name");
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function fetchEmployeePermissions(profileId: string): Promise<EmployeePermissions | null> {
  const { data, error } = await getSupabase()
    .from("employee_permissions")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) throw error;
  return data as EmployeePermissions | null;
}

export async function fetchAllEmployeePermissions(): Promise<
  (EmployeePermissions & { profile?: Profile })[]
> {
  if (!isSupabaseReady()) return [];
  const supabase = getSupabase();
  const { data: perms, error } = await supabase.from("employee_permissions").select("*");
  if (error) throw error;
  const { data: profiles } = await supabase.from("profiles").select("*").eq("role", "employee");
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p as Profile]));
  return (perms ?? []).map((ep) => ({
    ...(ep as EmployeePermissions),
    profile: profileMap.get(ep.profile_id),
  }));
}

export async function upsertEmployeePermissions(
  profileId: string,
  perms: Omit<EmployeePermissions, "profile_id">,
): Promise<void> {
  const { error } = await getSupabase()
    .from("employee_permissions")
    .upsert({
      profile_id: profileId,
      can_manage_trips: perms.can_manage_trips,
      can_manage_cards: perms.can_manage_cards,
      can_manage_users: perms.can_manage_users,
    });
  if (error) throw error;
}

export async function addEmployeeAdmin(
  profileId: string,
  perms: Omit<EmployeePermissions, "profile_id">,
): Promise<void> {
  await updateProfileRole(profileId, "employee");
  await upsertEmployeePermissions(profileId, perms);
}

export async function removeEmployeeAdmin(profileId: string): Promise<void> {
  await updateProfileRole(profileId, "rider");
  const { error } = await getSupabase().from("employee_permissions").delete().eq("profile_id", profileId);
  if (error) throw error;
}

/** Profiles that can be promoted to employee (excludes admin/employee). */
export async function fetchPromotableProfilesAdmin(): Promise<Profile[]> {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("*")
    .in("role", ["rider", "captain"])
    .eq("disabled", false)
    .order("display_name");
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export function isStaffRole(role: UserRole): boolean {
  return role === "admin" || role === "employee";
}

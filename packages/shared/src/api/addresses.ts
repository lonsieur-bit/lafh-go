import type { SavedAddress } from "../types";
import { getSupabase, isSupabaseReady } from "../supabase/client";

export async function fetchAddresses(profileId: string): Promise<SavedAddress[]> {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getSupabase()
    .from("saved_addresses")
    .select("*")
    .eq("profile_id", profileId)
    .order("is_default", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((a) => ({
    id: a.id,
    label: a.label,
    detail: a.detail,
    isDefault: a.is_default,
  }));
}

export async function addAddress(
  profileId: string,
  address: Omit<SavedAddress, "id">,
): Promise<SavedAddress> {
  const supabase = getSupabase();
  if (address.isDefault) {
    await supabase.from("saved_addresses").update({ is_default: false }).eq("profile_id", profileId);
  }
  const { data, error } = await supabase
    .from("saved_addresses")
    .insert({
      profile_id: profileId,
      label: address.label,
      detail: address.detail,
      is_default: address.isDefault,
    })
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, label: data.label, detail: data.detail, isDefault: data.is_default };
}

export async function updateAddress(
  profileId: string,
  id: string,
  payload: Omit<SavedAddress, "id">,
): Promise<void> {
  const supabase = getSupabase();
  if (payload.isDefault) {
    await supabase.from("saved_addresses").update({ is_default: false }).eq("profile_id", profileId);
  }
  const { error } = await supabase
    .from("saved_addresses")
    .update({ label: payload.label, detail: payload.detail, is_default: payload.isDefault })
    .eq("id", id)
    .eq("profile_id", profileId);
  if (error) throw error;
}

export async function deleteAddress(profileId: string, id: string): Promise<void> {
  const { error } = await getSupabase().from("saved_addresses").delete().eq("id", id).eq("profile_id", profileId);
  if (error) throw error;
}

export async function setDefaultAddress(profileId: string, id: string): Promise<void> {
  const supabase = getSupabase();
  await supabase.from("saved_addresses").update({ is_default: false }).eq("profile_id", profileId);
  await supabase.from("saved_addresses").update({ is_default: true }).eq("id", id);
}

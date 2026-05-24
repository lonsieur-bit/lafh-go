import type { CargoRequestDetail, CargoRequestRow, CargoStatus, Profile } from "../types";
import { getSupabase, isSupabaseReady } from "../supabase/client";

export async function submitCargoRequest(params: {
  riderId: string;
  from: string;
  to: string;
  description: string;
}): Promise<string> {
  const { data, error } = await getSupabase()
    .from("cargo_requests")
    .insert({
      rider_id: params.riderId,
      from_location: params.from,
      to_location: params.to,
      description: params.description,
      status: "pending",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function fetchCargoRequestsAdmin(): Promise<CargoRequestRow[]> {
  if (!isSupabaseReady()) return [];
  const { data, error } = await getSupabase()
    .from("cargo_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CargoRequestRow[];
}

export async function updateCargoStatus(id: string, status: CargoStatus): Promise<void> {
  const { error } = await getSupabase().from("cargo_requests").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function fetchCargoDetailAdmin(id: string): Promise<CargoRequestDetail | null> {
  if (!isSupabaseReady()) return null;
  const supabase = getSupabase();
  const { data: cargo, error } = await supabase.from("cargo_requests").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!cargo) return null;
  let rider: Profile | null = null;
  if (cargo.rider_id) {
    const { data } = await supabase.from("profiles").select("*").eq("id", cargo.rider_id).maybeSingle();
    rider = (data as Profile) ?? null;
  }
  return { cargo: cargo as CargoRequestRow, rider };
}

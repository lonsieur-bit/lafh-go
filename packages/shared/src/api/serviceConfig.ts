import type { ServicePricingConfig, ServiceType, TripFareBreakdown, TripFareInput } from "../types";
import type { Database } from "../supabase/database.types";
import { getSupabase, isSupabaseReady } from "../supabase/client";

export type ServiceConfigRow = Database["public"]["Tables"]["service_config"]["Row"];

export type ServicePricingUpdate = Partial<
  Pick<
    ServiceConfigRow,
    "label_ar" | "base_fare_sar" | "door_fee_sar" | "km_rate_sar" | "wait_minute_rate_sar" | "min_fare_sar"
  >
>;

const FALLBACK_PRICING: Record<ServiceType, Omit<ServicePricingConfig, "label_ar"> & { label_ar: string }> = {
  regular: {
    service_type: "regular",
    label_ar: "رحلة عادية",
    base_fare_sar: 25,
    door_fee_sar: 7,
    km_rate_sar: 2.5,
    wait_minute_rate_sar: 0.5,
    min_fare_sar: 15,
  },
  premium: {
    service_type: "premium",
    label_ar: "رحلة مميزة",
    base_fare_sar: 45,
    door_fee_sar: 7,
    km_rate_sar: 3.5,
    wait_minute_rate_sar: 0.75,
    min_fare_sar: 25,
  },
  family: {
    service_type: "family",
    label_ar: "رحلة عائلية",
    base_fare_sar: 55,
    door_fee_sar: 7,
    km_rate_sar: 3,
    wait_minute_rate_sar: 0.6,
    min_fare_sar: 20,
  },
  bike: {
    service_type: "bike",
    label_ar: "دراجة نارية",
    base_fare_sar: 18,
    door_fee_sar: 6,
    km_rate_sar: 1.8,
    wait_minute_rate_sar: 0.4,
    min_fare_sar: 12,
  },
  cargo: {
    service_type: "cargo",
    label_ar: "نقل بضائع",
    base_fare_sar: 60,
    door_fee_sar: 7,
    km_rate_sar: 4,
    wait_minute_rate_sar: 0.8,
    min_fare_sar: 40,
  },
  tow: {
    service_type: "tow",
    label_ar: "سطحة",
    base_fare_sar: 80,
    door_fee_sar: 7,
    km_rate_sar: 5,
    wait_minute_rate_sar: 1,
    min_fare_sar: 50,
  },
};

function mapRow(row: ServiceConfigRow): ServicePricingConfig {
  return {
    service_type: row.service_type,
    label_ar: row.label_ar,
    base_fare_sar: Number(row.base_fare_sar),
    door_fee_sar: Number(row.door_fee_sar ?? 7),
    km_rate_sar: Number(row.km_rate_sar ?? 2.5),
    wait_minute_rate_sar: Number(row.wait_minute_rate_sar ?? 0.5),
    min_fare_sar: Number(row.min_fare_sar ?? row.base_fare_sar),
  };
}

export async function fetchServiceConfigAdmin(): Promise<ServiceConfigRow[]> {
  if (!isSupabaseReady()) return Object.values(FALLBACK_PRICING) as unknown as ServiceConfigRow[];
  const { data, error } = await getSupabase().from("service_config").select("*").order("service_type");
  if (error) throw error;
  return data ?? [];
}

export async function fetchServicePricingList(): Promise<ServicePricingConfig[]> {
  if (!isSupabaseReady()) return Object.values(FALLBACK_PRICING);
  const { data, error } = await getSupabase().from("service_config").select("*").order("service_type");
  if (error || !data?.length) return Object.values(FALLBACK_PRICING);
  return data.map(mapRow);
}

export async function fetchServicePricing(serviceType: ServiceType): Promise<ServicePricingConfig> {
  const list = await fetchServicePricingList();
  return list.find((s) => s.service_type === serviceType) ?? FALLBACK_PRICING[serviceType];
}

export async function fetchServicePricingMap(): Promise<Record<ServiceType, ServicePricingConfig>> {
  const list = await fetchServicePricingList();
  return list.reduce(
    (acc, row) => {
      acc[row.service_type] = row;
      return acc;
    },
    {} as Record<ServiceType, ServicePricingConfig>,
  );
}

export async function updateServiceConfig(serviceType: ServiceType, updates: ServicePricingUpdate): Promise<void> {
  const { error } = await getSupabase().from("service_config").update(updates).eq("service_type", serviceType);
  if (error) throw error;
}

export function calculateTripFare(config: ServicePricingConfig, input: TripFareInput): TripFareBreakdown {
  const doorFee = config.door_fee_sar;
  const kmCharge = Math.round(input.distanceKm * config.km_rate_sar * 100) / 100;
  const waitCharge = Math.round(input.waitMinutes * config.wait_minute_rate_sar * 100) / 100;
  const extras = input.extrasSar ?? 0;
  const subtotal = Math.round((doorFee + kmCharge + waitCharge + extras) * 100) / 100;
  const total = Math.max(subtotal, config.min_fare_sar);
  return {
    doorFee,
    kmCharge,
    waitCharge,
    extras,
    subtotal,
    minFare: config.min_fare_sar,
    total: Math.round(total * 100) / 100,
  };
}

export { FALLBACK_PRICING };

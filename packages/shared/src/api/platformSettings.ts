import type { DisplayCurrency, PlatformCurrencySettings } from "../currency";
import { DEFAULT_CURRENCY_SETTINGS } from "../currency";
import { getSupabase, isSupabaseReady } from "../supabase/client";

export const DEFAULT_MAINTENANCE_MESSAGE_AR =
  "التطبيق متوقف مؤقتًا للصيانة. نعود قريبًا.";

export const PLATFORM_SETTINGS_QUERY_KEY = ["platform-settings"] as const;

export type PlatformSettings = PlatformCurrencySettings & {
  app_enabled: boolean;
  maintenance_message_ar: string | null;
};

export type PlatformSettingsRow = {
  id: string;
  display_currency: DisplayCurrency;
  usd_per_sar: number;
  syp_per_sar: number;
  app_enabled: boolean;
  maintenance_message_ar: string | null;
  updated_at: string;
};

const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  ...DEFAULT_CURRENCY_SETTINGS,
  app_enabled: true,
  maintenance_message_ar: DEFAULT_MAINTENANCE_MESSAGE_AR,
};

function mapRow(row: PlatformSettingsRow): PlatformSettings {
  return {
    display_currency: row.display_currency,
    usd_per_sar: Number(row.usd_per_sar),
    syp_per_sar: Number(row.syp_per_sar),
    app_enabled: row.app_enabled ?? true,
    maintenance_message_ar: row.maintenance_message_ar ?? DEFAULT_MAINTENANCE_MESSAGE_AR,
  };
}

function mapCurrency(row: PlatformSettingsRow): PlatformCurrencySettings {
  return {
    display_currency: row.display_currency,
    usd_per_sar: Number(row.usd_per_sar),
    syp_per_sar: Number(row.syp_per_sar),
  };
}

export async function fetchPlatformSettings(): Promise<PlatformSettings> {
  if (!isSupabaseReady()) return DEFAULT_PLATFORM_SETTINGS;
  const { data, error } = await getSupabase()
    .from("platform_settings")
    .select("display_currency, usd_per_sar, syp_per_sar, app_enabled, maintenance_message_ar")
    .eq("id", "default")
    .maybeSingle();
  if (error || !data) return DEFAULT_PLATFORM_SETTINGS;
  return mapRow(data as PlatformSettingsRow);
}

export async function fetchPlatformCurrencySettings(): Promise<PlatformCurrencySettings> {
  const settings = await fetchPlatformSettings();
  return {
    display_currency: settings.display_currency,
    usd_per_sar: settings.usd_per_sar,
    syp_per_sar: settings.syp_per_sar,
  };
}

export async function updatePlatformCurrencySettings(updates: {
  display_currency: DisplayCurrency;
  usd_per_sar: number;
  syp_per_sar: number;
}): Promise<void> {
  const { error } = await getSupabase()
    .from("platform_settings")
    .upsert({
      id: "default",
      display_currency: updates.display_currency,
      usd_per_sar: updates.usd_per_sar,
      syp_per_sar: updates.syp_per_sar,
      updated_at: new Date().toISOString(),
    });
  if (error) throw error;
}

export async function updatePlatformAppSettings(updates: {
  app_enabled: boolean;
  maintenance_message_ar?: string | null;
}): Promise<void> {
  const { error } = await getSupabase()
    .from("platform_settings")
    .upsert({
      id: "default",
      app_enabled: updates.app_enabled,
      maintenance_message_ar:
        updates.maintenance_message_ar?.trim() || DEFAULT_MAINTENANCE_MESSAGE_AR,
      updated_at: new Date().toISOString(),
    });
  if (error) throw error;
}

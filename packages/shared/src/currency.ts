/** Display currencies. DB amounts are stored in SAR; convert for display. */

export type DisplayCurrency = "SAR" | "USD" | "SYP";

export interface PlatformCurrencySettings {
  display_currency: DisplayCurrency;
  usd_per_sar: number;
  syp_per_sar: number;
}

export const DEFAULT_CURRENCY_SETTINGS: PlatformCurrencySettings = {
  display_currency: "SAR",
  usd_per_sar: 0.266667,
  syp_per_sar: 3500,
};

export const CURRENCY_OPTIONS: {
  code: DisplayCurrency;
  labelAr: string;
  symbol: string;
}[] = [
  { code: "SAR", labelAr: "ريال سعودي", symbol: "ر.س" },
  { code: "USD", labelAr: "دولار أمريكي", symbol: "$" },
  { code: "SYP", labelAr: "ليرة سورية", symbol: "ل.س" },
];

export function getCurrencyMeta(code: DisplayCurrency) {
  return CURRENCY_OPTIONS.find((c) => c.code === code) ?? CURRENCY_OPTIONS[0];
}

/** Convert amount stored in SAR to display currency. */
export function convertFromSar(amountSar: number, settings: PlatformCurrencySettings): number {
  switch (settings.display_currency) {
    case "USD":
      return amountSar * settings.usd_per_sar;
    case "SYP":
      return amountSar * settings.syp_per_sar;
    default:
      return amountSar;
  }
}

export function formatMoney(
  amountSar: number | null | undefined,
  settings: PlatformCurrencySettings = DEFAULT_CURRENCY_SETTINGS,
  options?: { decimals?: number; suffix?: string },
): string {
  if (amountSar == null || Number.isNaN(amountSar)) return formatMoney(0, settings, options);
  const converted = convertFromSar(Number(amountSar), settings);
  const meta = getCurrencyMeta(settings.display_currency);
  const decimals =
    options?.decimals ??
    (settings.display_currency === "SYP" ? 0 : converted % 1 === 0 ? 0 : 2);
  const value = converted.toFixed(decimals);
  const suffix = options?.suffix ?? "";

  if (settings.display_currency === "USD") {
    return `${meta.symbol}${value}${suffix}`;
  }
  return `${value} ${meta.symbol}${suffix}`;
}

export function formatMoneyPerUnit(
  amountSar: number,
  unit: string,
  settings: PlatformCurrencySettings = DEFAULT_CURRENCY_SETTINGS,
): string {
  return `${formatMoney(amountSar, settings)}/${unit}`;
}

/** @deprecated Use formatMoney with platform settings */
export function formatSar(n: number | null | undefined): string {
  return formatMoney(n, DEFAULT_CURRENCY_SETTINGS);
}

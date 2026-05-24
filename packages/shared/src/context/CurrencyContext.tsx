import { createContext, ReactNode, useCallback, useContext, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  convertFromSar,
  DEFAULT_CURRENCY_SETTINGS,
  formatMoney,
  formatMoneyPerUnit,
  getCurrencyMeta,
  type DisplayCurrency,
  type PlatformCurrencySettings,
} from "../currency";
import { fetchPlatformCurrencySettings } from "../api/platformSettings";

const QUERY_KEY = ["platform-currency"];

type CurrencyContextValue = {
  settings: PlatformCurrencySettings;
  currency: DisplayCurrency;
  symbol: string;
  labelAr: string;
  isLoading: boolean;
  format: (amountSar: number | null | undefined, options?: { decimals?: number; suffix?: string }) => string;
  formatPerUnit: (amountSar: number, unit: string) => string;
  convert: (amountSar: number) => number;
  refresh: () => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const { data: settings = DEFAULT_CURRENCY_SETTINGS, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchPlatformCurrencySettings,
    staleTime: 60_000,
  });

  const meta = getCurrencyMeta(settings.display_currency);

  const format = useCallback(
    (amountSar: number | null | undefined, options?: { decimals?: number; suffix?: string }) =>
      formatMoney(amountSar, settings, options),
    [settings],
  );

  const formatPerUnit = useCallback(
    (amountSar: number, unit: string) => formatMoneyPerUnit(amountSar, unit, settings),
    [settings],
  );

  const convert = useCallback((amountSar: number) => convertFromSar(amountSar, settings), [settings]);

  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: QUERY_KEY });
  }, [qc]);

  const value = useMemo(
    () => ({
      settings,
      currency: settings.display_currency,
      symbol: meta.symbol,
      labelAr: meta.labelAr,
      isLoading,
      format,
      formatPerUnit,
      convert,
      refresh,
    }),
    [settings, meta, isLoading, format, formatPerUnit, convert, refresh],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    const settings = DEFAULT_CURRENCY_SETTINGS;
    const meta = getCurrencyMeta(settings.display_currency);
    return {
      settings,
      currency: settings.display_currency,
      symbol: meta.symbol,
      labelAr: meta.labelAr,
      isLoading: false,
      format: (amountSar: number | null | undefined, options?: { decimals?: number; suffix?: string }) =>
        formatMoney(amountSar, settings, options),
      formatPerUnit: (amountSar: number, unit: string) => formatMoneyPerUnit(amountSar, unit, settings),
      convert: (amountSar: number) => convertFromSar(amountSar, settings),
      refresh: () => {},
    };
  }
  return ctx;
}

export { QUERY_KEY as PLATFORM_CURRENCY_QUERY_KEY };

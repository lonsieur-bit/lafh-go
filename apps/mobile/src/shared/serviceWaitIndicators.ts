import type { ServiceType } from "@luffa/shared";

export type WaitTier = "fastest" | "fast" | "moderate" | "slow";

export type ServiceWaitMeta = {
  tier: WaitTier;
  /** Typical minutes until a captain accepts */
  waitMinutes: number;
  /** 1–4 “signal” bars — more captains nearby */
  availabilityBars: number;
  hintAr: string;
};

/** Mock availability — replace with live captain density API when ready */
export const SERVICE_WAIT_META: Record<ServiceType, ServiceWaitMeta> = {
  bike: {
    tier: "fastest",
    waitMinutes: 2,
    availabilityBars: 4,
    hintAr: "أكثر كباتن متاحين قربك",
  },
  regular: {
    tier: "fast",
    waitMinutes: 3,
    availabilityBars: 4,
    hintAr: "قبول سريع — الأكثر طلباً",
  },
  premium: {
    tier: "moderate",
    waitMinutes: 5,
    availabilityBars: 3,
    hintAr: "كباتن فاخرين — انتظار أطول قليلاً",
  },
  family: {
    tier: "moderate",
    waitMinutes: 7,
    availabilityBars: 2,
    hintAr: "مركبات عائلية أقل توفراً",
  },
  cargo: {
    tier: "slow",
    waitMinutes: 12,
    availabilityBars: 2,
    hintAr: "يتطلب كابتن متخصص",
  },
  tow: {
    tier: "slow",
    waitMinutes: 15,
    availabilityBars: 1,
    hintAr: "سطحة — أطول وقت انتظار",
  },
};

export const FASTEST_SERVICE: ServiceType = "bike";

export function formatWaitMinutes(minutes: number): string {
  return `~${minutes} د`;
}

export function tierBarColor(tier: WaitTier, selected: boolean): string {
  if (selected) return "rgba(255,255,255,0.95)";
  switch (tier) {
    case "fastest":
    case "fast":
      return "#1fa35f";
    case "moderate":
      return "#e0aa08";
    default:
      return "#9ca3af";
  }
}

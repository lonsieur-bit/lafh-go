/** Captain active trip phases — synced with orders.status_label via CAPTAIN_TRIP_STATUS_LABELS. */

export type CaptainTripPhase =
  | "confirmed"
  | "en_route_pickup"
  | "arrived_pickup"
  | "en_route_dropoff"
  | "en_route_next_stop"
  | "arrived_next_stop"
  | "arrived_dropoff"
  | "completed";

export type TripWaypoint = {
  label: string;
  lat?: number | null;
  lng?: number | null;
};

export type CaptainTripContext = {
  phase: CaptainTripPhase;
  /** Index into intermediateStops (between pickup and final destination). */
  stopIndex: number;
  intermediateStops: TripWaypoint[];
  pickup: TripWaypoint;
  destination: TripWaypoint;
  totalSar?: number;
  captainNet?: number;
};

/** Backend status_label values for captain_update_trip_status. */
export const CAPTAIN_TRIP_STATUS_LABELS: Record<CaptainTripPhase, string> = {
  confirmed: "تم تأكيد الطلب",
  en_route_pickup: "في الطريق إلى العميل",
  arrived_pickup: "وصلت للعميل",
  en_route_dropoff: "في الطريق إلى الوجهة",
  en_route_next_stop: "الانتقال إلى النقطة التالية",
  arrived_next_stop: "وصلت للنقطة التالية",
  arrived_dropoff: "وصلت للوجهة",
  completed: "تمت الرحلة",
};

const STATUS_LABEL_TO_PHASE: Record<string, CaptainTripPhase> = {
  [CAPTAIN_TRIP_STATUS_LABELS.confirmed]: "confirmed",
  [CAPTAIN_TRIP_STATUS_LABELS.en_route_pickup]: "en_route_pickup",
  [CAPTAIN_TRIP_STATUS_LABELS.arrived_pickup]: "arrived_pickup",
  [CAPTAIN_TRIP_STATUS_LABELS.en_route_dropoff]: "en_route_dropoff",
  [CAPTAIN_TRIP_STATUS_LABELS.en_route_next_stop]: "en_route_next_stop",
  [CAPTAIN_TRIP_STATUS_LABELS.arrived_next_stop]: "arrived_next_stop",
  [CAPTAIN_TRIP_STATUS_LABELS.arrived_dropoff]: "arrived_dropoff",
  [CAPTAIN_TRIP_STATUS_LABELS.completed]: "completed",
  مكتملة: "completed",
  جاري: "confirmed",
};

export function phaseFromStatusLabel(
  statusLabel: string | null | undefined,
  orderStatus?: string,
): CaptainTripPhase {
  if (orderStatus === "completed") return "completed";
  const label = statusLabel?.trim();
  if (!label) return "confirmed";
  if (STATUS_LABEL_TO_PHASE[label]) return STATUS_LABEL_TO_PHASE[label];
  if (label.includes("تأكيد")) return "confirmed";
  if (label.includes("العميل") && label.includes("في الطريق")) return "en_route_pickup";
  if (label.includes("وصلت") && label.includes("العميل")) return "arrived_pickup";
  if (label.includes("الوجهة") && label.includes("في الطريق")) return "en_route_dropoff";
  if (label.includes("النقطة التالية") && label.includes("الانتقال")) return "en_route_next_stop";
  if (label.includes("وصلت") && label.includes("النقطة")) return "arrived_next_stop";
  if (label.includes("وصلت") && label.includes("الوجهة")) return "arrived_dropoff";
  if (label.includes("تمت") || label.includes("مكتمل")) return "completed";
  return "confirmed";
}

export function inferStopIndexFromTimeline(timelineTitles: string[]): number {
  const arrivedCount = timelineTitles.filter((t) => t.includes("وصلت للنقطة التالية")).length;
  const phase = timelineTitles.at(-1) ?? "";
  if (phase.includes("الانتقال إلى النقطة التالية")) {
    return arrivedCount;
  }
  if (phase.includes("وصلت للنقطة التالية")) {
    return Math.max(0, arrivedCount - 1);
  }
  return Math.max(0, arrivedCount - 1);
}

export function createInitialTripContext(params: {
  pickup: TripWaypoint;
  destination: TripWaypoint;
  intermediateStops?: TripWaypoint[];
  statusLabel?: string | null;
  orderStatus?: string;
  totalSar?: number;
  captainNet?: number;
  timelineTitles?: string[];
}): CaptainTripContext {
  const intermediateStops = params.intermediateStops ?? [];
  const phase = phaseFromStatusLabel(params.statusLabel, params.orderStatus);
  const stopIndex =
    phase === "en_route_next_stop" || phase === "arrived_next_stop"
      ? inferStopIndexFromTimeline(params.timelineTitles ?? [])
      : 0;

  return {
    phase,
    stopIndex: Math.min(stopIndex, Math.max(0, intermediateStops.length - 1)),
    intermediateStops,
    pickup: params.pickup,
    destination: params.destination,
    totalSar: params.totalSar,
    captainNet: params.captainNet,
  };
}

export function hasIntermediateStops(ctx: CaptainTripContext): boolean {
  return ctx.intermediateStops.length > 0;
}

export function getActiveWaypoint(ctx: CaptainTripContext): TripWaypoint {
  switch (ctx.phase) {
    case "confirmed":
    case "en_route_pickup":
    case "arrived_pickup":
      return ctx.pickup;
    case "en_route_next_stop":
    case "arrived_next_stop":
      return ctx.intermediateStops[ctx.stopIndex] ?? ctx.destination;
    case "en_route_dropoff":
    case "arrived_dropoff":
    case "completed":
    default:
      return ctx.destination;
  }
}

export type CaptainTripPhaseUi = {
  title: string;
  subtitle?: string;
  hint?: string;
  primaryCta: string | null;
  secondaryCta?: string;
  mapTarget: "pickup" | "destination" | "next_stop";
  vibrateOnPrimary: boolean;
  showProgress: boolean;
};

export function getCaptainTripPhaseUi(ctx: CaptainTripContext): CaptainTripPhaseUi {
  const nextStop = ctx.intermediateStops[ctx.stopIndex];
  const multi = hasIntermediateStops(ctx);

  switch (ctx.phase) {
    case "confirmed":
      return {
        title: CAPTAIN_TRIP_STATUS_LABELS.confirmed,
        subtitle: "أنت جاهز للانطلاق",
        hint: "حمّل اتجاهات موقع العميل",
        primaryCta: "ابدأ الرحلة",
        secondaryCta: "فتح في الخرائط",
        mapTarget: "pickup",
        vibrateOnPrimary: false,
        showProgress: true,
      };
    case "en_route_pickup":
      return {
        title: CAPTAIN_TRIP_STATUS_LABELS.en_route_pickup,
        subtitle: ctx.pickup.label,
        hint: "تابع المسار حتى موقع العميل",
        primaryCta: "وصلت للعميل",
        secondaryCta: "تحديث الاتجاهات",
        mapTarget: "pickup",
        vibrateOnPrimary: false,
        showProgress: true,
      };
    case "arrived_pickup":
      return {
        title: CAPTAIN_TRIP_STATUS_LABELS.arrived_pickup,
        subtitle: ctx.pickup.label,
        hint: "تأكد من وصولك قبل بدء الرحلة",
        primaryCta: "بدء الرحلة",
        secondaryCta: "فتح في الخرائط",
        mapTarget: "pickup",
        vibrateOnPrimary: true,
        showProgress: true,
      };
    case "en_route_next_stop":
      return {
        title: CAPTAIN_TRIP_STATUS_LABELS.en_route_next_stop,
        subtitle: nextStop?.label ?? "التوقف التالي",
        hint: multi ? `التوقف ${ctx.stopIndex + 1} من ${ctx.intermediateStops.length}` : undefined,
        primaryCta: "وصلت للنقطة التالية",
        secondaryCta: "تحديث الاتجاهات",
        mapTarget: "next_stop",
        vibrateOnPrimary: false,
        showProgress: true,
      };
    case "arrived_next_stop":
      return {
        title: CAPTAIN_TRIP_STATUS_LABELS.arrived_next_stop,
        subtitle: nextStop?.label ?? "التوقف الحالي",
        hint: "أكّد إتمام التوقف قبل المتابعة",
        primaryCta: "الانتقال للتوقف التالية",
        secondaryCta: "تحديث الاتجاهات",
        mapTarget: "next_stop",
        vibrateOnPrimary: true,
        showProgress: true,
      };
    case "en_route_dropoff":
      return {
        title: CAPTAIN_TRIP_STATUS_LABELS.en_route_dropoff,
        subtitle: ctx.destination.label,
        hint: "التقدم نحو الوجهة النهائية",
        primaryCta: "وصلت للوجهة",
        secondaryCta: "تحديث الاتجاهات",
        mapTarget: "destination",
        vibrateOnPrimary: false,
        showProgress: true,
      };
    case "arrived_dropoff":
      return {
        title: CAPTAIN_TRIP_STATUS_LABELS.arrived_dropoff,
        subtitle: ctx.destination.label,
        hint: "راجع تفاصيل الرحلة قبل الإنهاء",
        primaryCta: "إنهاء الرحلة",
        secondaryCta: undefined,
        mapTarget: "destination",
        vibrateOnPrimary: true,
        showProgress: true,
      };
    case "completed":
      return {
        title: CAPTAIN_TRIP_STATUS_LABELS.completed,
        subtitle: undefined,
        hint: undefined,
        primaryCta: "العودة للرئيسية",
        secondaryCta: "عرض الإيصال",
        mapTarget: "destination",
        vibrateOnPrimary: false,
        showProgress: false,
      };
    default:
      return getCaptainTripPhaseUi({ ...ctx, phase: "confirmed" });
  }
}

export function advanceCaptainTripPhase(ctx: CaptainTripContext): CaptainTripContext {
  switch (ctx.phase) {
    case "confirmed":
      return { ...ctx, phase: "en_route_pickup" };
    case "en_route_pickup":
      return { ...ctx, phase: "arrived_pickup" };
    case "arrived_pickup":
      if (ctx.intermediateStops.length > 0) {
        return { ...ctx, phase: "en_route_next_stop", stopIndex: 0 };
      }
      return { ...ctx, phase: "en_route_dropoff" };
    case "en_route_next_stop":
      return { ...ctx, phase: "arrived_next_stop" };
    case "arrived_next_stop":
      if (ctx.stopIndex < ctx.intermediateStops.length - 1) {
        return { ...ctx, phase: "en_route_next_stop", stopIndex: ctx.stopIndex + 1 };
      }
      return { ...ctx, phase: "en_route_dropoff" };
    case "en_route_dropoff":
      return { ...ctx, phase: "arrived_dropoff" };
    case "arrived_dropoff":
      return { ...ctx, phase: "completed" };
    default:
      return ctx;
  }
}

export function getTimelineTitleForPhase(phase: CaptainTripPhase, ctx: CaptainTripContext): string {
  if (phase === "arrived_next_stop" && ctx.intermediateStops[ctx.stopIndex]?.label) {
    return `${CAPTAIN_TRIP_STATUS_LABELS.arrived_next_stop}: ${ctx.intermediateStops[ctx.stopIndex].label}`;
  }
  if (phase === "en_route_next_stop" && ctx.intermediateStops[ctx.stopIndex]?.label) {
    return `${CAPTAIN_TRIP_STATUS_LABELS.en_route_next_stop}: ${ctx.intermediateStops[ctx.stopIndex].label}`;
  }
  return CAPTAIN_TRIP_STATUS_LABELS[phase];
}

export const CAPTAIN_TRIP_PROGRESS_STEPS: { phase: CaptainTripPhase; shortLabel: string }[] = [
  { phase: "confirmed", shortLabel: "تأكيد" },
  { phase: "en_route_pickup", shortLabel: "للعميل" },
  { phase: "arrived_pickup", shortLabel: "العميل" },
  { phase: "en_route_dropoff", shortLabel: "للوجهة" },
  { phase: "completed", shortLabel: "إنهاء" },
];

export function phaseProgressIndex(phase: CaptainTripPhase, multi: boolean): number {
  if (phase === "completed") return 4;
  if (phase === "arrived_dropoff" || phase === "en_route_dropoff") return 3;
  if (multi && (phase === "en_route_next_stop" || phase === "arrived_next_stop")) return 2;
  if (phase === "arrived_pickup") return 2;
  if (phase === "en_route_pickup") return 1;
  return 0;
}

/** Phases before the customer boards (before «بدء الرحلة» toward destination). */
export const CANCELLABLE_TRIP_PHASES: CaptainTripPhase[] = [
  "confirmed",
  "en_route_pickup",
  "arrived_pickup",
];

export function canCancelTripPhase(phase: CaptainTripPhase): boolean {
  return CANCELLABLE_TRIP_PHASES.includes(phase);
}

/** Whether rider or captain may cancel (not after customer is in the vehicle). */
export function canCancelOrder(params: {
  status: string;
  statusLabel?: string | null;
}): boolean {
  if (params.status === "completed" || params.status === "cancelled") return false;
  if (params.status === "pending") return true;
  if (params.status === "active") {
    const phase = phaseFromStatusLabel(params.statusLabel, "active");
    return canCancelTripPhase(phase);
  }
  return false;
}

export function mapCancelOrderError(err: unknown): string {
  const msg =
    err && typeof err === "object" && "message" in err
      ? String((err as { message: string }).message)
      : err instanceof Error
        ? err.message
        : String(err);
  if (msg.includes("customer_onboard_cannot_cancel")) {
    return "لا يمكن الإلغاء بعد صعود العميل إلى السيارة.";
  }
  if (msg.includes("order_not_cancellable")) {
    return "لا يمكن إلغاء هذا الطلب.";
  }
  if (msg.includes("forbidden")) {
    return "غير مسموح لك بإلغاء هذا الطلب.";
  }
  if (msg.includes("not_authenticated")) {
    return "يجب تسجيل الدخول أولاً.";
  }
  return "تعذّر إلغاء الطلب. حاول مرة أخرى.";
}

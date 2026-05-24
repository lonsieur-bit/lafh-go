import type { CaptainOffer, FreightOrderSnapshot, FreightServiceType } from "@luffa/shared";
import { computeCaptainNet } from "@luffa/shared";
import { captainMock } from "@/services/captainMock";

const store = new Map<string, FreightOrderSnapshot>();

export const freightMock = {
  register(snapshot: FreightOrderSnapshot) {
    store.set(snapshot.id, { ...snapshot });
  },

  get(orderId: string): FreightOrderSnapshot | null {
    return store.get(orderId) ?? null;
  },

  listOpenOffers(): CaptainOffer[] {
    return [...store.values()]
      .filter((o) => o.status === "pending" && !o.captainConfirmedMatch)
      .map((o) => ({
        id: o.id,
        from: o.from,
        to: o.to,
        fareTotal: o.riderOfferSar,
        captainNet: computeCaptainNet(o.riderOfferSar),
        distanceKm: 2.5,
        serviceLabel: o.serviceLabel,
        serviceType: o.serviceType,
        isFreight: true,
        riderOfferSar: o.riderOfferSar,
        freightNotes: o.freightNotes,
        pickupLat: 24.7495,
        pickupLng: 46.6753,
      }));
  },

  captainRespond(
    orderId: string,
    captainId: string,
    params: { useRiderPrice: boolean; quoteSar?: number },
  ): FreightOrderSnapshot {
    if (captainMock.getActiveOrderId() || freightMock.getActiveOrderIdForCaptain(captainId)) {
      throw new Error("captain_has_active_trip");
    }
    const o = store.get(orderId);
    if (!o) throw new Error("order_not_available");
    if (o.captainConfirmedMatch) throw new Error("already_responded");
    const quote = params.useRiderPrice ? o.riderOfferSar : (params.quoteSar ?? 0);
    if (!params.useRiderPrice && quote <= 0) throw new Error("invalid_quote");
    const next: FreightOrderSnapshot = {
      ...o,
      captainId,
      captainQuoteSar: quote,
      captainConfirmedMatch: true,
      riderConfirmedMatch: false,
      statusLabel: "بانتظار موافقة الراكب",
    };
    store.set(orderId, next);
    return next;
  },

  riderConfirm(orderId: string): FreightOrderSnapshot {
    const o = store.get(orderId);
    if (!o) throw new Error("order_not_found");
    if (!o.captainConfirmedMatch) throw new Error("no_captain_yet");
    const next: FreightOrderSnapshot = {
      ...o,
      riderConfirmedMatch: true,
      status: "active",
      statusLabel: "نشط — جاري التنفيذ",
    };
    store.set(orderId, next);
    return next;
  },

  cancel(orderId: string): void {
    const o = store.get(orderId);
    if (!o) return;
    store.set(orderId, {
      ...o,
      status: "cancelled",
      statusLabel: "ملغي",
      captainConfirmedMatch: false,
      riderConfirmedMatch: false,
    });
  },

  getActiveOrderIdForCaptain(captainId: string): string | null {
    for (const o of store.values()) {
      if (o.captainId === captainId && o.status === "active") return o.id;
    }
    return null;
  },
};

export function createFreightSnapshot(params: {
  id: string;
  serviceType: FreightServiceType;
  serviceLabel: string;
  from: string;
  to: string;
  riderOfferSar: number;
  freightNotes?: string;
}): FreightOrderSnapshot {
  return {
    id: params.id,
    serviceType: params.serviceType,
    serviceLabel: params.serviceLabel,
    from: params.from,
    to: params.to,
    riderOfferSar: params.riderOfferSar,
    captainQuoteSar: null,
    freightNotes: params.freightNotes ?? null,
    captainId: null,
    captainConfirmedMatch: false,
    riderConfirmedMatch: false,
    status: "pending",
    statusLabel: "بانتظار عروض الكباتن",
  };
}

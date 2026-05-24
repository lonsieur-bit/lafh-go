import type { CaptainOffer } from "@luffa/shared";
import { computeCaptainNet, isFreightServiceType } from "@luffa/shared";
import type { BookingDraft } from "@/state/AppStateContext";

const DEFAULT_LAT = 24.7495;
const DEFAULT_LNG = 46.6753;

export function captainOfferFromBookingDraft(orderId: string, draft: BookingDraft): CaptainOffer {
  const isFreight = isFreightServiceType(draft.serviceType);
  return {
    id: orderId,
    from: draft.from,
    to: draft.to,
    fareTotal: draft.total,
    captainNet: computeCaptainNet(draft.total),
    distanceKm: 2.5,
    pickupLat: draft.pickupLat ?? DEFAULT_LAT,
    pickupLng: draft.pickupLng ?? DEFAULT_LNG,
    serviceType: draft.serviceType,
    serviceLabel: draft.serviceType === "cargo" ? "نقل بضائع" : draft.serviceType === "tow" ? "سطحة" : undefined,
    isFreight,
    riderOfferSar: draft.total,
    freightNotes: draft.freightNotes ?? null,
  };
}

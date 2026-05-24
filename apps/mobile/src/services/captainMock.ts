import type { CaptainOffer, CaptainSession } from "@luffa/shared";
import { CAPTAIN_OFFER_RADIUS_KM, computeCaptainNet } from "@luffa/shared";

const RIYADH = { lat: 24.7495, lng: 46.6753 };

let session: CaptainSession = {
  online: false,
  offlineAlertsEnabled: true,
  lat: RIYADH.lat,
  lng: RIYADH.lng,
};

let pendingOffers: CaptainOffer[] = [
  {
    id: "near-1",
    from: "حي الياسمين",
    to: "طريق الملك فهد",
    fareTotal: 46,
    captainNet: computeCaptainNet(46),
    distanceKm: 2.3,
    pickupLat: 24.8122,
    pickupLng: 46.6417,
  },
];

let activeOrderId: string | null = null;
let lastAcceptedOffer: CaptainOffer | null = null;
let completedTodayNet = 0;
let tripCountToday = 0;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const captainMock = {
  getSession(): CaptainSession {
    return { ...session };
  },

  async setOnline(online: boolean, lat?: number, lng?: number, offlineAlerts?: boolean): Promise<void> {
    session = {
      ...session,
      online,
      lat: lat ?? session.lat,
      lng: lng ?? session.lng,
      offlineAlertsEnabled: offlineAlerts ?? session.offlineAlertsEnabled,
    };
  },

  async fetchPendingNear(lat: number, lng: number): Promise<CaptainOffer[]> {
    return pendingOffers
      .filter((o) => {
        if (!o.pickupLat || !o.pickupLng) return true;
        return haversineKm(lat, lng, o.pickupLat, o.pickupLng) <= CAPTAIN_OFFER_RADIUS_KM;
      })
      .map((o) => ({
        ...o,
        distanceKm:
          o.pickupLat && o.pickupLng
            ? Math.round(haversineKm(lat, lng, o.pickupLat, o.pickupLng) * 10) / 10
            : o.distanceKm,
      }));
  },

  async accept(orderId: string): Promise<void> {
    if (activeOrderId) throw new Error("captain_has_active_trip");
    const offer = pendingOffers.find((o) => o.id === orderId);
    if (!offer) throw new Error("order_not_available");
    pendingOffers = pendingOffers.filter((o) => o.id !== orderId);
    activeOrderId = orderId;
    lastAcceptedOffer = offer;
    session.online = true;
  },

  getActiveOrderId(): string | null {
    return activeOrderId;
  },

  getActiveOffer(): CaptainOffer | null {
    if (!activeOrderId) return null;
    return (
      lastAcceptedOffer ??
      pendingOffers.find((o) => o.id === activeOrderId) ?? {
        id: activeOrderId,
        from: "حي الياسمين",
        to: "طريق الملك فهد",
        fareTotal: 46,
        captainNet: computeCaptainNet(46),
        distanceKm: 2.3,
        pickupLat: RIYADH.lat,
        pickupLng: RIYADH.lng,
        dropoffLat: 24.77,
        dropoffLng: 46.72,
        intermediateStops: [{ label: "حي النرجس" }],
      }
    );
  },

  async completeTrip(orderId: string): Promise<number> {
    const offer = pendingOffers.find((o) => o.id === orderId) ?? {
      fareTotal: 46,
      captainNet: computeCaptainNet(46),
    };
    const net = "captainNet" in offer ? offer.captainNet : computeCaptainNet(46);
    completedTodayNet += net;
    tripCountToday += 1;
    if (activeOrderId === orderId) activeOrderId = null;
    return net;
  },

  cancel(orderId: string): void {
    if (activeOrderId === orderId) activeOrderId = null;
    pendingOffers = pendingOffers.filter((o) => o.id !== orderId);
    if (lastAcceptedOffer?.id === orderId) lastAcceptedOffer = null;
  },

  decline(orderId: string): void {
    pendingOffers = pendingOffers.filter((o) => o.id !== orderId);
  },

  async earningsSummary(): Promise<{ todayNet: number; weekNet: number; tripCountToday: number }> {
    return { todayNet: completedTodayNet, weekNet: completedTodayNet, tripCountToday };
  },

  addPendingOffer(offer: CaptainOffer): void {
    if (!pendingOffers.some((o) => o.id === offer.id)) {
      pendingOffers = [offer, ...pendingOffers];
    }
  },
};

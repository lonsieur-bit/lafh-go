import { useCallback, useEffect, useRef, useState } from "react";
import {
  acceptOrder,
  cancelOrder,
  completeCaptainTrip,
  fetchCaptainActiveOrder,
  fetchCaptainEarningsSummary,
  fetchCaptainSession,
  fetchPendingOrdersNear,
  isSupabaseReady,
  notifyProfileAdmin,
  setCaptainOnline,
  mapCancelOrderError,
  type CaptainOffer,
} from "@luffa/shared";
import { captainMock } from "@/services/captainMock";
import { freightMock } from "@/services/freightMock";
import { captainFreightRespond } from "@luffa/shared";
import { subscribeCaptainPendingOrders } from "@/lib/captainPendingOrdersRealtime";
import { useAppState } from "@/state/AppStateContext";

const DEFAULT_LAT = 24.7495;
const DEFAULT_LNG = 46.6753;
const OFFER_POLL_MS = 8000;
const OFFER_REFRESH_DEBOUNCE_MS = 1200;

function mapAcceptError(err: unknown): string {
  const msg =
    err && typeof err === "object" && "message" in err
      ? String((err as { message: string }).message)
      : err instanceof Error
        ? err.message
        : String(err);
  if (msg.includes("not_captain")) {
    return "حسابك غير مسجّل ككابتن. سجّل الدخول من بوابة الكابتن أو تواصل مع الدعم.";
  }
  if (msg.includes("order_not_available")) {
    return "الطلب غير متاح — ربما قبله كابتن آخر.";
  }
  if (msg.includes("captain_has_active_trip")) {
    return "لديك رحلة نشطة. أنهِها أولاً قبل قبول طلب جديد.";
  }
  if (msg.includes("not_authenticated")) {
    return "يجب تسجيل الدخول أولاً.";
  }
  return "تعذّر قبول الطلب. حاول مرة أخرى.";
}

type UseCaptainOpsOptions = {
  /** Poll + Realtime for incoming offers — only one screen should enable this. */
  watchOffers?: boolean;
};

export function useCaptainOps(options: UseCaptainOpsOptions = {}) {
  const watchOffers = options.watchOffers ?? false;
  const {
    userId,
    captainOnline,
    setCaptainOnline,
    offlineAlertsEnabled,
    setOfflineAlertsEnabled,
    setCaptainActiveOrderId,
    refreshCaptainWallet,
  } = useAppState();

  const [offers, setOffers] = useState<CaptainOffer[]>([]);
  const [earnings, setEarnings] = useState({ todayNet: 0, weekNet: 0, tripCountToday: 0 });
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [location, setLocation] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [loading, setLoading] = useState(false);
  const locationRef = useRef(location);
  locationRef.current = location;
  const refreshOffersTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshOffersInFlightRef = useRef(false);
  const scheduleRefreshOffersRef = useRef<() => void>(() => {});

  const refreshEarnings = useCallback(async () => {
    if (isSupabaseReady() && userId) {
      const s = await fetchCaptainEarningsSummary(userId);
      setEarnings(s);
    } else {
      const s = await captainMock.earningsSummary();
      setEarnings(s);
    }
  }, [userId]);

  const refreshOffers = useCallback(async () => {
    if (!captainOnline || activeOrderId) {
      setOffers([]);
      return;
    }
    if (isSupabaseReady() && !userId) {
      setOffers([]);
      return;
    }
    const { lat, lng } = locationRef.current;
    if (isSupabaseReady()) {
      const list = await fetchPendingOrdersNear(lat, lng);
      setOffers(list);
    } else {
      const ride = await captainMock.fetchPendingNear(lat, lng);
      const freight = freightMock.listOpenOffers();
      setOffers([...freight, ...ride.filter((o) => !o.isFreight)]);
    }
  }, [activeOrderId, captainOnline, userId]);

  const scheduleRefreshOffers = useCallback(() => {
    if (refreshOffersTimerRef.current) clearTimeout(refreshOffersTimerRef.current);
    refreshOffersTimerRef.current = setTimeout(() => {
      if (refreshOffersInFlightRef.current) return;
      refreshOffersInFlightRef.current = true;
      void refreshOffers().finally(() => {
        refreshOffersInFlightRef.current = false;
      });
    }, OFFER_REFRESH_DEBOUNCE_MS);
  }, [refreshOffers]);

  scheduleRefreshOffersRef.current = scheduleRefreshOffers;

  const refreshActive = useCallback(async () => {
    if (isSupabaseReady() && userId) {
      const row = await fetchCaptainActiveOrder(userId);
      const id = row?.id ?? null;
      setActiveOrderId(id);
      setCaptainActiveOrderId(id);
    } else if (userId) {
      const freightActive = freightMock.getActiveOrderIdForCaptain(userId);
      const id = freightActive ?? captainMock.getActiveOrderId();
      setActiveOrderId(id);
      setCaptainActiveOrderId(id);
    } else {
      setActiveOrderId(null);
      setCaptainActiveOrderId(null);
    }
  }, [userId, setCaptainActiveOrderId]);

  const goOnline = useCallback(
    async (lat: number, lng: number) => {
      if (isSupabaseReady() && !userId) {
        throw new Error("يجب تسجيل الدخول ككابتن أولاً");
      }
      setLocation({ lat, lng });
      if (isSupabaseReady()) {
        await setCaptainOnline(true, lat, lng, offlineAlertsEnabled);
      } else {
        await captainMock.setOnline(true, lat, lng, offlineAlertsEnabled);
      }
      setCaptainOnline(true);
      await refreshOffers();
      await refreshActive();
    },
    [offlineAlertsEnabled, refreshActive, refreshOffers, setCaptainOnline],
  );

  const updateCaptainLocation = useCallback(
    async (lat: number, lng: number) => {
      setLocation({ lat, lng });
      if (!captainOnline) return;
      if (isSupabaseReady()) {
        await setCaptainOnline(true, lat, lng, offlineAlertsEnabled);
      }
    },
    [captainOnline, offlineAlertsEnabled],
  );

  const goOffline = useCallback(async () => {
    if (isSupabaseReady()) {
      await setCaptainOnline(false, location.lat, location.lng, offlineAlertsEnabled);
    } else {
      await captainMock.setOnline(false);
    }
    setCaptainOnline(false);
    setOffers([]);
  }, [location, offlineAlertsEnabled, setCaptainOnline]);

  const assertNoActiveTrip = useCallback(() => {
    if (activeOrderId) {
      throw new Error(mapAcceptError(new Error("captain_has_active_trip")));
    }
  }, [activeOrderId]);

  const respondFreightOffer = useCallback(
    async (offer: CaptainOffer, params: { useRiderPrice: boolean; quoteSar?: number }) => {
      assertNoActiveTrip();
      setLoading(true);
      try {
        if (isSupabaseReady() && userId) {
          await captainFreightRespond(offer.id, params);
        } else if (userId) {
          freightMock.captainRespond(offer.id, userId, params);
        }
        setOffers((prev) => prev.filter((o) => o.id !== offer.id));
      } catch (err) {
        throw new Error(mapAcceptError(err));
      } finally {
        setLoading(false);
      }
    },
    [userId, assertNoActiveTrip],
  );

  const acceptOffer = useCallback(
    async (offer: CaptainOffer, riderId?: string) => {
      if (offer.isFreight) {
        await respondFreightOffer(offer, { useRiderPrice: true });
        return offer.id;
      }
      assertNoActiveTrip();
      setLoading(true);
      try {
        if (isSupabaseReady()) {
          await acceptOrder(offer.id);
          if (riderId) {
            await notifyProfileAdmin(riderId, "تم قبول طلبك", "كابتن في الطريق إليك");
          }
        } else {
          await captainMock.accept(offer.id);
        }
        setActiveOrderId(offer.id);
        setCaptainActiveOrderId(offer.id);
        setOffers((prev) => prev.filter((o) => o.id !== offer.id));
        return offer.id;
      } catch (err) {
        throw new Error(mapAcceptError(err));
      } finally {
        setLoading(false);
      }
    },
    [assertNoActiveTrip, respondFreightOffer, setCaptainActiveOrderId],
  );

  const declineOffer = useCallback((offerId: string) => {
    if (!isSupabaseReady()) captainMock.decline(offerId);
    setOffers((prev) => prev.filter((o) => o.id !== offerId));
  }, []);

  const cancelTrip = useCallback(
    async (orderId: string) => {
      setLoading(true);
      try {
        if (isSupabaseReady()) {
          await cancelOrder(orderId);
          await refreshCaptainWallet();
        } else {
          captainMock.cancel(orderId);
          freightMock.cancel(orderId);
        }
        setActiveOrderId(null);
        setCaptainActiveOrderId(null);
        await refreshOffers();
        return true;
      } catch (err) {
        throw new Error(mapCancelOrderError(err));
      } finally {
        setLoading(false);
      }
    },
    [refreshCaptainWallet, refreshOffers, setCaptainActiveOrderId],
  );

  const completeTrip = useCallback(
    async (orderId: string) => {
      setLoading(true);
      try {
        if (isSupabaseReady()) {
          await completeCaptainTrip(orderId);
          await refreshCaptainWallet();
        } else {
          await captainMock.completeTrip(orderId);
        }
        setActiveOrderId(null);
        setCaptainActiveOrderId(null);
        await refreshEarnings();
        return true;
      } finally {
        setLoading(false);
      }
    },
    [refreshCaptainWallet, refreshEarnings, setCaptainActiveOrderId],
  );

  useEffect(() => {
    void refreshEarnings();
    if (isSupabaseReady() && userId) {
      void fetchCaptainSession(userId).then((s) => {
        if (s) {
          setCaptainOnline(s.online);
          if (s.lat != null && s.lng != null) setLocation({ lat: s.lat, lng: s.lng });
          setOfflineAlertsEnabled(s.offlineAlertsEnabled);
        }
      });
    }
    void refreshActive();
  }, [userId]);

  useEffect(() => {
    if (!watchOffers || !captainOnline) return;
    void refreshOffers();
    const id = setInterval(() => void refreshOffers(), OFFER_POLL_MS);
    return () => clearInterval(id);
  }, [watchOffers, captainOnline, refreshOffers]);

  useEffect(() => {
    if (!watchOffers || !captainOnline || !userId || !isSupabaseReady()) return;

    const unsubscribe = subscribeCaptainPendingOrders(userId, () => {
      scheduleRefreshOffersRef.current();
    });

    return () => {
      if (refreshOffersTimerRef.current) clearTimeout(refreshOffersTimerRef.current);
      unsubscribe();
    };
  }, [watchOffers, captainOnline, userId]);

  return {
    offers,
    earnings,
    activeOrderId,
    location,
    setLocation,
    loading,
    goOnline,
    goOffline,
    updateCaptainLocation,
    acceptOffer,
    respondFreightOffer,
    declineOffer,
    completeTrip,
    cancelTrip,
    refreshOffers,
    refreshEarnings,
    refreshActive,
  };
}

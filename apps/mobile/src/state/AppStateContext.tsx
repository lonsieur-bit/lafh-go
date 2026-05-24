import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  authenticateUser,
  getCurrentSessionUserId,
  loadRiderAppData,
  signOutRider,
  type AuthAccountRole,
  type AuthErrorCode,
} from "@/lib/supabaseAuth";
import {
  addAddress as addAddressApi,
  deleteAddress as deleteAddressApi,
  deductWallet,
  insertOrderFromCheckout,
  createSupabaseClient,
  isSupabaseReady,
  markAllNotificationsRead as markAllReadApi,
  markNotificationRead as markReadApi,
  notifyProfileAdmin,
  setDefaultAddress as setDefaultAddressApi,
  topUpWallet as topUpWalletApi,
  updateAddress as updateAddressApi,
  fetchOrdersForUser,
  redeemGiftCard as redeemGiftCardApi,
  fetchWalletBalance,
  fetchWalletTransactions,
} from "@luffa/shared";
import { captainMock } from "@/services/captainMock";
import { captainOfferFromBookingDraft } from "@/lib/captainOfferFromDraft";
import { createFreightSnapshot, freightMock } from "@/services/freightMock";
import { isFreightServiceType } from "@luffa/shared";
import type { CaptainOffer } from "@luffa/shared";
import {
  mockAddresses,
  mockNotifications,
  mockOrders,
  mockTransactions,
  mockCaptainTransactions,
  mockWalletBalance,
} from "@/shared/mockData";
import type { AppNotification, ChatBubble, Order, SavedAddress, WalletTransaction } from "@/shared/types";

export type PaymentMethod = "mada" | "mastercard" | "applepay" | "cash" | "wallet";
type ServiceType = "regular" | "premium" | "family" | "bike" | "cargo" | "tow";

const serviceBaseFare: Record<ServiceType, number> = {
  regular: 25,
  premium: 45,
  family: 55,
  bike: 18,
  cargo: 70,
  tow: 95,
};
type AppRole = "rider" | "captain";
type AuthMethod = "whatsapp" | "google" | "sms";

export interface BookingDraft {
  serviceType: ServiceType;
  baseFare: number;
  extrasTotal: number;
  discount: number;
  vat: number;
  total: number;
  from: string;
  to: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  freightNotes?: string;
}

interface AppStateValue {
  userId: string | null;
  appRole: AppRole;
  setAppRole(role: AppRole): void;
  captainOnline: boolean;
  setCaptainOnline(value: boolean): void;
  offlineAlertsEnabled: boolean;
  setOfflineAlertsEnabled(value: boolean): void;
  nearbyCaptainRequest: {
    id: string;
    from: string;
    to: string;
    fareTotal: number;
    captainNet: number;
    distanceKm: number;
  } | null;
  acceptNearbyCaptainRequest(): void;
  captainActiveOrderId: string | null;
  setCaptainActiveOrderId(id: string | null): void;
  refreshCaptainWallet(): Promise<void>;
  isLoggedIn: boolean;
  /** False until initial Supabase session check finishes (avoids auth flash / double login). */
  authReady: boolean;
  pendingAuth: { mode: "login" | "register"; role?: AuthAccountRole } | null;
  setPendingAuth(intent: { mode: "login" | "register"; role?: AuthAccountRole } | null): void;
  lastAuthPhone: string;
  setLastAuthPhone(phone: string): void;
  authMethod: AuthMethod;
  setAuthMethod(method: AuthMethod): void;
  myReferralCode: string;
  profileDisplayName: string | null;
  profilePhone: string | null;
  login(phone: string, otp: string, role: AuthAccountRole): Promise<true | AuthErrorCode>;
  register(
    phone: string,
    otp: string,
    role: AuthAccountRole,
    displayName: string,
    referralInput?: string,
  ): Promise<true | AuthErrorCode>;
  logout(): void;
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  topUpWallet(amount: number): void;
  redeemGiftCard(code: string): Promise<number>;
  orders: Order[];
  addOrderFromCheckout(method: PaymentMethod): Promise<string>;
  prepareBooking(serviceType: ServiceType): void;
  setBookingDraft(draft: BookingDraft): void;
  bookingDraft: BookingDraft;
  referralStats: { invitesCount: number; totalEarnings: number };
  notifications: AppNotification[];
  markNotificationRead(id: string): void;
  markAllNotificationsRead(): void;
  addresses: SavedAddress[];
  addAddress(address: Omit<SavedAddress, "id">): void;
  updateAddress(id: string, payload: Omit<SavedAddress, "id">): void;
  setDefaultAddress(id: string): void;
  deleteAddress(id: string): void;
  chatMessages: ChatBubble[];
  sendChatMessage(text: string): void;
}

const defaultDraft: BookingDraft = {
  serviceType: "premium",
  baseFare: 45,
  extrasTotal: 5,
  discount: 15,
  vat: 5.25,
  total: 40.25,
  from: "حي الياسمين",
  to: "مطار الملك خالد الدولي",
};

const AppStateContext = createContext<AppStateValue | null>(null);
const supabaseConfigured = isSupabaseReady();
const initialWallet = supabaseConfigured
  ? 0
  : Number((mockWalletBalance.match(/\d+/)?.[0] ?? "120").trim());

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [appRole, setAppRole] = useState<AppRole>("rider");
  const [captainOnline, setCaptainOnline] = useState(false);
  const [offlineAlertsEnabled, setOfflineAlertsEnabled] = useState(true);
  const [nearbyCaptainRequest, setNearbyCaptainRequest] = useState<CaptainOffer | null>(null);
  const [captainActiveOrderId, setCaptainActiveOrderId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authReady, setAuthReady] = useState(!supabaseConfigured);
  const [pendingAuth, setPendingAuth] = useState<{ mode: "login" | "register"; role?: AuthAccountRole } | null>(
    null,
  );
  const [lastAuthPhone, setLastAuthPhone] = useState("");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("whatsapp");
  const [myReferralCode, setMyReferralCode] = useState(`LF${Math.floor(100000 + Math.random() * 900000)}`);
  const [profileDisplayName, setProfileDisplayName] = useState<string | null>(null);
  const [profilePhone, setProfilePhone] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState({ invitesCount: 3, totalEarnings: 45 });

  const hydrateFromSupabase = useCallback(async (uid: string) => {
    const [data, txs] = await Promise.all([loadRiderAppData(uid), fetchWalletTransactions(uid)]);
    setOrders(data.orders);
    setAddresses(data.addresses);
    setNotifications(data.notifications);
    setWalletBalance(data.walletBalance || initialWallet);
    setWalletTransactions(txs);
    if (data.referralCode) setMyReferralCode(data.referralCode);
    setReferralStats(data.referralStats);
    setProfileDisplayName(data.profileDisplayName);
    setProfilePhone(data.profilePhone);
    if (data.profileRole === "captain" || data.profileRole === "rider") {
      setAppRole(data.profileRole);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseReady()) {
      setAuthReady(true);
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      const uid = await getCurrentSessionUserId();
      if (cancelled) return;
      if (uid) {
        setUserId(uid);
        setIsLoggedIn(true);
        setPendingAuth(null);
        try {
          await hydrateFromSupabase(uid);
        } catch {
          /* session valid; profile data can load later */
        }
      }
      setAuthReady(true);
    };

    void bootstrap();

    const supabase = createSupabaseClient();
    if (!supabase) return () => {
      cancelled = true;
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.id) {
        setUserId(session.user.id);
        setIsLoggedIn(true);
        setPendingAuth(null);
        void hydrateFromSupabase(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setUserId(null);
        setIsLoggedIn(false);
        setProfileDisplayName(null);
        setProfilePhone(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [hydrateFromSupabase]);
  const [walletBalance, setWalletBalance] = useState(initialWallet);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(
    supabaseConfigured ? [] : mockTransactions,
  );

  useEffect(() => {
    if (supabaseConfigured) return;
    setWalletTransactions(appRole === "captain" ? mockCaptainTransactions : mockTransactions);
  }, [appRole, supabaseConfigured]);
  const [orders, setOrders] = useState<Order[]>(supabaseConfigured ? [] : mockOrders);
  const [bookingDraft, setBookingDraft] = useState<BookingDraft>(defaultDraft);
  const [notifications, setNotifications] = useState<AppNotification[]>(
    supabaseConfigured ? [] : mockNotifications,
  );
  const [addresses, setAddresses] = useState<SavedAddress[]>(supabaseConfigured ? [] : mockAddresses);
  const [chatMessages, setChatMessages] = useState<ChatBubble[]>(
    supabaseConfigured
      ? []
      : [
          { id: "seed-1", text: "أهلاً أحمد، أنا في الطريق إليك", role: "peer", time: "14:32" },
          { id: "seed-2", text: "أهلاً خالد. شكراً! أنا أمام البوابة الرئيسية", role: "user", time: "14:33" },
        ],
  );

  const value = useMemo<AppStateValue>(
    () => ({
      appRole,
      setAppRole,
      captainOnline,
      setCaptainOnline,
      offlineAlertsEnabled,
      setOfflineAlertsEnabled,
      nearbyCaptainRequest,
      userId,
      acceptNearbyCaptainRequest: () => {
        if (!nearbyCaptainRequest) return;
        void captainMock.accept(nearbyCaptainRequest.id).then(() => {
          setCaptainActiveOrderId(nearbyCaptainRequest.id);
          setCaptainOnline(true);
          setNearbyCaptainRequest(null);
        });
      },
      captainActiveOrderId,
      setCaptainActiveOrderId,
      refreshCaptainWallet: async () => {
        if (!userId || !isSupabaseReady()) return;
        const [balance, txs] = await Promise.all([
          fetchWalletBalance(userId),
          fetchWalletTransactions(userId),
        ]);
        setWalletBalance(balance);
        setWalletTransactions(txs);
      },
      isLoggedIn,
      authReady,
      pendingAuth,
      setPendingAuth,
      lastAuthPhone,
      setLastAuthPhone,
      authMethod,
      setAuthMethod,
      myReferralCode,
      profileDisplayName,
      profilePhone,
      login: async (phone, otp, role) => {
        try {
          const result = await authenticateUser({ phone, otp, role, mode: "login" });
          if (!result.ok) return result.errorCode ?? false;
          if (isSupabaseReady() && !result.userId) return "unknown";

          const normalized = phone.replace(/\D/g, "");
          setProfilePhone(`+966${normalized}`);
          setPendingAuth(null);
          setAppRole(result.role ?? role);
          setUserId(result.userId ?? null);
          setIsLoggedIn(true);

          if (result.userId) {
            try {
              await hydrateFromSupabase(result.userId);
            } catch {
              /* keep session; home can refetch */
            }
          }
          return true;
        } catch {
          return "unknown";
        }
      },
      register: async (phone, otp, role, displayName, referralInput) => {
        try {
          const result = await authenticateUser({
            phone,
            otp,
            role,
            mode: "register",
            displayName,
            referralInput,
          });
          if (!result.ok) return result.errorCode ?? false;
          if (isSupabaseReady() && !result.userId) return "unknown";

          const normalized = phone.replace(/\D/g, "");
          setProfileDisplayName(displayName.trim());
          setProfilePhone(`+966${normalized}`);
          setPendingAuth(null);
          setAppRole(result.role ?? role);
          setUserId(result.userId ?? null);
          setIsLoggedIn(true);

          if (result.userId) {
            try {
              await hydrateFromSupabase(result.userId);
            } catch {
              /* keep session */
            }
          }
          return true;
        } catch {
          return "unknown";
        }
      },
      logout: () => {
        void signOutRider();
        setUserId(null);
        setIsLoggedIn(false);
        setPendingAuth(null);
        setProfileDisplayName(null);
        setProfilePhone(null);
        if (isSupabaseReady()) {
          setOrders([]);
          setWalletBalance(0);
          setWalletTransactions([]);
          setNotifications([]);
          setAddresses([]);
        }
      },
      walletBalance,
      walletTransactions,
      topUpWallet: (amount) => {
        setWalletBalance((prev) => prev + amount);
        if (userId && isSupabaseReady()) {
          void topUpWalletApi(userId, amount).then(async () => {
            const [balance, txs] = await Promise.all([
              fetchWalletBalance(userId),
              fetchWalletTransactions(userId),
            ]);
            setWalletBalance(balance);
            setWalletTransactions(txs);
          });
        }
      },
      redeemGiftCard: async (code) => {
        if (!isLoggedIn) throw new Error("يجب تسجيل الدخول أولاً");
        if (isSupabaseReady() && userId) {
          const amount = await redeemGiftCardApi(code);
          const [balance, txs] = await Promise.all([
            fetchWalletBalance(userId),
            fetchWalletTransactions(userId),
          ]);
          setWalletBalance(balance);
          setWalletTransactions(txs);
          return amount;
        }
        const trimmed = code.trim().toUpperCase();
        if (!/^(LFG|RHC)-\d{4}-\d{4}$/.test(trimmed)) throw new Error("كود غير صالح");
        const mockAmount = 50;
        setWalletBalance((prev) => prev + mockAmount);
        setWalletTransactions((prev) => [
          {
            id: `gift-${Date.now()}`,
            title: "بطاقة هدية",
            subtitle: trimmed,
            amount: `+${mockAmount} ر.س`,
            positive: true,
            time: "الآن",
          },
          ...prev,
        ]);
        return mockAmount;
      },
      orders,
      notifications,
      addresses,
      chatMessages,
      bookingDraft,
      referralStats,
      setBookingDraft,
      markNotificationRead: (id) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        if (isSupabaseReady()) void markReadApi(id);
      },
      markAllNotificationsRead: () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        if (userId && isSupabaseReady()) void markAllReadApi(userId);
      },
      addAddress: (address) => {
        if (userId && isSupabaseReady()) {
          void addAddressApi(userId, address).then((a) => setAddresses((prev) => [a, ...prev]));
          return;
        }
        setAddresses((prev) => {
          const id = `a-${Date.now()}`;
          const base = address.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
          return [{ ...address, id }, ...base];
        });
      },
      updateAddress: (id, payload) => {
        if (userId && isSupabaseReady()) void updateAddressApi(userId, id, payload);
        setAddresses((prev) => prev.map((a) => (a.id === id ? { ...payload, id } : a)));
      },
      setDefaultAddress: (id) => {
        if (userId && isSupabaseReady()) void setDefaultAddressApi(userId, id);
        setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
      },
      deleteAddress: (id) => {
        if (userId && isSupabaseReady()) void deleteAddressApi(userId, id);
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      },
      sendChatMessage: (text) => {
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        setChatMessages((prev) => [...prev, { id: `m-${Date.now()}`, text, role: "user", time }]);
      },
      prepareBooking: (serviceType) => {
        const baseFare = serviceBaseFare[serviceType];
        const extrasTotal = serviceType === "cargo" || serviceType === "tow" ? 15 : 5;
        const discount = Math.round((baseFare + extrasTotal) * 0.2 * 100) / 100;
        const vat = Math.round((baseFare + extrasTotal - discount) * 0.15 * 100) / 100;
        const total = Math.round((baseFare + extrasTotal - discount + vat) * 100) / 100;
        setBookingDraft({
          serviceType,
          baseFare,
          extrasTotal,
          discount,
          vat,
          total,
          from: "حي الياسمين",
          to: "مطار الملك خالد الدولي",
        });
      },
      addOrderFromCheckout: async (method) => {
        const fallbackId = `lf-${Math.floor(1000 + Math.random() * 9000)}`;
        const serviceLabelMap: Record<ServiceType, string> = {
          premium: "رحلة مميزة",
          family: "رحلة عائلية",
          regular: "رحلة عادية",
          bike: "دراجة نارية",
          cargo: "نقل بضائع",
          tow: "سطحة",
        };
        let resolvedId = fallbackId;
        const createdAt = new Date();
        const date = `${createdAt.getFullYear()}/${String(createdAt.getMonth() + 1).padStart(2, "0")}/${String(
          createdAt.getDate(),
        ).padStart(2, "0")}`;
        const time = `${String(createdAt.getHours()).padStart(2, "0")}:${String(createdAt.getMinutes()).padStart(2, "0")}`;

        const isFreight = isFreightServiceType(bookingDraft.serviceType);

        if (isSupabaseReady() && !userId) {
          throw new Error("يجب تسجيل الدخول لإنشاء الطلب");
        }
        if (userId && isSupabaseReady()) {
          resolvedId = await insertOrderFromCheckout({
            riderId: userId,
            serviceType: bookingDraft.serviceType,
            serviceLabel: serviceLabelMap[bookingDraft.serviceType],
            from: bookingDraft.from,
            to: bookingDraft.to,
            pickupLat: bookingDraft.pickupLat,
            pickupLng: bookingDraft.pickupLng,
            dropoffLat: bookingDraft.dropoffLat,
            dropoffLng: bookingDraft.dropoffLng,
            baseFare: bookingDraft.baseFare,
            extrasTotal: bookingDraft.extrasTotal,
            discount: bookingDraft.discount,
            vat: bookingDraft.vat,
            total: bookingDraft.total,
            paymentMethod: method,
            freightNotes: bookingDraft.freightNotes,
            timelineTitles: isFreight
              ? ["تم إنشاء الطلب", "بانتظار عروض الكباتن"]
              : ["تم إنشاء الطلب", "بانتظار كابتن"],
          });
          if (method === "wallet") {
            void deductWallet(userId, bookingDraft.total, `#${resolvedId.toUpperCase()}`);
          }
        }

        if (!isSupabaseReady()) {
          if (isFreight) {
            freightMock.register(
              createFreightSnapshot({
                id: resolvedId,
                serviceType: bookingDraft.serviceType,
                serviceLabel: serviceLabelMap[bookingDraft.serviceType],
                from: bookingDraft.from,
                to: bookingDraft.to,
                riderOfferSar: bookingDraft.total,
                freightNotes: bookingDraft.freightNotes,
              }),
            );
          } else {
            captainMock.addPendingOffer(captainOfferFromBookingDraft(resolvedId, bookingDraft));
          }
        }
        const newOrder: Order = {
          id: resolvedId,
          displayId: `#${resolvedId.toUpperCase()}`,
          from: bookingDraft.from,
          to: bookingDraft.to,
          date,
          time,
          price: `${bookingDraft.total.toFixed(2)} ر.س`,
          status: "pending",
          statusLabel: isFreight ? "بانتظار عروض الكباتن" : "بانتظار كابتن",
          rating: 0,
          serviceLabel: serviceLabelMap[bookingDraft.serviceType],
          driver: {
            id: "d-live",
            name: "خالد الأحمد",
            nameEn: "Khaled Al-Ahmad",
            rating: 4.9,
            trips: 950,
            carModel: "تويوتا كامري 2022",
            plate: "A B C 1234",
            avatarColor: "bg-primary/15 text-primary",
          },
          timeline: [{ id: "t1", title: "تم تأكيد الطلب", time, done: true }],
          receipt: [
            { label: "أجرة الرحلة", amount: `${bookingDraft.baseFare.toFixed(2)} ر.س` },
            { label: "الإضافات", amount: `${bookingDraft.extrasTotal.toFixed(2)} ر.س` },
            { label: "ضريبة القيمة المضافة", amount: `${bookingDraft.vat.toFixed(2)} ر.س` },
          ],
          discount: bookingDraft.discount > 0 ? `${bookingDraft.discount.toFixed(2)} ر.س` : undefined,
          total: `${bookingDraft.total.toFixed(2)} ر.س`,
        };
        setOrders((prev) => [newOrder, ...prev]);
        if (method === "wallet") setWalletBalance((prev) => Math.max(0, prev - bookingDraft.total));
        if (userId && isSupabaseReady()) {
          void fetchOrdersForUser(userId).then((o) => {
            if (o.length) setOrders(o);
          });
        }
        return resolvedId;
      },
    }),
    [
      userId,
      appRole,
      captainOnline,
      captainActiveOrderId,
      offlineAlertsEnabled,
      nearbyCaptainRequest,
      isLoggedIn,
      authReady,
      pendingAuth,
      authMethod,
      myReferralCode,
      profileDisplayName,
      profilePhone,
      referralStats,
      walletBalance,
      walletTransactions,
      orders,
      notifications,
      addresses,
      chatMessages,
      bookingDraft,
      hydrateFromSupabase,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}

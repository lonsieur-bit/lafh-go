import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  mockAddresses,
  mockNotifications,
  mockOrders,
  mockTransactions,
  mockWalletBalance,
} from "@/lib/mockData";
import type { WalletTransaction } from "@/lib/types";
import {
  getCurrentSessionUserId,
  loadRiderAppData,
  signInRider,
  signOutRider,
} from "@/lib/supabaseAuth";
import type { AppNotification, Order, SavedAddress } from "@/lib/types";
import {
  addAddress as addAddressApi,
  deleteAddress as deleteAddressApi,
  deductWallet,
  fetchOrdersForUser,
  insertOrderFromCheckout,
  isSupabaseReady,
  markAllNotificationsRead as markAllReadApi,
  markNotificationRead as markReadApi,
  setDefaultAddress as setDefaultAddressApi,
  topUpWallet as topUpWalletApi,
  updateAddress as updateAddressApi,
  redeemGiftCard as redeemGiftCardApi,
  fetchWalletBalance,
  fetchWalletTransactions,
} from "@luffa/shared";

type PaymentMethod = "mada" | "applepay" | "cash" | "wallet";
type ServiceType = "regular" | "premium" | "family" | "bike" | "cargo" | "tow";
type AppRole = "rider" | "captain";

interface BookingDraft {
  serviceType: ServiceType;
  baseFare: number;
  extrasTotal: number;
  discount: number;
  vat: number;
  total: number;
}

interface AppStateValue {
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
  isLoggedIn: boolean;
  login(phone: string, otp: string, referralInput?: string): Promise<boolean>;
  logout(): void;
  authMethod: "whatsapp" | "google" | "sms";
  setAuthMethod(method: "whatsapp" | "google" | "sms"): void;
  myReferralCode: string;
  referralStats: { invitesCount: number; totalEarnings: number };
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  topUpWallet(amount: number): void;
  redeemGiftCard(code: string): Promise<number>;
  orders: Order[];
  addOrderFromCheckout(method: PaymentMethod): string;
  bookingDraft: BookingDraft;
  setBookingDraft(draft: BookingDraft): void;
  notifications: AppNotification[];
  markNotificationRead(id: string): void;
  markAllNotificationsRead(): void;
  addresses: SavedAddress[];
  addAddress(address: Omit<SavedAddress, "id">): void;
  updateAddress(id: string, payload: Omit<SavedAddress, "id">): void;
  deleteAddress(id: string): void;
  setDefaultAddress(id: string): void;
  prepareBooking(serviceType: ServiceType): void;
  advanceOrderStep(orderId: string): void;
}

const defaultDraft: BookingDraft = {
  serviceType: "premium",
  baseFare: 45,
  extrasTotal: 5,
  discount: 15,
  vat: 5.25,
  total: 40.25,
};

const AppStateContext = createContext<AppStateValue | null>(null);
const initialWallet = Number((mockWalletBalance.match(/\d+/)?.[0] ?? "120").trim());

function serviceLabelFor(type: ServiceType): string {
  if (type === "premium") return "رحلة مميزة";
  if (type === "family") return "رحلة عائلية";
  if (type === "bike") return "دراجة نارية";
  if (type === "cargo") return "نقل بضائع";
  if (type === "tow") return "سطحة";
  return "رحلة عادية";
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [appRole, setAppRole] = useState<AppRole>("rider");
  const [captainOnline, setCaptainOnline] = useState(false);
  const [offlineAlertsEnabled, setOfflineAlertsEnabled] = useState(true);
  const [nearbyCaptainRequest, setNearbyCaptainRequest] = useState<AppStateValue["nearbyCaptainRequest"]>({
    id: "near-1",
    from: "حي الياسمين",
    to: "طريق الملك فهد",
    fareTotal: 46,
    captainNet: 36.8,
    distanceKm: 2.3,
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMethod, setAuthMethod] = useState<"whatsapp" | "google" | "sms">("whatsapp");
  const [myReferralCode, setMyReferralCode] = useState(`LF${Math.floor(100000 + Math.random() * 900000)}`);
  const [referralStats, setReferralStats] = useState({ invitesCount: 0, totalEarnings: 0 });
  const [walletBalance, setWalletBalance] = useState(initialWallet);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(mockTransactions);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [bookingDraft, setBookingDraft] = useState<BookingDraft>(defaultDraft);
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);
  const [addresses, setAddresses] = useState<SavedAddress[]>(mockAddresses);

  const hydrateFromSupabase = useCallback(async (uid: string) => {
    const data = await loadRiderAppData(uid);
    setOrders(data.orders.length ? data.orders : mockOrders);
    setAddresses(data.addresses.length ? data.addresses : mockAddresses);
    setNotifications(data.notifications.length ? data.notifications : mockNotifications);
    setWalletBalance(data.walletBalance || initialWallet);
    setWalletTransactions(data.transactions.length ? data.transactions : mockTransactions);
    if (data.referralCode) setMyReferralCode(data.referralCode);
    setReferralStats(data.referralStats);
  }, []);

  useEffect(() => {
    if (!isSupabaseReady()) return;
    void getCurrentSessionUserId().then((uid) => {
      if (uid) {
        setUserId(uid);
        setIsLoggedIn(true);
        void hydrateFromSupabase(uid);
      }
    });
  }, [hydrateFromSupabase]);

  const value = useMemo<AppStateValue>(
    () => ({
      isLoggedIn,
      appRole,
      setAppRole,
      captainOnline,
      setCaptainOnline,
      offlineAlertsEnabled,
      setOfflineAlertsEnabled,
      nearbyCaptainRequest,
      acceptNearbyCaptainRequest: () => {
        if (!nearbyCaptainRequest) return;
        setCaptainOnline(true);
        setNearbyCaptainRequest(null);
      },
      authMethod,
      setAuthMethod,
      myReferralCode,
      referralStats,
      login: async (phone, otp, referralInput) => {
        const result = await signInRider(phone, otp, referralInput);
        if (!result.ok) return false;
        setIsLoggedIn(true);
        if (result.userId) {
          setUserId(result.userId);
          await hydrateFromSupabase(result.userId);
        } else {
          const code = (referralInput ?? "").trim().toUpperCase();
          if (code.length >= 4 && code !== myReferralCode) {
            setReferralStats((prev) => ({
              invitesCount: prev.invitesCount + 1,
              totalEarnings: prev.totalEarnings + 25,
            }));
          }
        }
        return true;
      },
      logout: () => {
        void signOutRider();
        setUserId(null);
        setIsLoggedIn(false);
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
        if (!/^(LFG|RHC)-\d{4}-\d{4}$/.test(trimmed)) {
          throw new Error("كود غير صالح");
        }
        const mockAmount = 50;
        setWalletBalance((prev) => prev + mockAmount);
        return mockAmount;
      },
      orders,
      bookingDraft,
      setBookingDraft,
      notifications,
      markNotificationRead: (id) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        if (isSupabaseReady()) void markReadApi(id);
      },
      markAllNotificationsRead: () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        if (userId && isSupabaseReady()) void markAllReadApi(userId);
      },
      addresses,
      addAddress: (address) => {
        if (userId && isSupabaseReady()) {
          void addAddressApi(userId, address).then((a) => setAddresses((prev) => [...prev, a]));
          return;
        }
        setAddresses((prev) => {
          const newAddress: SavedAddress = { ...address, id: `a${Date.now()}` };
          if (newAddress.isDefault) return [...prev.map((a) => ({ ...a, isDefault: false })), newAddress];
          return [...prev, newAddress];
        });
      },
      updateAddress: (id, payload) => {
        if (userId && isSupabaseReady()) void updateAddressApi(userId, id, payload);
        setAddresses((prev) =>
          prev.map((a) => {
            if (a.id === id) return { ...payload, id };
            return payload.isDefault ? { ...a, isDefault: false } : a;
          }),
        );
      },
      deleteAddress: (id) => {
        if (userId && isSupabaseReady()) void deleteAddressApi(userId, id);
        setAddresses((prev) => {
          const next = prev.filter((a) => a.id !== id);
          if (next.length > 0 && !next.some((a) => a.isDefault)) {
            return next.map((a, idx) => (idx === 0 ? { ...a, isDefault: true } : a));
          }
          return next;
        });
      },
      setDefaultAddress: (id) => {
        if (userId && isSupabaseReady()) void setDefaultAddressApi(userId, id);
        setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
      },
      prepareBooking: (serviceType) => {
        const baseFare = serviceType === "premium" ? 45 : serviceType === "family" ? 55 : 25;
        const extrasTotal = 5;
        const discount = Math.round((baseFare + extrasTotal) * 0.3 * 100) / 100;
        const vat = Math.round((baseFare + extrasTotal - discount) * 0.15 * 100) / 100;
        const total = Math.round((baseFare + extrasTotal - discount + vat) * 100) / 100;
        setBookingDraft({ serviceType, baseFare, extrasTotal, discount, vat, total });
      },
      advanceOrderStep: (orderId) =>
        setOrders((prev) =>
          prev.map((order) => {
            if (order.id !== orderId || order.status === "cancelled" || order.status === "completed") return order;
            const nextPendingIdx = order.timeline.findIndex((s) => !s.done);
            if (nextPendingIdx === -1) return order;
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, "0");
            const mm = String(now.getMinutes()).padStart(2, "0");
            const timeline = order.timeline.map((step, idx) =>
              idx === nextPendingIdx ? { ...step, done: true, time: step.time ?? `${hh}:${mm}` } : step,
            );
            const completed = timeline.every((s) => s.done);
            return {
              ...order,
              timeline,
              status: completed ? "completed" : "active",
              statusLabel: completed ? "مكتمل" : "جاري",
              rating: completed ? order.rating || 4.8 : order.rating,
            };
          }),
        ),
      addOrderFromCheckout: (method) => {
        const runLocal = () => {
          const id = `lf-${Math.floor(1000 + Math.random() * 9000)}`;
          const now = new Date();
          const hh = String(now.getHours()).padStart(2, "0");
          const mm = String(now.getMinutes()).padStart(2, "0");
          const date = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
          const total = bookingDraft.total.toFixed(2);
          const newOrder: Order = {
            id,
            displayId: `#${id.toUpperCase()}`,
            from: "حي الياسمين",
            to: "مطار الملك خالد الدولي",
            date,
            time: `${hh}:${mm}`,
            price: `${total} ر.س`,
            status: "active",
            statusLabel: "جاري",
            rating: 0,
            serviceLabel: serviceLabelFor(bookingDraft.serviceType),
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
            timeline: [
              { id: "t1", title: "تم تأكيد الطلب", time: `${hh}:${mm}`, done: true },
              { id: "t2", title: "السائق في الطريق", done: true },
              { id: "t3", title: "بدء الرحلة", done: false },
              { id: "t4", title: "تم الوصول", done: false },
            ],
            receipt: [
              { label: "أجرة الرحلة", amount: `${bookingDraft.baseFare.toFixed(2)} ر.س` },
              { label: "إضافات", amount: `${bookingDraft.extrasTotal.toFixed(2)} ر.س` },
              { label: "ضريبة القيمة المضافة", amount: `${bookingDraft.vat.toFixed(2)} ر.س` },
            ],
            discount: bookingDraft.discount > 0 ? `-${bookingDraft.discount.toFixed(2)} ر.س` : undefined,
            total: `${total} ر.س`,
          };
          setOrders((prev) => [newOrder, ...prev]);
          if (method === "wallet") setWalletBalance((prev) => Math.max(0, prev - bookingDraft.total));
          return id;
        };

        if (userId && isSupabaseReady()) {
          void insertOrderFromCheckout({
            riderId: userId,
            serviceType: bookingDraft.serviceType,
            serviceLabel: serviceLabelFor(bookingDraft.serviceType),
            from: "حي الياسمين",
            to: "مطار الملك خالد الدولي",
            baseFare: bookingDraft.baseFare,
            extrasTotal: bookingDraft.extrasTotal,
            discount: bookingDraft.discount,
            vat: bookingDraft.vat,
            total: bookingDraft.total,
            paymentMethod: method,
            timelineTitles: ["تم تأكيد الطلب", "السائق في الطريق", "بدء الرحلة", "تم الوصول"],
          }).then((id) => {
            if (method === "wallet") void deductWallet(userId, bookingDraft.total, `#${id.toUpperCase()}`);
            void fetchOrdersForUser(userId).then((o) => o.length && setOrders(o));
          });
          return runLocal();
        }
        return runLocal();
      },
    }),
    [
      appRole,
      captainOnline,
      offlineAlertsEnabled,
      nearbyCaptainRequest,
      isLoggedIn,
      authMethod,
      myReferralCode,
      referralStats,
      walletBalance,
      walletTransactions,
      orders,
      bookingDraft,
      notifications,
      addresses,
      userId,
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

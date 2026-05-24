import type { AppNotification, Order, SavedAddress, WalletTransaction } from "@/shared/types";

const driverDefault = {
  id: "d1",
  name: "سعود المطيري",
  nameEn: "Saud Al-Mutairi",
  rating: 4.9,
  trips: 1200,
  carModel: "تويوتا كامري 2022",
  plate: "A B C 1234",
  avatarColor: "bg-primary/15 text-primary",
};

export const mockOrders: Order[] = [
  {
    id: "lf-2847",
    displayId: "#LF-2847",
    from: "حي الياسمين",
    to: "مطار الملك خالد",
    date: "2024/03/15",
    time: "14:30",
    price: "45 ر.س",
    status: "completed",
    statusLabel: "مكتمل",
    rating: 4.8,
    serviceLabel: "توصيل ركاب",
    driver: driverDefault,
    timeline: [
      { id: "t1", title: "تم تأكيد الطلب", time: "14:22", done: true },
      { id: "t2", title: "السائق في الطريق", time: "14:25", done: true },
      { id: "t3", title: "بدء الرحلة", time: "14:30", done: true },
      { id: "t4", title: "تم الوصول", time: "14:52", done: true },
    ],
    receipt: [
      { label: "أجرة الرحلة", amount: "38 ر.س" },
      { label: "رسوم الخدمة", amount: "4 ر.س" },
      { label: "ضريبة القيمة المضافة", amount: "3 ر.س" },
    ],
    discount: "-5 ر.س",
    total: "45 ر.س",
  },
  {
    id: "lf-2831",
    displayId: "#LF-2831",
    from: "جامعة الملك سعود",
    to: "العليا مول",
    date: "2024/03/14",
    time: "10:15",
    price: "22 ر.س",
    status: "completed",
    statusLabel: "مكتمل",
    rating: 5,
    serviceLabel: "توصيل ركاب",
    driver: { ...driverDefault, name: "فهد العتيبي", rating: 4.8 },
    timeline: [
      { id: "t1", title: "تم تأكيد الطلب", time: "10:05", done: true },
      { id: "t2", title: "السائق في الطريق", time: "10:08", done: true },
      { id: "t3", title: "بدء الرحلة", time: "10:12", done: true },
      { id: "t4", title: "تم الوصول", time: "10:28", done: true },
    ],
    receipt: [{ label: "أجرة الرحلة", amount: "22 ر.س" }],
    total: "22 ر.س",
  },
  {
    id: "lf-2828",
    displayId: "#LF-2828",
    from: "حي النخيل",
    to: "حي الملقا",
    date: "2024/03/13",
    time: "18:00",
    price: "18 ر.س",
    status: "cancelled",
    statusLabel: "ملغي",
    rating: 0,
    serviceLabel: "توصيل ركاب",
    driver: driverDefault,
    timeline: [
      { id: "t1", title: "تم تأكيد الطلب", time: "17:50", done: true },
      { id: "t2", title: "تم الإلغاء", time: "18:00", done: true },
    ],
    receipt: [{ label: "أجرة الرحلة", amount: "18 ر.س" }],
    total: "18 ر.س",
  },
];

export const mockAddresses: SavedAddress[] = [
  {
    id: "a1",
    label: "المنزل",
    detail: "الرياض، حي النخيل، شارع الأمير تركي",
    isDefault: true,
  },
];

export const mockNotifications: AppNotification[] = [
  {
    id: "n1",
    title: "خصم 30% على أول رحلة",
    body: "استخدم كود LUFFA30 عند الحجز.",
    time: "منذ 10 دقائق",
    read: false,
    group: "today",
  },
  {
    id: "n2",
    title: "تم تأكيد رحلتك",
    body: "السائق في الطريق إلى نقطة الانطلاق.",
    time: "منذ ساعة",
    read: false,
    group: "today",
  },
  {
    id: "n3",
    title: "تقييم الرحلة",
    body: "كيف كانت تجربتك مع لفة؟",
    time: "أمس",
    read: true,
    group: "earlier",
  },
  {
    id: "n4",
    title: "تم إضافة رصيد",
    body: "تم شحن محفظتك بنجاح.",
    time: "2024/03/10",
    read: true,
    group: "earlier",
  },
];

export const mockTransactions: WalletTransaction[] = [
  {
    id: "w1",
    title: "شحن المحفظة",
    subtitle: "مباشر عبر البطاقة",
    amount: "+100 ر.س",
    positive: true,
    time: "2024/03/10 — 14:30",
  },
  {
    id: "w2",
    title: "دفع رحلة",
    subtitle: "#LF-2847",
    amount: "-45 ر.س",
    positive: false,
    time: "2024/03/15 — 14:52",
  },
  {
    id: "w3",
    title: "استرداد",
    subtitle: "إلغاء طلب #LF-2820",
    amount: "+18 ر.س",
    positive: true,
    time: "2024/03/13 — 18:05",
  },
];

/** Captain earnings tab (offline demo). */
export const mockCaptainTransactions: WalletTransaction[] = [
  {
    id: "cw1",
    title: "أرباح رحلة",
    subtitle: "#LF-2847",
    amount: "+36.80 ر.س",
    positive: true,
    time: "2025/05/24 — 14:52",
  },
  {
    id: "cw2",
    title: "أرباح رحلة",
    subtitle: "#LF-2812",
    amount: "+28.00 ر.س",
    positive: true,
    time: "2025/05/23 — 09:15",
  },
  {
    id: "cw3",
    title: "بطاقة هدية",
    subtitle: "شحن رصيد الأرباح",
    amount: "+50 ر.س",
    positive: true,
    time: "2025/05/22 — 18:05",
  },
];

export const mockWalletBalance = "120 ر.س";

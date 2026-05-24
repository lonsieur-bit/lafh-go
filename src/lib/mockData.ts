import type {
  AppNotification,
  Order,
  SavedAddress,
  WalletTransaction,
} from "@/lib/types";

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
    rating: 5.0,
    serviceLabel: "توصيل ركاب",
    driver: {
      ...driverDefault,
      id: "d2",
      name: "عبدالله العتيبي",
      nameEn: "Abdullah Al-Otaibi",
      carModel: "هيونداي أونتا 2021",
    },
    timeline: [
      { id: "t1", title: "تم تأكيد الطلب", time: "10:05", done: true },
      { id: "t2", title: "تم الوصول", time: "10:15", done: true },
    ],
    receipt: [
      { label: "أجرة الرحلة", amount: "20 ر.س" },
      { label: "رسوم الخدمة", amount: "2 ر.س" },
    ],
    total: "22 ر.س",
  },
  {
    id: "lf-2820",
    displayId: "#LF-2820",
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
      { id: "t2", title: "السائق في الطريق", time: "17:55", done: true },
      { id: "t3", title: "تم الإلغاء", time: "18:00", done: true },
    ],
    receipt: [{ label: "رسوم الإلغاء", amount: "0 ر.س" }],
    total: "0 ر.س",
  },
];

export function getOrderById(id: string): Order | undefined {
  return mockOrders.find((o) => o.id === id);
}

export const mockAddresses: SavedAddress[] = [
  {
    id: "a1",
    label: "المنزل",
    detail: "الرياض، حي النخيل، شارع الأمير تركي",
    isDefault: true,
  },
  {
    id: "a2",
    label: "العمل",
    detail: "طريق الملك فهد، برج الأعمال، الطابق 12",
    isDefault: false,
  },
  {
    id: "a3",
    label: "جامعة الملك سعود",
    detail: "الرياض، حي النزهة، المدخل الرئيسي",
    isDefault: false,
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

export const mockWalletBalance = "120 ر.س";

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

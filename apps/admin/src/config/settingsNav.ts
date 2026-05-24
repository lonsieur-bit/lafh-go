import type { LucideIcon } from "lucide-react";
import { Coins, LayoutGrid, Power, Receipt } from "lucide-react";

export type SettingsNavItem = {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
  end?: boolean;
};

export const settingsNavItems: SettingsNavItem[] = [
  {
    to: "/settings",
    label: "كل الإعدادات",
    description: "اختر القسم الذي تريد تعديله",
    icon: LayoutGrid,
    end: true,
  },
  {
    to: "/settings/app",
    label: "تشغيل التطبيق",
    description: "تفعيل أو إيقاف التطبيق ورسالة الصيانة",
    icon: Power,
  },
  {
    to: "/settings/currency",
    label: "عملة العرض",
    description: "العملة المعروضة وأسعار التحويل",
    icon: Coins,
  },
  {
    to: "/settings/pricing",
    label: "أسعار الخدمات",
    description: "فتحة الباب، الكيلومتر، والانتظار لكل خدمة",
    icon: Receipt,
  },
];

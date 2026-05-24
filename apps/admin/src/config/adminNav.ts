import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Car,
  Users,
  Wallet,
  CreditCard,
  UserCog,
  Bell,
  Gift,
  Settings,
  MessageSquare,
} from "lucide-react";

export type AdminNavPerm = "trips" | "cards" | "users" | "all";

export type AdminNavItem = {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
  perm: AdminNavPerm;
  /** Hide from home quick-nav (e.g. current page) */
  hideOnHome?: boolean;
};

export const adminNavItems: AdminNavItem[] = [
  {
    to: "/orders",
    label: "الطلبات",
    description: "رحلات، بضائع، وتتبع الحالة",
    icon: Car,
    perm: "trips",
  },
  {
    to: "/users",
    label: "المستخدمون",
    description: "العملاء والكباتن والحسابات",
    icon: Users,
    perm: "users",
  },
  {
    to: "/wallet",
    label: "المحفظة",
    description: "أرصدة ومعاملات المحفظة",
    icon: Wallet,
    perm: "all",
  },
  {
    to: "/recharge-cards",
    label: "بطاقات الهدايا",
    description: "إنشاء وإدارة بطاقات الشحن",
    icon: CreditCard,
    perm: "cards",
  },
  {
    to: "/employees",
    label: "الموظفون",
    description: "صلاحيات فريق العمل",
    icon: UserCog,
    perm: "users",
  },
  {
    to: "/notifications",
    label: "الإشعارات",
    description: "إرسال تنبيهات للمستخدمين",
    icon: Bell,
    perm: "all",
  },
  {
    to: "/complaints",
    label: "شكاوى وإقتراحات",
    description: "نموذج التواصل من التطبيق",
    icon: MessageSquare,
    perm: "all",
  },
  {
    to: "/referrals",
    label: "الإحالات",
    description: "برنامج الإحالة والمكافآت",
    icon: Gift,
    perm: "all",
  },
  {
    to: "/settings",
    label: "الإعدادات",
    description: "التطبيق، العملة، والأسعار",
    icon: Settings,
    perm: "all",
  },
];

/** Sidebar-only: overview link */
export const adminSidebarNavItems: AdminNavItem[] = [
  {
    to: "/",
    label: "نظرة عامة",
    description: "ملخص المنصة والاختصارات",
    icon: LayoutDashboard,
    perm: "all",
    hideOnHome: true,
  },
  ...adminNavItems,
];

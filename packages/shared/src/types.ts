/** Shared domain types for Luffa Go (web, admin, mobile). */

export type UserRole = "rider" | "captain" | "admin" | "employee";
export type OrderStatus = "pending" | "active" | "completed" | "cancelled";
export type RechargeCardStatus = "new" | "used";
export type ServiceType = "regular" | "premium" | "family" | "bike" | "cargo" | "tow";
export type CargoStatus = "pending" | "assigned" | "completed" | "cancelled";
export type NotificationGroup = "today" | "earlier";
export type PaymentMethod = "mada" | "applepay" | "cash" | "wallet";

export interface DriverInfo {
  id: string;
  name: string;
  nameEn: string;
  rating: number;
  trips: number;
  carModel: string;
  plate: string;
  avatarColor: string;
}

export interface OrderTimelineStep {
  id: string;
  title: string;
  time?: string;
  done: boolean;
}

export interface OrderLineItem {
  label: string;
  amount: string;
}

/** Rider or captain on an order — for in-app contact (chat / call). */
export interface OrderContact {
  id: string;
  name: string;
  phone: string | null;
}

export interface Order {
  id: string;
  displayId: string;
  from: string;
  to: string;
  date: string;
  time: string;
  price: string;
  status: OrderStatus;
  statusLabel: string;
  rating: number;
  serviceLabel: string;
  driver: DriverInfo;
  timeline: OrderTimelineStep[];
  receipt: OrderLineItem[];
  discount?: string;
  total: string;
  pickupLat?: number | null;
  pickupLng?: number | null;
  dropoffLat?: number | null;
  dropoffLng?: number | null;
  rider?: OrderContact | null;
  captain?: OrderContact | null;
}

export interface SavedAddress {
  id: string;
  label: string;
  detail: string;
  isDefault: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  group: NotificationGroup;
}

export interface WalletTransaction {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  positive: boolean;
  time: string;
}

export interface Profile {
  id: string;
  phone: string | null;
  display_name: string | null;
  role: UserRole;
  referral_code: string | null;
  disabled: boolean;
}

export interface EmployeePermissions {
  profile_id: string;
  can_manage_trips: boolean;
  can_manage_cards: boolean;
  can_manage_users: boolean;
}

export interface PartnerStore {
  id: string;
  name: string;
  area: string | null;
  contact_phone: string | null;
  active: boolean;
  created_at: string;
}

export interface GiftCardBatch {
  id: string;
  store_id: string;
  label: string;
  amount_sar: number;
  quantity: number;
  created_by: string | null;
  created_at: string;
  store?: PartnerStore;
}

export interface RechargeCardRow {
  id: string;
  code: string;
  amount_sar: number;
  status: RechargeCardStatus;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  batch_id?: string | null;
  store_id?: string | null;
  batch?: GiftCardBatch | null;
  store?: PartnerStore | null;
}

export interface GiftCardFilters {
  storeId?: string;
  batchId?: string;
  status?: RechargeCardStatus;
}

export interface CargoRequestRow {
  id: string;
  rider_id: string | null;
  from_location: string | null;
  to_location: string | null;
  description: string | null;
  status: CargoStatus;
  created_at: string;
}

export interface DriverRow {
  id: string;
  profile_id: string | null;
  name_ar: string;
  name_en: string | null;
  rating: number;
  trips_count: number;
  car_model: string | null;
  plate: string | null;
  avatar_color: string | null;
}

export interface AdminOrderDetail {
  order: import("./supabase/database.types").Database["public"]["Tables"]["orders"]["Row"];
  rider: Profile | null;
  captain: Profile | null;
  driver: DriverRow | null;
  timeline: OrderTimelineStep[];
  receipt: OrderLineItem[];
}

export interface CargoRequestDetail {
  cargo: CargoRequestRow;
  rider: Profile | null;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "معلق",
  active: "جاري",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export interface ServicePricingConfig {
  service_type: ServiceType;
  label_ar: string;
  base_fare_sar: number;
  door_fee_sar: number;
  km_rate_sar: number;
  wait_minute_rate_sar: number;
  min_fare_sar: number;
}

export interface TripFareInput {
  distanceKm: number;
  waitMinutes: number;
  extrasSar?: number;
}

export interface TripFareBreakdown {
  doorFee: number;
  kmCharge: number;
  waitCharge: number;
  extras: number;
  subtotal: number;
  minFare: number;
  total: number;
}

export interface ReferralProgramSettings {
  default_reward_sar: number;
  invitee_bonus_sar: number;
  enabled: boolean;
  description_ar: string | null;
}

export interface ReferralRow {
  id: string;
  inviter_id: string | null;
  invitee_id: string | null;
  referral_code: string | null;
  reward_sar: number;
  created_at: string;
  inviter?: Profile | null;
  invitee?: Profile | null;
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  regular: "عادي",
  premium: "مميز",
  family: "عائلي",
  bike: "دراجة",
  cargo: "بضائع",
  tow: "سطحة",
};

export const DEMO_OTP = "1234";
export { isSupabaseReady as isSupabaseConfigured } from "./supabase/client";

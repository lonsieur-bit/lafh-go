export type OrderStatus = "pending" | "active" | "completed" | "cancelled";

/** In-app chat thread (captain/support). */
export interface ChatBubble {
  id: string;
  text: string;
  role: "user" | "peer";
  time?: string;
}

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
  group: "today" | "earlier";
}

export interface WalletTransaction {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  positive: boolean;
  time: string;
}

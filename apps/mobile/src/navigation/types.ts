import type { NavigatorScreenParams } from "@react-navigation/native";
import type { PaymentMethod } from "@/state/AppStateContext";

export type MainTabParamList = {
  Home: undefined;
};

export type AppStackParamList = {
  /** Captain experience root — separate from rider MainTabs */
  CaptainMain: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Orders: undefined;
  Wallet: undefined;
  Profile: undefined;
  OrderDetails: { orderId: string };
  PlanRide: {
    service?: "regular" | "premium" | "family" | "bike" | "cargo" | "tow";
    pickup?: string;
    destination?: string;
    stops?: string[];
    focusField?: "pickup" | "destination";
    openMapForStopIndex?: number;
  } | undefined;
  Booking: {
    destination?: string;
    service?: string;
    pickup?: string;
    stops?: string[];
    scheduleNow?: boolean;
    scheduledAt?: string;
  } | undefined;
  Checkout: undefined;
  SearchCaptain: { method: PaymentMethod };
  FreightMatching: { method: PaymentMethod };
  CargoRequest: { pickup?: string; destination?: string } | undefined;
  TowRequest: { pickup?: string; destination?: string } | undefined;
  Auth: { mode?: "login" | "register"; role?: "rider" | "captain" } | undefined;
  WalletTopUp: { giftOnly?: boolean } | undefined;
  Addresses: undefined;
  Referral: undefined;
  Notifications: undefined;
  Settings: undefined;
  Chat: { orderId: string; peerName: string; peerPhone?: string | null } | undefined;
  LegalDocument: { kind: "privacy" | "terms" | "usage" };
  Support: undefined;
  CaptainActiveTrip: { orderId: string };
};

export type RootStackParamList = {
  PublicLanding: undefined;
  MainApp: NavigatorScreenParams<AppStackParamList> | undefined;
};

import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View } from "react-native";
import { Home } from "lucide-react-native";

import { AppHomeScreen } from "@/screens/AppHomeScreen";
import { AddressesScreen } from "@/screens/AddressesScreen";
import { AuthScreen } from "@/screens/AuthScreen";
import { BookingScreen } from "@/screens/BookingScreen";
import { PlanRideScreen } from "@/screens/PlanRideScreen";
import { LegalDocumentScreen } from "@/screens/LegalDocumentScreen";
import { SupportScreen } from "@/screens/SupportScreen";
import { CargoRequestScreen } from "@/screens/CargoRequestScreen";
import { TowRequestScreen } from "@/screens/TowRequestScreen";
import { ChatScreen } from "@/screens/ChatScreen";
import { CheckoutScreen } from "@/screens/CheckoutScreen";
import { NotificationsScreen } from "@/screens/NotificationsScreen";
import { OrderDetailsScreen } from "@/screens/OrderDetailsScreen";
import { OrdersScreen } from "@/screens/OrdersScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { PublicLandingScreen } from "@/screens/PublicLandingScreen";
import { ReferralScreen } from "@/screens/ReferralScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { SearchCaptainScreen } from "@/screens/SearchCaptainScreen";
import { FreightMatchingScreen } from "@/screens/FreightMatchingScreen";
import { WalletScreen } from "@/screens/WalletScreen";
import { WalletTopUpScreen } from "@/screens/WalletTopUpScreen";
import { CaptainNavigator } from "@/navigation/CaptainNavigator";

import type { AppStackParamList, MainTabParamList, RootStackParamList } from "@/navigation/types";
import { useAppState } from "@/state/AppStateContext";
import { requiresAuth } from "@/lib/authGate";
import { AppAvailabilityGate } from "@/components/AppMaintenanceScreen";
import { MobileAppShell } from "@/shell/MobileAppShell";
import { colors } from "@/theme/tokens";
import { useBottomTabBarOptions } from "@/navigation/tabBarStyle";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const tabBar = useBottomTabBarOptions({ scenePadding: false });

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        ...tabBar,
      }}
    >
      <Tabs.Screen
        name="Home"
        component={AppHomeScreen}
        options={{
          tabBarShowLabel: false,
          tabBarAccessibilityLabel: "الرئيسية",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size ?? 22} strokeWidth={2} />,
          tabBarStyle: { display: "none" },
          sceneStyle: { paddingBottom: 0, backgroundColor: colors.background },
        }}
      />
    </Tabs.Navigator>
  );
}

function InsideShellNavigator() {
  const { appRole, isLoggedIn, authReady, pendingAuth } = useAppState();
  const isCaptain = appRole === "captain";
  const needsAuth = requiresAuth() && !isLoggedIn;

  if (requiresAuth() && !authReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const authRole = pendingAuth?.role ?? (isCaptain ? "captain" : "rider");
  const authMode = pendingAuth?.mode ?? "login";
  const initialRouteName = needsAuth ? "Auth" : isCaptain ? "CaptainMain" : "MainTabs";

  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
      initialRouteName={initialRouteName}
    >
      <AppStack.Screen
        name="Auth"
        component={AuthScreen}
        initialParams={{
          mode: authMode,
          role: authRole === "captain" ? "captain" : "rider",
        }}
      />
      <AppStack.Screen name="CaptainMain" component={CaptainNavigator} />
      <AppStack.Screen name="MainTabs" component={MainTabs} />
      <AppStack.Screen name="Orders" component={OrdersScreen} />
      <AppStack.Screen name="Wallet" component={WalletScreen} />
      <AppStack.Screen name="Profile" component={ProfileScreen} />
      <AppStack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <AppStack.Screen
        name="PlanRide"
        component={PlanRideScreen}
        options={{ animation: "slide_from_bottom", presentation: "modal" }}
      />
      <AppStack.Screen name="Booking" component={BookingScreen} />
      <AppStack.Screen name="Checkout" component={CheckoutScreen} />
      <AppStack.Screen name="SearchCaptain" component={SearchCaptainScreen} />
      <AppStack.Screen name="FreightMatching" component={FreightMatchingScreen} />
      <AppStack.Screen name="CargoRequest" component={CargoRequestScreen} />
      <AppStack.Screen name="TowRequest" component={TowRequestScreen} />
      <AppStack.Screen name="WalletTopUp" component={WalletTopUpScreen} />
      <AppStack.Screen name="Addresses" component={AddressesScreen} />
      <AppStack.Screen name="Referral" component={ReferralScreen} />
      <AppStack.Screen name="Settings" component={SettingsScreen} />
      <AppStack.Screen name="Notifications" component={NotificationsScreen} />
      <AppStack.Screen name="Chat" component={ChatScreen} />
      <AppStack.Screen name="LegalDocument" component={LegalDocumentScreen} />
      <AppStack.Screen name="Support" component={SupportScreen} />
    </AppStack.Navigator>
  );
}

function ShelledExperience() {
  return (
    <AppAvailabilityGate>
      <MobileAppShell>
        <InsideShellNavigator />
      </MobileAppShell>
    </AppAvailabilityGate>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.card,
    border: colors.border,
    text: colors.foreground,
    primary: colors.primary,
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator
        initialRouteName="PublicLanding"
        screenOptions={{
          animation: "default",
          headerShown: false,
        }}
      >
        <RootStack.Screen name="MainApp" component={ShelledExperience} options={{ headerShown: false }} />
        <RootStack.Screen name="PublicLanding" component={PublicLandingScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

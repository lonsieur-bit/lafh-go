import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Car, Home, Settings, Wallet } from "lucide-react-native";
import CaptainHomeScreen from "@/screens/luffa/CaptainHomeScreen";
import { CaptainOrdersScreen } from "@/screens/luffa/CaptainOrdersScreen";
import { CaptainActiveTripScreen } from "@/screens/luffa/CaptainActiveTripScreen";
import { WalletScreen } from "@/screens/WalletScreen";
import { CaptainSettingsScreen } from "@/screens/CaptainSettingsScreen";
import { OrderDetailsScreen } from "@/screens/OrderDetailsScreen";
import { ChatScreen } from "@/screens/ChatScreen";
import { WalletTopUpScreen } from "@/screens/WalletTopUpScreen";
import { colors } from "@/theme/tokens";
import { useBottomTabBarOptions } from "@/navigation/tabBarStyle";

export type CaptainTabParamList = {
  CaptainHome: undefined;
  CaptainOrders: undefined;
  CaptainWallet: undefined;
  CaptainSettings: undefined;
};

export type CaptainStackParamList = {
  CaptainTabs: undefined;
  CaptainActiveTrip: { orderId: string };
  CaptainOrderDetails: { orderId: string };
  CaptainWalletTopUp: { giftOnly?: boolean } | undefined;
};

const Tabs = createBottomTabNavigator<CaptainTabParamList>();
const Stack = createNativeStackNavigator<CaptainStackParamList>();

function CaptainTabs() {
  const tabBar = useBottomTabBarOptions();

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        ...tabBar,
      }}
    >
      <Tabs.Screen
        name="CaptainHome"
        component={CaptainHomeScreen}
        options={{
          tabBarLabel: "الرئيسية",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size ?? 22} />,
        }}
      />
      <Tabs.Screen
        name="CaptainOrders"
        component={CaptainOrdersScreen}
        options={{
          tabBarLabel: "الرحلات",
          tabBarIcon: ({ color, size }) => <Car color={color} size={size ?? 22} />,
        }}
      />
      <Tabs.Screen
        name="CaptainWallet"
        component={WalletScreen}
        options={{
          tabBarLabel: "الأرباح",
          tabBarIcon: ({ color, size }) => <Wallet color={color} size={size ?? 22} />,
        }}
      />
      <Tabs.Screen
        name="CaptainSettings"
        component={CaptainSettingsScreen}
        options={{
          tabBarLabel: "الحساب",
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size ?? 22} />,
        }}
      />
    </Tabs.Navigator>
  );
}

export function CaptainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="CaptainTabs" component={CaptainTabs} />
      <Stack.Screen name="CaptainActiveTrip" component={CaptainActiveTripScreen} />
      <Stack.Screen name="CaptainOrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="CaptainChat" component={ChatScreen} />
      <Stack.Screen name="CaptainWalletTopUp" component={WalletTopUpScreen} />
    </Stack.Navigator>
  );
}

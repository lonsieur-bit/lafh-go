import CustomerHomeScreen from "@/screens/luffa/CustomerHomeScreen";

/** Rider home tab — auth is handled by RootNavigator auth wall, not here. */
export function AppHomeScreen() {
  return <CustomerHomeScreen hideBottomNav />;
}

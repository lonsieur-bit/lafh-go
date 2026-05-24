import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CaptainStackParamList } from "@/navigation/CaptainNavigator";

/** Walk up navigators until we reach the captain root stack (CaptainActiveTrip, CaptainTabs). */
export function getCaptainStackNavigation(
  navigation: NavigationProp<ParamListBase>,
): NativeStackNavigationProp<CaptainStackParamList> {
  let current: NavigationProp<ParamListBase> | undefined = navigation;
  while (current) {
    const names = current.getState().routeNames as string[] | undefined;
    if (names?.includes("CaptainActiveTrip") && names?.includes("CaptainTabs")) {
      return current as NativeStackNavigationProp<CaptainStackParamList>;
    }
    current = current.getParent();
  }
  return navigation as NativeStackNavigationProp<CaptainStackParamList>;
}

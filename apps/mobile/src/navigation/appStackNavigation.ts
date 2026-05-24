import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AppStackParamList } from "@/navigation/types";

/** Walk up navigators until we reach the rider/captain root AppStack. */
export function getAppStackNavigation(
  navigation: NavigationProp<ParamListBase>,
): NativeStackNavigationProp<AppStackParamList> {
  let current: NavigationProp<ParamListBase> | undefined = navigation;
  while (current) {
    const state = current.getState();
    const names = state.routeNames as string[] | undefined;
    if (names?.includes("CaptainMain") && names?.includes("MainTabs")) {
      return current as NativeStackNavigationProp<AppStackParamList>;
    }
    current = current.getParent();
  }
  return navigation as NativeStackNavigationProp<AppStackParamList>;
}

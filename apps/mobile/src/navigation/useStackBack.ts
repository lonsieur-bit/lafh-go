import { useCallback } from "react";
import { CommonActions, type NavigationProp, type ParamListBase } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AppStackParamList } from "@/navigation/types";

function getRootNavigation(navigation: NavigationProp<ParamListBase>) {
  let current: NavigationProp<ParamListBase> = navigation;
  let parent = current.getParent();
  while (parent) {
    current = parent;
    parent = current.getParent();
  }
  return current;
}

export function stackBack(
  navigation: NativeStackNavigationProp<AppStackParamList>,
  fallback: keyof AppStackParamList = "MainTabs",
) {
  if (navigation.canGoBack()) {
    navigation.goBack();
    return;
  }

  const routeNames = navigation.getState()?.routeNames ?? [];
  if (routeNames.includes(fallback)) {
    navigation.navigate(fallback);
    return;
  }

  getRootNavigation(navigation).dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: "PublicLanding" }],
    }),
  );
}

/** Safe header back: `goBack()` when possible, otherwise navigate to a sensible fallback. */
export function useStackBack(fallback: keyof AppStackParamList = "MainTabs") {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  return useCallback(() => stackBack(navigation, fallback), [navigation, fallback]);
}

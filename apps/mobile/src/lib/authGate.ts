import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AppStackParamList } from "@/navigation/types";
import type { AuthAccountRole } from "@/lib/supabaseAuth";
import { isSupabaseReady } from "@luffa/shared";

type Nav = NativeStackNavigationProp<AppStackParamList>;

function appStackNav(navigation: NavigationProp<ParamListBase>): NativeStackNavigationProp<AppStackParamList> | null {
  let nav: NavigationProp<ParamListBase> | undefined = navigation;
  for (let i = 0; i < 4 && nav; i++) {
    const state = nav.getState?.();
    if (state?.routeNames?.includes("Auth")) {
      return nav as NativeStackNavigationProp<AppStackParamList>;
    }
    nav = nav.getParent?.() ?? undefined;
  }
  return (nav as NativeStackNavigationProp<AppStackParamList>) ?? null;
}

/** Production: booking and captain flows require a real Supabase session. */
export function requiresAuth(): boolean {
  return isSupabaseReady();
}

export function redirectToAuth(
  navigation: NavigationProp<ParamListBase>,
  setPendingAuth: (v: { mode: "login" | "register"; role?: AuthAccountRole } | null) => void,
  role: AuthAccountRole,
  mode: "login" | "register" = "login",
  isLoggedIn = false,
): false {
  if (isLoggedIn) return false;
  setPendingAuth({ mode, role });
  const appNav = appStackNav(navigation);
  if (!appNav) return false;

  const state = appNav.getState();
  const current = state.routes[state.index ?? 0];
  if (
    current?.name === "Auth" &&
    current.params?.mode === mode &&
    current.params?.role === role
  ) {
    return false;
  }

  if (requiresAuth()) {
    appNav.reset({
      index: 0,
      routes: [{ name: "Auth", params: { mode, role } }],
    });
  } else {
    appNav.navigate("Auth", { mode, role });
  }
  return false;
}

export function canAccessCaptainMode(isLoggedIn: boolean, appRole: "rider" | "captain"): boolean {
  if (!requiresAuth()) return appRole === "captain";
  return isLoggedIn && appRole === "captain";
}

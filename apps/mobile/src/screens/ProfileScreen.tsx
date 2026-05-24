import { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AppStackParamList, "Profile">;

/** Backward compatibility: deep links to Profile open Settings. */
export function ProfileScreen({ navigation }: Props) {
  useEffect(() => {
    const parent = navigation.getParent();
    const state = parent?.getState() ?? navigation.getState();
    const routes = state.routes;
    const prev = routes.length > 1 ? routes[routes.length - 2] : null;
    if (prev?.name === "Settings") {
      navigation.goBack();
      return;
    }
    navigation.replace("Settings");
  }, [navigation]);

  return null;
}

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { isSupabaseReady, registerPushToken } from "@luffa/shared";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function setupCaptainNotifications(): Promise<void> {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("captain-offers", {
        name: "طلبات قريبة",
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return;
    const tokenData = await Notifications.getExpoPushTokenAsync();
    if (isSupabaseReady() && tokenData.data) {
      await registerPushToken(tokenData.data, Platform.OS);
    }
  } catch {
    /* Expo Go / missing push credentials */
  }
}

export async function notifyLocalNewOffer(title: string, body: string): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    });
  } catch {
    /* ignore in Expo Go */
  }
}

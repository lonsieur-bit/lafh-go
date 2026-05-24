import "./global.css";
import "react-native-gesture-handler";
import "react-native-reanimated";

import { I18nManager, Platform } from "react-native";

// Arabic-first: mirror layout like web `dir="rtl"`. Use `flex-row` (not `flex-row-reverse`) in UI.
if (Platform.OS !== "web") {
  I18nManager.allowRTL(true);
  if (!I18nManager.isRTL) {
    I18nManager.forceRTL(true);
  }
}

import { registerRootComponent } from "expo";

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

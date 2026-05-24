import { useFonts } from "expo-font";
import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  Tajawal_800ExtraBold,
} from "@expo-google-fonts/tajawal";
import { Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Text, TextInput, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { CurrencyProvider } from "@luffa/shared";
import { BrandSplashView } from "@/components/BrandSplashView";
import { AppStateProvider } from "@/state/AppStateContext";
import { RootNavigator } from "@/navigation/RootNavigator";
import { fonts, rtlText } from "@/theme/textStyles";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

let defaultTextApplied = false;

function applyDefaultTextFonts() {
  if (defaultTextApplied) return;
  defaultTextApplied = true;

  const textStyle = { fontFamily: fonts.arabic, ...rtlText };
  const inputStyle = { fontFamily: fonts.arabic };

  type WithDefaultProps = { defaultProps?: { style?: unknown } };
  const TextCtor = Text as typeof Text & WithDefaultProps;
  const TextInputCtor = TextInput as typeof TextInput & WithDefaultProps;

  TextCtor.defaultProps = {
    ...TextCtor.defaultProps,
    style: [textStyle, TextCtor.defaultProps?.style],
  };
  TextInputCtor.defaultProps = {
    ...TextInputCtor.defaultProps,
    style: [inputStyle, TextInputCtor.defaultProps?.style],
  };
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
    Tajawal_800ExtraBold,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      applyDefaultTextFonts();
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  return (
    <SafeAreaProvider>
      {!fontsLoaded ? (
        <BrandSplashView />
      ) : (
        <QueryClientProvider client={queryClient}>
          <CurrencyProvider>
            <AppStateProvider>
              <StatusBar style="light" />
              <RootNavigator />
            </AppStateProvider>
          </CurrencyProvider>
        </QueryClientProvider>
      )}
    </SafeAreaProvider>
  );
}

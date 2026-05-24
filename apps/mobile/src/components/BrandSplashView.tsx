import { useEffect, useRef } from "react";
import { Animated, Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/tokens";

const LOGO = require("../../assets/luffa-logo.webp");

type Props = {
  /** Logo width/height in px */
  logoSize?: number;
};

export function BrandSplashView({ logoSize = 132 }: Props) {
  const insets = useSafeAreaInsets();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.08] });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View style={{ width: logoSize + 48, height: logoSize + 48, alignItems: "center", justifyContent: "center" }}>
        <Animated.View
          style={{
            position: "absolute",
            width: logoSize + 40,
            height: logoSize + 40,
            borderRadius: (logoSize + 40) / 2,
            backgroundColor: `${colors.primary}18`,
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
          }}
        />
        <Animated.View
          style={{
            position: "absolute",
            width: logoSize + 16,
            height: logoSize + 16,
            borderRadius: (logoSize + 16) / 2,
            borderWidth: 2,
            borderColor: `${colors.primary}30`,
            transform: [{ scale: ringScale }],
          }}
        />
        <Image
          source={LOGO}
          style={{ width: logoSize, height: logoSize }}
          resizeMode="contain"
          accessibilityLabel="لفة"
        />
      </View>
    </View>
  );
}

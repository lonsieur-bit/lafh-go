import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { colors } from "@/theme/tokens";
import { fillAbsolute } from "@/theme/layout";
import { textPresets } from "@/theme/textStyles";

export type HomeMenuAction = "orders" | "notifications" | "wallet" | "promo" | "settings";

export type HomeMenuAnchor = { top: number; left: number };

type Props = {
  open: boolean;
  anchor: HomeMenuAnchor | null;
  panelWidth: number;
  onClose: () => void;
  onSelect: (action: HomeMenuAction) => void;
};

const rows: { action: HomeMenuAction; label: string }[] = [
  { action: "orders", label: "سجل الرحلات" },
  { action: "notifications", label: "الإشعارات" },
  { action: "wallet", label: "المحفظة" },
  { action: "promo", label: "برنامج الإحالة" },
  { action: "settings", label: "الحساب والإعدادات" },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function HomeNavMenu({ open, anchor, panelWidth, onClose, onSelect }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (open && anchor) {
      progress.value = 0;
      progress.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
    }
  }, [open, anchor, progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 0.35], Extrapolation.CLAMP),
  }));

  const panelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [-6, 0], Extrapolation.CLAMP) },
      { scale: interpolate(progress.value, [0, 1], [0.97, 1], Extrapolation.CLAMP) },
    ],
  }));

  const handleClose = () => {
    progress.value = withTiming(0, { duration: 140, easing: Easing.in(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  if (!open || !anchor) return null;

  return (
    <View
      style={[fillAbsolute, { zIndex: 9999, elevation: 9999, direction: "ltr" }]}
      pointerEvents="box-none"
    >
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel="إغلاق القائمة"
        style={[fillAbsolute, backdropStyle, { backgroundColor: "#000" }]}
        onPress={handleClose}
      />
      <Animated.View
        pointerEvents="auto"
        style={[
          panelStyle,
          {
            position: "absolute",
            top: anchor.top,
            left: anchor.left,
            width: panelWidth,
            borderRadius: 16,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 8,
            shadowColor: "#1a1323",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 16,
          },
        ]}
      >
        {rows.map((row) => (
          <Pressable
            key={row.action}
            accessibilityRole="button"
            onPress={() => {
              onSelect(row.action);
              handleClose();
            }}
            style={{
              borderRadius: 12,
              backgroundColor: colors.secondary,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 14,
              paddingVertical: 12,
              marginBottom: 6,
            }}
          >
            <Text
              style={[
                textPresets.bodySm,
                { fontFamily: textPresets.title.fontFamily, color: colors.foreground, textAlign: "right" },
              ]}
            >
              {row.label}
            </Text>
          </Pressable>
        ))}
      </Animated.View>
    </View>
  );
}

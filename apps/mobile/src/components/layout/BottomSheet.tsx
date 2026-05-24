import { ReactNode } from "react";
import { Dimensions, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radii } from "@/theme/tokens";

type Props = {
  children: ReactNode;
  scrollable?: boolean;
  maxHeightRatio?: number;
};

export function BottomSheet({ children, scrollable = false, maxHeightRatio = 0.56 }: Props) {
  const insets = useSafeAreaInsets();
  const maxHeight = Dimensions.get("window").height * maxHeightRatio;
  const bottom = Math.max(insets.bottom, 8);

  const inner = (
    <>
      <View style={{ paddingTop: 8, paddingBottom: 4, alignItems: "center" }}>
        <View
          style={{
            width: 48,
            height: 4,
            borderRadius: 999,
            backgroundColor: colors.border,
          }}
        />
      </View>
      {children}
    </>
  );

  return (
    <View
      style={{
        position: "absolute",
        left: 10,
        right: 10,
        bottom,
        maxHeight,
        borderRadius: radii.xxl,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
        shadowColor: "#1a1323",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
      }}
    >
      {scrollable ? (
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </View>
  );
}

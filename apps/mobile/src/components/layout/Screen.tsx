import { ReactNode } from "react";
import { View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/tokens";

type Props = {
  children: ReactNode;
  edges?: ("top" | "bottom")[];
  style?: ViewStyle;
  padded?: boolean;
};

export function Screen({ children, edges = ["top", "bottom"], style, padded = false }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: edges.includes("top") ? insets.top : 0,
          paddingBottom: edges.includes("bottom") ? insets.bottom : 0,
          paddingHorizontal: padded ? 16 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

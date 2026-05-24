import { ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const EXTRA_BELOW_STATUS = 12;

type Props = ViewProps & {
  children: ReactNode;
  className?: string;
};

/** Replaces fixed `pt-14` headers with real status-bar inset + spacing. */
export function SafeScreenHeader({ children, className = "", style, ...rest }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View className={className} style={[{ paddingTop: insets.top + EXTRA_BELOW_STATUS }, style]} {...rest}>
      {children}
    </View>
  );
}

import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/tokens";

type Props = {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  /** Full-width footer without horizontal padding */
  footerEdgeToEdge?: boolean;
  scroll?: boolean;
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
  keyboardShouldPersistTaps?: ScrollViewProps["keyboardShouldPersistTaps"];
  style?: StyleProp<ViewStyle>;
};

/** Stack screens: explicit flex (like CustomerHome), RTL, no centered scroll wrapper. */
export function StackScreenLayout({
  children,
  header,
  footer,
  footerEdgeToEdge = false,
  scroll = true,
  contentContainerStyle,
  keyboardShouldPersistTaps = "handled",
  style,
}: Props) {
  const insets = useSafeAreaInsets();
  const baseContent = {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: footer ? 16 : Math.max(insets.bottom, 22) + 18,
    gap: 16,
  };

  return (
    <View
      style={[
        { flex: 1, backgroundColor: colors.background },
        style,
      ]}
    >
      {header}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 12 : 0}
      >
        {scroll ? (
          <ScrollView
            style={{ flex: 1 }}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[baseContent, contentContainerStyle]}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1 }, baseContent]}>{children}</View>
        )}
      </KeyboardAvoidingView>
      {footer ? (
        <View
          style={{
            paddingHorizontal: footerEdgeToEdge ? 0 : 20,
            paddingTop: footerEdgeToEdge ? 0 : 10,
            paddingBottom: footerEdgeToEdge ? 0 : Math.max(insets.bottom, 14),
            borderTopWidth: footerEdgeToEdge ? 0 : 1,
            borderTopColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}

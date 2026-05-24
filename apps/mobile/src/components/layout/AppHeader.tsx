import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowRight } from "lucide-react-native";
import { colors } from "@/theme/tokens";
import { fonts, rtlText } from "@/theme/textStyles";

type Props = {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export function AppHeader({ title, onBack, right }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingBottom: 12,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.secondary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowRight size={20} color={colors.foreground} />
        </Pressable>
      ) : (
        <View style={{ width: 42 }} />
      )}
      <Text
        style={{
          flex: 1,
          fontFamily: fonts.arabicBold,
          fontSize: 20,
          color: colors.foreground,
          textAlign: "center",
          ...rtlText,
        }}
        numberOfLines={1}
      >
        {title}
      </Text>
      <View style={{ minWidth: 42, alignItems: "center", justifyContent: "center" }}>{right}</View>
    </View>
  );
}

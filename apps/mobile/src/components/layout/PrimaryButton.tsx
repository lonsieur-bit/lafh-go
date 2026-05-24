import { Pressable, Text, type PressableProps } from "react-native";
import { colors } from "@/theme/tokens";
import { fonts, rtlText } from "@/theme/textStyles";

type Props = PressableProps & {
  label: string;
  variant?: "primary" | "secondary";
};

export function PrimaryButton({ label, variant = "primary", disabled, style, ...rest }: Props) {
  const isPrimary = variant === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={[
        {
          width: "100%",
          borderRadius: 14,
          minHeight: 46,
          paddingVertical: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isPrimary ? colors.primary : colors.secondary,
          borderWidth: isPrimary ? 0 : 1,
          borderColor: colors.border,
          opacity: disabled ? 0.55 : 1,
          shadowColor: isPrimary ? colors.primary : "transparent",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isPrimary ? 0.22 : 0,
          shadowRadius: 14,
          elevation: isPrimary ? 3 : 0,
        },
        style,
      ]}
      {...rest}
    >
      <Text
        style={{
          fontFamily: fonts.arabicBold,
          fontSize: 15,
          color: isPrimary ? colors.primaryForeground : colors.foreground,
          ...rtlText,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

import { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radii, spacing, typography } from "@/theme/tokens";

export function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

export function Input(props: React.ComponentProps<typeof TextInput>) {
  return <TextInput placeholderTextColor={colors.mutedForeground} style={styles.input} {...props} />;
}

export function Button({
  text,
  onPress,
  loading,
  variant = "primary",
  disabled,
}: {
  text: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) {
  const bg =
    variant === "danger" ? colors.destructive : variant === "secondary" ? colors.secondary : colors.primary;
  const fg =
    variant === "secondary" ? colors.secondaryForeground : variant === "danger" ? colors.destructiveForeground : colors.primaryForeground;
  const isDisabled = disabled || loading;
  return (
    <Pressable
      style={[styles.button, { backgroundColor: bg, opacity: isDisabled ? 0.5 : 1 }]}
      disabled={isDisabled}
      onPress={onPress}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.buttonText, { color: fg }]}>{text}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { color: colors.foreground, fontSize: typography.h2, fontWeight: "800" },
  subtitle: { color: colors.mutedForeground, fontSize: typography.bodySm, marginTop: spacing.xs },
  body: { marginTop: spacing.lg, gap: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  label: { color: colors.foreground, fontSize: typography.bodySm, fontWeight: "600" },
  input: {
    height: 40,
    borderColor: colors.input,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    color: colors.foreground,
    backgroundColor: colors.card,
  },
  button: {
    minHeight: 40,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  buttonText: { fontWeight: "700", fontSize: typography.bodySm },
});

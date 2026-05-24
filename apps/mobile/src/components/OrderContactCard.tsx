import { LinearGradient } from "expo-linear-gradient";
import { MessageCircle, Phone } from "lucide-react-native";
import { Alert, Pressable, Text, View } from "react-native";
import type { OrderContact } from "@luffa/shared";
import { dialPhone } from "@/lib/phoneCall";
import { figmaCard } from "@/theme/figmaStyles";
import { colors, gradientColors, gradients } from "@/theme/tokens";
import { ltrText, textPresets } from "@/theme/textStyles";

type Props = {
  title: string;
  contact: OrderContact;
  subtitle?: string;
  onChat: () => void;
};

export function OrderContactCard({ title, contact, subtitle, onChat }: Props) {
  const initial = contact.name.trim().charAt(0) || "؟";

  return (
    <View style={{ ...figmaCard, padding: 16 }}>
      <Text style={[textPresets.title, { fontSize: 16, marginBottom: 14, textAlign: "center" }]}>{title}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <LinearGradient
          colors={gradientColors(gradients.avatar)}
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 22, fontFamily: textPresets.title.fontFamily, color: colors.primaryForeground }}>
            {initial}
          </Text>
        </LinearGradient>

        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text style={textPresets.title}>{contact.name}</Text>
          {contact.phone ? (
            <Text style={[textPresets.caption, ltrText, { marginTop: 6, color: colors.mutedForeground }]}>
              {contact.phone}
            </Text>
          ) : (
            <Text style={[textPresets.caption, { marginTop: 6, color: colors.mutedForeground }]}>بدون رقم مسجّل</Text>
          )}
          {subtitle ? (
            <Text style={[textPresets.caption, { marginTop: 4, textAlign: "right", color: colors.mutedForeground }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable
            onPress={onChat}
            accessibilityRole="button"
            accessibilityLabel="محادثة"
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MessageCircle width={20} height={20} color={colors.primaryForeground} />
          </Pressable>
          <Pressable
            onPress={() => void dialPhone(contact.phone)}
            accessibilityRole="button"
            accessibilityLabel="اتصال"
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.secondary,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Phone width={20} height={20} color={colors.foreground} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/** Mock / legacy driver block when no OrderContact is available. */
export function OrderDriverContactCard({
  title,
  name,
  phone,
  subtitle,
  onChat,
}: {
  title: string;
  name: string;
  phone?: string | null;
  subtitle?: string;
  onChat: () => void;
}) {
  return (
    <OrderContactCard
      title={title}
      contact={{ id: "driver", name, phone: phone ?? null }}
      subtitle={subtitle}
      onChat={onChat}
    />
  );
}

export function alertMissingContact(kind: "rider" | "captain" = "rider") {
  const label = kind === "rider" ? "العميل" : "الكابتن";
  Alert.alert("غير متاح", `لا تتوفر بيانات ${label} لهذا الطلب بعد.`);
}

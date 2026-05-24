import { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Clock, Mail, MapPin, MessageCircle } from "lucide-react-native";
import { isSupabaseReady, mapSupportSubmitError, submitSupportMessage, type SupportCategory } from "@luffa/shared";
import { useAppState } from "@/state/AppStateContext";
import { Alert, Linking, Pressable, Text, TextInput, View } from "react-native";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { AppHeader, PrimaryButton, StackScreenLayout } from "@/components/layout";
import type { AppStackParamList } from "@/navigation/types";
import { useStackBack } from "@/navigation/useStackBack";
import { buildWhatsAppUrl, supportConfig } from "@/shared/supportConfig";
import { figmaCard } from "@/theme/figmaStyles";
import { colors } from "@/theme/tokens";
import { fonts, ltrText, rtlText, textPresets } from "@/theme/textStyles";

type Props = NativeStackScreenProps<AppStackParamList, "Support">;

type InquiryType = SupportCategory;

const inquiryOptions: { key: InquiryType; label: string }[] = [
  { key: "complaint", label: "شكوى" },
  { key: "suggestion", label: "اقتراح" },
  { key: "general", label: "استفسار عام" },
  { key: "trip", label: "رحلة / طلب" },
  { key: "wallet", label: "المحفظة والدفع" },
  { key: "account", label: "الحساب" },
  { key: "technical", label: "مشكلة تقنية" },
];

const fieldInput = {
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.secondary,
  paddingHorizontal: 14,
  paddingVertical: 12,
  color: colors.foreground,
  fontSize: 15,
  fontFamily: fonts.arabic,
} as const;

function FieldLabel({ children }: { children: string }) {
  return <Text style={[textPresets.labelMuted, { marginBottom: 8, textAlign: "right" }]}>{children}</Text>;
}

export function SupportScreen({}: Props) {
  const onBack = useStackBack("Settings");
  const { profileDisplayName, profilePhone } = useAppState();
  const [name, setName] = useState(profileDisplayName ?? "");
  const [phone, setPhone] = useState(() => (profilePhone?.replace(/\D/g, "").replace(/^966/, "").slice(-9) ?? ""));
  const [inquiry, setInquiry] = useState<InquiryType>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const inquiryLabel = inquiryOptions.find((o) => o.key === inquiry)?.label ?? "";

  const buildSummary = () => {
    const lines = [
      "مرحباً فريق لفة،",
      inquiryLabel ? `نوع الاستفسار: ${inquiryLabel}` : "",
      subject.trim() ? `الموضوع: ${subject.trim()}` : "",
      message.trim() ? `التفاصيل: ${message.trim()}` : "",
      name.trim() ? `الاسم: ${name.trim()}` : "",
      phone.trim() ? `الجوال: +966${phone.trim()}` : "",
    ].filter(Boolean);
    return lines.join("\n");
  };

  const openWhatsApp = async () => {
    const url = buildWhatsAppUrl(buildSummary() || "مرحباً، أحتاج مساعدة من فريق دعم لفة.");
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("تعذر الفتح", "تأكد من تثبيت واتساب على جهازك.");
    }
  };

  const openEmail = async () => {
    const body = encodeURIComponent(buildSummary());
    const subjectEnc = encodeURIComponent(subject.trim() || `دعم لفة — ${inquiryLabel}`);
    const url = `mailto:${supportConfig.email}?subject=${subjectEnc}&body=${body}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("تعذر الفتح", "تأكد من إعداد تطبيق البريد على جهازك.");
    }
  };

  const submitForm = () => {
    if (!name.trim()) {
      Alert.alert("الاسم مطلوب", "أدخل اسمك لنتمكن من الرد عليك.");
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      Alert.alert("الرسالة قصيرة", "اكتب تفاصيل كافية (10 أحرف على الأقل).");
      return;
    }
    setSending(true);
    void (async () => {
      try {
        const phoneValue = phone.trim() ? (phone.trim().startsWith("966") ? `+${phone.trim()}` : `+966${phone.trim()}`) : null;
        if (isSupabaseReady()) {
          await submitSupportMessage({
            name: name.trim(),
            phone: phoneValue,
            category: inquiry,
            subject: subject.trim() || null,
            message: message.trim(),
          });
        } else {
          await new Promise((r) => setTimeout(r, 600));
        }
        setSent(true);
        Alert.alert("تم الإرسال", "استلمنا رسالتك. سنتواصل معك قريباً عبر البريد أو واتساب.");
      } catch (err) {
        Alert.alert("تعذّر الإرسال", mapSupportSubmitError(err));
      } finally {
        setSending(false);
      }
    })();
  };

  return (
    <StackScreenLayout
      header={<AppHeader title="المساعدة والتواصل" onBack={onBack} />}
      footer={
        sent ? (
          <PrimaryButton label="فتح واتساب الدعم" onPress={openWhatsApp} />
        ) : (
          <PrimaryButton label={sending ? "جارٍ الإرسال..." : "إرسال الرسالة"} onPress={submitForm} disabled={sending} />
        )
      }
      contentContainerStyle={{ gap: 16, paddingBottom: 8 }}
    >
      <Text style={[textPresets.caption, { textAlign: "right", color: colors.mutedForeground, lineHeight: 20 }]}>
        مركز واحد للمساعدة والتواصل — أرسل شكوى أو اقتراحاً أو تواصل مباشرة مع فريق الدعم.
      </Text>

      <View style={{ ...figmaCard, padding: 14, gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, justifyContent: "flex-end" }}>
          <Text style={[textPresets.caption, { flex: 1, textAlign: "right", lineHeight: 20 }]}>{supportConfig.addressAr}</Text>
          <MapPin size={18} color={colors.primary} style={{ marginTop: 2 }} />
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable onPress={openEmail} style={{ flex: 1, ...figmaCard, padding: 14, gap: 8, alignItems: "center" }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: `${colors.primary}14`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Mail size={22} color={colors.primary} />
          </View>
          <Text style={[textPresets.caption, { textAlign: "center" }]}>البريد</Text>
          <Text style={[textPresets.bodySm, ltrText, { textAlign: "center", color: colors.primary }]} numberOfLines={1}>
            {supportConfig.email}
          </Text>
        </Pressable>

        <Pressable
          onPress={openWhatsApp}
          style={{
            flex: 1,
            ...figmaCard,
            padding: 14,
            gap: 8,
            alignItems: "center",
            borderColor: "#25D366",
            borderWidth: 1.5,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: "#25D36618",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WhatsAppIcon size={26} color="#25D366" />
          </View>
          <Text style={[textPresets.caption, { textAlign: "center" }]}>واتساب الدعم</Text>
          <Text style={[textPresets.bodySm, ltrText, { textAlign: "center" }]}>{supportConfig.whatsappLabel}</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
        <Text style={[textPresets.caption, { color: colors.mutedForeground }]}>{supportConfig.hoursAr}</Text>
        <Clock size={14} color={colors.mutedForeground} />
      </View>

      <Pressable
        onPress={openWhatsApp}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          paddingVertical: 16,
          borderRadius: 16,
          backgroundColor: "#25D366",
        }}
      >
        <WhatsAppIcon size={24} color="#ffffff" />
        <Text style={[textPresets.body, { color: "#ffffff", fontFamily: fonts.arabicBold }]}>محادثة فورية عبر واتساب</Text>
      </Pressable>

      <View style={{ ...figmaCard, padding: 16, gap: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
          <Text style={[textPresets.body, { fontFamily: fonts.arabicBold }]}>نموذج التواصل</Text>
          <MessageCircle size={18} color={colors.primary} />
        </View>

        <View>
          <FieldLabel>الاسم الكامل *</FieldLabel>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="اسمك"
            placeholderTextColor={colors.mutedForeground}
            style={[fieldInput, rtlText]}
            textAlign="right"
          />
        </View>

        <View>
          <FieldLabel>رقم الجوال (اختياري)</FieldLabel>
          <TextInput
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/\D/g, "").slice(0, 9))}
            keyboardType="number-pad"
            placeholder="5XXXXXXXX"
            placeholderTextColor={colors.mutedForeground}
            style={[fieldInput, ltrText, { textAlign: "center" }]}
          />
        </View>

        <View>
          <FieldLabel>نوع الاستفسار</FieldLabel>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
            {inquiryOptions.map((opt) => {
              const active = inquiry === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setInquiry(opt.key)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? `${colors.primary}14` : colors.secondary,
                  }}
                >
                  <Text style={[textPresets.caption, active && { color: colors.primary, fontFamily: fonts.arabicBold }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          <FieldLabel>الموضوع</FieldLabel>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder="مثال: مشكلة في الدفع"
            placeholderTextColor={colors.mutedForeground}
            style={[fieldInput, rtlText]}
            textAlign="right"
          />
        </View>

        <View>
          <FieldLabel>الرسالة *</FieldLabel>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="اشرح مشكلتك أو استفسارك بالتفصيل..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={[fieldInput, rtlText, { minHeight: 120, textAlign: "right" }]}
          />
        </View>

        {sent ? (
          <Text style={[textPresets.caption, { textAlign: "center", color: colors.success }]}>
            تم إرسال نموذجك. يمكنك أيضاً متابعة المحادثة على واتساب.
          </Text>
        ) : null}
      </View>
    </StackScreenLayout>
  );
}

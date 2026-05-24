import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Bell,
  ChevronLeft,
  FileText,
  Gift,
  Globe,
  Headphones,
  Settings as SettingsIcon,
  Shield,
  User,
} from "lucide-react-native";
import { Alert, Pressable, Text, View } from "react-native";
import { PrimaryButton, StackScreenLayout } from "@/components/layout";
import { ProfileHeader } from "@/components/ProfileHeader";
import type { AppStackParamList } from "@/navigation/types";
import { useStackBack } from "@/navigation/useStackBack";
import { useAppState } from "@/state/AppStateContext";
import { isSupabaseReady } from "@luffa/shared";
import { figmaCard, figmaIconBox } from "@/theme/figmaStyles";
import { colors } from "@/theme/tokens";
import { textPresets } from "@/theme/textStyles";

type Props = NativeStackScreenProps<AppStackParamList, "Settings">;

type MenuRow = {
  key: string;
  label: string;
  Icon: typeof Bell;
  onPress: () => void;
};

export function SettingsScreen({ navigation }: Props) {
  const onBack = useStackBack();
  const { logout, isLoggedIn } = useAppState();
  const configured = isSupabaseReady();

  const showSoon = (label: string) => {
    Alert.alert(label, "سيتم إتاحة هذا الخيار في تحديث قريب.");
  };

  const quickLinks = [
    { key: "orders", label: "رحلاتي", Icon: User, onPress: () => navigation.navigate("Orders") },
  ];

  const menuRows: MenuRow[] = [
    { key: "notif", label: "الإشعارات", Icon: Bell, onPress: () => navigation.navigate("Notifications") },
    { key: "settings", label: "الإعدادات", Icon: SettingsIcon, onPress: () => showSoon("الإعدادات") },
    {
      key: "support",
      label: "المساعدة والتواصل",
      Icon: Headphones,
      onPress: () => navigation.navigate("Support"),
    },
    { key: "promo", label: "أكواد الخصم", Icon: Gift, onPress: () => navigation.navigate("Referral") },
    {
      key: "privacy",
      label: "سياسة الخصوصية",
      Icon: Shield,
      onPress: () => navigation.navigate("LegalDocument", { kind: "privacy" }),
    },
    {
      key: "terms",
      label: "الشروط والأحكام",
      Icon: FileText,
      onPress: () => navigation.navigate("LegalDocument", { kind: "terms" }),
    },
    {
      key: "usage",
      label: "شروط الاستخدام",
      Icon: FileText,
      onPress: () => navigation.navigate("LegalDocument", { kind: "usage" }),
    },
    { key: "lang", label: "اللغة", Icon: Globe, onPress: () => showSoon("اللغة") },
  ];

  return (
    <StackScreenLayout
      scroll
      header={<ProfileHeader onBack={onBack} />}
      contentContainerStyle={{ gap: 16, paddingTop: 16 }}
    >
      {!configured ? (
        <View
          style={{
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.warning,
            backgroundColor: `${colors.warning}1A`,
            padding: 12,
          }}
        >
          <Text style={[textPresets.caption, { color: colors.warning }]}>
            اربط Supabase لتفعيل الحساب الحقيقي.
          </Text>
        </View>
      ) : null}

      <View style={{ flexDirection: "row", gap: 10 }}>
        {quickLinks.map((item) => {
          const Icon = item.Icon;
          return (
            <Pressable
              key={item.key}
              onPress={item.onPress}
              style={{
                flex: 1,
                ...figmaCard,
                paddingVertical: 14,
                alignItems: "center",
                gap: 8,
              }}
            >
              <View style={figmaIconBox}>
                <Icon width={20} height={20} color={colors.primary} />
              </View>
              <Text style={[textPresets.bodySm, { fontFamily: textPresets.title.fontFamily }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ ...figmaCard, padding: 6 }}>
        {menuRows.map((row, index) => {
          const Icon = row.Icon;
          return (
            <Pressable
              key={row.key}
              onPress={row.onPress}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingHorizontal: 12,
                paddingVertical: 14,
                minHeight: 58,
                borderBottomWidth: index === menuRows.length - 1 ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              <ChevronLeft width={16} height={16} color={colors.mutedForeground} />
              <Text style={[textPresets.body, { flex: 1, textAlign: "right" }]}>{row.label}</Text>
              <View style={figmaIconBox}>
                <Icon width={20} height={20} color={colors.primary} />
              </View>
            </Pressable>
          );
        })}
      </View>

      {isLoggedIn ? (
        <Pressable
          onPress={logout}
          style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            paddingVertical: 14,
            alignItems: "center",
            backgroundColor: colors.card,
          }}
        >
          <Text style={[textPresets.body, { color: colors.destructive, fontFamily: textPresets.title.fontFamily }]}>
            خروج
          </Text>
        </Pressable>
      ) : (
        <View style={{ gap: 10 }}>
          <PrimaryButton label="تسجيل الدخول" onPress={() => navigation.navigate("Auth", { mode: "login" })} />
          <Pressable
            onPress={() => navigation.navigate("Auth", { mode: "register" })}
            style={{
              paddingVertical: 12,
              alignItems: "center",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={[textPresets.body, { color: colors.primary }]}>إنشاء حساب جديد</Text>
          </Pressable>
        </View>
      )}
    </StackScreenLayout>
  );
}

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackScreenLayout } from "@/components/layout";
import { fonts, textPresets } from "@/theme/textStyles";
import { colors, gradientColors, gradientPrimaryHorizontal, gradients } from "@/theme/tokens";
import { fetchReferralProgramSettings, useCurrency } from "@luffa/shared";
import { useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, Copy, Gift, Users } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AppStackParamList } from "@/navigation/types";
import { useStackBack } from "@/navigation/useStackBack";
import { useAppState } from "@/state/AppStateContext";

type Props = NativeStackScreenProps<AppStackParamList, "Referral">;

function ReferralHeader({
  onBack,
  title,
  description,
  rewardHint,
}: {
  onBack: () => void;
  title: string;
  description: string;
  rewardHint: string | null;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top + 12,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.card,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="عودة"
          onPress={onBack}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.secondary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowRight width={16} height={16} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={textPresets.title}>{title}</Text>
          <Text style={[textPresets.caption, { marginTop: 4 }]}>{description}</Text>
          {rewardHint ? (
            <Text style={[textPresets.caption, { color: colors.primary, marginTop: 2 }]}>{rewardHint}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export function ReferralScreen({ navigation }: Props) {
  const onBack = useStackBack();
  const { myReferralCode, referralStats } = useAppState();
  const { format } = useCurrency();

  const { data: program } = useQuery({
    queryKey: ["referral-program"],
    queryFn: fetchReferralProgramSettings,
  });

  const description = program?.description_ar ?? "اكسب المال عند تسجيل أصدقائك باستخدام كودك";
  const rewardHint =
    program && program.default_reward_sar > 0
      ? `مكافأة ${format(program.default_reward_sar)} لكل تسجيل جديد`
      : null;

  const copyCode = async () => {
    await Clipboard.setStringAsync(myReferralCode);
  };

  return (
    <StackScreenLayout
      header={
        <ReferralHeader
          onBack={onBack}
          title="برنامج الإحالة"
          description={description}
          rewardHint={rewardHint}
        />
      }
    >
      {program && !program.enabled ? (
        <View
          style={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#fde68a",
            backgroundColor: "#fffbeb",
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <Text style={[textPresets.caption, { color: "#78350f" }]}>برنامج الإحالة متوقف مؤقتًا من الإدارة.</Text>
        </View>
      ) : null}

      <View style={{ borderRadius: 24, overflow: "hidden" }}>
        <LinearGradient
          colors={gradientColors(gradients.primary)}
          start={gradientPrimaryHorizontal.start}
          end={gradientPrimaryHorizontal.end}
          style={{ padding: 16 }}
        >
          <Text style={[textPresets.caption, { color: "rgba(255,255,255,0.8)" }]}>كود الإحالة الخاص بك</Text>
          <View
            style={{
              marginTop: 8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 8,
              gap: 8,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontFamily: fonts.sans,
                fontSize: 18,
                color: colors.primaryForeground,
                textAlign: "center",
                letterSpacing: 1,
              }}
            >
              {myReferralCode}
            </Text>
            <Pressable
              onPress={copyCode}
              style={{
                borderRadius: 12,
                backgroundColor: colors.primaryForeground,
                paddingHorizontal: 12,
                paddingVertical: 8,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Copy width={14} height={14} color={colors.primary} />
              <Text style={[textPresets.captionBold, { color: colors.primary }]}>نسخ</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            padding: 16,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: `${colors.primary}1A`,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
              alignSelf: "center",
            }}
          >
            <Users width={16} height={16} color={colors.primary} />
          </View>
          <Text style={[textPresets.caption, { textAlign: "center" }]}>عدد المدعوين</Text>
          <Text style={[textPresets.heading, { textAlign: "center", marginTop: 4 }]}>{referralStats.invitesCount}</Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            padding: 16,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: `${colors.success}1A`,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
              alignSelf: "center",
            }}
          >
            <Gift width={16} height={16} color={colors.success} />
          </View>
          <Text style={[textPresets.caption, { textAlign: "center" }]}>أرباح الإحالة</Text>
          <Text style={[textPresets.heading, { textAlign: "center", marginTop: 4 }]}>
            {format(referralStats.totalEarnings)}
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 16,
          padding: 16,
        }}
      >
        <Text style={[textPresets.bodySm, { fontFamily: textPresets.title.fontFamily, marginBottom: 8 }]}>
          كيف يعمل البرنامج؟
        </Text>
        <Text style={[textPresets.caption, { marginBottom: 8 }]}>1) شارك كودك مع أصدقائك.</Text>
        <Text style={[textPresets.caption, { marginBottom: 8 }]}>
          2) عند التسجيل باستخدام الكود، يتم احتساب دعوة جديدة.
        </Text>
        <Text style={[textPresets.caption, { marginBottom: program && program.invitee_bonus_sar > 0 ? 8 : 0 }]}>
          3) تربح مكافأة مباشرة على كل مستخدم جديد
          {program ? ` (${format(program.default_reward_sar)}).` : "."}
        </Text>
        {program && program.invitee_bonus_sar > 0 ? (
          <Text style={textPresets.caption}>
            4) يحصل صديقك على مكافأة ترحيب {format(program.invitee_bonus_sar)}.
          </Text>
        ) : null}
      </View>
    </StackScreenLayout>
  );
}

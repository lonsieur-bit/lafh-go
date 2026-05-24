import { useEffect, useMemo, useRef, useState } from "react";
import { CommonActions } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Car, CircleUserRound, ChevronRight } from "lucide-react-native";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/layout";
import type { AppStackParamList } from "@/navigation/types";
import type { AuthAccountRole } from "@/lib/supabaseAuth";
import { authErrorMessage, validateOtp, validatePhone } from "@/lib/supabaseAuth";
import { useAppState } from "@/state/AppStateContext";
import { isSupabaseReady } from "@luffa/shared";
import { stackBack } from "@/navigation/useStackBack";
import { colors } from "@/theme/tokens";
import { fonts, ltrText, rtlText, textPresets } from "@/theme/textStyles";

type Props = NativeStackScreenProps<AppStackParamList, "Auth">;

type AuthMode = "login" | "register";
type WizardStep = "intent" | "role" | "name" | "phone" | "otp";

function buildSteps(mode: AuthMode, presetFromLanding: boolean): WizardStep[] {
  if (presetFromLanding) {
    return mode === "register" ? ["name", "phone", "otp"] : ["phone", "otp"];
  }
  if (mode === "login") return ["intent", "role", "phone", "otp"];
  return ["intent", "role", "name", "phone", "otp"];
}

function initialStep(mode: AuthMode, presetFromLanding: boolean): WizardStep {
  return buildSteps(mode, presetFromLanding)[0];
}

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: 8 }}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            width: i === current ? 20 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === current ? colors.primary : colors.border,
          }}
        />
      ))}
    </View>
  );
}

function ChoiceCard({
  label,
  selected,
  onPress,
  Icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  Icon?: typeof CircleUserRound;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: "100%",
        minHeight: 56,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? `${colors.primary}12` : colors.card,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
      }}
    >
      {Icon ? <Icon size={20} color={selected ? colors.primary : colors.mutedForeground} /> : null}
      <Text
        style={{
          fontFamily: selected ? fonts.arabicBold : fonts.arabic,
          fontSize: 16,
          color: selected ? colors.primary : colors.foreground,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const fieldInput = {
  borderRadius: 16,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.card,
  paddingHorizontal: 16,
  paddingVertical: 14,
  color: colors.foreground,
  fontSize: 17,
  fontFamily: fonts.arabic,
} as const;

export function AuthScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { login, register, lastAuthPhone, setLastAuthPhone, setPendingAuth } = useAppState();
  const configured = isSupabaseReady();

  const goHome = (role: AuthAccountRole) => {
    const home = role === "captain" ? "CaptainMain" : "MainTabs";
    navigation.reset({
      index: 0,
      routes: [{ name: home }],
    });
  };

  const presetFromLanding = Boolean(route.params?.mode && route.params?.role);
  const [mode, setMode] = useState<AuthMode>(route.params?.mode ?? "login");
  const [accountRole, setAccountRole] = useState<AuthAccountRole>(route.params?.role ?? "rider");
  const [step, setStep] = useState<WizardStep>(() => initialStep(route.params?.mode ?? "login", presetFromLanding));
  const [phone, setPhone] = useState(lastAuthPhone);
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showReferral, setShowReferral] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const otpRef = useRef<TextInput>(null);
  const normalizedPhone = phone.replace(/\D/g, "");

  const steps = useMemo(() => buildSteps(mode, presetFromLanding), [mode, presetFromLanding]);
  const stepIndex = Math.max(0, steps.indexOf(step));

  useEffect(() => {
    if (route.params?.mode) setMode(route.params.mode);
    if (route.params?.role) setAccountRole(route.params.role);
  }, [route.params?.mode, route.params?.role]);

  useEffect(() => {
    if (lastAuthPhone && !phone) setPhone(lastAuthPhone);
  }, [lastAuthPhone, phone]);

  const updatePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 9);
    setPhone(digits);
    setLastAuthPhone(digits);
  };

  const goNext = () => {
    setError("");
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) setStep(steps[idx + 1]);
  };

  const goBack = () => {
    setError("");
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
  };

  const exitToWelcome = () => {
    setPendingAuth(null);
    let root = navigation;
    while (root.getParent()) root = root.getParent()!;
    root.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "PublicLanding" }],
      }),
    );
  };

  const handleHeaderBack = () => {
    if (stepIndex > 0) {
      goBack();
      return;
    }
    if (presetFromLanding) {
      exitToWelcome();
      return;
    }
    stackBack(navigation, accountRole === "captain" ? "CaptainMain" : "MainTabs");
  };

  const showHeaderBack = stepIndex > 0 || presetFromLanding || navigation.canGoBack();

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setStep(initialStep(next, presetFromLanding));
    setError("");
  };

  const stepMeta = useMemo(() => {
    switch (step) {
      case "intent":
        return { title: "مرحباً", subtitle: "اختر طريقة الدخول" };
      case "role":
        return { title: "نوع الحساب", subtitle: "راكب أم كابتن؟" };
      case "name":
        return { title: "اسمك", subtitle: "كيف نناديك؟" };
      case "phone":
        return { title: "رقم الجوال", subtitle: "سنرسل رمز التحقق" };
      case "otp":
        return {
          title: "رمز التحقق",
          subtitle: `+966${normalizedPhone}`,
        };
    }
  }, [step, normalizedPhone]);

  const confirmAuth = async () => {
    const phoneErr = validatePhone(normalizedPhone);
    if (phoneErr) {
      setError(phoneErr);
      setStep("phone");
      return;
    }
    const otpErr = validateOtp(otp.replace(/\D/g, ""));
    if (otpErr) {
      setError(otpErr);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result =
        mode === "login"
          ? await login(normalizedPhone, otp.replace(/\D/g, ""), accountRole)
          : await register(
              normalizedPhone,
              otp.replace(/\D/g, ""),
              accountRole,
              fullName.trim(),
              referralCode.trim() || undefined,
            );

      if (result !== true) {
        setError(authErrorMessage(result, mode));
        return;
      }
      goHome(accountRole);
    } finally {
      setLoading(false);
    }
  };

  const onPrimary = () => {
    setError("");
    if (step === "intent" || step === "role") {
      goNext();
      return;
    }
    if (step === "name") {
      if (fullName.trim().length < 2) {
        setError("أدخل اسمك (حرفان على الأقل)");
        return;
      }
      goNext();
      return;
    }
    if (step === "phone") {
      const phoneErr = validatePhone(normalizedPhone);
      if (phoneErr) {
        setError(phoneErr);
        return;
      }
      goNext();
      return;
    }
    void confirmAuth();
  };

  const primaryLabel = useMemo(() => {
    if (step === "otp") {
      return loading ? "جارٍ التحقق..." : mode === "login" ? "دخول" : "إنشاء الحساب";
    }
    if (step === "phone") return "إرسال الرمز";
    return "متابعة";
  }, [step, mode, loading]);

  const primaryDisabled =
    loading ||
    (step === "name" && fullName.trim().length < 2) ||
    (step === "phone" && Boolean(validatePhone(normalizedPhone))) ||
    (step === "otp" && Boolean(validateOtp(otp.replace(/\D/g, ""))));

  const roleLabel = accountRole === "captain" ? "كابتن" : "راكب";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        {showHeaderBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="رجوع"
            onPress={handleHeaderBack}
            hitSlop={12}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.secondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronRight size={22} color={colors.foreground} />
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <View style={{ flex: 1, alignItems: "center" }}>
          <Image source={require("../../assets/luffa-logo.webp")} style={{ width: 36, height: 36 }} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <StepDots total={steps.length} current={stepIndex} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
          <Text style={[textPresets.heading, { textAlign: "center", marginBottom: 6 }]}>{stepMeta.title}</Text>
          <Text
            style={[textPresets.bodySm, { textAlign: "center", color: colors.mutedForeground, marginBottom: 28 }]}
          >
            {stepMeta.subtitle}
          </Text>

          {step === "intent" ? (
            <View style={{ gap: 12 }}>
              <ChoiceCard label="تسجيل الدخول" selected={mode === "login"} onPress={() => switchMode("login")} />
              <ChoiceCard label="حساب جديد" selected={mode === "register"} onPress={() => switchMode("register")} />
            </View>
          ) : null}

          {step === "role" ? (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <ChoiceCard
                label="راكب"
                Icon={CircleUserRound}
                selected={accountRole === "rider"}
                onPress={() => setAccountRole("rider")}
              />
              <ChoiceCard
                label="كابتن"
                Icon={Car}
                selected={accountRole === "captain"}
                onPress={() => setAccountRole("captain")}
              />
            </View>
          ) : null}

          {step === "name" ? (
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="الاسم الكامل"
              placeholderTextColor={colors.mutedForeground}
              style={[fieldInput, rtlText]}
              textAlign="right"
              autoFocus
            />
          ) : null}

          {step === "phone" ? (
            <View>
              <Text style={[textPresets.caption, { textAlign: "center", color: colors.mutedForeground, marginBottom: 16 }]}>
                {roleLabel} · {mode === "login" ? "تسجيل الدخول" : "حساب جديد"}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  overflow: "hidden",
                }}
              >
                <TextInput
                  keyboardType="number-pad"
                  value={phone}
                  onChangeText={updatePhone}
                  placeholder="5XXXXXXXX"
                  placeholderTextColor={colors.mutedForeground}
                  style={[fieldInput, ltrText, { flex: 1, borderWidth: 0, fontSize: 22 }]}
                  maxLength={9}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={onPrimary}
                />
                <View style={{ paddingHorizontal: 14, borderStartWidth: 1, borderStartColor: colors.border }}>
                  <Text style={[textPresets.body, ltrText, { fontFamily: fonts.arabicBold }]}>966+</Text>
                </View>
              </View>
              {presetFromLanding ? (
                <Pressable onPress={() => switchMode(mode === "login" ? "register" : "login")} style={{ marginTop: 16 }}>
                  <Text style={[textPresets.bodySm, { color: colors.primary, textAlign: "center" }]}>
                    {mode === "login" ? "مستخدم جديد؟ إنشاء حساب" : "لديك حساب؟ تسجيل الدخول"}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {step === "otp" ? (
            <View style={{ gap: 20 }}>
              <Text style={[textPresets.caption, { textAlign: "center", color: colors.mutedForeground }]}>
                {roleLabel} · {mode === "login" ? "تسجيل الدخول" : "حساب جديد"}
              </Text>

              <View>
                <TextInput
                  ref={otpRef}
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, 6))}
                  placeholder="1234"
                  placeholderTextColor={colors.mutedForeground}
                  style={[
                    fieldInput,
                    ltrText,
                    {
                      textAlign: "center",
                      fontSize: 28,
                      letterSpacing: 10,
                      fontFamily: fonts.arabicBold,
                    },
                  ]}
                  maxLength={6}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={onPrimary}
                />
                {!configured ? (
                  <Text
                    style={[textPresets.caption, { textAlign: "center", color: colors.mutedForeground, marginTop: 12 }]}
                  >
                    تجريبي: 1234
                  </Text>
                ) : null}
              </View>

              <Pressable onPress={() => setStep("phone")}>
                <Text style={[textPresets.bodySm, { color: colors.primary, textAlign: "center" }]}>
                  تغيير رقم الجوال
                </Text>
              </Pressable>

              {mode === "register" && !showReferral ? (
                <Pressable onPress={() => setShowReferral(true)}>
                  <Text style={[textPresets.bodySm, { color: colors.primary, textAlign: "center" }]}>
                    كود إحالة؟
                  </Text>
                </Pressable>
              ) : null}
              {mode === "register" && showReferral ? (
                <TextInput
                  value={referralCode}
                  onChangeText={(t) => setReferralCode(t.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
                  placeholder="كود الإحالة"
                  placeholderTextColor={colors.mutedForeground}
                  style={[fieldInput, ltrText, { textAlign: "center", fontSize: 15 }]}
                  autoCapitalize="characters"
                />
              ) : null}
            </View>
          ) : null}

          {error ? (
            <Text style={[textPresets.caption, { color: colors.destructive, textAlign: "center", marginTop: 20 }]}>
              {error}
            </Text>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 16) + 8 }}>
          <PrimaryButton label={primaryLabel} onPress={onPrimary} disabled={primaryDisabled} />
          {step === "otp" ? (
            <Text style={[textPresets.caption, { textAlign: "center", color: colors.mutedForeground, marginTop: 12 }]}>
              <Text onPress={() => navigation.navigate("LegalDocument", { kind: "usage" })} style={{ color: colors.primary }}>
                الشروط
              </Text>{" "}
              و{" "}
              <Text onPress={() => navigation.navigate("LegalDocument", { kind: "privacy" })} style={{ color: colors.primary }}>
                الخصوصية
              </Text>
            </Text>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

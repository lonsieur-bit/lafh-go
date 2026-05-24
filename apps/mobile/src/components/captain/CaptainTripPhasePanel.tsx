import { Pressable, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import {
  CAPTAIN_TRIP_PROGRESS_STEPS,
  CAPTAIN_TRIP_STATUS_LABELS,
  type CaptainTripContext,
  getCaptainTripPhaseUi,
  hasIntermediateStops,
  phaseProgressIndex,
} from "@luffa/shared";
import { PrimaryButton } from "@/components/layout";
import { colors, radii } from "@/theme/tokens";
import { fonts, textPresets } from "@/theme/textStyles";

type Props = {
  ctx: CaptainTripContext;
  distanceHint?: string;
  loading?: boolean;
  onPrimary: () => void;
  onSecondary?: () => void;
};

export function CaptainTripPhasePanel({ ctx, distanceHint, loading, onPrimary, onSecondary }: Props) {
  const ui = getCaptainTripPhaseUi(ctx);
  const multi = hasIntermediateStops(ctx);
  const progressIdx = phaseProgressIndex(ctx.phase, multi);

  if (ctx.phase === "completed") {
    return (
      <View style={{ gap: 16 }}>
        <View
          style={{
            padding: 20,
            borderRadius: radii.xl,
            borderWidth: 1,
            borderColor: colors.success,
            backgroundColor: `${colors.success}12`,
            alignItems: "center",
            gap: 8,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.success,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check size={28} color="#fff" strokeWidth={2.5} />
          </View>
          <Text style={[textPresets.title, { fontSize: 22, color: colors.success }]}>{ui.title}</Text>
          {ctx.totalSar != null ? (
            <Text style={[textPresets.body, { color: colors.mutedForeground }]}>
              إجمالي الرحلة: {ctx.totalSar.toFixed(2)} ر.س
            </Text>
          ) : null}
          {ctx.captainNet != null ? (
            <Text style={[textPresets.body, { fontFamily: fonts.arabicBold, color: colors.foreground }]}>
              صافي أرباحك: {ctx.captainNet.toFixed(2)} ر.س
            </Text>
          ) : null}
        </View>
        <PrimaryButton
          label={loading ? "جارٍ..." : (ui.primaryCta ?? "العودة للرئيسية")}
          onPress={onPrimary}
          disabled={loading}
        />
        {ui.secondaryCta && onSecondary ? (
          <Pressable onPress={onSecondary} style={{ paddingVertical: 12, alignItems: "center" }}>
            <Text style={[textPresets.body, { color: colors.primary, fontFamily: fonts.arabicBold }]}>
              {ui.secondaryCta}
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={{ gap: 16 }}>
      {ui.showProgress ? (
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", gap: 4 }}>
          {CAPTAIN_TRIP_PROGRESS_STEPS.map((step, i) => {
            const done = i <= progressIdx;
            const active = i === progressIdx;
            return (
              <View key={step.phase} style={{ flex: 1, alignItems: "center", gap: 4 }}>
                <View
                  style={{
                    width: active ? 12 : 8,
                    height: active ? 12 : 8,
                    borderRadius: 999,
                    backgroundColor: done ? colors.primary : colors.border,
                  }}
                />
                <Text
                  style={{
                    fontFamily: fonts.arabic,
                    fontSize: 9,
                    color: done ? colors.primary : colors.mutedForeground,
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {step.shortLabel}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      <View
        style={{
          padding: 18,
          borderRadius: radii.xl,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          gap: 8,
        }}
      >
        <Text style={[textPresets.title, { fontSize: 20, textAlign: "right" }]}>{ui.title}</Text>
        {ui.subtitle ? (
          <Text style={[textPresets.body, { fontFamily: fonts.arabicBold, textAlign: "right" }]}>{ui.subtitle}</Text>
        ) : null}
        {ui.hint ? (
          <Text style={[textPresets.caption, { textAlign: "right", color: colors.mutedForeground }]}>{ui.hint}</Text>
        ) : null}
        {distanceHint ? (
          <Text style={[textPresets.caption, { textAlign: "right", color: colors.primary }]}>{distanceHint}</Text>
        ) : null}
      </View>

      <View
        style={{
          padding: 14,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.secondary,
          gap: 6,
        }}
      >
        <Text style={[textPresets.caption, { textAlign: "right" }]}>من: {ctx.pickup.label}</Text>
        {multi ? (
          <Text style={[textPresets.caption, { textAlign: "right", color: colors.mutedForeground }]}>
            {ctx.intermediateStops.length} توقف(ات) وسيطة
          </Text>
        ) : null}
        <Text style={[textPresets.caption, { textAlign: "right" }]}>إلى: {ctx.destination.label}</Text>
      </View>

      {ui.primaryCta ? (
        <PrimaryButton
          label={loading ? "جارٍ..." : ui.primaryCta}
          onPress={onPrimary}
          disabled={loading}
        />
      ) : null}

      {ui.secondaryCta && onSecondary ? (
        <Pressable
          onPress={onSecondary}
          style={{
            paddingVertical: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            backgroundColor: colors.card,
          }}
        >
          <Text style={[textPresets.body, { fontFamily: fonts.arabicBold, color: colors.primary }]}>
            {ui.secondaryCta}
          </Text>
        </Pressable>
      ) : null}

      <Text style={[textPresets.caption, { textAlign: "center", color: colors.mutedForeground }]}>
        الحالة: {CAPTAIN_TRIP_STATUS_LABELS[ctx.phase]}
      </Text>
    </View>
  );
}

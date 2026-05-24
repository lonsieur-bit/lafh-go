import { Zap } from "lucide-react-native";
import { Text, View } from "react-native";
import type { ServiceType } from "@luffa/shared";
import {
  FASTEST_SERVICE,
  formatWaitMinutes,
  SERVICE_WAIT_META,
  tierBarColor,
} from "@/shared/serviceWaitIndicators";
import { colors } from "@/theme/tokens";
import { textPresets } from "@/theme/textStyles";

type Props = {
  service: ServiceType;
  /** Chip uses purple fill when selected (home screen) */
  selected?: boolean;
};

function AvailabilityBars({ service, selected }: Props) {
  const meta = SERVICE_WAIT_META[service];
  const activeColor = tierBarColor(meta.tier, !!selected);
  const inactiveColor = selected ? "rgba(255,255,255,0.28)" : colors.border;

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3, justifyContent: "flex-end" }}>
      {[1, 2, 3, 4].map((level) => {
        const filled = level <= meta.availabilityBars;
        return (
          <View
            key={level}
            style={{
              width: 5,
              height: 6 + level * 3,
              borderRadius: 2,
              backgroundColor: filled ? activeColor : inactiveColor,
            }}
          />
        );
      })}
    </View>
  );
}

export function ServiceWaitIndicator({ service, selected = false }: Props) {
  const meta = SERVICE_WAIT_META[service];
  const isFastest = service === FASTEST_SERVICE;
  const textColor = selected ? "rgba(255,255,255,0.92)" : colors.mutedForeground;
  const accentColor = selected ? "#ffffff" : isFastest ? colors.success : colors.primary;

  if (isFastest) {
    return (
      <View
        style={{
          marginTop: 8,
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "flex-end",
          gap: 4,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 20,
          backgroundColor: selected ? "rgba(255,255,255,0.2)" : `${colors.success}18`,
          borderWidth: 1,
          borderColor: selected ? "rgba(255,255,255,0.45)" : `${colors.success}55`,
        }}
      >
        <Zap width={12} height={12} color={accentColor} fill={accentColor} />
        <Text
          style={{
            fontSize: 10,
            fontFamily: textPresets.title.fontFamily,
            color: accentColor,
          }}
        >
          أسرع قبول
        </Text>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 8, gap: 4, alignItems: "flex-end" }}>
      <AvailabilityBars service={service} selected={selected} />
      <Text style={{ fontSize: 10, color: textColor, textAlign: "right" }}>
        {formatWaitMinutes(meta.waitMinutes)} انتظار
      </Text>
    </View>
  );
}

/** One-line hint under the service row on booking */
export function ServiceWaitLegend({ service }: { service: ServiceType }) {
  const meta = SERVICE_WAIT_META[service];
  const isFastest = service === FASTEST_SERVICE;

  return (
    <View
      style={{
        marginTop: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: isFastest ? `${colors.success}12` : colors.secondary,
        borderWidth: 1,
        borderColor: isFastest ? `${colors.success}40` : colors.border,
      }}
    >
      <Text style={[textPresets.caption, { textAlign: "right", color: isFastest ? colors.success : colors.mutedForeground }]}>
        {isFastest ? "⚡ " : ""}
        {meta.hintAr} · {formatWaitMinutes(meta.waitMinutes)} تقريباً حتى قبول الكابتن
      </Text>
    </View>
  );
}

import { useState } from "react";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Calendar, Clock } from "lucide-react-native";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { colors } from "@/theme/tokens";
import { fonts, ltrText, rtlText, textPresets } from "@/theme/textStyles";

export const freightInputStyle = {
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

export function FieldLabel({ children }: { children: string }) {
  return <Text style={[textPresets.labelMuted, { marginBottom: 8, textAlign: "right" }]}>{children}</Text>;
}

export function formatLoadDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatLoadTime(d: Date) {
  return d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function PickerField({
  label,
  value,
  placeholder,
  Icon,
  onPress,
}: {
  label: string;
  value: string;
  placeholder: string;
  Icon: typeof Calendar;
  onPress: () => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      <FieldLabel>{label}</FieldLabel>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={[freightInputStyle, { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }]}
      >
        <Text style={[value ? textPresets.body : textPresets.caption, ltrText, { flex: 1, textAlign: "center" }]}>
          {value || placeholder}
        </Text>
        <Icon width={18} height={18} color={colors.mutedForeground} />
      </Pressable>
    </View>
  );
}

type PickerKind = "date" | "time" | null;

export function SchedulePicker({
  loadAt,
  setLoadAt,
  dateLabel = "تاريخ الاستلام",
  timeLabel = "وقت الاستلام",
}: {
  loadAt: Date;
  setLoadAt: React.Dispatch<React.SetStateAction<Date>>;
  dateLabel?: string;
  timeLabel?: string;
}) {
  const [activePicker, setActivePicker] = useState<PickerKind>(null);
  const dateStr = formatLoadDate(loadAt);
  const timeStr = formatLoadTime(loadAt);

  const onPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setActivePicker(null);
    if (event.type === "dismissed" || !selected) return;
    setLoadAt((prev) => {
      const next = new Date(prev);
      if (activePicker === "date") {
        next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      } else if (activePicker === "time") {
        next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      }
      return next;
    });
  };

  return (
    <>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <PickerField label={dateLabel} value={dateStr} placeholder="dd/mm/yyyy" Icon={Calendar} onPress={() => setActivePicker("date")} />
        <PickerField label={timeLabel} value={timeStr} placeholder="--:--" Icon={Clock} onPress={() => setActivePicker("time")} />
      </View>
      {activePicker ? (
        <View style={{ marginTop: 4 }}>
          <DateTimePicker
            value={loadAt}
            mode={activePicker}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onPickerChange}
            minimumDate={activePicker === "date" ? new Date() : undefined}
            locale="ar-SA"
          />
          {Platform.OS === "ios" ? (
            <Pressable
              onPress={() => setActivePicker(null)}
              style={{
                marginTop: 8,
                alignSelf: "center",
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 12,
                backgroundColor: colors.primary,
              }}
            >
              <Text style={[textPresets.bodySm, { color: colors.primaryForeground }]}>تم</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </>
  );
}

export function ChipSelect<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (k: T) => void;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 9,
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
  );
}

export function SuggestedPriceField({
  price,
  onChangePrice,
  label = "السعر المقترح (اختياري)",
}: {
  price: string;
  onChangePrice: (v: string) => void;
  label?: string;
}) {
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.secondary,
          overflow: "hidden",
        }}
      >
        <TextInput
          value={price}
          onChangeText={(v) => onChangePrice(v.replace(/[^0-9.]/g, ""))}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={colors.mutedForeground}
          style={[freightInputStyle, ltrText, { flex: 1, borderWidth: 0, textAlign: "center", backgroundColor: "transparent" }]}
        />
        <View style={{ paddingHorizontal: 14, paddingVertical: 12, borderStartWidth: 1, borderStartColor: colors.border, backgroundColor: colors.card }}>
          <Text style={[textPresets.bodySm, ltrText, { color: colors.mutedForeground }]}>ر.س</Text>
        </View>
      </View>
      <Text style={[textPresets.caption, { marginTop: 6, textAlign: "right", color: colors.mutedForeground }]}>بالريال السعودي</Text>
    </View>
  );
}

export function RouteRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Text style={[textPresets.caption, { color: colors.mutedForeground, marginBottom: 4 }]}>{label}</Text>
      <Text style={[textPresets.body, { textAlign: "right" }]}>{value || "—"}</Text>
    </View>
  );
}

import { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Switch, Text, TextInput, View } from "react-native";
import { AppHeader, PrimaryButton, StackScreenLayout } from "@/components/layout";
import {
  FieldLabel,
  RouteRow,
  SchedulePicker,
  SuggestedPriceField,
  freightInputStyle,
} from "@/components/freight/formShared";
import { figmaCard } from "@/theme/figmaStyles";
import { colors } from "@/theme/tokens";
import { rtlText, textPresets } from "@/theme/textStyles";
import { getSessionUserId, isSupabaseReady, submitCargoRequest } from "@luffa/shared";
import type { AppStackParamList } from "@/navigation/types";
import { useStackBack } from "@/navigation/useStackBack";
import { useAppState } from "@/state/AppStateContext";

type Props = NativeStackScreenProps<AppStackParamList, "CargoRequest">;

export function CargoRequestScreen({ navigation, route }: Props) {
  const onBack = useStackBack("Booking");
  const { bookingDraft, setBookingDraft } = useAppState();

  const pickup = route.params?.pickup?.trim() || bookingDraft.from || "نقطة الاستلام";
  const dropoff = route.params?.destination?.trim() || bookingDraft.to || "نقطة التسليم";

  const [cargoType, setCargoType] = useState("أثاث منزلي");
  const [notes, setNotes] = useState("");
  const [withLoading, setWithLoading] = useState(true);
  const [price, setPrice] = useState("");
  const [loadAt, setLoadAt] = useState(() => {
    const d = new Date();
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
    return d;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!cargoType.trim()) {
      setError("نوع الحمولة مطلوب.");
      return;
    }
    setLoading(true);
    setError("");
    const summary = [
      cargoType.trim(),
      notes.trim() || null,
      withLoading ? "مع التحميل / التنزيل" : null,
      price ? `${price} ر.س` : null,
    ]
      .filter(Boolean)
      .join(" · ");

    try {
      if (isSupabaseReady()) {
        const uid = await getSessionUserId();
        if (uid) {
          await submitCargoRequest({
            riderId: uid,
            from: pickup,
            to: dropoff,
            description: summary,
          });
        }
      }
      const parsedPrice = price.trim() ? Number(price.replace(/[^\d.]/g, "")) : NaN;
      const offerTotal = Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice : bookingDraft.total;

      setBookingDraft({
        ...bookingDraft,
        serviceType: "cargo",
        from: pickup,
        to: dropoff,
        total: offerTotal,
        baseFare: offerTotal,
        freightNotes: summary,
      });
      navigation.navigate("Checkout");
    } catch {
      setError("تعذر إرسال طلب الشحن. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StackScreenLayout
      header={<AppHeader title="نقل بضائع وشحن" onBack={onBack} />}
      footer={
        <PrimaryButton
          label={loading ? "جارٍ تجهيز الطلب..." : "متابعة للدفع"}
          onPress={submit}
          disabled={loading}
        />
      }
      contentContainerStyle={{ gap: 16, paddingTop: 8 }}
    >
      <View style={{ ...figmaCard, padding: 18, gap: 14 }}>
        <View>
          <FieldLabel>نوع الحمولة</FieldLabel>
          <TextInput
            value={cargoType}
            onChangeText={setCargoType}
            placeholder="مثال: أثاث منزلي"
            placeholderTextColor={colors.mutedForeground}
            style={[freightInputStyle, rtlText]}
          />
        </View>
        <View>
          <FieldLabel>ملاحظات</FieldLabel>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="اكتب تفاصيل الحمولة وأي ملاحظات مهمة"
            placeholderTextColor={colors.mutedForeground}
            multiline
            style={[freightInputStyle, rtlText, { minHeight: 88, textAlignVertical: "top" }]}
          />
        </View>
      </View>

      <View style={{ ...figmaCard, padding: 18, gap: 4 }}>
        <Text style={[textPresets.body, { fontFamily: textPresets.title.fontFamily, marginBottom: 8, textAlign: "right" }]}>
          المسار
        </Text>
        <RouteRow label="استلام من" value={pickup} />
        <RouteRow label="تسليم إلى" value={dropoff} />
      </View>

      <View style={{ ...figmaCard, padding: 18, gap: 14 }}>
        <SchedulePicker loadAt={loadAt} setLoadAt={setLoadAt} dateLabel="تاريخ التحميل" timeLabel="وقت التحميل" />
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Switch value={withLoading} onValueChange={setWithLoading} trackColor={{ true: colors.primary, false: colors.border }} />
          <Text style={textPresets.bodySm}>مع التحميل / التنزيل</Text>
        </View>
        <SuggestedPriceField price={price} onChangePrice={setPrice} label="السعر المقترح لنقل البضائع (اختياري)" />
        {error ? <Text style={[textPresets.caption, { color: colors.destructive, textAlign: "center" }]}>{error}</Text> : null}
      </View>
    </StackScreenLayout>
  );
}

import { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, TextInput, View } from "react-native";
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

type Props = NativeStackScreenProps<AppStackParamList, "TowRequest">;

export function TowRequestScreen({ navigation, route }: Props) {
  const onBack = useStackBack("Booking");
  const { bookingDraft, setBookingDraft } = useAppState();

  const vehicleLocation = route.params?.pickup?.trim() || bookingDraft.from || "موقع المركبة";
  const towDestination = route.params?.destination?.trim() || bookingDraft.to || "وجهة السحب";

  const [vehicleType, setVehicleType] = useState("سيارة");
  const [notes, setNotes] = useState("");
  const [price, setPrice] = useState("");
  const [loadAt, setLoadAt] = useState(() => new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!vehicleType.trim()) {
      setError("نوع المركبة مطلوب.");
      return;
    }
    setLoading(true);
    setError("");
    const summary = [vehicleType.trim(), notes.trim() || null, price ? `${price} ر.س` : null].filter(Boolean).join(" · ");

    try {
      if (isSupabaseReady()) {
        const uid = await getSessionUserId();
        if (uid) {
          await submitCargoRequest({
            riderId: uid,
            from: vehicleLocation,
            to: towDestination,
            description: `سطحة — ${summary}`,
          });
        }
      }
      const parsedPrice = price.trim() ? Number(price.replace(/[^\d.]/g, "")) : NaN;
      const offerTotal = Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice : bookingDraft.total;

      setBookingDraft({
        ...bookingDraft,
        serviceType: "tow",
        from: vehicleLocation,
        to: towDestination,
        total: offerTotal,
        baseFare: offerTotal,
        freightNotes: summary,
      });
      navigation.navigate("Checkout");
    } catch {
      setError("تعذر إرسال طلب السطحة. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StackScreenLayout
      header={<AppHeader title="طلب سطحة" onBack={onBack} />}
      footer={
        <PrimaryButton label={loading ? "جارٍ تجهيز الطلب..." : "متابعة للدفع"} onPress={submit} disabled={loading} />
      }
      contentContainerStyle={{ gap: 16, paddingTop: 8 }}
    >
      <View style={{ ...figmaCard, padding: 18, gap: 14 }}>
        <View>
          <FieldLabel>نوع المركبة</FieldLabel>
          <TextInput
            value={vehicleType}
            onChangeText={setVehicleType}
            placeholder="مثال: سيارة"
            placeholderTextColor={colors.mutedForeground}
            style={[freightInputStyle, rtlText]}
          />
        </View>
        <View>
          <FieldLabel>ملاحظات</FieldLabel>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="اكتب تفاصيل المركبة والموقع وأي ملاحظات مهمة"
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
        <RouteRow label="موقع المركبة" value={vehicleLocation} />
        <RouteRow label="الوجهة" value={towDestination} />
      </View>

      <View style={{ ...figmaCard, padding: 18, gap: 14 }}>
        <SchedulePicker loadAt={loadAt} setLoadAt={setLoadAt} dateLabel="تاريخ السحب" timeLabel="وقت السحب" />
        <SuggestedPriceField price={price} onChangePrice={setPrice} label="السعر المقترح للسطحة (اختياري)" />
        {error ? <Text style={[textPresets.caption, { color: colors.destructive, textAlign: "center" }]}>{error}</Text> : null}
      </View>
    </StackScreenLayout>
  );
}

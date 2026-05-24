import { useState } from "react";
import { AppHeader, StackScreenLayout } from "@/components/layout";
import { rtlText, textPresets } from "@/theme/textStyles";
import { colors } from "@/theme/tokens";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react-native";
import { KeyboardAvoidingView, Modal, Platform, Pressable, Switch, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AppStackParamList } from "@/navigation/types";
import { useStackBack } from "@/navigation/useStackBack";
import type { SavedAddress } from "@/shared/types";
import { useAppState } from "@/state/AppStateContext";

type Props = NativeStackScreenProps<AppStackParamList, "Addresses">;

export function AddressesScreen({ navigation }: Props) {
  const onBack = useStackBack();
  const { addresses, addAddress, deleteAddress, updateAddress, setDefaultAddress } = useAppState();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [detail, setDetail] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState("");
  const insets = useSafeAreaInsets();

  const resetForm = () => {
    setLabel("");
    setDetail("");
    setIsDefault(false);
    setEditingId(null);
    setError("");
  };

  const handleSubmit = () => {
    if (!label.trim() || !detail.trim()) {
      setError("أدخل التسمية والتفاصيل قبل الحفظ.");
      return;
    }
    const payload: Omit<SavedAddress, "id"> = {
      label: label.trim(),
      detail: detail.trim(),
      isDefault,
    };
    if (editingId) {
      updateAddress(editingId, payload);
      if (isDefault) setDefaultAddress(editingId);
    } else {
      addAddress(payload);
    }
    resetForm();
    setOpen(false);
  };

  const startEdit = (address: SavedAddress) => {
    setEditingId(address.id);
    setLabel(address.label);
    setDetail(address.detail);
    setIsDefault(address.isDefault);
    setError("");
    setOpen(true);
  };

  const startNew = () => {
    resetForm();
    setOpen(true);
  };

  return (
    <>
    <StackScreenLayout header={<AppHeader title="العناوين" onBack={onBack} />}>
          <Pressable
            onPress={startNew}
            className="rounded-2xl bg-card border border-border p-4 shadow-elevated w-full flex-row items-center justify-center gap-3"
          >
            <Plus width={18} height={18} color={colors.primary} />
            <Text style={[textPresets.bodySm, { color: colors.primary }]}>إضافة عنوان جديد</Text>
          </Pressable>

          {addresses.length === 0 ? (
            <View className="rounded-2xl bg-card border border-border p-5 shadow-elevated w-full items-center">
              <Text style={textPresets.bodySm}>لا توجد عناوين محفوظة حالياً.</Text>
            </View>
          ) : null}

          {addresses.map((a) => (
            <View key={a.id} className="rounded-2xl bg-card border border-border p-5 shadow-elevated w-full">
              <View className="flex-row items-start justify-between gap-3 mb-2">
                <View className="flex-row items-center gap-2 flex-1 min-w-0 flex-wrap">
                  <MapPin width={18} height={18} color={colors.primary} />
                  <Text className="text-sm font-bold text-foreground font-arabic" style={rtlText}>
                    {a.label}
                  </Text>
                  {a.isDefault ? (
                    <View className="flex-row items-center gap-0.5 px-2 py-0.5 rounded-full bg-warning/10 shrink-0">
                      <Star width={10} height={10} color={colors.warning} fill={colors.warning} />
                      <Text className="text-[10px] text-warning font-arabic font-semibold">افتراضي</Text>
                    </View>
                  ) : null}
                </View>
                <View className="flex-row gap-2 shrink-0">
                  <Pressable onPress={() => startEdit(a)} className="w-9 h-9 rounded-lg bg-secondary items-center justify-center border border-border">
                    <Pencil width={14} height={14} color={colors.foreground} />
                  </Pressable>
                  <Pressable
                    onPress={() => deleteAddress(a.id)}
                    className="w-9 h-9 rounded-lg bg-destructive/10 items-center justify-center border border-destructive/20"
                  >
                    <Trash2 width={14} height={14} color={colors.destructive} />
                  </Pressable>
                </View>
              </View>
              <Text className="text-xs text-muted-foreground font-arabic leading-relaxed w-full" style={rtlText}>
                {a.detail}
              </Text>
              {!a.isDefault ? (
                <Pressable className="mt-3 rounded-xl bg-secondary py-2.5 border border-border items-center" onPress={() => setDefaultAddress(a.id)}>
                  <Text className="text-xs font-arabic font-semibold text-foreground px-2" style={rtlText}>
                    جعل هذا العنوان افتراضياً
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ))}
    </StackScreenLayout>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setOpen(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 16 : 0}
          >
          <Pressable className="bg-card rounded-t-3xl border-t border-border p-5 max-h-[85%]" onPress={(e) => e.stopPropagation()}>
            <Text className="text-base font-bold font-arabic text-foreground mb-4 text-center w-full px-2" style={rtlText}>
              {editingId ? "تعديل العنوان" : "عنوان جديد"}
            </Text>
            <Text className="text-xs text-muted-foreground font-arabic mb-1 w-full" style={rtlText}>التسمية</Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="مثال: المنزل"
              placeholderTextColor={colors.mutedForeground}
              className="rounded-xl border border-border bg-secondary px-3 py-3 text-foreground font-arabic mb-3 w-full"
              style={{ textAlign: "right", ...rtlText }}
            />
            <Text className="text-xs text-muted-foreground font-arabic mb-1 w-full" style={rtlText}>التفاصيل</Text>
            <TextInput
              value={detail}
              onChangeText={setDetail}
              placeholder="الحي، الشارع، المعلم"
              placeholderTextColor={colors.mutedForeground}
              multiline
              className="rounded-xl border border-border bg-secondary px-3 py-3 text-foreground font-arabic mb-4 min-h-[88px] w-full"
              style={{ textAlign: "right", ...rtlText }}
            />
            <View className="flex-row items-center justify-between mb-4 gap-4 px-1">
              <Text className="text-sm font-arabic text-foreground flex-1" style={rtlText}>
                عنوان افتراضي
              </Text>
              <Switch value={isDefault} onValueChange={setIsDefault} />
            </View>
            <View className="flex-row gap-3">
              <Pressable className="flex-1 rounded-xl py-3 bg-secondary border border-border items-center" onPress={() => setOpen(false)}>
                <Text className="text-sm font-arabic font-semibold text-foreground text-center" style={rtlText}>
                  إلغاء
                </Text>
              </Pressable>
              <Pressable className="flex-1 rounded-xl py-3 bg-primary items-center shadow-glow" onPress={handleSubmit}>
                <Text className="text-sm font-arabic font-bold text-primary-foreground text-center" style={rtlText}>
                  حفظ
                </Text>
              </Pressable>
            </View>
            {error ? <Text style={[textPresets.caption, { color: colors.destructive, marginTop: 8 }]}>{error}</Text> : null}
          </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </>
  );
}

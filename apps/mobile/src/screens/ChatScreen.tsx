import { useCallback, useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, Phone, Send } from "lucide-react-native";
import { ActivityIndicator, I18nManager, Platform, Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  fetchOrderMessages,
  isSupabaseReady,
  sendOrderMessage,
  subscribeOrderMessages,
  type OrderChatMessage,
} from "@luffa/shared";
import { StackScreenLayout } from "@/components/layout";
import type { AppStackParamList } from "@/navigation/types";
import type { CaptainStackParamList } from "@/navigation/CaptainNavigator";
import { dialPhone } from "@/lib/phoneCall";
import { colors, gradientColors, gradients } from "@/theme/tokens";
import { ltrText, rtlText, textPresets } from "@/theme/textStyles";
import type { ChatBubble } from "@/shared/types";
import { useAppState } from "@/state/AppStateContext";

type Props =
  | NativeStackScreenProps<AppStackParamList, "Chat">
  | NativeStackScreenProps<CaptainStackParamList, "CaptainChat">;

function ChatHeader({
  onBack,
  peerName,
  peerPhone,
}: {
  onBack: () => void;
  peerName: string;
  peerPhone?: string | null;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingBottom: 14,
        paddingHorizontal: 20,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.secondary,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowRight size={18} color={colors.foreground} />
        </Pressable>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={textPresets.title}>{peerName}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />
            <Text style={[textPresets.caption, { color: colors.success }]}>محادثة الرحلة</Text>
          </View>
        </View>

        <Pressable
          onPress={() => void dialPhone(peerPhone)}
          accessibilityRole="button"
          accessibilityLabel="اتصال"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.secondary,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Phone size={18} color={colors.foreground} />
        </Pressable>
      </View>
    </View>
  );
}

function bubbleAlign(mine: boolean): "flex-start" | "flex-end" {
  const rtl = I18nManager.isRTL;
  if (mine) return rtl ? "flex-start" : "flex-end";
  return rtl ? "flex-end" : "flex-start";
}

function toBubble(m: OrderChatMessage | ChatBubble): ChatBubble {
  if ("body" in m) {
    return { id: m.id, text: m.body, role: m.role, time: m.time };
  }
  return m;
}

export function ChatScreen({ route, navigation }: Props) {
  const params = route.params;
  const orderId = params && "orderId" in params ? params.orderId : undefined;
  const peerName = params && "peerName" in params ? params.peerName : "خالد الأحمد";
  const peerPhone = params && "peerPhone" in params ? params.peerPhone : null;

  const { chatMessages: legacyMessages, sendChatMessage } = useAppState();
  const [orderMessages, setOrderMessages] = useState<OrderChatMessage[]>([]);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const insets = useSafeAreaInsets();

  const loadMessages = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      if (isSupabaseReady()) {
        const rows = await fetchOrderMessages(orderId);
        setOrderMessages(rows);
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!orderId || !isSupabaseReady()) return;
    const unsub = subscribeOrderMessages(orderId, (msg) => {
      setOrderMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
    return unsub;
  }, [orderId]);

  const displayMessages: ChatBubble[] = orderId
    ? orderMessages.map(toBubble)
    : legacyMessages;

  const send = async () => {
    const t = text.trim();
    if (!t) {
      setError("لا يمكن إرسال رسالة فارغة.");
      return;
    }
    setError("");
    setSending(true);
    try {
      if (orderId && isSupabaseReady()) {
        const sent = await sendOrderMessage(orderId, t);
        if (sent) {
          setOrderMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]));
        }
      } else if (orderId) {
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        setOrderMessages((prev) => [
          ...prev,
          { id: `local-${Date.now()}`, orderId, senderId: "me", body: t, createdAt: now.toISOString(), role: "user", time },
        ]);
      } else {
        sendChatMessage(t);
      }
      setText("");
    } catch {
      setError("تعذّر إرسال الرسالة. حاول مرة أخرى.");
    } finally {
      setSending(false);
    }
  };

  const renderBubble = (m: ChatBubble) => {
    const mine = m.role === "user";
    const align = bubbleAlign(mine);

    return (
      <View key={m.id} style={{ width: "100%", marginBottom: 16, alignItems: align }}>
        <View style={{ maxWidth: "85%" }}>
          {mine ? (
            <LinearGradient
              colors={gradientColors(gradients.chatMine)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 18,
                borderTopLeftRadius: 6,
                borderTopRightRadius: 18,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              <Text style={[textPresets.body, rtlText, { color: colors.primaryForeground }]}>{m.text}</Text>
            </LinearGradient>
          ) : (
            <View
              style={{
                borderRadius: 18,
                borderTopRightRadius: 6,
                borderTopLeftRadius: 18,
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={[textPresets.body, rtlText, { color: colors.foreground }]}>{m.text}</Text>
            </View>
          )}
          {m.time ? (
            <Text
              style={[
                textPresets.caption,
                ltrText,
                { marginTop: 6, color: colors.mutedForeground, textAlign: align === "flex-start" ? "right" : "left" },
              ]}
            >
              {m.time}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  const composer = (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Math.max(insets.bottom, 12),
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="اكتب رسالة..."
          placeholderTextColor={colors.mutedForeground}
          editable={!sending}
          style={{
            flex: 1,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
            paddingHorizontal: 18,
            paddingVertical: 12,
            minHeight: 48,
            maxHeight: 120,
            textAlign: "right",
            color: colors.foreground,
            fontSize: 15,
            ...rtlText,
          }}
          multiline
          blurOnSubmit={false}
          onSubmitEditing={() => Platform.OS !== "ios" && void send()}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => void send()}
          disabled={sending}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            opacity: sending ? 0.6 : 1,
          }}
        >
          <Send width={20} height={20} color={colors.primaryForeground} />
        </Pressable>
      </View>
      {error ? (
        <Text style={[textPresets.caption, { color: colors.destructive, textAlign: "center", marginTop: 8 }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );

  return (
    <StackScreenLayout
      header={<ChatHeader onBack={() => navigation.goBack()} peerName={peerName} peerPhone={peerPhone} />}
      footer={composer}
      footerEdgeToEdge
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 0 }}
    >
      {loading ? (
        <View style={{ paddingVertical: 32, alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        displayMessages.map(renderBubble)
      )}
    </StackScreenLayout>
  );
}

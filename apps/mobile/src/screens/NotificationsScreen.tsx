import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ArrowRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StackScreenLayout } from "@/components/layout";
import type { AppStackParamList } from "@/navigation/types";
import { useStackBack } from "@/navigation/useStackBack";
import type { AppNotification } from "@/shared/types";
import { useAppState } from "@/state/AppStateContext";
import { colors } from "@/theme/tokens";
import { textPresets } from "@/theme/textStyles";

type Props = NativeStackScreenProps<AppStackParamList, "Notifications">;

function NotificationsHeader({
  onBack,
  onMarkAllRead,
}: {
  onBack: () => void;
  onMarkAllRead: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
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

        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text style={textPresets.title}>الإشعارات</Text>
          <Text style={[textPresets.caption, { marginTop: 4, color: colors.mutedForeground }]}>
            آخر التحديثات والعروض
          </Text>
        </View>

        <Pressable
          onPress={onMarkAllRead}
          style={{
            borderRadius: 20,
            backgroundColor: colors.secondary,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 12,
            paddingVertical: 8,
            maxWidth: 120,
          }}
        >
          <Text style={[textPresets.caption, { textAlign: "center", color: colors.mutedForeground }]} numberOfLines={2}>
            تعليم الكل كمقروء
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function NotificationCard({ item, onPress }: { item: AppNotification; onPress: () => void }) {
  const unread = !item.read;

  return (
    <Pressable
      onPress={onPress}
      style={{
        width: "100%",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: unread ? `${colors.primary}30` : colors.border,
        backgroundColor: unread ? `${colors.primary}10` : colors.card,
        ...(unread
          ? {}
          : {
              shadowColor: "#1a1323",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }),
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
        {unread ? (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: colors.primary,
              marginTop: 6,
            }}
          />
        ) : (
          <View style={{ width: 8 }} />
        )}

        <View style={{ flex: 1 }}>
          <Text
            style={[
              textPresets.body,
              { fontFamily: textPresets.title.fontFamily, textAlign: "right" },
              unread && { color: colors.foreground },
            ]}
          >
            {item.title}
          </Text>
          <Text style={[textPresets.bodySm, { marginTop: 6, textAlign: "right", color: colors.mutedForeground }]}>
            {item.body}
          </Text>
          <Text
            style={[
              textPresets.caption,
              { marginTop: 10, textAlign: "right", color: colors.mutedForeground },
            ]}
          >
            {item.time}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function NotificationSection({
  title,
  items,
  onRead,
}: {
  title: string;
  items: AppNotification[];
  onRead: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <View style={{ marginBottom: 8 }}>
      <Text
        style={[
          textPresets.captionBold,
          { marginBottom: 12, color: colors.mutedForeground, textAlign: "right" },
        ]}
      >
        {title}
      </Text>
      <View style={{ gap: 12 }}>{items.map((n) => <NotificationCard key={n.id} item={n} onPress={() => onRead(n.id)} />)}</View>
    </View>
  );
}

export function NotificationsScreen({ navigation }: Props) {
  const onBack = useStackBack();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppState();
  const today = notifications.filter((n) => n.group === "today");
  const earlier = notifications.filter((n) => n.group === "earlier");

  return (
    <StackScreenLayout
      header={<NotificationsHeader onBack={onBack} onMarkAllRead={markAllNotificationsRead} />}
      contentContainerStyle={{ gap: 8, paddingTop: 16 }}
    >
      <NotificationSection title="اليوم" items={today} onRead={markNotificationRead} />
      <NotificationSection title="سابقاً" items={earlier} onRead={markNotificationRead} />
    </StackScreenLayout>
  );
}

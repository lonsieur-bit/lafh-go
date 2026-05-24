import { ActivityIndicator, Text, View } from "react-native";
import { usePlatformAppEnabled } from "@luffa/shared";
import { colors } from "@/theme/tokens";

const rtlText = { writingDirection: "rtl" as const };

function MaintenanceContent({ message }: { message: string }) {
  return (
    <View className="flex-1 bg-background items-center justify-center px-8" style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="w-16 h-16 rounded-2xl bg-amber-500/15 items-center justify-center mb-4">
        <Text className="text-3xl">⏸</Text>
      </View>
      <Text className="text-lg font-arabic font-bold text-foreground mb-2 text-center" style={rtlText}>
        التطبيق غير متاح حاليًا
      </Text>
      <Text className="text-sm text-muted-foreground font-arabic text-center leading-relaxed" style={rtlText}>
        {message}
      </Text>
    </View>
  );
}

export function AppAvailabilityGate({ children }: { children: React.ReactNode }) {
  const { appEnabled, maintenanceMessage, isLoading } = usePlatformAppEnabled();

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center" style={{ flex: 1, backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!appEnabled) return <MaintenanceContent message={maintenanceMessage} />;
  return <>{children}</>;
}

import { ReactNode } from "react";
import { Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

/** Consistent “card + titled header bar” used on booking-style forms. */
export function ScreenSection({ title, subtitle, children, className = "", bodyClassName = "p-4" }: Props) {
  return (
    <View className={`rounded-2xl overflow-hidden bg-card border border-border shadow-elevated-lg ${className}`}>
      <View className="px-4 pt-4 pb-3 border-b border-border/70 bg-muted/50">
        <View className="flex-row items-center gap-3">
          <View className="w-[3px] rounded-full bg-primary" style={{ alignSelf: "stretch", minHeight: 20 }} />
          <View className="flex-1 min-w-0">
            <Text className="text-[15px] font-bold font-arabic text-foreground leading-tight">{title}</Text>
            {subtitle ? <Text className="text-xs text-muted-foreground font-arabic mt-1 leading-snug">{subtitle}</Text> : null}
          </View>
        </View>
      </View>
      <View className={bodyClassName}>{children}</View>
    </View>
  );
}

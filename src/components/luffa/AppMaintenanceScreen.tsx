import { Construction } from "lucide-react";
import { usePlatformAppEnabled } from "@luffa/shared";

export function AppMaintenanceScreen() {
  const { maintenanceMessage, isLoading } = usePlatformAppEnabled();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-muted-foreground font-arabic">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center min-h-[480px]">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700">
        <Construction className="h-8 w-8" />
      </div>
      <h2 className="text-lg font-extrabold font-arabic">التطبيق غير متاح حاليًا</h2>
      <p className="text-sm text-muted-foreground font-arabic leading-relaxed max-w-[280px]">
        {maintenanceMessage}
      </p>
    </div>
  );
}

export function AppAvailabilityGate({ children }: { children: React.ReactNode }) {
  const { appEnabled, isLoading } = usePlatformAppEnabled();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-muted-foreground font-arabic">جاري التحميل...</p>
      </div>
    );
  }

  if (!appEnabled) return <AppMaintenanceScreen />;
  return <>{children}</>;
}

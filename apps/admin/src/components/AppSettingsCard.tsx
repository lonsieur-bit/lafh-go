import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchPlatformSettings,
  PLATFORM_CURRENCY_QUERY_KEY,
  PLATFORM_SETTINGS_QUERY_KEY,
  updatePlatformAppSettings,
} from "@luffa/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Power } from "lucide-react";

export function AppSettingsCard({ isAdmin }: { isAdmin: boolean }) {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: PLATFORM_SETTINGS_QUERY_KEY,
    queryFn: fetchPlatformSettings,
  });

  const [appEnabled, setAppEnabled] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!settings) return;
    setAppEnabled(settings.app_enabled);
    setMessage(settings.maintenance_message_ar ?? "");
  }, [settings]);

  const save = useMutation({
    mutationFn: () =>
      updatePlatformAppSettings({
        app_enabled: appEnabled,
        maintenance_message_ar: message || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PLATFORM_SETTINGS_QUERY_KEY });
      qc.invalidateQueries({ queryKey: PLATFORM_CURRENCY_QUERY_KEY });
      toast.success(appEnabled ? "تم تفعيل التطبيق للمستخدمين" : "تم إيقاف التطبيق للمستخدمين");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">جاري تحميل إعدادات التطبيق...</p>;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            appEnabled ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-800"
          }`}
        >
          <Power className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-lg">تشغيل التطبيق</h3>
          <p className="text-sm text-muted-foreground mt-1">
            عند الإيقاف، يظهر للمستخدمين والكباتن في تطبيق الجوال والويب رسالة صيانة ولا يمكنهم الحجز.
            لوحة التحكم تبقى متاحة.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
        <div>
          <p className="font-medium text-sm">التطبيق متاح للجمهور</p>
          <p className="text-xs text-muted-foreground">
            {appEnabled ? "الحالة: مفعّل" : "الحالة: متوقف — وضع الصيانة"}
          </p>
        </div>
        <Switch checked={appEnabled} onCheckedChange={setAppEnabled} disabled={!isAdmin} />
      </div>

      <div className="space-y-2">
        <Label>رسالة الصيانة (عند الإيقاف)</Label>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!isAdmin}
          placeholder="التطبيق متوقف مؤقتًا للصيانة..."
        />
      </div>

      {isAdmin && (
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          حفظ حالة التطبيق
        </Button>
      )}
    </div>
  );
}

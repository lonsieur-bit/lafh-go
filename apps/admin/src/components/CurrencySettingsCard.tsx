import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CURRENCY_OPTIONS,
  fetchPlatformCurrencySettings,
  PLATFORM_CURRENCY_QUERY_KEY,
  updatePlatformCurrencySettings,
  type DisplayCurrency,
} from "@luffa/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function CurrencySettingsCard({ isAdmin }: { isAdmin: boolean }) {
  const qc = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: PLATFORM_CURRENCY_QUERY_KEY,
    queryFn: fetchPlatformCurrencySettings,
  });

  const [currency, setCurrency] = useState<DisplayCurrency>("SAR");
  const [usdPerSar, setUsdPerSar] = useState("0.266667");
  const [sypPerSar, setSypPerSar] = useState("3500");

  useEffect(() => {
    if (!settings) return;
    setCurrency(settings.display_currency);
    setUsdPerSar(String(settings.usd_per_sar));
    setSypPerSar(String(settings.syp_per_sar));
  }, [settings]);

  const save = useMutation({
    mutationFn: () =>
      updatePlatformCurrencySettings({
        display_currency: currency,
        usd_per_sar: Number(usdPerSar),
        syp_per_sar: Number(sypPerSar),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PLATFORM_CURRENCY_QUERY_KEY });
      toast.success("تم حفظ إعدادات العملة — ستظهر في التطبيق فورًا");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">جاري تحميل العملة...</p>;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div>
        <h3 className="font-bold text-lg">عملة العرض</h3>
        <p className="text-sm text-muted-foreground mt-1">
          تُخزَّن المبالغ داخليًا بالريال السعودي. اختر العملة المعروضة في التطبيق ولوحة التحكم مع أسعار التحويل.
        </p>
      </div>

      <div className="space-y-2">
        <Label>العملة النشطة</Label>
        <div className="flex flex-wrap gap-2">
          {CURRENCY_OPTIONS.map((opt) => (
            <Button
              key={opt.code}
              type="button"
              size="sm"
              variant={currency === opt.code ? "default" : "outline"}
              disabled={!isAdmin}
              onClick={() => setCurrency(opt.code)}
            >
              {opt.labelAr} ({opt.symbol})
            </Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>1 ر.س = … دولار (USD)</Label>
          <Input
            type="number"
            step="0.000001"
            min={0}
            dir="ltr"
            disabled={!isAdmin}
            value={usdPerSar}
            onChange={(e) => setUsdPerSar(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">مثال: 0.266667 ≈ 3.75 ر.س للدولار</p>
        </div>
        <div className="space-y-2">
          <Label>1 ر.س = … ليرة سورية (SYP)</Label>
          <Input
            type="number"
            step="1"
            min={0}
            dir="ltr"
            disabled={!isAdmin}
            value={sypPerSar}
            onChange={(e) => setSypPerSar(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">حدّث السعر يدويًا حسب السوق</p>
        </div>
      </div>

      {isAdmin && (
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          حفظ العملة
        </Button>
      )}
    </div>
  );
}

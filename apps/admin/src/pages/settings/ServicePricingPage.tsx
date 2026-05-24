import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchServiceConfigAdmin, updateServiceConfig } from "@luffa/shared";
import type { ServiceType } from "@luffa/shared";
import { SERVICE_TYPE_LABELS } from "@luffa/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useCurrency } from "@luffa/shared";

type PricingForm = {
  label_ar: string;
  door_fee_sar: string;
  km_rate_sar: string;
  wait_minute_rate_sar: string;
  min_fare_sar: string;
};

const emptyForm = (): PricingForm => ({
  label_ar: "",
  door_fee_sar: "7",
  km_rate_sar: "2.5",
  wait_minute_rate_sar: "0.5",
  min_fare_sar: "15",
});

export default function ServicePricingPage() {
  const { profile } = useAdminAuth();
  const { symbol, format } = useCurrency();
  const qc = useQueryClient();
  const isAdmin = profile?.role === "admin";
  const [editing, setEditing] = useState<ServiceType | null>(null);
  const [form, setForm] = useState<PricingForm>(emptyForm());

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["service-config"],
    queryFn: fetchServiceConfigAdmin,
  });

  const save = useMutation({
    mutationFn: (serviceType: ServiceType) =>
      updateServiceConfig(serviceType, {
        label_ar: form.label_ar,
        door_fee_sar: Number(form.door_fee_sar),
        km_rate_sar: Number(form.km_rate_sar),
        wait_minute_rate_sar: Number(form.wait_minute_rate_sar),
        min_fare_sar: Number(form.min_fare_sar),
        base_fare_sar: Number(form.min_fare_sar),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-config"] });
      setEditing(null);
      toast.success("تم حفظ أسعار الخدمة");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const startEdit = (serviceType: ServiceType) => {
    const row = services.find((s) => s.service_type === serviceType);
    if (!row) return;
    setEditing(serviceType);
    setForm({
      label_ar: row.label_ar,
      door_fee_sar: String(row.door_fee_sar ?? 7),
      km_rate_sar: String(row.km_rate_sar ?? 2.5),
      wait_minute_rate_sar: String(row.wait_minute_rate_sar ?? 0.5),
      min_fare_sar: String(row.min_fare_sar ?? row.base_fare_sar ?? 15),
    });
  };

  if (isLoading) return <p>جاري التحميل...</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {isAdmin
          ? "فتحة الباب، سعر الكيلومتر، ووقت الانتظار — المبالغ تُخزَّن بالريال السعودي."
          : "عرض فقط — التعديل للمدير."}
      </p>

      <div className="rounded-2xl border overflow-hidden bg-card overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-right p-3 font-semibold">الخدمة</th>
              <th className="text-right p-3 font-semibold">فتحة باب ({symbol})</th>
              <th className="text-right p-3 font-semibold">الكيلو ({symbol}/كم)</th>
              <th className="text-right p-3 font-semibold">الانتظار ({symbol}/دقيقة)</th>
              <th className="text-right p-3 font-semibold">الحد الأدنى ({symbol})</th>
              <th className="text-right p-3 font-semibold">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => {
              const isRowEditing = editing === s.service_type;
              const door = Number(s.door_fee_sar ?? 7);
              const km = Number(s.km_rate_sar ?? 2.5);
              const wait = Number(s.wait_minute_rate_sar ?? 0.5);
              const min = Number(s.min_fare_sar ?? s.base_fare_sar);

              return (
                <tr key={s.service_type} className="border-t border-border align-top">
                  <td className="p-3">
                    {isRowEditing ? (
                      <Input value={form.label_ar} onChange={(e) => setForm((f) => ({ ...f, label_ar: e.target.value }))} />
                    ) : (
                      <div>
                        <p className="font-semibold">{s.label_ar}</p>
                        <p className="text-xs text-muted-foreground">{SERVICE_TYPE_LABELS[s.service_type]}</p>
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    {isRowEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        dir="ltr"
                        value={form.door_fee_sar}
                        onChange={(e) => setForm((f) => ({ ...f, door_fee_sar: e.target.value }))}
                      />
                    ) : (
                      format(door)
                    )}
                  </td>
                  <td className="p-3">
                    {isRowEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        dir="ltr"
                        value={form.km_rate_sar}
                        onChange={(e) => setForm((f) => ({ ...f, km_rate_sar: e.target.value }))}
                      />
                    ) : (
                      format(km)
                    )}
                  </td>
                  <td className="p-3">
                    {isRowEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        dir="ltr"
                        value={form.wait_minute_rate_sar}
                        onChange={(e) => setForm((f) => ({ ...f, wait_minute_rate_sar: e.target.value }))}
                      />
                    ) : (
                      format(wait)
                    )}
                  </td>
                  <td className="p-3">
                    {isRowEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        dir="ltr"
                        value={form.min_fare_sar}
                        onChange={(e) => setForm((f) => ({ ...f, min_fare_sar: e.target.value }))}
                      />
                    ) : (
                      format(min)
                    )}
                  </td>
                  <td className="p-3">
                    {isAdmin &&
                      (isRowEditing ? (
                        <div className="flex flex-col gap-2">
                          <Button size="sm" onClick={() => save.mutate(s.service_type)} disabled={save.isPending}>
                            حفظ
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
                            إلغاء
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => startEdit(s.service_type)}>
                          تعديل
                        </Button>
                      ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground">طريقة الحساب في التطبيق</p>
        <p>الأجرة = فتحة الباب + (المسافة × سعر الكيلو) + (دقائق الانتظار × سعر الدقيقة) + الإضافات</p>
        <p>إذا كان المجموع أقل من الحد الأدنى، يُطبَّق الحد الأدنى.</p>
      </div>
    </div>
  );
}

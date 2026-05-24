import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  assignCaptainToOrder,
  fetchCaptainsAdmin,
  fetchDriversAdmin,
  fetchOrderDetailAdmin,
  notifyProfileAdmin,
  ORDER_STATUS_LABELS,
  updateOrderAdmin,
  updateTimelineStep,
  type OrderStatus,
} from "@luffa/shared";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCurrency } from "@luffa/shared";

const statusVariant: Record<OrderStatus, "default" | "success" | "warning" | "destructive"> = {
  pending: "warning",
  active: "default",
  completed: "success",
  cancelled: "destructive",
};

type Props = {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OrderDetailSheet({ orderId, open, onOpenChange }: Props) {
  const { format } = useCurrency();
  const qc = useQueryClient();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [captainId, setCaptainId] = useState<string>("");
  const [driverId, setDriverId] = useState<string>("");
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyBody, setNotifyBody] = useState("");
  const [notifyTarget, setNotifyTarget] = useState<"rider" | "captain">("rider");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: () => (orderId ? fetchOrderDetailAdmin(orderId) : null),
    enabled: !!orderId && open,
  });

  const { data: captains = [] } = useQuery({
    queryKey: ["admin-captains"],
    queryFn: fetchCaptainsAdmin,
    enabled: open,
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["admin-drivers"],
    queryFn: fetchDriversAdmin,
    enabled: open,
  });

  useEffect(() => {
    if (!data) return;
    setFrom(data.order.from_location);
    setTo(data.order.to_location);
    setStatus(data.order.status);
    setCaptainId(data.order.captain_id ?? "");
    setDriverId(data.order.driver_id ?? "");
  }, [data]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
    qc.invalidateQueries({ queryKey: ["admin-order", orderId] });
  };

  const saveOrder = useMutation({
    mutationFn: () =>
      updateOrderAdmin(orderId!, {
        from_location: from,
        to_location: to,
        status,
        status_label: ORDER_STATUS_LABELS[status],
        captain_id: captainId || null,
        driver_id: driverId || null,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("تم حفظ الطلب");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const assignCaptain = useMutation({
    mutationFn: () => assignCaptainToOrder(orderId!, captainId || null),
    onSuccess: () => {
      invalidate();
      toast.success("تم إسناد الكابتن");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const timelineMutate = useMutation({
    mutationFn: ({ stepId, done, step_time }: { stepId: string; done: boolean; step_time?: string }) =>
      updateTimelineStep(stepId, { done, step_time: step_time ?? null }),
    onSuccess: () => {
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const notifyMutate = useMutation({
    mutationFn: () => {
      const profileId = notifyTarget === "rider" ? data?.order.rider_id : data?.order.captain_id;
      if (!profileId) throw new Error("لا يوجد مستخدم مستهدف");
      return notifyProfileAdmin(profileId, notifyTitle, notifyBody);
    },
    onSuccess: () => {
      toast.success("تم إرسال الإشعار");
      setNotifyTitle("");
      setNotifyBody("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const advanceTimeline = () => {
    const next = data?.timeline.find((s) => !s.done);
    if (next) timelineMutate.mutate({ stepId: next.id, done: true, step_time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }) });
  };

  const order = data?.order;
  const rider = data?.rider;
  const captain = data?.captain;
  const driver = data?.driver;

  function PersonCard({
    title,
    person,
    walletId,
  }: {
    title: string;
    person: typeof rider;
    walletId?: string;
  }) {
    if (!person) return <p className="text-sm text-muted-foreground">غير متوفر</p>;
    return (
      <div className="rounded-xl border border-border p-4 space-y-2">
        <h3 className="font-bold text-sm">{title}</h3>
        <p className="text-sm font-medium">{person.display_name ?? "—"}</p>
        <p className="text-sm font-mono text-muted-foreground" dir="ltr">
          {person.phone ?? "—"}
        </p>
        {person.phone && (
          <div className="flex gap-3">
            <a href={`tel:${person.phone}`} className="text-sm text-primary font-medium">
              اتصال
            </a>
            <a
              href={`https://wa.me/${person.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary font-medium"
            >
              واتساب
            </a>
          </div>
        )}
        {walletId && (
          <Link to={`/wallet?profileId=${walletId}`} className="text-xs text-primary block">
            فتح المحفظة
          </Link>
        )}
      </div>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{order ? order.display_id : "تفاصيل الرحلة"}</SheetTitle>
        </SheetHeader>

        {isLoading && <p className="text-sm text-muted-foreground mt-4">جاري التحميل...</p>}

        {order && (
          <div className="space-y-6 mt-4 pb-12">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusVariant[order.status]}>{order.status_label ?? ORDER_STATUS_LABELS[order.status]}</Badge>
              <span className="text-xs text-muted-foreground">{order.service_label ?? order.service_type}</span>
              {order.payment_method && (
                <span className="text-xs text-muted-foreground">· {order.payment_method}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              أنشئ: {new Date(order.created_at).toLocaleString("ar-SA")} · آخر تحديث:{" "}
              {new Date(order.updated_at).toLocaleString("ar-SA")}
            </p>

            <section className="space-y-3">
              <h3 className="font-bold text-sm">الحالة والمسار</h3>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {ORDER_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>من</Label>
                <Input value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>إلى</Label>
                <Input value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
              <Button onClick={() => saveOrder.mutate()} disabled={saveOrder.isPending}>
                حفظ التعديلات
              </Button>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              <PersonCard title="الراكب" person={rider} walletId={order.rider_id ?? undefined} />
              <PersonCard title="الكابتن" person={captain} walletId={order.captain_id ?? undefined} />
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-sm">إسناد الكابتن والسائق</h3>
              <div className="space-y-2">
                <Label>الكابتن</Label>
                <Select value={captainId || "__none__"} onValueChange={(v) => setCaptainId(v === "__none__" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر كابتنًا" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">غير معيّن</SelectItem>
                    {captains.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.display_name ?? c.phone ?? c.id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="secondary" onClick={() => assignCaptain.mutate()}>
                  إسناد الكابتن
                </Button>
              </div>
              <div className="space-y-2">
                <Label>سجل السائق</Label>
                <Select value={driverId || "__none__"} onValueChange={(v) => setDriverId(v === "__none__" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">بدون</SelectItem>
                    {drivers.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name_ar} — {d.plate ?? "—"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {driver && (
                <p className="text-sm text-muted-foreground">
                  {driver.car_model} · {driver.plate} · تقييم {driver.rating}
                </p>
              )}
            </section>

            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">الخط الزمني</h3>
                <Button size="sm" variant="outline" onClick={advanceTimeline}>
                  الخطوة التالية
                </Button>
              </div>
              <ul className="space-y-2">
                {data.timeline.map((step) => (
                  <li key={step.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                    <input
                      type="checkbox"
                      checked={step.done}
                      onChange={(e) => timelineMutate.mutate({ stepId: step.id, done: e.target.checked, step_time: step.time })}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${step.done ? "text-muted-foreground line-through" : ""}`}>
                        {step.title}
                      </p>
                      <Input
                        className="mt-1 h-8 text-xs"
                        placeholder="الوقت"
                        value={step.time ?? ""}
                        onChange={(e) => timelineMutate.mutate({ stepId: step.id, done: step.done, step_time: e.target.value })}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {data.receipt.length > 0 && (
              <section className="space-y-2">
                <h3 className="font-bold text-sm">الفاتورة</h3>
                <ul className="rounded-xl border border-border divide-y">
                  {data.receipt.map((line, i) => (
                    <li key={i} className="flex justify-between p-3 text-sm">
                      <span>{line.label}</span>
                      <span className="font-mono" dir="ltr">
                        {line.amount}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-bold">
                  الإجمالي: {format(order.total_sar ?? order.price_sar)}
                </p>
              </section>
            )}

            <section className="space-y-2">
              <h3 className="font-bold text-sm">إرسال إشعار</h3>
              <div className="flex gap-2">
                <Button size="sm" variant={notifyTarget === "rider" ? "default" : "outline"} onClick={() => setNotifyTarget("rider")}>
                  للراكب
                </Button>
                <Button
                  size="sm"
                  variant={notifyTarget === "captain" ? "default" : "outline"}
                  onClick={() => setNotifyTarget("captain")}
                  disabled={!order.captain_id}
                >
                  للكابتن
                </Button>
              </div>
              <Input placeholder="العنوان" value={notifyTitle} onChange={(e) => setNotifyTitle(e.target.value)} />
              <Input placeholder="المحتوى" value={notifyBody} onChange={(e) => setNotifyBody(e.target.value)} />
              <Button size="sm" disabled={!notifyTitle || !notifyBody} onClick={() => notifyMutate.mutate()}>
                إرسال
              </Button>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCargoDetailAdmin,
  updateCargoStatus,
  notifyProfileAdmin,
  type CargoStatus,
} from "@luffa/shared";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";

const statusLabels: Record<CargoStatus, string> = {
  pending: "معلق",
  assigned: "معيّن",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const statusVariant: Record<CargoStatus, "default" | "success" | "warning" | "destructive"> = {
  pending: "warning",
  assigned: "default",
  completed: "success",
  cancelled: "destructive",
};

type Props = {
  cargoId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CargoDetailSheet({ cargoId, open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyBody, setNotifyBody] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-cargo-detail", cargoId],
    queryFn: () => (cargoId ? fetchCargoDetailAdmin(cargoId) : null),
    enabled: !!cargoId && open,
  });

  const statusMutate = useMutation({
    mutationFn: (status: CargoStatus) => updateCargoStatus(cargoId!, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-cargo"] });
      qc.invalidateQueries({ queryKey: ["admin-cargo-detail", cargoId] });
      toast.success("تم تحديث الحالة");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const notifyMutate = useMutation({
    mutationFn: () => notifyProfileAdmin(data!.cargo.rider_id!, notifyTitle, notifyBody),
    onSuccess: () => {
      toast.success("تم إرسال الإشعار");
      setNotifyTitle("");
      setNotifyBody("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cargo = data?.cargo;
  const rider = data?.rider;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>تفاصيل طلب بضائع</SheetTitle>
        </SheetHeader>
        {isLoading && <p className="text-sm text-muted-foreground mt-4">جاري التحميل...</p>}
        {cargo && (
          <div className="space-y-6 mt-4 pb-8">
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant[cargo.status]}>{statusLabels[cargo.status]}</Badge>
              <span className="text-xs text-muted-foreground font-mono" dir="ltr">
                {cargo.id.slice(0, 8)}
              </span>
            </div>

            <section className="space-y-2">
              <h3 className="font-bold text-sm">المسار</h3>
              <p className="text-sm">{cargo.from_location ?? "—"} → {cargo.to_location ?? "—"}</p>
              <p className="text-sm text-muted-foreground">{cargo.description ?? "—"}</p>
            </section>

            {rider && (
              <section className="rounded-xl border border-border p-4 space-y-2">
                <h3 className="font-bold text-sm">الراكب</h3>
                <p className="text-sm">{rider.display_name ?? "—"}</p>
                {rider.phone && (
                  <div className="flex gap-2 flex-wrap">
                    <a href={`tel:${rider.phone}`} className="text-sm text-primary font-medium">
                      اتصال
                    </a>
                    <a
                      href={`https://wa.me/${rider.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary font-medium"
                    >
                      واتساب
                    </a>
                  </div>
                )}
                <Link to={`/wallet?profileId=${rider.id}`} className="text-xs text-primary">
                  المحفظة
                </Link>
              </section>
            )}

            <section className="space-y-2">
              <h3 className="font-bold text-sm">تغيير الحالة</h3>
              <div className="flex flex-wrap gap-2">
                {(["pending", "assigned", "completed", "cancelled"] as CargoStatus[]).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={cargo.status === s ? "default" : "outline"}
                    onClick={() => statusMutate.mutate(s)}
                  >
                    {statusLabels[s]}
                  </Button>
                ))}
              </div>
            </section>

            {rider && (
              <section className="space-y-2">
                <h3 className="font-bold text-sm">إشعار للراكب</h3>
                <Label>العنوان</Label>
                <Input value={notifyTitle} onChange={(e) => setNotifyTitle(e.target.value)} />
                <Label>المحتوى</Label>
                <Input value={notifyBody} onChange={(e) => setNotifyBody(e.target.value)} />
                <Button
                  size="sm"
                  disabled={!notifyTitle || !notifyBody}
                  onClick={() => notifyMutate.mutate()}
                >
                  إرسال
                </Button>
              </section>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

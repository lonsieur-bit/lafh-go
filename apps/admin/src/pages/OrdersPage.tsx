import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  fetchAllOrdersAdmin,
  fetchAllProfilesAdmin,
  fetchCargoRequestsAdmin,
  ORDER_STATUS_LABELS,
  SERVICE_TYPE_LABELS,
  type OrderStatus,
  type ServiceType,
} from "@luffa/shared";
import type { Database } from "@luffa/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCurrency } from "@luffa/shared";
import { OrderDetailSheet } from "@/components/OrderDetailSheet";
import { CargoDetailSheet } from "@/components/CargoDetailSheet";
import { AdminAccessGate } from "@/components/AdminAccessGate";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type KindTab = "all" | "rides" | "cargo";

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive"> = {
  pending: "warning",
  active: "default",
  completed: "success",
  cancelled: "destructive",
  assigned: "default",
};

const cargoStatusLabels: Record<string, string> = {
  pending: "معلق",
  assigned: "معيّن",
  completed: "مكتمل",
  cancelled: "ملغي",
};

type UnifiedRow =
  | { kind: "ride"; id: string; displayId: string; service: string; from: string; to: string; status: string; statusLabel: string; amount: string; riderName: string; captainName: string; serviceType?: ServiceType; orderStatus?: OrderStatus }
  | { kind: "cargo"; id: string; displayId: string; service: string; from: string; to: string; status: string; statusLabel: string; amount: string; riderName: string; captainName: string };

export default function OrdersPage() {
  const { format } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const kindTab = (searchParams.get("tab") as KindTab) || "all";
  const statusFilter = searchParams.get("status") ?? "";
  const serviceFilter = searchParams.get("service") as ServiceType | "" | null;
  const selectedRideId = searchParams.get("orderId");
  const selectedCargoId = searchParams.get("cargoId");

  const [rideSheetOpen, setRideSheetOpen] = useState(!!selectedRideId);
  const [cargoSheetOpen, setCargoSheetOpen] = useState(!!selectedCargoId);

  useEffect(() => {
    if (selectedRideId) setRideSheetOpen(true);
  }, [selectedRideId]);

  useEffect(() => {
    if (selectedCargoId) setCargoSheetOpen(true);
  }, [selectedCargoId]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "rides" || tab === "cargo") return;
    if (searchParams.get("status") === "active" || searchParams.get("status") === "completed") {
      const next = new URLSearchParams(searchParams);
      if (!next.get("tab")) next.set("tab", "rides");
      setSearchParams(next, { replace: true });
    }
  }, []);

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: fetchAllOrdersAdmin,
  });
  const { data: cargo = [], isLoading: cargoLoading } = useQuery({
    queryKey: ["admin-cargo"],
    queryFn: fetchCargoRequestsAdmin,
  });
  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAllProfilesAdmin,
  });

  const profileMap = useMemo(() => new Map(profiles.map((p) => [p.id, p.display_name ?? p.phone ?? "—"])), [profiles]);

  const rideRows: UnifiedRow[] = useMemo(
    () =>
      orders.map((o: OrderRow) => ({
        kind: "ride" as const,
        id: o.id,
        displayId: o.display_id,
        service: o.service_label ?? SERVICE_TYPE_LABELS[o.service_type] ?? o.service_type,
        from: o.from_location,
        to: o.to_location,
        status: o.status,
        statusLabel: o.status_label ?? ORDER_STATUS_LABELS[o.status],
        amount: format(o.total_sar ?? o.price_sar ?? 0),
        riderName: o.rider_id ? (profileMap.get(o.rider_id) ?? "—") : "—",
        captainName: o.captain_id ? (profileMap.get(o.captain_id) ?? "—") : "—",
        serviceType: o.service_type,
        orderStatus: o.status,
      })),
    [orders, profileMap, format],
  );

  const cargoRows: UnifiedRow[] = useMemo(
    () =>
      cargo.map((c) => ({
        kind: "cargo" as const,
        id: c.id,
        displayId: c.id.slice(0, 8),
        service: "بضائع",
        from: c.from_location ?? "—",
        to: c.to_location ?? "—",
        status: c.status,
        statusLabel: cargoStatusLabels[c.status] ?? c.status,
        amount: "—",
        riderName: c.rider_id ? (profileMap.get(c.rider_id) ?? "—") : "—",
        captainName: "—",
      })),
    [cargo, profileMap],
  );

  const merged = useMemo(() => {
    let rows: UnifiedRow[] = [];
    if (kindTab === "rides") rows = rideRows;
    else if (kindTab === "cargo") rows = cargoRows;
    else rows = [...rideRows, ...cargoRows].sort((a, b) => b.id.localeCompare(a.id));

    if (statusFilter) {
      rows = rows.filter((r) => r.status === statusFilter);
    }
    if (serviceFilter && kindTab !== "cargo") {
      rows = rows.filter((r) => r.kind === "cargo" || r.serviceType === serviceFilter);
    }
    return rows;
  }, [kindTab, rideRows, cargoRows, statusFilter, serviceFilter]);

  const setTab = (tab: KindTab) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    if (tab === "cargo") next.delete("service");
    setSearchParams(next);
  };

  const setService = (service: ServiceType | "") => {
    const next = new URLSearchParams(searchParams);
    if (service) next.set("service", service);
    else next.delete("service");
    setSearchParams(next);
  };

  const setStatus = (status: string) => {
    const next = new URLSearchParams(searchParams);
    if (status) next.set("status", status);
    else next.delete("status");
    setSearchParams(next);
  };

  const openRide = (id: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("orderId", id);
    next.delete("cargoId");
    setSearchParams(next);
    setRideSheetOpen(true);
  };

  const openCargo = (id: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("cargoId", id);
    next.delete("orderId");
    setSearchParams(next);
    setCargoSheetOpen(true);
  };

  const closeRideSheet = (open: boolean) => {
    setRideSheetOpen(open);
    if (!open) {
      const next = new URLSearchParams(searchParams);
      next.delete("orderId");
      setSearchParams(next);
    }
  };

  const closeCargoSheet = (open: boolean) => {
    setCargoSheetOpen(open);
    if (!open) {
      const next = new URLSearchParams(searchParams);
      next.delete("cargoId");
      setSearchParams(next);
    }
  };

  const isLoading = ordersLoading || cargoLoading;
  const serviceTypes = Object.keys(SERVICE_TYPE_LABELS) as ServiceType[];

  return (
    <AdminAccessGate perm="trips">
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-extrabold">الطلبات</h2>
        <p className="text-sm text-muted-foreground">إدارة الرحلات وطلبات البضائع في مكان واحد</p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">نوع الطلبية</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "الكل"],
                  ["rides", "رحلات"],
                  ["cargo", "بضائع"],
                ] as const
              ).map(([key, label]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={kindTab === key ? "default" : "outline"}
                  onClick={() => setTab(key)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {kindTab !== "cargo" && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">نوع التوصيل</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={!serviceFilter ? "default" : "outline"} onClick={() => setService("")}>
                  الكل
                </Button>
                {serviceTypes.map((st) => (
                  <Button
                    key={st}
                    size="sm"
                    variant={serviceFilter === st ? "default" : "outline"}
                    onClick={() => setService(st)}
                  >
                    {SERVICE_TYPE_LABELS[st]}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">الحالة</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={!statusFilter ? "default" : "outline"} onClick={() => setStatus("")}>
                الكل
              </Button>
              {kindTab !== "cargo" &&
                (Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
                  <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatus(s)}>
                    {ORDER_STATUS_LABELS[s]}
                  </Button>
                ))}
              {kindTab !== "rides" &&
                Object.entries(cargoStatusLabels).map(([s, label]) => (
                  <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"} onClick={() => setStatus(s)}>
                    {label}
                  </Button>
                ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="p-6 text-center text-muted-foreground">جاري التحميل...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-right p-3 font-semibold">النوع</th>
                  <th className="text-right p-3 font-semibold">رقم الطلب</th>
                  <th className="text-right p-3 font-semibold">الخدمة</th>
                  <th className="text-right p-3 font-semibold">من — إلى</th>
                  <th className="text-right p-3 font-semibold">الحالة</th>
                  <th className="text-right p-3 font-semibold">المبلغ</th>
                  <th className="text-right p-3 font-semibold">الراكب</th>
                  <th className="text-right p-3 font-semibold">الكابتن</th>
                  <th className="text-right p-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {merged.map((row) => (
                  <tr
                    key={`${row.kind}-${row.id}`}
                    className={cn("border-t border-border hover:bg-muted/30 cursor-pointer")}
                    onClick={() => (row.kind === "ride" ? openRide(row.id) : openCargo(row.id))}
                  >
                    <td className="p-3">
                      <Badge variant="secondary">{row.kind === "ride" ? "رحلة" : "بضائع"}</Badge>
                    </td>
                    <td className="p-3 font-mono" dir="ltr">
                      {row.displayId}
                    </td>
                    <td className="p-3">{row.service}</td>
                    <td className="p-3 max-w-[200px] truncate">
                      {row.from} → {row.to}
                    </td>
                    <td className="p-3">
                      <Badge variant={statusVariant[row.status] ?? "secondary"}>{row.statusLabel}</Badge>
                    </td>
                    <td className="p-3">{row.amount}</td>
                    <td className="p-3">{row.riderName}</td>
                    <td className="p-3">{row.captainName}</td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          row.kind === "ride" ? openRide(row.id) : openCargo(row.id);
                        }}
                      >
                        تفاصيل
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {merged.length === 0 && (
              <p className="p-6 text-center text-muted-foreground">لا توجد طلبات</p>
            )}
          </div>
        )}
      </div>

      <OrderDetailSheet
        orderId={selectedRideId}
        open={rideSheetOpen && !!selectedRideId}
        onOpenChange={closeRideSheet}
      />
      <CargoDetailSheet
        cargoId={selectedCargoId}
        open={cargoSheetOpen && !!selectedCargoId}
        onOpenChange={closeCargoSheet}
      />
    </div>
    </AdminAccessGate>
  );
}

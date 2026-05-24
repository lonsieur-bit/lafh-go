import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getSupabase, isSupabaseReady } from "@luffa/shared";
import { StatCard } from "@/components/StatCard";
import { DashboardQuickNav } from "@/components/DashboardQuickNav";

async function fetchStats() {
  if (!isSupabaseReady()) return null;
  const sb = getSupabase();
  const [orders, profiles, cards, cargo] = await Promise.all([
    sb.from("orders").select("status", { count: "exact" }),
    sb.from("profiles").select("id", { count: "exact" }),
    sb.from("recharge_cards").select("status").eq("status", "new"),
    sb.from("cargo_requests").select("id", { count: "exact" }).eq("status", "pending"),
  ]);
  const orderRows = await sb.from("orders").select("status");
  const active = (orderRows.data ?? []).filter((o) => o.status === "active").length;
  const completed = (orderRows.data ?? []).filter((o) => o.status === "completed").length;
  return {
    totalOrders: orders.count ?? 0,
    activeTrips: active,
    completedTrips: completed,
    users: profiles.count ?? 0,
    unusedCards: cards.data?.length ?? 0,
    pendingCargo: cargo.count ?? 0,
  };
}

function StatLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="block transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
      {children}
    </Link>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: fetchStats });

  if (isLoading) return <p className="text-muted-foreground">جاري التحميل...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold">نظرة عامة</h2>
        <p className="text-sm text-muted-foreground">ملخص تشغيل المنصة والوصول السريع</p>
      </div>

      <DashboardQuickNav />

      <div>
        <h3 className="text-lg font-bold mb-3">إحصائيات اليوم</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatLink to="/orders?tab=rides&status=active">
          <StatCard title="رحلات نشطة" value={data?.activeTrips ?? 0} />
        </StatLink>
        <StatLink to="/orders?tab=rides&status=completed">
          <StatCard title="رحلات مكتملة" value={data?.completedTrips ?? 0} />
        </StatLink>
        <StatLink to="/orders?tab=rides">
          <StatCard title="إجمالي الرحلات" value={data?.totalOrders ?? 0} />
        </StatLink>
        <StatLink to="/users">
          <StatCard title="المستخدمون" value={data?.users ?? 0} />
        </StatLink>
        <StatLink to="/recharge-cards">
          <StatCard title="كروت شحن غير مستخدمة" value={data?.unusedCards ?? 0} />
        </StatLink>
        <StatLink to="/orders?tab=cargo&status=pending">
          <StatCard title="طلبات بضائع معلقة" value={data?.pendingCargo ?? 0} />
        </StatLink>
        </div>
      </div>
    </div>
  );
}

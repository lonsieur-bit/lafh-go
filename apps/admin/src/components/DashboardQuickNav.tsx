import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { adminNavItems } from "@/config/adminNav";
import { useAdminAuth } from "@/context/AdminAuthContext";

export function DashboardQuickNav() {
  const { canAccess } = useAdminAuth();
  const items = adminNavItems.filter((item) => canAccess(item.perm));

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-lg font-bold">الوصول السريع</h3>
        <p className="text-sm text-muted-foreground">انتقل مباشرة إلى أي قسم من لوحة التحكم</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <span className="text-sm font-bold leading-tight">{item.label}</span>
              <span className="text-[11px] text-muted-foreground leading-snug line-clamp-2 hidden sm:block">
                {item.description}
              </span>
              <ChevronLeft
                className="h-3.5 w-3.5 text-muted-foreground/50 rotate-180 group-hover:text-primary sm:hidden"
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

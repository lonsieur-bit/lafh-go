import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { settingsNavItems } from "@/config/settingsNav";
import { cn } from "@/lib/utils";
import { AdminAccessGate } from "@/components/AdminAccessGate";

export default function SettingsLayout() {
  const { pathname } = useLocation();
  const onHub = pathname === "/settings" || pathname === "/settings/";

  return (
    <AdminAccessGate perm="all">
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold">الإعدادات</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {onHub ? "اختر قسمًا للتعديل" : "إدارة إعدادات المنصة"}
          </p>
        </div>
        {!onHub && (
          <Link
            to="/settings"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <ChevronLeft className="h-4 w-4" />
            العودة لقائمة الإعدادات
          </Link>
        )}
      </div>

      <nav className="flex flex-wrap gap-2" aria-label="أقسام الإعدادات">
        {settingsNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <Outlet />
    </div>
    </AdminAccessGate>
  );
}

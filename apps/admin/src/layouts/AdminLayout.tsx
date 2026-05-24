import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminSidebarNavItems } from "@/config/adminNav";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
  const { profile, signOut, canAccess } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground border-l border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <p className="text-lg font-extrabold text-sidebar-primary-foreground">لفة</p>
          <p className="text-xs text-sidebar-foreground/70 mt-1">لوحة التحكم</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {adminSidebarNavItems.map((item) => {
            if (!canAccess(item.perm)) return null;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/60 truncate">{profile?.display_name ?? profile?.id}</p>
          <Button variant="ghost" size="sm" className="w-full mt-2 justify-start gap-2 text-sidebar-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
          <h1 className="text-sm font-semibold text-muted-foreground">مركز إدارة التشغيل</h1>
          <Link to="/" className="text-sm text-primary font-semibold">
            العودة للرئيسية
          </Link>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAppState } from "@/context/AppStateContext";
import { Button } from "@/components/ui/button";

const NotificationsPage = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppState();
  const today = notifications.filter((n) => n.group === "today");
  const earlier = notifications.filter((n) => n.group === "earlier");

  return (
    <div className="h-full bg-background flex flex-col min-h-0" dir="rtl">
      <div className="pt-12 px-5 pb-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link to="/app" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center" aria-label="عودة">
              <ArrowRight className="w-4 h-4 text-foreground" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-foreground font-arabic">الإشعارات</h1>
              <p className="text-xs text-muted-foreground font-arabic mt-1">آخر التحديثات والعروض</p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-lg font-arabic"
            onClick={markAllNotificationsRead}
          >
            تعليم الكل كمقروء
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 min-h-0">
        {today.length > 0 && (
          <section>
            <p className="text-xs font-semibold text-muted-foreground font-arabic mb-2">اليوم</p>
            <div className="space-y-2">
              {today.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`rounded-xl p-4 shadow-elevated border ${
                    n.read ? "bg-card border-border" : "bg-primary/5 border-primary/20"
                  } cursor-pointer`}
                >
                  <div className="flex justify-between gap-2 items-start">
                    <p className="text-sm font-semibold text-foreground font-arabic">{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-muted-foreground font-arabic mt-1 leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-muted-foreground mt-2 font-arabic">{n.time}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {earlier.length > 0 && (
          <section>
            <p className="text-xs font-semibold text-muted-foreground font-arabic mb-2">سابقاً</p>
            <div className="space-y-2">
              {earlier.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className="rounded-xl p-4 bg-card shadow-elevated border border-border"
                >
                  <p className="text-sm font-semibold text-foreground font-arabic">{n.title}</p>
                  <p className="text-xs text-muted-foreground font-arabic mt-1 leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-muted-foreground mt-2 font-arabic">{n.time}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

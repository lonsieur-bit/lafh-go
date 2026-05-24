import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  Phone,
  MessageCircle,
  Headphones,
  Share2,
  Star,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/context/AppStateContext";

const OrderDetailsPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, advanceOrderStep } = useAppState();
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 pt-16" dir="rtl">
        <p className="text-sm text-muted-foreground font-arabic text-center mb-4">الطلب غير موجود</p>
        <Button asChild variant="default" className="font-arabic">
          <Link to="/app/orders">العودة للطلبات</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full bg-background flex flex-col min-h-0" dir="rtl">
      <div className="pt-12 px-5 pb-3 bg-card border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <Link
            to="/app/orders"
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
            aria-label="رجوع"
          >
            <ArrowRight className="w-4 h-4 text-foreground" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-arabic">{order.serviceLabel}</p>
            <h1 className="text-base font-bold text-foreground font-mono truncate">{order.displayId}</h1>
          </div>
          <span
            className={`text-[10px] font-semibold px-2 py-1 rounded-full font-arabic shrink-0 ${
              order.status === "completed"
                ? "bg-success/10 text-success"
                : order.status === "cancelled"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-warning/10 text-warning"
            }`}
          >
            {order.statusLabel}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4 space-y-4 pb-6">
        {/* Map */}
        <div className="rounded-2xl overflow-hidden h-40 bg-secondary relative map-pattern">
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent z-10" />
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <MapPin className="w-10 h-10 text-primary" />
          </div>
          <div className="absolute bottom-3 right-3 left-3 z-20 flex flex-col gap-1">
            <div className="bg-card/95 rounded-lg px-3 py-2 shadow-elevated text-xs font-arabic">
              <span className="text-muted-foreground">من </span>
              {order.from}
            </div>
            <div className="bg-card/95 rounded-lg px-3 py-2 shadow-elevated text-xs font-arabic">
              <span className="text-muted-foreground">إلى </span>
              {order.to}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-card rounded-2xl p-4 shadow-elevated">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground font-arabic">مسار الطلب</h2>
            {order.status === "active" && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="rounded-lg font-arabic"
                onClick={() => advanceOrderStep(order.id)}
              >
                تحديث الحالة
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {order.timeline.map((step, idx) => (
              <div key={step.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${step.done ? "bg-primary" : "bg-muted"}`}
                  />
                  {idx < order.timeline.length - 1 && (
                    <div className="w-px flex-1 min-h-[12px] bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-sm font-medium text-foreground font-arabic">{step.title}</p>
                  {step.time && (
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{step.time}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {order.status === "active" && (
            <p className="text-[11px] text-muted-foreground font-arabic mt-3">
              كل ضغطة على "تحديث الحالة" تنقل الطلب للخطوة التالية (مثل تتبع أوبر).
            </p>
          )}
        </div>

        {/* Driver */}
        <div className="bg-card rounded-2xl p-4 shadow-elevated">
          <h2 className="text-sm font-semibold text-foreground mb-3 font-arabic">السائق</h2>
          <div className="flex items-center gap-3">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold ${order.driver.avatarColor}`}
            >
              {order.driver.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground font-arabic truncate">
                {order.driver.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <Star className="w-3.5 h-3.5 text-warning fill-warning shrink-0" />
                <span className="text-xs text-muted-foreground">
                  {order.driver.rating} · {order.driver.trips}+ رحلة
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-arabic mt-1">
                {order.driver.carModel} ·{" "}
                <span className="font-mono" dir="ltr">
                  {order.driver.plate}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
                aria-label="اتصال"
              >
                <Phone className="w-4 h-4 text-foreground" />
              </button>
              <Link
                to="/app/chat"
                className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-glow"
                aria-label="محادثة"
              >
                <MessageCircle className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Receipt */}
        <div className="bg-card rounded-2xl p-4 shadow-elevated">
          <h2 className="text-sm font-semibold text-foreground mb-3 font-arabic">تفاصيل الفاتورة</h2>
          <div className="space-y-2">
            {order.receipt.map((line) => (
              <div key={line.label} className="flex justify-between text-xs">
                <span className="text-muted-foreground font-arabic">{line.label}</span>
                <span className="font-mono text-foreground">{line.amount}</span>
              </div>
            ))}
            {order.discount && (
              <div className="flex justify-between text-xs text-success">
                <span className="font-arabic">خصم</span>
                <span className="font-mono">{order.discount}</span>
              </div>
            )}
            <div className="border-t border-border pt-3 mt-2 flex justify-between items-center">
              <span className="text-sm font-semibold text-foreground font-arabic">الإجمالي</span>
              <span className="text-lg font-bold text-primary font-arabic">{order.total}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" className="font-arabic rounded-xl" type="button">
            <Car className="w-4 h-4 ml-2" />
            إعادة الطلب
          </Button>
          <Button variant="outline" className="font-arabic rounded-xl border-border" type="button">
            <Share2 className="w-4 h-4 ml-2" />
            مشاركة الإيصال
          </Button>
          <Button variant="outline" className="font-arabic rounded-xl border-border col-span-2 p-0 h-auto" asChild>
            <Link to="/app/chat" className="flex items-center justify-center gap-2 py-2.5 px-4">
              <Headphones className="w-4 h-4" />
              الدعم والمساعدة
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;

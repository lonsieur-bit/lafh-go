import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Star, Filter } from "lucide-react";
import { useAppState } from "@/context/AppStateContext";
import type { Order } from "@/lib/types";

const statusClass = (o: Order) => {
  if (o.status === "completed") return "bg-success/10 text-success";
  if (o.status === "cancelled") return "bg-destructive/10 text-destructive";
  return "bg-warning/10 text-warning";
};

const OrdersPage = () => (
  <OrdersContent />
);

const OrdersContent = () => {
  const { orders } = useAppState();
  return (
  <div className="h-full bg-background flex flex-col min-h-0" dir="rtl">
    <div className="pt-12 px-5 pb-3 bg-card border-b border-border flex-shrink-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link to="/app" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center" aria-label="عودة">
            <ArrowRight className="w-4 h-4 text-foreground" />
          </Link>
          <h1 className="text-lg font-bold text-foreground font-arabic">طلباتي</h1>
        </div>
        <button
          type="button"
          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
          aria-label="تصفية"
        >
          <Filter className="w-4 h-4 text-foreground" />
        </button>
      </div>
      <div className="flex gap-2">
        {["الكل", "مكتمل", "جاري", "ملغي"].map((tab, i) => (
          <button
            key={tab}
            type="button"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-arabic ${
              i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>

    <div className="flex-1 overflow-auto px-5 py-4 space-y-3 min-h-0">
      {orders.map((order, i) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Link
            to={`/app/orders/${order.id}`}
            className="block bg-card rounded-2xl p-4 shadow-elevated active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">{order.displayId}</span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full font-arabic ${statusClass(order)}`}
                >
                  {order.statusLabel}
                </span>
              </div>
              <span className="text-sm font-bold text-primary">{order.price}</span>
            </div>
            <div className="space-y-1.5 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-xs text-foreground font-arabic">{order.from}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                <span className="text-xs text-foreground font-arabic">{order.to}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">
                  {order.date} — {order.time}
                </span>
              </div>
              {order.status === "active" ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-warning/10 text-warning font-arabic">
                  تتبع مباشر
                </span>
              ) : order.rating > 0 ? (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-warning fill-warning" />
                  <span className="text-xs text-muted-foreground">{order.rating}</span>
                </div>
              ) : null}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  </div>
);
};

export default OrdersPage;

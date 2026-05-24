import { motion } from "framer-motion";
import { Star, Clock, Car, Filter, ArrowRight, ChevronDown, MapPin } from "lucide-react";

const orders = [
  { id: "#LF-2847", from: "حي الياسمين", to: "مطار الملك خالد", date: "2024/03/15", time: "14:30", price: "45 ر.س", status: "مكتمل", statusColor: "bg-success/10 text-success", rating: 4.8 },
  { id: "#LF-2831", from: "جامعة الملك سعود", to: "العليا مول", date: "2024/03/14", time: "10:15", price: "22 ر.س", status: "مكتمل", statusColor: "bg-success/10 text-success", rating: 5.0 },
  { id: "#LF-2820", from: "حي النخيل", to: "حي الملقا", date: "2024/03/13", time: "18:00", price: "18 ر.س", status: "ملغي", statusColor: "bg-destructive/10 text-destructive", rating: 0 },
  { id: "#LF-2815", from: "طريق الملك فهد", to: "البوليفارد", date: "2024/03/12", time: "20:45", price: "35 ر.س", status: "مكتمل", statusColor: "bg-success/10 text-success", rating: 4.5 },
  { id: "#LF-2801", from: "حي الورود", to: "مستشفى الملك فيصل", date: "2024/03/11", time: "09:00", price: "28 ر.س", status: "مكتمل", statusColor: "bg-success/10 text-success", rating: 4.9 },
];

const OrdersHistoryScreen = () => (
  <div className="h-full bg-background flex flex-col" dir="rtl">
    {/* Header */}
    <div className="pt-12 px-5 pb-3 bg-card border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-bold text-foreground font-arabic">طلباتي</h1>
        <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <Filter className="w-4 h-4 text-foreground" />
        </button>
      </div>
      {/* Tabs */}
      <div className="flex gap-2">
        {["الكل", "مكتمل", "جاري", "ملغي"].map((tab, i) => (
          <button key={i} className={`px-3 py-1.5 rounded-lg text-xs font-medium font-arabic ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
            {tab}
          </button>
        ))}
      </div>
    </div>

    {/* Orders list */}
    <div className="flex-1 overflow-auto px-5 py-4 space-y-3">
      {orders.map((order, i) => (
        <motion.div
          key={i}
          className="bg-card rounded-2xl p-4 shadow-elevated"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">{order.id}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full font-arabic ${order.statusColor}`}>{order.status}</span>
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
              <span className="text-[10px] text-muted-foreground">{order.date} — {order.time}</span>
            </div>
            {order.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-warning fill-warning" />
                <span className="text-xs text-muted-foreground">{order.rating}</span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>

    {/* Bottom nav */}
    <div className="bg-card border-t border-border px-5 py-2 flex items-center justify-around">
      {[
        { icon: "🏠", label: "الرئيسية", active: false },
        { icon: "📋", label: "طلباتي", active: true },
        { icon: "💬", label: "الدردشة", active: false },
        { icon: "👤", label: "حسابي", active: false },
      ].map((item, i) => (
        <button key={i} className="flex flex-col items-center gap-0.5 py-1">
          <span className="text-lg">{item.icon}</span>
          <span className={`text-[10px] font-arabic ${item.active ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{item.label}</span>
        </button>
      ))}
    </div>
  </div>
);

export default OrdersHistoryScreen;

import { motion } from "framer-motion";
import { Power, TrendingUp, MapPin, Clock, Star, ChevronLeft, Navigation, DollarSign } from "lucide-react";
import driverAvatar from "@/assets/driver-avatar.jpg";

const DriverDashboardScreen = () => (
  <div className="h-full bg-background flex flex-col" dir="rtl">
    {/* Header */}
    <div className="pt-12 px-5 pb-4 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={driverAvatar} alt="سائق" className="w-11 h-11 rounded-full object-cover border-2 border-primary" />
          <div>
            <p className="text-base font-semibold text-foreground font-arabic">أحمد محمد</p>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-warning fill-warning" />
              <span className="text-xs text-muted-foreground">4.92</span>
              <span className="text-xs text-muted-foreground font-arabic">• 342 رحلة</span>
            </div>
          </div>
        </div>
        {/* Online toggle */}
        <motion.button
          className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full"
          whileTap={{ scale: 0.95 }}
        >
          <Power className="w-4 h-4" />
          <span className="text-sm font-semibold font-arabic">متصل</span>
        </motion.button>
      </div>
    </div>

    {/* Earnings summary */}
    <div className="px-5 py-4">
      <div className="bg-card rounded-2xl p-5 shadow-elevated">
        <p className="text-sm text-muted-foreground font-arabic mb-1">أرباح اليوم</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">287</span>
          <span className="text-sm text-muted-foreground font-arabic">ر.س</span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: "الرحلات", value: "8", icon: Navigation },
            { label: "الساعات", value: "5.2", icon: Clock },
            { label: "التقييم", value: "4.9", icon: Star },
          ].map((stat, i) => (
            <div key={i} className="text-center bg-secondary rounded-xl py-3">
              <stat.icon className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-arabic">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Weekly chart placeholder */}
    <div className="px-5 mb-4">
      <div className="bg-card rounded-2xl p-4 shadow-elevated">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground font-arabic">الأرباح الأسبوعية</p>
          <TrendingUp className="w-4 h-4 text-success" />
        </div>
        <div className="flex items-end justify-between gap-2 h-20">
          {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-t-md ${i === 5 ? 'bg-primary' : 'bg-secondary'}`}
                style={{ height: `${h}%` }}
              />
              <span className="text-[9px] text-muted-foreground">
                {["سب", "أح", "إث", "ثل", "أر", "خم", "جم"][i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Trip request card */}
    <div className="px-5 mb-4">
      <motion.div
        className="bg-card rounded-2xl p-4 shadow-elevated border-2 border-primary/30"
        animate={{ borderColor: ["hsl(28,92%,52%,0.3)", "hsl(28,92%,52%,0.6)", "hsl(28,92%,52%,0.3)"] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full font-arabic">طلب جديد!</span>
          <span className="text-sm font-bold text-foreground">32 ر.س</span>
        </div>
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-sm text-foreground font-arabic">حي الياسمين</span>
            <span className="text-xs text-muted-foreground font-arabic mr-auto">2.1 كم</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-sm text-foreground font-arabic">مركز غرناطة</span>
            <span className="text-xs text-muted-foreground font-arabic mr-auto">~12 دقيقة</span>
          </div>
        </div>
        <div className="flex gap-3">
          <motion.button
            className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold font-arabic"
            whileTap={{ scale: 0.97 }}
          >
            قبول
          </motion.button>
          <motion.button
            className="flex-1 bg-secondary text-secondary-foreground py-2.5 rounded-xl text-sm font-semibold font-arabic"
            whileTap={{ scale: 0.97 }}
          >
            رفض
          </motion.button>
        </div>
      </motion.div>
    </div>

    {/* Bottom nav */}
    <div className="mt-auto bg-card border-t border-border px-5 py-2 flex items-center justify-around">
      {[
        { icon: "🏠", label: "الرئيسية", active: true },
        { icon: "🗺️", label: "الخريطة", active: false },
        { icon: "📊", label: "الأرباح", active: false },
        { icon: "👤", label: "حسابي", active: false },
      ].map((item, i) => (
        <button key={i} className="flex flex-col items-center gap-0.5 py-1">
          <span className="text-lg">{item.icon}</span>
          <span className={`text-[10px] font-arabic ${item.active ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  </div>
);

export default DriverDashboardScreen;

import { motion } from "framer-motion";
import { User, Bell, Shield, Globe, Moon, CreditCard, HelpCircle, LogOut, ChevronLeft, Camera, Star, MapPin, Wallet } from "lucide-react";

const SettingsScreen = () => (
  <div className="h-full bg-background flex flex-col" dir="rtl">
    {/* Header */}
    <div className="pt-12 px-5 pb-5 bg-card">
      <h1 className="text-lg font-bold text-foreground font-arabic mb-4">حسابي</h1>
      {/* Profile card */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl border-2 border-primary">
            👤
          </div>
          <button className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Camera className="w-3 h-3 text-primary-foreground" />
          </button>
        </div>
        <div>
          <p className="text-base font-semibold text-foreground font-arabic">أحمد العنزي</p>
          <p className="text-xs text-muted-foreground">+966 5XX XXX XXX</p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 text-warning fill-warning" />
            <span className="text-xs text-muted-foreground font-arabic">4.8 — 23 رحلة</span>
          </div>
        </div>
      </div>
    </div>

    <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
      {/* Wallet */}
      <div className="bg-gradient-to-l from-primary to-primary/80 rounded-2xl p-4 text-primary-foreground flex items-center gap-3">
        <Wallet className="w-8 h-8" />
        <div className="flex-1">
          <p className="text-xs text-primary-foreground/70 font-arabic">رصيد المحفظة</p>
          <p className="text-xl font-bold">120.00 ر.س</p>
        </div>
        <button className="bg-primary-foreground/20 px-3 py-1.5 rounded-lg text-xs font-semibold font-arabic">شحن</button>
      </div>

      {/* Settings sections */}
      {[
        {
          title: "الحساب",
          items: [
            { icon: User, label: "تعديل الملف الشخصي" },
            { icon: MapPin, label: "العناوين المحفوظة" },
            { icon: CreditCard, label: "طرق الدفع" },
          ]
        },
        {
          title: "التفضيلات",
          items: [
            { icon: Bell, label: "الإشعارات" },
            { icon: Globe, label: "اللغة", sub: "العربية" },
            { icon: Moon, label: "المظهر", sub: "فاتح" },
          ]
        },
        {
          title: "الدعم",
          items: [
            { icon: Shield, label: "الأمان والخصوصية" },
            { icon: HelpCircle, label: "المساعدة والدعم" },
          ]
        },
      ].map((section, si) => (
        <div key={si}>
          <p className="text-xs text-muted-foreground font-arabic mb-2">{section.title}</p>
          <div className="bg-card rounded-2xl shadow-elevated overflow-hidden">
            {section.items.map((item, ii) => (
              <button key={ii} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0">
                <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="flex-1 text-sm text-foreground font-arabic text-right">{item.label}</span>
                {'sub' in item && <span className="text-xs text-muted-foreground font-arabic">{item.sub}</span>}
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Logout */}
      <motion.button whileTap={{ scale: 0.98 }} className="w-full bg-destructive/10 text-destructive py-3 rounded-xl text-sm font-semibold font-arabic flex items-center justify-center gap-2">
        <LogOut className="w-4 h-4" />
        <span>تسجيل الخروج</span>
      </motion.button>

      <p className="text-center text-[10px] text-muted-foreground font-arabic">لفة للنقل الموجه — الإصدار 1.0.0</p>
    </div>

    {/* Bottom nav */}
    <div className="bg-card border-t border-border px-5 py-2 flex items-center justify-around">
      {[
        { icon: "🏠", label: "الرئيسية", active: false },
        { icon: "📋", label: "طلباتي", active: false },
        { icon: "💬", label: "الدردشة", active: false },
        { icon: "👤", label: "حسابي", active: true },
      ].map((item, i) => (
        <button key={i} className="flex flex-col items-center gap-0.5 py-1">
          <span className="text-lg">{item.icon}</span>
          <span className={`text-[10px] font-arabic ${item.active ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{item.label}</span>
        </button>
      ))}
    </div>
  </div>
);

export default SettingsScreen;

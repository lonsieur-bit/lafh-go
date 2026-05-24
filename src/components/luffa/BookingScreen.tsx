import { motion } from "framer-motion";
import { MapPin, Clock, Car, ChevronDown, Calendar, CreditCard, Plus, Minus } from "lucide-react";

const BookingScreen = () => (
  <div className="h-full bg-background flex flex-col" dir="rtl">
    {/* Header */}
    <div className="pt-12 px-5 pb-3 bg-card border-b border-border">
      <div className="flex items-center gap-3 mb-1">
        <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <span className="text-foreground text-sm">✕</span>
        </button>
        <h1 className="text-lg font-bold text-foreground font-arabic">حجز رحلة</h1>
      </div>
    </div>

    <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
      {/* Route */}
      <div className="bg-card rounded-2xl p-4 shadow-elevated">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-success border-2 border-success/30" />
              <div className="w-0.5 h-8 bg-border" />
              <div className="w-3 h-3 rounded-full bg-destructive border-2 border-destructive/30" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground font-arabic">من</p>
                <p className="text-sm font-medium text-foreground font-arabic">حي الياسمين، الرياض</p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground font-arabic">إلى</p>
                <p className="text-sm font-medium text-foreground font-arabic">مطار الملك خالد الدولي</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service type */}
      <div className="bg-card rounded-2xl p-4 shadow-elevated">
        <p className="text-xs text-muted-foreground font-arabic mb-3">نوع الخدمة</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: "🚗", label: "عادي", price: "25 ر.س", active: false },
            { icon: "✨", label: "مميز", price: "45 ر.س", active: true },
            { icon: "🚐", label: "عائلي", price: "55 ر.س", active: false },
          ].map((s, i) => (
            <button key={i} className={`rounded-xl p-3 text-center transition-all ${s.active ? 'bg-primary/10 border-2 border-primary' : 'bg-secondary border-2 border-transparent'}`}>
              <span className="text-2xl block mb-1">{s.icon}</span>
              <p className={`text-xs font-semibold font-arabic ${s.active ? 'text-primary' : 'text-foreground'}`}>{s.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.price}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-card rounded-2xl p-4 shadow-elevated">
        <p className="text-xs text-muted-foreground font-arabic mb-3">الموعد</p>
        <div className="grid grid-cols-2 gap-2">
          <button className="bg-primary/10 border-2 border-primary rounded-xl p-3 text-center">
            <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xs font-semibold text-primary font-arabic">الآن</p>
          </button>
          <button className="bg-secondary border-2 border-transparent rounded-xl p-3 text-center">
            <Calendar className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-xs font-semibold text-foreground font-arabic">جدولة لاحقاً</p>
          </button>
        </div>
      </div>

      {/* Extras */}
      <div className="bg-card rounded-2xl p-4 shadow-elevated">
        <p className="text-xs text-muted-foreground font-arabic mb-3">إضافات</p>
        <div className="space-y-3">
          {[
            { label: "حقائب إضافية", price: "+5 ر.س", checked: true },
            { label: "طلب سائقة", price: "مجاني", checked: false },
            { label: "رحلة ذهاب وعودة", price: "+40 ر.س", checked: false },
          ].map((e, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${e.checked ? 'bg-primary border-primary' : 'border-border'}`}>
                  {e.checked && <span className="text-primary-foreground text-xs">✓</span>}
                </div>
                <span className="text-sm text-foreground font-arabic">{e.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">{e.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Coupon */}
      <div className="bg-card rounded-2xl p-4 shadow-elevated flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
          <span className="text-lg">🎫</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground font-arabic">كود خصم</p>
          <p className="text-xs text-success font-arabic">LUFFA30 — خصم 30% مطبّق</p>
        </div>
        <span className="text-xs text-primary font-semibold font-arabic">تغيير</span>
      </div>
    </div>

    {/* Bottom CTA */}
    <div className="bg-card border-t border-border px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground font-arabic">المجموع</span>
        <div className="text-left">
          <span className="text-xs text-muted-foreground line-through ml-2">45 ر.س</span>
          <span className="text-lg font-bold text-foreground">31.50 ر.س</span>
        </div>
      </div>
      <motion.button className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl text-sm font-semibold font-arabic shadow-glow" whileTap={{ scale: 0.98 }}>
        تأكيد الحجز
      </motion.button>
    </div>
  </div>
);

export default BookingScreen;

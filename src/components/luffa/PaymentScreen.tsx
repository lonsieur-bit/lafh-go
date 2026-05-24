import { motion } from "framer-motion";
import { CreditCard, Smartphone, Check, ChevronLeft, ArrowRight, Download } from "lucide-react";

const PaymentScreen = () => (
  <div className="h-full bg-background flex flex-col" dir="rtl">
    {/* Header */}
    <div className="pt-12 px-5 pb-3 bg-card border-b border-border">
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <ArrowRight className="w-4 h-4 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground font-arabic">الدفع</h1>
      </div>
    </div>

    <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
      {/* Trip summary */}
      <div className="bg-card rounded-2xl p-4 shadow-elevated">
        <p className="text-xs text-muted-foreground font-arabic mb-3">ملخص الرحلة</p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-foreground font-arabic">رحلة مميزة</span>
            <span className="text-sm text-foreground">45.00 ر.س</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-foreground font-arabic">حقائب إضافية</span>
            <span className="text-sm text-foreground">5.00 ر.س</span>
          </div>
          <div className="flex justify-between text-success">
            <span className="text-sm font-arabic">خصم LUFFA30</span>
            <span className="text-sm">-15.00 ر.س</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-foreground font-arabic">ضريبة القيمة المضافة (15%)</span>
            <span className="text-sm text-foreground">5.25 ر.س</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="text-sm font-bold text-foreground font-arabic">الإجمالي</span>
            <span className="text-lg font-bold text-primary">40.25 ر.س</span>
          </div>
        </div>
      </div>

      {/* Payment methods */}
      <div className="bg-card rounded-2xl p-4 shadow-elevated">
        <p className="text-xs text-muted-foreground font-arabic mb-3">طريقة الدفع</p>
        <div className="space-y-2">
          {[
            { icon: "💳", label: "مدى •••• 4532", sub: "Mada", active: true },
            { icon: "🍎", label: "Apple Pay", sub: "محفظة Apple", active: false },
            { icon: "💵", label: "نقداً", sub: "الدفع عند الوصول", active: false },
            { icon: "👛", label: "محفظة لفة", sub: "الرصيد: 120 ر.س", active: false },
          ].map((m, i) => (
            <button key={i} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${m.active ? 'bg-primary/10 border-2 border-primary' : 'bg-secondary border-2 border-transparent'}`}>
              <span className="text-xl">{m.icon}</span>
              <div className="flex-1 text-right">
                <p className={`text-sm font-medium font-arabic ${m.active ? 'text-primary' : 'text-foreground'}`}>{m.label}</p>
                <p className="text-xs text-muted-foreground font-arabic">{m.sub}</p>
              </div>
              {m.active && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Wallet balance */}
      <div className="bg-gradient-to-l from-primary to-primary/80 rounded-2xl p-4 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-primary-foreground/70 font-arabic">رصيد المحفظة</p>
            <p className="text-2xl font-bold">120.00 ر.س</p>
          </div>
          <button className="bg-primary-foreground/20 text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl font-arabic">
            شحن
          </button>
        </div>
      </div>
    </div>

    {/* CTA */}
    <div className="bg-card border-t border-border px-5 py-4">
      <motion.button className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl text-sm font-semibold font-arabic shadow-glow" whileTap={{ scale: 0.98 }}>
        ادفع 40.25 ر.س
      </motion.button>
    </div>
  </div>
);

export default PaymentScreen;

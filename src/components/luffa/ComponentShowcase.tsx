import { motion } from "framer-motion";
import { Search, Plus, Check, X, Star, Bell, ChevronLeft, MapPin, Heart, Share2 } from "lucide-react";

const ComponentShowcase = () => (
  <div className="space-y-8" dir="rtl">
    {/* Buttons */}
    <section>
      <h3 className="text-lg font-bold text-foreground mb-4 font-arabic">الأزرار / Buttons</h3>
      <div className="flex flex-wrap gap-3">
        <motion.button whileTap={{ scale: 0.97 }} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold shadow-glow">
          أساسي / Primary
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} className="bg-secondary text-secondary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold">
          ثانوي / Secondary
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} className="border border-border text-foreground px-6 py-2.5 rounded-xl text-sm font-medium">
          شبحي / Ghost
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} className="bg-destructive text-destructive-foreground px-6 py-2.5 rounded-xl text-sm font-semibold">
          تحذيري / Destructive
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} className="bg-success text-success-foreground px-6 py-2.5 rounded-xl text-sm font-semibold">
          نجاح / Success
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Plus className="w-5 h-5" />
        </motion.button>
        <button className="bg-muted text-muted-foreground px-6 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed opacity-60">
          معطّل / Disabled
        </button>
      </div>
    </section>

    {/* Inputs */}
    <section>
      <h3 className="text-lg font-bold text-foreground mb-4 font-arabic">حقول الإدخال / Inputs</h3>
      <div className="space-y-3 max-w-sm">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block font-arabic">اسم المستخدم</label>
          <div className="bg-secondary rounded-xl px-4 py-3 text-sm text-foreground font-arabic">بندر النفيعي</div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block font-arabic">بحث</label>
          <div className="bg-secondary rounded-xl px-4 py-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-arabic">ابحث عن خدمة...</span>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block font-arabic">رمز التحقق / OTP</label>
          <div className="flex gap-2" dir="ltr">
            {["4", "7", "", ""].map((v, i) => (
              <div key={i} className={`w-12 h-12 rounded-xl ${v ? 'bg-card border-2 border-primary' : 'bg-secondary border border-border'} flex items-center justify-center text-lg font-bold text-foreground`}>
                {v}
              </div>
            ))}
          </div>
        </div>
        <div className="border-2 border-destructive bg-destructive/5 rounded-xl px-4 py-3">
          <span className="text-sm text-foreground font-arabic">email@</span>
          <p className="text-xs text-destructive mt-1 font-arabic">الرجاء إدخال بريد إلكتروني صحيح</p>
        </div>
      </div>
    </section>

    {/* Cards */}
    <section>
      <h3 className="text-lg font-bold text-foreground mb-4 font-arabic">البطاقات / Cards</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Service card */}
        <div className="bg-card rounded-2xl p-4 shadow-elevated">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground font-arabic">توصيل سريع</p>
              <p className="text-xs text-muted-foreground font-arabic">خلال 15 دقيقة</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-primary">من 15 ر.س</span>
            <button className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-lg">احجز</button>
          </div>
        </div>

        {/* Driver card */}
        <div className="bg-card rounded-2xl p-4 shadow-elevated">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden">
              <div className="w-full h-full bg-muted flex items-center justify-center text-lg">👨</div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground font-arabic">خالد الأحمد</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-warning fill-warning" />
                <span className="text-xs text-muted-foreground">4.95 • كامري 2023</span>
              </div>
            </div>
            <span className="bg-success/10 text-success text-xs px-2 py-0.5 rounded-full font-arabic">متاح</span>
          </div>
        </div>

        {/* Offer card */}
        <div className="bg-gradient-to-bl from-primary to-primary/80 rounded-2xl p-4 text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 left-0 w-20 h-20 bg-primary-foreground/5 rounded-full -translate-x-6 -translate-y-6" />
          <p className="font-bold text-lg font-arabic">خصم 25%</p>
          <p className="text-xs text-primary-foreground/70 mt-1 font-arabic">على جميع رحلات نهاية الأسبوع</p>
          <p className="text-xs mt-3 bg-primary-foreground/20 inline-block px-3 py-1 rounded-lg font-mono">WEEKEND25</p>
        </div>
      </div>
    </section>

    {/* Badges, Chips, Ratings */}
    <section>
      <h3 className="text-lg font-bold text-foreground mb-4 font-arabic">شارات وتقييمات / Badges & Ratings</h3>
      <div className="flex flex-wrap gap-3 items-center">
        <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">جديد</span>
        <span className="bg-success/10 text-success text-xs font-semibold px-3 py-1 rounded-full">مكتمل</span>
        <span className="bg-warning/10 text-warning text-xs font-semibold px-3 py-1 rounded-full">قيد التنفيذ</span>
        <span className="bg-destructive/10 text-destructive text-xs font-semibold px-3 py-1 rounded-full">ملغي</span>
        <span className="bg-info/10 text-info text-xs font-semibold px-3 py-1 rounded-full">قيد المراجعة</span>
        <div className="flex items-center gap-0.5">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'text-warning fill-warning' : 'text-border'}`} />
          ))}
          <span className="text-xs text-muted-foreground mr-1">(4.0)</span>
        </div>
      </div>
    </section>

    {/* Alerts */}
    <section>
      <h3 className="text-lg font-bold text-foreground mb-4 font-arabic">التنبيهات / Alerts</h3>
      <div className="space-y-3 max-w-md">
        <div className="bg-success/10 border border-success/20 rounded-xl p-3 flex items-start gap-3">
          <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground font-arabic">تم بنجاح!</p>
            <p className="text-xs text-muted-foreground font-arabic">تم تأكيد حجزك بنجاح</p>
          </div>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-start gap-3">
          <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground font-arabic">فشل الدفع</p>
            <p className="text-xs text-muted-foreground font-arabic">تعذر معالجة عملية الدفع</p>
          </div>
        </div>
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 flex items-start gap-3">
          <Bell className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground font-arabic">إشارة GPS ضعيفة</p>
            <p className="text-xs text-muted-foreground font-arabic">يرجى التحرك لمكان مفتوح</p>
          </div>
        </div>
      </div>
    </section>

    {/* Skeleton loaders */}
    <section>
      <h3 className="text-lg font-bold text-foreground mb-4 font-arabic">هياكل التحميل / Skeleton Loaders</h3>
      <div className="max-w-sm space-y-4">
        <div className="bg-card rounded-2xl p-4 shadow-elevated">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full animate-shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-3 rounded-full animate-shimmer w-3/4" />
              <div className="h-2.5 rounded-full animate-shimmer w-1/2" />
            </div>
          </div>
          <div className="h-20 rounded-xl animate-shimmer" />
        </div>
      </div>
    </section>
  </div>
);

export default ComponentShowcase;

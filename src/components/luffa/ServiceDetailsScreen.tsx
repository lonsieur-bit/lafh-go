import { motion } from "framer-motion";
import { Star, Heart, Share2, MapPin, Clock, Shield, ArrowRight, ChevronDown, Car } from "lucide-react";
import driverAvatar from "@/assets/driver-avatar.jpg";
import heroCity from "@/assets/hero-city.jpg";

const ServiceDetailsScreen = () => (
  <div className="h-full bg-background flex flex-col" dir="rtl">
    {/* Image header */}
    <div className="relative h-48 flex-shrink-0">
      <img src={heroCity} alt="خدمة" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      <div className="absolute top-12 inset-x-5 flex items-center justify-between">
        <button className="w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center">
          <ArrowRight className="w-4 h-4 text-foreground" />
        </button>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center">
            <Heart className="w-4 h-4 text-foreground" />
          </button>
          <button className="w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center">
            <Share2 className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>
    </div>

    <div className="flex-1 overflow-auto -mt-6 relative z-10">
      <div className="bg-background rounded-t-3xl px-5 pt-5 pb-4 space-y-4">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full font-arabic">الأكثر طلباً</span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-warning fill-warning" />
              <span className="text-xs text-muted-foreground">4.9 (2,340 تقييم)</span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-foreground font-arabic">توصيل ركاب مميز</h1>
          <p className="text-sm text-muted-foreground mt-1 font-arabic">سيارات فاخرة مع سائقين محترفين، خدمة 24/7</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Clock, label: "وصول خلال 5 دقائق" },
            { icon: Shield, label: "سائق موثّق" },
            { icon: Car, label: "سيارات حديثة" },
          ].map((f, i) => (
            <div key={i} className="bg-card rounded-xl p-3 text-center shadow-elevated">
              <f.icon className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-[10px] text-foreground font-arabic">{f.label}</p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="bg-card rounded-2xl p-4 shadow-elevated">
          <p className="text-xs text-muted-foreground font-arabic mb-3">الأسعار</p>
          <div className="space-y-2">
            {[
              { label: "فتحة باب", price: "7 ر.س" },
              { label: "سعر الكيلومتر", price: "2.5 ر.س/كم" },
              { label: "سعر الدقيقة (انتظار)", price: "0.5 ر.س/دقيقة" },
              { label: "الحد الأدنى", price: "15 ر.س" },
            ].map((p, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-sm text-foreground font-arabic">{p.label}</span>
                <span className="text-sm font-medium text-foreground">{p.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground font-arabic">التقييمات</p>
            <button className="text-xs text-primary font-medium font-arabic">عرض الكل</button>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-elevated">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm flex-shrink-0">م</div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground font-arabic">محمد السعيد</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-2.5 h-2.5 text-warning fill-warning" />)}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-arabic">خدمة ممتازة! السائق كان محترف جداً والسيارة نظيفة ومريحة. أنصح بشدة 👍</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom CTA */}
    <div className="bg-card border-t border-border px-5 py-4 flex items-center gap-3">
      <div>
        <p className="text-xs text-muted-foreground font-arabic">يبدأ من</p>
        <p className="text-lg font-bold text-primary">15 ر.س</p>
      </div>
      <motion.button className="flex-1 bg-primary text-primary-foreground py-3.5 rounded-xl text-sm font-semibold font-arabic shadow-glow" whileTap={{ scale: 0.98 }}>
        احجز الآن
      </motion.button>
    </div>
  </div>
);

export default ServiceDetailsScreen;

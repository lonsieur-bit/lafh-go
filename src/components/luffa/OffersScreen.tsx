import { motion } from "framer-motion";
import { Gift, Copy, Clock, Check } from "lucide-react";

const offers = [
  { code: "LUFFA30", desc: "خصم 30% على أول رحلة", expiry: "صالح حتى 30/04/2024", type: "خصم نسبي", color: "from-primary to-primary/70" },
  { code: "WEEKEND25", desc: "خصم 25% على رحلات نهاية الأسبوع", expiry: "كل عطلة نهاية أسبوع", type: "نهاية الأسبوع", color: "from-info to-info/70" },
  { code: "FREE10", desc: "رحلة مجانية حتى 10 ر.س", expiry: "صالح حتى 15/04/2024", type: "رحلة مجانية", color: "from-success to-success/70" },
  { code: "VIP50", desc: "خصم 50 ر.س على الرحلات المميزة", expiry: "صالح حتى 20/04/2024", type: "خصم ثابت", color: "from-warning to-warning/70" },
];

const OffersScreen = () => (
  <div className="h-full bg-background flex flex-col" dir="rtl">
    {/* Header */}
    <div className="pt-12 px-5 pb-4 bg-card border-b border-border">
      <h1 className="text-lg font-bold text-foreground font-arabic">العروض والكوبونات</h1>
      <p className="text-xs text-muted-foreground mt-1 font-arabic">استمتع بخصومات حصرية على رحلاتك</p>
    </div>

    <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
      {/* Referral banner */}
      <div className="bg-gradient-to-l from-primary to-primary/80 rounded-2xl p-4 text-primary-foreground relative overflow-hidden">
        <div className="absolute -top-4 -left-4 w-20 h-20 bg-primary-foreground/5 rounded-full" />
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary-foreground/5 rounded-full" />
        <Gift className="w-8 h-8 mb-2" />
        <p className="font-bold text-sm font-arabic">ادعُ صديق واربح!</p>
        <p className="text-xs text-primary-foreground/70 mt-1 font-arabic">احصل على رحلة مجانية عند دعوة أصدقائك</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="bg-primary-foreground/20 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="text-xs font-mono">AHMED-REF2024</span>
            <Copy className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Coupons */}
      {offers.map((offer, i) => (
        <motion.div
          key={i}
          className={`rounded-2xl p-4 text-white bg-gradient-to-l ${offer.color} relative overflow-hidden`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <div className="absolute top-0 left-0 w-16 h-16 bg-white/5 rounded-full -translate-x-4 -translate-y-4" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-arabic">{offer.type}</span>
              <p className="font-bold text-sm mt-2 font-arabic">{offer.desc}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 opacity-70" />
                <p className="text-[10px] opacity-70 font-arabic">{offer.expiry}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="bg-white/20 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <span className="text-xs font-mono font-bold">{offer.code}</span>
              <Copy className="w-3 h-3 opacity-70" />
            </div>
            <button className="bg-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold font-arabic">استخدم</button>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default OffersScreen;

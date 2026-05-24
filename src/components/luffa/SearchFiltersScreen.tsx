import { motion } from "framer-motion";
import { MapPin, Search, SlidersHorizontal, Star, Clock, ArrowRight, Car, Truck, Package, Filter } from "lucide-react";

const categories = [
  { icon: "🚗", label: "توصيل ركاب", count: 24 },
  { icon: "🚛", label: "سطحة", count: 12 },
  { icon: "📦", label: "طرود", count: 18 },
  { icon: "🏗️", label: "نقل بضائع", count: 8 },
];

const results = [
  { name: "توصيل سريع", rating: 4.9, reviews: 2340, price: "15 ر.س", time: "5 دقائق", distance: "2.3 كم", tag: "الأكثر طلباً" },
  { name: "توصيل مميز", rating: 4.8, reviews: 1820, price: "25 ر.س", time: "4 دقائق", distance: "1.8 كم", tag: "فاخر" },
  { name: "توصيل عائلي", rating: 4.7, reviews: 960, price: "35 ر.س", time: "7 دقائق", distance: "3.1 كم", tag: "" },
  { name: "سطحة عادية", rating: 4.6, reviews: 520, price: "80 ر.س", time: "12 دقيقة", distance: "5.2 كم", tag: "" },
];

const SearchFiltersScreen = () => (
  <div className="h-full bg-background flex flex-col" dir="rtl">
    {/* Header */}
    <div className="pt-12 px-5 pb-3 bg-card">
      <div className="flex items-center gap-3 mb-3">
        <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <ArrowRight className="w-4 h-4 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground font-arabic">البحث</h1>
      </div>
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-secondary rounded-xl px-4 py-2.5">
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-arabic">ابحث عن خدمة أو سائق...</span>
        </div>
        <button className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <SlidersHorizontal className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>
    </div>

    <div className="flex-1 overflow-auto">
      {/* Categories */}
      <div className="px-5 py-4">
        <p className="text-xs text-muted-foreground font-arabic mb-3">التصنيفات</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat, i) => (
            <button key={i} className={`flex items-center gap-2 px-4 py-2 rounded-xl flex-shrink-0 ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-card shadow-elevated text-foreground'}`}>
              <span>{cat.icon}</span>
              <span className="text-xs font-medium font-arabic">{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${i === 0 ? 'bg-primary-foreground/20' : 'bg-secondary'}`}>{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active filters */}
      <div className="px-5 mb-3">
        <div className="flex gap-2 flex-wrap">
          {["أقل من 5 كم", "تقييم 4+", "متاح الآن"].map((f, i) => (
            <span key={i} className="bg-accent text-accent-foreground text-[10px] font-semibold px-3 py-1 rounded-full flex items-center gap-1 font-arabic">
              {f}
              <span className="text-accent-foreground/60">✕</span>
            </span>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="px-5 space-y-3 pb-4">
        <p className="text-xs text-muted-foreground font-arabic">{results.length} نتيجة</p>
        {results.map((r, i) => (
          <motion.div
            key={i}
            className="bg-card rounded-2xl p-4 shadow-elevated"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-foreground font-arabic">{r.name}</p>
                  {r.tag && <span className="bg-primary/10 text-primary text-[9px] font-semibold px-2 py-0.5 rounded-full font-arabic">{r.tag}</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-warning fill-warning" />{r.rating} ({r.reviews})</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{r.distance}</span>
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-primary">{r.price}</p>
                <p className="text-[10px] text-muted-foreground font-arabic">الحد الأدنى</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default SearchFiltersScreen;

import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Search, MapPin, Bell, Car, Truck, Package, Navigation, Crosshair, Menu } from "lucide-react";
import luffaLogo from "@/assets/luffa-logo.webp";
import { useAppState } from "@/context/AppStateContext";

const services = [
  { icon: Car, label: "صغيرة", key: "regular" as const, price: "25 ر.س" },
  { icon: Car, label: "فارهة", key: "premium" as const, price: "45 ر.س" },
  { icon: Car, label: "عائلية", key: "family" as const, price: "55 ر.س" },
  { icon: Navigation, label: "دراجة", key: "bike" as const, price: "18 ر.س" },
  { icon: Package, label: "بضائع", key: "cargo" as const, price: "70 ر.س" },
  { icon: Truck, label: "سطحة", key: "tow" as const, price: "95 ر.س" },
];

interface CustomerHomeScreenProps {
  hideBottomNav?: boolean;
  appMode?: boolean;
}

const CustomerHomeScreen = ({ hideBottomNav = false, appMode = false }: CustomerHomeScreenProps) => {
  const navigate = useNavigate();
  const { prepareBooking } = useAppState();
  const [searchText, setSearchText] = useState("");
  const [selectedService, setSelectedService] = useState<(typeof services)[number]["key"]>("regular");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const destination = searchText.trim();
    if (!destination || !appMode) return;
    navigate(`/app/booking?destination=${encodeURIComponent(destination)}&service=${selectedService}`);
  };

  const selectedServiceMeta = services.find((s) => s.key === selectedService) ?? services[0];

  return (
    <div className="h-full bg-background relative overflow-hidden" dir="rtl">
      {/* Map-first background */}
      <div className="absolute inset-0 map-pattern bg-secondary">
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/25 to-transparent" />

        {/* Floating map markers */}
        <div className="absolute top-[32%] right-[34%] w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-glow">
          <MapPin className="w-3.5 h-3.5" />
        </div>
        <div className="absolute top-[42%] left-[22%] w-4 h-4 rounded-full bg-card border border-border shadow-elevated" />
      </div>

      {/* Top floating controls */}
      <div className="absolute top-12 right-4 left-4 z-20">
        <div className="flex items-center justify-between mb-3 relative">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="w-10 h-10 rounded-full bg-card/95 border border-border shadow-elevated flex items-center justify-center"
              aria-label="فتح القائمة"
            >
              <Menu className="w-4 h-4 text-foreground" />
            </button>
            <img src={luffaLogo} alt="لفة" className="w-8 h-8" />
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur rounded-2xl border border-border px-3 py-2 shadow-elevated">
            <p className="text-[10px] text-muted-foreground font-arabic text-center">الموقع الحالي</p>
            <p className="text-xs font-extrabold text-foreground font-arabic text-center">حي النخيل</p>
          </div>

          {appMode ? (
            <Link
              to="/app/notifications"
              className="w-10 h-10 rounded-full bg-card/95 backdrop-blur border border-border flex items-center justify-center relative shadow-elevated"
            >
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-1 right-1.5 w-2.5 h-2.5 rounded-full bg-destructive border-2 border-background" />
            </Link>
          ) : (
            <button type="button" className="w-10 h-10 rounded-full bg-card/95 border border-border flex items-center justify-center shadow-elevated">
              <Bell className="w-5 h-5 text-foreground" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 460, damping: 30, mass: 0.8 }}
              className="absolute right-0 mt-1 w-52 rounded-2xl bg-card border border-border shadow-elevated-lg p-2 space-y-1 origin-top-right"
            >
              {[
                { to: "/app", label: "الصفحة الرئيسية" },
                { to: "/app/orders", label: "سجل الرحلات" },
                { to: "/app/chat", label: "الدردشة" },
                { to: "/app/profile", label: "الحساب" },
              ].map((item, idx) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.16, delay: idx * 0.03 }}
                >
                  <Link
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm font-arabic font-semibold bg-secondary hover:bg-accent transition-colors"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-start">
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-card/95 backdrop-blur border border-border flex items-center justify-center shadow-elevated"
            aria-label="تحديد موقعي"
          >
            <Crosshair className="w-4 h-4 text-primary" />
          </button>
        </div>
      </div>

      {/* Uber-like bottom sheet */}
      <div className="absolute bottom-0 right-0 left-0 z-30">
        <div className="mx-2 mb-2 rounded-3xl bg-card border border-border shadow-elevated-lg">
          <div className="pt-2 pb-1 flex justify-center">
            <div className="w-12 h-1 rounded-full bg-border" />
          </div>

          <form onSubmit={handleSearchSubmit} className="px-4 pt-1 pb-3">
            <div className="flex items-center gap-2 bg-secondary rounded-2xl border border-border px-3 py-2.5">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground font-arabic flex-1"
                placeholder="إلى أين تريد الذهاب؟"
              />
              <button
                type="submit"
                disabled={!searchText.trim() || !appMode}
                className="text-xs font-extrabold font-arabic px-3 py-1.5 rounded-xl bg-card text-primary disabled:opacity-50"
              >
                انطلاق
              </button>
            </div>
          </form>

          <div className="px-4 pb-4">
            <p className="text-xs text-muted-foreground font-arabic mb-2">الفئات المتاحة</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {services.map((s) => (
                <motion.button
                  key={s.key}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setSelectedService(s.key);
                    prepareBooking(s.key);
                  }}
                  className={`min-w-[95px] rounded-2xl border px-3 py-2.5 text-right ${
                    selectedService === s.key
                      ? "bg-primary text-primary-foreground border-primary shadow-glow"
                      : "bg-secondary text-foreground border-border"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <s.icon className="w-4 h-4" />
                    <span className="text-[11px] font-extrabold font-arabic">{s.label}</span>
                  </div>
                  <p className={`text-[10px] mt-1 ${selectedService === s.key ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {s.price}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="px-4 pb-4">
            {appMode ? (
              <Link
                to={`/app/booking?service=${selectedService}`}
                onClick={() => prepareBooking(selectedService)}
                className="block w-full rounded-2xl bg-primary text-primary-foreground text-center py-3 text-sm font-extrabold font-arabic shadow-glow"
              >
                متابعة مع فئة {selectedServiceMeta.label}
              </Link>
            ) : (
              <button
                type="button"
                className="block w-full rounded-2xl bg-primary text-primary-foreground text-center py-3 text-sm font-extrabold font-arabic"
              >
                متابعة
              </button>
            )}
          </div>
        </div>
      </div>

      {!hideBottomNav && (
        <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border px-5 py-2 flex items-center justify-around z-40">
          {[
            { icon: "🏠", label: "الرئيسية", active: true },
            { icon: "📋", label: "طلباتي", active: false },
            { icon: "💬", label: "الدردشة", active: false },
            { icon: "👤", label: "حسابي", active: false },
          ].map((item, i) => (
            <button key={i} type="button" className="flex flex-col items-center gap-0.5 py-1">
              <span className="text-lg">{item.icon}</span>
              <span className={`text-[10px] font-arabic ${item.active ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerHomeScreen;

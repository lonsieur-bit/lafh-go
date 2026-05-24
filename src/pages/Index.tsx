import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PhoneFrame from "@/components/luffa/PhoneFrame";
import SplashScreen from "@/components/luffa/SplashScreen";
import CustomerHomeScreen from "@/components/luffa/CustomerHomeScreen";
import DriverDashboardScreen from "@/components/luffa/DriverDashboardScreen";
import AuthScreen from "@/components/luffa/AuthScreen";
import BookingScreen from "@/components/luffa/BookingScreen";
import LiveTrackingScreen from "@/components/luffa/LiveTrackingScreen";
import ChatScreen from "@/components/luffa/ChatScreen";
import PaymentScreen from "@/components/luffa/PaymentScreen";
import OrdersHistoryScreen from "@/components/luffa/OrdersHistoryScreen";
import SettingsScreen from "@/components/luffa/SettingsScreen";
import ServiceDetailsScreen from "@/components/luffa/ServiceDetailsScreen";
import SearchFiltersScreen from "@/components/luffa/SearchFiltersScreen";
import OffersScreen from "@/components/luffa/OffersScreen";
import ComponentShowcase from "@/components/luffa/ComponentShowcase";
import DesignTokens from "@/components/luffa/DesignTokens";
import luffaLogo from "@/assets/luffa-logo.webp";

type Tab = "screens" | "components" | "tokens";

type ScreenKey = "splash" | "auth" | "customer" | "driver" | "booking" | "tracking" | "chat" | "payment" | "orders" | "settings" | "service" | "search" | "offers";

const screenGroups = [
  {
    label: "التسجيل والبدء",
    screens: [
      { key: "splash" as ScreenKey, label: "البداية", labelEn: "Splash" },
      { key: "auth" as ScreenKey, label: "تسجيل الدخول", labelEn: "Auth" },
    ],
  },
  {
    label: "تطبيق العميل",
    screens: [
      { key: "customer" as ScreenKey, label: "الرئيسية", labelEn: "Customer Home" },
      { key: "search" as ScreenKey, label: "البحث", labelEn: "Search & Filters" },
      { key: "service" as ScreenKey, label: "تفاصيل الخدمة", labelEn: "Service Details" },
      { key: "booking" as ScreenKey, label: "الحجز", labelEn: "Booking Flow" },
      { key: "tracking" as ScreenKey, label: "التتبع", labelEn: "Live Tracking" },
      { key: "chat" as ScreenKey, label: "المحادثة", labelEn: "Chat" },
      { key: "payment" as ScreenKey, label: "الدفع", labelEn: "Payment" },
      { key: "orders" as ScreenKey, label: "الطلبات", labelEn: "Orders History" },
      { key: "offers" as ScreenKey, label: "العروض", labelEn: "Offers" },
      { key: "settings" as ScreenKey, label: "الإعدادات", labelEn: "Settings" },
    ],
  },
  {
    label: "تطبيق السائق",
    screens: [
      { key: "driver" as ScreenKey, label: "لوحة السائق", labelEn: "Driver Dashboard" },
    ],
  },
];

const allScreens = screenGroups.flatMap(g => g.screens);

const renderScreen = (key: ScreenKey) => {
  switch (key) {
    case "splash": return <SplashScreen />;
    case "auth": return <AuthScreen />;
    case "customer": return <CustomerHomeScreen />;
    case "driver": return <DriverDashboardScreen />;
    case "booking": return <BookingScreen />;
    case "tracking": return <LiveTrackingScreen />;
    case "chat": return <ChatScreen />;
    case "payment": return <PaymentScreen />;
    case "orders": return <OrdersHistoryScreen />;
    case "settings": return <SettingsScreen />;
    case "service": return <ServiceDetailsScreen />;
    case "search": return <SearchFiltersScreen />;
    case "offers": return <OffersScreen />;
  }
};

const Index = () => {
  const [tab, setTab] = useState<Tab>("screens");
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("splash");

  const currentScreen = allScreens.find(s => s.key === activeScreen);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={luffaLogo} alt="لفة" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold text-foreground font-arabic">لفة للنقل الموجه</h1>
              <p className="text-xs text-muted-foreground">UI/UX Design System — {allScreens.length} Screens</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
            {([
              { key: "screens" as Tab, label: "الشاشات", count: allScreens.length },
              { key: "components" as Tab, label: "المكونات" },
              { key: "tokens" as Tab, label: "التوكنز" },
            ]).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors font-arabic flex items-center gap-1.5 ${
                  tab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
                {'count' in t && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{t.count}</span>}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div
          className="mb-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-2xl border border-border bg-card/60 px-4 py-3 shadow-elevated"
          dir="rtl"
        >
          <span className="text-xs text-muted-foreground font-arabic">تجربة الصفحات الحية:</span>
          <Link to="/app" className="text-xs font-semibold text-primary font-arabic hover:underline underline-offset-2">
            التطبيق
          </Link>
          <span className="text-muted-foreground/40">·</span>
          <Link
            to="/app/orders"
            className="text-xs font-medium text-foreground font-arabic hover:text-primary"
          >
            الطلبات
          </Link>
          <Link
            to="/app/profile"
            className="text-xs font-medium text-foreground font-arabic hover:text-primary"
          >
            الحساب
          </Link>
        </div>
        <AnimatePresence mode="wait">
          {tab === "screens" && (
            <motion.div key="screens" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {/* Screen groups */}
              <div className="mb-8 space-y-4" dir="rtl">
                {screenGroups.map((group, gi) => (
                  <div key={gi}>
                    <p className="text-xs font-semibold text-muted-foreground font-arabic mb-2">{group.label}</p>
                    <div className="flex gap-2 flex-wrap">
                      {group.screens.map(s => (
                        <button
                          key={s.key}
                          onClick={() => setActiveScreen(s.key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all font-arabic ${
                            activeScreen === s.key
                              ? 'bg-primary text-primary-foreground shadow-glow'
                              : 'bg-secondary text-secondary-foreground hover:bg-accent'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Phone frame */}
              <div className="flex flex-wrap gap-8 justify-center items-start">
                <PhoneFrame label={`${currentScreen?.labelEn} — RTL (العربية)`} rtl>
                  {renderScreen(activeScreen)}
                </PhoneFrame>
              </div>

              {/* Screen specs */}
              <div className="mt-8 max-w-2xl mx-auto bg-card rounded-2xl p-6 shadow-elevated" dir="rtl">
                <h3 className="text-sm font-bold text-foreground mb-3 font-arabic">مواصفات الشاشة — {currentScreen?.label}</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground font-arabic">الأبعاد</p>
                    <p className="font-medium text-foreground">375 × 812 px (iPhone 13)</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-arabic">الاتجاه</p>
                    <p className="font-medium text-foreground font-arabic">RTL + LTR</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-arabic">الخطوط</p>
                    <p className="font-medium text-foreground">Noto Sans Arabic + Inter</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-arabic">المعرّف</p>
                    <p className="font-medium text-foreground font-mono">{currentScreen?.key}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "components" && (
            <motion.div key="components" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <ComponentShowcase />
            </motion.div>
          )}

          {tab === "tokens" && (
            <motion.div key="tokens" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <DesignTokens />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;

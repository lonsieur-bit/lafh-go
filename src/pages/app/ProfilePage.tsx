import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  ChevronLeft,
  CircleHelp,
  FileText,
  Gift,
  Languages,
  MapPin,
  MessageCircleMore,
  Settings,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";
import luffaLogo from "@/assets/luffa-logo.webp";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/context/AppStateContext";

const quickLinks: { to: string; label: string; icon: typeof Bell }[] = [
  { to: "/app/orders", label: "رحلاتي", icon: MapPin },
  { to: "/app/wallet", label: "رصيدي", icon: Wallet },
  { to: "/app/addresses", label: "حسابي", icon: User },
];

const settingsLinks: { to: string; label: string; icon: typeof Bell }[] = [
  { to: "/app/notifications", label: "الإشعارات", icon: Bell },
  { to: "/app/profile", label: "الإعدادات", icon: Settings },
  { to: "/app/profile", label: "المساعدة", icon: CircleHelp },
  { to: "/app/profile", label: "تواصل معنا", icon: MessageCircleMore },
  { to: "/app/referral", label: "أكواد الخصم", icon: Gift },
  { to: "/app/profile", label: "الدعم الفني", icon: ShieldCheck },
  { to: "/app/profile", label: "الشروط والأحكام", icon: FileText },
  { to: "/app/profile", label: "اللغة", icon: Languages },
];

const ProfilePage = () => (
  <ProfileContent />
);

const ProfileContent = () => {
  const { isLoggedIn, logout } = useAppState();
  return (
  <div className="h-full bg-background flex flex-col min-h-0" dir="rtl">
    <div className="pt-12 px-5 pb-4 bg-card border-b border-border flex-shrink-0">
      <div className="flex items-center justify-between gap-3 mb-4">
        <Link to="/app" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0" aria-label="عودة">
          <ArrowRight className="w-4 h-4 text-foreground" />
        </Link>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
            <img src={luffaLogo} alt="" className="w-9 h-9" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-extrabold text-foreground font-arabic truncate">بدر عايض النفيعي</p>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5" dir="ltr">
              +966 5XX XXX XXXX
            </p>
          </div>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground font-arabic text-right">رصيدي</p>
          <p className="text-lg font-extrabold text-foreground font-arabic text-right">
            0.0 د.ع
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="bg-secondary/70 rounded-xl border border-border px-2 py-2 flex flex-col items-center justify-center gap-1"
            >
              <span className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </span>
              <span className="text-[11px] text-foreground font-arabic font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>

    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 min-h-0">
      {settingsLinks.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={`${item.to}-${item.label}`}
            to={item.to}
            className="flex items-center gap-3 bg-card rounded-xl p-3.5 border border-border active:scale-[0.99] transition-transform"
          >
            <span className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground font-arabic">{item.label}</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0 flip-rtl" />
          </Link>
        );
      })}

      <div className="rounded-xl p-4 bg-secondary/70 border border-border mt-2">
        <div className="flex items-center gap-2 mb-1">
          <User className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs font-semibold text-foreground font-arabic">عن Laffa</p>
        </div>
        <p className="text-[11px] text-muted-foreground font-arabic leading-relaxed">
          الأيقونات والعناصر مصممة بشكل أوضح مع توزيع أفضل لتجربة أقرب لتطبيقات التنقل الحديثة.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 mt-2 pb-4">
        {isLoggedIn ? (
          <Button
            type="button"
            variant="default"
            className="rounded-2xl font-arabic font-extrabold h-12"
            onClick={logout}
          >
            خروج
          </Button>
        ) : (
          <Button asChild className="rounded-2xl font-arabic font-extrabold h-12 shadow-glow">
            <Link to="/app/auth">تسجيل الدخول</Link>
          </Button>
        )}
      </div>
    </div>
  </div>
);
};

export default ProfilePage;

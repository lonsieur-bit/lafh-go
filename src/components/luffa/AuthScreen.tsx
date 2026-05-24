import { motion } from "framer-motion";
import { Phone, Mail } from "lucide-react";
import luffaLogo from "@/assets/luffa-logo.webp";

const AuthScreen = () => (
  <div className="h-full bg-background flex flex-col" dir="rtl">
    <div className="pt-14 px-6 flex-1 flex flex-col">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <img src={luffaLogo} alt="لفة" className="w-20 h-20 mb-3" />
        <h1 className="text-2xl font-bold text-foreground font-arabic">أهلاً بك في لفة</h1>
        <p className="text-sm text-muted-foreground mt-1 font-arabic">سجّل دخولك للبدء</p>
      </div>

      {/* Phone input */}
      <div className="mb-4">
        <label className="text-xs font-medium text-muted-foreground mb-2 block font-arabic">رقم الهاتف</label>
        <div className="flex items-center bg-secondary rounded-xl px-4 py-3.5 gap-3">
          <div className="flex items-center gap-1 border-l border-border pl-3">
            <span className="text-sm">🇸🇦</span>
            <span className="text-sm text-foreground font-medium">+966</span>
          </div>
          <span className="text-sm text-muted-foreground font-arabic">5XX XXX XXXX</span>
        </div>
      </div>

      {/* CTA */}
      <motion.button className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl text-sm font-semibold font-arabic shadow-glow" whileTap={{ scale: 0.98 }}>
        إرسال رمز التحقق
      </motion.button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-arabic">أو سجّل عبر</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Social logins */}
      <div className="space-y-3">
        {[
          { icon: "🍎", label: "Apple", bg: "bg-foreground text-background" },
          { icon: "🔵", label: "Google", bg: "bg-secondary text-foreground" },
          { icon: "✉️", label: "البريد الإلكتروني", bg: "bg-secondary text-foreground" },
        ].map((s, i) => (
          <motion.button key={i} className={`w-full ${s.bg} py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 font-arabic`} whileTap={{ scale: 0.98 }}>
            <span>{s.icon}</span>
            <span>المتابعة عبر {s.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Terms */}
      <p className="text-[10px] text-muted-foreground text-center mt-6 font-arabic leading-relaxed">
        بالمتابعة، أنت توافق على <span className="text-primary">شروط الاستخدام</span> و<span className="text-primary">سياسة الخصوصية</span>
      </p>
    </div>
  </div>
);

export default AuthScreen;

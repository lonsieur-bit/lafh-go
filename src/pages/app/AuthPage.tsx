import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, MessageCircle, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppState } from "@/context/AppStateContext";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, authMethod, setAuthMethod } = useAppState();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");

  const submitPhone = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^\d{9}$/.test(phone)) {
      setError("أدخل رقم جوال صحيح من 9 أرقام بدون 0");
      return;
    }
    setStep("otp");
  };

  const submitOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const ok = await login(phone, otp, referralCode);
    if (!ok) {
      setError("رمز التحقق غير صحيح. استخدم 1234 للتجربة");
      return;
    }
    navigate("/app");
  };

  return (
    <div className="h-full bg-background flex flex-col" dir="rtl">
      <div className="pt-12 px-5 pb-3 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <Link to="/app" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center" aria-label="عودة">
            <ArrowRight className="w-4 h-4 text-foreground" />
          </Link>
          <h1 className="text-lg font-extrabold text-foreground font-arabic">تسجيل الدخول</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 py-5">
        <div className="bg-card rounded-2xl p-4 shadow-elevated border border-border space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setAuthMethod("whatsapp")}
              className={`rounded-xl px-2 py-2 text-xs font-arabic font-semibold border ${
                authMethod === "whatsapp" ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"
              }`}
            >
              واتساب
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod("google")}
              className={`rounded-xl px-2 py-2 text-xs font-arabic font-semibold border ${
                authMethod === "google" ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"
              }`}
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod("sms")}
              className={`rounded-xl px-2 py-2 text-xs font-arabic font-semibold border ${
                authMethod === "sms" ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"
              }`}
            >
              SMS
            </button>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            {authMethod === "whatsapp" ? <MessageCircle className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            <p className="text-xs font-arabic">
              {authMethod === "whatsapp" ? "تسجيل عبر واتساب (افتراضي)" : authMethod === "google" ? "تسجيل عبر Google" : "تسجيل عبر الرسائل النصية"}
            </p>
          </div>

          {step === "phone" ? (
            <form onSubmit={submitPhone} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-arabic">رقم الجوال (بدون 0)</Label>
                <div className="flex items-center gap-2" dir="ltr">
                  <span className="text-sm text-muted-foreground">+966</span>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))} className="rounded-xl font-mono" placeholder="5XXXXXXXX" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="referral" className="font-arabic">كود الإحالة (اختياري)</Label>
                <Input
                  id="referral"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="rounded-xl font-mono"
                  placeholder="LF123456"
                  dir="ltr"
                />
              </div>
              {error && <p className="text-xs text-destructive font-arabic">{error}</p>}
              <Button type="submit" className="w-full rounded-xl font-arabic shadow-glow">إرسال رمز التحقق</Button>
            </form>
          ) : (
            <form onSubmit={submitOtp} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="otp" className="font-arabic">رمز التحقق</Label>
                <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))} className="rounded-xl font-mono text-center tracking-[0.25em]" placeholder="1234" dir="ltr" />
              </div>
              {error && <p className="text-xs text-destructive font-arabic">{error}</p>}
              <Button type="submit" className="w-full rounded-xl font-arabic shadow-glow">تأكيد الدخول</Button>
              <Button type="button" variant="secondary" className="w-full rounded-xl font-arabic" onClick={() => setStep("phone")}>تغيير رقم الجوال</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

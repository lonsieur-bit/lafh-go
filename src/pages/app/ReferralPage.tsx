import { ArrowRight, Copy, Gift, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { fetchReferralProgramSettings, useCurrency } from "@luffa/shared";
import { useAppState } from "@/context/AppStateContext";

export default function ReferralPage() {
  const { myReferralCode, referralStats } = useAppState();
  const { format } = useCurrency();

  const { data: program } = useQuery({
    queryKey: ["referral-program"],
    queryFn: fetchReferralProgramSettings,
  });

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(myReferralCode);
    } catch {
      // ignore clipboard issues in unsupported environments
    }
  };

  const description =
    program?.description_ar ?? "اكسب المال عند تسجيل أصدقائك باستخدام كودك";
  const rewardHint =
    program && program.default_reward_sar > 0
      ? `مكافأة ${format(program.default_reward_sar)} لكل تسجيل جديد`
      : null;

  return (
    <div className="h-full bg-background flex flex-col min-h-0" dir="rtl">
      <div className="pt-12 px-5 pb-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Link to="/app/profile" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center" aria-label="عودة">
            <ArrowRight className="w-4 h-4 text-foreground" />
          </Link>
          <div>
            <h1 className="text-lg font-extrabold text-foreground font-arabic">برنامج الإحالة</h1>
            <p className="text-xs text-muted-foreground font-arabic mt-1">{description}</p>
            {rewardHint && (
              <p className="text-xs text-primary font-arabic mt-0.5">{rewardHint}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
        {program && !program.enabled && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 font-arabic">
            برنامج الإحالة متوقف مؤقتًا من الإدارة.
          </div>
        )}

        <div className="bg-gradient-to-l from-primary to-primary/80 rounded-3xl p-4 text-primary-foreground shadow-elevated-lg">
          <p className="text-xs text-primary-foreground/80 font-arabic">كود الإحالة الخاص بك</p>
          <div className="mt-2 flex items-center justify-between bg-primary-foreground/15 rounded-2xl px-3 py-2">
            <span className="font-mono text-lg tracking-wide">{myReferralCode}</span>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="rounded-xl bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              onClick={copyCode}
            >
              <Copy className="w-3.5 h-3.5" />
              نسخ
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-elevated">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-[11px] text-muted-foreground font-arabic">عدد المدعوين</p>
            <p className="text-2xl font-extrabold text-foreground">{referralStats.invitesCount}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 shadow-elevated">
            <div className="w-9 h-9 rounded-full bg-success/10 text-success flex items-center justify-center mb-2">
              <Gift className="w-4 h-4" />
            </div>
            <p className="text-[11px] text-muted-foreground font-arabic">أرباح الإحالة</p>
            <p className="text-2xl font-extrabold text-foreground">{format(referralStats.totalEarnings)}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-elevated">
          <h2 className="text-sm font-extrabold font-arabic mb-2">كيف يعمل البرنامج؟</h2>
          <ul className="space-y-2 text-xs text-muted-foreground font-arabic leading-relaxed">
            <li>1) شارك كودك مع أصدقائك.</li>
            <li>2) عند التسجيل باستخدام الكود، يتم احتساب دعوة جديدة.</li>
            <li>
              3) تربح مكافأة مباشرة على كل مستخدم جديد
              {program ? ` (${format(program.default_reward_sar)}).` : "."}
            </li>
            {program && program.invitee_bonus_sar > 0 && (
              <li>4) يحصل صديقك على مكافأة ترحيب {format(program.invitee_bonus_sar)}.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

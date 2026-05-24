import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CreditCard, Landmark, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppState } from "@/context/AppStateContext";
import { useCurrency } from "@luffa/shared";

const presetAmounts = [25, 50, 100, 200];

type PaymentMethod = "rechargeCard" | "mada" | "mastercard" | "applepay";

const WalletTopUpPage = () => {
  const { topUpWallet, redeemGiftCard, isLoggedIn } = useAppState();
  const { format, symbol } = useCurrency();
  const [amount, setAmount] = useState("50");
  const [method, setMethod] = useState<PaymentMethod>("rechargeCard");
  const [rechargeCode, setRechargeCode] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [redeemedAmount, setRedeemedAmount] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const numericAmount = Number(amount || 0);
  const validAmount = Number.isFinite(numericAmount) && numericAmount > 0;
  const isGiftCard = method === "rechargeCard";

  const handleTopUp = async () => {
    setError("");
    setLoading(true);
    try {
      if (isGiftCard) {
        if (rechargeCode.trim().length < 6) {
          setError("أدخل كود بطاقة الهدية كاملاً");
          return;
        }
        if (!isLoggedIn) {
          setError("سجّل الدخول أولاً لاستخدام بطاقة الهدية");
          return;
        }
        const credited = await redeemGiftCard(rechargeCode);
        setRedeemedAmount(credited);
        setIsDone(true);
        return;
      }
      if (!validAmount) return;
      topUpWallet(numericAmount);
      setRedeemedAmount(numericAmount);
      setIsDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل الشحن");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-background flex flex-col min-h-0" dir="rtl">
      <div className="pt-12 px-5 pb-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/app/wallet"
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
            aria-label="رجوع للمحفظة"
          >
            <ArrowRight className="w-4 h-4 text-foreground" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground font-arabic">شحن الرصيد</h1>
            <p className="text-xs text-muted-foreground font-arabic">
              {isGiftCard ? "أدخل كود بطاقة الهدية" : "أضف رصيدك بطريقة آمنة وسريعة"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
        {!isGiftCard && (
          <div className="bg-card rounded-2xl p-4 shadow-elevated border border-border">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-arabic">المبلغ</p>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <Label htmlFor="topup-amount" className="font-arabic">المبلغ ({symbol})</Label>
              <Input
                id="topup-amount"
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-xl font-mono"
                dir="ltr"
              />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className={`rounded-xl px-2 py-2 text-xs font-semibold border transition-colors ${
                    amount === String(preset)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-secondary-foreground border-border"
                  }`}
                >
                  {format(preset)}
                </button>
              ))}
            </div>
          </div>
        )}

        {isGiftCard && (
          <div className="bg-card rounded-2xl p-4 shadow-elevated border border-border">
            <p className="text-sm font-arabic text-muted-foreground">
              قيمة الشحن تُحدد تلقائياً من البطاقة. يعمل للعملاء والكباتن.
            </p>
          </div>
        )}

        <div className="bg-card rounded-2xl p-4 shadow-elevated border border-border">
          <h2 className="text-sm font-semibold text-foreground font-arabic mb-3">طريقة الدفع</h2>
          <RadioGroup value={method} onValueChange={(v) => { setMethod(v as PaymentMethod); setIsDone(false); setError(""); }} className="space-y-2">
            <label className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3 cursor-pointer">
              <RadioGroupItem value="rechargeCard" id="pay-recharge" />
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="text-sm font-arabic">بطاقة هدية / كرت شحن</span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3 cursor-pointer">
              <RadioGroupItem value="mada" id="pay-mada" />
              <Landmark className="w-4 h-4 text-primary" />
              <span className="text-sm font-arabic">مدى</span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3 cursor-pointer">
              <RadioGroupItem value="mastercard" id="pay-mastercard" />
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="text-sm font-arabic">MasterCard</span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3 cursor-pointer">
              <RadioGroupItem value="applepay" id="pay-apple" />
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-sm font-arabic">Apple Pay</span>
            </label>
          </RadioGroup>
          {isGiftCard && (
            <div className="mt-3 space-y-2">
              <Label htmlFor="recharge-code" className="font-arabic">كود بطاقة الهدية</Label>
              <Input
                id="recharge-code"
                value={rechargeCode}
                onChange={(e) => setRechargeCode(e.target.value.toUpperCase())}
                className="rounded-xl font-mono"
                placeholder="LFG-7599-4233"
                dir="ltr"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive font-arabic">
            {error}
          </div>
        )}

        {isDone && (
          <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success font-arabic">
            تم شحن {format(redeemedAmount)} بنجاح. يمكنك الرجوع للمحفظة لرؤية الرصيد المحدث.
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border bg-card">
        <Button
          type="button"
          onClick={handleTopUp}
          disabled={loading || (!isGiftCard && !validAmount)}
          className="w-full rounded-xl font-arabic shadow-glow"
        >
          {loading ? "جاري المعالجة..." : isGiftCard ? "تفعيل البطاقة" : `تأكيد الشحن ${validAmount ? `(${format(numericAmount)})` : ""}`}
        </Button>
      </div>
    </div>
  );
};

export default WalletTopUpPage;

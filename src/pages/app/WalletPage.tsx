import { Link } from "react-router-dom";
import { ArrowRight, Wallet } from "lucide-react";
import { useCurrency } from "@luffa/shared";
import { useAppState } from "@/context/AppStateContext";

const WalletPage = () => {
  const { walletBalance, walletTransactions, appRole } = useAppState();
  const { format, symbol } = useCurrency();
  const isCaptain = appRole === "captain";

  return (
    <div className="h-full bg-background flex flex-col min-h-0" dir="rtl">
      <div className="pt-12 px-5 pb-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/app" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center" aria-label="عودة">
            <ArrowRight className="w-4 h-4 text-foreground" />
          </Link>
          <h1 className="text-lg font-bold text-foreground font-arabic">المحفظة</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
        <div className="bg-gradient-to-l from-primary to-primary/85 rounded-2xl p-5 text-primary-foreground shadow-elevated relative overflow-hidden">
          <div className="absolute top-0 left-0 w-28 h-28 bg-primary-foreground/10 rounded-full -translate-x-10 -translate-y-10" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs text-primary-foreground/80 font-arabic">الرصيد المتاح</p>
              <p className="text-2xl font-bold font-arabic mt-1">{format(walletBalance)}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary-foreground/15 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <Link
            to="/app/wallet/topup"
            className="mt-4 w-full py-2.5 rounded-xl bg-primary-foreground text-primary text-sm font-semibold font-arabic text-center block"
          >
            {isCaptain ? "سحب / شحن المحفظة" : "شحن الرصيد"}
          </Link>
        </div>

        {isCaptain && (
          <div className="bg-card rounded-2xl p-4 shadow-elevated border border-border">
            <h2 className="text-sm font-semibold text-foreground font-arabic mb-3">ملخص الكابتن</h2>
            <div className="space-y-2 text-sm font-arabic">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">إجمالي الطلبات اليوم</span>
                <span className="font-mono">{format(212)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">صافي الكابتن</span>
                <span className="font-mono text-success">{format(169.6)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">عمولة المنصة</span>
                <span className="font-mono">{format(42.4)}</span>
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-foreground font-arabic mb-2">المعاملات</h2>
          <div className="space-y-2">
            {walletTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground font-arabic text-center py-6">لا توجد معاملات بعد</p>
            ) : (
              walletTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-card rounded-xl p-3 shadow-elevated flex items-center justify-between gap-3 border border-border"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground font-arabic">{tx.title}</p>
                    <p className="text-[11px] text-muted-foreground font-arabic truncate">{tx.subtitle}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-arabic">{tx.time}</p>
                  </div>
                  <span
                    className={`text-sm font-bold font-mono shrink-0 ${
                      tx.positive ? "text-success" : "text-foreground"
                    }`}
                  >
                    {tx.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/context/AppStateContext";
import { useCurrency } from "@luffa/shared";

type PayMethod = "mada" | "mastercard" | "applepay" | "cash" | "wallet";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { bookingDraft, walletBalance } = useAppState();
  const { format } = useCurrency();
  const [method, setMethod] = useState<PayMethod>("mada");
  const [error, setError] = useState("");

  const pay = () => {
    if (method === "wallet" && walletBalance < bookingDraft.total) {
      setError("Wallet balance is not enough. Please top up or choose another payment method.");
      return;
    }
    navigate(`/app/search-captain?method=${method}`);
  };

  return (
    <div className="h-full bg-background flex flex-col" dir="rtl">
      <div className="pt-12 px-5 pb-3 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            to="/app/booking"
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowRight className="w-4 h-4 text-foreground" />
          </Link>
          <h1 className="text-lg font-bold text-foreground font-arabic">Checkout</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
        <div className="bg-card rounded-2xl p-4 shadow-elevated border border-border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-arabic">Trip fare</span>
            <span>{format(bookingDraft.baseFare)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-arabic">Extras</span>
            <span>{format(bookingDraft.extrasTotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-success">
            <span className="font-arabic">Discount</span>
            <span>-{format(bookingDraft.discount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-arabic">VAT</span>
            <span>{format(bookingDraft.vat)}</span>
          </div>
          <div className="pt-2 mt-2 border-t border-border flex justify-between">
            <span className="font-bold font-arabic">Total</span>
            <span className="font-bold text-primary">{format(bookingDraft.total)}</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-elevated border border-border">
          <p className="text-xs text-muted-foreground font-arabic mb-3">Payment method</p>
          <div className="space-y-2">
            {[
              ["mada", "Mada **** 4532"],
              ["mastercard", "MasterCard **** 8891"],
              ["applepay", "Apple Pay"],
              ["cash", "Cash"],
              ["wallet", `محفظة لفة (${format(walletBalance)})`],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMethod(key as PayMethod)}
                className={`w-full rounded-xl p-3 text-right border-2 font-arabic ${
                  method === key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent bg-secondary text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-destructive font-arabic mt-2">{error}</p>}
        </div>
      </div>

      <div className="bg-card border-t border-border px-5 py-4">
        <Button className="w-full rounded-xl font-arabic shadow-glow" onClick={pay}>
          Confirm request and search captain
        </Button>
      </div>
    </div>
  );
}

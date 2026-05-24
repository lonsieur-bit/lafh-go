import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoaderCircle, RefreshCcw, UserRoundSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/context/AppStateContext";

type SearchStatus = "searching" | "busy";

export default function SearchCaptainPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { addOrderFromCheckout } = useAppState();
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [status, setStatus] = useState<SearchStatus>("searching");

  useEffect(() => {
    if (status !== "searching") return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setStatus("busy");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status !== "searching") return;
    // Simulate a captain being found before timeout.
    const foundTimer = window.setTimeout(() => {
      const method = (params.get("method") ?? "mada") as "mada" | "applepay" | "cash" | "wallet";
      const orderId = addOrderFromCheckout(method);
      navigate(`/app/orders/${orderId}`);
    }, 9000);
    return () => window.clearTimeout(foundTimer);
  }, [status, params, addOrderFromCheckout, navigate]);

  const mmss = useMemo(() => {
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const ss = String(secondsLeft % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [secondsLeft]);

  return (
    <div className="h-full bg-background flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      {status === "searching" ? (
        <>
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <LoaderCircle className="w-8 h-8 animate-spin" />
          </div>
          <h1 className="text-xl font-extrabold font-arabic mb-2">البحث عن كابتن متاح</h1>
          <p className="text-sm text-muted-foreground font-arabic mb-4">
            جاري مطابقة طلبك مع أقرب كابتن مناسب
          </p>
          <div className="rounded-xl bg-card border border-border px-4 py-2 font-mono text-lg">
            {mmss}
          </div>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-warning/10 text-warning flex items-center justify-center mb-4">
            <UserRoundSearch className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold font-arabic mb-2">الكباتن مشغولون مع ركاب آخرين</h1>
          <p className="text-sm text-muted-foreground font-arabic mb-5">
            لم يتم العثور على كابتن خلال دقيقتين. يمكنك إعادة المحاولة الآن.
          </p>
          <Button
            type="button"
            className="rounded-xl font-arabic shadow-glow"
            onClick={() => {
              setStatus("searching");
              setSecondsLeft(120);
            }}
          >
            <RefreshCcw className="w-4 h-4 ml-1" />
            إعادة البحث
          </Button>
        </>
      )}
    </div>
  );
}


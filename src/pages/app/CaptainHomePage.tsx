import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BellRing, Power, Wallet } from "lucide-react";
import { useAppState } from "@/context/AppStateContext";

export default function CaptainHomePage() {
  const {
    captainOnline,
    setCaptainOnline,
    offlineAlertsEnabled,
    setOfflineAlertsEnabled,
    nearbyCaptainRequest,
    acceptNearbyCaptainRequest,
  } = useAppState();
  const startX = useRef<number | null>(null);

  const handlePointerDown = (x: number) => {
    startX.current = x;
  };

  const handlePointerUp = (x: number) => {
    if (startX.current == null) return;
    const delta = x - startX.current;
    if (Math.abs(delta) > 80) {
      setCaptainOnline(false);
    }
    startX.current = null;
  };

  return (
    <div className="h-full bg-background flex flex-col min-h-0" dir="rtl">
      <div className="pt-12 px-5 pb-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Link to="/app" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center" aria-label="عودة">
            <ArrowRight className="w-4 h-4 text-foreground" />
          </Link>
          <div>
            <h1 className="text-lg font-extrabold font-arabic">وضع الكابتن</h1>
            <p className="text-xs text-muted-foreground font-arabic mt-1">
              تشغيل/إيقاف الاستقبال من نفس التطبيق
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 py-5 flex flex-col items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => setCaptainOnline(true)}
          className={`w-40 h-40 rounded-full border-[10px] shadow-elevated-lg flex flex-col items-center justify-center transition-all ${
            captainOnline
              ? "bg-success/10 border-success text-success"
              : "bg-primary/10 border-primary text-primary"
          }`}
        >
          <Power className="w-10 h-10 mb-2" />
          <span className="text-base font-extrabold font-arabic">
            {captainOnline ? "قيد التشغيل" : "تشغيل"}
          </span>
        </button>

        <div
          className="w-full max-w-[280px] rounded-2xl bg-card border border-border p-3 select-none"
          onPointerDown={(e) => handlePointerDown(e.clientX)}
          onPointerUp={(e) => handlePointerUp(e.clientX)}
        >
          <div className="w-full h-10 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold font-arabic text-muted-foreground">
            اسحب يمين أو يسار للإيقاف
          </div>
        </div>

        <div className="w-full max-w-[300px] rounded-2xl bg-card border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-arabic">إشعار الطلبات القريبة</span>
            <label className="inline-flex items-center gap-2 text-[11px] font-semibold font-arabic cursor-pointer">
              <input
                type="checkbox"
                checked={offlineAlertsEnabled}
                onChange={(e) => setOfflineAlertsEnabled(e.target.checked)}
              />
              {offlineAlertsEnabled ? "مفعل" : "موقوف"}
            </label>
          </div>
          <p className="text-xs text-muted-foreground font-arabic">
            حتى عند الإيقاف، يصل تنبيه هادئ بطلب قريب ويمكنك القبول ثم يتم تشغيلك تلقائياً.
          </p>
          {nearbyCaptainRequest && offlineAlertsEnabled && !captainOnline && (
            <div className="pt-2 border-t border-border space-y-2 text-xs font-arabic">
              <p className="font-semibold text-foreground">طلب قريب — {nearbyCaptainRequest.distanceKm} كم</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1"><Wallet className="w-3.5 h-3.5" /> إجمالي الطلب</span>
                <span className="font-mono">{nearbyCaptainRequest.fareTotal.toFixed(2)} ر.س</span>
              </div>
              <div className="flex items-center justify-between">
                <span>صافي الكابتن</span>
                <span className="font-mono text-success">{nearbyCaptainRequest.captainNet.toFixed(2)} ر.س</span>
              </div>
              <button
                type="button"
                className="w-full rounded-xl bg-primary text-primary-foreground py-2 font-bold"
                onClick={acceptNearbyCaptainRequest}
              >
                قبول الطلب والتشغيل تلقائياً
              </button>
            </div>
          )}
        </div>

        {!captainOnline && (
          <div className="inline-flex items-center gap-2 rounded-full bg-warning/10 text-warning px-3 py-1 text-xs font-arabic">
            <BellRing className="w-3.5 h-3.5" />
            وضع أوفلاين
          </div>
        )}
      </div>
    </div>
  );
}


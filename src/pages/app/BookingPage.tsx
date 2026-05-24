import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Calendar, Clock, Plus, X } from "lucide-react";
import {
  calculateTripFare,
  fetchServicePricingMap,
  SERVICE_TYPE_LABELS,
  type ServiceType,
} from "@luffa/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppState } from "@/context/AppStateContext";
import { useCurrency } from "@luffa/shared";

const serviceKeys: ServiceType[] = ["regular", "premium", "family", "bike", "cargo", "tow"];

export default function BookingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { bookingDraft, setBookingDraft } = useAppState();
  const { format } = useCurrency();
  const [serviceType, setServiceType] = useState<ServiceType>("regular");
  const [now, setNow] = useState(true);
  const [bags, setBags] = useState(true);
  const [roundTrip, setRoundTrip] = useState(false);
  const [distanceKm, setDistanceKm] = useState(5);
  const [waitMinutes, setWaitMinutes] = useState(0);
  const [destinations, setDestinations] = useState<string[]>(["مطار الملك خالد الدولي"]);
  const [allowNoDestination, setAllowNoDestination] = useState(false);

  const { data: pricingMap } = useQuery({
    queryKey: ["service-pricing"],
    queryFn: fetchServicePricingMap,
  });

  useEffect(() => {
    const queryService = params.get("service");
    if (queryService && serviceKeys.includes(queryService as ServiceType)) {
      setServiceType(queryService as ServiceType);
      return;
    }
    setServiceType(bookingDraft.serviceType);
  }, [params, bookingDraft.serviceType]);

  useEffect(() => {
    const destination = params.get("destination")?.trim();
    if (!destination) return;
    setDestinations([destination]);
    setAllowNoDestination(false);
  }, [params]);

  const pricing = pricingMap?.[serviceType];

  const total = useMemo(() => {
    if (!pricing) {
      return { base: 25, extras: 0, discount: 0, vat: 0, total: 25, breakdown: null };
    }
    const extraStops = Math.max(0, destinations.length - 1) * 4;
    const extras = (bags ? 5 : 0) + (roundTrip ? 40 : 0) + extraStops;
    const breakdown = calculateTripFare(pricing, { distanceKm, waitMinutes, extrasSar: extras });
    const beforeTax = breakdown.total;
    const discount = Math.round(beforeTax * 0.2 * 100) / 100;
    const vat = Math.round((beforeTax - discount) * 0.15 * 100) / 100;
    const finalTotal = Math.round((beforeTax - discount + vat) * 100) / 100;
    return {
      base: breakdown.doorFee + breakdown.kmCharge + breakdown.waitCharge,
      extras: breakdown.extras,
      discount,
      vat,
      total: finalTotal,
      breakdown,
    };
  }, [pricing, bags, roundTrip, destinations.length, distanceKm, waitMinutes]);

  const onContinue = () => {
    setBookingDraft({
      serviceType,
      baseFare: total.base,
      extrasTotal: total.extras,
      discount: total.discount,
      vat: total.vat,
      total: total.total,
    });
    if (serviceType === "cargo" || serviceType === "tow") {
      navigate("/app/cargo-request");
      return;
    }
    navigate("/app/checkout");
  };

  const addDestination = () => {
    if (destinations.length >= 5) return;
    setDestinations((prev) => [...prev, "وجهة جديدة"]);
  };

  const removeDestination = (idx: number) => {
    setDestinations((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="h-full bg-background flex flex-col" dir="rtl">
      <div className="pt-12 px-5 pb-3 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <Link to="/app" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center" aria-label="عودة">
            <ArrowRight className="w-4 h-4 text-foreground" />
          </Link>
          <h1 className="text-lg font-bold text-foreground font-arabic">حجز رحلة</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
        <div className="bg-card rounded-2xl p-4 shadow-elevated border border-border">
          <p className="text-xs text-muted-foreground font-arabic mb-3">نوع الخدمة</p>
          <div className="grid grid-cols-2 gap-2">
            {serviceKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setServiceType(key)}
                className={`rounded-xl p-2.5 border-2 text-xs font-arabic ${
                  serviceType === key ? "border-primary bg-primary/10" : "border-transparent bg-secondary"
                }`}
              >
                {pricingMap?.[key]?.label_ar ?? SERVICE_TYPE_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-elevated border border-border">
          <p className="text-xs text-muted-foreground font-arabic mb-3">الوجهات (حد أقصى 5)</p>
          <div className="space-y-2">
            <div className="rounded-xl bg-secondary px-3 py-2 text-sm font-arabic">نقطة الانطلاق: حي النخيل</div>
            {!allowNoDestination &&
              destinations.map((d, idx) => (
                <div key={`${d}-${idx}`} className="rounded-xl bg-secondary px-3 py-2 text-sm font-arabic flex items-center justify-between">
                  <span>
                    {idx + 1}. {d}
                  </span>
                  {destinations.length > 1 && (
                    <button type="button" onClick={() => removeDestination(idx)} className="text-muted-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addDestination}
                disabled={allowNoDestination || destinations.length >= 5}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary font-arabic disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                إضافة وجهة
              </button>
              <label className="mr-auto text-xs font-arabic flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={allowNoDestination} onChange={(e) => setAllowNoDestination(e.target.checked)} />
                بدون وجهة
              </label>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-elevated border border-border space-y-3">
          <p className="text-xs text-muted-foreground font-arabic">تقدير المسافة والانتظار</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-arabic">المسافة (كم)</Label>
              <Input
                type="number"
                min={0}
                step={0.1}
                dir="ltr"
                className="mt-1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label className="text-xs font-arabic">انتظار (دقيقة)</Label>
              <Input
                type="number"
                min={0}
                step={1}
                dir="ltr"
                className="mt-1"
                value={waitMinutes}
                onChange={(e) => setWaitMinutes(Number(e.target.value) || 0)}
              />
            </div>
          </div>
          {pricing && total.breakdown && (
            <div className="rounded-xl bg-secondary/80 p-3 text-xs font-arabic space-y-1">
              <div className="flex justify-between">
                <span>فتحة باب</span>
                <span dir="ltr">{format(total.breakdown.doorFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  المسافة ({distanceKm} كم × {pricing.km_rate_sar})
                </span>
                <span dir="ltr">{format(total.breakdown.kmCharge)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  انتظار ({waitMinutes} د × {pricing.wait_minute_rate_sar})
                </span>
                <span dir="ltr">{format(total.breakdown.waitCharge)}</span>
              </div>
              {total.breakdown.total > total.breakdown.subtotal && (
                <div className="flex justify-between text-primary">
                  <span>الحد الأدنى</span>
                  <span dir="ltr">{format(pricing.min_fare_sar)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-elevated border border-border">
          <p className="text-xs text-muted-foreground font-arabic mb-3">الموعد</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setNow(true)}
              className={`rounded-xl p-3 border-2 ${now ? "border-primary bg-primary/10" : "border-transparent bg-secondary"}`}
            >
              <Clock className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-xs font-arabic">الآن</p>
            </button>
            <button
              type="button"
              onClick={() => setNow(false)}
              className={`rounded-xl p-3 border-2 ${!now ? "border-primary bg-primary/10" : "border-transparent bg-secondary"}`}
            >
              <Calendar className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs font-arabic">جدولة لاحقاً</p>
            </button>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-elevated border border-border space-y-2">
          <p className="text-xs text-muted-foreground font-arabic mb-1">إضافات</p>
          <label className="flex items-center justify-between text-sm font-arabic cursor-pointer">
            <span>حقائب إضافية</span>
            <input type="checkbox" checked={bags} onChange={(e) => setBags(e.target.checked)} />
          </label>
          <label className="flex items-center justify-between text-sm font-arabic cursor-pointer">
            <span>رحلة ذهاب وعودة</span>
            <input type="checkbox" checked={roundTrip} onChange={(e) => setRoundTrip(e.target.checked)} />
          </label>
        </div>
      </div>

      <div className="bg-card border-t border-border px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground font-arabic">الإجمالي</span>
          <span className="text-lg font-bold text-foreground font-arabic">{format(total.total)}</span>
        </div>
        <Button className="w-full rounded-xl font-arabic shadow-glow" onClick={onContinue}>
          {serviceType === "cargo" || serviceType === "tow" ? "متابعة طلب الشحن" : "المتابعة للدفع"}
        </Button>
      </div>
    </div>
  );
}

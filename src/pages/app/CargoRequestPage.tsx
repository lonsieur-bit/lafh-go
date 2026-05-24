import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSessionUserId, isSupabaseReady, submitCargoRequest } from "@luffa/shared";

export default function CargoRequestPage() {
  const navigate = useNavigate();
  const [cargoType, setCargoType] = useState("أثاث منزلي");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [withLoading, setWithLoading] = useState(true);
  const [price, setPrice] = useState("");

  return (
    <div className="h-full bg-background flex flex-col min-h-0" dir="rtl">
      <div className="pt-12 px-5 pb-3 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <Link to="/app/booking" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center" aria-label="عودة">
            <ArrowRight className="w-4 h-4 text-foreground" />
          </Link>
          <h1 className="text-lg font-bold text-foreground font-arabic">طلب نقل بضائع / سطحة</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
        <div className="bg-card rounded-2xl border border-border p-4 shadow-elevated space-y-3">
          <div>
            <Label className="font-arabic mb-2 inline-block">نوع الحمولة</Label>
            <Input value={cargoType} onChange={(e) => setCargoType(e.target.value)} className="rounded-xl font-arabic" />
          </div>
          <div>
            <Label className="font-arabic mb-2 inline-block">ملاحظات</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-arabic min-h-[90px]"
              placeholder="اكتب تفاصيل الحمولة وأي ملاحظات مهمة"
            />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 shadow-elevated space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="font-arabic mb-2 inline-block">تاريخ التحميل</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl" />
            </div>
            <div>
              <Label className="font-arabic mb-2 inline-block">وقت التحميل</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-xl" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2">
            <span className="text-sm font-arabic">مع التحميل / التنزيل</span>
            <input type="checkbox" checked={withLoading} onChange={(e) => setWithLoading(e.target.checked)} />
          </div>
          <div>
            <Label className="font-arabic mb-2 inline-block">السعر المقترح لنقل البضائع (اختياري)</Label>
            <div className="flex overflow-hidden rounded-xl border border-border bg-secondary">
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                className="flex-1 rounded-none border-0 bg-transparent font-mono text-center shadow-none focus-visible:ring-0"
                dir="ltr"
                inputMode="decimal"
                placeholder="0"
              />
              <span className="flex items-center border-s border-border bg-card px-4 text-sm text-muted-foreground">
                ر.س
              </span>
            </div>
            <p className="mt-1.5 text-right text-xs text-muted-foreground font-arabic">
              بالريال السعودي — أدخل المبلغ فقط
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card border-t border-border px-5 py-4">
        <Button
          className="w-full rounded-xl font-arabic shadow-glow"
          onClick={async () => {
            if (isSupabaseReady()) {
              const uid = await getSessionUserId();
              if (uid) {
                await submitCargoRequest({
                  riderId: uid,
                  from: "حي الياسمين",
                  to: "وجهة العميل",
                  description: `${cargoType}${notes ? ` — ${notes}` : ""}${price ? ` — ${price} ر.س` : ""}`,
                });
              }
            }
            navigate("/app/checkout");
          }}
        >
          متابعة الطلب
        </Button>
      </div>
    </div>
  );
}


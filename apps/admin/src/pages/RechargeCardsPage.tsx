import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  buildBatchCsv,
  downloadCsv,
  fetchGiftCardBatches,
  fetchGiftCards,
  generateGiftCardBatch,
  revokeGiftCard,
} from "@luffa/shared";
import type { GiftCardBatch, RechargeCardStatus } from "@luffa/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useCurrency } from "@luffa/shared";

const PRESET_AMOUNTS = [25, 50, 100, 200];
type Tab = "generate" | "codes";

export default function RechargeCardsPage() {
  const { format, symbol } = useCurrency();
  const { canAccess } = useAdminAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("generate");

  const [amount, setAmount] = useState(50);
  const [batchSize, setBatchSize] = useState(10);
  const [batchLabel, setBatchLabel] = useState("");

  const [filterBatchId, setFilterBatchId] = useState("");
  const [filterStatus, setFilterStatus] = useState<RechargeCardStatus | "">("");

  const { data: batches = [] } = useQuery({
    queryKey: ["gift-batches"],
    queryFn: () => fetchGiftCardBatches(),
  });

  const cardFilters = useMemo(
    () => ({
      batchId: filterBatchId || undefined,
      status: filterStatus || undefined,
    }),
    [filterBatchId, filterStatus],
  );

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["gift-cards", cardFilters],
    queryFn: () => fetchGiftCards(cardFilters),
  });

  const generate = useMutation({
    mutationFn: () =>
      generateGiftCardBatch({
        amount,
        count: batchSize,
        label: batchLabel || `دفعة ${new Date().toLocaleDateString("ar-SA")}`,
      }),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["gift-cards"] });
      qc.invalidateQueries({ queryKey: ["gift-batches"] });
      toast.success(`تم توليد ${result.cards.length} بطاقة`);
      setFilterBatchId(result.batch.id);
      setTab("codes");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revoke = useMutation({
    mutationFn: revokeGiftCard,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gift-cards"] }),
  });

  const stats = useMemo(() => {
    const unused = cards.filter((c) => c.status === "new");
    const used = cards.filter((c) => c.status === "used");
    return {
      total: cards.length,
      unused: unused.length,
      used: used.length,
      unusedValue: unused.reduce((s, c) => s + Number(c.amount_sar), 0),
    };
  }, [cards]);

  const handleExportBatch = () => {
    if (!filterBatchId) {
      toast.error("اختر دفعة للتصدير");
      return;
    }
    const batch = batches.find((b) => b.id === filterBatchId);
    if (!batch) return;
    const batchCards = cards.filter((c) => c.batch_id === filterBatchId);
    const csv = buildBatchCsv(batchCards, batch);
    downloadCsv(`luffa-gift-cards-${batch.label.replace(/\s+/g, "-")}.csv`, csv);
    toast.success("تم تنزيل الملف");
  };

  if (!canAccess("cards")) return <p>ليس لديك صلاحية</p>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-extrabold">بطاقات الهدايا</h2>
        <p className="text-sm text-muted-foreground">توليد أكواد شحن — يستخدمها العملاء والكباتن في المحفظة</p>
      </div>

      <div className="flex gap-2 border-b border-border pb-2">
        {(
          [
            ["generate", "توليد دفعة"],
            ["codes", "الأكواد والتصدير"],
          ] as const
        ).map(([key, label]) => (
          <Button key={key} variant={tab === key ? "default" : "ghost"} size="sm" onClick={() => setTab(key)}>
            {label}
          </Button>
        ))}
      </div>

      {tab === "generate" && (
        <div className="rounded-2xl border bg-card p-4 space-y-4 max-w-2xl">
          <div>
            <Label>اسم الدفعة</Label>
            <Input
              value={batchLabel}
              onChange={(e) => setBatchLabel(e.target.value)}
              placeholder="مارس 2026"
              className="mt-1"
            />
          </div>
          <div>
            <Label>قيمة البطاقة ({symbol})</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {PRESET_AMOUNTS.map((p) => (
                <Button key={p} type="button" size="sm" variant={amount === p ? "default" : "outline"} onClick={() => setAmount(p)}>
                  {p}
                </Button>
              ))}
            </div>
            <Input type="number" className="mt-2" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </div>
          <div>
            <Label>عدد البطاقات</Label>
            <Input
              type="number"
              className="mt-1"
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              min={1}
              max={500}
            />
          </div>
          <Button className="w-full" onClick={() => generate.mutate()} disabled={batchSize < 1 || generate.isPending}>
            {generate.isPending ? "جاري التوليد..." : `توليد ${batchSize} بطاقة`}
          </Button>
        </div>
      )}

      {tab === "codes" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border bg-card p-3 text-sm">
              <span className="text-muted-foreground">الإجمالي</span>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
            <div className="rounded-xl border bg-card p-3 text-sm">
              <span className="text-muted-foreground">غير مستخدمة</span>
              <p className="text-xl font-bold">{stats.unused}</p>
            </div>
            <div className="rounded-xl border bg-card p-3 text-sm">
              <span className="text-muted-foreground">مستخدمة</span>
              <p className="text-xl font-bold">{stats.used}</p>
            </div>
            <div className="rounded-xl border bg-card p-3 text-sm">
              <span className="text-muted-foreground">قيمة غير مستخدمة</span>
              <p className="text-xl font-bold">{format(stats.unusedValue)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <Label className="text-xs">دفعة</Label>
              <select
                className="h-9 rounded-md border px-2 text-sm min-w-[160px]"
                value={filterBatchId}
                onChange={(e) => setFilterBatchId(e.target.value)}
              >
                <option value="">الكل</option>
                {batches.map((b: GiftCardBatch) => (
                  <option key={b.id} value={b.id}>
                    {b.label} ({b.quantity})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">الحالة</Label>
              <select
                className="h-9 rounded-md border px-2 text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as RechargeCardStatus | "")}
              >
                <option value="">الكل</option>
                <option value="new">جديد</option>
                <option value="used">مستخدم</option>
              </select>
            </div>
            <Button variant="secondary" onClick={handleExportBatch} disabled={!filterBatchId}>
              تصدير CSV
            </Button>
          </div>

          {isLoading ? (
            <p>جاري التحميل...</p>
          ) : (
            <div className="rounded-2xl border overflow-hidden bg-card max-h-[480px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-right p-3">الكود</th>
                    <th className="text-right p-3">المبلغ</th>
                    <th className="text-right p-3">الدفعة</th>
                    <th className="text-right p-3">الحالة</th>
                    <th className="text-right p-3" />
                  </tr>
                </thead>
                <tbody>
                  {cards.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="p-3">
                        <button
                          type="button"
                          className="font-mono text-left"
                          dir="ltr"
                          onClick={() => {
                            navigator.clipboard.writeText(c.code);
                            toast.success("تم النسخ");
                          }}
                        >
                          {c.code}
                        </button>
                      </td>
                      <td className="p-3">{format(c.amount_sar)}</td>
                      <td className="p-3 text-xs">{c.batch?.label ?? "—"}</td>
                      <td className="p-3">
                        <Badge variant={c.status === "new" ? "success" : "secondary"}>
                          {c.status === "new" ? "جديد" : "مستخدم"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {c.status === "new" && (
                          <Button size="sm" variant="destructive" onClick={() => revoke.mutate(c.id)}>
                            إلغاء
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

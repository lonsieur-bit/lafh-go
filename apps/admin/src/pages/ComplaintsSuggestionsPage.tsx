import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchSupportSubmissionsAdmin,
  isComplaintOrSuggestion,
  SUPPORT_CATEGORY_LABELS,
  supportConfig,
  updateSupportSubmissionAdmin,
  type SupportSubmissionRow,
  type SupportSubmissionStatus,
} from "@luffa/shared";
import { AdminAccessGate } from "@/components/AdminAccessGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, Mail, MessageSquare, Phone } from "lucide-react";

const statusLabels: Record<SupportSubmissionStatus, string> = {
  new: "جديد",
  read: "مقروء",
  resolved: "تم الحل",
};

function categoryLabel(category: string): string {
  return SUPPORT_CATEGORY_LABELS[category as keyof typeof SUPPORT_CATEGORY_LABELS] ?? category;
}

export default function ComplaintsSuggestionsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"complaints" | "all">("complaints");
  const [selected, setSelected] = useState<SupportSubmissionRow | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<SupportSubmissionStatus>("new");

  const { data: list = [], isLoading } = useQuery({
    queryKey: ["admin-support-submissions"],
    queryFn: () => fetchSupportSubmissionsAdmin(300),
  });

  const filtered = useMemo(() => {
    if (tab === "all") return list;
    return list.filter((r) => isComplaintOrSuggestion(r.category));
  }, [list, tab]);

  const openRow = (row: SupportSubmissionRow) => {
    setSelected(row);
    setNotes(row.admin_notes ?? "");
    setStatus(row.status);
  };

  const save = useMutation({
    mutationFn: () => {
      if (!selected) return Promise.resolve();
      return updateSupportSubmissionAdmin(selected.id, { status, admin_notes: notes.trim() || null });
    },
    onSuccess: () => {
      toast.success("تم الحفظ");
      void qc.invalidateQueries({ queryKey: ["admin-support-submissions"] });
      setSelected(null);
    },
    onError: () => toast.error("تعذّر الحفظ"),
  });

  return (
    <AdminAccessGate perm="all">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold">شكاوى وإقتراحات</h2>
          <p className="text-sm text-muted-foreground mt-1">رسائل نموذج التواصل من تطبيق الجوال</p>
        </div>

        <div className="rounded-2xl border bg-card p-5 grid gap-4 md:grid-cols-3">
          <div className="flex gap-3 items-start">
            <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-1">العنوان</p>
              <p className="text-sm leading-relaxed">{supportConfig.addressAr}</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-1">البريد</p>
              <a href={`mailto:${supportConfig.email}`} className="text-sm text-primary font-mono" dir="ltr">
                {supportConfig.email}
              </a>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-1">واتساب الدعم</p>
              <a
                href={`https://wa.me/${supportConfig.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary font-mono"
                dir="ltr"
              >
                {supportConfig.whatsappLabel}
              </a>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant={tab === "complaints" ? "default" : "outline"} size="sm" onClick={() => setTab("complaints")}>
            شكاوى واقتراحات فقط
          </Button>
          <Button variant={tab === "all" ? "default" : "outline"} size="sm" onClick={() => setTab("all")}>
            كل الرسائل
          </Button>
        </div>

        <div className="rounded-2xl border overflow-hidden bg-card">
          {isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">جارٍ التحميل...</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">لا توجد رسائل بعد.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-right p-3">النوع</th>
                  <th className="text-right p-3">الاسم</th>
                  <th className="text-right p-3">الموضوع</th>
                  <th className="text-right p-3">الحالة</th>
                  <th className="text-right p-3">التاريخ</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t hover:bg-muted/30">
                    <td className="p-3">
                      <span
                        className={
                          row.category === "complaint"
                            ? "text-destructive font-semibold"
                            : row.category === "suggestion"
                              ? "text-primary font-semibold"
                              : ""
                        }
                      >
                        {categoryLabel(row.category)}
                      </span>
                    </td>
                    <td className="p-3">{row.name}</td>
                    <td className="p-3 text-muted-foreground max-w-[200px] truncate">
                      {row.subject || row.message.slice(0, 40)}
                    </td>
                    <td className="p-3">{statusLabels[row.status]}</td>
                    <td className="p-3 text-xs whitespace-nowrap">
                      {new Date(row.created_at).toLocaleString("ar-SA")}
                    </td>
                    <td className="p-3">
                      <Button size="sm" variant="outline" onClick={() => openRow(row)}>
                        عرض
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected ? (
          <div className="rounded-2xl border bg-card p-5 max-w-2xl space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-bold">تفاصيل الرسالة</h3>
            </div>
            <div className="grid gap-2 text-sm">
              <p>
                <span className="text-muted-foreground">النوع: </span>
                {categoryLabel(selected.category)}
              </p>
              <p>
                <span className="text-muted-foreground">الاسم: </span>
                {selected.name}
              </p>
              {selected.phone ? (
                <p dir="ltr" className="text-left">
                  <span className="text-muted-foreground">الجوال: </span>
                  {selected.phone}
                </p>
              ) : null}
              {selected.subject ? (
                <p>
                  <span className="text-muted-foreground">الموضوع: </span>
                  {selected.subject}
                </p>
              ) : null}
              <p className="whitespace-pre-wrap leading-relaxed bg-muted/40 rounded-lg p-3">{selected.message}</p>
            </div>
            <div className="space-y-2">
              <Label>حالة المتابعة</Label>
              <select
                className="w-full h-10 rounded-md border px-3"
                value={status}
                onChange={(e) => setStatus(e.target.value as SupportSubmissionStatus)}
              >
                {(Object.keys(statusLabels) as SupportSubmissionStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>ملاحظات داخلية</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات للفريق..." />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => save.mutate()} disabled={save.isPending}>
                حفظ
              </Button>
              <Button variant="ghost" onClick={() => setSelected(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </AdminAccessGate>
  );
}

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { broadcastNotification, fetchAllNotificationsAdmin, notifyProfileAdmin } from "@luffa/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AdminAccessGate } from "@/components/AdminAccessGate";

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [segment, setSegment] = useState<"all" | "rider" | "captain">("all");
  const [targetUserId, setTargetUserId] = useState("");

  const { data: list = [] } = useQuery({ queryKey: ["admin-notifications"], queryFn: () => fetchAllNotificationsAdmin(50) });

  const send = useMutation({
    mutationFn: () => {
      if (targetUserId.trim()) {
        return notifyProfileAdmin(targetUserId.trim(), title, body).then(() => 1);
      }
      return broadcastNotification({
        title,
        body,
        role: segment === "all" ? undefined : segment,
      });
    },
    onSuccess: (count) => toast.success(targetUserId.trim() ? "تم الإرسال للمستخدم" : `تم الإرسال إلى ${count} مستخدم`),
  });

  return (
    <AdminAccessGate perm="all">
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold">الإشعارات</h2>
      <div className="rounded-2xl border bg-card p-4 max-w-lg space-y-3">
        <h3 className="font-bold">بث إشعار</h3>
        <div className="space-y-2">
          <Label>العنوان</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>المحتوى</Label>
          <Input value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>معرّف مستخدم (اختياري — إرسال لشخص واحد)</Label>
          <Input
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            placeholder="UUID"
            dir="ltr"
            className="font-mono text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label>الفئة</Label>
          <select className="w-full h-10 rounded-md border px-3" value={segment} onChange={(e) => setSegment(e.target.value as typeof segment)}>
            <option value="all">الجميع</option>
            <option value="rider">العملاء</option>
            <option value="captain">الكباتن</option>
          </select>
        </div>
        <Button onClick={() => send.mutate()} disabled={!title || !body}>إرسال</Button>
      </div>
      <div className="rounded-2xl border overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-right p-3">العنوان</th>
              <th className="text-right p-3">المحتوى</th>
              <th className="text-right p-3">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {list.map((n) => (
              <tr key={n.id} className="border-t">
                <td className="p-3">{n.title}</td>
                <td className="p-3 text-muted-foreground">{n.body}</td>
                <td className="p-3 text-xs">{new Date(n.created_at).toLocaleString("ar-SA")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </AdminAccessGate>
  );
}

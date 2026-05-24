import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adjustWalletAdmin, fetchAllProfilesAdmin, fetchAllWalletsAdmin } from "@luffa/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCurrency } from "@luffa/shared";
import { AdminAccessGate } from "@/components/AdminAccessGate";

export default function WalletPage() {
  const { format } = useCurrency();
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();
  const [profileId, setProfileId] = useState(searchParams.get("profileId") ?? "");

  useEffect(() => {
    const id = searchParams.get("profileId");
    if (id) setProfileId(id);
  }, [searchParams]);
  const [delta, setDelta] = useState(0);
  const [note, setNote] = useState("");

  const { data: wallets = [] } = useQuery({ queryKey: ["admin-wallets"], queryFn: fetchAllWalletsAdmin });
  const { data: profiles = [] } = useQuery({ queryKey: ["admin-users"], queryFn: fetchAllProfilesAdmin });

  const profileMap = new Map(profiles.map((p) => [p.id, p.display_name ?? p.id]));

  const mutate = useMutation({
    mutationFn: () => adjustWalletAdmin(profileId, delta, note || "تعديل إداري"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-wallets"] });
      toast.success("تم تعديل الرصيد");
      setDelta(0);
      setNote("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminAccessGate perm="all">
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold">المحفظة</h2>

      <div className="rounded-2xl border border-border bg-card p-4 space-y-3 max-w-lg">
        <h3 className="font-bold">تعديل رصيد</h3>
        <div className="space-y-2">
          <Label>المستخدم</Label>
          <select className="w-full h-10 rounded-md border border-input px-3 text-sm" value={profileId} onChange={(e) => setProfileId(e.target.value)}>
            <option value="">اختر مستخدمًا</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{profileMap.get(p.id)}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>المبلغ (+/-)</Label>
          <Input type="number" value={delta} onChange={(e) => setDelta(Number(e.target.value))} dir="ltr" />
        </div>
        <div className="space-y-2">
          <Label>ملاحظة</Label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <Button onClick={() => mutate.mutate()} disabled={!profileId || delta === 0}>تطبيق</Button>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-right p-3">المستخدم</th>
              <th className="text-right p-3">الرصيد</th>
            </tr>
          </thead>
          <tbody>
            {wallets.map((w) => (
              <tr key={w.profile_id} className="border-t border-border">
                <td className="p-3">{profileMap.get(w.profile_id) ?? w.profile_id}</td>
                <td className="p-3 font-mono">{format(Number(w.balance_sar))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </AdminAccessGate>
  );
}

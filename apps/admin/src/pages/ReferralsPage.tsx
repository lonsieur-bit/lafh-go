import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createReferralAdmin,
  deleteReferralAdmin,
  fetchAllProfilesAdmin,
  fetchReferralProgramSettings,
  fetchReferralsAdmin,
  updateProfileReferralCode,
  updateReferralAdmin,
  updateReferralProgramSettings,
  type ReferralRow,
  isStaffRole,
} from "@luffa/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useCurrency } from "@luffa/shared";
import { AdminAccessGate } from "@/components/AdminAccessGate";

export default function ReferralsPage() {
  const { profile } = useAdminAuth();
  const isAdmin = profile?.role === "admin";
  const canManage = profile != null && isStaffRole(profile.role);
  const { format, symbol } = useCurrency();
  const qc = useQueryClient();

  const [inviterId, setInviterId] = useState("");
  const [inviteeId, setInviteeId] = useState("");
  const [newReward, setNewReward] = useState("25");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editReward, setEditReward] = useState("");
  const [codeProfileId, setCodeProfileId] = useState("");
  const [newReferralCode, setNewReferralCode] = useState("");

  const [defaultReward, setDefaultReward] = useState("25");
  const [inviteeBonus, setInviteeBonus] = useState("0");
  const [enabled, setEnabled] = useState(true);
  const [description, setDescription] = useState("");

  const { data: program, isLoading: programLoading } = useQuery({
    queryKey: ["referral-program"],
    queryFn: fetchReferralProgramSettings,
  });

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ["admin-referrals"],
    queryFn: fetchReferralsAdmin,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAllProfilesAdmin,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-referrals"] });
    qc.invalidateQueries({ queryKey: ["referral-program"] });
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const saveProgram = useMutation({
    mutationFn: () =>
      updateReferralProgramSettings({
        default_reward_sar: Number(defaultReward),
        invitee_bonus_sar: Number(inviteeBonus),
        enabled,
        description_ar: description || null,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("تم حفظ إعدادات البرنامج");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addReferral = useMutation({
    mutationFn: () =>
      createReferralAdmin({
        inviterId,
        inviteeId,
        rewardSar: Number(newReward),
      }),
    onSuccess: () => {
      invalidate();
      setInviterId("");
      setInviteeId("");
      toast.success("تمت إضافة الإحالة");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveReferral = useMutation({
    mutationFn: (id: string) => updateReferralAdmin(id, { reward_sar: Number(editReward) }),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      toast.success("تم تحديث المكافأة");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeReferral = useMutation({
    mutationFn: deleteReferralAdmin,
    onSuccess: () => {
      invalidate();
      toast.success("تم حذف الإحالة");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveCode = useMutation({
    mutationFn: () => updateProfileReferralCode(codeProfileId, newReferralCode),
    onSuccess: () => {
      invalidate();
      setNewReferralCode("");
      toast.success("تم تحديث كود الإحالة");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => {
    if (!program) return;
    setDefaultReward(String(program.default_reward_sar));
    setInviteeBonus(String(program.invitee_bonus_sar));
    setEnabled(program.enabled);
    setDescription(program.description_ar ?? "");
    setNewReward(String(program.default_reward_sar));
  }, [program]);

  if (programLoading || isLoading) return <p>جاري التحميل...</p>;

  const userLabel = (id: string) => {
    const u = users.find((p) => p.id === id);
    return u ? `${u.display_name ?? "—"} (${u.phone ?? id.slice(0, 8)})` : id.slice(0, 8);
  };

  const startEdit = (r: ReferralRow) => {
    setEditingId(r.id);
    setEditReward(String(r.reward_sar));
  };

  return (
    <AdminAccessGate perm="all">
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">برنامج الإحالات</h2>
        <p className="text-sm text-muted-foreground mt-1">إعدادات البرنامج، الأكواد، وإدارة الإحالات يدويًا</p>
      </div>

      {isAdmin && (
        <div className="rounded-2xl border bg-card p-5 space-y-4">
          <h3 className="font-bold">إعدادات البرنامج</h3>
          <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
            <div>
              <p className="font-medium text-sm">تفعيل برنامج الإحالات</p>
              <p className="text-xs text-muted-foreground">عند التعطيل لا تُسجَّل إحالات جديدة من التطبيق</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>مكافأة الداعي الافتراضية ({symbol})</Label>
              <Input type="number" dir="ltr" value={defaultReward} onChange={(e) => setDefaultReward(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>مكافأة المدعو الجديد ({symbol})</Label>
              <Input type="number" dir="ltr" value={inviteeBonus} onChange={(e) => setInviteeBonus(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>وصف البرنامج (يظهر للمستخدمين)</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button onClick={() => saveProgram.mutate()} disabled={saveProgram.isPending}>
            حفظ إعدادات البرنامج
          </Button>
        </div>
      )}

      {canManage && (
        <div className="rounded-2xl border bg-card p-5 space-y-4">
          <h3 className="font-bold">تعيين كود إحالة لمستخدم</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="space-y-2 md:col-span-1">
              <Label>المستخدم</Label>
              <select
                className="w-full h-10 rounded-md border border-input px-3 text-sm"
                value={codeProfileId}
                onChange={(e) => setCodeProfileId(e.target.value)}
              >
                <option value="">اختر مستخدمًا</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.display_name ?? u.phone ?? u.id.slice(0, 8)} — {u.referral_code ?? "بدون كود"}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>كود جديد</Label>
              <Input
                dir="ltr"
                className="font-mono uppercase"
                value={newReferralCode}
                onChange={(e) => setNewReferralCode(e.target.value.toUpperCase())}
                placeholder="LAFFA-1234"
              />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                onClick={() => saveCode.mutate()}
                disabled={!codeProfileId || !newReferralCode.trim()}
              >
                حفظ الكود
              </Button>
            </div>
          </div>
        </div>
      )}

      {canManage && (
        <div className="rounded-2xl border bg-card p-5 space-y-4">
          <h3 className="font-bold">إضافة إحالة يدوية</h3>
          <div className="grid md:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label>الداعي</Label>
              <select
                className="w-full h-10 rounded-md border border-input px-3 text-sm"
                value={inviterId}
                onChange={(e) => setInviterId(e.target.value)}
              >
                <option value="">اختر الداعي</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {userLabel(u.id)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>المدعو</Label>
              <select
                className="w-full h-10 rounded-md border border-input px-3 text-sm"
                value={inviteeId}
                onChange={(e) => setInviteeId(e.target.value)}
              >
                <option value="">اختر المدعو</option>
                {users
                  .filter((u) => u.id !== inviterId)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {userLabel(u.id)}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>المكافأة ({symbol})</Label>
              <Input type="number" dir="ltr" value={newReward} onChange={(e) => setNewReward(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                onClick={() => addReferral.mutate()}
                disabled={!inviterId || !inviteeId || addReferral.isPending}
              >
                إضافة
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border overflow-hidden bg-card overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-right p-3 font-semibold">الكود</th>
              <th className="text-right p-3 font-semibold">الداعي</th>
              <th className="text-right p-3 font-semibold">المدعو</th>
              <th className="text-right p-3 font-semibold">المكافأة</th>
              <th className="text-right p-3 font-semibold">التاريخ</th>
              {canManage && <th className="text-right p-3 font-semibold">إجراءات</th>}
            </tr>
          </thead>
          <tbody>
            {referrals.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 font-mono" dir="ltr">
                  {r.referral_code ?? "—"}
                </td>
                <td className="p-3 text-xs">{r.inviter?.display_name ?? r.inviter_id ?? "—"}</td>
                <td className="p-3 text-xs">{r.invitee?.display_name ?? r.invitee_id ?? "—"}</td>
                <td className="p-3">
                  {editingId === r.id ? (
                    <Input
                      type="number"
                      className="h-8 w-24"
                      dir="ltr"
                      value={editReward}
                      onChange={(e) => setEditReward(e.target.value)}
                    />
                  ) : (
                    format(r.reward_sar)
                  )}
                </td>
                <td className="p-3 text-xs whitespace-nowrap">
                  {new Date(r.created_at).toLocaleString("ar-SA")}
                </td>
                {canManage && (
                  <td className="p-3">
                    <div className="flex gap-1 flex-wrap">
                      {editingId === r.id ? (
                        <>
                          <Button size="sm" onClick={() => saveReferral.mutate(r.id)}>
                            حفظ
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            إلغاء
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => startEdit(r)}>
                            تعديل
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (confirm("حذف هذه الإحالة؟")) removeReferral.mutate(r.id);
                            }}
                          >
                            حذف
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {referrals.length === 0 && (
          <p className="p-6 text-center text-muted-foreground">لا توجد إحالات بعد</p>
        )}
      </div>

      {canManage && !isAdmin && (
        <p className="text-sm text-muted-foreground">
          يمكنك إدارة الإحالات والأكواد. إعدادات البرنامج (المكافآت الافتراضية والتفعيل) للمدير فقط.
        </p>
      )}
      {!canManage && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4">
          لا تظهر أدوات التعديل — تأكد أن حسابك له دور <strong>مدير</strong> في Supabase. نفّذ{" "}
          <code className="text-xs" dir="ltr">
            supabase/scripts/promote-admin.sql
          </code>{" "}
          مع بريدك ثم سجّل الخروج وأعد الدخول.
        </p>
      )}
    </div>
    </AdminAccessGate>
  );
}

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addEmployeeAdmin,
  fetchAllEmployeePermissions,
  fetchAllProfilesAdmin,
  fetchPromotableProfilesAdmin,
  removeEmployeeAdmin,
  upsertEmployeePermissions,
} from "@luffa/shared";
import type { EmployeePermissions, Profile } from "@luffa/shared";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAdminAuth, roleLabel } from "@/context/AdminAuthContext";
import { toast } from "sonner";

type PermFlags = Omit<EmployeePermissions, "profile_id">;

const defaultPerms: PermFlags = {
  can_manage_trips: true,
  can_manage_cards: false,
  can_manage_users: false,
};

const permFields: { key: keyof PermFlags; label: string }[] = [
  { key: "can_manage_trips", label: "إدارة الطلبات والرحلات" },
  { key: "can_manage_cards", label: "إدارة بطاقات الهدايا" },
  { key: "can_manage_users", label: "إدارة المستخدمين والموظفين" },
];

function PermSwitches({
  perms,
  onChange,
  disabled,
}: {
  perms: PermFlags;
  onChange: (next: PermFlags) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {permFields.map(({ key, label }) => (
        <label
          key={key}
          className="flex items-center justify-between rounded-xl border border-border bg-secondary/50 px-3 py-2.5 cursor-pointer"
        >
          <span className="text-sm font-medium">{label}</span>
          <Switch
            checked={perms[key]}
            disabled={disabled}
            onCheckedChange={(checked) => onChange({ ...perms, [key]: checked })}
          />
        </label>
      ))}
    </div>
  );
}

export default function EmployeesPage() {
  const { profile: currentUser, canAccess } = useAdminAuth();
  const isAdmin = currentUser?.role === "admin";
  const qc = useQueryClient();

  const [newUserId, setNewUserId] = useState("");
  const [newPerms, setNewPerms] = useState<PermFlags>(defaultPerms);
  const [drafts, setDrafts] = useState<Record<string, PermFlags>>({});

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["admin-employees"],
    queryFn: async () => {
      const profiles = await fetchAllProfilesAdmin();
      const staff = profiles.filter((p) => p.role === "employee" || p.role === "admin");
      const permRows = await fetchAllEmployeePermissions();
      const permMap = new Map(permRows.map((p) => [p.profile_id, p]));
      return staff.map((p) => ({
        profile: p,
        perms:
          p.role === "employee"
            ? (permMap.get(p.id) ?? {
                profile_id: p.id,
                ...defaultPerms,
              })
            : null,
      }));
    },
  });

  const { data: promotable = [] } = useQuery({
    queryKey: ["admin-promotable"],
    queryFn: fetchPromotableProfilesAdmin,
    enabled: isAdmin,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-employees"] });
    qc.invalidateQueries({ queryKey: ["admin-promotable"] });
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  const addEmployee = useMutation({
    mutationFn: () => addEmployeeAdmin(newUserId, newPerms),
    onSuccess: () => {
      invalidate();
      setNewUserId("");
      setNewPerms(defaultPerms);
      toast.success("تمت إضافة الموظف");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const savePerms = useMutation({
    mutationFn: ({ profileId, perms }: { profileId: string; perms: PermFlags }) =>
      upsertEmployeePermissions(profileId, perms),
    onSuccess: (_, { profileId }) => {
      invalidate();
      setDrafts((d) => {
        const next = { ...d };
        delete next[profileId];
        return next;
      });
      toast.success("تم حفظ الصلاحيات");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeEmployee = useMutation({
    mutationFn: (profileId: string) => removeEmployeeAdmin(profileId),
    onSuccess: () => {
      invalidate();
      toast.success("تمت إزالة الموظف");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const getDraft = (profileId: string, saved: PermFlags): PermFlags =>
    drafts[profileId] ?? {
      can_manage_trips: saved.can_manage_trips,
      can_manage_cards: saved.can_manage_cards,
      can_manage_users: saved.can_manage_users,
    };

  const hasDraftChanges = (profileId: string, saved: PermFlags) => {
    const d = drafts[profileId];
    if (!d) return false;
    return (
      d.can_manage_trips !== saved.can_manage_trips ||
      d.can_manage_cards !== saved.can_manage_cards ||
      d.can_manage_users !== saved.can_manage_users
    );
  };

  const promotableOptions = useMemo(() => {
    const list = promotable as Profile[];
    return list.map((p) => ({
      id: p.id,
      label: `${p.display_name ?? "بدون اسم"} — ${p.phone ?? p.id.slice(0, 8)} (${roleLabel[p.role]})`,
    }));
  }, [promotable]);

  if (!canAccess("users") && !isAdmin) {
    return <p className="text-muted-foreground">ليس لديك صلاحية لعرض هذه الصفحة.</p>;
  }

  if (isLoading) return <p>جاري التحميل...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">الموظفون والصلاحيات</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isAdmin
            ? "أضف موظفين من مستخدمين موجودين وحدّد صلاحيات كل موظف."
            : "عرض فقط — تعديل الصلاحيات متاح للمدير فقط."}
        </p>
      </div>

      {isAdmin && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-bold">إضافة موظف جديد</h3>
          <p className="text-xs text-muted-foreground">
            يجب أن يكون للمستخدم حساب في التطبيق (تسجيل دخول سابق). اختره من القائمة ثم حدّد الصلاحيات.
          </p>
          <div className="space-y-2">
            <Label>المستخدم</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
            >
              <option value="">اختر مستخدمًا…</option>
              {promotableOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            {promotableOptions.length === 0 && (
              <p className="text-xs text-amber-600">لا يوجد عملاء أو كباتن متاحين للترقية — سجّل مستخدمًا في التطبيق أولًا.</p>
            )}
          </div>
          <PermSwitches perms={newPerms} onChange={setNewPerms} />
          <Button
            onClick={() => addEmployee.mutate()}
            disabled={!newUserId || addEmployee.isPending}
          >
            إضافة موظف
          </Button>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-bold">فريق العمل</h3>
        {employees.map(({ profile, perms }) => {
          const saved: PermFlags = perms
            ? {
                can_manage_trips: perms.can_manage_trips,
                can_manage_cards: perms.can_manage_cards,
                can_manage_users: perms.can_manage_users,
              }
            : defaultPerms;
          const draft = getDraft(profile.id, saved);
          const dirty = profile.role === "employee" && hasDraftChanges(profile.id, saved);

          return (
            <div key={profile.id} className="rounded-2xl border border-border bg-card p-4 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-extrabold">{profile.display_name ?? "—"}</p>
                  <p className="text-xs font-mono text-muted-foreground" dir="ltr">
                    {profile.phone ?? profile.id}
                  </p>
                </div>
                <Badge>{profile.role === "admin" ? "مدير" : "موظف"}</Badge>
              </div>

              {profile.role === "admin" && (
                <p className="text-sm text-muted-foreground">صلاحيات كاملة على لوحة التحكم.</p>
              )}

              {profile.role === "employee" && perms && (
                <>
                  <PermSwitches
                    perms={draft}
                    disabled={!isAdmin}
                    onChange={(next) => setDrafts((d) => ({ ...d, [profile.id]: next }))}
                  />
                  {isAdmin && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => savePerms.mutate({ profileId: profile.id, perms: draft })}
                        disabled={!dirty && !savePerms.isPending}
                      >
                        حفظ الصلاحيات
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (profile.id === currentUser?.id) {
                            toast.error("لا يمكنك إزالة نفسك");
                            return;
                          }
                          if (confirm("إزالة هذا الموظف وإرجاعه كعميل؟")) {
                            removeEmployee.mutate(profile.id);
                          }
                        }}
                        disabled={removeEmployee.isPending}
                      >
                        إزالة من الموظفين
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
        {employees.filter((e) => e.profile.role === "employee").length === 0 && (
          <p className="text-muted-foreground text-sm">لا يوجد موظفون بعد — استخدم النموذج أعلاه للإضافة.</p>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAllProfilesAdmin, updateProfileDisabled, updateProfileRole } from "@luffa/shared";
import type { Profile, UserRole } from "@luffa/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAdminAuth, roleLabel } from "@/context/AdminAuthContext";

export default function UsersPage() {
  const { canAccess } = useAdminAuth();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Profile | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: fetchAllProfilesAdmin });

  const roleMutate = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => updateProfileRole(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("تم تحديث الدور");
    },
  });

  const disabledMutate = useMutation({
    mutationFn: ({ id, disabled }: { id: string; disabled: boolean }) => updateProfileDisabled(id, disabled),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("تم تحديث حالة الحساب");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openUser = (u: Profile) => {
    setSelected(u);
    setSheetOpen(true);
  };

  if (!canAccess("users")) return <p>ليس لديك صلاحية</p>;
  if (isLoading) return <p>جاري التحميل...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold">المستخدمون</h2>
      <div className="rounded-2xl border border-border overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-right p-3">الاسم</th>
              <th className="text-right p-3">الهاتف</th>
              <th className="text-right p-3">الدور</th>
              <th className="text-right p-3">الحالة</th>
              <th className="text-right p-3">كود الإحالة</th>
              <th className="text-right p-3">تغيير الدور</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-t border-border hover:bg-muted/30 cursor-pointer"
                onClick={() => openUser(u)}
              >
                <td className="p-3">{u.display_name ?? "—"}</td>
                <td className="p-3 font-mono" dir="ltr">
                  {u.phone ?? "—"}
                </td>
                <td className="p-3">
                  <Badge>{roleLabel[u.role]}</Badge>
                </td>
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!u.disabled}
                      onCheckedChange={(on) => disabledMutate.mutate({ id: u.id, disabled: !on })}
                    />
                    <span className="text-xs text-muted-foreground">{u.disabled ? "معطّل" : "نشط"}</span>
                  </div>
                </td>
                <td className="p-3 font-mono" dir="ltr">
                  {u.referral_code ?? "—"}
                </td>
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-wrap gap-1">
                    {(["rider", "captain", "employee"] as UserRole[]).map((r) => (
                      <Button
                        key={r}
                        size="sm"
                        variant={u.role === r ? "default" : "outline"}
                        onClick={() => roleMutate.mutate({ id: u.id, role: r })}
                      >
                        {roleLabel[r]}
                      </Button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selected?.display_name ?? "مستخدم"}</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="space-y-4 mt-4">
              <p className="text-sm">
                <span className="text-muted-foreground">الهاتف: </span>
                <span dir="ltr">{selected.phone ?? "—"}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">الدور: </span>
                {roleLabel[selected.role]}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">الحالة: </span>
                {selected.disabled ? "معطّل" : "نشط"}
              </p>
              {selected.phone && (
                <div className="flex gap-3">
                  <a href={`tel:${selected.phone}`} className="text-sm text-primary font-medium">
                    اتصال
                  </a>
                  <a
                    href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary font-medium"
                  >
                    واتساب
                  </a>
                </div>
              )}
              <Link to={`/wallet?profileId=${selected.id}`} className="text-sm text-primary font-medium block">
                فتح المحفظة
              </Link>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

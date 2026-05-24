import type { ReactNode } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import type { AdminNavPerm } from "@/config/adminNav";

export function AdminAccessGate({
  perm,
  children,
  message = "ليس لديك صلاحية للوصول إلى هذا القسم.",
}: {
  perm: AdminNavPerm;
  children: ReactNode;
  message?: string;
}) {
  const { canAccess } = useAdminAuth();

  if (!canAccess(perm)) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        {message}
      </div>
    );
  }

  return <>{children}</>;
}

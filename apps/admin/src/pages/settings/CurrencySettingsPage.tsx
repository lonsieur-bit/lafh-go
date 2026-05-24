import { useAdminAuth } from "@/context/AdminAuthContext";
import { CurrencySettingsCard } from "@/components/CurrencySettingsCard";

export default function CurrencySettingsPage() {
  const { profile } = useAdminAuth();
  const isAdmin = profile?.role === "admin";

  return (
    <div>
      <CurrencySettingsCard isAdmin={isAdmin} />
    </div>
  );
}

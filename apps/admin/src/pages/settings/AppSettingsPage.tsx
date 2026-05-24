import { useAdminAuth } from "@/context/AdminAuthContext";
import { AppSettingsCard } from "@/components/AppSettingsCard";

export default function AppSettingsPage() {
  const { profile } = useAdminAuth();
  const isAdmin = profile?.role === "admin";

  return (
    <div>
      <AppSettingsCard isAdmin={isAdmin} />
    </div>
  );
}

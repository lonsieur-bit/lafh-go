import {
  UserCircle2,
  CarFront,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import PhoneFrame from "@/components/luffa/PhoneFrame";
import { AppAvailabilityGate } from "@/components/luffa/AppMaintenanceScreen";
import { useAppState } from "@/context/AppStateContext";

export default function AppShell() {
  const { appRole, setAppRole } = useAppState();
  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-6 px-4">
      <div className="w-[375px] mb-3 flex items-center justify-end">
        <div className="flex items-center gap-1 bg-card border border-border rounded-full p-1 shadow-elevated">
          <button
            type="button"
            onClick={() => setAppRole("rider")}
            className={`px-3 py-1.5 rounded-full text-xs font-arabic font-extrabold flex items-center gap-1 ${appRole === "rider" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            <UserCircle2 className="w-3.5 h-3.5" />
            راكب
          </button>
          <button
            type="button"
            onClick={() => setAppRole("captain")}
            className={`px-3 py-1.5 rounded-full text-xs font-arabic font-extrabold flex items-center gap-1 ${appRole === "captain" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            <CarFront className="w-3.5 h-3.5" />
            كابتن
          </button>
        </div>
      </div>
      <PhoneFrame rtl label="لفة — التطبيق">
        <AppAvailabilityGate>
          <Outlet />
        </AppAvailabilityGate>
      </PhoneFrame>
    </div>
  );
}

import CustomerHomeScreen from "@/components/luffa/CustomerHomeScreen";
import CaptainHomePage from "@/pages/app/CaptainHomePage";
import { useAppState } from "@/context/AppStateContext";

/** Routed home inside `AppShell` (real bottom nav + deep links). */
const AppHomePage = () => {
  const { appRole } = useAppState();
  if (appRole === "captain") {
    return <CaptainHomePage />;
  }
  return <CustomerHomeScreen hideBottomNav appMode />;
};

export default AppHomePage;

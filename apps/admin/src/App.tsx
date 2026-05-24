import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CurrencyProvider } from "@luffa/shared";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { AdminRoute } from "@/lib/auth/AdminRoute";
import AdminLayout from "@/layouts/AdminLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import OrdersPage from "@/pages/OrdersPage";
import UsersPage from "@/pages/UsersPage";
import WalletPage from "@/pages/WalletPage";
import RechargeCardsPage from "@/pages/RechargeCardsPage";
import EmployeesPage from "@/pages/EmployeesPage";
import NotificationsPage from "@/pages/NotificationsPage";
import ReferralsPage from "@/pages/ReferralsPage";
import ComplaintsSuggestionsPage from "@/pages/ComplaintsSuggestionsPage";
import SettingsLayout from "@/layouts/SettingsLayout";
import SettingsHubPage from "@/pages/settings/SettingsHubPage";
import AppSettingsPage from "@/pages/settings/AppSettingsPage";
import CurrencySettingsPage from "@/pages/settings/CurrencySettingsPage";
import ServicePricingPage from "@/pages/settings/ServicePricingPage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="trips" element={<Navigate to="/orders?tab=rides" replace />} />
                <Route path="cargo" element={<Navigate to="/orders?tab=cargo" replace />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="recharge-cards" element={<RechargeCardsPage />} />
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="complaints" element={<ComplaintsSuggestionsPage />} />
                <Route path="referrals" element={<ReferralsPage />} />
                <Route path="settings" element={<SettingsLayout />}>
                  <Route index element={<SettingsHubPage />} />
                  <Route path="app" element={<AppSettingsPage />} />
                  <Route path="currency" element={<CurrencySettingsPage />} />
                  <Route path="pricing" element={<ServicePricingPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </AdminAuthProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}

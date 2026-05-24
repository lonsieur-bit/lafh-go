import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CurrencyProvider } from "@luffa/shared";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppStateProvider } from "@/context/AppStateContext";
import AppShell from "@/components/luffa/AppShell";
import AppRequireAuth from "@/components/luffa/AppRequireAuth";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AppHomePage from "./pages/app/AppHomePage.tsx";
import OrdersPage from "./pages/app/OrdersPage.tsx";
import OrderDetailsPage from "./pages/app/OrderDetailsPage.tsx";
import ChatPage from "./pages/app/ChatPage.tsx";
import NotificationsPage from "./pages/app/NotificationsPage.tsx";
import WalletPage from "./pages/app/WalletPage.tsx";
import WalletTopUpPage from "./pages/app/WalletTopUpPage.tsx";
import AuthPage from "./pages/app/AuthPage.tsx";
import BookingPage from "./pages/app/BookingPage.tsx";
import CheckoutPage from "./pages/app/CheckoutPage.tsx";
import SearchCaptainPage from "./pages/app/SearchCaptainPage.tsx";
import CargoRequestPage from "./pages/app/CargoRequestPage.tsx";
import AddressesPage from "./pages/app/AddressesPage.tsx";
import ProfilePage from "./pages/app/ProfilePage.tsx";
import ReferralPage from "./pages/app/ReferralPage.tsx";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CurrencyProvider>
    <AppStateProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/app" element={<AppShell />}>
              <Route index element={<AppHomePage />} />
              <Route path="auth" element={<AuthPage />} />
              <Route element={<AppRequireAuth />}>
                <Route path="booking" element={<BookingPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="search-captain" element={<SearchCaptainPage />} />
                <Route path="cargo-request" element={<CargoRequestPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:orderId" element={<OrderDetailsPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="wallet/topup" element={<WalletTopUpPage />} />
                <Route path="addresses" element={<AddressesPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="referral" element={<ReferralPage />} />
              </Route>
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppStateProvider>
    </CurrencyProvider>
  </QueryClientProvider>
);

export default App;

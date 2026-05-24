import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { isSupabaseReady } from "@luffa/shared";

export function AdminRoute() {
  const { loading, session } = useAdminAuth();

  if (!isSupabaseReady()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" dir="rtl">
        <div className="max-w-md text-center space-y-2">
          <h1 className="text-xl font-extrabold">إعداد Supabase مطلوب</h1>
          <p className="text-sm text-muted-foreground">
            أضف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY إلى ملف .env في جذر المشروع.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}

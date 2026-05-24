import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { isSupabaseReady } from "@luffa/shared";

export default function LoginPage() {
  const { session, signIn, loading } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) return <Navigate to="/" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const err = await signIn(email, password);
    if (err) setError(err);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>تسجيل دخول لوحة التحكم</CardTitle>
          <p className="text-sm text-muted-foreground">لفة — للموظفين والمديرين فقط</p>
        </CardHeader>
        <CardContent>
          {!isSupabaseReady() && (
            <p className="text-sm text-destructive mb-4">أضف مفاتيح Supabase في ملف .env</p>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting || !isSupabaseReady()}>
              {submitting ? "جاري الدخول..." : "دخول"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

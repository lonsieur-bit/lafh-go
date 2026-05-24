import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createSupabaseClient, fetchProfile, fetchEmployeePermissions, isStaffRole } from "@luffa/shared";
import type { EmployeePermissions, Profile, UserRole } from "@luffa/shared";

interface AdminAuthValue {
  loading: boolean;
  session: boolean;
  profile: Profile | null;
  permissions: EmployeePermissions | null;
  signIn(email: string, password: string): Promise<string | null>;
  signOut(): Promise<void>;
  canAccess(module: "trips" | "cards" | "users" | "all"): boolean;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [permissions, setPermissions] = useState<EmployeePermissions | null>(null);

  const loadSession = useCallback(async () => {
    const supabase = createSupabaseClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setSession(false);
      setProfile(null);
      setPermissions(null);
      setLoading(false);
      return;
    }
    const p = await fetchProfile(data.session.user.id);
    if (!p || !isStaffRole(p.role)) {
      await supabase.auth.signOut();
      setSession(false);
      setProfile(null);
      setPermissions(null);
      setLoading(false);
      return;
    }
    setSession(true);
    setProfile(p);
    if (p.role === "employee") {
      const perms = await fetchEmployeePermissions(p.id);
      setPermissions(perms);
    } else {
      setPermissions(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSession();
    const supabase = createSupabaseClient();
    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadSession();
    });
    return () => sub.subscription.unsubscribe();
  }, [loadSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = createSupabaseClient();
    if (!supabase) return "لم يتم إعداد Supabase";
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    await loadSession();
    return null;
  }, [loadSession]);

  const signOut = useCallback(async () => {
    const supabase = createSupabaseClient();
    await supabase?.auth.signOut();
    setSession(false);
    setProfile(null);
    setPermissions(null);
  }, []);

  const canAccess = useCallback(
    (module: "trips" | "cards" | "users" | "all") => {
      if (!profile) return false;
      if (profile.role === "admin") return true;
      if (profile.role !== "employee" || !permissions) return false;
      if (module === "all") return true;
      if (module === "trips") return permissions.can_manage_trips;
      if (module === "cards") return permissions.can_manage_cards;
      if (module === "users") return permissions.can_manage_users;
      return false;
    },
    [profile, permissions],
  );

  const value = useMemo(
    () => ({ loading, session, profile, permissions, signIn, signOut, canAccess }),
    [loading, session, profile, permissions, signIn, signOut, canAccess],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}

export const roleLabel: Record<UserRole, string> = {
  rider: "عميل",
  captain: "كابتن",
  admin: "مدير",
  employee: "موظف",
};

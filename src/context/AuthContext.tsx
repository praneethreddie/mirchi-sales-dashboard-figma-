import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { AuthUser } from "../lib/supabase";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, organizationName: string) => Promise<void>;
  logout: () => Promise<void>;
  organizationId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapRole(role: string | undefined, fallback: AuthUser["role"]): AuthUser["role"] {
  const normalized = (role || "").toLowerCase();
  if (normalized === "admin") return "Admin";
  if (normalized === "manager") return "Manager";
  if (normalized === "inventory staff") return "Inventory Staff";
  if (normalized === "sales staff") return "Sales Staff";
  if (normalized === "viewer") return "Viewer";
  return fallback;
}

async function hydrateAuthUser(user: { id: string; email?: string | null; created_at?: string; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> }): Promise<AuthUser> {
  const fallbackOrganizationId = (user.app_metadata?.organizationId as string | undefined) || "org_default";
  const fallbackOrganizationName = (user.app_metadata?.organizationName as string | undefined) || (user.user_metadata?.organizationName as string | undefined) || "Default Org";
  const fallbackRole = mapRole((user.app_metadata?.role as string | undefined) || (user.user_metadata?.role as string | undefined), "Staff");
  const fallbackName = (user.user_metadata?.name as string | undefined) || (user.app_metadata?.name as string | undefined) || user.email?.split("@")[0] || "User";

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("organization_id, full_name, role, email")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && data) {
      const { data: organizationRow } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", data.organization_id)
        .maybeSingle();

      return {
        id: user.id,
        email: data.email || user.email || "",
        organizationId: data.organization_id,
        organizationName: organizationRow?.name || fallbackOrganizationName,
        role: mapRole(data.role, fallbackRole),
        name: data.full_name || fallbackName,
        createdAt: user.created_at || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error("Failed to hydrate auth user from profile:", err);
  }

  return {
    id: user.id,
    email: user.email || "",
    organizationId: fallbackOrganizationId,
    organizationName: fallbackOrganizationName,
    role: fallbackRole,
    name: fallbackName,
    createdAt: user.created_at || new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  // Initialize from Supabase auth state
  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        hydrateAuthUser(session.user).then((authUser) => {
          setUser(authUser);
          setOrganizationId(authUser.organizationId);
        });
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser = await hydrateAuthUser(session.user);
        setUser(authUser);
        setOrganizationId(authUser.organizationId);
      } else {
        setUser(null);
        setOrganizationId(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Supabase email/password login
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const authUser = await hydrateAuthUser(data.user);
        setUser(authUser);
        setOrganizationId(authUser.organizationId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      const friendlyMessage =
        message.toLowerCase().includes("failed to fetch") ||
        message.toLowerCase().includes("networkerror")
          ? "Could not reach Supabase. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, and confirm the Supabase project is active."
          : message;
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  // Supabase email/password signup
  const signup = async (email: string, password: string, name: string, organizationName: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!email || !password || !name || !organizationName) {
        throw new Error("All fields are required");
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            organizationName,
            role: "Admin",
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const authUser = await hydrateAuthUser(data.user);
        setUser(authUser);
        setOrganizationId(authUser.organizationId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed";
      const friendlyMessage =
        message.toLowerCase().includes("failed to fetch") ||
        message.toLowerCase().includes("networkerror")
          ? "Could not reach Supabase. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, and confirm the Supabase project is active."
          : message;
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setOrganizationId(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, organizationId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

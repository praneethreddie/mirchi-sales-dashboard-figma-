import { createClient } from "@supabase/supabase-js";

const FALLBACK_SUPABASE_URL = "https://qslxkivgxijrlewfxjax.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbHhraXZneGlqcmxld2Z4amF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODUyMDcsImV4cCI6MjA5NTU2MTIwN30.ZSiB_VCByNYhyDApRwiujIF0wrxa0O_tRxgY3dh86PE";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    "Supabase env vars are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local to point the app at your project."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type Tables =
  | "users"
  | "organizations"
  | "batches"
  | "sales"
  | "payments"
  | "activity_logs"
  | "suppliers"
  | "customers";

export interface AuthUser {
  id: string;
  email: string;
  organizationId: string;
  organizationName: string;
  role: "Admin" | "Manager" | "Staff";
  name: string;
  createdAt: string;
}

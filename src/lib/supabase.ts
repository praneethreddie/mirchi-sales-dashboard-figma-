import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "Supabase env vars are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local to point the app at your project."
  );
}

export const supabase = createClient(SUPABASE_URL ?? "", SUPABASE_ANON_KEY ?? "");

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

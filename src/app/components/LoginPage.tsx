import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";

export function LoginPage() {
  const { login, loading, error } = useAuth();
  const [formError, setFormError] = useState("");
  
  const [form, setForm] = useState({
    email: "demo@example.com",
    password: "demo123",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    
    try {
      await login(form.email, form.password);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Authentication failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Chili Management</h1>
            <p className="text-muted-foreground">Login</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              style={{ backgroundColor: "#B91C1C" }}
            >
              {loading ? "Loading..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <p className="font-semibold text-blue-900 mb-2">Admin-managed access</p>
            <p className="text-blue-800 text-xs">Only accounts created in Supabase Auth by your admin can sign in.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

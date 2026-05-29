import { useState, useEffect } from "react";
import { X, Shield, Edit2, ToggleLeft, ToggleRight, Plus, Loader2 } from "lucide-react";
import { users as initialUsers, type User, type UserRole } from "./data/mockData";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

const ROLES: UserRole[] = ["Admin", "Manager", "Inventory Staff", "Sales Staff"];

const roleColors: Record<UserRole, string> = {
  Admin: "bg-red-100 text-red-700",
  Manager: "bg-purple-100 text-purple-700",
  "Inventory Staff": "bg-blue-100 text-blue-700",
  "Sales Staff": "bg-green-100 text-green-700",
};

const rolePermissions: Record<UserRole, string[]> = {
  Admin: ["Full access", "Manage users", "View all data", "Delete records", "View audit logs"],
  Manager: ["View all modules", "Create/edit records", "View reports", "Manage inventory"],
  "Inventory Staff": ["Add stock entries", "Edit own entries", "View inventory", "View batches"],
  "Sales Staff": ["Create invoices", "Edit own sales", "View customers", "Record dispatches"],
};

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPermissions, setShowPermissions] = useState<UserRole | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createStatus, setCreateStatus] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Manager" as UserRole,
  });
  const { user: authUser, organizationId } = useAuth();

  async function createUserRequest(body: Record<string, unknown>) {
    const timeout = 10000;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeout);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("You must be signed in to create users.");
      }

      const url = `${import.meta.env.VITE_SUPABASE_URL || "https://qslxkivgxijrlewfxjax.supabase.co"}/functions/v1/invite-user`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const responseText = await response.text();
      let payload: any = null;
      try {
        payload = responseText ? JSON.parse(responseText) : null;
      } catch {
        payload = { raw: responseText };
      }

      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || `Create user failed (${response.status})`);
      }

      return payload;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("Create user request timed out. Check the Edge Function deployment and network connectivity.");
      }
      throw error;
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function createUser() {
    setCreateError(null);
    setCreateStatus(null);

    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      setCreateError("Name, email, and password are required.");
      return;
    }

    if (!organizationId) {
      setCreateError("Current user does not have an organization assigned.");
      return;
    }

    try {
      setCreateLoading(true);
      setCreateStatus("Sending request to Supabase...");
      const body = {
        email: newUser.email.trim(),
        name: newUser.name.trim(),
        phone: newUser.phone.trim(),
        password: newUser.password,
        role: newUser.role,
        organizationId,
        organizationName: authUser?.organizationName || "Organization",
        inviterName: authUser?.name || "Admin",
      };

      setCreateStatus("Waiting for edge function response...");
      const data = await createUserRequest(body);

      if (data?.user) {
        setCreateStatus("User created successfully.");
        const newUser: User = {
          id: data.user.id || `u_${Date.now()}`,
          name: data.user.user_metadata?.name || body.name || body.email.split("@")[0],
          email: body.email,
          role: (body.role as UserRole) || "Manager",
          phone: body.phone,
          lastLogin: new Date().toISOString().split("T")[0],
          createdAt: new Date().toISOString().split("T")[0],
          active: true,
        };
        setUsers((prev) => [newUser, ...prev]);
        setCreateOpen(false);
        setNewUser({ name: "", email: "", phone: "", password: "", role: "Manager" });
      } else {
        throw new Error(data?.error || "Edge Function did not return created user data.");
      }
    } catch (err) {
      console.error("Invite error:", err);
      setCreateError(err instanceof Error ? err.message : String(err));
      setCreateStatus(null);
    } finally {
      setCreateLoading(false);
    }
  }

  // Load users from Supabase user_profiles for the organization
  useEffect(() => {
    if (!organizationId) return;

    let mounted = true;

    (async () => {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("id, full_name, email, role, created_at, is_email_verified")
          .eq("organization_id", organizationId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (!mounted) return;

        if (data) {
          const mapped: User[] = data.map((u: any) => ({
            id: u.id,
            name: u.full_name || (u.email ? u.email.split("@")[0] : "User"),
            email: u.email || "",
            role: (u.role === "admin" ? "Admin" : u.role === "manager" ? "Manager" : u.role === "inventory staff" ? "Inventory Staff" : u.role === "sales staff" ? "Sales Staff" : "Manager") as UserRole,
            phone: "",
            lastLogin: "-",
            createdAt: u.created_at ? new Date(u.created_at).toISOString().split("T")[0] : "-",
            active: true,
          }));
          setUsers(mapped);
        }
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    })();

    return () => { mounted = false };
  }, [organizationId]);
  function handleEdit(user: User) {
    setEditingId(user.id);
    window.alert(
      `User profile editing is managed in Supabase Auth / database.\n\nEmail: ${user.email}\nRole: ${user.role}`,
    );
  }

  function toggleActive(id: string) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));
  }

  const activeCount = users.filter(u => u.active).length;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1>User Management</h1>
          <p className="text-sm text-muted-foreground">{activeCount} active · {users.length - activeCount} inactive</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800">Manage users in <span className="font-semibold">Supabase Auth</span> for this organization only.</div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: "#B91C1C" }}>
                <Plus size={14} /> Create User
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Create User</DialogTitle>
                <DialogDescription>
                  Enter the user's name, login credentials, and role. The account will be created in Supabase Auth and added to this organization.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-2">
                {createError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {createError}
                  </div>
                )}

                {createStatus && !createError && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                    {createStatus}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium">Full name</label>
                    <Input
                      value={newUser.name}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      type="tel"
                      value={newUser.phone}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 555 0123"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Set a temporary password"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newUser.role}
                      onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={createLoading}>
                  Cancel
                </Button>
                <Button type="button" onClick={createUser} disabled={createLoading} style={{ backgroundColor: "#B91C1C" }}>
                  {createLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {createLoading ? "Creating User..." : "Create User"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Role breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ROLES.map(role => {
          const count = users.filter(u => u.role === role).length;
          return (
            <button key={role} onClick={() => setShowPermissions(role === showPermissions ? null : role)}
              className="bg-card rounded-xl border border-border p-3 text-left hover:border-primary/30 transition-colors group">
              <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mb-2 ${roleColors[role]}`}>{role}</div>
              <div className="text-2xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{count}</div>
              <div className="text-xs text-primary mt-1 group-hover:underline">View permissions →</div>
            </button>
          );
        })}
      </div>

      {/* Permissions panel */}
      {showPermissions && (
        <div className="bg-secondary border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-accent" />
              <h3>{showPermissions} — Permissions</h3>
            </div>
            <button onClick={() => setShowPermissions(null)} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {rolePermissions[showPermissions].map(p => (
              <span key={p} className="px-3 py-1 rounded-lg bg-card border border-border text-xs font-medium">{p}</span>
            ))}
          </div>
        </div>
      )}

      {/* Users list */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["User", "Role", "Phone", "Last Login", "Created", "Status", "Actions"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: u.active ? "#B91C1C" : "#9CA3AF" }}>
                        {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleColors[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{u.phone}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">{u.lastLogin}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{u.createdAt}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      {u.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(u)}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors"
                        title="View user guidance">
                        <Edit2 size={16} className="text-primary" />
                      </button>
                      <button onClick={() => toggleActive(u.id)}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors"
                        title={u.active ? "Deactivate" : "Activate"}>
                        {u.active ? <ToggleRight size={16} className="text-green-600" /> : <ToggleLeft size={16} className="text-muted-foreground" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


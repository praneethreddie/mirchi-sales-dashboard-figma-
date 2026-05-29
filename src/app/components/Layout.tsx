import { useState } from "react";
import {
  LayoutDashboard, ShoppingCart, TrendingUp, Wallet,
  Package, Users, FileText, Search, Menu, X, Bell,
  ChevronRight, LogOut, Flame
} from "lucide-react";

type Module = "dashboard" | "purchase" | "sales" | "payments" | "inventory" | "users" | "logs";

interface LayoutProps {
  activeModule: Module;
  onNavigate: (m: Module) => void;
  children: React.ReactNode;
  currentUser: { name: string; role: string };
  onLogout?: () => Promise<void>;
}

const navItems: { id: Module; label: string; icon: React.ElementType; roles: string[] }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Admin", "Manager", "Inventory Staff", "Sales Staff"] },
  { id: "purchase", label: "Purchase / Inflow", icon: ShoppingCart, roles: ["Admin", "Manager", "Inventory Staff"] },
  { id: "sales", label: "Sales / Dispatch", icon: TrendingUp, roles: ["Admin", "Manager", "Sales Staff"] },
  { id: "payments", label: "Payments", icon: Wallet, roles: ["Admin", "Manager"] },
  { id: "inventory", label: "Inventory", icon: Package, roles: ["Admin", "Manager", "Inventory Staff"] },
  { id: "users", label: "User Management", icon: Users, roles: ["Admin"] },
  { id: "logs", label: "Activity Logs", icon: FileText, roles: ["Admin"] },
];

export function Layout({ activeModule, onNavigate, children, currentUser, onLogout }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allowedItems = navItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#B91C1C" }}>
            <Flame size={20} color="#fff" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-wide text-sidebar-foreground">MIRCHI YARD</div>
            <div className="text-[11px] text-sidebar-foreground/50 tracking-widest uppercase">Management</div>
          </div>
          <button
            className="ml-auto lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {allowedItems.map(item => {
            const Icon = item.icon;
            const active = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {active && <ChevronRight size={14} className="ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-sidebar-accent">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#B91C1C" }}>
              {currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-sidebar-foreground truncate">{currentUser.name}</div>
              <div className="text-[11px] text-sidebar-foreground/50">{currentUser.role}</div>
            </div>
            <button 
              onClick={() => onLogout?.()}
              className="text-sidebar-foreground/40 hover:text-sidebar-foreground"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border shrink-0">
          <button
            className="lg:hidden p-1.5 rounded-md hover:bg-muted"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 flex items-center gap-2 max-w-sm bg-input-background rounded-md px-3 py-2">
            <Search size={15} className="text-muted-foreground shrink-0" />
            <input
              placeholder="Search batches, customers…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="relative p-2 rounded-md hover:bg-muted">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-sm font-medium">
              <span className="text-muted-foreground">{navItems.find(n => n.id === activeModule)?.label}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

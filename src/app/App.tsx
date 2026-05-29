import { useState } from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { PurchaseManagement } from "./components/PurchaseManagement";
import { SalesManagement } from "./components/SalesManagement";
import { PaymentsModule } from "./components/PaymentsModule";
import { InventoryManagement } from "./components/InventoryManagement";
import { UserManagement } from "./components/UserManagement";
import { ActivityLogs } from "./components/ActivityLogs";
import { LoginPage } from "./components/LoginPage";
import { AuthProvider, useAuth } from "../context/AuthContext";

type Module = "dashboard" | "purchase" | "sales" | "payments" | "inventory" | "users" | "logs";

function AppContent() {
  const { user, logout } = useAuth();
  const [activeModule, setActiveModule] = useState<Module>("dashboard");

  if (!user) {
    return <LoginPage />;
  }

  function renderModule() {
    switch (activeModule) {
      case "dashboard": return <Dashboard />;
      case "purchase": return <PurchaseManagement />;
      case "sales": return <SalesManagement />;
      case "payments": return <PaymentsModule />;
      case "inventory": return <InventoryManagement />;
      case "users": return <UserManagement />;
      case "logs": return <ActivityLogs />;
    }
  }

  const currentUser = {
    name: user.name,
    role: user.role,
    organizationId: user.organizationId,
  };

  return (
    <Layout
      activeModule={activeModule}
      onNavigate={setActiveModule}
      currentUser={currentUser}
      onLogout={logout}
    >
      {renderModule()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

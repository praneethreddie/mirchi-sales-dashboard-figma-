import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  TrendingUp, TrendingDown, Package, Wallet, AlertTriangle,
  ArrowUpRight, ArrowDownRight, ShoppingCart, Users
} from "lucide-react";
import {
  batches, sales, payments, customers, suppliers,
  weeklyRevenue, inventoryByVariety, monthlyTrend
} from "./data/mockData";

const fmt = (n: number) =>
  n >= 100000
    ? `₹${(n / 100000).toFixed(1)}L`
    : n >= 1000
    ? `₹${(n / 1000).toFixed(0)}K`
    : `₹${n}`;

const PIE_COLORS = ["#B91C1C", "#D97706", "#16A34A", "#2563EB", "#7C3AED"];

function StatCard({
  label, value, sub, icon: Icon, trend, trendUp
}: {
  label: string; value: string; sub: string; icon: React.ElementType; trend?: string; trendUp?: boolean;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</div>
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          <Icon size={16} className="text-foreground/60" />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{sub}</span>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trendUp ? "text-green-600" : "text-red-600"}`}>
            {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

export function Dashboard() {
  const [dateFilter, setDateFilter] = useState<"weekly" | "monthly">("weekly");

  const totalInventoryKg = batches.reduce((s, b) => s + b.remainingKg, 0);
  const totalInventoryBags = batches.reduce((s, b) => s + b.remainingBags, 0);
  const totalSales = sales.reduce((s, r) => s + r.totalAmount, 0);
  const totalPending = sales.filter(s => s.paymentStatus !== "Paid").reduce((s, r) => s + (r.totalAmount - r.paidAmount), 0);
  const totalReceived = payments.filter(p => p.type === "received").reduce((s, p) => s + p.amount, 0);
  const totalPurchased = batches.reduce((s, b) => s + b.totalValue, 0);
  const lowStockBatches = batches.filter(b => b.remainingKg < 1500);

  const topCustomers = [...customers].sort((a, b) => b.totalPurchased - a.totalPurchased).slice(0, 4);
  const recentSales = [...sales].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Thursday, 28 May 2024</p>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-border text-sm">
          <button
            onClick={() => setDateFilter("weekly")}
            className={`px-3 py-1.5 font-medium transition-colors ${dateFilter === "weekly" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
          >Weekly</button>
          <button
            onClick={() => setDateFilter("monthly")}
            className={`px-3 py-1.5 font-medium transition-colors ${dateFilter === "monthly" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
          >Monthly</button>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockBatches.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
          <AlertTriangle size={16} className="shrink-0 text-amber-600" />
          <p className="text-sm font-medium">
            {lowStockBatches.length} batch{lowStockBatches.length > 1 ? "es" : ""} running low —{" "}
            {lowStockBatches.map(b => `${b.id} (${b.remainingKg} kg)`).join(", ")}
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Sales" value={fmt(totalSales)} sub="This period" icon={TrendingUp} trend="12%" trendUp />
        <StatCard label="Purchases" value={fmt(totalPurchased)} sub="Stock inflow value" icon={ShoppingCart} trend="8%" trendUp />
        <StatCard label="Received" value={fmt(totalReceived)} sub="Payments collected" icon={Wallet} trend="5%" trendUp />
        <StatCard label="Pending Dues" value={fmt(totalPending)} sub="From customers" icon={AlertTriangle} trend="3%" trendUp={false} />
      </div>

      {/* Inventory summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#B91C1C" }}>
            <Package size={22} color="#fff" />
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{totalInventoryKg.toLocaleString("en-IN")} kg</div>
            <div className="text-xs text-muted-foreground">{totalInventoryBags} bags in stock</div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#D97706" }}>
            <Users size={22} color="#fff" />
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{customers.length}</div>
            <div className="text-xs text-muted-foreground">{suppliers.length} active suppliers</div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-4">
          <h3 className="mb-4 text-foreground">{dateFilter === "weekly" ? "Weekly" : "Monthly"} Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dateFilter === "weekly" ? weeklyRevenue : monthlyTrend} barSize={14} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey={dateFilter === "weekly" ? "day" : "month"} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, ""]} />
              <Legend />
              <Bar dataKey="sales" name="Sales" fill="#B91C1C" radius={[3, 3, 0, 0]} />
              <Bar dataKey="purchases" name="Purchases" fill="#D97706" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory pie */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-4 text-foreground">Stock by Variety</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={inventoryByVariety} dataKey="kg" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                {inventoryByVariety.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v.toLocaleString("en-IN")} kg`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {inventoryByVariety.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                <span className="flex-1 text-muted-foreground">{item.name}</span>
                <span className="font-medium font-mono">{item.kg.toLocaleString("en-IN")} kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent transactions */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3 text-foreground">Recent Sales</h3>
          <div className="space-y-2">
            {recentSales.map(s => (
              <div key={s.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{s.customerName}</div>
                  <div className="text-xs text-muted-foreground">{s.invoiceNo} · {s.weightKg.toLocaleString("en-IN")} kg</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {fmt(s.totalAmount)}
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    s.paymentStatus === "Paid" ? "bg-green-100 text-green-700" :
                    s.paymentStatus === "Partial" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {s.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top customers */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3 text-foreground">Top Customers</h3>
          <div className="space-y-3">
            {topCustomers.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: PIE_COLORS[i] }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{c.name}</div>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${(c.totalPurchased / topCustomers[0].totalPurchased) * 100}%`,
                        backgroundColor: PIE_COLORS[i]
                      }}
                    />
                  </div>
                </div>
                <div className="text-sm font-bold shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {fmt(c.totalPurchased)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

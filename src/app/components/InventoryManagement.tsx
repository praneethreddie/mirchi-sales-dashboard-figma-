import { useState } from "react";
import { Package, AlertTriangle, MapPin, Calendar } from "lucide-react";
import { batches, inventoryByVariety } from "./data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const LOCATIONS = ["All", "Shed A", "Shed B", "Shed C", "Shed D"];
const VARIETIES = ["All", "Teja", "334", "Byadgi", "Guntur", "Wrinkled"];

function ageLabel(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days > 30) return { label: `${days}d`, color: "text-destructive", bg: "bg-red-100" };
  if (days > 14) return { label: `${days}d`, color: "text-amber-600", bg: "bg-amber-100" };
  return { label: `${days}d`, color: "text-green-600", bg: "bg-green-100" };
}

export function InventoryManagement() {
  const [locationFilter, setLocationFilter] = useState("All");
  const [varietyFilter, setVarietyFilter] = useState("All");

  const filtered = batches.filter(b => {
    if (locationFilter !== "All" && b.location !== locationFilter) return false;
    if (varietyFilter !== "All" && b.variety !== varietyFilter) return false;
    return true;
  });

  const totalKg = filtered.reduce((s, b) => s + b.remainingKg, 0);
  const totalBags = filtered.reduce((s, b) => s + b.remainingBags, 0);
  const totalValue = filtered.reduce((s, b) => s + b.remainingKg * b.purchasePrice, 0);
  const lowStock = filtered.filter(b => b.remainingKg < 1500);

  const locationBreakdown = ["Shed A", "Shed B", "Shed C", "Shed D"].map(loc => ({
    name: loc,
    kg: batches.filter(b => b.location === loc).reduce((s, b) => s + b.remainingKg, 0),
  }));

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div>
        <h1>Inventory</h1>
        <p className="text-sm text-muted-foreground">Real-time stock across all sheds</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Stock", value: `${totalKg.toLocaleString("en-IN")} kg`, sub: `${totalBags} bags`, icon: Package, color: "#B91C1C" },
          { label: "Stock Value", value: `₹${(totalValue / 100000).toFixed(1)}L`, sub: "At purchase price", icon: Package, color: "#D97706" },
          { label: "Active Batches", value: filtered.length.toString(), sub: "across all locations", icon: MapPin, color: "#16A34A" },
          { label: "Low Stock Alerts", value: lowStock.length.toString(), sub: "batches < 1500 kg", icon: AlertTriangle, color: lowStock.length > 0 ? "#DC2626" : "#16A34A" },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "20" }}>
                <s.icon size={14} style={{ color: s.color }} />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase">{s.label}</span>
            </div>
            <div className="text-xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Low stock warning */}
      {lowStock.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2 text-amber-700 text-sm font-semibold w-full">
            <AlertTriangle size={15} /> Low Stock Batches
          </div>
          {lowStock.map(b => (
            <span key={b.id} className="px-2 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-medium">
              {b.id}: {b.variety} — {b.remainingKg} kg left
            </span>
          ))}
        </div>
      )}

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3">Stock by Variety (kg)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={inventoryByVariety} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString("en-IN")} kg`, ""]} />
              <Bar dataKey="kg" name="Stock (kg)" fill="#B91C1C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3">Stock by Location (kg)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={locationBreakdown} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString("en-IN")} kg`, ""]} />
              <Bar dataKey="kg" name="Stock (kg)" fill="#D97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-wrap gap-1.5">
          {LOCATIONS.map(l => (
            <button key={l} onClick={() => setLocationFilter(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                locationFilter === l ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"
              }`}>{l}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {VARIETIES.map(v => (
            <button key={v} onClick={() => setVarietyFilter(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                varietyFilter === v ? "bg-accent text-accent-foreground border-accent" : "bg-card border-border text-muted-foreground hover:bg-muted"
              }`}>{v}</button>
          ))}
        </div>
      </div>

      {/* Batch grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(b => {
          const pct = (b.remainingKg / b.weightKg) * 100;
          const age = ageLabel(b.date);
          return (
            <div key={b.id} className="bg-card rounded-xl border border-border p-4 space-y-3 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-primary">{b.id}</div>
                  <div className="font-semibold mt-0.5">{b.variety}</div>
                  <div className="text-xs text-muted-foreground">{b.supplierName}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    b.grade === "Premium" ? "bg-amber-100 text-amber-700" :
                    b.grade === "A" ? "bg-green-100 text-green-700" :
                    b.grade === "B" ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"
                  }`}>{b.grade}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${age.bg} ${age.color}`}>
                    <Calendar size={9} className="inline mr-0.5" />{age.label} old
                  </span>
                </div>
              </div>

              {/* Stock progress */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground font-medium">
                    <span className="font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {b.remainingKg.toLocaleString("en-IN")}
                    </span> / {b.weightKg.toLocaleString("en-IN")} kg
                  </span>
                  <span className="font-mono font-semibold">{pct.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct > 50 ? "#16A34A" : pct > 20 ? "#D97706" : "#B91C1C"
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                <span className="flex items-center gap-1"><MapPin size={10} />{b.location}</span>
                <span>{b.remainingBags} bags</span>
                <span className="font-mono font-semibold text-foreground">₹{b.purchasePrice}/kg</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

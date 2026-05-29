import { useState } from "react";
import { Plus, X, Package, ChevronDown } from "lucide-react";
import { batches as initialBatches, suppliers, type Batch, type ChiliVariety, type Grade, type Supplier } from "./data/mockData";
import { SearchableSupplierInput } from "./SearchableSupplierInput";
import { activityLogger } from "../../lib/activityLogger";
import { useAuth } from "../../context/AuthContext";

const VARIETIES: ChiliVariety[] = ["Teja", "334", "Byadgi", "Guntur", "Wrinkled"];
const GRADES: Grade[] = ["A", "B", "C", "Premium"];
const LOCATIONS = ["Shed A", "Shed B", "Shed C", "Shed D"];

function generateBatchId() {
  return `B-${2407 + Math.floor(Math.random() * 10)}`;
}

export function PurchaseManagement() {
  const { user } = useAuth();
  const [suppliers_, setSuppliers] = useState<Supplier[]>(suppliers);
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    supplierId: "",
    variety: "" as ChiliVariety | "",
    grade: "" as Grade | "",
    bags: "",
    weightKg: "",
    purchasePrice: "",
    location: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = batches.filter(b =>
    b.id.toLowerCase().includes(search.toLowerCase()) ||
    b.supplierName.toLowerCase().includes(search.toLowerCase()) ||
    b.variety.toLowerCase().includes(search.toLowerCase())
  );

  function validate() {
    const e: Record<string, string> = {};
    if (!form.supplierId) e.supplierId = "Select supplier";
    if (!form.variety) e.variety = "Select variety";
    if (!form.grade) e.grade = "Select grade";
    if (!form.bags || isNaN(Number(form.bags)) || Number(form.bags) <= 0) e.bags = "Enter valid bags";
    if (!form.weightKg || isNaN(Number(form.weightKg)) || Number(form.weightKg) <= 0) e.weightKg = "Enter valid weight";
    if (!form.purchasePrice || isNaN(Number(form.purchasePrice)) || Number(form.purchasePrice) <= 0) e.purchasePrice = "Enter valid price";
    if (!form.location) e.location = "Select location";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const supplier = suppliers_.find(s => s.id === form.supplierId)!;
    const bags = Number(form.bags);
    const weightKg = Number(form.weightKg);
    const purchasePrice = Number(form.purchasePrice);
    const newBatch: Batch = {
      id: generateBatchId(),
      supplierId: form.supplierId,
      supplierName: supplier.name,
      variety: form.variety as ChiliVariety,
      grade: form.grade as Grade,
      bags,
      weightKg,
      purchasePrice,
      totalValue: weightKg * purchasePrice,
      location: form.location,
      date: new Date().toISOString().split("T")[0],
      remainingKg: weightKg,
      remainingBags: bags,
    };
    
    // Log activity
    if (user) {
      activityLogger.addLog(
        user,
        "Purchase",
        "Created",
        `Added batch ${newBatch.id} from ${supplier.name} - ${weightKg}kg ${newBatch.variety} Grade ${newBatch.grade}`,
        {
          recordId: newBatch.id,
          recordName: newBatch.id,
          changes: {
            supplier: supplier.name,
            variety: newBatch.variety,
            grade: newBatch.grade,
            weightKg,
            totalValue: newBatch.totalValue
          }
        }
      );
    }
    
    setBatches(prev => [newBatch, ...prev]);
    setForm({ supplierId: "", variety: "", grade: "", bags: "", weightKg: "", purchasePrice: "", location: "" });
    setShowForm(false);
  }

  function handleAddNewSupplier(supplierName: string) {
    const newSupplier: Supplier = {
      id: `S${(suppliers_.length + 1).toString().padStart(3, "0")}`,
      name: supplierName,
      phone: "9848000000",
      city: "Unknown",
      balance: 0,
    };
    setSuppliers(prev => [newSupplier, ...prev]);
    setForm(f => ({ ...f, supplierId: newSupplier.id }));
    
    // Log activity
    if (user) {
      activityLogger.addLog(
        user,
        "Purchase",
        "Created",
        `Added new supplier: ${supplierName}`,
        {
          recordId: newSupplier.id,
          recordName: supplierName
        }
      );
    }
  }

  const totalValue = batches.reduce((s, b) => s + b.totalValue, 0);
  const totalKg = batches.reduce((s, b) => s + b.weightKg, 0);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1>Purchase / Inflow</h1>
          <p className="text-sm text-muted-foreground">{batches.length} batches · {(totalKg / 1000).toFixed(1)}T total stock</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#B91C1C" }}
        >
          <Plus size={16} /> Add Batch
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Batches", value: batches.length.toString() },
          { label: "Total Stock Value", value: `₹${(totalValue / 100000).toFixed(1)}L` },
          { label: "Avg Price/Kg", value: `₹${Math.round(totalValue / totalKg)}` },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-3 text-center">
            <div className="text-lg font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        placeholder="Search by Batch ID, supplier, variety…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30"
      />

      {/* Batch table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Batch ID", "Supplier", "Variety", "Grade", "Bags", "Weight", "Price/Kg", "Value", "Location", "Date", "Stock Left"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={b.id} className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                  <td className="px-3 py-2.5 font-mono text-xs font-semibold text-primary">{b.id}</td>
                  <td className="px-3 py-2.5 font-medium whitespace-nowrap">{b.supplierName}</td>
                  <td className="px-3 py-2.5">
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary">{b.variety}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                      b.grade === "Premium" ? "bg-amber-100 text-amber-700" :
                      b.grade === "A" ? "bg-green-100 text-green-700" :
                      b.grade === "B" ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"
                    }`}>{b.grade}</span>
                  </td>
                  <td className="px-3 py-2.5 font-mono">{b.bags}</td>
                  <td className="px-3 py-2.5 font-mono">{b.weightKg.toLocaleString("en-IN")} kg</td>
                  <td className="px-3 py-2.5 font-mono">₹{b.purchasePrice}</td>
                  <td className="px-3 py-2.5 font-mono font-semibold">₹{b.totalValue.toLocaleString("en-IN")}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{b.location}</td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{b.date}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 w-16 bg-muted rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${(b.remainingKg / b.weightKg) * 100}%`,
                            backgroundColor: b.remainingKg / b.weightKg > 0.5 ? "#16A34A" : b.remainingKg / b.weightKg > 0.2 ? "#D97706" : "#B91C1C"
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{b.remainingKg.toLocaleString("en-IN")}kg</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add batch modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-card w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl border border-border shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-primary" />
                <h3>Add New Batch</h3>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-md hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Supplier *</label>
                  <SearchableSupplierInput
                    suppliers={suppliers_}
                    value={form.supplierId}
                    onSelect={(id) => setForm(f => ({ ...f, supplierId: id }))}
                    onAddNew={handleAddNewSupplier}
                    error={errors.supplierId}
                  />
                </div>

                {/* Variety */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Chili Variety *</label>
                  <select
                    value={form.variety}
                    onChange={e => setForm(f => ({ ...f, variety: e.target.value as ChiliVariety }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Select…</option>
                    {VARIETIES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  {errors.variety && <p className="text-xs text-destructive mt-1">{errors.variety}</p>}
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Grade *</label>
                  <select
                    value={form.grade}
                    onChange={e => setForm(f => ({ ...f, grade: e.target.value as Grade }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Select…</option>
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  {errors.grade && <p className="text-xs text-destructive mt-1">{errors.grade}</p>}
                </div>

                {/* Bags */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">No. of Bags *</label>
                  <input
                    type="number" min="1"
                    value={form.bags}
                    onChange={e => setForm(f => ({ ...f, bags: e.target.value }))}
                    placeholder="e.g. 100"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {errors.bags && <p className="text-xs text-destructive mt-1">{errors.bags}</p>}
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Total Weight (kg) *</label>
                  <input
                    type="number" min="1"
                    value={form.weightKg}
                    onChange={e => setForm(f => ({ ...f, weightKg: e.target.value }))}
                    placeholder="e.g. 5000"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {errors.weightKg && <p className="text-xs text-destructive mt-1">{errors.weightKg}</p>}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Purchase Price (₹/kg) *</label>
                  <input
                    type="number" min="1"
                    value={form.purchasePrice}
                    onChange={e => setForm(f => ({ ...f, purchasePrice: e.target.value }))}
                    placeholder="e.g. 185"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {errors.purchasePrice && <p className="text-xs text-destructive mt-1">{errors.purchasePrice}</p>}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Storage Location *</label>
                  <select
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Select…</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  {errors.location && <p className="text-xs text-destructive mt-1">{errors.location}</p>}
                </div>
              </div>

              {/* Total value preview */}
              {form.weightKg && form.purchasePrice && (
                <div className="px-4 py-3 rounded-lg bg-secondary border border-amber-200 flex justify-between items-center">
                  <span className="text-sm text-secondary-foreground font-medium">Estimated Total Value</span>
                  <span className="text-lg font-bold text-secondary-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    ₹{(Number(form.weightKg) * Number(form.purchasePrice)).toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-semibold hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#B91C1C" }}>
                  Add Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

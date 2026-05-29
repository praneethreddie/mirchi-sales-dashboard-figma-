import { useState } from "react";
import { Plus, X, TrendingUp, Printer, Eye } from "lucide-react";
import { sales as initialSales, customers, batches, type SaleRecord, type ChiliVariety, type Grade } from "./data/mockData";
import { printInvoice } from "../../lib/invoicePrinter";
import { activityLogger } from "../../lib/activityLogger";
import { useAuth } from "../../context/AuthContext";

const VARIETIES: ChiliVariety[] = ["Teja", "334", "Byadgi", "Guntur", "Wrinkled"];
const GRADES: Grade[] = ["A", "B", "C", "Premium"];

let invoiceCounter = 7;

export function SalesManagement() {
  const { user } = useAuth();
  const [sales, setSales] = useState<SaleRecord[]>(initialSales);
  const [showForm, setShowForm] = useState(false);
  const [showInvoice, setShowInvoice] = useState<SaleRecord | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Paid" | "Partial" | "Pending">("All");

  const [form, setForm] = useState({
    customerId: "",
    batchId: "",
    variety: "" as ChiliVariety | "",
    grade: "" as Grade | "",
    weightKg: "",
    bags: "",
    salePrice: "",
    paidAmount: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = sales
    .filter(s => statusFilter === "All" || s.paymentStatus === statusFilter)
    .filter(s =>
      s.customerName.toLowerCase().includes(search.toLowerCase()) ||
      s.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      s.variety.toLowerCase().includes(search.toLowerCase())
    );

  function validate() {
    const e: Record<string, string> = {};
    if (!form.customerId) e.customerId = "Select customer";
    if (!form.batchId) e.batchId = "Select batch";
    if (!form.weightKg || isNaN(Number(form.weightKg)) || Number(form.weightKg) <= 0) e.weightKg = "Enter valid weight";
    if (!form.bags || isNaN(Number(form.bags)) || Number(form.bags) <= 0) e.bags = "Enter valid bags";
    if (!form.salePrice || isNaN(Number(form.salePrice)) || Number(form.salePrice) <= 0) e.salePrice = "Enter valid price";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const customer = customers.find(c => c.id === form.customerId)!;
    const batch = batches.find(b => b.id === form.batchId)!;
    const weightKg = Number(form.weightKg);
    const bags = Number(form.bags);
    const salePrice = Number(form.salePrice);
    const paidAmount = Number(form.paidAmount) || 0;
    const totalAmount = weightKg * salePrice;
    const paymentStatus = paidAmount >= totalAmount ? "Paid" : paidAmount > 0 ? "Partial" : "Pending";

    const newSale: SaleRecord = {
      id: `INV-00${invoiceCounter}`,
      customerId: form.customerId,
      customerName: customer.name,
      batchIds: [form.batchId],
      variety: batch.variety,
      grade: batch.grade,
      weightKg,
      bags,
      salePrice,
      totalAmount,
      paymentStatus,
      paidAmount,
      date: new Date().toISOString().split("T")[0],
      invoiceNo: `MY/2024/00${invoiceCounter}`,
    };
    invoiceCounter++;
    
    // Log activity
    if (user) {
      activityLogger.addLog(
        user,
        "Sales",
        "Created",
        `Created invoice ${newSale.invoiceNo} for ${customer.name} - ${weightKg}kg @ ₹${salePrice}/kg`,
        {
          recordId: newSale.id,
          recordName: newSale.invoiceNo,
          changes: {
            customer: customer.name,
            amount: totalAmount,
            paid: paidAmount
          }
        }
      );
    }
    
    setSales(prev => [newSale, ...prev]);
    setForm({ customerId: "", batchId: "", variety: "", grade: "", weightKg: "", bags: "", salePrice: "", paidAmount: "" });
    setShowForm(false);
    setShowInvoice(newSale);
  }

  const totalSales = sales.reduce((s, r) => s + r.totalAmount, 0);
  const totalPending = sales.reduce((s, r) => s + (r.totalAmount - r.paidAmount), 0);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1>Sales / Dispatch</h1>
          <p className="text-sm text-muted-foreground">{sales.length} invoices · ₹{(totalSales / 100000).toFixed(1)}L total</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#B91C1C" }}
        >
          <Plus size={16} /> New Sale
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Revenue", value: `₹${(totalSales / 100000).toFixed(1)}L` },
          { label: "Pending Dues", value: `₹${(totalPending / 100000).toFixed(1)}L` },
          { label: "Invoices", value: sales.length.toString() },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-3 text-center">
            <div className="text-lg font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          placeholder="Search by customer, invoice, variety…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="flex rounded-lg overflow-hidden border border-border text-xs font-semibold">
          {(["All", "Paid", "Partial", "Pending"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["Invoice", "Date", "Customer", "Variety", "Weight", "Rate", "Amount", "Paid", "Status", ""].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                  <td className="px-3 py-2.5 font-mono text-xs font-semibold text-primary">{s.invoiceNo}</td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{s.date}</td>
                  <td className="px-3 py-2.5 font-medium whitespace-nowrap">{s.customerName}</td>
                  <td className="px-3 py-2.5">
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary">{s.variety}</span>
                  </td>
                  <td className="px-3 py-2.5 font-mono">{s.weightKg.toLocaleString("en-IN")} kg</td>
                  <td className="px-3 py-2.5 font-mono">₹{s.salePrice}</td>
                  <td className="px-3 py-2.5 font-mono font-bold">₹{s.totalAmount.toLocaleString("en-IN")}</td>
                  <td className="px-3 py-2.5 font-mono text-green-700">₹{s.paidAmount.toLocaleString("en-IN")}</td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.paymentStatus === "Paid" ? "bg-green-100 text-green-700" :
                      s.paymentStatus === "Partial" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>{s.paymentStatus}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => setShowInvoice(s)} className="p-1.5 rounded-md hover:bg-muted">
                      <Eye size={14} className="text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New sale modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-card w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl border border-border shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" />
                <h3>New Sale / Dispatch</h3>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-md hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Customer *</label>
                  <select value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">Select customer…</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.city}</option>)}
                  </select>
                  {errors.customerId && <p className="text-xs text-destructive mt-1">{errors.customerId}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Source Batch (FIFO) *</label>
                  <select value={form.batchId} onChange={e => setForm(f => ({ ...f, batchId: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">Select batch…</option>
                    {batches.filter(b => b.remainingKg > 0).sort((a, b) => a.date.localeCompare(b.date)).map(b => (
                      <option key={b.id} value={b.id}>
                        {b.id} — {b.variety} {b.grade} · {b.remainingKg.toLocaleString("en-IN")} kg left · {b.location}
                      </option>
                    ))}
                  </select>
                  {errors.batchId && <p className="text-xs text-destructive mt-1">{errors.batchId}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Weight (kg) *</label>
                  <input type="number" min="1" value={form.weightKg} onChange={e => setForm(f => ({ ...f, weightKg: e.target.value }))} placeholder="e.g. 1000"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  {errors.weightKg && <p className="text-xs text-destructive mt-1">{errors.weightKg}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Bags *</label>
                  <input type="number" min="1" value={form.bags} onChange={e => setForm(f => ({ ...f, bags: e.target.value }))} placeholder="e.g. 20"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  {errors.bags && <p className="text-xs text-destructive mt-1">{errors.bags}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Sale Price (₹/kg) *</label>
                  <input type="number" min="1" value={form.salePrice} onChange={e => setForm(f => ({ ...f, salePrice: e.target.value }))} placeholder="e.g. 220"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  {errors.salePrice && <p className="text-xs text-destructive mt-1">{errors.salePrice}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Advance Paid (₹)</label>
                  <input type="number" min="0" value={form.paidAmount} onChange={e => setForm(f => ({ ...f, paidAmount: e.target.value }))} placeholder="0"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>

              {form.weightKg && form.salePrice && (
                <div className="px-4 py-3 rounded-lg bg-secondary border border-amber-200 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-foreground">Total Amount</span>
                    <span className="font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      ₹{(Number(form.weightKg) * Number(form.salePrice)).toLocaleString("en-IN")}
                    </span>
                  </div>
                  {form.paidAmount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-foreground">Pending</span>
                      <span className="font-bold text-destructive" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        ₹{Math.max(0, Number(form.weightKg) * Number(form.salePrice) - Number(form.paidAmount)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-semibold hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#B91C1C" }}>
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice modal */}
      {showInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3>Invoice — {showInvoice.invoiceNo}</h3>
              <button onClick={() => setShowInvoice(null)} className="p-1 rounded-md hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">MIRCHI YARD</div>
                  <div className="text-xs text-muted-foreground">Guntur, Andhra Pradesh</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-primary">{showInvoice.invoiceNo}</div>
                  <div className="text-xs text-muted-foreground">{showInvoice.date}</div>
                </div>
              </div>

              <div className="border-t border-dashed border-border pt-3">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Bill To</div>
                <div className="font-semibold">{showInvoice.customerName}</div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Variety</span><span className="font-semibold">{showInvoice.variety} ({showInvoice.grade})</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span className="font-mono font-semibold">{showInvoice.weightKg.toLocaleString("en-IN")} kg / {showInvoice.bags} bags</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Rate</span><span className="font-mono font-semibold">₹{showInvoice.salePrice}/kg</span></div>
                <div className="flex justify-between border-t border-border pt-2 font-bold">
                  <span>Total Amount</span>
                  <span className="font-mono text-primary">₹{showInvoice.totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>Paid</span>
                  <span className="font-mono">₹{showInvoice.paidAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>Pending</span>
                  <span className="font-mono">₹{(showInvoice.totalAmount - showInvoice.paidAmount).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    printInvoice(showInvoice);
                    if (user) {
                      activityLogger.addLog(
                        user,
                        "Sales",
                        "Viewed",
                        `Printed invoice ${showInvoice.invoiceNo}`,
                        { recordId: showInvoice.id, recordName: showInvoice.invoiceNo }
                      );
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-semibold hover:bg-muted transition-colors"
                >
                  <Printer size={16} /> Print
                </button>
                <a
                  href={`https://wa.me/?text=Hello%20${encodeURIComponent(showInvoice.customerName)},%20your%20invoice%20${showInvoice.invoiceNo}%20is%20due.%20Amount:%20₹${showInvoice.totalAmount.toLocaleString("en-IN")}%0APlease%20clear%20the%20payment.%20Thank%20you!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (user) {
                      activityLogger.addLog(
                        user,
                        "Sales",
                        "Viewed",
                        `Sent WhatsApp reminder for invoice ${showInvoice.invoiceNo}`,
                        { recordId: showInvoice.id, recordName: showInvoice.invoiceNo }
                      );
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#25D366" }}
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

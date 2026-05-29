import { useState } from "react";
import { Plus, X, Wallet, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { payments as initialPayments, customers, suppliers, type Payment, type PaymentMode } from "./data/mockData";
import { activityLogger } from "../../lib/activityLogger";
import { useAuth } from "../../context/AuthContext";

const MODES: PaymentMode[] = ["Cash", "UPI", "Bank Transfer", "Cheque"];

export function PaymentsModule() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<"all" | "received" | "paid">("all");
  const [form, setForm] = useState({
    type: "received" as "received" | "paid",
    partyId: "",
    amount: "",
    mode: "" as PaymentMode | "",
    reference: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = payments.filter(p => tab === "all" || p.type === tab);
  const totalReceived = payments.filter(p => p.type === "received").reduce((s, p) => s + p.amount, 0);
  const totalPaid = payments.filter(p => p.type === "paid").reduce((s, p) => s + p.amount, 0);

  const parties = form.type === "received" ? customers : suppliers;

  function validate() {
    const e: Record<string, string> = {};
    if (!form.partyId) e.partyId = "Select party";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = "Enter valid amount";
    if (!form.mode) e.mode = "Select payment mode";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const party = parties.find(p => p.id === form.partyId)!;
    const newPayment: Payment = {
      id: `P${String(payments.length + 1).padStart(3, "0")}`,
      type: form.type,
      partyId: form.partyId,
      partyName: party.name,
      amount: Number(form.amount),
      mode: form.mode as PaymentMode,
      date: new Date().toISOString().split("T")[0],
      reference: form.reference || `REF-${Date.now()}`,
      notes: form.notes,
    };
    
    // Log activity
    if (user) {
      activityLogger.addLog(
        user,
        "Payments",
        "Created",
        `Recorded ${form.type === "received" ? "payment received" : "payment paid"} of ₹${newPayment.amount.toLocaleString("en-IN")} from/to ${party.name} via ${form.mode}`,
        {
          recordId: newPayment.id,
          recordName: newPayment.reference,
          changes: {
            type: form.type,
            partyName: party.name,
            amount: newPayment.amount,
            mode: form.mode
          }
        }
      );
    }
    
    setPayments(prev => [newPayment, ...prev]);
    setForm({ type: "received", partyId: "", amount: "", mode: "", reference: "", notes: "" });
    setShowForm(false);
  }

  const modeColors: Record<PaymentMode, string> = {
    Cash: "bg-green-100 text-green-700",
    UPI: "bg-purple-100 text-purple-700",
    "Bank Transfer": "bg-blue-100 text-blue-700",
    Cheque: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1>Payments</h1>
          <p className="text-sm text-muted-foreground">{payments.length} transactions recorded</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#B91C1C" }}
        >
          <Plus size={16} /> Record Payment
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Total Received</div>
          <div className="text-2xl font-bold text-green-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            ₹{(totalReceived / 100000).toFixed(2)}L
          </div>
          <div className="text-xs text-muted-foreground mt-1">From customers</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Total Paid Out</div>
          <div className="text-2xl font-bold text-destructive" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            ₹{(totalPaid / 100000).toFixed(2)}L
          </div>
          <div className="text-xs text-muted-foreground mt-1">To suppliers</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Net Position</div>
          <div className={`text-2xl font-bold ${totalReceived - totalPaid >= 0 ? "text-green-600" : "text-destructive"}`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            ₹{((totalReceived - totalPaid) / 100000).toFixed(2)}L
          </div>
          <div className="text-xs text-muted-foreground mt-1">Cash flow</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg overflow-hidden border border-border text-sm font-semibold w-fit">
        {(["all", "received", "paid"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 capitalize transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}>
            {t === "all" ? "All" : t === "received" ? "Received" : "Paid Out"}
          </button>
        ))}
      </div>

      {/* Payments list */}
      <div className="space-y-2">
        {filtered.map(p => (
          <div key={p.id} className="bg-card rounded-xl border border-border p-4 flex items-start gap-4 hover:border-primary/20 transition-colors">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${p.type === "received" ? "bg-green-100" : "bg-red-100"}`}>
              {p.type === "received"
                ? <ArrowDownLeft size={18} className="text-green-600" />
                : <ArrowUpRight size={18} className="text-red-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-sm">{p.partyName}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{p.date} · {p.reference}</div>
                  {p.notes && <div className="text-xs text-muted-foreground mt-1 italic">{p.notes}</div>}
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-lg font-bold ${p.type === "received" ? "text-green-600" : "text-destructive"}`}
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {p.type === "received" ? "+" : "−"}₹{p.amount.toLocaleString("en-IN")}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${modeColors[p.mode]}`}>{p.mode}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Record payment modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-xl border border-border shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-primary" />
                <h3>Record Payment</h3>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-md hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Type toggle */}
              <div className="flex rounded-lg overflow-hidden border border-border text-sm font-semibold">
                <button type="button" onClick={() => setForm(f => ({ ...f, type: "received", partyId: "" }))}
                  className={`flex-1 py-2.5 transition-colors ${form.type === "received" ? "bg-green-600 text-white" : "bg-card text-muted-foreground hover:bg-muted"}`}>
                  ↓ Received (from customer)
                </button>
                <button type="button" onClick={() => setForm(f => ({ ...f, type: "paid", partyId: "" }))}
                  className={`flex-1 py-2.5 transition-colors ${form.type === "paid" ? "bg-destructive text-white" : "bg-card text-muted-foreground hover:bg-muted"}`}>
                  ↑ Paid Out (to supplier)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  {form.type === "received" ? "Customer" : "Supplier"} *
                </label>
                <select value={form.partyId} onChange={e => setForm(f => ({ ...f, partyId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select…</option>
                  {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {errors.partyId && <p className="text-xs text-destructive mt-1">{errors.partyId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Amount (₹) *</label>
                  <input type="number" min="1" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="e.g. 50000"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Payment Mode *</label>
                  <select value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value as PaymentMode }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">Select…</option>
                    {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  {errors.mode && <p className="text-xs text-destructive mt-1">{errors.mode}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Reference / UTR / Cheque No.</label>
                <input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} placeholder="Optional"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional" rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-semibold hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#B91C1C" }}>
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

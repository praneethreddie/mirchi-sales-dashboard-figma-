import { useState, useRef, useEffect } from "react";
import { Plus, X, Search } from "lucide-react";
import { Supplier } from "../components/data/mockData";

interface SearchableSupplierInputProps {
  suppliers: Supplier[];
  value: string;
  onSelect: (supplierId: string) => void;
  onAddNew?: (supplierName: string) => void;
  error?: string;
}

export function SearchableSupplierInput({
  suppliers,
  value,
  onSelect,
  onAddNew,
  error,
}: SearchableSupplierInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierPhone, setNewSupplierPhone] = useState("");
  const [newSupplierCity, setNewSupplierCity] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = suppliers.filter(
    s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search)
  );

  const selected = suppliers.find(s => s.id === value);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowNewForm(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleAddNew() {
    if (!newSupplierName.trim()) return;
    onAddNew?.(newSupplierName);
    setNewSupplierName("");
    setNewSupplierPhone("");
    setNewSupplierCity("");
    setShowNewForm(false);
    setSearch("");
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-input-background text-sm">
        <Search size={14} className="text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search supplier or add new…"
          value={open ? search : selected?.name || ""}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onSelect("");
              setSearch("");
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {showNewForm ? (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">Add New Supplier</h4>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewForm(false);
                    setNewSupplierName("");
                    setNewSupplierPhone("");
                    setNewSupplierCity("");
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              </div>
              <input
                type="text"
                placeholder="Supplier name"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                className="w-full px-2 py-1.5 rounded border border-border bg-input-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={newSupplierPhone}
                onChange={(e) => setNewSupplierPhone(e.target.value)}
                className="w-full px-2 py-1.5 rounded border border-border bg-input-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                type="text"
                placeholder="City"
                value={newSupplierCity}
                onChange={(e) => setNewSupplierCity(e.target.value)}
                className="w-full px-2 py-1.5 rounded border border-border bg-input-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="button"
                onClick={handleAddNew}
                disabled={!newSupplierName.trim()}
                className="w-full px-3 py-1.5 rounded bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: "#B91C1C" }}
              >
                Add Supplier
              </button>
            </div>
          ) : (
            <div>
              {filtered.length === 0 && search.trim() ? (
                <div className="p-3 space-y-2">
                  <p className="text-xs text-muted-foreground">No suppliers found</p>
                  <button
                    type="button"
                    onClick={() => setShowNewForm(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-muted text-sm font-semibold text-primary transition-colors"
                    style={{ color: "#B91C1C" }}
                  >
                    <Plus size={14} /> Add "{search}" as new supplier
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filtered.map((supplier) => (
                    <button
                      key={supplier.id}
                      type="button"
                      onClick={() => {
                        onSelect(supplier.id);
                        setOpen(false);
                        setSearch("");
                      }}
                      className="w-full px-4 py-2.5 hover:bg-muted text-left transition-colors border-b last:border-0"
                    >
                      <div className="font-semibold text-sm">{supplier.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {supplier.city} • {supplier.phone}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Balance: ₹{supplier.balance.toLocaleString("en-IN")}
                      </div>
                    </button>
                  ))}
                  {suppliers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewForm(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 hover:bg-muted text-sm font-semibold text-primary transition-colors"
                      style={{ color: "#B91C1C" }}
                    >
                      <Plus size={14} /> Add New Supplier
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

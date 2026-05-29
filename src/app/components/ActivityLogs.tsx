import { useState } from "react";
import { FileText, Search, Filter, ChevronDown } from "lucide-react";
import { activityLogs, users } from "./data/mockData";
import { activityLogger } from "../../lib/activityLogger";

const MODULE_COLORS: Record<string, string> = {
  Sales: "bg-green-100 text-green-700",
  Purchase: "bg-blue-100 text-blue-700",
  Inventory: "bg-amber-100 text-amber-700",
  Payments: "bg-purple-100 text-purple-700",
  Users: "bg-red-100 text-red-700",
};

const ACTION_COLORS: Record<string, string> = {
  Created: "bg-green-100 text-green-700",
  Updated: "bg-amber-100 text-amber-700",
  Deleted: "bg-red-100 text-red-700",
  Viewed: "bg-muted text-muted-foreground",
  Login: "bg-blue-100 text-blue-700",
};

const MODULE_ICONS: Record<string, string> = {
  Sales: "📤",
  Purchase: "📥",
  Inventory: "📦",
  Payments: "💰",
  Users: "👤",
};

export function ActivityLogs() {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Load logs on mount
  const [logs] = useState(() => {
    activityLogger.loadLogs();
    const dbLogs = activityLogger.getLogs();
    // Combine with mock data for demo
    return [...dbLogs, ...activityLogs];
  });

  const filtered = logs.filter(log => {
    if (moduleFilter !== "All" && log.module !== moduleFilter) return false;
    if (userFilter !== "All" && log.userId !== userFilter) return false;
    if (actionFilter !== "All" && log.action !== actionFilter) return false;
    if (search && !log.description.toLowerCase().includes(search.toLowerCase()) &&
        !log.userName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div>
        <h1>Activity Logs</h1>
        <p className="text-sm text-muted-foreground">Full audit trail — {activityLogs.length} recorded actions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {["Sales", "Purchase", "Inventory", "Payments", "Users"].map(module => {
          const count = activityLogs.filter(l => l.module === module).length;
          return (
            <button key={module}
              onClick={() => setModuleFilter(moduleFilter === module ? "All" : module)}
              className={`bg-card rounded-xl border p-3 text-center transition-colors cursor-pointer ${
                moduleFilter === module ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}>
              <div className="text-xl mb-1">{MODULE_ICONS[module]}</div>
              <div className="text-lg font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{count}</div>
              <div className="text-xs text-muted-foreground">{module}</div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card">
          <Search size={15} className="text-muted-foreground shrink-0" />
          <input
            placeholder="Search logs by user or description…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <select value={userFilter} onChange={e => setUserFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30">
          <option value="All">All Users</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/30">
          <option value="All">All Actions</option>
          {["Created", "Updated", "Deleted", "Viewed", "Login"].map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        {(moduleFilter !== "All" || userFilter !== "All" || actionFilter !== "All" || search) && (
          <button onClick={() => { setModuleFilter("All"); setUserFilter("All"); setActionFilter("All"); setSearch(""); }}
            className="px-4 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-muted transition-colors whitespace-nowrap">
            Clear filters
          </button>
        )}
      </div>

      {/* Log entries */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText size={32} className="mb-3 opacity-30" />
            <p className="text-sm">No logs match your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(log => (
              <div key={log.id}>
                <button
                  onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                  className="w-full flex items-start gap-4 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                >
                  {/* Module icon */}
                  <div className="text-lg shrink-0 mt-0.5">{MODULE_ICONS[log.module]}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{log.userName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ACTION_COLORS[log.action]}`}>
                        {log.action}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${MODULE_COLORS[log.module]}`}>
                        {log.module}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{log.description}</p>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                    {log.details && (
                      <ChevronDown 
                        size={16} 
                        className={`mt-1 inline-block transition-transform ${expandedLogId === log.id ? 'rotate-180' : ''}`}
                      />
                    )}
                  </div>
                </button>

                {/* Expanded details */}
                {expandedLogId === log.id && log.details && (
                  <div className="px-4 py-3 bg-muted/20 border-t border-border space-y-2 text-sm">
                    {log.details.recordName && (
                      <div>
                        <span className="font-semibold text-muted-foreground">Record: </span>
                        <span>{log.details.recordName}</span>
                      </div>
                    )}
                    {log.details.recordId && (
                      <div>
                        <span className="font-semibold text-muted-foreground">ID: </span>
                        <span className="font-mono text-xs">{log.details.recordId}</span>
                      </div>
                    )}
                    {log.details.changes && Object.keys(log.details.changes).length > 0 && (
                      <div>
                        <span className="font-semibold text-muted-foreground block mb-1">Changes:</span>
                        <div className="ml-4 space-y-1">
                          {Object.entries(log.details.changes).map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{key}: {JSON.stringify(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Showing {filtered.length} of {logs.length} log entries · Logs are immutable and cannot be deleted
      </p>
    </div>
  );
}

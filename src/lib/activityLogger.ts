import { AuthUser } from "../lib/supabase";

export interface ActivityLogEntry {
  id: string;
  userId: string;
  userName: string;
  module: "Sales" | "Purchase" | "Inventory" | "Payments" | "Users";
  action: "Created" | "Updated" | "Deleted" | "Viewed" | "Login";
  description: string;
  timestamp: string;
  details?: {
    recordId?: string;
    recordName?: string;
    changes?: Record<string, any>;
  };
}

class ActivityLogger {
  private logs: ActivityLogEntry[] = [];

  /**
   * Load logs from localStorage (demo mode)
   */
  loadLogs() {
    const stored = localStorage.getItem("activity_logs");
    if (stored) {
      this.logs = JSON.parse(stored);
    }
  }

  /**
   * Save logs to localStorage (demo mode)
   */
  private saveLogs() {
    localStorage.setItem("activity_logs", JSON.stringify(this.logs));
  }

  /**
   * Add activity log entry
   */
  addLog(
    user: AuthUser,
    module: ActivityLogEntry["module"],
    action: ActivityLogEntry["action"],
    description: string,
    details?: ActivityLogEntry["details"]
  ) {
    const entry: ActivityLogEntry = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      userId: user.id,
      userName: user.name,
      module,
      action,
      description,
      timestamp: new Date().toISOString(),
      details,
    };

    this.logs.unshift(entry);
    this.saveLogs();
    return entry;
  }

  /**
   * Get all logs
   */
  getLogs(): ActivityLogEntry[] {
    return this.logs;
  }

  /**
   * Get logs filtered by module
   */
  getLogsByModule(module: ActivityLogEntry["module"]): ActivityLogEntry[] {
    return this.logs.filter(log => log.module === module);
  }

  /**
   * Get logs filtered by user
   */
  getLogsByUser(userId: string): ActivityLogEntry[] {
    return this.logs.filter(log => log.userId === userId);
  }

  /**
   * Clear all logs (demo cleanup)
   */
  clearLogs() {
    this.logs = [];
    localStorage.removeItem("activity_logs");
  }
}

export const activityLogger = new ActivityLogger();

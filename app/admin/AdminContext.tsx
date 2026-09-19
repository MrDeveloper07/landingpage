"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

export interface AdminRequestItem {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subdomain: string;
  recordType: "CNAME" | "A" | "AAAA" | "TXT";
  target: string;
  description?: string;
  repoUrl?: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  rejectionReason?: string;
  createdAt: string;
}

export interface AdminUserItem {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  maxSubdomains?: number;
  lastLoginAt?: string;
  createdAt: string;
  subdomainCount: number;
  approvedSubdomains: number;
}

export interface AuditLogItem {
  _id: string;
  action: string;
  category: "subdomain" | "user" | "security" | "system";
  actorEmail: string;
  target?: string;
  details: string;
  createdAt: string;
}

export interface AdminStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalUsers?: number;
  adminUsers?: number;
}

interface AdminContextType {
  adminUser: { name: string; email: string; role: string } | null;
  requests: AdminRequestItem[];
  stats: AdminStats;
  users: AdminUserItem[];
  auditLogs: AuditLogItem[];
  loading: boolean;
  actionLoading: string | null;
  fetchAdminData: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchAuditLogs: () => Promise<void>;
  handleApprove: (id: string) => Promise<void>;
  handleReject: (id: string, reason: string) => Promise<void>;
  handleDeleteRequest: (id: string, adminPassword: string) => Promise<{ success: boolean; error?: string }>;
  handleUpdateUser: (userId: string, data: { name?: string; email?: string; role?: string; maxSubdomains?: number }) => Promise<{ success: boolean; error?: string }>;
  handleToggleUserRole: (userId: string, currentRole: string) => Promise<void>;
  handleDeleteUser: (userId: string, adminPassword: string) => Promise<{ success: boolean; error?: string }>;
  handleCopy: (text: string, id: string) => void;
  copiedId: string | null;
  sessionReplacedModalOpen: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [requests, setRequests] = useState<AdminRequestItem[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalUsers: 0,
    adminUsers: 0,
  });
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sessionReplacedModalOpen, setSessionReplacedModalOpen] = useState(false);

  const fetchAdminData = useCallback(async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();

      if (authData.sessionTerminated || authData.reason === "session_replaced") {
        setSessionReplacedModalOpen(true);
        return;
      }

      if (!authRes.ok || !authData.authenticated) {
        router.push("/login");
        return;
      }

      if (authData.user.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setAdminUser(authData.user);

      // Fetch requests
      const res = await fetch("/api/admin/requests");
      const data = await res.json();

      if (data.sessionTerminated || data.reason === "session_replaced") {
        setSessionReplacedModalOpen(true);
        return;
      }

      if (res.ok) {
        setRequests(data.requests || []);
        setStats((prev) => ({
          ...prev,
          ...(data.stats || {}),
        }));
      }
    } catch (err) {
      console.error("Admin Load Error:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
        if (data.stats) {
          setStats((prev) => ({
            ...prev,
            totalUsers: data.stats.totalUsers,
            adminUsers: data.stats.adminUsers,
          }));
        }
      }
    } catch (err) {
      console.error("Fetch Users Error:", err);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/audit");
      const data = await res.json();
      if (res.ok) {
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Fetch Audit Logs Error:", err);
    }
  }, []);

  // Periodic background data auto-refresh (Every 10s + on window focus)
  useEffect(() => {
    fetchAdminData();
    fetchUsers();
    fetchAuditLogs();

    const refreshInterval = setInterval(() => {
      fetchAdminData();
      fetchUsers();
      fetchAuditLogs();
    }, 10000);

    const handleFocus = () => {
      fetchAdminData();
      fetchUsers();
      fetchAuditLogs();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchAdminData, fetchUsers, fetchAuditLogs]);

  // Session Heartbeat
  useEffect(() => {
    if (sessionReplacedModalOpen) return;

    const checkActiveSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.sessionTerminated || data.reason === "session_replaced") {
          setSessionReplacedModalOpen(true);
        }
      } catch {
        // Offline / network glitch
      }
    };

    const interval = setInterval(checkActiveSession, 15000);
    const handleFocus = () => checkActiveSession();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [sessionReplacedModalOpen]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      if (res.ok) {
        await fetchAdminData();
        await fetchAuditLogs();
      }
    } catch (err) {
      console.error("Approve error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          rejectionReason: reason || "Rejected by administrator",
        }),
      });

      if (res.ok) {
        await fetchAdminData();
        await fetchAuditLogs();
      }
    } catch (err) {
      console.error("Reject error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteRequest = async (
    id: string,
    adminPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Failed to delete subdomain request." };
      }

      await fetchAdminData();
      await fetchAuditLogs();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting request";
      console.error("Delete request error:", err);
      return { success: false, error: msg };
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateUser = async (userId: string, data: { name?: string; email?: string; role?: string; maxSubdomains?: number }) => {
    try {
      setActionLoading(userId);
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...data }),
      });
      const resData = await res.json();

      if (!res.ok) {
        return { success: false, error: resData.error || "Failed to update user" };
      }

      await fetchUsers();
      await fetchAuditLogs();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      console.error("Update user error:", err);
      return { success: false, error: msg };
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    try {
      setActionLoading(userId);
      const nextRole = currentRole === "admin" ? "user" : "admin";
      await handleUpdateUser(userId, { role: nextRole });
    } catch (err) {
      console.error("Toggle user role error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (
    userId: string,
    adminPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setActionLoading(userId);
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, adminPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Failed to delete user." };
      }

      await fetchUsers();
      await fetchAdminData();
      await fetchAuditLogs();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting user";
      console.error("Delete user error:", err);
      return { success: false, error: msg };
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        adminUser,
        requests,
        stats,
        users,
        auditLogs,
        loading,
        actionLoading,
        fetchAdminData,
        fetchUsers,
        fetchAuditLogs,
        handleApprove,
        handleReject,
        handleDeleteRequest,
        handleUpdateUser,
        handleToggleUserRole,
        handleDeleteUser,
        handleCopy,
        copiedId,
        sessionReplacedModalOpen,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

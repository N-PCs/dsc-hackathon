"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/authContext";
import { AdminUser } from "@/types";

export const DEFAULT_AUTHORIZED_ADMINS: AdminUser[] = [
  { email: "neelpandeyofficial@gmail.com", name: "Neel Pandey", role: "Superadmin", department: "Data Science Club Lead", addedAt: "2026-08-20" },
  { email: "varun.25bce10360@vitbhopal.ac.in", name: "Neel Pandey", role: "Superadmin", department: "Data Science Club Lead", addedAt: "2026-08-20" },
  { email: "dsc.vitbhopal@gmail.com", name: "DSC Executive Council", role: "Lead Organizer", department: "Core Operations", addedAt: "2026-08-15" },
  { email: "admin@vitbhopal.ac.in", name: "VIT Operations Head", role: "Superadmin", department: "Academic & Event Affairs", addedAt: "2026-08-10" },
  { email: "lead.origin@vitbhopal.ac.in", name: "Origin Convener", role: "Lead Organizer", department: "Hackathon Operations", addedAt: "2026-08-12" },
  { email: "faculty.advisor@vitbhopal.ac.in", name: "Dr. Faculty Coordinator", role: "Faculty Advisor", department: "School of Computing Science", addedAt: "2026-08-10" },
  { email: "jury.chair@origin.org", name: "Chief Evaluation Jury", role: "Jury Chair", department: "Industry Rubric Panel", addedAt: "2026-08-14" },
];

export function useAdminAuth() {
  const { user: firebaseUser, signOut: firebaseSignOut, signInWithGoogle, signInWithEmail } = useAuth();

  const [adminWhitelist, setAdminWhitelist] = useState<AdminUser[]>(DEFAULT_AUTHORIZED_ADMINS);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [authError, setAuthError] = useState("");

  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<
    "Superadmin" | "Lead Organizer" | "Jury Chair" | "Operations Lead" | "Faculty Advisor"
  >("Lead Organizer");
  const [newAdminDept, setNewAdminDept] = useState("Hackathon Operations");
  const [addAdminSuccess, setAddAdminSuccess] = useState("");

  // One-time client-only hydration
  useEffect(() => {
    try {
      const savedWhitelist = localStorage.getItem("origin_admin_whitelist");
      if (savedWhitelist) setAdminWhitelist(JSON.parse(savedWhitelist));
    } catch (_e) {
      localStorage.removeItem("origin_admin_whitelist");
    }
    try {
      const savedAdmin = localStorage.getItem("origin_active_admin");
      if (savedAdmin) setCurrentAdmin(JSON.parse(savedAdmin));
    } catch (_e) {
      localStorage.removeItem("origin_active_admin");
    }
    setHasHydrated(true);
  }, []);

  // Helper to fetch whitelist from backend (requires admin auth)
  const fetchWhitelist = async (adminEmail: string) => {
    try {
      const res = await fetch("/api/admin/whitelist", {
        headers: { "x-admin-email": adminEmail },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.authorizedAdmins)) {
        setAdminWhitelist(data.authorizedAdmins);
        localStorage.setItem("origin_admin_whitelist", JSON.stringify(data.authorizedAdmins));
      }
    } catch (_e) { /* ignore */ }
  };

  // 🔥 FIX: verify email via backend before setting admin
  useEffect(() => {
    if (!firebaseUser?.email) {
      setCurrentAdmin(null);
      localStorage.removeItem("origin_active_admin");
      return;
    }

    const email = firebaseUser.email.toLowerCase();

    const verifyAndFetch = async () => {
      try {
        const res = await fetch("/api/admin/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (data.success && data.admin) {
          setCurrentAdmin(data.admin);
          localStorage.setItem("origin_active_admin", JSON.stringify(data.admin));
          // Now fetch whitelist
          await fetchWhitelist(data.admin.email);
        } else {
          setCurrentAdmin(null);
          localStorage.removeItem("origin_active_admin");
        }
      } catch (_e) {
        setCurrentAdmin(null);
        localStorage.removeItem("origin_active_admin");
      }
    };

    verifyAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser]);

  const handleAddNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminName.trim() || !currentAdmin) return;

    const emailToAdd = newAdminEmail.trim().toLowerCase();
    const existing = adminWhitelist.find((a) => a.email.toLowerCase() === emailToAdd);
    if (existing) {
      alert("This email is already in the authorized admin directory.");
      return;
    }

    const newAdminObj: AdminUser = {
      email: emailToAdd,
      name: newAdminName.trim(),
      role: newAdminRole,
      department: newAdminDept.trim() || "Hackathon Operations",
      addedAt: new Date().toISOString().split("T")[0],
    };

    try {
      await fetch("/api/admin/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-email": currentAdmin.email },
        body: JSON.stringify(newAdminObj),
      });
    } catch (_e) {}

    // Refresh whitelist from backend
    await fetchWhitelist(currentAdmin.email);

    setNewAdminEmail("");
    setNewAdminName("");
    setAddAdminSuccess(`Added ${newAdminObj.name} (${newAdminObj.email}) to authorized admin whitelist.`);
    setTimeout(() => setAddAdminSuccess(""), 4000);
  };

  const handleRemoveAdmin = async (emailToRemove: string) => {
    if (adminWhitelist.length <= 1) {
      alert("Cannot remove the only remaining superadministrator.");
      return;
    }
    if (currentAdmin?.email.toLowerCase() === emailToRemove.toLowerCase()) {
      alert("You cannot revoke access for your own currently active session.");
      return;
    }
    if (!confirm(`Revoke admin privileges for ${emailToRemove}?`)) return;

    try {
      await fetch(`/api/admin/whitelist/${encodeURIComponent(emailToRemove)}`, {
        method: "DELETE",
        headers: { "x-admin-email": currentAdmin?.email || "" },
      });
    } catch (_e) {}

    // Refresh whitelist
    if (currentAdmin) await fetchWhitelist(currentAdmin.email);
  };

  async function handleSignOut() {
    setCurrentAdmin(null);
    localStorage.removeItem("origin_active_admin");
    setOtpInput("");
    setAuthError("");
    try {
      await firebaseSignOut();
    } catch (_e) {}
  }

  return {
    firebaseUser,
    signInWithGoogle,
    signInWithEmail,
    adminWhitelist,
    currentAdmin,
    hasHydrated,
    emailInput,
    setEmailInput,
    otpInput,
    setOtpInput,
    authError,
    setAuthError,
    newAdminEmail,
    setNewAdminEmail,
    newAdminName,
    setNewAdminName,
    newAdminRole,
    setNewAdminRole,
    newAdminDept,
    setNewAdminDept,
    addAdminSuccess,
    handleAddNewAdmin,
    handleRemoveAdmin,
    handleSignOut,
    fetchWhitelist, 
  };
}
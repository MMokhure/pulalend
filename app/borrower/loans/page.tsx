"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

const navItems = [
  {
    label: "Dashboard",
    href: "/borrower/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "My Loans",
    href: "/borrower/loans",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Apply for Loan",
    href: "/borrower/apply",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    label: "Repayments",
    href: "/borrower/repayments",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: "Extension Requests",
    href: "/borrower/extensions",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "KYC",
    href: "/borrower/kyc",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l7 4v6c0 4.418-2.686 7.708-7 10-4.314-2.292-7-5.582-7-10V6l7-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/borrower/profile",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/borrower/settings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function BorrowerLoansPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loans, setLoans] = useState<any[]>([]);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(userData);
    if (parsed.userType !== "borrower") {
      router.push("/login");
      return;
    }
    setUser(parsed);
    load(parsed.id);
  }, [router]);

  const load = async (userId: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/borrower/loans?userId=${userId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load loans");
        return;
      }
      setLoans(data.loans || []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const cancelLoan = async (loanId: number) => {
    if (!user) return;
    const confirmed = window.confirm("Cancel this loan request?");
    if (!confirmed) return;

    setCancellingId(loanId);
    setError("");

    try {
      const res = await fetch("/api/borrower/loans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, loanId, action: "cancel" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to cancel loan");
        return;
      }
      await load(user.id);
    } catch {
      setError("Network error");
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout userType="borrower" navItems={navItems} title="My Loans">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy-deep">Loan Requests</h2>
          <Link
            href="/borrower/apply"
            className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition"
          >
            Apply
          </Link>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : loans.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 mb-4">No loan requests yet.</p>
              <Link
                href="/borrower/apply"
                className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition"
              >
                Apply for a Loan
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-3">ID</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Duration</th>
                    <th className="pb-3">Interest</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Requested</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((l) => (
                    <tr key={l.id} className="border-t border-gray-50">
                      <td className="py-3 font-medium">#{l.id}</td>
                      <td className="py-3">P{Number(l.amount).toLocaleString()}</td>
                      <td className="py-3">{l.durationMonths} mo</td>
                      <td className="py-3">{l.interestRate}%</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            l.status === "active"
                              ? "bg-green-100 text-green-700"
                              : l.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : l.status === "approved"
                              ? "bg-blue-100 text-blue-700"
                              : l.status === "funded"
                              ? "bg-purple-100 text-purple-700"
                              : l.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : l.status === "cancelled"
                              ? "bg-gray-200 text-gray-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">
                        {new Date(l.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        {l.status === "pending" ? (
                          <button
                            type="button"
                            onClick={() => cancelLoan(l.id)}
                            disabled={cancellingId === l.id}
                            className="text-sm text-red-600 hover:text-red-700 disabled:opacity-60"
                          >
                            {cancellingId === l.id ? "Cancelling..." : "Cancel"}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

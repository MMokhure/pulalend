"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Loan Requests",
    href: "/admin/loans",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "KYC Review",
    href: "/admin/kyc",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.866-3.582 7-8 7a9.985 9.985 0 01-1.515-.115 5.972 5.972 0 001.515-4.385c0-3.866 3.582-7 8-7s8 3.134 8 7a5.972 5.972 0 01-1.515 4.385A9.985 9.985 0 0120 18c-4.418 0-8-3.134-8-7z" />
      </svg>
    ),
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function AdminLoansPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loans, setLoans] = useState<any[]>([]);
  const [editing, setEditing] = useState<Record<number, { interestRate: string; riskGrade: string }>>({});

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(userData);
    if (parsed.userType !== "admin") {
      router.push("/login");
      return;
    }
    setUser(parsed);
    load();
  }, [router]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/loans?status=pending");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load loans");
        return;
      }
      setLoans(data.loans || []);
      const initial: any = {};
      (data.loans || []).forEach((l: any) => {
        initial[l.id] = {
          interestRate: String(l.interestRate ?? 12),
          riskGrade: String(l.riskGrade ?? "C"),
        };
      });
      setEditing(initial);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const act = async (loanId: number, action: "approve" | "reject") => {
    setError("");
    const edit = editing[loanId] || { interestRate: "12", riskGrade: "C" };

    try {
      const res = await fetch("/api/admin/loans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanId,
          action,
          interestRate: action === "approve" ? Number(edit.interestRate) : undefined,
          riskGrade: action === "approve" ? edit.riskGrade : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update loan");
        return;
      }
      await load();
    } catch {
      setError("Network error");
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout userType="admin" navItems={navItems} title="Loan Requests">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-navy-deep">Pending Loan Requests</h2>
          <p className="text-gray-600 text-sm mt-1">Approve or reject borrower loan requests</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : loans.length === 0 ? (
            <p className="text-gray-600">No pending loans.</p>
          ) : (
            <div className="space-y-4">
              {loans.map((l) => (
                <div key={l.id} className="border border-gray-100 rounded-xl p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <div className="text-sm text-gray-500">
                        Loan #{l.id} • Borrower: {l.borrower.firstName} {l.borrower.lastName} ({l.borrower.email})
                      </div>
                      <div className="text-xl font-bold text-navy-deep mt-1">
                        P{Number(l.amount).toLocaleString()} for {l.durationMonths} months
                      </div>
                      <div className="text-gray-600 mt-2 line-clamp-2">{l.purpose}</div>
                      <div className="text-sm text-gray-500 mt-2">
                        Requested: {new Date(l.requestedAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="w-full lg:w-[420px] space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Interest Rate (%)</label>
                          <input
                            type="number"
                            min={0}
                            step={0.1}
                            value={editing[l.id]?.interestRate ?? "12"}
                            onChange={(e) =>
                              setEditing((ed) => ({
                                ...ed,
                                [l.id]: { ...(ed[l.id] || {}), interestRate: e.target.value },
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Risk Grade</label>
                          <select
                            value={editing[l.id]?.riskGrade ?? "C"}
                            onChange={(e) =>
                              setEditing((ed) => ({
                                ...ed,
                                [l.id]: { ...(ed[l.id] || {}), riskGrade: e.target.value },
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none bg-white"
                          >
                            {(["A", "B", "C", "D", "E"] as const).map((g) => (
                              <option key={g} value={g}>
                                {g}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => act(l.id, "approve")}
                          className="flex-1 px-4 py-2 bg-growth-green text-white rounded-lg hover:bg-green-700 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => act(l.id, "reject")}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

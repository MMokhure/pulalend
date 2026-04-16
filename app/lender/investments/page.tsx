"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

const navItems = [
  {
    label: "Dashboard",
    href: "/lender/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Opportunities",
    href: "/lender/opportunities",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    label: "Loans Assigned",
    href: "/lender/loans-assigned",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "My Investments",
    href: "/lender/investments",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Portfolio",
    href: "/lender/portfolio",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 10H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Transactions",
    href: "/lender/transactions",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Commission Info",
    href: "/lender/commission-info",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Withdrawals",
    href: "/lender/withdrawals",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/lender/profile",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function LenderInvestmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [investments, setInvestments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(userData);
    if (parsed.userType !== "lender") {
      router.push("/login");
      return;
    }
    setUser(parsed);
  }, [router]);

  useEffect(() => {
    if (user) {
      loadInvestments();
    }
  }, [user, filter]);

  const loadInvestments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/lender/investments?userId=${user.id}&status=${filter}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load investments");
        return;
      }
      setInvestments(data.investments || []);
      setStats(data.stats);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout userType="lender" navItems={navItems} title="My Investments">
      {/* Summary Stats */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
            <div className="text-sm text-white/80 mb-2">Total Investments</div>
            <div className="text-3xl font-bold">{stats.totalInvestments}</div>
            <div className="text-sm text-white/80 mt-2">
              {stats.activeCount} active • {stats.completedCount} completed
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
            <div className="text-sm text-white/80 mb-2">Total Invested</div>
            <div className="text-3xl font-bold">P{(stats.totalInvested / 1000).toFixed(1)}k</div>
            <div className="text-sm text-white/80 mt-2">Principal amount</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6">
            <div className="text-sm text-white/80 mb-2">Expected Return</div>
            <div className="text-3xl font-bold">P{(stats.totalExpectedReturn / 1000).toFixed(1)}k</div>
            <div className="text-sm text-white/80 mt-2">Projected earnings</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
            <div className="text-sm text-white/80 mb-2">Actual Return</div>
            <div className="text-3xl font-bold">P{(stats.totalActualReturn / 1000).toFixed(1)}k</div>
            <div className="text-sm text-white/80 mt-2">
              {stats.defaultedCount > 0 && `${stats.defaultedCount} defaulted`}
            </div>
          </div>
        </div>
      )}

      {/* Investments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-navy-deep">All Investments</h2>
              <p className="text-gray-600 text-sm mt-1">Track your investment portfolio performance</p>
            </div>
          </div>

          {/* Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="defaulted">Defaulted</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500">Loading investments...</p>
          ) : investments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 font-medium">No investments found</p>
              <p className="text-sm text-gray-500 mt-1">Start investing in loan opportunities</p>
              <Link
                href="/lender/opportunities"
                className="inline-block mt-4 bg-primary-blue hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
              >
                Browse Opportunities
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {investments.map((inv) => (
                <div key={inv.id} className="border border-gray-100 rounded-xl p-5 hover:border-primary-blue transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-navy-deep">
                          Loan #{inv.loan.loanNumber || inv.loan.id}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          inv.investmentStatus === "active" 
                            ? "bg-green-100 text-green-700" 
                            : inv.investmentStatus === "completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {inv.investmentStatus}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          inv.loan.riskGrade === "A" ? "bg-green-100 text-green-700" :
                          inv.loan.riskGrade === "B" ? "bg-blue-100 text-blue-700" :
                          inv.loan.riskGrade === "C" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          Risk {inv.loan.riskGrade}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Borrower</p>
                          <p className="font-medium">{inv.borrower.firstName} {inv.borrower.lastName}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Investment Amount</p>
                          <p className="font-medium text-primary-blue">P{inv.investmentAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Expected Return</p>
                          <p className="font-medium text-green-600">P{inv.expectedReturn.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Actual Return</p>
                          <p className="font-medium">P{inv.actualReturn.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Purpose</p>
                          <p className="font-medium">{inv.loan.purpose}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Interest Rate</p>
                          <p className="font-medium">{inv.loan.interestRate}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Duration</p>
                          <p className="font-medium">{inv.loan.durationMonths} months</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Invested Date</p>
                          <p className="font-medium">{new Date(inv.investedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Repayment Progress */}
                  {inv.investmentStatus === "active" && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Repayment Progress</span>
                        <span className="text-sm font-semibold text-primary-blue">
                          {inv.repaymentProgress.progressPercent}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div 
                          className="bg-primary-blue h-2.5 rounded-full"
                          style={{ width: `${Math.min(inv.repaymentProgress.progressPercent, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>P{inv.repaymentProgress.totalRepaid.toLocaleString()} repaid</span>
                        <span>P{inv.repaymentProgress.totalDue.toLocaleString()} total</span>
                      </div>
                      {inv.repaymentProgress.overdueCount > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>{inv.repaymentProgress.overdueCount} overdue payment(s)</span>
                        </div>
                      )}
                    </div>
                  )}

                  {inv.investmentStatus === "completed" && inv.completedAt && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Completed:</span>{" "}
                        {new Date(inv.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

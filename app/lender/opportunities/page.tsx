"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

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

export default function LenderOpportunitiesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loans, setLoans] = useState<any[]>([]);
  const [funding, setFunding] = useState<Record<number, string>>({});

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
    load();
  }, [router]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/lender/opportunities");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load opportunities");
        return;
      }
      setLoans(data.loans || []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const fundLoan = async (loanId: number) => {
    const amountStr = funding[loanId];
    const amount = Number(amountStr);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid funding amount");
      return;
    }

    setError("");
    try {
      const res = await fetch("/api/lender/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, loanId, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Funding failed");
        return;
      }
      setFunding((f) => ({ ...f, [loanId]: "" }));
      await load();
    } catch {
      setError("Network error");
    }
  };

  if (!user) return null;

  const getRiskColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'E': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLabel = (grade: string) => {
    switch (grade) {
      case 'A': return 'Excellent';
      case 'B': return 'Good';
      case 'C': return 'Fair';
      case 'D': return 'Poor';
      case 'E': return 'High Risk';
      default: return 'Unrated';
    }
  };

  return (
    <DashboardLayout userType="lender" navItems={navItems} title="Loan Opportunities">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-navy-deep">Investment Opportunities</h2>
        <p className="text-gray-600">Browse and fund approved loans with detailed risk assessment</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-blue border-t-transparent"></div>
          <p className="text-gray-500 mt-4">Loading opportunities...</p>
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 10H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700">No Opportunities Available</h3>
          <p className="text-gray-600 mt-2">There are no approved loans open for funding right now.</p>
          <p className="text-gray-500 text-sm mt-1">Check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {loans.map((loan) => (
            <div key={loan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-navy-deep to-primary-blue text-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold">P{Number(loan.amount).toLocaleString()}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(loan.riskGrade)}`}>
                        Grade {loan.riskGrade} - {getRiskLabel(loan.riskGrade)}
                      </span>
                    </div>
                    <p className="text-white/80 mt-1">{loan.loanNumber} • {loan.borrowerName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-growth-green">{loan.interestRate}%</div>
                    <div className="text-white/80 text-sm">{loan.durationMonths} months</div>
                  </div>
                </div>
              </div>

              {/* Funding Progress */}
              <div className="p-6 bg-gray-50">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-gray-600">Funding Progress</span>
                  <span className="font-semibold text-navy-deep">
                    P{Number(loan.fundedAmount).toLocaleString()} / P{Number(loan.amount).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-growth-green to-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (loan.fundedAmount / loan.amount) * 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-semibold text-growth-green">P{Number(loan.remainingAmount).toLocaleString()}</span> remaining
                </p>
              </div>

              {/* Loan Details */}
              <div className="p-6">
                <h4 className="font-semibold text-navy-deep mb-3">Loan Purpose</h4>
                <p className="text-gray-700">{loan.purpose}</p>
              </div>

              {/* Risk Assessment Section */}
              <div className="px-6 pb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <h4 className="font-semibold text-navy-deep mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Risk Assessment
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Credit Score */}
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="text-xs text-gray-500 mb-1">Credit Score</div>
                      <div className="text-2xl font-bold text-navy-deep">{loan.creditScore || 'N/A'}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {loan.creditScore >= 750 ? 'Excellent' :
                         loan.creditScore >= 700 ? 'Very Good' :
                         loan.creditScore >= 650 ? 'Good' :
                         loan.creditScore >= 600 ? 'Fair' : 'Poor'}
                      </div>
                    </div>

                    {/* Default Probability */}
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="text-xs text-gray-500 mb-1">Default Risk</div>
                      <div className="text-2xl font-bold text-orange-600">{loan.defaultProbability}%</div>
                      <div className="text-xs text-gray-500 mt-1">Probability</div>
                    </div>

                    {/* Completion Rate */}
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="text-xs text-gray-500 mb-1">Completion Rate</div>
                      <div className="text-2xl font-bold text-growth-green">{loan.completionRate}%</div>
                      <div className="text-xs text-gray-500 mt-1">{loan.completedLoans}/{loan.totalLoans} loans</div>
                    </div>

                    {/* On-Time Payments */}
                    {loan.repaymentHistory && (
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <div className="text-xs text-gray-500 mb-1">On-Time Payments</div>
                        <div className="text-2xl font-bold text-primary-blue">{loan.repaymentHistory.onTimePercentage}%</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {loan.repaymentHistory.onTime}/{loan.repaymentHistory.onTime + loan.repaymentHistory.late} payments
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Metrics */}
                  {(loan.debtToIncomeRatio > 0 || loan.loanToIncomeRatio > 0) && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {loan.debtToIncomeRatio > 0 && (
                        <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100">
                          <span className="text-sm text-gray-600">Debt-to-Income Ratio</span>
                          <span className="font-semibold text-navy-deep">{loan.debtToIncomeRatio}%</span>
                        </div>
                      )}
                      {loan.loanToIncomeRatio > 0 && (
                        <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100">
                          <span className="text-sm text-gray-600">Loan-to-Income Ratio</span>
                          <span className="font-semibold text-navy-deep">{loan.loanToIncomeRatio}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Investment Action */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Investment Amount (P)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={loan.remainingAmount}
                      value={funding[loan.id] || ""}
                      onChange={(e) => setFunding((f) => ({ ...f, [loan.id]: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-growth-green focus:border-transparent outline-none"
                      placeholder={`Max: P${Number(loan.remainingAmount).toLocaleString()}`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum: P100 • Available to fund: P{Number(loan.remainingAmount).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => fundLoan(loan.id)}
                    disabled={!funding[loan.id] || Number(funding[loan.id]) <= 0}
                    className="px-8 py-3 bg-growth-green text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    Invest Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

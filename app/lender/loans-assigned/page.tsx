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

export default function LoansAssignedPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loansAssigned, setLoansAssigned] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    loadData(parsed.id);
  }, [router]);

  const loadData = async (userId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lender/loans-assigned?userId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setLoansAssigned(data.loansAssigned || []);
        setSummary(data.summary || {});
      } else {
        setError(data.error || "Failed to load data");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <DashboardLayout userType="lender" navItems={navItems} title="Loans Assigned">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userType="lender" navItems={navItems} title="Loans Assigned">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="lender" navItems={navItems} title="Loans Assigned to Me">
      <div className="space-y-6">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Total Loans</p>
              <p className="text-3xl font-bold text-primary-blue">{summary.totalLoansAssigned}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Amount Lent</p>
              <p className="text-3xl font-bold text-navy-deep">
                P{summary.totalAmountLent.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Expected Return</p>
              <p className="text-3xl font-bold text-green-600">
                P{summary.totalExpectedReturn.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Interest Expected</p>
              <p className="text-3xl font-bold text-accent-orange">
                P{summary.totalInterestExpected.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Loans List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-navy-deep mb-4">
            All Assigned Loans ({loansAssigned.length})
          </h2>

          {loansAssigned.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">No loans assigned yet</p>
              <p className="text-sm mt-1">Once admin assigns loans to you, they will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loansAssigned.map((loan) => (
                <div key={loan.id} className="border border-gray-200 rounded-lg p-5 hover:border-primary-blue transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-navy-deep">
                          Loan #{loan.loanNumber}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          loan.status === 'approved' || loan.status === 'active' ? 'bg-green-100 text-green-700' :
                          loan.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          loan.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {loan.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Borrower: <span className="font-medium">{loan.borrower.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">Total Loan</div>
                      <div className="text-xl font-bold text-gray-700">
                        P{loan.totalLoanAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-3">
                    <div className="text-xs font-semibold text-blue-800 mb-2">MY PORTION</div>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-blue-600 mb-1">Amount Lent</div>
                        <div className="font-bold text-blue-900">
                          P{loan.myPortion.amountLent.toLocaleString()}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          ({loan.myPortion.percentageOfLoan}% of loan)
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-600 mb-1">Interest</div>
                        <div className="font-bold text-green-700">
                          P{loan.myPortion.interestAmount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-600 mb-1">Expected Return</div>
                        <div className="font-bold text-blue-900">
                          P{loan.myPortion.totalExpectedReturn.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-600 mb-1">Received</div>
                        <div className="font-bold text-gray-700">
                          P{loan.myPortion.amountReceived.toLocaleString()}
                        </div>
                        <div className={`text-xs mt-1 px-2 py-0.5 rounded inline-block ${
                          loan.myPortion.status === 'fully_paid' ? 'bg-green-100 text-green-700' :
                          loan.myPortion.status === 'active' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {loan.myPortion.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">Interest Rate</div>
                      <div className="font-semibold">{loan.interestRate}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Duration</div>
                      <div className="font-semibold">{loan.durationMonths} month{loan.durationMonths !== 1 ? 's' : ''}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Assigned On</div>
                      <div className="font-semibold">
                        {loan.approvedAt ? new Date(loan.approvedAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Credit Score</div>
                      <div className="font-semibold">{loan.borrower.creditScore || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Purpose</div>
                    <div className="text-sm text-gray-700">{loan.purpose}</div>
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

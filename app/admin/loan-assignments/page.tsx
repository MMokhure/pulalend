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
    label: "Users",
    href: "/admin/users",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    label: "Loans",
    href: "/admin/loans",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Assign Lenders",
    href: "/admin/loan-assignments",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "KYC Review",
    href: "/admin/kyc",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Withdrawals",
    href: "/admin/withdrawals",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: "Pay Commission",
    href: "/admin/commission-payments",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

interface LenderAssignment {
  lenderId: number;
  amount: string;
}

export default function AdminLoanAssignmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [pendingLoans, setPendingLoans] = useState<any[]>([]);
  const [availableLenders, setAvailableLenders] = useState<any[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [lenderAssignments, setLenderAssignments] = useState<LenderAssignment[]>([
    { lenderId: 0, amount: "" }
  ]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    loadData(parsed.id);
  }, [router]);

  const loadData = async (userId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/loan-assignments?userId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setPendingLoans(data.pendingLoans || []);
        setAvailableLenders(data.availableLenders || []);
      } else {
        setError(data.error || "Failed to load data");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const selectLoan = (loan: any) => {
    setSelectedLoan(loan);
    // Auto-fill with single lender assignment
    setLenderAssignments([{ lenderId: 0, amount: loan.amount.toString() }]);
    setError("");
    setSuccess("");
  };

  const addLenderAssignment = () => {
    setLenderAssignments([...lenderAssignments, { lenderId: 0, amount: "" }]);
  };

  const removeLenderAssignment = (index: number) => {
    setLenderAssignments(lenderAssignments.filter((_, i) => i !== index));
  };

  const updateAssignment = (index: number, field: keyof LenderAssignment, value: any) => {
    const updated = [...lenderAssignments];
    updated[index] = { ...updated[index], [field]: value };
    setLenderAssignments(updated);
  };

  const getTotalAssigned = () => {
    return lenderAssignments.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  };

  const getRemainingAmount = () => {
    if (!selectedLoan) return 0;
    return selectedLoan.amount - getTotalAssigned();
  };

  const calculateROI = (amount: number) => {
    if (!selectedLoan) return { interest: 0, total: 0 };
    const principal = Number(amount);
    const rate = selectedLoan.interestRate;
    const months = selectedLoan.durationMonths;
    const interest = (principal * rate * months) / (100 * 12);
    return {
      interest: interest,
      total: principal + interest,
    };
  };

  const submitAssignment = async () => {
    if (!selectedLoan || !user) return;

    // Validation
    const totalAssigned = getTotalAssigned();
    if (Math.abs(totalAssigned - selectedLoan.amount) > 0.01) {
      setError(`Total assigned amount (P${totalAssigned}) must match loan amount (P${selectedLoan.amount})`);
      return;
    }

    const validAssignments = lenderAssignments.filter(a => a.lenderId > 0 && Number(a.amount) > 0);
    if (validAssignments.length === 0) {
      setError("Please assign at least one lender");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/loan-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          loanId: selectedLoan.id,
          lenderAssignments: validAssignments.map(a => ({
            lenderId: Number(a.lenderId),
            amount: Number(a.amount),
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to assign lenders");
        return;
      }

      setSuccess("Lenders assigned successfully! Loan approved and borrower notified.");
      setSelectedLoan(null);
      setLenderAssignments([{ lenderId: 0, amount: "" }]);
      
      // Reload data
      setTimeout(() => {
        loadData(user.id);
        setSuccess("");
      }, 2000);
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout userType="admin" navItems={navItems} title="Assign Lenders to Loans">
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            {/* Pending Loans List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-navy-deep mb-4">
                Pending Loan Applications ({pendingLoans.length})
              </h2>
              
              {pendingLoans.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No pending loan applications
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan #</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrower</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pendingLoans.map((loan) => (
                        <tr key={loan.id} className={selectedLoan?.id === loan.id ? "bg-blue-50" : ""}>
                          <td className="px-4 py-3 text-sm font-medium">{loan.loanNumber}</td>
                          <td className="px-4 py-3 text-sm">
                            <div>{loan.borrowerName}</div>
                            <div className="text-xs text-gray-500">{loan.borrowerEmail}</div>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold">P{loan.amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm">{loan.durationMonths} mo</td>
                          <td className="px-4 py-3 text-sm">{loan.interestRate}%</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">{loan.riskGrade}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(loan.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => selectLoan(loan)}
                              className="px-3 py-1 bg-primary-blue text-white rounded hover:bg-blue-700 text-xs"
                            >
                              Assign
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Assignment Interface */}
            {selectedLoan && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-navy-deep">
                    Assign Lenders: {selectedLoan.loanNumber}
                  </h2>
                  <button
                    onClick={() => setSelectedLoan(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Loan Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">Borrower</div>
                      <div className="font-medium">{selectedLoan.borrowerName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Loan Amount</div>
                      <div className="font-bold text-lg">P{selectedLoan.amount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Duration</div>
                      <div className="font-medium">{selectedLoan.durationMonths} months</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Interest Rate</div>
                      <div className="font-medium">{selectedLoan.interestRate}%</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-gray-500">Purpose</div>
                    <div className="text-sm">{selectedLoan.purpose}</div>
                  </div>
                </div>

                {/* Lender Assignments */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Lender Assignments</h3>
                    <button
                      onClick={addLenderAssignment}
                      className="text-sm text-primary-blue hover:underline"
                    >
                      + Add Another Lender
                    </button>
                  </div>

                  {lenderAssignments.map((assignment, index) => {
                    const roi = calculateROI(Number(assignment.amount) || 0);
                    const selectedLender = availableLenders.find(l => l.id === Number(assignment.lenderId));

                    return (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Lender
                            </label>
                            <select
                              value={assignment.lenderId}
                              onChange={(e) => updateAssignment(index, "lenderId", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="0">Select lender...</option>
                              {availableLenders.map((lender) => (
                                <option key={lender.id} value={lender.id}>
                                  {lender.name} - P{lender.availableBalance.toLocaleString()} available
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Amount to Lend
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={assignment.amount}
                              onChange={(e) => updateAssignment(index, "amount", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="0.00"
                            />
                          </div>

                          <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">Expected Return</div>
                            <div className="font-semibold text-green-600">
                              P{roi.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-gray-500">
                              (Interest: P{roi.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                            </div>
                          </div>

                          {lenderAssignments.length > 1 && (
                            <button
                              onClick={() => removeLenderAssignment(index)}
                              className="mt-6 text-red-500 hover:text-red-700"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {selectedLender && Number(assignment.amount) > selectedLender.availableBalance && (
                          <div className="mt-2 text-sm text-red-600">
                            ⚠ Insufficient balance (only P{selectedLender.availableBalance.toLocaleString()} available)
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Summary */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Total Assigned:</span>
                      <span className="text-lg font-bold">
                        P{getTotalAssigned().toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium">Remaining:</span>
                      <span className={`text-lg font-bold ${getRemainingAmount() === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        P{getRemainingAmount().toLocaleString()}
                      </span>
                    </div>

                    {getRemainingAmount() !== 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="text-sm text-yellow-800">
                          ⚠ Total assigned amount must match the loan amount exactly
                        </div>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                      {success}
                    </div>
                  )}

                  <button
                    onClick={submitAssignment}
                    disabled={submitting || getRemainingAmount() !== 0}
                    className="w-full bg-primary-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Assigning..." : "Assign Lenders & Approve Loan"}
                  </button>
                </div>
              </div>
            )}

            {/* Available Lenders Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-navy-deep mb-4">
                Available Lenders ({availableLenders.length})
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableLenders.map((lender) => (
                  <div key={lender.id} className="border rounded-lg p-4">
                    <div className="font-medium">{lender.name}</div>
                    <div className="text-sm text-gray-500">{lender.email}</div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-xs text-gray-500">Available:</span>
                      <span className="font-semibold text-green-600">
                        P{lender.availableBalance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Total Invested:</span>
                      <span className="text-sm">P{lender.totalInvested.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

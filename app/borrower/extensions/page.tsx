"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

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

export default function BorrowerExtensionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [extensions, setExtensions] = useState<any[]>([]);
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    loanId: "",
    extensionDays: "7",
    reason: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
  }, [router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load extensions
      const extRes = await fetch(`/api/borrower/extensions?userId=${user.id}`);
      const extData = await extRes.json();
      if (extRes.ok) {
        setExtensions(extData.extensions || []);
      }

      // Load active loans
      const loansRes = await fetch(`/api/borrower/loans?userId=${user.id}`);
      const loansData = await loansRes.json();
      if (loansRes.ok) {
        const active = (loansData.loans || []).filter(
          (l: any) => l.status === 'active' || l.status === 'funded'
        );
        setActiveLoans(active);
      }
    } catch (err) {
      console.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.loanId) {
      setError("Please select a loan");
      return;
    }

    if (!formData.extensionDays || parseInt(formData.extensionDays) < 1) {
      setError("Please enter valid extension days");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/borrower/extensions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          extensionDays: parseInt(formData.extensionDays),
          userId: user.id
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(
          `Extension request submitted! Penalty: ${data.penaltyPercentage}% (P${data.penaltyAmount.toFixed(2)}). New due date: ${data.newDueDate}`
        );
        setFormData({ loanId: "", extensionDays: "7", reason: "" });
        setShowForm(false);
        loadData();
      } else {
        setError(data.error || "Failed to submit extension request");
      }
    } catch (err) {
      setError("Failed to submit extension request");
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: string) => {
    const colors = {
      excellent: "bg-green-100 text-green-800",
      good: "bg-blue-100 text-blue-800",
      average: "bg-yellow-100 text-yellow-800",
      poor: "bg-red-100 text-red-800"
    };
    return colors[rank as keyof typeof colors] || colors.average;
  };

  const getPenaltyRate = (rank: string) => {
    const rates = { excellent: "1%", good: "2%", average: "3%", poor: "5%" };
    return rates[rank as keyof typeof rates] || "3%";
  };

  if (loading && !user) {
    return (
      <DashboardLayout navItems={navItems} userType="borrower">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} userType="borrower">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Extension Requests</h1>
          <p className="text-gray-600 mt-2">Request payment deadline extensions for your active loans</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* How Extensions Work */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-blue-900 mb-3">How Extension Requests Work</h2>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• Extensions allow you to extend your payment deadline by up to 90 days</p>
            <p>• A penalty fee is charged based on your borrower ranking</p>
            <p>• Penalty rates: Excellent ({getPenaltyRate("excellent")}), Good ({getPenaltyRate("good")}), Average ({getPenaltyRate("average")}), Poor ({getPenaltyRate("poor")})</p>
            <p>• Extension requests must be approved by the administrator</p>
            <p>• Build a good repayment history to improve your ranking and get lower penalties</p>
          </div>
        </div>

        {/* Request Extension Button */}
        {activeLoans.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 font-semibold"
            >
              {showForm ? "Cancel" : "Request Extension"}
            </button>
          </div>
        )}

        {/* Extension Request Form */}
        {showForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Submit Extension Request</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Loan <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.loanId}
                  onChange={(e) => setFormData({ ...formData, loanId: e.target.value })}
                >
                  <option value="">-- Select Active Loan --</option>
                  {activeLoans.map((loan) => (
                    <option key={loan.id} value={loan.id}>
                      #{loan.id} - P{Number(loan.amount).toLocaleString()} ({loan.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extension Days (1-90) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.extensionDays}
                  onChange={(e) => setFormData({ ...formData, extensionDays: e.target.value })}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Common: 7 days (1 week), 14 days (2 weeks), 30 days (1 month)
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Extension
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Optional: Explain why you need an extension"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        )}

        {/* Extension History */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Extension History</h2>
          
          {extensions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No extension requests yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Extension</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penalty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {extensions.map((ext) => (
                    <tr key={ext.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {ext.loan_number || `#${ext.loan_id}`}
                        <div className="text-xs text-gray-500">
                          P{Number(ext.loan_amount).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {ext.extension_days} days
                        <div className="text-xs text-gray-500">
                          {new Date(ext.original_due_date).toLocaleDateString()} → {new Date(ext.new_due_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {Number(ext.penalty_percentage).toFixed(1)}%
                        <div className="text-xs text-gray-500">
                          P{Number(ext.penalty_amount).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRankBadge(ext.borrower_rank)}`}>
                          {ext.borrower_rank}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ext.status === 'approved' ? 'bg bg-green-100 text-green-800' : 
                          ext.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ext.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(ext.requested_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {activeLoans.length === 0 && !showForm && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">
              You don't have any active loans. Extension requests can only be made for active or funded loans.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

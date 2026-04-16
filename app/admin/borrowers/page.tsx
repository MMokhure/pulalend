"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>) },
  { label: "Loan Requests", href: "/admin/loans", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>) },
  { label: "Assign Lenders", href: "/admin/loan-assignments", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>) },
  { label: "KYC Review", href: "/admin/kyc", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.866-3.582 7-8 7a9.985 9.985 0 01-1.515-.115 5.972 5.972 0 001.515-4.385c0-3.866 3.582-7 8-7s8 3.134 8 7a5.972 5.972 0 01-1.515 4.385A9.985 9.985 0 0120 18c-4.418 0-8-3.134-8-7z" /></svg>) },
  { label: "Users", href: "/admin/users", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>) },
  { label: "Borrower Management", href: "/admin/borrowers", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>) },
  { label: "Lender Management", href: "/admin/lenders", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M12 12a4 4 0 100-8 4 4 0 000 8z" /></svg>) },
  { label: "Transactions", href: "/admin/transactions", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>) },
  { label: "Repayments", href: "/admin/repayments", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>) },
  { label: "Investments", href: "/admin/investments", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>) },
  { label: "Notifications", href: "/admin/notifications", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>) },
  { label: "Reports", href: "/admin/reports", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>) },
  { label: "Commission Tracking", href: "/admin/commission", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>) },
  { label: "Withdrawals", href: "/admin/withdrawals", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>) },
  { label: "Settings", href: "/admin/settings", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>) },
];

interface Borrower {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  createdAt: string;
  businessName: string;
  businessType: string;
  address: string;
  city: string;
  country: string;
  creditScore: number | null;
  kycVerified: boolean;
  monthlyIncome: number;
  monthlyDebt: number;
  totalLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  onTimePayments: number;
  latePayments: number;
  defaultProbability: number | null;
  loanRequestCount: number;
  activeLoansAmount: number;
  completedLoansAmount: number;
  defaultedLoansAmount: number;
  pendingLoansAmount: number;
}

export default function AdminBorrowersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterKyc, setFilterKyc] = useState<"all" | "verified" | "unverified">("all");
  const [searchTerm, setSearchTerm] = useState("");

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
    loadBorrowers(parsed.id);
  }, [router]);

  const loadBorrowers = async (userId: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/borrowers?userId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setBorrowers(data.borrowers);
      } else {
        setError(data.error || "Failed to load borrowers");
      }
    } catch {
      setError("Failed to load borrowers");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (borrower: Borrower) => {
    setSelectedBorrower(borrower);
    setShowDetailsModal(true);
  };

  const filteredBorrowers = borrowers.filter((b) => {
    const matchesKyc =
      filterKyc === "all" ||
      (filterKyc === "verified" && b.kycVerified) ||
      (filterKyc === "unverified" && !b.kycVerified);

    const matchesSearch =
      searchTerm === "" ||
      `${b.firstName} ${b.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.businessName?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesKyc && matchesSearch;
  });

  const getRiskBadgeColor = (probability: number | null) => {
    if (!probability) return "bg-gray-100 text-gray-600";
    if (probability < 5) return "bg-green-100 text-green-700";
    if (probability < 10) return "bg-yellow-100 text-yellow-700";
    if (probability < 20) return "bg-orange-100 text-orange-700";
    return "bg-red-100 text-red-700";
  };

  const getRiskLabel = (probability: number | null) => {
    if (!probability) return "N/A";
    if (probability < 5) return "Low Risk";
    if (probability < 10) return "Medium Risk";
    if (probability < 20) return "High Risk";
    return "Very High";
  };

  return (
    <DashboardLayout navItems={navItems} userType="admin">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Borrower Management</h1>
          <p className="text-gray-600 mt-2">View and manage all borrower accounts</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Borrowers</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or business..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">KYC Status Filter</label>
              <select
                value={filterKyc}
                onChange={(e) => setFilterKyc(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Borrowers</option>
                <option value="verified">KYC Verified</option>
                <option value="unverified">KYC Unverified</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Borrowers</h3>
            <p className="text-3xl font-bold text-gray-900">{borrowers.length}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">KYC Verified</h3>
            <p className="text-3xl font-bold text-green-600">
              {borrowers.filter((b) => b.kycVerified).length}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Loans</h3>
            <p className="text-3xl font-bold text-blue-600">
              {borrowers.reduce((sum, b) => sum + (b.activeLoansAmount > 0 ? 1 : 0), 0)}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Borrowed</h3>
            <p className="text-3xl font-bold text-purple-600">
              P{borrowers.reduce((sum, b) => sum + b.activeLoansAmount + b.completedLoansAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrower</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loans</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBorrowers.map((borrower) => (
                  <tr key={borrower.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {borrower.firstName} {borrower.lastName}
                        </span>
                        <span className="text-xs text-gray-500">{borrower.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{borrower.businessName || "N/A"}</span>
                        <span className="text-xs text-gray-500">{borrower.businessType || ""}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {borrower.creditScore || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskBadgeColor(borrower.defaultProbability)}`}
                      >
                        {getRiskLabel(borrower.defaultProbability)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs">
                        <span className="text-gray-900">
                          {borrower.loanRequestCount} requests
                        </span>
                        <span className="text-green-600">
                          {borrower.completedLoans} completed
                        </span>
                        {borrower.defaultedLoans > 0 && (
                          <span className="text-red-600">
                            {borrower.defaultedLoans} defaulted
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      P{borrower.activeLoansAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            borrower.kycVerified
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {borrower.kycVerified ? "KYC Verified" : "KYC Pending"}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            borrower.status === "active"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {borrower.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(borrower)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredBorrowers.length === 0 && (
              <div className="text-center py-12 text-gray-500">No borrowers found</div>
            )}
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedBorrower && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedBorrower.firstName} {selectedBorrower.lastName}
                    </h2>
                    <p className="text-gray-600 mt-1">{selectedBorrower.email}</p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Personal Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Phone:</span>
                      <p className="text-sm font-medium text-gray-900">{selectedBorrower.phone || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Account Status:</span>
                      <p className="text-sm font-medium text-gray-900">{selectedBorrower.status}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Member Since:</span>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(selectedBorrower.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">KYC Status:</span>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedBorrower.kycVerified ? "Verified ✓" : "Pending"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Business Name:</span>
                      <p className="text-sm font-medium text-gray-900">{selectedBorrower.businessName || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Business Type:</span>
                      <p className="text-sm font-medium text-gray-900">{selectedBorrower.businessType || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">City:</span>
                      <p className="text-sm font-medium text-gray-900">{selectedBorrower.city || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Country:</span>
                      <p className="text-sm font-medium text-gray-900">{selectedBorrower.country || "N/A"}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-500">Address:</span>
                      <p className="text-sm font-medium text-gray-900">{selectedBorrower.address || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Credit Score:</span>
                      <p className="text-sm font-medium text-gray-900">{selectedBorrower.creditScore || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Default Risk:</span>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedBorrower.defaultProbability ? `${selectedBorrower.defaultProbability}%` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Monthly Income:</span>
                      <p className="text-sm font-medium text-gray-900">
                        P{selectedBorrower.monthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Monthly Debt:</span>
                      <p className="text-sm font-medium text-gray-900">
                        P{selectedBorrower.monthlyDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Loan Statistics */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Loan History</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Total Loan Requests:</span>
                      <p className="text-sm font-medium text-gray-900">{selectedBorrower.loanRequestCount}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Total Loans:</span>
                      <p className="text-sm font-medium text-gray-900">{selectedBorrower.totalLoans}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Completed Loans:</span>
                      <p className="text-sm font-medium text-green-600">{selectedBorrower.completedLoans}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Defaulted Loans:</span>
                      <p className="text-sm font-medium text-red-600">{selectedBorrower.defaultedLoans}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">On-Time Payments:</span>
                      <p className="text-sm font-medium text-green-600">{selectedBorrower.onTimePayments}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Late Payments:</span>
                      <p className="text-sm font-medium text-orange-600">{selectedBorrower.latePayments}</p>
                    </div>
                  </div>
                </div>

                {/* Loan Amounts */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Loan Amounts</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Active Loans:</span>
                      <p className="text-sm font-medium text-blue-600">
                        P{selectedBorrower.activeLoansAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Pending Requests:</span>
                      <p className="text-sm font-medium text-yellow-600">
                        P{selectedBorrower.pendingLoansAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Completed Loans:</span>
                      <p className="text-sm font-medium text-green-600">
                        P{selectedBorrower.completedLoansAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Defaulted Loans:</span>
                      <p className="text-sm font-medium text-red-600">
                        P{selectedBorrower.defaultedLoansAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

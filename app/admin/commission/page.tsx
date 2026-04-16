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
  { label: "Pay Commission", href: "/admin/commission-payments", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>) },
  { label: "Withdrawals", href: "/admin/withdrawals", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>) },
  { label: "Settings", href: "/admin/settings", icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>) },
];

export default function AdminCommissionPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [view, setView] = useState<"summary" | "monthly" | "loans" | "transactions" | "lender-rates">("summary");
  const [lenders, setLenders] = useState<any[]>([]);
  const [editingLender, setEditingLender] = useState<number | null>(null);
  const [newRate, setNewRate] = useState<string>("");
  const [saveMessage, setSaveMessage] = useState("");

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
    loadCommissionData();
    if (view === "lender-rates") {
      loadLenders();
    }
  }, [router, selectedMonth, view]);

  const loadLenders = async () => {
    try {
      const res = await fetch("/api/admin/lenders/commission-rate");
      const responseData = await res.json();
      if (res.ok) {
        setLenders(responseData.lenders || []);
      } else {
        setError(responseData.error || "Failed to load lenders");
      }
    } catch {
      setError("Failed to load lenders");
    }
  };

  const handleEditRate = (lenderId: number, currentRate: number) => {
    setEditingLender(lenderId);
    setNewRate(currentRate.toString());
    setSaveMessage("");
  };

  const handleSaveRate = async (lenderId: number) => {
    try {
      const rate = parseFloat(newRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        setSaveMessage("Invalid rate. Must be between 0 and 100.");
        return;
      }

      const res = await fetch("/api/admin/lenders/commission-rate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lenderId, commissionRate: rate }),
      });

      const responseData = await res.json();
      if (res.ok) {
        setSaveMessage("Commission rate updated successfully!");
        setEditingLender(null);
        loadLenders(); // Reload lenders
      } else {
        setSaveMessage(responseData.error || "Failed to update rate");
      }
    } catch {
      setSaveMessage("Failed to update rate");
    }
  };

  const loadCommissionData = async () => {
    setLoading(true);
    try {
      let url = "/api/admin/commission";
      if (selectedMonth) {
        url += `?month=${selectedMonth}`;
      }
      const res = await fetch(url);
      const responseData = await res.json();
      if (res.ok) {
        setData(responseData);
      } else {
        setError(responseData.error || "Failed to load commission data");
      }
    } catch {
      setError("Failed to load commission data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} userType="admin" title="Platform Commission Tracking">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Platform Commission Tracking</h1>
          <p className="text-gray-600 mt-2">Track commission earned from investments by month and loan</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
        )}

        {/* Filter */}
        <div className="mb-6 flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {selectedMonth && (
            <button
              onClick={() => setSelectedMonth("")}
              className="mt-6 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* View Selector */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setView("summary")}
            className={`px-4 py-2 rounded-lg ${view === "summary" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Summary
          </button>
          <button
            onClick={() => setView("monthly")}
            className={`px-4 py-2 rounded-lg ${view === "monthly" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            By Month
          </button>
          <button
            onClick={() => setView("loans")}
            className={`px-4 py-2 rounded-lg ${view === "loans" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            By Loan
          </button>
          <button
            onClick={() => setView("transactions")}
            className={`px-4 py-2 rounded-lg ${view === "transactions" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setView("lender-rates")}
            className={`px-4 py-2 rounded-lg ${view === "lender-rates" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Lender Rates
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : data ? (
          <>
            {/* Summary View */}
            {view === "summary" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Total Commission Earned</h3>
                  <p className="text-3xl font-bold text-green-600">
                    P{data.summary.totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Total Investments</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    P{data.summary.totalInvestments.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Transaction Count</h3>
                  <p className="text-3xl font-bold text-gray-900">{data.summary.transactionCount}</p>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Unique Loans</h3>
                  <p className="text-3xl font-bold text-purple-600">{data.summary.uniqueLoans}</p>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Average Commission</h3>
                  <p className="text-3xl font-bold text-indigo-600">
                    P{data.summary.averageCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )}

            {/* Monthly View */}
            {view === "monthly" && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission Earned</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Investments</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unique Loans</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.monthlyData.map((month: any) => (
                      <tr key={month.month}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{month.month}</td>
                        <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                          P{month.totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          P{month.totalInvestments.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{month.count}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{month.uniqueLoans}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Loans View */}
            {view === "loans" && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrower</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Commission</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Invested</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Investments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.loanData.map((loan: any) => (
                      <tr key={loan.loanId}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{loan.loanNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{loan.borrowerName}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          P{loan.loanAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                          P{loan.totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          P{loan.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{loan.investmentCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Transactions View */}
            {view === "transactions" && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lender</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Investment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.transactions.map((txn: any) => (
                      <tr key={txn.id}>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(txn.investedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{txn.loanNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{txn.lenderName}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          P{txn.investmentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                          P{txn.commission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{txn.commissionRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Lender Rates View */}
            {view === "lender-rates" && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                {saveMessage && (
                  <div className={`m-4 p-3 rounded-lg ${saveMessage.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {saveMessage}
                  </div>
                )}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Manage Lender Commission Rates</h2>
                  <p className="text-sm text-gray-600 mt-1">Set custom commission rates for individual lenders (default: 2.00%)</p>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lender ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Invested</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Earned</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission Rate (%)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lenders.map((lender: any) => (
                      <tr key={lender.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">{lender.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {lender.first_name} {lender.last_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{lender.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          P{Number(lender.total_invested || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-green-600">
                          P{Number(lender.total_earned || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {editingLender === lender.id ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={newRate}
                              onChange={(e) => setNewRate(e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <span className="text-gray-900 font-medium">{Number(lender.commission_rate).toFixed(2)}%</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {editingLender === lender.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveRate(lender.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingLender(null);
                                  setSaveMessage("");
                                }}
                                className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-xs font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditRate(lender.id, lender.commission_rate)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium"
                            >
                              Edit Rate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

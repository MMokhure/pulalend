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

export default function LenderProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingFunds, setAddingFunds] = useState(false);
  const [updatingPreferences, setUpdatingPreferences] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preferences, setPreferences] = useState<any>(null);
  const [fundAmount, setFundAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");

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
      // Load profile and preferences in parallel
      const [profileRes, prefsRes] = await Promise.all([
        fetch(`/api/profile?userId=${userId}`),
        fetch(`/api/lender/preferences?userId=${userId}`)
      ]);

      const profileData = await profileRes.json();
      const prefsData = await prefsRes.json();

      if (profileRes.ok) {
        setUser((u: any) => ({ ...u, ...profileData.user }));
      }

      if (prefsRes.ok) {
        setPreferences(prefsData.preferences);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save profile");
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...JSON.parse(localStorage.getItem("user") || "{}"),
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        })
      );

      setSuccess("Profile updated successfully");
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const amount = Number(fundAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setAddingFunds(true);

    try {
      const res = await fetch("/api/lender/add-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          amount,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add funds");
        return;
      }

      setSuccess(`Successfully added P${amount.toLocaleString()} to your account`);
      setFundAmount("");
      
      // Reload preferences to show updated balance
      await loadData(user.id);
    } catch {
      setError("Network error");
    } finally {
      setAddingFunds(false);
    }
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUpdatingPreferences(true);

    try {
      const res = await fetch("/api/lender/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          preferredInterestRate: preferences.preferredInterestRate,
          minLoanAmount: preferences.minLoanAmount,
          maxLoanAmount: preferences.maxLoanAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update preferences");
        return;
      }

      setSuccess("Lending preferences updated successfully");
    } catch {
      setError("Network error");
    } finally {
      setUpdatingPreferences(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout userType="lender" navItems={navItems} title="Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Error/Success Messages */}
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

        {/* Account Balance Display */}
        {preferences && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-navy-deep mb-4">Account Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-blue-600">
                  P{(preferences.availableBalance || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Total Invested</p>
                <p className="text-2xl font-bold text-purple-600">
                  P{(preferences.totalInvested || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Total Earned</p>
                <p className="text-2xl font-bold text-green-600">
                  P{(preferences.totalEarned || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add Funds Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-navy-deep mb-4">Add Funds</h2>
          <form onSubmit={handleAddFunds} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-growth-green focus:border-transparent outline-none"
                  required
                  disabled={addingFunds}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-growth-green focus:border-transparent outline-none"
                  disabled={addingFunds}
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-growth-green text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={addingFunds || !fundAmount}
            >
              {addingFunds ? "Processing..." : "Add Funds"}
            </button>
          </form>
        </div>

        {/* Lending Preferences Section */}
        {preferences && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-navy-deep mb-4">Lending Preferences</h2>
            <form onSubmit={handleUpdatePreferences} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={preferences.preferredInterestRate || ""}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      preferredInterestRate: Number(e.target.value)
                    })}
                    placeholder="e.g., 12.00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-growth-green focus:border-transparent outline-none"
                    disabled={updatingPreferences}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your preferred annual interest rate
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Loan Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={preferences.minLoanAmount || ""}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      minLoanAmount: Number(e.target.value)
                    })}
                    placeholder="e.g., 1000.00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-growth-green focus:border-transparent outline-none"
                    disabled={updatingPreferences}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Smallest loan you'll fund
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Loan Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={preferences.maxLoanAmount || ""}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      maxLoanAmount: Number(e.target.value)
                    })}
                    placeholder="e.g., 50000.00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-growth-green focus:border-transparent outline-none"
                    disabled={updatingPreferences}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Largest loan you'll fund
                  </p>
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-growth-green text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={updatingPreferences}
              >
                {updatingPreferences ? "Updating..." : "Update Preferences"}
              </button>
            </form>
          </div>
        )}

        {/* Personal Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-navy-deep mb-4">Personal Information</h2>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <form onSubmit={saveProfile} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    value={user.firstName || ""}
                    onChange={(e) => setUser((u: any) => ({ ...u, firstName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-growth-green focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    value={user.lastName || ""}
                    onChange={(e) => setUser((u: any) => ({ ...u, lastName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-growth-green focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    value={user.email || ""}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    value={user.phone || ""}
                    onChange={(e) => setUser((u: any) => ({ ...u, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-growth-green focus:border-transparent outline-none"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-growth-green text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

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

export default function LenderCommissionInfoPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commissionData, setCommissionData] = useState({
    commissionRate: 2.0,
    totalInvested: 0,
    totalEarned: 0,
    totalCommission: 0,
    netEarnings: 0
  });

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
      loadCommissionInfo();
    }
  }, [user]);

  const loadCommissionInfo = async () => {
    try {
      setLoading(true);
      
      // Get lender's commission rate
      const rateRes = await fetch(`/api/lender/commission-rate?userId=${user.id}`);
      const rateData = await rateRes.json();
      
      if (rateRes.ok) {
        setCommissionData({
          commissionRate: rateData.commissionRate || 2.0,
          totalInvested: rateData.totalInvested || 0,
          totalEarned: rateData.totalEarned || 0,
          totalCommission: rateData.totalCommission || 0,
          netEarnings: (rateData.totalEarned || 0) - (rateData.totalCommission || 0)
        });
      }
    } catch (err) {
      console.error("Failed to load commission info");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <DashboardLayout navItems={navItems} userType="lender" title="Commission Information">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} userType="lender" title="Commission Information">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Commission Information</h1>
          <p className="text-gray-600 mt-2">View your platform commission rate and earnings breakdown</p>
        </div>

        {/* Commission Rate Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg rounded-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-2">Your Commission Rate</div>
            <div className="text-4xl font-bold">{commissionData.commissionRate}%</div>
            <div className="text-xs opacity-80 mt-2">Applied to interest earnings</div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm text-gray-500 mb-2">Total Invested</div>
            <div className="text-3xl font-bold text-gray-900">
              P{commissionData.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-500 mt-1">Principal amount</div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm text-gray-500 mb-2">Total Returns</div>
            <div className="text-3xl font-bold text-green-600">
              P{commissionData.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-500 mt-1">Gross interest earned</div>
          </div>
        </div>

        {/* Commission Breakdown */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Earnings Breakdown</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <div>
                <div className="font-semibold text-gray-900">Gross Interest Earned</div>
                <div className="text-sm text-gray-500">Total interest from all investments</div>
              </div>
              <div className="text-xl font-bold text-gray-900">
                P{commissionData.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <div>
                <div className="font-semibold text-gray-900">Platform Commission</div>
                <div className="text-sm text-gray-500">
                  Charged at {commissionData.commissionRate}% on interest earnings
                </div>
              </div>
              <div className="text-xl font-bold text-red-600">
                - P{commissionData.totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="flex justify-between items-center py-3 bg-green-50 px-4 rounded-lg">
              <div>
                <div className="font-semibold text-gray-900">Net Earnings</div>
                <div className="text-sm text-gray-500">Your actual take-home earnings</div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                P{commissionData.netEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How Commission Works</h2>
          
          <div className="space-y-4 text-gray-700">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <div className="font-semibold mb-1">Commission on Interest Only</div>
                <p className="text-sm text-gray-600">
                  Platform commission is calculated only on the interest you earn, not on your principal investment. 
                  Your full investment amount goes to borrowers.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <div className="font-semibold mb-1">Your Personal Rate</div>
                <p className="text-sm text-gray-600">
                  Your commission rate is {commissionData.commissionRate}%. This rate may vary by lender based on 
                  volume, relationship, and other factors determined by the platform.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <div className="font-semibold mb-1">Example Calculation</div>
                <p className="text-sm text-gray-600 mb-2">
                  If you invest P10,000 at 12% annual interest for 12 months:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Interest earned: P1,200</li>
                  <li>• Platform commission ({commissionData.commissionRate}%): P{(1200 * commissionData.commissionRate / 100).toFixed(2)}</li>
                  <li>• Your net return: P{(1200 - (1200 * commissionData.commissionRate / 100)).toFixed(2)}</li>
                  <li>• Total you receive: P{(10000 + 1200 - (1200 * commissionData.commissionRate / 100)).toFixed(2)}</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <div className="font-semibold mb-1">No Hidden Fees</div>
                <p className="text-sm text-gray-600">
                  The commission shown here is the only platform fee. There are no withdrawal fees, 
                  account maintenance fees, or other hidden charges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [overdueLoans, setOverdueLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    loadDashboard(parsed.id);
  }, [router]);

  const loadDashboard = async (userId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/dashboard?userId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
        setActivities(data.activities || []);
        setOverdueLoans(data.overdueLoans || []);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) return null;

  return (
    <DashboardLayout 
      userType="admin" 
      navItems={navItems} 
      title="Admin Dashboard"
      commissionAmount={stats?.investments.totalCommissionEarned}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-navy-deep">Welcome, {user.firstName}!</h2>
        <p className="text-gray-600">Platform Overview & Control Center</p>
      </div>

      {/* Platform Statistics */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-white/80">Total Users</div>
            <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold">{stats?.users.total || 0}</div>
          <div className="text-sm text-white/80 mt-2">
            {stats?.users.borrowers || 0} borrowers • {stats?.users.lenders || 0} lenders
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-white/80">Total Loans</div>
            <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-3xl font-bold">{stats?.loans.total || 0}</div>
          <div className="text-sm text-white/80 mt-2">
            {stats?.loans.active || 0} active • {stats?.loans.completed || 0} completed
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-white/80">Platform Volume</div>
            <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold">P{((stats?.loans.totalVolume || 0) / 1000).toFixed(0)}k</div>
          <div className="text-sm text-white/80 mt-2">
            P{((stats?.loans.activeLoanVolume || 0) / 1000).toFixed(0)}k active
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-white/80">New This Month</div>
            <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="text-3xl font-bold">{stats?.users.newThisMonth || 0}</div>
          <div className="text-sm text-white/80 mt-2">New user registrations</div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">Approval Rate</h3>
            <span className="text-green-600 text-2xl font-bold">{stats?.metrics.approvalRate || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats?.metrics.approvalRate || 0}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">Repayment Rate</h3>
            <span className="text-blue-600 text-2xl font-bold">{stats?.metrics.repaymentRate || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats?.metrics.repaymentRate || 0}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">Default Rate</h3>
            <span className="text-red-600 text-2xl font-bold">{stats?.metrics.defaultRate || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${stats?.metrics.defaultRate || 0}%` }}></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/loans">
          <div className="bg-navy-deep text-white rounded-xl p-6 cursor-pointer hover:bg-slate-900 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-white/80">Pending Loans</div>
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-4xl font-bold">{stats?.loans.pending || 0}</div>
            <div className="text-white/80 mt-2">Review & approve →</div>
          </div>
        </Link>

        <Link href="/admin/kyc">
          <div className="bg-primary-blue text-white rounded-xl p-6 cursor-pointer hover:bg-blue-700 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-white/80">Pending KYC</div>
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-4xl font-bold">{stats?.kyc.pending || 0}</div>
            <div className="text-white/80 mt-2">Verify documents →</div>
          </div>
        </Link>

        <div className="bg-amber-500 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-white/80">Overdue Payments</div>
            <svg className="w-6 h-6 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="text-4xl font-bold">{stats?.repayments.overdue || 0}</div>
          <div className="text-white/80 mt-2">P{((stats?.repayments.overdueAmount || 0) / 1000).toFixed(1)}k overdue</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">Platform Commission (2%)</h3>
              <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full font-medium">
                Active
              </span>
            </div>
            <div className="text-4xl font-bold mb-3">
              P{Number(stats?.investments.totalCommissionEarned || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-white/70">Total Invested</p>
                <p className="font-semibold">P{Number(stats?.investments.totalAmount || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-white/70">Commission (2%)</p>
                <p className="font-semibold">P{Number(stats?.investments.totalCommissionEarned || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-white/70">Net to Borrowers</p>
                <p className="font-semibold">P{Number((stats?.investments.totalAmount || 0) - (stats?.investments.totalCommissionEarned || 0)).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <svg className="w-20 h-20 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-navy-deep">Recent Activity</h3>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {activities.length === 0 ? (
              <p className="text-gray-500">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity: any, idx: number) => (
                  <div key={idx} className="flex items-start space-x-3 pb-4 border-b border-gray-50 last:border-0">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      activity.type === 'loan' ? 'bg-blue-500' :
                      activity.type === 'investment' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{activity.title}</div>
                      <div className="text-sm text-gray-600">{activity.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      activity.status === 'active' ? 'bg-green-100 text-green-700' :
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overdue Loans Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-navy-deep">Platform Alerts</h3>
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="p-6">
            {overdueLoans.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600 font-medium">All clear!</p>
                <p className="text-sm text-gray-500">No overdue loans</p>
              </div>
            ) : (
              <div className="space-y-3">
                {overdueLoans.map((loan: any) => (
                  <div key={loan.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-sm">Loan #{loan.loanNumber || loan.id}</div>
                      <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                        {loan.overdueCount} overdue
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">{loan.borrower}</div>
                    <div className="text-sm font-medium text-red-600 mt-1">
                      P{Number(loan.amount).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

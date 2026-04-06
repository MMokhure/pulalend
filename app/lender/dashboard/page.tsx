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
    label: "Profile",
    href: "/lender/profile",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function LenderDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    availableLoans: 0,
    fundedLoans: 0,
    expectedReturn: 0,
  });
  const [portfolio, setPortfolio] = useState({
    availableBalance: 0,
    totalInvested: 0,
    totalEarned: 0,
    totalCommission: 0,
  });
  const [activeInvestments, setActiveInvestments] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

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
    load(parsed.id);
  }, [router]);

  const load = async (userId: number) => {
    setLoading(true);
    try {
      console.log('Fetching lender dashboard for userId:', userId);
      const res = await fetch(`/api/lender/dashboard?userId=${userId}`);
      const data = await res.json();
      console.log('Lender dashboard API response:', data);
      console.log('Portfolio data:', data.portfolio);
      
      if (res.ok) {
        setStats(data.stats);
        setPortfolio(data.portfolio || { availableBalance: 0, totalInvested: 0, totalEarned: 0, totalCommission: 0 });
        setActiveInvestments(data.activeInvestments || []);
        setOpportunities(data.opportunities || []);
        setNotifications(data.notifications || []);
        setTransactions(data.transactions || []);
        
        console.log('Portfolio state set to:', data.portfolio);
      } else {
        console.error('Dashboard API error:', data);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout 
      userType="lender" 
      navItems={navItems} 
      title="Lender Dashboard"
      commissionAmount={portfolio.totalCommission}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-navy-deep">Welcome back, {user.firstName}!</h2>
        <p className="text-gray-600">Overview of your lending activity</p>
      </div>

      {/* Portfolio Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-primary-blue to-blue-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/80">Available Balance</p>
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold">
            P{Number(portfolio.availableBalance || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
          <p className="text-xs text-white/70 mt-1">Ready to invest</p>
        </div>
        <div className="bg-gradient-to-br from-growth-green to-green-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/80">Total Invested</p>
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-3xl font-bold">
            P{Number(portfolio.totalInvested || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
          <p className="text-xs text-white/70 mt-1">Active capital</p>
        </div>
        <div className="bg-gradient-to-br from-accent-orange to-orange-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/80">Total Earned</p>
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold">
            P{Number(portfolio.totalEarned || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
          <p className="text-xs text-white/70 mt-1">Returns to date</p>
        </div>
      </div>

      {/* Total Portfolio Summary */}
      <div className="bg-gradient-to-r from-navy-deep to-primary-blue rounded-xl p-6 shadow-lg text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70 mb-2">Total Portfolio Value</p>
            <p className="text-4xl font-bold">
              P{Number((portfolio.availableBalance || 0) + (portfolio.totalInvested || 0)).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
            <div className="flex items-center gap-6 mt-3 text-sm">
              <div>
                <span className="text-white/60">Available: </span>
                <span className="font-semibold">P{Number(portfolio.availableBalance || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-white/60">Invested: </span>
                <span className="font-semibold">P{Number(portfolio.totalInvested || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-white/60">Commission: </span>
                <span className="font-semibold">P{Number(portfolio.totalCommission || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <svg className="w-20 h-20 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Available Loans</p>
          <p className="text-3xl font-bold text-growth-green">{stats.availableLoans}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Funded Loans</p>
          <p className="text-3xl font-bold text-navy-deep">{stats.fundedLoans}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Expected Return</p>
          <p className="text-3xl font-bold text-accent-orange">
            P{Number(stats.expectedReturn || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Commission Paid to PulaLend</p>
          <p className="text-3xl font-bold text-purple-600">
            P{Number(portfolio.totalCommission || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link href="/lender/opportunities">
          <div className="bg-growth-green text-white rounded-xl p-6 cursor-pointer hover:bg-green-700 transition">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Browse Opportunities</h3>
                <p className="text-white/80 text-sm">Fund approved loans and earn returns</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/lender/portfolio">
          <div className="bg-navy-deep text-white rounded-xl p-6 cursor-pointer hover:bg-slate-900 transition">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 10H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">View Portfolio</h3>
                <p className="text-white/80 text-sm">Track your funded loans</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Two-column layout for widgets */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Active Investments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-navy-deep">Active Investments</h3>
            <Link href="/lender/portfolio" className="text-sm text-primary-blue hover:text-blue-700 font-medium">
              View All
            </Link>
          </div>
          <div className="p-6">
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : activeInvestments.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 10H7a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600">No active investments yet.</p>
                <Link href="/lender/opportunities" className="text-primary-blue hover:text-blue-700 text-sm font-medium mt-2 inline-block">
                  Browse Opportunities →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeInvestments.map((inv) => (
                  <div key={inv.id} className="border border-gray-100 rounded-lg p-4 hover:border-primary-blue transition">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-navy-deep">{inv.loanNumber}</p>
                        <p className="text-sm text-gray-500">{inv.borrowerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-navy-deep">
                          P{Number(inv.amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </p>
                        <p className="text-xs text-gray-500">Invested</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        inv.overdueCount > 0 ? 'bg-red-100 text-red-700' :
                        inv.loanStatus === 'active' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {inv.overdueCount > 0 ? `${inv.overdueCount} Overdue` :
                         inv.loanStatus === 'active' ? 'On Track' : inv.loanStatus}
                      </span>
                      <span className="text-accent-orange font-medium">
                        +P{Number(inv.expectedReturn).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} expected
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Opportunities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-navy-deep">Recent Opportunities</h3>
            <Link href="/lender/opportunities" className="text-sm text-primary-blue hover:text-blue-700 font-medium">
              View All
            </Link>
          </div>
          <div className="p-6">
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : opportunities.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <p className="text-gray-600">No opportunities available.</p>
                <p className="text-gray-500 text-sm mt-1">Check back later for new loans.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="border border-gray-100 rounded-lg p-4 hover:border-growth-green transition">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-navy-deep">{opp.loanNumber}</p>
                        <p className="text-sm text-gray-500">{opp.borrowerName}</p>
                        <p className="text-xs text-gray-400 mt-1">{opp.purpose}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-growth-green">{opp.interestRate}%</p>
                        <p className="text-xs text-gray-500">{opp.duration} months</p>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>P{Number(opp.fundedAmount).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} funded</span>
                        <span>P{Number(opp.remaining).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} needed</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-growth-green h-2 rounded-full" 
                          style={{ width: `${(opp.fundedAmount / opp.amount) * 100}%` }}
                        />
                      </div>
                    </div>
                    <Link 
                      href={`/lender/opportunities`}
                      className="block w-full text-center bg-growth-green text-white py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium"
                    >
                      Invest Now
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-navy-deep">Recent Notifications</h3>
          {notifications.length > 0 && (
            <button
              onClick={async () => {
                if (!user) return;
                try {
                  const res = await fetch('/api/notifications/mark-all-read', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id }),
                  });
                  if (res.ok) {
                    load(user.id);
                  }
                } catch (err) {
                  console.error('Error marking all as read:', err);
                }
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-gray-600">No new notifications.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif: any) => (
                <div 
                  key={notif.id} 
                  className={`relative group flex items-start space-x-4 p-4 rounded-lg border transition-all ${
                    !notif.read_status ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-gray-50 border-gray-200'
                  } hover:shadow-md`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notif.type === 'success' ? 'bg-green-100' :
                    notif.type === 'warning' ? 'bg-yellow-100' :
                    notif.type === 'error' ? 'bg-red-100' :
                    'bg-blue-100'
                  }`}>
                    <svg className={`w-5 h-5 ${
                      notif.type === 'success' ? 'text-green-600' :
                      notif.type === 'warning' ? 'text-yellow-600' :
                      notif.type === 'error' ? 'text-red-600' :
                      'text-blue-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {notif.type === 'success' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : notif.type === 'warning' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      ) : notif.type === 'error' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <p className="font-semibold text-navy-deep">{notif.title}</p>
                        {!notif.read_status && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5 animate-pulse" />
                        )}
                      </div>
                      {/* Action buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.read_status && (
                          <button
                            onClick={async () => {
                              if (!user) return;
                              try {
                                const res = await fetch(`/api/notifications/${notif.id}/read`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ userId: user.id }),
                                });
                                if (res.ok) {
                                  load(user.id);
                                }
                              } catch (err) {
                                console.error('Error marking as read:', err);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Mark as read"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (!user) return;
                            if (!confirm('Delete this notification?')) return;
                            try {
                              const res = await fetch(`/api/notifications/${notif.id}?userId=${user.id}`, {
                                method: 'DELETE',
                              });
                              if (res.ok) {
                                load(user.id);
                              }
                            } catch (err) {
                              console.error('Error deleting notification:', err);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 break-words">{notif.message}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <p className="text-xs text-gray-400">
                        {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {notif.action_url && notif.action_label && (
                        <a
                          href={notif.action_url}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {notif.action_label} →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-navy-deep">Recent Transactions</h3>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-600">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, idx) => (
                    <tr key={idx} className="border-t border-gray-50">
                      <td className="py-3 font-medium">{t.transactionType}</td>
                      <td className="py-3">P{Number(t.amount).toLocaleString()}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

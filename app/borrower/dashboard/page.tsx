"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

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

export default function BorrowerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    activeLoans: 0,
    totalBorrowed: 0,
    nextPayment: 0,
  });
  const [loans, setLoans] = useState<any[]>([]);
  const [upcomingRepayments, setUpcomingRepayments] = useState<any[]>([]);
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.userType !== "borrower") {
      router.push("/login");
      return;
    }
    setUser(parsedUser);
    fetchDashboardData(parsedUser.id);
  }, [router]);

  const fetchDashboardData = async (userId: number) => {
    try {
      console.log('Fetching dashboard data for userId:', userId);
      const response = await fetch(`/api/borrower/dashboard?userId=${userId}`);
      console.log('Dashboard API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard API data:', data);
        console.log('KYC Status from API:', data.kycStatus);
        
        setStats(data.stats);
        setLoans(data.recentLoans || []);
        setUpcomingRepayments(data.upcomingRepayments || []);
        setKycStatus(data.kycStatus);
        setNotifications(data.notifications || []);
        
        console.log('KYC Status state updated to:', data.kycStatus);
      } else {
        console.error('Dashboard API failed with status:', response.status);
        const errorData = await response.json();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout userType="borrower" navItems={navItems} title="Borrower Dashboard">
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-navy-deep">
          Welcome back, {user.firstName}!
        </h2>
        <p className="text-gray-600">Here is an overview of your account</p>
      </div>

      {/* KYC Status Banner */}
      {kycStatus && kycStatus.status === 'approved' && (
        <div className="rounded-xl p-6 mb-8 bg-green-50 border border-green-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1 text-green-800">
                KYC Verification Approved ✓
              </h3>
              <p className="text-sm text-green-700">
                Your identity has been verified. You can now apply for loans and access all platform features.
              </p>
            </div>
          </div>
        </div>
      )}
      {kycStatus && kycStatus.status !== 'verified' && kycStatus.status !== 'approved' && (
        <div className={`rounded-xl p-6 mb-8 ${
          kycStatus.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
          kycStatus.status === 'rejected' ? 'bg-red-50 border border-red-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              kycStatus.status === 'pending' ? 'bg-yellow-100' :
              kycStatus.status === 'rejected' ? 'bg-red-100' :
              'bg-blue-100'
            }`}>
              <svg className={`w-6 h-6 ${
                kycStatus.status === 'pending' ? 'text-yellow-600' :
                kycStatus.status === 'rejected' ? 'text-red-600' :
                'text-blue-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {kycStatus.status === 'rejected' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-lg mb-1 ${
                kycStatus.status === 'pending' ? 'text-yellow-800' :
                kycStatus.status === 'rejected' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {kycStatus.status === 'pending' ? 'KYC Verification Pending' :
                 kycStatus.status === 'rejected' ? 'KYC Verification Rejected' :
                 'Complete Your KYC Verification'}
              </h3>
              <p className={`text-sm mb-3 ${
                kycStatus.status === 'pending' ? 'text-yellow-700' :
                kycStatus.status === 'rejected' ? 'text-red-700' :
                'text-blue-700'
              }`}>
                {kycStatus.status === 'pending' 
                  ? 'Your KYC documents are being reviewed. This usually takes 1-2 business days.' 
                  : kycStatus.status === 'rejected'
                  ? `Reason: ${kycStatus.rejectionReason || 'Documents need to be resubmitted.'}`
                  : 'To apply for loans, complete your KYC verification.'}
              </p>
              {kycStatus.status !== 'pending' && (
                <Link 
                  href="/borrower/kyc"
                  className={`inline-block px-4 py-2 rounded-lg text-white font-medium ${
                    kycStatus.status === 'rejected' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                  } transition`}
                >
                  {kycStatus.status === 'rejected' ? 'Resubmit KYC' : 'Complete KYC Now'}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
      {!kycStatus && (
        <div className="rounded-xl p-6 mb-8 bg-blue-50 border border-blue-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1 text-blue-800">Complete Your KYC Verification</h3>
              <p className="text-sm mb-3 text-blue-700">To apply for loans, complete your KYC verification.</p>
              <Link 
                href="/borrower/kyc"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Complete KYC Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Active Loans</p>
          <p className="text-3xl font-bold text-primary-blue">{stats.activeLoans}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Borrowed</p>
          <p className="text-3xl font-bold text-navy-deep">
            P{stats.totalBorrowed.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Next Payment</p>
          <p className="text-3xl font-bold text-accent-orange">
            P{stats.nextPayment.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link href="/borrower/apply">
          <div className="bg-primary-blue text-white rounded-xl p-6 cursor-pointer hover:bg-blue-700 transition">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Apply for a New Loan</h3>
                <p className="text-white/80 text-sm">Quick and easy application</p>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/borrower/repayments">
          <div className="bg-growth-green text-white rounded-xl p-6 cursor-pointer hover:bg-green-700 transition">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">Make a Repayment</h3>
                <p className="text-white/80 text-sm">Stay on track with payments</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Upcoming Repayments */}
      {upcomingRepayments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-navy-deep">Upcoming Repayments</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingRepayments.map((repayment) => {
                const dueDate = new Date(repayment.dueDate);
                const today = new Date();
                const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const isOverdue = daysUntilDue < 0;
                const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 7;
                
                return (
                  <div 
                    key={repayment.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isOverdue ? 'bg-red-50 border-red-200' :
                      isDueSoon ? 'bg-yellow-50 border-yellow-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="font-medium text-navy-deep">
                          Loan #{repayment.loanNumber || repayment.loanId}
                        </span>
                        {isOverdue && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            OVERDUE
                          </span>
                        )}
                        {isDueSoon && !isOverdue && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                            DUE SOON
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${
                        isOverdue ? 'text-red-600' :
                        isDueSoon ? 'text-yellow-700' :
                        'text-gray-600'
                      }`}>
                        Due: {dueDate.toLocaleDateString()} 
                        {isOverdue 
                          ? ` (${Math.abs(daysUntilDue)} days overdue)` 
                          : isDueSoon 
                          ? ` (${daysUntilDue} days)` 
                          : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-navy-deep">
                        P{repayment.amount.toLocaleString()}
                      </p>
                      <Link
                        href="/borrower/repayments"
                        className={`inline-block mt-2 px-4 py-1 text-sm rounded-lg font-medium transition ${
                          isOverdue 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-primary-blue text-white hover:bg-blue-700'
                        }`}
                      >
                        Pay Now
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recent Loans */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-navy-deep">Recent Loans</h3>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-gray-500 text-center py-4">Loading...</p>
          ) : loans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No loans yet</p>
              <Link
                href="/borrower/apply"
                className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition"
              >
                Apply for Your First Loan
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-3">Loan ID</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan.id} className="border-t border-gray-50">
                      <td className="py-3 font-medium">#{loan.id}</td>
                      <td className="py-3">P{loan.amount.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          loan.status === "active" ? "bg-green-100 text-green-700" :
                          loan.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          loan.status === "completed" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">
                        {new Date(loan.requestedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-8">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-navy-deep">Recent Notifications</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`flex items-start space-x-4 p-4 rounded-lg border ${
                    notification.isRead 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notification.type === 'success' ? 'bg-green-100' :
                    notification.type === 'warning' ? 'bg-yellow-100' :
                    notification.type === 'error' ? 'bg-red-100' :
                    'bg-blue-100'
                  }`}>
                    <svg className={`w-5 h-5 ${
                      notification.type === 'success' ? 'text-green-600' :
                      notification.type === 'warning' ? 'text-yellow-600' :
                      notification.type === 'error' ? 'text-red-600' :
                      'text-blue-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {notification.type === 'success' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : notification.type === 'warning' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      ) : notification.type === 'error' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className={`font-medium ${
                        notification.isRead ? 'text-gray-700' : 'text-navy-deep'
                      }`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${
                      notification.isRead ? 'text-gray-500' : 'text-gray-700'
                    }`}>
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

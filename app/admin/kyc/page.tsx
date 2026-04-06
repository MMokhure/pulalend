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

export default function AdminKycPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [selectedKyc, setSelectedKyc] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewing, setReviewing] = useState(false);

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
    loadKycRequests();
  }, [router]);

  const loadKycRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/kyc?status=pending");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load KYC requests");
        return;
      }
      setKycRequests(data.kycRequests || []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (action: "approve" | "reject") => {
    if (!selectedKyc) return;
    
    setReviewing(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/kyc", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kycId: selectedKyc.id,
          action,
          notes: reviewNotes,
          reviewerId: user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update KYC request");
        return;
      }

      setSuccess(`KYC ${action === "approve" ? "approved" : "rejected"} successfully`);
      setSelectedKyc(null);
      setReviewNotes("");
      await loadKycRequests();
    } catch {
      setError("Network error");
    } finally {
      setReviewing(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout userType="admin" navItems={navItems} title="KYC Review">
      {selectedKyc ? (
        // KYC Detail View
        <div>
          <button
            onClick={() => setSelectedKyc(null)}
            className="mb-4 text-primary-blue hover:text-accent-orange font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to KYC List
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-navy-deep mb-4">KYC Request #{selectedKyc.id}</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                {success}
              </div>
            )}

            {/* User Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-navy-deep mb-3">User Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{selectedKyc.user.firstName} {selectedKyc.user.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedKyc.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{selectedKyc.user.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">User Type</p>
                  <p className="font-medium capitalize">{selectedKyc.user.userType}</p>
                </div>
              </div>
            </div>

            {/* ID Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-navy-deep mb-3">ID Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID Type</p>
                  <p className="font-medium">{selectedKyc.idType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ID Number</p>
                  <p className="font-medium">{selectedKyc.idNumber}</p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-navy-deep mb-3">Address Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Address Line 1</p>
                  <p className="font-medium">{selectedKyc.address1}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address Line 2</p>
                  <p className="font-medium">{selectedKyc.address2 || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">City</p>
                  <p className="font-medium">{selectedKyc.city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Country</p>
                  <p className="font-medium">{selectedKyc.country}</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-navy-deep mb-3">Submitted Documents</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedKyc.idFrontPath && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">ID Front</p>
                    <div className="bg-gray-100 rounded h-40 flex items-center justify-center overflow-hidden">
                      {selectedKyc.idFrontPath.toLowerCase().endsWith('.pdf') ? (
                        <embed 
                          src={selectedKyc.idFrontPath.startsWith('/') ? selectedKyc.idFrontPath : `/${selectedKyc.idFrontPath}`} 
                          type="application/pdf"
                          className="w-full h-full"
                        />
                      ) : (
                        <img 
                          src={selectedKyc.idFrontPath.startsWith('/') ? selectedKyc.idFrontPath : `/${selectedKyc.idFrontPath}`} 
                          alt="ID Front" 
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 truncate">{selectedKyc.idFrontPath}</p>
                  </div>
                )}
                {selectedKyc.idBackPath && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">ID Back</p>
                    <div className="bg-gray-100 rounded h-40 flex items-center justify-center overflow-hidden">
                      {selectedKyc.idBackPath.toLowerCase().endsWith('.pdf') ? (
                        <embed 
                          src={selectedKyc.idBackPath.startsWith('/') ? selectedKyc.idBackPath : `/${selectedKyc.idBackPath}`} 
                          type="application/pdf"
                          className="w-full h-full"
                        />
                      ) : (
                        <img 
                          src={selectedKyc.idBackPath.startsWith('/') ? selectedKyc.idBackPath : `/${selectedKyc.idBackPath}`} 
                          alt="ID Back" 
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 truncate">{selectedKyc.idBackPath}</p>
                  </div>
                )}
                {selectedKyc.selfiePath && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selfie</p>
                    <div className="bg-gray-100 rounded h-40 flex items-center justify-center overflow-hidden">
                      {selectedKyc.selfiePath.toLowerCase().endsWith('.pdf') ? (
                        <embed 
                          src={selectedKyc.selfiePath.startsWith('/') ? selectedKyc.selfiePath : `/${selectedKyc.selfiePath}`} 
                          type="application/pdf"
                          className="w-full h-full"
                        />
                      ) : (
                        <img 
                          src={selectedKyc.selfiePath.startsWith('/') ? selectedKyc.selfiePath : `/${selectedKyc.selfiePath}`} 
                          alt="Selfie" 
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 truncate">{selectedKyc.selfiePath}</p>
                  </div>
                )}
                {selectedKyc.omangCopyPath && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Omang Copy</p>
                    <div className="bg-gray-100 rounded h-40 flex items-center justify-center overflow-hidden">
                      {selectedKyc.omangCopyPath.toLowerCase().endsWith('.pdf') ? (
                        <embed 
                          src={selectedKyc.omangCopyPath.startsWith('/') ? selectedKyc.omangCopyPath : `/${selectedKyc.omangCopyPath}`} 
                          type="application/pdf"
                          className="w-full h-full"
                        />
                      ) : (
                        <img 
                          src={selectedKyc.omangCopyPath.startsWith('/') ? selectedKyc.omangCopyPath : `/${selectedKyc.omangCopyPath}`} 
                          alt="Omang Copy" 
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 truncate">{selectedKyc.omangCopyPath}</p>
                  </div>
                )}
                {selectedKyc.payslipPath && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Payslip</p>
                    <div className="bg-gray-100 rounded h-40 flex items-center justify-center overflow-hidden">
                      {selectedKyc.payslipPath.toLowerCase().endsWith('.pdf') ? (
                        <embed 
                          src={selectedKyc.payslipPath.startsWith('/') ? selectedKyc.payslipPath : `/${selectedKyc.payslipPath}`} 
                          type="application/pdf"
                          className="w-full h-full"
                        />
                      ) : (
                        <img 
                          src={selectedKyc.payslipPath.startsWith('/') ? selectedKyc.payslipPath : `/${selectedKyc.payslipPath}`} 
                          alt="Payslip" 
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 truncate">{selectedKyc.payslipPath}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Review Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Notes (Optional)
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                placeholder="Add any notes about this KYC review..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleReview("approve")}
                disabled={reviewing}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50"
              >
                {reviewing ? "Processing..." : "Approve KYC"}
              </button>
              <button
                onClick={() => handleReview("reject")}
                disabled={reviewing}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50"
              >
                {reviewing ? "Processing..." : "Reject KYC"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // KYC List View
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-navy-deep">Pending KYC Requests</h2>
            <p className="text-gray-600 text-sm mt-1">Review and verify user identity documents</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                {success}
              </div>
            )}

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : kycRequests.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 font-medium">No pending KYC requests</p>
                <p className="text-sm text-gray-500 mt-1">All KYC submissions have been reviewed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {kycRequests.map((kyc) => (
                  <div key={kyc.id} className="border border-gray-100 rounded-xl p-5 hover:border-primary-blue transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-navy-deep">
                            {kyc.user.firstName} {kyc.user.lastName}
                          </h3>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {kyc.user.userType}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                          <p><span className="font-medium">Email:</span> {kyc.user.email}</p>
                          <p><span className="font-medium">ID Type:</span> {kyc.idType}</p>
                          <p><span className="font-medium">ID Number:</span> {kyc.idNumber}</p>
                          <p><span className="font-medium">Location:</span> {kyc.city}, {kyc.country}</p>
                          <p><span className="font-medium">Submitted:</span> {new Date(kyc.submittedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedKyc(kyc)}
                        className="ml-4 bg-primary-blue hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

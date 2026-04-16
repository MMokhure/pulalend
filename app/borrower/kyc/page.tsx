"use client";

import { useEffect, useRef, useState } from "react";
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

export default function BorrowerKycPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"not_submitted" | "pending" | "approved" | "rejected">(
    "not_submitted"
  );
  const [form, setForm] = useState({
    idType: "",
    idNumber: "",
    address1: "",
    address2: "",
    city: "",
    country: "",
  });
  const [files, setFiles] = useState({
    idFront: null as File | null,
    idBack: null as File | null,
    selfie: null as File | null,
    omangCopy: null as File | null,
    payslip: null as File | null,
  });
  const [previews, setPreviews] = useState({
    idFront: "",
    idBack: "",
    selfie: "",
    omangCopy: "",
    payslip: "",
  });
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    fetchStatus(parsed.id);
  }, [router]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Setup video when camera opens and stream is available
  useEffect(() => {
    if (cameraOpen && streamRef.current && videoRef.current && !cameraReady) {
      console.log("useEffect: Setting up video with stream");
      const video = videoRef.current;
      const stream = streamRef.current;
      
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      
      // Aggressive timeout - 1.5 seconds
      const timeoutId = setTimeout(() => {
        console.log("useEffect: Timeout - forcing camera ready");
        setCameraReady(true);
      }, 1500);
      
      const handleMetadata = async () => {
        clearTimeout(timeoutId);
        console.log("useEffect: Video metadata loaded");
        try {
          await video.play();
          console.log("useEffect: Video playing");
          setCameraReady(true);
        } catch (err) {
          console.log("useEffect: Play failed, but setting ready anyway");
          setCameraReady(true);
        }
      };
      
      const handleData = () => {
        clearTimeout(timeoutId);
        console.log("useEffect: Video data loaded");
        setCameraReady(true);
      };
      
      video.addEventListener('loadedmetadata', handleMetadata);
      video.addEventListener('loadeddata', handleData);
      
      // Try to play immediately
      video.play().catch(err => {
        console.log("useEffect: Immediate play attempt:", err.message);
      });
      
      return () => {
        clearTimeout(timeoutId);
        video.removeEventListener('loadedmetadata', handleMetadata);
        video.removeEventListener('loadeddata', handleData);
      };
    }
  }, [cameraOpen, cameraReady]);

  const startCamera = async () => {
    setCameraError("");
    setCameraReady(false);
    
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera not supported on this browser. Use Chrome, Firefox, or Safari.");
      return;
    }

    try {
      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      console.log("Camera access granted", stream);
      
      streamRef.current = stream;
      setCameraOpen(true);
      
      // Wait for React to render the video element, then attach stream
      setTimeout(() => {
        console.log("Setting up video element...");
        if (videoRef.current) {
          const video = videoRef.current;
          video.srcObject = stream;
          
          console.log("Video element found, stream attached");
          
          // Set up timeout fallback - camera ready after 2 seconds max
          const timeoutId = setTimeout(() => {
            console.log("Timeout reached - forcing camera ready");
            setCameraReady(true);
          }, 2000);
          
          // Wait for video to be ready
          video.onloadedmetadata = async () => {
            clearTimeout(timeoutId);
            console.log("Video metadata loaded");
            
            try {
              await video.play();
              console.log("Video playing successfully");
              setCameraReady(true);
            } catch (err: any) {
              console.error("Video play error:", err);
              setCameraReady(true);
            }
          };
          
          // Alternative: loadeddata event
          video.onloadeddata = () => {
            clearTimeout(timeoutId);
            console.log("Video data loaded");
            setCameraReady(true);
          };
          
          // Add error handler
          video.onerror = (e) => {
            clearTimeout(timeoutId);
            console.error("Video element error:", e);
            setCameraError("Video element error. Please refresh and try again.");
          };
          
          // Try immediate play
          video.play().catch((err) => {
            console.log("Initial play attempt:", err.message);
          });
        } else {
          console.error("Video ref is null after timeout - this should not happen");
          setCameraError("Failed to initialize camera view. Please try again.");
        }
      }, 100);
      
    } catch (err: any) {
      console.error("Camera access error:", err);
      
      // Provide specific error messages based on the error type
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera permission denied. Click the camera icon in your browser's address bar to allow access.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No camera found on this device.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setCameraError("Camera is already in use by another application. Close other apps and try again.");
      } else if (err.name === "OverconstrainedError") {
        setCameraError("Camera doesn't support the required settings. Trying with basic settings...");
        // Retry with basic constraints
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          streamRef.current = stream;
          setCameraOpen(true);
          
          setTimeout(() => {
            if (videoRef.current) {
              const video = videoRef.current;
              video.srcObject = stream;
              video.onloadedmetadata = async () => {
                try {
                  await video.play();
                  setCameraReady(true);
                } catch {
                  setCameraReady(true);
                }
              };
              setTimeout(() => setCameraReady(true), 2000);
              video.play().catch(() => {});
            }
          }, 100);
          setCameraError("");
        } catch {
          setCameraError("Unable to access camera with basic settings.");
        }
      } else if (err.name === "TypeError") {
        setCameraError("Camera API error. Make sure you're using HTTPS or localhost.");
      } else {
        setCameraError(`Camera error: ${err.name || err.message || "Unknown error"}`);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
    setCameraReady(false);
  };

  const captureSelfie = async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or canvas ref not available");
      setCameraError("Camera not ready. Please try again.");
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Check if video is actually playing
    if (video.readyState < 2) {
      console.error("Video not ready, readyState:", video.readyState);
      setCameraError("Video not ready. Wait a moment and try again.");
      return;
    }
    
    const width = video.videoWidth;
    const height = video.videoHeight;
    
    if (width === 0 || height === 0) {
      console.error("Invalid video dimensions:", width, height);
      setCameraError("Camera feed not ready. Please wait.");
      return;
    }
    
    console.log("Capturing selfie, dimensions:", width, height);
    
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Cannot get 2d context");
      setCameraError("Browser error. Please try a different browser.");
      return;
    }
    
    // Draw the video frame to canvas
    ctx.drawImage(video, 0, 0, width, height);
    
    // Convert to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Blob conversion failed");
        setCameraError("Failed to capture image. Try again.");
        return;
      }
      
      console.log("Selfie captured successfully, size:", blob.size);
      const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: "image/jpeg" });
      setFiles((f) => ({ ...f, selfie: file }));
      
      // Create preview immediately
      const previewUrl = URL.createObjectURL(blob);
      setPreviews((p) => ({ ...p, selfie: previewUrl }));
      
      stopCamera();
    }, "image/jpeg", 0.9);
  };

  useEffect(() => {
    const nextPreviews = { idFront: "", idBack: "", selfie: "", omangCopy: "", payslip: "" };

    if (files.idFront) nextPreviews.idFront = URL.createObjectURL(files.idFront);
    if (files.idBack) nextPreviews.idBack = URL.createObjectURL(files.idBack);
    if (files.selfie) nextPreviews.selfie = URL.createObjectURL(files.selfie);
    if (files.omangCopy && files.omangCopy.type.startsWith("image/")) {
      nextPreviews.omangCopy = URL.createObjectURL(files.omangCopy);
    }
    if (files.payslip && files.payslip.type.startsWith("image/")) {
      nextPreviews.payslip = URL.createObjectURL(files.payslip);
    }

    setPreviews(nextPreviews);

    return () => {
      if (nextPreviews.idFront) URL.revokeObjectURL(nextPreviews.idFront);
      if (nextPreviews.idBack) URL.revokeObjectURL(nextPreviews.idBack);
      if (nextPreviews.selfie) URL.revokeObjectURL(nextPreviews.selfie);
      if (nextPreviews.omangCopy) URL.revokeObjectURL(nextPreviews.omangCopy);
      if (nextPreviews.payslip) URL.revokeObjectURL(nextPreviews.payslip);
    };
  }, [files.idFront, files.idBack, files.selfie, files.omangCopy, files.payslip]);

  const fetchStatus = async (userId: number) => {
    try {
      console.log('Fetching KYC status for user:', userId);
      const res = await fetch(`/api/borrower/kyc?userId=${userId}`);
      const data = await res.json();
      console.log('KYC status response:', data);
      
      if (res.ok) {
        if (data.status) {
          console.log('Setting KYC status to:', data.status);
          setStatus(data.status);
        } else {
          console.log('No status in response, setting to not_submitted');
          setStatus('not_submitted');
        }
      } else {
        console.error('Failed to fetch KYC status:', res.status);
      }
    } catch (err) {
      console.error('Error fetching KYC status:', err);
      // Best-effort status lookup
    }
  };

  const steps = [
    { title: "Identity", description: "Provide your ID details" },
    { title: "Address", description: "Confirm your residence" },
    { title: "Documents", description: "Upload ID and selfie" },
  ];

  const validateStep = (currentStep: number) => {
    if (currentStep === 0) {
      if (!form.idType || !form.idNumber.trim()) {
        setError("Select an ID type and enter the ID number.");
        return false;
      }
      // Validate Omang format
      if (form.idType === "Omang") {
        const omangNumber = form.idNumber.replace(/\s/g, "");
        if (!/^\d{9}$/.test(omangNumber)) {
          setError("Omang number must be exactly 9 digits.");
          return false;
        }
        const genderDigit = omangNumber[4]; // 5th digit (0-indexed)
        if (genderDigit !== "1" && genderDigit !== "2") {
          setError("Invalid Omang number. The 5th digit must be 1 (Male) or 2 (Female).");
          return false;
        }
      }
    }

    if (currentStep === 1) {
      if (!form.address1.trim() || !form.city.trim() || !form.country.trim()) {
        setError("Permanent address, city, and country are required.");
        return false;
      }
    }

    if (currentStep === 2) {
      if (!files.idFront || !files.selfie) {
        setError("Upload the front of your ID and a selfie.");
        return false;
      }
    }

    setError("");
    return true;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prevStep = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const submitKyc = async () => {
    if (!validateStep(step)) return;
    if (!user) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payload = new FormData();
      payload.append("userId", String(user.id));
      payload.append("idType", form.idType);
      payload.append("idNumber", form.idNumber.trim());
      payload.append("address1", form.address1.trim());
      payload.append("address2", form.address2.trim());
      payload.append("city", form.city.trim());
      payload.append("country", form.country.trim());

      if (files.idFront) payload.append("idFront", files.idFront);
      if (files.idBack) payload.append("idBack", files.idBack);
      if (files.selfie) payload.append("selfie", files.selfie);
      if (files.omangCopy) payload.append("omangCopy", files.omangCopy);
      if (files.payslip) payload.append("payslip", files.payslip);

      const res = await fetch("/api/borrower/kyc", {
        method: "POST",
        body: payload,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit KYC");
        return;
      }

      const newStatus = data.status || "pending";
      console.log('KYC submission successful, new status:', newStatus);
      setStatus(newStatus);
      setSuccess("KYC submitted successfully! Your documents are under review. You will be notified when approved.");
      
      // Refresh status after a moment to ensure it's up to date
      setTimeout(() => {
        console.log('Refreshing KYC status after submission...');
        fetchStatus(user.id);
      }, 1000);
    } catch (err) {
      console.error('KYC submission error:', err);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  const isLocked = status === "pending" || status === "approved";

  return (
    <DashboardLayout userType="borrower" navItems={navItems} title="KYC">
      <div className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-navy-deep">Verify your identity</h2>
              <p className="text-gray-600">
                Complete KYC to unlock higher limits and faster approvals.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                status === "approved"
                  ? "bg-green-100 text-green-700"
                  : status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : status === "rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {status === "not_submitted" ? "Not submitted" : status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            {steps.map((item, index) => (
              <div
                key={item.title}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  index <= step
                    ? "border-primary-blue bg-blue-50 text-primary-blue"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                <div className="font-semibold">{item.title}</div>
                <div className="text-xs mt-1">{item.description}</div>
              </div>
            ))}
          </div>

          {status === "pending" && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-yellow-800">KYC Under Review</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your KYC submission is being reviewed by our team. You will be notified via email when it is approved. This typically takes 1-2 business days.
                  </p>
                  <button
                    onClick={() => fetchStatus(user.id)}
                    className="mt-2 text-xs text-yellow-700 underline hover:no-underline"
                  >
                    Refresh Status
                  </button>
                </div>
              </div>
            </div>
          )}
          {status === "approved" && (
            <div className="mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">✓ KYC Approved</p>
              <p className="text-sm mt-1">Your identity is verified. You have full access to borrower features and can apply for loans.</p>
            </div>
          )}
          {status === "rejected" && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">✗ KYC Rejected</p>
              <p className="text-sm mt-1">Your KYC was rejected. Please correct your details and resubmit with valid documents.</p>
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div className="mt-6 space-y-5">
            {step === 0 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Type
                  </label>
                  <select
                    value={form.idType}
                    onChange={(e) => setForm((f) => ({ ...f, idType: e.target.value }))}
                    disabled={isLocked}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none bg-white"
                  >
                    <option value="">Select</option>
                    <option value="Omang">Omang (Botswana National ID)</option>
                    <option value="Passport">Passport</option>
                    <option value="Driver's License">Driver's License</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Number
                  </label>
                  <input
                    value={form.idNumber}
                    onChange={(e) => setForm((f) => ({ ...f, idNumber: e.target.value }))}
                    disabled={isLocked}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none"
                    placeholder={form.idType === "Omang" ? "Enter 9-digit Omang number" : "Enter your ID number"}
                  />
                  {form.idType === "Omang" && form.idNumber.replace(/\s/g, "").length === 9 && (() => {
                    const omangNumber = form.idNumber.replace(/\s/g, "");
                    const genderDigit = omangNumber[4];
                    if (genderDigit === "1") {
                      return (
                        <p className="text-xs text-blue-600 mt-2">
                          ✓ Valid Omang format - Gender: <strong>Male</strong> (5th digit: 1)
                        </p>
                      );
                    } else if (genderDigit === "2") {
                      return (
                        <p className="text-xs text-pink-600 mt-2">
                          ✓ Valid Omang format - Gender: <strong>Female</strong> (5th digit: 2)
                        </p>
                      );
                    } else {
                      return (
                        <p className="text-xs text-red-600 mt-2">
                          ✗ Invalid: 5th digit must be 1 (Male) or 2 (Female)
                        </p>
                      );
                    }
                  })()}
                  {form.idType === "Omang" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Omang must be 9 digits. The 5th digit indicates gender (1=Male, 2=Female)
                    </p>
                  )}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street / Ward
                  </label>
                  <input
                    value={form.address1}
                    onChange={(e) => setForm((f) => ({ ...f, address1: e.target.value }))}
                    disabled={isLocked}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none"
                    placeholder="Street or ward"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City / Village
                    </label>
                    <input
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      disabled={isLocked}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none"
                      placeholder="City or village"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      value={form.country}
                      onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                      disabled={isLocked}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Government ID (front)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    disabled={isLocked}
                    onChange={(e) =>
                      setFiles((f) => ({
                        ...f,
                        idFront: e.target.files?.[0] || null,
                      }))
                    }
                    className="w-full"
                  />
                  {files.idFront && (
                    <p className="text-xs text-gray-500 mt-2">Selected: {files.idFront.name}</p>
                  )}
                  {previews.idFront && (
                    <img
                      src={previews.idFront}
                      alt="ID front preview"
                      className="mt-3 w-full max-w-xs rounded-lg border border-gray-200"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Government ID (back, optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    disabled={isLocked}
                    onChange={(e) =>
                      setFiles((f) => ({
                        ...f,
                        idBack: e.target.files?.[0] || null,
                      }))
                    }
                    className="w-full"
                  />
                  {files.idBack && (
                    <p className="text-xs text-gray-500 mt-2">Selected: {files.idBack.name}</p>
                  )}
                  {previews.idBack && (
                    <img
                      src={previews.idBack}
                      alt="ID back preview"
                      className="mt-3 w-full max-w-xs rounded-lg border border-gray-200"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selfie (camera)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Use the front camera. Center your face, remove hats/glasses, and ensure good lighting.
                  </p>
                  {!cameraOpen && !files.selfie && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        disabled={isLocked}
                        className="px-4 py-2 rounded-lg bg-primary-blue text-white hover:bg-blue-700 transition disabled:opacity-60 font-medium"
                      >
                        📸 Open Camera
                      </button>
                      <p className="text-xs text-gray-500">or</p>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          capture="user"
                          disabled={isLocked}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setFiles((f) => ({ ...f, selfie: file }));
                            }
                          }}
                          className="text-sm"
                          id="selfie-upload"
                        />
                        <label htmlFor="selfie-upload" className="text-xs text-gray-500 cursor-pointer">
                          Upload from device
                        </label>
                      </div>
                    </div>
                  )}
                  {cameraError && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700 font-medium">❌ Camera Error</p>
                      <p className="text-xs text-red-600 mt-1">{cameraError}</p>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="mt-2 text-xs text-red-700 underline hover:no-underline"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                  {cameraOpen && (
                    <div className="mt-3 space-y-3">
                      <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-lg border-4 border-primary-blue bg-gray-900 shadow-xl">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full h-auto mirror"
                          style={{ transform: 'scaleX(-1)' }}
                        />
                        {!cameraReady && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90">
                            <div className="text-center text-white px-4">
                              <svg className="animate-spin h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <p className="text-sm font-medium">Starting camera...</p>
                              <p className="text-xs mt-1 opacity-75">Grant permission if asked</p>
                            </div>
                          </div>
                        )}
                        {cameraReady && (
                          <div className="absolute top-4 left-4 right-4">
                            <div className="bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-2 shadow-lg">
                              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                              Camera Ready
                            </div>
                          </div>
                        )}
                      </div>
                      {cameraReady && (
                        <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                          <p className="text-sm text-blue-900 font-medium">✨ Tips for best results:</p>
                          <ul className="text-xs text-blue-800 mt-2 space-y-1 list-disc list-inside">
                            <li>Position your face in the center of the frame</li>
                            <li>Make sure your face is well-lit (no shadows)</li>
                            <li>Remove sunglasses, hats, and face masks</li>
                            <li>Look directly at the camera</li>
                          </ul>
                        </div>
                      )}
                      <div className="flex items-center gap-3 justify-center">
                        <button
                          type="button"
                          onClick={captureSelfie}
                          disabled={!cameraReady}
                          className="px-6 py-3 rounded-lg bg-primary-blue text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
                        >
                          📸 Take Selfie
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition font-medium"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  )}
                  {files.selfie && !cameraOpen && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <span className="text-sm text-green-700 font-medium">✓ Selfie captured</span>
                        <div className="flex-1"></div>
                        <button
                          type="button"
                          onClick={startCamera}
                          disabled={isLocked}
                          className="text-xs text-primary-blue hover:text-blue-700 font-medium underline disabled:opacity-60"
                        >
                          Retake
                        </button>
                        <button
                          type="button"
                          onClick={() => setFiles((f) => ({ ...f, selfie: null }))}
                          className="text-xs text-red-600 hover:text-red-700 font-medium underline"
                        >
                          Remove
                        </button>
                      </div>
                      {previews.selfie && (
                        <div className="relative inline-block">
                          <img
                            src={previews.selfie}
                            alt="Selfie preview"
                            className="w-full max-w-sm rounded-lg border-2 border-green-300 shadow-md"
                          />
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            ✓
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certified copy of Omang
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    disabled={isLocked}
                    onChange={(e) =>
                      setFiles((f) => ({
                        ...f,
                        omangCopy: e.target.files?.[0] || null,
                      }))
                    }
                    className="w-full"
                  />
                  {files.omangCopy && (
                    <p className="text-xs text-gray-500 mt-2">Selected: {files.omangCopy.name}</p>
                  )}
                  {previews.omangCopy && (
                    <img
                      src={previews.omangCopy}
                      alt="Omang copy preview"
                      className="mt-3 w-full max-w-xs rounded-lg border border-gray-200"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payslip or affidavit (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    disabled={isLocked}
                    onChange={(e) =>
                      setFiles((f) => ({
                        ...f,
                        payslip: e.target.files?.[0] || null,
                      }))
                    }
                    className="w-full"
                  />
                  {files.payslip && (
                    <p className="text-xs text-gray-500 mt-2">Selected: {files.payslip.name}</p>
                  )}
                  {previews.payslip && (
                    <img
                      src={previews.payslip}
                      alt="Payslip preview"
                      className="mt-3 w-full max-w-xs rounded-lg border border-gray-200"
                    />
                  )}
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 0 || isLocked}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={isLocked}
                className="px-5 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={submitKyc}
                disabled={submitting || isLocked}
                className="px-5 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit KYC"}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  
  const slides = ["/p1.jpeg", "/p2.jpeg", "/p3.jpeg", "/p4.jpeg"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      
      if (response.ok) {
        // Check if 2FA is required
        if (data.requiresTwoFactor) {
          setShowTwoFactor(true);
          setUserId(data.userId);
          setError(""); // Clear any previous errors
        } else if (data.user) {
          // Login successful without 2FA
          localStorage.setItem("user", JSON.stringify(data.user));
          switch (data.user.userType) {
            case "admin": router.push("/admin"); break;
            case "borrower": router.push("/borrower/dashboard"); break;
            case "lender": router.push("/lender/dashboard"); break;
            default: router.push("/");
          }
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          twoFactorCode: twoFactorCode,
        }),
      });
      const data = await response.json();
      
      if (response.ok && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        switch (data.user.userType) {
          case "admin": router.push("/admin"); break;
          case "borrower": router.push("/borrower/dashboard"); break;
          case "lender": router.push("/lender/dashboard"); break;
          default: router.push("/");
        }
      } else {
        setError(data.error || "Invalid verification code");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ddeeff] via-[#eaf4ff] to-[#c8e0f8] flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-5xl flex gap-6 items-stretch">

        {/* ── Left Hero Card ── */}
        <div className="hidden lg:flex flex-col w-[52%] bg-[#0a1f44] rounded-3xl overflow-hidden relative shadow-2xl min-h-[640px]">

          {/* Logo row */}
          <div className="flex items-center gap-3 p-7 z-10 relative">
            <Image src="/logo3.jpeg" alt="Pulalend" width={52} height={52} className="rounded-xl" />
            <div>
              <div className="text-white font-bold text-xl tracking-wide">PULALEND</div>
              <div className="text-sm">
                <span className="text-white/70">the smart </span>
                <span className="text-accent-orange font-semibold">lender</span>
              </div>
            </div>
          </div>

          {/* Person image fills the card - Slideshow */}
          <div className="flex-1 relative">
            {slides.map((slide, index) => (
              <Image
                key={slide}
                src={slide}
                alt="Pulalend"
                fill
                className={`object-cover object-[center_top] transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
                sizes="500px"
                priority={index === 0}
              />
            ))}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a1f44]/10 via-[#0a1f44]/30 to-[#0a1f44]/95" />

            {/* Welcome badge */}
            <div className="absolute top-4 left-6 z-10 inline-flex items-center gap-2 bg-growth-green px-4 py-1.5 rounded-full shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-xs font-semibold tracking-wider">WELCOME TO PULALEND</span>
            </div>

            {/* Bottom text + chips */}
            <div className="absolute bottom-0 left-0 right-0 p-7 z-10">
              <h1 className="text-4xl font-extrabold text-white leading-tight mb-2">
                Borrow Smart,<br />Live Better
              </h1>
              <p className="text-white/80 text-sm mb-5">
                Access quick, reliable loans and manage repayments with ease.
              </p>

              {/* Feature chips */}
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-2 bg-primary-blue/90 backdrop-blur-sm rounded-2xl px-3 py-2 shadow">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white text-xs font-bold">Fast &amp; Easy</div>
                    <div className="text-white/70 text-[10px]">Quick loan access</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-growth-green/90 backdrop-blur-sm rounded-2xl px-3 py-2 shadow">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white text-xs font-bold">Secure &amp; Trusted</div>
                    <div className="text-white/70 text-[10px]">Safe and reliable</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-accent-orange/90 backdrop-blur-sm rounded-2xl px-3 py-2 shadow">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white text-xs font-bold">Build &amp; Grow</div>
                    <div className="text-white/70 text-[10px]">Improve your future</div>
                  </div>
                </div>
              </div>

              {/* Slide indicators */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide 
                        ? "w-8 bg-white" 
                        : "w-2 bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Security row */}
              <div className="flex items-center gap-2 mt-4 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
                <svg className="w-5 h-5 text-white/80 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-white/80 text-xs">
                  Your security is our priority.{" "}
                  <span className="text-sky-300 font-medium">Pulalend uses encrypted technology</span> to protect your data.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Form Card ── */}
        <div className="flex-1 flex flex-col">
          {/* Language selector */}
          <div className="flex justify-end mb-3">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow text-sm text-gray-700 cursor-pointer hover:shadow-md transition">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
              <span>English</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 flex-1 flex flex-col">
            {/* Mobile logo */}
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <Image src="/logo3.jpeg" alt="Pulalend" width={44} height={44} className="rounded-xl" />
              <div>
                <div className="font-bold text-lg text-navy-deep">PULALEND</div>
                <div className="text-xs text-accent-orange">the smart lender</div>
              </div>
            </div>

            {/* Portal icon */}
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-3xl shadow-xl overflow-hidden border-4 border-blue-100">
                <Image src="/logo3.jpeg" alt="Portal" width={80} height={80} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-7">
              <h1 className="text-2xl font-bold text-navy-deep">Pulalend Portal</h1>
              <p className="text-gray-500 text-sm mt-1">Sign in to access your account</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
                {error}
              </div>
            )}

            {!showTwoFactor ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue outline-none text-sm bg-gray-50 focus:bg-white transition"
                    placeholder="Email or Phone Number"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue outline-none text-sm bg-gray-50 focus:bg-white transition"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <Link 
                    href="/forgot-password" 
                    className="text-xs text-primary-blue hover:text-blue-700 font-medium transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-blue text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 active:scale-[.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-200 text-sm tracking-widest mt-1"
                >
                  {loading ? "Logging in..." : "LOG IN"}
                  {!loading && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleTwoFactorSubmit} className="space-y-5">
                {/* 2FA Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 text-sm mb-1">Verification Code Sent</h3>
                      <p className="text-blue-700 text-xs">
                        We&apos;ve sent a 6-digit verification code to <strong>{formData.email}</strong>. 
                        Please check your email and enter the code below.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2FA Code Input */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-primary-blue outline-none text-sm bg-gray-50 focus:bg-white transition text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={loading || twoFactorCode.length !== 6}
                  className="w-full bg-primary-blue text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 active:scale-[.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-blue-200 text-sm tracking-widest"
                >
                  {loading ? "Verifying..." : "VERIFY & LOGIN"}
                  {!loading && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>

                {/* Back button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowTwoFactor(false);
                    setTwoFactorCode("");
                    setError("");
                  }}
                  className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  ← Back to login
                </button>
              </form>
            )}

            {/* Register link */}
            <div className="text-center mt-5 text-sm">
              <span className="text-gray-500">Don&apos;t have an account? </span>
              <Link href="/register" className="text-primary-blue font-semibold hover:text-blue-700">
                Create an account
              </Link>
            </div>

            {/* Footer links */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-4 text-xs text-gray-400">
              <Link href="/" className="hover:text-primary-blue">About Us</Link>
              <span>|</span>
              <Link href="/terms" className="hover:text-primary-blue">Terms of Use</Link>
              <span>|</span>
              <Link href="/" className="hover:text-primary-blue">Privacy Policy</Link>
              <span>|</span>
              <Link href="/" className="hover:text-primary-blue">Contact</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

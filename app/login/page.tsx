"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaviconIcon } from "@/components/ui/Icons";
import {
  Globe2,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  ShieldCheck,
  RotateCw,
  Edit3,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";

type AuthMode = "login" | "register" | "forgot";
type RegisterStep = "details" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [registerStep, setRegisterStep] = useState<RegisterStep>("details");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Honeypot field for bot detection
  const [honeypot, setHoneypot] = useState("");

  // OTP states
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [sessionReplacedNotice, setSessionReplacedNotice] = useState(false);

  // Check for session_replaced reason in URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("reason") === "session_replaced") {
        setSessionReplacedNotice(true);
        setMode("login");
      }
    }
  }, []);

  // Countdown timer effect for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle OTP digit changes
  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, ""); // only digits
    if (!cleanVal) {
      const updated = [...otpValues];
      updated[index] = "";
      setOtpValues(updated);
      return;
    }

    // If user pasted multi-character string
    if (cleanVal.length > 1) {
      const digits = cleanVal.slice(0, 6).split("");
      const updated = [...otpValues];
      digits.forEach((d, i) => {
        if (i < 6) updated[i] = d;
      });
      setOtpValues(updated);
      const nextIdx = Math.min(digits.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
      return;
    }

    const updated = [...otpValues];
    updated[index] = cleanVal[0];
    setOtpValues(updated);

    // Auto-focus next input
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation across OTP boxes
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Client-side validation helper
  const validateInputs = () => {
    // Check bot honeypot
    if (honeypot) {
      return "Spam detected. Request rejected.";
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

    if (!cleanEmail) {
      return "Email address is required";
    }

    if (!emailRegex.test(cleanEmail)) {
      return "Please enter a valid email address (e.g., alex@example.com)";
    }

    if (mode === "register" && registerStep === "details") {
      if (!name.trim() || name.trim().length < 2) {
        return "Please enter a valid name (at least 2 characters)";
      }
      if (password.length < 6) {
        return "Password must be at least 6 characters long";
      }
    }

    if (mode === "login" && !password) {
      return "Password is required";
    }

    if (mode === "forgot" && newPassword.length < 6) {
      return "New password must be at least 6 characters long";
    }

    return null;
  };

  // Send OTP
  const handleSendOtp = async (targetEmail: string, targetName: string) => {
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail.trim().toLowerCase(),
          name: targetName.trim(),
          purpose: "registration",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }

      setRegisterStep("otp");
      setCountdown(60); // 60 seconds cooldown
      setOtpValues(["", "", "", "", "", ""]);
      setSuccessMsg(`Verification code sent to ${targetEmail}`);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send verification code";
      setError(message);
    } finally {
      setLoading(false);
      setIsResending(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    await handleSendOtp(email, name);
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Registration Step 1: Validate and send OTP
    if (mode === "register" && registerStep === "details") {
      await handleSendOtp(email, name);
      return;
    }

    // Registration Step 2: Verify OTP and Register
    if (mode === "register" && registerStep === "otp") {
      const otpCode = otpValues.join("");
      if (otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
        setError("Please enter the complete 6-digit numeric verification code");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            otp: otpCode,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Registration failed");
        }

        setSuccessMsg("Email verified & Account created! Redirecting...");

        setTimeout(() => {
          if (data.user?.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
          router.refresh();
        }, 1000);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Forgot password flow
    if (mode === "forgot") {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            newPassword,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to reset password");
        }

        setSuccessMsg(data.message || "Password reset successfully! Please sign in.");
        setTimeout(() => {
          setMode("login");
          setPassword("");
          setNewPassword("");
        }, 2000);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to reset password";
        setError(message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Login flow
    if (mode === "login") {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Authentication failed");
        }

        setSuccessMsg("Welcome back! Redirecting to your dashboard...");

        setTimeout(() => {
          if (data.user?.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
          router.refresh();
        }, 1000);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setRegisterStep("details");
    setError("");
    setSuccessMsg("");
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500 text-rose-400" };
    if (score <= 3) return { score: 2, label: "Good", color: "bg-amber-500 text-amber-400" };
    return { score: 3, label: "Strong", color: "bg-emerald-500 text-emerald-400" };
  };

  const passStrength = getPasswordStrength(mode === "forgot" ? newPassword : password);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 overflow-hidden px-4 py-12">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/20 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 transition-colors mb-4 backdrop-blur-md"
          >
            <FaviconIcon className="w-5 h-5" />
            <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              is-a-coder.in
            </span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            {mode === "login" && "Welcome Back, Developer"}
            {mode === "register" && registerStep === "details" && "Claim Your Free Subdomain"}
            {mode === "register" && registerStep === "otp" && "Verify Your Email"}
            {mode === "forgot" && "Reset Your Password"}
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            {mode === "login" && "Sign in to manage and configure your is-a-coder.in domains"}
            {mode === "register" && registerStep === "details" && "Create an account to launch your developer identity"}
            {mode === "register" && registerStep === "otp" && "Enter the 6-digit code sent to your email"}
            {mode === "forgot" && "Enter your registered email and choose a new password"}
          </p>
        </div>

        {/* Card Box */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/5">
          {/* Tab switch (Shown for Login & Register initial modes) */}
          {mode !== "forgot" && (
            <div className="flex rounded-xl bg-slate-800/80 p-1 mb-6 border border-white/5">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {mode === "forgot" && (
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
              <span className="text-xs text-cyan-400 font-semibold flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" />
                Password Recovery
              </span>
            </div>
          )}

          {/* Session Replaced / Another Device Login Alert */}
          {sessionReplacedNotice && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3 leading-relaxed"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">Signed Out (New Device Login)</p>
                <p className="text-slate-300 mt-0.5 text-[11px] leading-relaxed">
                  Your account was logged into from another browser or computer. For your security, the previous session was ended. Please sign in again to continue on this device.
                </p>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs sm:text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Success Message */}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-300 text-xs sm:text-sm"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Registration Step 2: OTP Entry Form */}
          {mode === "register" && registerStep === "otp" ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Target Email badge with edit button */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-white/5 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-slate-300 truncate font-medium">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRegisterStep("details");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium shrink-0 ml-2 cursor-pointer transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Change</span>
                </button>
              </div>

              {/* 6-Digit OTP inputs */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                  {otpValues.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold bg-slate-950/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition shadow-inner"
                    />
                  ))}
                </div>
              </div>

              {/* Resend Code Action */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Didn&apos;t receive code?</span>
                <button
                  type="button"
                  disabled={countdown > 0 || isResending}
                  onClick={handleResendOtp}
                  className="inline-flex items-center gap-1.5 font-medium text-cyan-400 hover:text-cyan-300 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer transition"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 opacity-50" />
                      <span>Resend in {countdown}s</span>
                    </>
                  ) : (
                    <>
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Resend Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Verify & Complete Button */}
              <button
                type="submit"
                disabled={loading || otpValues.join("").length !== 6}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4.5 h-4.5" />
                    <span>Verify & Create Account</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>

              {/* Back to Step 1 */}
              <button
                type="button"
                onClick={() => {
                  setRegisterStep("details");
                  setError("");
                  setSuccessMsg("");
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                ← Back to account details
              </button>
            </form>
          ) : (
            /* Login, Register Step 1, or Forgot Password form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Invisible Bot Honeypot Field */}
              <input
                type="text"
                name="company_security_trap"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Full Name field (Register only) */}
              <AnimatePresence mode="wait">
                {mode === "register" && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5"
                  >
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Full Name / Developer Handle
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        maxLength={80}
                        placeholder="Alex Rivera"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm transition"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    maxLength={100}
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm transition"
                  />
                </div>
              </div>

              {/* Standard Password Field (Login & Register) */}
              {mode !== "forgot" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setError("");
                          setSuccessMsg("");
                        }}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline transition cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      minLength={6}
                      maxLength={128}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password strength meter for registration */}
                  {mode === "register" && password && (
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Password Strength:</span>
                        <span className={`font-semibold ${passStrength.color.split(" ")[1]}`}>
                          {passStrength.label}
                        </span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                        <div
                          className={`h-full flex-1 rounded-full transition-all ${
                            passStrength.score >= 1 ? passStrength.color.split(" ")[0] : "bg-slate-800"
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full transition-all ${
                            passStrength.score >= 2 ? passStrength.color.split(" ")[0] : "bg-slate-800"
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full transition-all ${
                            passStrength.score >= 3 ? passStrength.color.split(" ")[0] : "bg-slate-800"
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* New Password Field (Forgot Password mode) */}
              {mode === "forgot" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    New Password (min. 6 chars)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter new password"
                      minLength={6}
                      maxLength={128}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Securely...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === "login" && "Sign In"}
                      {mode === "register" && "Verify Email & Continue"}
                      {mode === "forgot" && "Update Password"}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Badge Footer */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400/80" />
            <span>256-bit Encrypted &amp; Protected against Brute Force</span>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-cyan-400 transition inline-flex items-center gap-1"
          >
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

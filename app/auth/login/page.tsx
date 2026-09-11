"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  KeyRound,
  X,
  Send,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import GoogleAuthModal from "@/components/GoogleAuthModal";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";
  const justRegistered = searchParams.get("registered") === "true";

  const { login, loginWithGoogle, resetPassword, lockoutTimeRemaining } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    justRegistered ? "Account registered successfully! Please log in with your credentials." : null
  );

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<{ loading: boolean; message?: string; error?: string }>({
    loading: false,
  });

  const isLocked = lockoutTimeRemaining !== null && lockoutTimeRemaining > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isLocked) {
      setErrorMessage(
        `Account is temporarily locked. Please wait ${lockoutTimeRemaining} minute(s) before retrying.`
      );
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login(email, password, rememberMe);
      if (!res.success) {
        setErrorMessage(res.error || "Invalid email or password.");
        setIsSubmitting(false);
      } else {
        router.push(redirectTarget);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during login.");
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (profile: { name: string; email: string }) => {
    const res = await loginWithGoogle(profile);
    if (res.success) {
      router.push(redirectTarget);
    } else {
      setErrorMessage(res.error || "Google authentication failed.");
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus({ loading: true });

    try {
      const res = await resetPassword(forgotEmail);
      if (res.success) {
        setForgotStatus({ loading: false, message: res.message });
      } else {
        setForgotStatus({ loading: false, error: res.message });
      }
    } catch {
      setForgotStatus({
        loading: false,
        error: "Failed to dispatch reset request. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#05060A] text-white flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500 selection:text-black">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 max-w-full">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-blue-600/10 rounded-full blur-[100px] sm:blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-cyan-500/10 rounded-full blur-[90px] sm:blur-[120px]" />
      </div>

      <div className="w-full max-w-md mx-auto text-center space-y-3 flex flex-col items-center">
        <Link href="/" className="inline-flex flex-col items-center group">
          <div className="relative w-24 h-28 sm:w-32 sm:h-36 transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] drop-shadow-[0_0_35px_rgba(56,189,248,0.25)]">
            <Image
              src="/images/qsn_shield_logo.png"
              alt="Quarter Spoon Network Shield Logo"
              fill
              priority
              unoptimized
              className="object-contain"
            />
          </div>
          <span className="font-black tracking-[0.2em] sm:tracking-[0.25em] text-white uppercase text-xs sm:text-sm mt-2">
            Quarter Spoon Network
          </span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
          Portal Sign In
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-light">
          Authorized access required to enter the broadcast vault
        </p>
      </div>

      <div className="mt-6 sm:mt-8 w-full max-w-md mx-auto">
        <div className="bg-[#0A0E1A] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Success Banner */}
          {successMessage && (
            <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Account Lockout Notice */}
          {isLocked && (
            <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div className="space-y-1">
                <span className="font-bold uppercase tracking-wider block">Security Lockout Active</span>
                <span>
                  Too many failed attempts. Access locked for <strong>{lockoutTimeRemaining}</strong> minute(s).
                </span>
              </div>
            </div>
          )}

          {/* Quick Google Sign In */}
          <div>
            <button
              type="button"
              disabled={isLocked}
              onClick={() => setIsGoogleModalOpen(true)}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Log in with Google</span>
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-[2px]">
                <span className="bg-[#0A0E1A] px-3 text-zinc-500">Or sign in with email</span>
              </div>
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono tracking-wider uppercase text-zinc-300">
                Official Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="you@gmail.com / yahoo / official"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLocked}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono tracking-wider uppercase text-zinc-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-2 cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLocked}
                  className="w-full pl-10 pr-10 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-black/60 text-cyan-500 focus:ring-cyan-400 accent-cyan-500 cursor-pointer"
                />
                <span className="text-xs text-zinc-300">Remember me for 30 days</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isLocked}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-[#0B1A30] hover:bg-[#122A4F] text-white border border-blue-400/50 hover:border-cyan-400 font-bold text-xs uppercase tracking-[2px] rounded-xl shadow-[0_4px_25px_rgba(11,26,48,0.9)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter Portal</span>
                    <ArrowRight className="w-4 h-4 text-cyan-400" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Link to Register */}
          <div className="text-center pt-2 border-t border-white/10 text-xs text-zinc-400">
            <span>Don&apos;t have an account yet? </span>
            <Link
              href="/auth/register"
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4 cursor-pointer"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
      />

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0D121F] border border-white/15 rounded-2xl shadow-2xl p-6 space-y-4 text-white">
            <button
              onClick={() => {
                setIsForgotModalOpen(false);
                setForgotStatus({ loading: false });
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 text-cyan-400 mb-1">
                <KeyRound className="w-4 h-4" />
                <span className="text-[10px] font-mono tracking-widest uppercase">Password Recovery</span>
              </div>
              <h3 className="text-lg font-bold text-white">Reset Account Password</h3>
              <p className="text-xs text-zinc-400">
                Enter your official registered email address. We will verify your account and dispatch recovery details.
              </p>
            </div>

            {forgotStatus.message && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {forgotStatus.message}
              </div>
            )}

            {forgotStatus.error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {forgotStatus.error}
              </div>
            )}

            {!forgotStatus.message && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-mono uppercase text-zinc-300">Registered Email</label>
                  <input
                    type="email"
                    required
                    placeholder="you@gmail.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotStatus.loading}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {forgotStatus.loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Recovery Instructions</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#05060A] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

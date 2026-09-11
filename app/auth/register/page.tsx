"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Check,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { validateOfficialEmail } from "@/lib/emailValidator";
import GoogleAuthModal from "@/components/GoogleAuthModal";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // 1. Full name validation: minimum 2 words
  const isFullNameValid = useMemo(() => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    return parts.length >= 2;
  }, [fullName]);

  // 2. Email validation (disposable blacklist check)
  const emailValidation = useMemo(() => {
    if (!email) return { isValid: false };
    return validateOfficialEmail(email);
  }, [email]);

  // 3. Password validations
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  // Real-time password strength score (0 to 4)
  const passwordScore = useMemo(() => {
    let score = 0;
    if (hasMinLength) score++;
    if (hasUppercase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;
    return score;
  }, [hasMinLength, hasUppercase, hasNumber, hasSpecialChar]);

  const passwordStrengthLabel = useMemo(() => {
    if (password.length === 0) return { label: "", color: "bg-zinc-700", text: "" };
    if (passwordScore <= 1) return { label: "Weak", color: "bg-red-500", text: "text-red-400" };
    if (passwordScore === 2 || passwordScore === 3)
      return { label: "Moderate", color: "bg-amber-400", text: "text-amber-400" };
    return { label: "Strong", color: "bg-emerald-400", text: "text-emerald-400" };
  }, [password, passwordScore]);

  // 4. Confirm password match
  const doPasswordsMatch = password.length > 0 && password === confirmPassword;

  // 5. Submit disabled until all validations pass
  const isFormValid =
    isFullNameValid &&
    emailValidation.isValid &&
    passwordScore === 4 &&
    doPasswordsMatch &&
    !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isFullNameValid) {
      setErrorMessage("Please enter both your first and last name.");
      return;
    }

    if (!emailValidation.isValid) {
      setErrorMessage(emailValidation.error || "Please enter a valid official email address.");
      return;
    }

    if (passwordScore < 4) {
      setErrorMessage("Password does not meet all required security criteria.");
      return;
    }

    if (!doPasswordsMatch) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await register(fullName, email, password);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to create account.");
        setIsSubmitting(false);
      } else {
        // Redirect to login page with query param
        router.push("/auth/login?registered=true");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during registration.");
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (profile: { name: string; email: string }) => {
    const res = await loginWithGoogle(profile);
    if (res.success) {
      router.push("/");
    } else {
      setErrorMessage(res.error || "Google authentication failed.");
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#05060A] text-white flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500 selection:text-black">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 max-w-full">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-blue-600/10 rounded-full blur-[100px] sm:blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-cyan-500/10 rounded-full blur-[90px] sm:blur-[120px]" />
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
          Create Account
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-light">
          Join the Quarter Spoon Network private access portal
        </p>
      </div>

      <div className="mt-6 sm:mt-8 w-full max-w-md mx-auto">
        <div className="bg-[#0A0E1A] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Quick Google Sign Up */}
          <div>
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(true)}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer active:scale-[0.99]"
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
              <span>Continue with Google</span>
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-[2px]">
                <span className="bg-[#0A0E1A] px-3 text-zinc-500">Or register with email</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono tracking-wider uppercase text-zinc-300">
                Full Name <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="First and Last Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
              {fullName && !isFullNameValid && (
                <span className="block text-[11px] text-amber-400">
                  Minimum 2 words required (First and Last Name).
                </span>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono tracking-wider uppercase text-zinc-300">
                Official Email Address <span className="text-cyan-400">*</span>
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
                  className={`w-full pl-10 pr-4 py-2.5 bg-black/60 border rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none transition-colors ${
                    email && !emailValidation.isValid
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-white/15 focus:border-cyan-400"
                  }`}
                />
              </div>
              {email && !emailValidation.isValid && (
                <span className="block text-[11px] text-red-400 leading-tight">
                  {emailValidation.error}
                </span>
              )}
              {email && emailValidation.isValid && (
                <span className="block text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>Verified official email format</span>
                </span>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono tracking-wider uppercase text-zinc-300">
                  Password <span className="text-cyan-400">*</span>
                </label>
                {password && (
                  <span className={`text-[10px] font-mono uppercase tracking-wider ${passwordStrengthLabel.text}`}>
                    {passwordStrengthLabel.label}
                  </span>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Min. 8 characters with upper, number, symbol"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter Bar */}
              {password.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        passwordScore >= 1 ? passwordStrengthLabel.color : "bg-transparent"
                      }`}
                    />
                    <div
                      className={`h-full rounded-full transition-all ${
                        passwordScore >= 2 ? passwordStrengthLabel.color : "bg-transparent"
                      }`}
                    />
                    <div
                      className={`h-full rounded-full transition-all ${
                        passwordScore >= 3 ? passwordStrengthLabel.color : "bg-transparent"
                      }`}
                    />
                    <div
                      className={`h-full rounded-full transition-all ${
                        passwordScore >= 4 ? passwordStrengthLabel.color : "bg-transparent"
                      }`}
                    />
                  </div>

                  {/* Criteria Checklist */}
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-400 pt-1 font-mono">
                    <div className={`flex items-center space-x-1 ${hasMinLength ? "text-emerald-400" : ""}`}>
                      <Check className={`w-3 h-3 ${hasMinLength ? "opacity-100" : "opacity-30"}`} />
                      <span>8+ Characters</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${hasUppercase ? "text-emerald-400" : ""}`}>
                      <Check className={`w-3 h-3 ${hasUppercase ? "opacity-100" : "opacity-30"}`} />
                      <span>1 Uppercase</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${hasNumber ? "text-emerald-400" : ""}`}>
                      <Check className={`w-3 h-3 ${hasNumber ? "opacity-100" : "opacity-30"}`} />
                      <span>1 Number</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${hasSpecialChar ? "text-emerald-400" : ""}`}>
                      <Check className={`w-3 h-3 ${hasSpecialChar ? "opacity-100" : "opacity-30"}`} />
                      <span>1 Symbol</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono tracking-wider uppercase text-zinc-300">
                Confirm Password <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && !doPasswordsMatch && (
                <span className="block text-[11px] text-red-400">Passwords do not match.</span>
              )}
              {confirmPassword && doPasswordsMatch && (
                <span className="block text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>Passwords match</span>
                </span>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isFormValid}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-[#0B1A30] hover:bg-[#122A4F] text-white border border-blue-400/50 hover:border-cyan-400 font-bold text-xs uppercase tracking-[2px] rounded-xl shadow-[0_4px_25px_rgba(11,26,48,0.9)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-blue-400/50 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Navigation to Login */}
          <div className="text-center pt-2 border-t border-white/10 text-xs text-zinc-400">
            <span>Already have an authorized account? </span>
            <Link
              href="/auth/login"
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4 cursor-pointer"
            >
              Sign In Here
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
    </div>
  );
}

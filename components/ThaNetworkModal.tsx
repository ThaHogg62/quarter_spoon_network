"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  Sparkles,
  CheckCircle2,
  X,
  Radio,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { validateOfficialEmail } from "@/lib/emailValidator";

export default function ThaNetworkModal() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);

  // Auto-open if redirected with query param ?subscribe=tha-network
  useEffect(() => {
    if (searchParams.get("subscribe") === "tha-network") {
      setIsOpen(true);
    }

    const handleCustomOpen = () => setIsOpen(true);
    window.addEventListener("open-tha-network-modal", handleCustomOpen);
    return () => window.removeEventListener("open-tha-network-modal", handleCustomOpen);
  }, [searchParams]);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setFullName(user.fullName);
    }
  }, [user]);

  const handleOpen = () => {
    setErrorMessage(null);
    setIsSuccess(false);
    if (user) {
      setEmail(user.email);
      setFullName(user.fullName);
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsSuccess(false);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    const emailCheck = validateOfficialEmail(email.trim());
    if (!emailCheck.isValid) {
      setErrorMessage(emailCheck.error || "Please enter a valid, official email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          fullName: fullName.trim() || undefined,
          source: "Tha Network Web Modal",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Subscription failed. Please try again.");
      } else {
        setIsAlreadySubscribed(data.alreadySubscribed);
        setIsSuccess(true);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("tha-network-subscribed", { detail: { email: email.trim() } }));
        }
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please verify your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Pill on Home / Studio Floor */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-40 flex items-center space-x-2.5 bg-[#0B1A30]/90 hover:bg-[#122A4F] backdrop-blur-xl border border-cyan-500/40 hover:border-cyan-400 text-white px-4 py-2.5 rounded-full shadow-[0_8px_30px_rgba(6,182,212,0.3)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer group"
        title="Join Tha Network Email List"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
        </span>
        <span className="text-xs font-mono font-bold tracking-[2px] uppercase text-cyan-300 group-hover:text-white">
          Tha Network
        </span>
        <Mail className="w-3.5 h-3.5 text-cyan-400" />
      </button>

      {/* Subscription Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0A0E1A] border border-white/15 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden">
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-cyan-500/20 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-500/15 to-transparent blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#070A12]">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-[2.5px] uppercase text-cyan-400 block">
                    PRIVATE FREQUENCY DISPATCH
                  </span>
                  <h3 className="text-lg font-black uppercase tracking-wider text-white">
                    Tha Network
                  </h3>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {isSuccess ? (
                <div className="space-y-6 py-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xl font-extrabold uppercase tracking-wide text-white">
                      {isAlreadySubscribed ? "You're Already Locked In!" : "You're Locked In."}
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-300 font-light max-w-sm mx-auto leading-relaxed">
                      Your official welcome dispatch has been generated and dispatched to{" "}
                      <span className="text-cyan-400 font-mono font-medium">{email}</span> signed directly by{" "}
                      <span className="text-amber-400 font-bold">Tha Hogg</span>.
                    </p>
                  </div>

                  <div className="bg-[#05060A] border border-white/10 rounded-xl p-4 text-left font-mono text-[11px] text-zinc-400 space-y-1">
                    <div className="flex items-center space-x-2 text-cyan-400 font-bold mb-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span>DISPATCH TRANSMITTED</span>
                    </div>
                    <p className="text-zinc-300">
                      &ldquo;No spam, no corporate noise. Just authentic work coming straight from the deck.&rdquo;
                    </p>
                    <span className="block text-amber-400 text-right">— Tha Hogg</span>
                  </div>

                  <button
                    onClick={handleClose}
                    className="w-full py-3 bg-[#0B1A30] hover:bg-[#122A4F] text-white border border-blue-400/40 rounded-xl font-extrabold text-xs uppercase tracking-[2px] transition-all cursor-pointer"
                  >
                    Return to Studio Floor
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                      Get behind closed doors. Subscribe to{" "}
                      <strong className="text-white font-bold">&ldquo;Tha Network&rdquo;</strong> for exclusive unreleased
                      film cuts from Unda Tha Radar Filmz, private screening invites, and raw studio dispatches straight from Tha Hogg.
                    </p>
                  </div>

                  {/* Highlights */}
                  <div className="grid grid-cols-1 gap-2.5 bg-black/40 border border-white/10 rounded-xl p-3.5 text-xs text-zinc-300 font-light">
                    <div className="flex items-start space-x-2.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white font-semibold">First-Look Visual Drops:</strong> Direct 4K unreleased archival reels.
                      </span>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white font-semibold">Authentic & Uncut:</strong> Zero fluff, zero spam, strictly authentic frequency.
                      </span>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {errorMessage && (
                    <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Subscription Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-mono tracking-wider uppercase text-zinc-400 mb-1.5">
                        Full Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Marcus Vance"
                        className="w-full bg-[#05060A] border border-white/15 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono tracking-wider uppercase text-zinc-400 mb-1.5">
                        Official Email Address <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@domain.com"
                        className="w-full bg-[#05060A] border border-white/15 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-black font-black text-xs uppercase tracking-[2px] rounded-xl shadow-[0_4px_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>{isSubmitting ? "Locking In..." : "Join Tha Network"}</span>
                      <ArrowRight className="w-4 h-4 text-black" />
                    </button>

                    <p className="text-[10px] text-center text-zinc-500 font-mono tracking-wide">
                      Instant Thank You email signed by Tha Hogg dispatched upon sign-up.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

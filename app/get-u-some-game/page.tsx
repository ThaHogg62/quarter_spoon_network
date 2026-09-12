"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Radio,
  Zap,
  Mail,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { validateOfficialEmail } from "@/lib/emailValidator";

export default function GetUSomeGamePage() {
  const { user, isLoading: authLoading } = useAuth();

  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [checkingSub, setCheckingSub] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Direct Question for Tha Hogg");
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Verify subscription status against backend
  useEffect(() => {
    async function verifySubscription() {
      if (!user?.email) {
        setIsSubscribed(false);
        setCheckingSub(false);
        return;
      }

      try {
        const res = await fetch(`/api/subscribe?email=${encodeURIComponent(user.email)}`);
        const json = await res.json();
        setIsSubscribed(!!json.isSubscribed);
      } catch {
        setIsSubscribed(false);
      } finally {
        setCheckingSub(false);
      }
    }

    if (!authLoading) {
      verifySubscription();
    }
  }, [user, authLoading]);

  // 2. Pre-fill user data
  useEffect(() => {
    if (user) {
      if (user.fullName) setFullName(user.fullName);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  // 3. Listen for immediate subscription unlock event from ThaNetworkModal
  useEffect(() => {
    const handleSubscribed = (e: any) => {
      if (e.detail?.email) {
        setEmail(e.detail.email);
        setIsSubscribed(true);
        setCheckingSub(false);
      }
    };
    window.addEventListener("tha-network-subscribed", handleSubscribed);
    return () => window.removeEventListener("tha-network-subscribed", handleSubscribed);
  }, []);

  const openSubscribeModal = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-tha-network-modal"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !question.trim()) {
      setErrorMessage("Please enter both your email address and your question.");
      return;
    }

    const emailCheck = validateOfficialEmail(email.trim());
    if (!emailCheck.isValid) {
      setErrorMessage(emailCheck.error || "Please enter a valid, official working email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim() || undefined,
          email: email.trim(),
          category,
          question: question.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        if (res.status === 403) {
          setIsSubscribed(false);
        }
        setErrorMessage(json.error || "Failed to transmit message. Please try again.");
      } else {
        setIsSuccess(true);
        setQuestion("");
      }
    } catch {
      setErrorMessage("Network error. Please verify your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // State A: Checking auth and subscription status
  if (authLoading || checkingSub) {
    return (
      <div className="fixed inset-0 bg-[#05060A] flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
        <span className="text-xs font-mono tracking-[3px] uppercase text-zinc-400 animate-pulse">
          Verifying Subscriber Access...
        </span>
      </div>
    );
  }

  // State B: Access Gated — User is NOT subscribed to Tha Network
  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-[#05060A] text-white flex flex-col justify-between selection:bg-amber-400 selection:text-black">
        {/* Ambient background lighting */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[500px] bg-cyan-500/10 rounded-full blur-[160px]" />
          <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[140px]" />
        </div>

        {/* Top Header */}
        <header className="w-full px-6 py-4 md:px-12 backdrop-blur-xl bg-[#05060A]/85 border-b border-white/10 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-full cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Studio</span>
          </Link>
          <div className="flex items-center space-x-2 text-[11px] font-mono tracking-wider text-amber-400 bg-black/60 border border-amber-500/30 px-3.5 py-1.5 rounded-full">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>SUBSCRIBER VIP LOCKED</span>
          </div>
        </header>

        {/* Locked Access Presentation */}
        <main className="max-w-2xl mx-auto px-6 py-12 text-center space-y-8">
          {/* Quarter Spoon Emblem with lock badge */}
          <div className="w-52 sm:w-64 aspect-[16/9] mx-auto relative rounded-2xl overflow-hidden border border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.25)] bg-black">
            <Image
              src="/images/get_game_footer_btn.jpg"
              alt="Quarter Spoon Muzicc - Get U Some Game"
              fill
              priority
              unoptimized
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-2.5 right-2.5 bg-black/85 px-2.5 py-1 rounded-md text-[10px] font-mono text-amber-400 border border-amber-500/30 flex items-center space-x-1.5 shadow-lg">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>VIP SUBSCRIBERS ONLY</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 bg-[#0A192F] border border-cyan-500/40 px-3.5 py-1 rounded-full text-[10px] tracking-[2.5px] uppercase text-cyan-300 shadow-xl">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>THA NETWORK SUBSCRIBERS ONLY</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
              Get U Some{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
                Game
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 font-light max-w-lg mx-auto leading-relaxed">
              The <strong>&ldquo;Get U Some Game&rdquo;</strong> direct dialog and suggestion section is reserved exclusively for subscribers of Tha Network. Subscribe to unlock your direct line to Tha Hogg.
            </p>
          </div>

          {/* Subscriber Privileges Box */}
          <div className="bg-[#0A0E1A] border border-white/10 rounded-2xl p-6 text-left space-y-3 font-mono text-xs">
            <div className="text-amber-400 font-bold uppercase tracking-wider flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>EXCLUSIVE SUBSCRIBER PRIVILEGES:</span>
            </div>
            <ul className="space-y-2.5 text-zinc-300 font-sans text-xs">
              <li className="flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Direct 2-Way Line to Tha Hogg:</strong> Ask any question about filmmaking, AI prompts, visual direction, or music production.
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Personal Replies to Your Inbox:</strong> When Tha Hogg replies, his answer lands right in your email inbox so you can continue the conversation.
                </span>
              </li>
              <li className="flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Next Bundle Influence:</strong> Submit your prompt bundle suggestions and request exactly what visual templates should be engineered next.
                </span>
              </li>
            </ul>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={openSubscribeModal}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-black font-black text-xs uppercase tracking-[2.5px] rounded-xl shadow-[0_0_35px_rgba(6,182,212,0.4)] transition-all cursor-pointer transform hover:scale-105 active:scale-95"
            >
              <span className="flex items-center justify-center space-x-2">
                <Radio className="w-4 h-4 text-black animate-pulse" />
                <span>Subscribe to Tha Network & Unlock</span>
              </span>
            </button>
            <Link
              href="/?subscribe=tha-network"
              className="w-full sm:w-auto px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors text-center"
            >
              Go to Subscription Hub
            </Link>
          </div>
        </main>

        <footer className="w-full text-center py-6 text-[11px] font-mono text-zinc-600 border-t border-white/5">
          Quarter Spoon Network &bull; Get U Some Game &bull; Subscribers Exclusive
        </footer>
      </div>
    );
  }

  // State C: User IS Subscribed — Unlocked Direct Dialog Form
  return (
    <div className="min-h-screen bg-[#05060A] text-white selection:bg-amber-400 selection:text-black flex flex-col justify-between">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[500px] bg-amber-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px]" />
      </div>

      {/* Top Header */}
      <header className="w-full px-6 py-4 md:px-12 backdrop-blur-xl bg-[#05060A]/85 border-b border-white/10 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center space-x-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-full cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Studio</span>
        </Link>

        <div className="flex items-center space-x-2 text-[11px] font-mono tracking-wider text-emerald-400 bg-black/60 border border-emerald-500/30 px-3.5 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>VIP SUBSCRIBER ACCESS VERIFIED</span>
        </div>
      </header>

      {/* Main Dialog Box Section */}
      <main className="max-w-2xl w-full mx-auto px-6 py-10 space-y-8">
        {/* Official Quarter Spoon Muzicc Emblem */}
        <div className="w-52 sm:w-64 aspect-[16/9] mx-auto relative rounded-2xl overflow-hidden border border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.25)] bg-black">
          <Image
            src="/images/get_game_footer_btn.jpg"
            alt="Quarter Spoon Muzicc - Get U Some Game"
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-[#0A192F] border border-cyan-500/40 px-3.5 py-1 rounded-full text-[10px] tracking-[2.5px] uppercase text-cyan-300 shadow-xl">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>UNFILTERED WISDOM // ASK THA HOGG ANYTHING</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
            Get U Some{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
              Game
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 font-light max-w-lg mx-auto leading-relaxed">
            Got a question about filmmaking, prompts, AI video, music production, or what bundle should drop next?
            Drop your message below. It routes directly to Tha Hogg, and his reply will land straight in your email inbox.
          </p>
        </div>

        {/* Dialog Form Card */}
        <div className="relative rounded-2xl bg-[#0A0E1A] border border-white/15 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden">
          {isSuccess ? (
            <div className="py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold uppercase text-white">
                  Transmission Sent Directly to Tha Hogg
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 font-light max-w-sm mx-auto leading-relaxed">
                  Your question has been dispatched to{" "}
                  <span className="font-mono text-amber-300">mrdulow12@gmail.com</span>. When Tha Hogg replies, his answer
                  will be delivered straight to <span className="font-mono text-cyan-400">{email}</span>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-left font-mono text-[11px] text-zinc-400 space-y-1">
                <span className="text-amber-400 font-bold uppercase block mb-1">
                  2-WAY EMAIL COMMUNICATION ACTIVE:
                </span>
                <p>
                  You will be able to reply directly back to his email from your own phone or computer to continue the conversation.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setIsSuccess(false)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Ask Another Question
                </button>
                <Link
                  href="/"
                  className="flex-1 py-3 bg-[#0B1A30] hover:bg-[#122A4F] border border-blue-400/40 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors text-center"
                >
                  Return to Studio
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* VIP Subscriber verified status badge */}
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-300 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>VIP SUBSCRIBER ACCESS VERIFIED</span>
                </span>
                <span className="text-[10px] text-zinc-400 hidden sm:inline">
                  DIRECT LINE &rarr; mrdulow12@gmail.com
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs font-mono">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono tracking-wider uppercase text-zinc-400 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full bg-[#05060A] border border-white/15 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono tracking-wider uppercase text-zinc-400 mb-1.5">
                    Your Email Address <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@domain.com"
                    className="w-full bg-[#05060A] border border-white/15 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono tracking-wider uppercase text-zinc-400 mb-1.5">
                  Topic / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#05060A] border border-white/15 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none"
                >
                  <option value="Direct Question for Tha Hogg">Direct Question for Tha Hogg</option>
                  <option value="Prompt Bundle Suggestion">Prompt Bundle Suggestion (Next Drop)</option>
                  <option value="Filmmaking & Visual Advice">Filmmaking & Visual Advice</option>
                  <option value="Music Production & Studio Game">Music Production & Studio Game</option>
                  <option value="General Wisdom & Conversation">General Wisdom & Conversation</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono tracking-wider uppercase text-zinc-400">
                    Your Question or Suggestion <span className="text-amber-400">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Direct reply to your email
                  </span>
                </div>
                <textarea
                  rows={6}
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Drop your question or let me know what prompt bundles you wanna see next..."
                  className="w-full bg-[#05060A] border border-white/15 focus:border-amber-400 rounded-xl p-4 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-black font-black text-xs uppercase tracking-[2px] rounded-xl shadow-[0_4px_30px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center space-x-2 cursor-pointer transform hover:scale-[1.01] active:scale-95"
                >
                  <Send className="w-4 h-4 text-black" />
                  <span>{isSubmitting ? "Transmitting to Tha Hogg..." : "Send Question Directly to Tha Hogg"}</span>
                </button>
              </div>

              <p className="text-[10px] text-center text-zinc-500 font-mono tracking-wide pt-1">
                Routed to mrdulow12@gmail.com with reply-to configuration enabled.
              </p>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-[11px] font-mono text-zinc-600 border-t border-white/5">
        Quarter Spoon Network &bull; Get U Some Game &bull; Directed by Tha Hogg
      </footer>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Zap,
  Film,
  Radio,
} from "lucide-react";
import { DBGameInquiry } from "@/lib/db";

interface DirectReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: DBGameInquiry | null;
  adminEmail: string;
  onSuccess?: (updatedInquiry: DBGameInquiry) => void;
}

export default function DirectReplyModal({
  isOpen,
  onClose,
  inquiry,
  adminEmail,
  onSuccess,
}: DirectReplyModalProps) {
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (inquiry) {
      setSubject(`Tha Hogg // Direct Response: ${inquiry.category || "Quarter Spoon Network"}`);
      setBodyText(
        `Salute ${inquiry.fullName || "VIP Member"},\n\nGot your note on Quarter Spoon Network:\n"${inquiry.question}"\n\n`
      );
      setErrorMessage(null);
      setIsSuccess(false);
    }
  }, [inquiry]);

  if (!isOpen || !inquiry) return null;

  const applyPreset = (presetType: "bundle" | "film" | "salute") => {
    const name = inquiry.fullName || "VIP Member";
    if (presetType === "bundle") {
      setSubject(`Tha Hogg // Next Prompt Bundle Drop: ${inquiry.category || "Workflow Request"}`);
      setBodyText(
        `Salute ${name},\n\nGot your note on Quarter Spoon Network regarding the next prompt drop:\n"${inquiry.question}"\n\nI have locked this exact visual concept into our production schedule for the upcoming monthly Digital Workflow release. Keep an eye on your vault inside Tha Network.\n\nKeep creating and staying tapped in.\n\n— Tha Hogg // Quarter Spoon Network // Fresno, CA`
      );
    } else if (presetType === "film") {
      setSubject(`Tha Hogg // Direct Advice: ${inquiry.category || "Filmmaking & AI"}`);
      setBodyText(
        `Salute ${name},\n\nAppreciate you reaching out on the visual side:\n"${inquiry.question}"\n\nWhen crafting your shots, always establish your physical optics first—lens millimeter, sensor crop, and contrast ratios. Never let the tool dictate the story; you direct the camera.\n\nMore game dropping soon in the vault.\n\n— Tha Hogg // Unda Tha Radar Filmz`
      );
    } else {
      setSubject(`Tha Hogg // Salute & Much Respect: ${inquiry.category || "Network Dialog"}`);
      setBodyText(
        `Salute ${name},\n\nAppreciate you locking into Quarter Spoon Network and sending this over:\n"${inquiry.question}"\n\nRead your message loud and clear. Much respect for tapping into Tha Network—stay tuned for next month's drop.\n\n— Tha Hogg // Quarter Spoon Network`
      );
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!bodyText.trim()) {
      setErrorMessage("Please type a reply message before transmitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail,
          inquiryId: inquiry.id,
          recipientEmail: inquiry.email,
          recipientName: inquiry.fullName,
          subject: subject.trim(),
          bodyText: bodyText.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMessage(json.error || "Failed to dispatch direct reply.");
      } else {
        setIsSuccess(true);
        if (onSuccess && json.inquiry) {
          onSuccess(json.inquiry);
        }
      }
    } catch {
      setErrorMessage("Network error transmitting reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const mailtoLink = `mailto:${encodeURIComponent(inquiry.email)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(bodyText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0A0E1A] border border-white/20 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#070A12] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              <MessageSquare className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-[2.5px] uppercase text-amber-400 block font-bold">
                DIRECT DIALOG TRANSMISSION // THA HOGG
              </span>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                Instant Reply to Suggestion Box Request
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {isSuccess ? (
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-black uppercase text-white tracking-wide">
                  Reply Dispatched Directly to Member
                </h4>
                <p className="text-xs sm:text-sm text-zinc-300 font-light max-w-md mx-auto leading-relaxed">
                  Your reply has been delivered straight to{" "}
                  <span className="font-mono text-cyan-400 font-semibold">{inquiry.email}</span> ({inquiry.fullName}).
                  The transmission has been recorded in the platform audit log.
                </p>
              </div>

              <div className="bg-[#05060A] border border-white/10 rounded-xl p-4 text-left font-mono text-[11px] text-zinc-400 space-y-1 max-w-lg mx-auto">
                <span className="text-amber-400 font-bold uppercase block">
                  DISPATCH AUDIT DETAILS:
                </span>
                <div>Recipient: {inquiry.email}</div>
                <div>Subject: {subject}</div>
                <div>Status: VERIFIED WORKING OFFICIAL EMAIL &bull; SENT</div>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-[#0B1A30] hover:bg-[#122A4F] text-white border border-blue-400/40 rounded-xl font-bold text-xs uppercase tracking-[2px] transition-all cursor-pointer"
                >
                  Close &amp; Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              {/* Original Request Banner */}
              <div className="bg-[#05060A] border border-white/15 rounded-xl p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">
                      REQUEST FROM:
                    </span>
                    <span className="text-white font-bold text-xs">{inquiry.fullName}</span>
                    <span className="text-[10px] font-mono text-cyan-400">({inquiry.email})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold uppercase">
                      {inquiry.category || "Suggestion"}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>OFFICIAL EMAIL VERIFIED</span>
                    </span>
                  </div>
                </div>

                <div className="bg-black/50 p-3 rounded-lg border border-white/10 text-xs text-zinc-200 italic leading-relaxed">
                  &ldquo;{inquiry.question}&rdquo;
                </div>
              </div>

              {/* 1-Click Quick Tone Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  <span>1-CLICK QUICK BLUEPRINT PRESETS:</span>
                  <span className="text-zinc-500">Auto-fills authentic response</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset("bundle")}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 text-zinc-300 hover:text-white text-[11px] font-mono flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>⚡ Next Drop Locked In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset("film")}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 text-zinc-300 hover:text-white text-[11px] font-mono flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <Film className="w-3 h-3 text-cyan-400" />
                    <span>🎬 Filmmaking &amp; AI Advice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset("salute")}
                    className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/40 text-zinc-300 hover:text-white text-[11px] font-mono flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>🎙️ Direct Respect &amp; Salute</span>
                  </button>
                </div>
              </div>

              {/* Subject Input */}
              <div>
                <label className="block text-[11px] font-mono tracking-wider uppercase text-zinc-400 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#05060A] border border-white/15 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Message Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono tracking-wider uppercase text-zinc-400">
                    Your Direct Reply
                  </label>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Signed directly as Tha Hogg
                  </span>
                </div>
                <textarea
                  rows={8}
                  required
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Type your direct reply to the member..."
                  className="w-full bg-[#05060A] border border-white/15 focus:border-amber-400 rounded-xl p-4 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none transition-colors leading-relaxed"
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs font-mono">
                  {errorMessage}
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-black font-black text-xs uppercase tracking-[2px] rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center space-x-2 cursor-pointer transform hover:scale-[1.01]"
                >
                  <Send className="w-4 h-4 text-black" />
                  <span>{isSubmitting ? "Transmitting Direct Reply..." : "Send Direct Email To Member"}</span>
                </button>

                <a
                  href={mailtoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-4 py-3.5 bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-300 hover:text-white text-xs font-mono rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  title="Open in your default mail app"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Mail App</span>
                </a>
              </div>

              <p className="text-[10px] text-center text-zinc-500 font-mono tracking-wide">
                Targeted delivery to {inquiry.email} &bull; Recorded to dispatch audit trail &bull; Signed Tha Hogg
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


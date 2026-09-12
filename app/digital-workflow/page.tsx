"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Download,
  Lock,
  Radio,
  FileText,
  Copy,
  Check,
  Send,
  Sparkles,
  Zap,
  Layers,
  Terminal,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Film,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { validateOfficialEmail } from "@/lib/emailValidator";
import DirectReplyModal from "@/components/DirectReplyModal";

export default function DigitalWorkflowPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [checkingSub, setCheckingSub] = useState(true);

  // Active prompt preview tab in Tha Prompt Zone
  const [activePromptTab, setActivePromptTab] = useState<"plug_and_play" | "monster_master">(
    "plug_and_play"
  );
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Suggestion Box State
  const [suggestionText, setSuggestionText] = useState("");
  const [suggestionCategory, setSuggestionCategory] = useState("Next Prompt Bundle");
  const [isSendingSuggestion, setIsSendingSuggestion] = useState(false);
  const [suggestionSuccess, setSuggestionSuccess] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  // Check if current user is Tha Hogg (Admin)
  const isAdmin =
    !!user?.email &&
    ["mrdulow12@gmail.com", "qse6209@gmail.com"].includes(user.email.toLowerCase().trim());

  const [adminInquiries, setAdminInquiries] = useState<any[]>([]);
  const [replyInquiry, setReplyInquiry] = useState<any | null>(null);

  const fetchInquiries = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/game?email=${encodeURIComponent(user.email)}`);
      const json = await res.json();
      if (json.success && json.inquiries) {
        setAdminInquiries(json.inquiries);
      }
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchInquiries();
    }
  }, [isAdmin, fetchInquiries]);

  // Check subscriber status
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const trackDownload = async (
    pdfId: string,
    pdfTitle: string,
    fileName: string,
    category: string,
    fileSize: string
  ) => {
    try {
      fetch("/api/download/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfId,
          pdfTitle,
          fileName,
          category,
          fileSize,
          userEmail: user?.email || "anonymous@quarterspoon.com",
          userName: user?.fullName || "Tha Network Subscriber",
          isSubscriber: isSubscribed ?? true,
        }),
      }).catch((err) => {
        console.warn("Telemetry track error:", err);
      });
    } catch (err) {
      console.warn("Download telemetry dispatch failed:", err);
    }
  };

  const handleSendSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionText.trim() || !user?.email) return;

    // Validate official, non-fake email before submitting
    const emailCheck = validateOfficialEmail(user.email);
    if (!emailCheck.isValid) {
      setSuggestionError(emailCheck.error || "Please use an official, working email address.");
      return;
    }

    setIsSendingSuggestion(true);
    setSuggestionError(null);

    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: user.fullName || "Subscribed Creator",
          email: user.email,
          category: `Prompt Suggestion: ${suggestionCategory}`,
          question: suggestionText.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuggestionSuccess(true);
        setSuggestionText("");
      } else {
        setSuggestionError(json.error || "Failed to submit suggestion.");
      }
    } catch {
      setSuggestionError("Network error. Please try again.");
    } finally {
      setIsSendingSuggestion(false);
    }
  };

  // 1. Loading state
  if (authLoading || checkingSub) {
    return (
      <div className="fixed inset-0 bg-[#05060A] flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
        <span className="text-xs font-mono tracking-[3px] uppercase text-zinc-400 animate-pulse">
          Verifying Subscriber Frequency...
        </span>
      </div>
    );
  }

  // 2. Access Gated: User is NOT subscribed to Tha Network
  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-[#05060A] text-white flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
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
            <span>SUBSCRIBER VAULT LOCKED</span>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-16 text-center space-y-8">
          <div className="w-20 h-20 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(6,182,212,0.3)]">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 bg-black/70 border border-cyan-500/30 px-3.5 py-1 rounded-full text-[10px] tracking-[2.5px] uppercase text-cyan-300">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>THA NETWORK SUBSCRIBERS ONLY</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">Workflow</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed max-w-lg mx-auto">
              This private chamber contains proprietary director-grade T2I and I2V prompt blueprints,
              6-second timeline JSON architecture, and monthly downloadable creator bundles from Tha Hogg.
            </p>
          </div>

          <div className="bg-[#0A0E1A] border border-white/10 rounded-2xl p-6 text-left space-y-3 font-mono text-xs">
            <div className="text-amber-400 font-bold uppercase tracking-wider flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>HOW TO UNLOCK INSTANT ACCESS:</span>
            </div>
            <ul className="space-y-2 text-zinc-300 font-sans">
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 font-mono font-bold">&bull;</span>
                <span>Lock into <strong>&ldquo;Tha Network&rdquo;</strong> email list (100% free for members).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 font-mono font-bold">&bull;</span>
                <span>Instantly download both master PDF prompt suites with continuous glowing neon trace triggers.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 font-mono font-bold">&bull;</span>
                <span>Receive brand new monthly prompt packs dropped straight into your vault.</span>
              </li>
            </ul>
          </div>

          <div>
            <Link
              href="/?subscribe=tha-network"
              className="inline-flex items-center space-x-2.5 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-black font-black text-xs uppercase tracking-[2.5px] rounded-xl shadow-[0_0_40px_rgba(6,182,212,0.4)] transition-all cursor-pointer transform hover:scale-105"
            >
              <Radio className="w-4 h-4 text-black animate-pulse" />
              <span>Subscribe to Tha Network & Unlock Vault</span>
            </Link>
          </div>
        </main>

        <footer className="w-full text-center py-6 text-[11px] font-mono text-zinc-600 border-t border-white/5">
          Quarter Spoon Network &bull; Digital Workflow &bull; Subscribers Exclusive
        </footer>
      </div>
    );
  }

  // 3. User is SUBSCRIBED: Render full Digital Workflow Suite!
  return (
    <div className="min-h-screen bg-[#05060A] text-white selection:bg-cyan-500 selection:text-black">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-10 right-1/4 w-[600px] h-[500px] bg-cyan-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full px-6 py-4 md:px-12 backdrop-blur-xl bg-[#05060A]/85 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-full cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Studio</span>
          </Link>

          <div className="hidden sm:flex items-center space-x-3 pl-2 border-l border-white/10">
            <div className="relative w-8 h-10 sm:w-9 sm:h-11 shrink-0">
              <Image
                src="/images/unda_tha_radar_logo.png"
                alt="Unda Tha Radar Filmz"
                fill
                priority
                unoptimized
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold tracking-[0.2em] text-white text-xs uppercase block leading-none">
                Quarter Spoon
              </span>
              <span className="text-[9px] tracking-[0.25em] text-cyan-400 uppercase font-semibold">
                Digital Workflow
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-[11px] font-mono tracking-wider text-emerald-400 bg-black/60 border border-emerald-500/30 px-3.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SUBSCRIBER VIP UNLOCKED</span>
          </div>

          <Link
            href="/get-u-some-game"
            className="hidden md:flex items-center space-x-1.5 text-xs font-mono text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>Ask Tha Hogg</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8 sm:py-12 md:px-12 space-y-12">
        {/* Title Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 bg-[#0A192F] border border-blue-400/40 px-3.5 py-1 rounded-full text-[10px] tracking-[2.5px] uppercase text-cyan-300 shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>THA NETWORK CREATOR ARSENAL // EXCLUSIVE ASSETS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
            Digital{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
              Workflow
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-2xl leading-relaxed">
            Proprietary Text-To-Image (T2I) and Image-To-Video (I2V) prompt templates, forensic camera stacks,
            and downloadable blueprints curated by Tha Hogg. Every month, a brand new bundle drops into your vault.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* ARCHIVAL TRANSMISSION STYLED CARDS SECTION                                */}
        {/* Matches exact size, style, color, animations, and properties of tha-visuals */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
              Creator Transmission Vault
            </h2>
            <p className="text-xs text-zinc-400 font-light">
              Select any card below to access master prompt sets and instant PDF downloads.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ========================================================================= */}
            {/* CARD 1: THA PROMPT ZONE                                                   */}
            {/* ========================================================================= */}
            <div className="group relative rounded-2xl overflow-hidden bg-[#0A0E1A] border border-white/10 hover:border-cyan-400/60 hover:shadow-[0_0_35px_rgba(56,189,248,0.25)] transition-all flex flex-col justify-between">
              {/* Card Header & Thumbnail Artwork */}
              <div>
                <div className="relative aspect-video w-full bg-black overflow-hidden">
                  <Image
                    src="/images/prompt_zone_thumb.jpg"
                    alt="Tha Prompt Zone - Master T2I & I2V Prompt Templates"
                    fill
                    priority
                    unoptimized
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] via-black/40 to-transparent" />

                  {/* Top Tag */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[9px] font-mono tracking-[2px] uppercase bg-black/75 backdrop-blur-md text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded-md flex items-center space-x-1.5 shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span>OFFICIAL BUNDLE // VOL 1</span>
                    </span>
                  </div>

                  {/* Right Tag */}
                  <div className="absolute top-3 right-3 flex items-center space-x-1 text-[10px] font-mono bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-amber-300 border border-amber-500/30">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>T2I &bull; I2V JSON</span>
                  </div>

                  {/* Bottom-Left Badge */}
                  <div className="absolute bottom-3 left-3 pointer-events-none">
                    <div className="px-4 py-2 rounded-xl backdrop-blur-md bg-black/70 border border-white/15 text-left shadow-lg">
                      <span className="text-[10px] font-mono tracking-[3px] text-cyan-400 uppercase block">
                        MASTER PROMPT ARCHIVE
                      </span>
                      <span className="text-sm font-black uppercase text-white tracking-wider">
                        10 Pre-Baked Blueprints
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase">
                      PROPRIETARY AI GENERATION PROTOCOL
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>2 PDFS READY</span>
                    </span>
                  </div>

                  <h3 className="font-black text-xl tracking-wide uppercase text-white group-hover:text-cyan-300 transition-colors">
                    Tha Prompt Zone
                  </h3>

                  <p className="text-xs text-zinc-300 font-light leading-relaxed">
                    Access both official master prompt manuals: the <strong>Plug-And-Play Production Suite (Vol. 1)</strong> with 10 cinematic scenes (Studio Performance, Noir Detective, Urban Drift, Beauty Close-Up, Landscape) and the <strong>Monster Master Set</strong> equipped with forensic optics, ACEScg color pipeline, and 6-second I2V timeline JSON.
                  </p>

                  {/* Interactive Tab Selector to Inspect Prompts */}
                  <div className="pt-2 space-y-3">
                    <div className="flex items-center space-x-2 bg-black/60 p-1 rounded-xl border border-white/10 font-mono text-[11px]">
                      <button
                        onClick={() => setActivePromptTab("plug_and_play")}
                        className={`flex-1 py-2 rounded-lg transition-all cursor-pointer text-center ${
                          activePromptTab === "plug_and_play"
                            ? "bg-cyan-500 text-black font-bold shadow"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        1. Plug-And-Play Suite
                      </button>
                      <button
                        onClick={() => setActivePromptTab("monster_master")}
                        className={`flex-1 py-2 rounded-lg transition-all cursor-pointer text-center ${
                          activePromptTab === "monster_master"
                            ? "bg-cyan-500 text-black font-bold shadow"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        2. Monster Master Set
                      </button>
                    </div>

                    {/* Prompt Preview Snippet */}
                    <div className="bg-[#05060A] border border-white/10 rounded-xl p-4 space-y-2.5 font-mono text-[11px]">
                      {activePromptTab === "plug_and_play" ? (
                        <>
                          <div className="flex items-center justify-between text-zinc-400">
                            <span className="text-cyan-400 font-bold">TEMPLATE 1: THE STUDIO PERFORMANCE</span>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  `[MASTER REALITY STACK] [Subject: [INSERT ARTIST DESCRIPTION] performing into a vintage Neumann studio microphone.] [Action: Rhythmic rap delivery, head nodding, studio ambiance.] [Detail: Saturated blue/cyan lighting, skin sweat, 16K nanoscale fabric texture.] --ar 16:9 --style raw --stylize 1200`,
                                  "t1"
                                )
                              }
                              className="flex items-center space-x-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            >
                              {copiedIndex === "t1" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedIndex === "t1" ? "Copied" : "Copy T2I"}</span>
                            </button>
                          </div>
                          <p className="text-zinc-300 line-clamp-3 bg-black/40 p-2.5 rounded-lg border border-white/5">
                            [MASTER REALITY STACK] [Subject: [INSERT ARTIST DESCRIPTION] performing into a vintage Neumann studio microphone.] [Action: Rhythmic rap delivery, head nodding, studio ambiance.] [Detail: Saturated blue/cyan lighting, skin sweat, 16K nanoscale fabric texture.] --ar 16:9 --style raw --stylize 1200
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-zinc-400">
                            <span className="text-amber-400 font-bold">MONSTER MASTER SET // OPTICS & ACQUISITION</span>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  `Arri Alexa 65 LF 6.5K Open Gate scanned to 16:9 | Zeiss Supreme Prime Radiance 35mm T1.5 | Schneider Platinum RHOdium FSND 1.2 | Lens Breathing: Natural | ACEScg Pipeline | Kodak Vision3 500T 5219 pushed +1 stop | Unreal Engine 5.5 Nanite + Lumen Path-Traced 2048spp`,
                                  "m1"
                                )
                              }
                              className="flex items-center space-x-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            >
                              {copiedIndex === "m1" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedIndex === "m1" ? "Copied" : "Copy Memory"}</span>
                            </button>
                          </div>
                          <p className="text-zinc-300 line-clamp-3 bg-black/40 p-2.5 rounded-lg border border-white/5">
                            Optics: [Arri Alexa 65 LF 6.5K Open Gate] &bull; Film Stock: [ACEScg Pipeline, Kodak Vision3 500T 5219] &bull; Physics & Light: [Unreal Engine 5.5 Nanite + Lumen Path-Traced 2048spp]
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* INSTANT DOWNLOAD BUTTONS WITH CONSTANT ROTATING NEON WHITE BEAM   */}
              {/* ================================================================= */}
              <div className="p-6 bg-[#070A12] border-t border-white/10 space-y-4">
                <span className="text-[10px] font-mono tracking-[2px] uppercase text-zinc-400 block font-bold">
                  DIRECT INSTANT DOWNLOADS (SUBSCRIBER ACCESS)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* PDF 1 Download Button */}
                  <a
                    href="/downloads/the_plug_and_play_production_suite_vol1.pdf"
                    download="The_Plug_And_Play_Production_Suite_Vol1.pdf"
                    onClick={() =>
                      trackDownload(
                        "plug-and-play-suite-vol1",
                        "The Plug-And-Play Production Suite (Vol. 1)",
                        "the_plug_and_play_production_suite_vol1.pdf",
                        "T2I / I2V Blueprints",
                        "138 KB"
                      )
                    }
                    className="relative block p-[1.5px] rounded-xl overflow-hidden group/btn shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] transition-shadow cursor-pointer"
                  >
                    {/* Glowing Neon White Beam Rotating Constantly in Synchronized Motion */}
                    <span className="neon-white-beam" />

                    <div className="relative px-4 py-3 rounded-[10.5px] bg-[#090D17] hover:bg-[#0E1526] transition-colors flex items-center justify-between">
                      <div className="space-y-0.5 text-left">
                        <span className="text-[11px] font-black uppercase text-white block">
                          Plug-And-Play Vol. 1
                        </span>
                        <span className="text-[9px] font-mono text-zinc-400 block">
                          PDF Manual &bull; 138 KB
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/10 group-hover/btn:bg-white group-hover/btn:text-black transition-all">
                        <Download className="w-4 h-4 text-white group-hover/btn:text-black" />
                      </div>
                    </div>
                  </a>

                  {/* PDF 2 Download Button */}
                  <a
                    href="/downloads/basic_character_t2i_i2v.pdf"
                    download="Basic_Character_T2I_I2V_Monster_Master_Set.pdf"
                    onClick={() =>
                      trackDownload(
                        "monster-master-set",
                        "Monster Master Set // Basic Character T2I & I2V",
                        "basic_character_t2i_i2v.pdf",
                        "Forensic Optics & JSON",
                        "118 KB"
                      )
                    }
                    className="relative block p-[1.5px] rounded-xl overflow-hidden group/btn shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] transition-shadow cursor-pointer"
                  >
                    {/* Glowing Neon White Beam Rotating Constantly in Synchronized Motion */}
                    <span className="neon-white-beam" />

                    <div className="relative px-4 py-3 rounded-[10.5px] bg-[#090D17] hover:bg-[#0E1526] transition-colors flex items-center justify-between">
                      <div className="space-y-0.5 text-left">
                        <span className="text-[11px] font-black uppercase text-white block">
                          Monster Master Set
                        </span>
                        <span className="text-[9px] font-mono text-zinc-400 block">
                          PDF Manual &bull; 118 KB
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/10 group-hover/btn:bg-white group-hover/btn:text-black transition-all">
                        <Download className="w-4 h-4 text-white group-hover/btn:text-black" />
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* CARD 2: THA SUGGESTION BOX                                                */}
            {/* ========================================================================= */}
            <div className="group relative rounded-2xl overflow-hidden bg-[#0A0E1A] border border-white/10 hover:border-cyan-400/60 hover:shadow-[0_0_35px_rgba(56,189,248,0.25)] transition-all flex flex-col justify-between">
              {/* Card Header & Artwork */}
              <div>
                <div className="relative aspect-video w-full bg-black overflow-hidden">
                  <Image
                    src="/images/suggestion_box_thumb.jpg"
                    alt="Tha Suggestion Box - What prompt bundles you wanna download next"
                    fill
                    priority
                    unoptimized
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] via-black/40 to-transparent" />

                  {/* Top Tag */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[9px] font-mono tracking-[2px] uppercase bg-black/75 backdrop-blur-md text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-md flex items-center space-x-1.5 shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span>COMMUNITY DIRECT INPUT</span>
                    </span>
                  </div>

                  {/* Right Tag */}
                  <div className="absolute top-3 right-3 flex items-center space-x-1 text-[10px] font-mono bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-cyan-300 border border-cyan-500/30">
                    <MessageSquare className="w-3 h-3 text-cyan-400" />
                    <span>MONTHLY DROPS</span>
                  </div>

                  {/* Bottom-Left Badge */}
                  <div className="absolute bottom-3 left-3 pointer-events-none">
                    <div className="px-4 py-2 rounded-xl backdrop-blur-md bg-black/70 border border-white/15 text-left shadow-lg">
                      <span className="text-[10px] font-mono tracking-[3px] text-amber-400 uppercase block">
                        DIRECT TO THA HOGG
                      </span>
                      <span className="text-sm font-black uppercase text-white tracking-wider">
                        Next Bundle Request
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-400 tracking-wider uppercase">
                      CREATOR WISHLIST & FEEDBACK
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      DESTINATION: mrdulow12@gmail.com
                    </span>
                  </div>

                  <h3 className="font-black text-xl tracking-wide uppercase text-white group-hover:text-amber-300 transition-colors">
                    Tha Suggestion Box
                  </h3>

                  {/* EXACT USER-REQUESTED DESCRIPTION */}
                  <p className="text-sm font-medium text-cyan-300 italic leading-relaxed">
                    &ldquo;Let me know what prompt bundles you wanna download next&rdquo;
                  </p>

                  <p className="text-xs text-zinc-400 font-light leading-relaxed">
                    Every month a fresh bundle of prompt templates is released into this vault. Submit the exact visual scenes, lighting aesthetics, or camera mechanics you want built, and they will be engineered for the next release.
                  </p>
                </div>
              </div>

              {/* Interactive Submission Form */}
              <div className="p-6 bg-[#070A12] border-t border-white/10 space-y-4">
                {suggestionSuccess ? (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono space-y-2">
                    <div className="flex items-center space-x-2 font-bold text-sm">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Suggestion Transmitted!</span>
                    </div>
                    <p className="text-zinc-300 font-sans">
                      Tha Hogg received your request. Check your inbox when he responds or when the new monthly bundle goes live!
                    </p>
                    <button
                      onClick={() => setSuggestionSuccess(false)}
                      className="text-xs text-cyan-400 hover:underline uppercase pt-1 block cursor-pointer"
                    >
                      Submit another suggestion &rarr;
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSendSuggestion} className="space-y-3">
                    {suggestionError && (
                      <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-mono">
                        {suggestionError}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={suggestionCategory}
                        onChange={(e) => setSuggestionCategory(e.target.value)}
                        className="bg-[#05060A] border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
                      >
                        <option value="Cinematic Short Films">Cinematic Short Films</option>
                        <option value="Music Video Aesthetics">Music Video Aesthetics</option>
                        <option value="West Fresno Streets">West Fresno Streets</option>
                        <option value="Sci-Fi / Cyberpunk Worlds">Sci-Fi / Cyberpunk Worlds</option>
                        <option value="Product & Tech Commercials">Product & Tech Commercials</option>
                      </select>

                      <input
                        type="text"
                        required
                        placeholder="What prompts should Tha Hogg engineer next?"
                        value={suggestionText}
                        onChange={(e) => setSuggestionText(e.target.value)}
                        className="flex-1 bg-[#05060A] border border-white/15 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-zinc-500">
                        Sender: {user?.email}
                      </span>

                      {/* Submit Button with Neon White Beam */}
                      <button
                        type="submit"
                        disabled={isSendingSuggestion || !suggestionText.trim()}
                        className="relative p-[1.5px] rounded-xl overflow-hidden group/btn disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-shadow"
                      >
                        <span className="neon-white-beam" />
                        <div className="relative px-5 py-2.5 rounded-[10px] bg-[#090D17] hover:bg-[#121A2E] text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-colors">
                          <Send className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isSendingSuggestion ? "Sending..." : "Submit to Tha Hogg"}</span>
                        </div>
                      </button>
                    </div>
                  </form>
                )}

                {/* Tha Hogg Admin Review & Instant Reply Deck for Suggestion Box */}
                {isAdmin && (
                  <div className="pt-4 border-t border-amber-500/25 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-[10px] font-mono tracking-[2px] uppercase text-amber-300 font-bold">
                          👑 THA HOGG DIRECT INBOX // RECENT REQUESTS ({adminInquiries.length})
                        </span>
                      </div>
                      <button
                        onClick={fetchInquiries}
                        className="text-[9px] font-mono text-zinc-400 hover:text-white uppercase cursor-pointer"
                      >
                        Refresh
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {adminInquiries.length === 0 ? (
                        <p className="text-[11px] text-zinc-500 font-mono italic">
                          No suggestions waiting in queue.
                        </p>
                      ) : (
                        adminInquiries.slice(0, 8).map((inq) => (
                          <div
                            key={inq.id}
                            className="p-3 rounded-xl bg-[#05060A] border border-white/10 hover:border-amber-400/40 transition-colors space-y-2 text-left"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-white font-bold text-xs">{inq.fullName}</span>
                                <span className="text-[10px] font-mono text-cyan-400">({inq.email})</span>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[9px] uppercase">
                                {inq.category || "Suggestion"}
                              </span>
                            </div>

                            <p className="text-xs text-zinc-200 bg-black/50 p-2.5 rounded-lg font-sans leading-relaxed">
                              &ldquo;{inq.question}&rdquo;
                            </p>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] font-mono text-zinc-500">
                                {new Date(inq.timestamp).toLocaleDateString()}
                              </span>

                              {inq.status === "replied" || inq.reply ? (
                                <div className="flex items-center space-x-2">
                                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center space-x-1">
                                    <Check className="w-3 h-3" />
                                    <span>Replied</span>
                                  </span>
                                  <button
                                    onClick={() => setReplyInquiry(inq)}
                                    className="text-[10px] font-mono text-cyan-400 hover:underline cursor-pointer"
                                  >
                                    Reply Again
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setReplyInquiry(inq)}
                                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-mono text-[10px] font-black uppercase flex items-center space-x-1.5 cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-transform hover:scale-105"
                                >
                                  <Send className="w-3 h-3 text-black" />
                                  <span>Reply Instantly</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Pop-Up Email Reply Box for Tha Hogg */}
      <DirectReplyModal
        isOpen={!!replyInquiry}
        onClose={() => setReplyInquiry(null)}
        inquiry={replyInquiry}
        adminEmail={user?.email || "mrdulow12@gmail.com"}
        onSuccess={() => {
          fetchInquiries();
        }}
      />
    </div>
  );
}

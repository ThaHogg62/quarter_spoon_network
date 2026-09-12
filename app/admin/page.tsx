"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Mail,
  Send,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Flame,
  Radio,
  Download,
  ExternalLink,
  Eye,
  LogOut,
  Sparkles,
  Zap,
  Play,
  Film,
  FileText,
  ArrowDownToLine,
  MessageSquare,
  Check,
} from "lucide-react";
import DirectReplyModal from "@/components/DirectReplyModal";

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  provider: "email" | "google";
  createdAt: string;
  lastLoginAt: string;
  role?: string;
  isSubscribed?: boolean;
}

interface AdminSubscriber {
  id: string;
  email: string;
  fullName: string;
  subscribedAt: string;
  source: string;
  status: "active" | "unsubscribed";
}

interface AdminLoginLog {
  id: string;
  userId?: string;
  email: string;
  fullName: string;
  provider: string;
  timestamp: string;
}

interface AdminDispatch {
  id: string;
  type: "thank_you" | "invite" | "blast" | "digital_workflow" | "preview";
  recipientEmail: string;
  recipientName: string;
  subject: string;
  bodyText: string;
  sentAt: string;
  status: string;
}

interface AdminVideoStat {
  videoId: string;
  videoTitle: string;
  category: string;
  totalPlays: number;
  subscriberPlays: number;
  nonSubscriberPlays: number;
  lastPlayedAt: string | null;
}

interface AdminVideoPlay {
  id: string;
  videoId: string;
  videoTitle: string;
  userEmail: string;
  userName: string;
  isSubscriber: boolean;
  timestamp: string;
}

interface AdminGameInquiry {
  id: string;
  fullName: string;
  email: string;
  category: string;
  question: string;
  timestamp: string;
  reply?: {
    text: string;
    repliedAt: string;
    adminEmail: string;
    subject?: string;
  };
  status?: "pending" | "replied";
}

interface AdminPdfStat {
  pdfId: string;
  pdfTitle: string;
  fileName: string;
  category: string;
  fileSize: string;
  totalDownloads: number;
  subscriberDownloads: number;
  nonSubscriberDownloads: number;
  lastDownloadedAt: string | null;
}

interface AdminPdfDownload {
  id: string;
  pdfId: string;
  pdfTitle: string;
  fileName: string;
  category: string;
  fileSize: string;
  userEmail: string;
  userName: string;
  isSubscriber: boolean;
  timestamp: string;
}

interface AdminTelemetryData {
  metrics: {
    totalUsers: number;
    totalSubscribers: number;
    activeRecently: number;
    nonSubscribersCount: number;
    totalPdfDownloads?: number;
  };
  subscribers: AdminSubscriber[];
  users: AdminUser[];
  loginLogs: AdminLoginLog[];
  dispatches: AdminDispatch[];
  videoStats?: AdminVideoStat[];
  recentVideoPlays?: AdminVideoPlay[];
  gameInquiries?: AdminGameInquiry[];
  pdfStats?: AdminPdfStat[];
  recentPdfDownloads?: AdminPdfDownload[];
  templates: {
    thankYou: { subject: string; text: string; html: string };
    invite: { subject: string; text: string; html: string };
    digitalWorkflow?: { subject: string; text: string; html: string };
  };
}

const AUTHORIZED_ADMINS = ["mrdulow12@gmail.com", "qse6209@gmail.com"];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  const [data, setData] = useState<AdminTelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [autoRefreshInterval] = useState(5); // 5 seconds
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(5);
  const [isAutoRefreshPaused, setIsAutoRefreshPaused] = useState(false);

  // Search & Filter
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState<"ALL" | "NON_SUBSCRIBERS" | "SUBSCRIBERS">("ALL");

  // Email Action Modals
  const [blastModalOpen, setBlastModalOpen] = useState(false);
  const [subscriberBlastModalOpen, setSubscriberBlastModalOpen] = useState(false);
  const [previewTemplateModal, setPreviewTemplateModal] = useState<
    "thankYou" | "invite" | "digitalWorkflow" | null
  >(null);
  const [singleInviteModal, setSingleInviteModal] = useState<{ open: boolean; user?: AdminUser }>({
    open: false,
  });
  const [replyModalInquiry, setReplyModalInquiry] = useState<AdminGameInquiry | null>(null);

  // Blast Form State (Non-subscribers)
  const [blastSubject, setBlastSubject] = useState("");
  const [blastBody, setBlastBody] = useState("");
  const [isBlasting, setIsBlasting] = useState(false);
  const [blastStatusMessage, setBlastStatusMessage] = useState<string | null>(null);

  // Subscriber Blast Form State (Digital Workflow Announcement)
  const [subBlastSubject, setSubBlastSubject] = useState("");
  const [subBlastBody, setSubBlastBody] = useState("");
  const [isSubBlasting, setIsSubBlasting] = useState(false);
  const [subBlastStatusMessage, setSubBlastStatusMessage] = useState<string | null>(null);

  // Single Invite Form State
  const [singleSubject, setSingleSubject] = useState("");
  const [singleBody, setSingleBody] = useState("");
  const [isSendingSingle, setIsSendingSingle] = useState(false);

  // Authorization Check
  const isAuthorizedAdmin = useMemo(() => {
    if (!user) return false;
    return AUTHORIZED_ADMINS.includes(user.email.toLowerCase().trim());
  }, [user]);

  // Fetch Telemetry Data from API
  const fetchTelemetry = useCallback(
    async (isBackground = false) => {
      if (!user || !isAuthorizedAdmin) return;

      if (!isBackground) setRefreshing(true);

      try {
        const res = await fetch(
          `/api/admin/data?adminEmail=${encodeURIComponent(user.email)}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error("Unauthorized or server error");
        }

        const json = await res.json();
        if (json.success) {
          setData(json);
          setLastRefreshed(new Date());

          // Pre-populate blast text if empty
          if (!blastSubject && json.templates?.invite?.subject) {
            setBlastSubject(json.templates.invite.subject);
            setBlastBody(json.templates.invite.text);
          }
          if (!subBlastSubject && json.templates?.digitalWorkflow?.subject) {
            setSubBlastSubject(json.templates.digitalWorkflow.subject);
            setSubBlastBody(json.templates.digitalWorkflow.text);
          }
        }
      } catch (err) {
        console.error("Telemetry fetch failed:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setSecondsUntilRefresh(autoRefreshInterval);
      }
    },
    [user, isAuthorizedAdmin, blastSubject, autoRefreshInterval]
  );

  // Initial Load
  useEffect(() => {
    if (!authLoading && isAuthorizedAdmin) {
      fetchTelemetry();
    }
  }, [authLoading, isAuthorizedAdmin, fetchTelemetry]);

  // Real-time Countdown and 5-second Auto-Refresh Timer
  useEffect(() => {
    if (!isAuthorizedAdmin || isAutoRefreshPaused) return;

    const timer = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          fetchTelemetry(true);
          return autoRefreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthorizedAdmin, isAutoRefreshPaused, fetchTelemetry, autoRefreshInterval]);

  // Format Date Helpers
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 45) return "Just now";
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
      if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } catch {
      return dateStr;
    }
  };

  const formatDateExact = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // CSV Exporter for Subscribers
  const handleExportCSV = () => {
    if (!data?.subscribers) return;

    const headers = ["ID", "Email", "Full Name", "Subscribed At", "Source", "Status"];
    const rows = data.subscribers.map((s) => [
      s.id,
      s.email,
      `"${s.fullName || ""}"`,
      s.subscribedAt,
      s.source,
      s.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tha_network_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dispatch Email Blast to Non-Subscribers
  const handleLaunchBlast = async () => {
    if (!user) return;
    setIsBlasting(true);
    setBlastStatusMessage(null);

    try {
      const res = await fetch("/api/admin/blast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: user.email,
          target: "all_non_subscribers",
          customSubject: blastSubject.trim() || undefined,
          customBody: blastBody.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setBlastStatusMessage(json.details || `Successfully blasted ${json.totalDispatched} non-subscribers.`);
        fetchTelemetry(true);
        setTimeout(() => {
          setBlastModalOpen(false);
          setBlastStatusMessage(null);
        }, 2500);
      } else {
        setBlastStatusMessage(json.error || "Blast failed to dispatch.");
      }
    } catch (err: any) {
      setBlastStatusMessage("Network error launching blast: " + err.message);
    } finally {
      setIsBlasting(false);
    }
  };

  // Open Single Invite Modal
  const openSingleInvite = (targetUser: AdminUser) => {
    if (data?.templates?.invite) {
      setSingleSubject(data.templates.invite.subject);
      setSingleBody(data.templates.invite.text);
    }
    setSingleInviteModal({ open: true, user: targetUser });
  };

  // Dispatch Single Invite
  const handleSendSingleInvite = async () => {
    if (!user || !singleInviteModal.user) return;
    setIsSendingSingle(true);

    try {
      const res = await fetch("/api/admin/blast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: user.email,
          target: "single",
          recipientEmail: singleInviteModal.user.email,
          recipientName: singleInviteModal.user.fullName,
          customSubject: singleSubject.trim() || undefined,
          customBody: singleBody.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        fetchTelemetry(true);
        setSingleInviteModal({ open: false });
      } else {
        alert(json.error || "Failed to dispatch email.");
      }
    } catch {
      alert("Network error dispatching invite.");
    } finally {
      setIsSendingSingle(false);
    }
  };

  // Dispatch Email Blast to All Subscribers (Digital Workflow Announcement)
  const handleLaunchSubscriberBlast = async () => {
    if (!user) return;
    setIsSubBlasting(true);
    setSubBlastStatusMessage(null);

    try {
      const res = await fetch("/api/admin/blast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: user.email,
          target: "all_subscribers",
          customSubject: subBlastSubject.trim() || undefined,
          customBody: subBlastBody.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSubBlastStatusMessage(
          json.details || `Successfully announced Digital Workflow to ${json.totalDispatched} subscriber(s).`
        );
        fetchTelemetry(true);
        setTimeout(() => {
          setSubscriberBlastModalOpen(false);
          setSubBlastStatusMessage(null);
        }, 2500);
      } else {
        setSubBlastStatusMessage(json.error || "Announcement failed to dispatch.");
      }
    } catch (err: any) {
      setSubBlastStatusMessage("Network error launching announcement: " + err.message);
    } finally {
      setIsSubBlasting(false);
    }
  };

  // Test send dispatch to admin
  const handleTestDispatch = async (templateType: "thank_you" | "invite" | "digital_workflow") => {
    if (!user) return;
    try {
      const res = await fetch("/api/admin/blast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: user.email,
          target: "test",
          templateType,
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert(`Test ${templateType} email dispatched to ${user.email}! Check your inbox.`);
        fetchTelemetry(true);
      } else {
        alert(json.error || "Failed to send test email.");
      }
    } catch {
      alert("Failed to send test email.");
    }
  };

  // Filtered Subscribers
  const filteredSubscribers = useMemo(() => {
    if (!data?.subscribers) return [];
    return data.subscribers.filter((s) => {
      const q = subscriberSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        s.email.toLowerCase().includes(q) ||
        (s.fullName && s.fullName.toLowerCase().includes(q)) ||
        s.source.toLowerCase().includes(q)
      );
    });
  }, [data?.subscribers, subscriberSearch]);

  // Filtered Regular Users
  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];
    return data.users.filter((u) => {
      const matchesSearch =
        !userSearch.trim() ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.fullName.toLowerCase().includes(userSearch.toLowerCase());

      if (!matchesSearch) return false;

      if (userFilter === "NON_SUBSCRIBERS") return !u.isSubscribed;
      if (userFilter === "SUBSCRIBERS") return !!u.isSubscribed;
      return true;
    });
  }, [data?.users, userSearch, userFilter]);

  // Non-subscribers array for quick counts
  const nonSubscribersList = useMemo(() => {
    if (!data?.users) return [];
    return data.users.filter((u) => !u.isSubscribed);
  }, [data?.users]);

  // =========================================================================
  // 1. LOADING AUTHENTICATION
  // =========================================================================
  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-[#05060A] flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
        <span className="text-xs font-mono tracking-[3px] uppercase text-zinc-400 animate-pulse">
          Verifying Admin Credentials...
        </span>
      </div>
    );
  }

  // =========================================================================
  // 2. UNAUTHORIZED ACCESS GATE (Only mrdulow12@gmail.com & qse6209@gmail.com)
  // =========================================================================
  if (!isAuthenticated || !isAuthorizedAdmin) {
    return (
      <div className="min-h-screen bg-[#05060A] text-white flex flex-col items-center justify-center p-6 selection:bg-red-500 selection:text-black">
        <div className="max-w-md w-full bg-[#0A0E1A] border border-red-500/30 rounded-2xl p-8 shadow-[0_0_60px_rgba(239,68,68,0.2)] text-center space-y-6">
          <div className="w-18 h-18 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-[3px] uppercase text-red-400 block font-bold">
              CLASSIFIED // RESTRICTED ACCESS
            </span>
            <h1 className="text-2xl font-black uppercase tracking-wider text-white">
              Tha Hogg Command Only
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
              This console is restricted strictly to authorized network administrators:
            </p>
            <div className="bg-black/60 border border-white/10 rounded-xl p-3 font-mono text-xs text-amber-300 space-y-1">
              <div>&bull; mrdulow12@gmail.com</div>
              <div>&bull; qse6209@gmail.com</div>
            </div>
            {user && (
              <p className="text-[11px] text-zinc-500 font-mono pt-1">
                Current active session: <span className="text-zinc-300">{user.email}</span> (Unauthorized)
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/"
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors text-center"
            >
              Return to Studio
            </Link>
            <button
              onClick={logout}
              className="flex-1 py-3 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors text-center cursor-pointer"
            >
              Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. AUTHORIZED ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#05060A] text-white selection:bg-amber-400 selection:text-black">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[650px] h-[500px] bg-amber-500/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px]" />
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full px-6 py-4 md:px-12 backdrop-blur-2xl bg-[#05060A]/85 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-full cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Studio Deck</span>
          </Link>

          <div className="flex items-center space-x-3 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-black text-xs shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              TH
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-[0.2em] text-white text-xs uppercase block leading-none">
                  Quarter Spoon Network
                </span>
                <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full uppercase">
                  Admin Command
                </span>
              </div>
              <span className="text-[10px] tracking-[0.25em] text-zinc-400 uppercase font-mono">
                Administrator Dashboard // Tha Hogg
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry Status & Controls */}
        <div className="flex items-center space-x-3">
          {/* Live Auto-Refresh Indicator */}
          <div className="flex items-center space-x-2 bg-black/60 border border-white/10 px-3 py-1.5 rounded-full font-mono text-[11px]">
            <span className="relative flex h-2 w-2">
              {!isAutoRefreshPaused && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isAutoRefreshPaused ? "bg-amber-400" : "bg-emerald-400"
                }`}
              />
            </span>
            <span className="text-zinc-400 hidden sm:inline">
              {isAutoRefreshPaused ? "PAUSED" : "LIVE TELEMETRY"}
            </span>
            <span className="text-cyan-400 font-bold">
              {isAutoRefreshPaused ? "OFF" : `${secondsUntilRefresh}s`}
            </span>

            <button
              onClick={() => setIsAutoRefreshPaused(!isAutoRefreshPaused)}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 uppercase pl-1 cursor-pointer"
            >
              [{isAutoRefreshPaused ? "Resume" : "Pause"}]
            </button>
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={() => fetchTelemetry(false)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
            title="Refresh Telemetry Now"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
          </button>

          {/* Admin Identity Badge */}
          <div className="flex items-center space-x-2 bg-black/70 border border-amber-400/30 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-zinc-200 max-w-[130px] truncate">
              {user?.email}
            </span>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1 rounded-full text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="max-w-7xl mx-auto px-6 py-8 sm:py-10 md:px-12 space-y-10">
        {/* Executive Overview Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-400/30 px-3 py-1 rounded-full text-[10px] tracking-[2.5px] uppercase text-amber-300">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>OFFICIAL NETWORK CONTROL ROOM</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
              Tha Network{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-400">
                Command Deck
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-xl">
              Live automated subscriber auditing, member login tracking, and authentic broadcast dispatching
              signed directly by Tha Hogg.
            </p>
          </div>

          {/* Blast Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setSubscriberBlastModalOpen(true)}
              className="flex items-center space-x-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-[2px] px-5 py-3.5 rounded-xl shadow-[0_4px_30px_rgba(6,182,212,0.35)] transition-all cursor-pointer transform hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Announce Workflow to VIPs ({data?.metrics.totalSubscribers ?? 0})</span>
            </button>

            <button
              onClick={() => setBlastModalOpen(true)}
              className="flex items-center space-x-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-[2px] px-6 py-3.5 rounded-xl shadow-[0_4px_30px_rgba(245,158,11,0.35)] transition-all cursor-pointer transform hover:scale-[1.02] active:scale-95"
            >
              <Send className="w-4 h-4 text-black" />
              <span>Blast Non-Subscribers ({nonSubscribersList.length})</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5 CORE METRIC CARDS                                                       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Tha Network Subscribers */}
          <div className="relative rounded-2xl bg-[#090D17] border border-cyan-500/30 p-5 space-y-2.5 overflow-hidden shadow-2xl group hover:border-cyan-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[2px] uppercase text-cyan-400 font-bold">
                THA NETWORK
              </span>
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Radio className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">
              {data?.metrics.totalSubscribers ?? "..."}
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Active VIP Subscribers</span>
            </div>
          </div>

          {/* Card 2: Total Registered Members */}
          <div className="relative rounded-2xl bg-[#090D17] border border-white/10 p-5 space-y-2.5 overflow-hidden shadow-2xl group hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[2px] uppercase text-zinc-400 font-bold">
                REGISTERED
              </span>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">
              {data?.metrics.totalUsers ?? "..."}
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-zinc-400">
              <span>All portal accounts</span>
            </div>
          </div>

          {/* Card 3: Active Logged In Users */}
          <div className="relative rounded-2xl bg-[#090D17] border border-emerald-500/30 p-5 space-y-2.5 overflow-hidden shadow-2xl group hover:border-emerald-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[2px] uppercase text-emerald-400 font-bold">
                ACTIVE SESSIONS
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">
              {data?.metrics.activeRecently ?? "..."}
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Logged on recently</span>
            </div>
          </div>

          {/* Card 4: Non-Subscribed Users */}
          <div className="relative rounded-2xl bg-[#090D17] border border-amber-500/30 p-5 space-y-2.5 overflow-hidden shadow-2xl group hover:border-amber-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[2px] uppercase text-amber-400 font-bold">
                NON-SUBSCRIBERS
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Mail className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">
              {data?.metrics.nonSubscribersCount ?? "..."}
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-amber-300">
              <span>Target for invite blast</span>
            </div>
          </div>

          {/* Card 5: PDF Blueprint Downloads */}
          <div className="relative rounded-2xl bg-[#090D17] border border-cyan-400/30 p-5 space-y-2.5 overflow-hidden shadow-2xl group hover:border-cyan-400 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[2px] uppercase text-cyan-400 font-bold">
                PDF DOWNLOADS
              </span>
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <ArrowDownToLine className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">
              {data?.metrics.totalPdfDownloads ?? 0}
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Vault Blueprints Delivered</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* EMAIL TEMPLATES AUDIT & PREVIEW BAR                                      */}
        {/* ========================================================================= */}
        <div className="bg-[#090D17] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[2px] text-amber-400">
                AUTHENTIC COMMUNICATIONS
              </span>
              <h3 className="text-lg font-black uppercase text-white">
                Official Tha Hogg Email Templates
              </h3>
              <p className="text-xs text-zinc-400 font-light">
                Crafted for a balance of professional standard and authentic West Fresno culture. Signed &ldquo;Tha Hogg&rdquo;.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setPreviewTemplateModal("thankYou")}
                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl text-xs font-semibold text-zinc-200 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Inspect &ldquo;Thank You&rdquo; Email</span>
              </button>

              <button
                onClick={() => setPreviewTemplateModal("invite")}
                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl text-xs font-semibold text-zinc-200 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Inspect &ldquo;Invite&rdquo; Email</span>
              </button>

              <button
                onClick={() => setPreviewTemplateModal("digitalWorkflow")}
                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl text-xs font-semibold text-zinc-200 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                <span>Inspect &ldquo;Workflow&rdquo; Email</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            {/* Thank You Snippet */}
            <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-cyan-400">
                <span className="font-bold">1. AUTOMATIC THANK YOU EMAIL</span>
                <button
                  onClick={() => handleTestDispatch("thank_you")}
                  className="text-[10px] text-zinc-400 hover:text-white uppercase transition-colors cursor-pointer"
                >
                  [Send Test]
                </button>
              </div>
              <p className="text-zinc-300 text-[11px] line-clamp-2">
                &ldquo;Appreciate you locking in with Tha Network. When we built Quarter Spoon, it wasn&apos;t just to put up another website...&rdquo;
              </p>
              <div className="text-[10px] text-zinc-500 flex items-center space-x-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">Auto-dispatched immediately upon subscribing.</span>
              </div>
            </div>

            {/* Invite Snippet */}
            <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-amber-400">
                <span className="font-bold">2. NON-SUBSCRIBER INVITE EMAIL</span>
                <button
                  onClick={() => handleTestDispatch("invite")}
                  className="text-[10px] text-zinc-400 hover:text-white uppercase transition-colors cursor-pointer"
                >
                  [Send Test]
                </button>
              </div>
              <p className="text-zinc-300 text-[11px] line-clamp-2">
                &ldquo;Noticed you checked in to the Quarter Spoon Network portal recently... right now you have access to the studio floor, but you&apos;re missing out on what happens behind closed doors...&rdquo;
              </p>
              <div className="text-[10px] text-zinc-500 flex items-center space-x-2">
                <Flame className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">Ready for 1-click individual send or full non-subscriber blast.</span>
              </div>
            </div>

            {/* Digital Workflow VIP Announcement Snippet */}
            <div className="p-4 rounded-xl bg-black/50 border border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between text-purple-400">
                <span className="font-bold">3. DIGITAL WORKFLOW VIP BLAST</span>
                <button
                  onClick={() => handleTestDispatch("digital_workflow")}
                  className="text-[10px] text-zinc-400 hover:text-white uppercase transition-colors cursor-pointer"
                >
                  [Send Test]
                </button>
              </div>
              <p className="text-zinc-300 text-[11px] line-clamp-2">
                &ldquo;Salute to everybody locked in with Tha Network. As promised, when you rock with Quarter Spoon, we put game on the table...&rdquo;
              </p>
              <div className="text-[10px] text-zinc-500 flex items-center space-x-2">
                <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                <span className="truncate">Announces monthly prompt bundles & downloads to VIP subscribers.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TABLE 1: THA NETWORK SUBSCRIBERS                                          */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                  1. Tha Network Email Subscribers
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono text-xs font-bold">
                  {filteredSubscribers.length}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-light">
                All members currently locked into &ldquo;Tha Network&rdquo; official transmission dispatch list.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter subscribers..."
                  value={subscriberSearch}
                  onChange={(e) => setSubscriberSearch(e.target.value)}
                  className="bg-[#090D17] border border-white/15 focus:border-cyan-400 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors w-48 sm:w-60"
                />
              </div>

              {/* Export CSV */}
              <button
                onClick={handleExportCSV}
                className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 border border-white/15 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Download CSV"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#090D17] shadow-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Subscriber Name</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6">Acquisition Source</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 font-mono">
                      No subscribers found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-semibold text-white">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 text-black font-extrabold flex items-center justify-center text-[10px]">
                            {sub.fullName ? sub.fullName.charAt(0).toUpperCase() : "S"}
                          </div>
                          <span>{sub.fullName || "Tha Network VIP"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-cyan-300">
                        {sub.email}
                      </td>
                      <td className="py-4 px-6 text-zinc-400 font-mono">
                        <div>{formatTimeAgo(sub.subscribedAt)}</div>
                        <div className="text-[10px] text-zinc-600">
                          {formatDateExact(sub.subscribedAt)}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-zinc-400">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">
                          {sub.source}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>SUBSCRIBED</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => {
                            const foundUser = data?.users.find((u) => u.email.toLowerCase() === sub.email.toLowerCase()) || {
                              id: sub.id,
                              email: sub.email,
                              fullName: sub.fullName,
                              provider: "email",
                              createdAt: sub.subscribedAt,
                              lastLoginAt: sub.subscribedAt,
                            };
                            openSingleInvite(foundUser);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        >
                          Send Note
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TABLE 2: REGULAR USERS & RECENT LOGINS                                    */}
        {/* ========================================================================= */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                  2. Regular Users & Recent Logins
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-mono text-xs font-bold">
                  {filteredUsers.length}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-light">
                All registered users with live login activity. Send instant invites to users who have not joined &ldquo;Tha Network&rdquo;.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center space-x-1 bg-[#090D17] border border-white/15 p-1 rounded-xl font-mono text-[11px]">
                <button
                  onClick={() => setUserFilter("ALL")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    userFilter === "ALL" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  All ({data?.users.length || 0})
                </button>
                <button
                  onClick={() => setUserFilter("NON_SUBSCRIBERS")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    userFilter === "NON_SUBSCRIBERS"
                      ? "bg-amber-400 text-black font-bold"
                      : "text-amber-300 hover:text-amber-200"
                  }`}
                >
                  Non-Subscribers ({nonSubscribersList.length})
                </button>
                <button
                  onClick={() => setUserFilter("SUBSCRIBERS")}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    userFilter === "SUBSCRIBERS" ? "bg-cyan-500 text-black font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Subscribed
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="bg-[#090D17] border border-white/15 focus:border-amber-400 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors w-44 sm:w-56"
                />
              </div>
            </div>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#090D17] shadow-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">User Name</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Auth Provider</th>
                  <th className="py-3.5 px-6">Last Logged On</th>
                  <th className="py-3.5 px-6">Tha Network Status</th>
                  <th className="py-3.5 px-6 text-right">Invite Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 font-mono">
                      No users found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((regUser) => (
                    <tr key={regUser.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-semibold text-white">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 text-black font-extrabold flex items-center justify-center text-[10px]">
                            {regUser.fullName ? regUser.fullName.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <span className="block leading-tight">{regUser.fullName}</span>
                            {regUser.role === "admin" && (
                              <span className="text-[9px] font-mono text-amber-400 uppercase">
                                Administrator
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-zinc-300">
                        {regUser.email}
                      </td>
                      <td className="py-4 px-6 font-mono text-zinc-400">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] uppercase">
                          {regUser.provider === "google" ? "Google OAuth" : "Password"}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono">
                        <div className="text-white font-medium flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{formatTimeAgo(regUser.lastLoginAt)}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {formatDateExact(regUser.lastLoginAt)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {regUser.isSubscribed ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                            <span>SUBSCRIBED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>NOT SUBSCRIBED</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {regUser.isSubscribed ? (
                          <span className="text-[10px] font-mono text-zinc-500">
                            Already Locked In
                          </span>
                        ) : (
                          <button
                            onClick={() => openSingleInvite(regUser)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                          >
                            <Send className="w-3 h-3 text-amber-400" />
                            <span>Send Invite</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TABLE 3: LIVE VIDEO PLAY COUNTER (SUBSCRIBER VS NON-SUBSCRIBER)           */}
        {/* ========================================================================= */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <Film className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                  3. Live Video Play Counter
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40 font-mono text-xs font-bold">
                  {data?.videoStats?.length || 0} Visuals Monitored
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-light pt-1">
                Real-time video play telemetry differentiating plays by VIP &ldquo;Tha Network&rdquo; Subscribers versus Non-Subscribers.
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono">
              <div className="flex items-center space-x-1.5 bg-black/50 border border-white/10 px-3 py-1.5 rounded-xl">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block" />
                <span className="text-zinc-300">VIP Subscribers</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-black/50 border border-white/10 px-3 py-1.5 rounded-xl">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
                <span className="text-zinc-300">Non-Subscribers</span>
              </div>
            </div>
          </div>

          {/* Main Video Statistics Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#090D17] shadow-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Video Transmission</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Total Plays</th>
                  <th className="py-3.5 px-6">Subscriber Plays</th>
                  <th className="py-3.5 px-6">Non-Subscriber Plays</th>
                  <th className="py-3.5 px-6 text-right">Last Played</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {!data?.videoStats || data.videoStats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 font-mono">
                      No video play telemetry logged yet.
                    </td>
                  </tr>
                ) : (
                  data.videoStats.map((stat) => {
                    const subPct =
                      stat.totalPlays > 0
                        ? Math.round((stat.subscriberPlays / stat.totalPlays) * 100)
                        : 0;
                    const nonSubPct =
                      stat.totalPlays > 0
                        ? Math.round((stat.nonSubscriberPlays / stat.totalPlays) * 100)
                        : 0;

                    return (
                      <tr key={stat.videoId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </div>
                            <div>
                              <span className="font-bold text-white block text-sm tracking-wide">
                                {stat.videoTitle}
                              </span>
                              <span className="font-mono text-[10px] text-zinc-500 uppercase">
                                ID: {stat.videoId}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-mono text-zinc-400">
                          <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-zinc-300">
                            {stat.category}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-baseline space-x-1.5 font-mono">
                            <span className="text-xl font-black text-white">
                              {stat.totalPlays}
                            </span>
                            <span className="text-[10px] text-zinc-500 uppercase">plays</span>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between font-mono text-[11px]">
                              <span className="font-bold text-cyan-300">
                                {stat.subscriberPlays} plays
                              </span>
                              <span className="text-cyan-400/80">{subPct}%</span>
                            </div>
                            <div className="w-32 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                              <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${subPct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between font-mono text-[11px]">
                              <span className="font-bold text-amber-300">
                                {stat.nonSubscriberPlays} plays
                              </span>
                              <span className="text-amber-400/80">{nonSubPct}%</span>
                            </div>
                            <div className="w-32 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                                style={{ width: `${nonSubPct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right font-mono text-zinc-400">
                          {stat.lastPlayedAt ? (
                            <>
                              <div>{formatTimeAgo(stat.lastPlayedAt)}</div>
                              <div className="text-[10px] text-zinc-600">
                                {formatDateExact(stat.lastPlayedAt)}
                              </div>
                            </>
                          ) : (
                            <span className="text-zinc-500 text-[11px]">No plays yet</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Recent Video Plays Real-Time Feed */}
          {data?.recentVideoPlays && data.recentVideoPlays.length > 0 ? (
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-[2px] uppercase text-zinc-400 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  <span>Real-Time Playback Telemetry Stream</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  Last {data.recentVideoPlays.length} recorded events
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {data.recentVideoPlays.slice(0, 8).map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-lg bg-[#090D17] border border-white/5 text-[11px] font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold truncate max-w-[130px]">
                        {p.videoTitle}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          p.isSubscriber
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                        }`}
                      >
                        {p.isSubscriber ? "VIP SUB" : "GUEST"}
                      </span>
                    </div>
                    <div className="text-zinc-400 text-[10px] truncate">{p.userName || p.userEmail}</div>
                    <div className="text-zinc-600 text-[9px]">{formatTimeAgo(p.timestamp)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-black/30 border border-white/5 rounded-xl p-3.5 flex items-center justify-between text-xs font-mono text-zinc-500">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-purple-400/60" />
                <span>Real-Time Playback Stream &bull; Live Telemetry Listener Active</span>
              </div>
              <span className="text-[11px]">Strict 0 count (no mock plays)</span>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* TABLE 4: LIVE PDF DOWNLOAD COUNTER (SUBSCRIBER VS NON-SUBSCRIBER)         */}
        {/* ========================================================================= */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <ArrowDownToLine className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                  4. Live PDF Download Counter
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono text-xs font-bold">
                  {data?.pdfStats?.length || 0} Assets Monitored
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-light pt-1">
                Real-time PDF blueprint download telemetry differentiating downloads by VIP &ldquo;Tha Network&rdquo; Subscribers versus Non-Subscribers. Strictly authentic live numbers (no placeholders).
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono">
              <div className="flex items-center space-x-1.5 bg-black/50 border border-white/10 px-3 py-1.5 rounded-xl">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block" />
                <span className="text-zinc-300">VIP Subscribers</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-black/50 border border-white/10 px-3 py-1.5 rounded-xl">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
                <span className="text-zinc-300">Non-Subscribers</span>
              </div>
            </div>
          </div>

          {/* Main PDF Statistics Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#090D17] shadow-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">PDF Asset / Blueprint</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">File Size</th>
                  <th className="py-3.5 px-6">Total Downloads</th>
                  <th className="py-3.5 px-6">Subscriber Downloads</th>
                  <th className="py-3.5 px-6">Non-Subscriber Downloads</th>
                  <th className="py-3.5 px-6 text-right">Last Downloaded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {!data?.pdfStats || data.pdfStats.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500 font-mono">
                      No PDF download telemetry logged yet.
                    </td>
                  </tr>
                ) : (
                  data.pdfStats.map((stat) => {
                    const subPct =
                      stat.totalDownloads > 0
                        ? Math.round((stat.subscriberDownloads / stat.totalDownloads) * 100)
                        : 0;
                    const nonSubPct =
                      stat.totalDownloads > 0
                        ? Math.round((stat.nonSubscriberDownloads / stat.totalDownloads) * 100)
                        : 0;

                    return (
                      <tr key={stat.pdfId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <span className="font-bold text-white block text-sm tracking-wide">
                                {stat.pdfTitle}
                              </span>
                              <span className="font-mono text-[10px] text-zinc-500">
                                {stat.fileName}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-mono text-zinc-400">
                          <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-zinc-300">
                            {stat.category}
                          </span>
                        </td>

                        <td className="py-4 px-6 font-mono text-zinc-400">
                          <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] text-zinc-300">
                            {stat.fileSize}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-baseline space-x-1.5 font-mono">
                            <span className="text-xl font-black text-white">
                              {stat.totalDownloads}
                            </span>
                            <span className="text-[10px] text-zinc-500 uppercase">downloads</span>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between font-mono text-[11px]">
                              <span className="font-bold text-cyan-300">
                                {stat.subscriberDownloads} downloads
                              </span>
                              <span className="text-cyan-400/80">{subPct}%</span>
                            </div>
                            <div className="w-32 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                              <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${subPct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between font-mono text-[11px]">
                              <span className="font-bold text-amber-300">
                                {stat.nonSubscriberDownloads} downloads
                              </span>
                              <span className="text-amber-400/80">{nonSubPct}%</span>
                            </div>
                            <div className="w-32 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                                style={{ width: `${nonSubPct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right font-mono text-zinc-400">
                          {stat.lastDownloadedAt ? (
                            <>
                              <div>{formatTimeAgo(stat.lastDownloadedAt)}</div>
                              <div className="text-[10px] text-zinc-600">
                                {formatDateExact(stat.lastDownloadedAt)}
                              </div>
                            </>
                          ) : (
                            <span className="text-zinc-500 text-[11px]">No downloads yet</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Recent PDF Downloads Real-Time Feed */}
          {data?.recentPdfDownloads && data.recentPdfDownloads.length > 0 ? (
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-[2px] uppercase text-zinc-400 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Real-Time PDF Download Telemetry Stream</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  Last {data.recentPdfDownloads.length} recorded events
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {data.recentPdfDownloads.slice(0, 8).map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-lg bg-[#090D17] border border-white/5 text-[11px] font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold truncate max-w-[130px]">
                        {p.pdfTitle}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          p.isSubscriber
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                        }`}
                      >
                        {p.isSubscriber ? "VIP SUB" : "GUEST"}
                      </span>
                    </div>
                    <div className="text-zinc-400 text-[10px] truncate">{p.userName || p.userEmail}</div>
                    <div className="text-zinc-600 text-[9px]">{formatTimeAgo(p.timestamp)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-black/30 border border-white/5 rounded-xl p-3.5 flex items-center justify-between text-xs font-mono text-zinc-500">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400/60" />
                <span>Real-Time Download Stream &bull; Live Telemetry Listener Active</span>
              </div>
              <span className="text-[11px]">Strict 0 count (no mock downloads)</span>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* TABLE 5: "GET U SOME GAME" & SUGGESTION BOX INQUIRIES                      */}
        {/* ========================================================================= */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                  5. &ldquo;Get U Some Game&rdquo; &amp; Suggestion Inquiries
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-mono text-xs font-bold">
                  {data?.gameInquiries?.length || 0} Inquiries
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-light pt-1">
                Direct questions and prompt bundle suggestions sent to Tha Hogg. Click &ldquo;Reply via Email&rdquo; to answer directly.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#090D17] shadow-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Member</th>
                  <th className="py-3.5 px-6">Inquiry Category</th>
                  <th className="py-3.5 px-6">Question / Suggestion</th>
                  <th className="py-3.5 px-6">Received</th>
                  <th className="py-3.5 px-6 text-right">Direct Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {!data?.gameInquiries || data.gameInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500 font-mono">
                      No questions or suggestions received yet.
                    </td>
                  </tr>
                ) : (
                  data.gameInquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-semibold text-white">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-red-600 text-black font-extrabold flex items-center justify-center text-[10px]">
                            {inq.fullName ? inq.fullName.charAt(0).toUpperCase() : "M"}
                          </div>
                          <div>
                            <div className="text-white font-bold">{inq.fullName}</div>
                            <div className="text-[10px] font-mono text-zinc-400">{inq.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-mono">
                        <span className="px-2.5 py-1 rounded bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[10px] font-bold uppercase">
                          {inq.category || "Game Question"}
                        </span>
                      </td>

                      <td className="py-4 px-6 max-w-md">
                        <p className="text-zinc-200 text-xs font-normal leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                          &ldquo;{inq.question}&rdquo;
                        </p>
                      </td>

                      <td className="py-4 px-6 font-mono text-zinc-400">
                        <div>{formatTimeAgo(inq.timestamp)}</div>
                        <div className="text-[10px] text-zinc-600">
                          {formatDateExact(inq.timestamp)}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        {inq.status === "replied" || inq.reply ? (
                          <div className="flex flex-col items-end space-y-1">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Replied</span>
                            </span>
                            <button
                              onClick={() => setReplyModalInquiry(inq)}
                              className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                            >
                              Reply Again
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReplyModalInquiry(inq)}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono text-xs font-black uppercase transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer transform hover:scale-105 active:scale-95"
                          >
                            <Send className="w-3 h-3 text-black" />
                            <span>Reply</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DISPATCH HISTORY AUDIT TRAIL                                              */}
        {/* ========================================================================= */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                6. Recent Email Dispatches
              </h2>
              <p className="text-xs text-zinc-400 font-light">
                Real-time audit log of all manual invites, automated thank-yous, and network blasts.
              </p>
            </div>
            <span className="font-mono text-xs text-zinc-500">
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#090D17] shadow-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Recipient</th>
                  <th className="py-3.5 px-6">Dispatch Type</th>
                  <th className="py-3.5 px-6">Subject Line</th>
                  <th className="py-3.5 px-6">Transmitted At</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {!data?.dispatches || data.dispatches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500 font-mono">
                      No emails dispatched yet.
                    </td>
                  </tr>
                ) : (
                  data.dispatches.map((disp) => (
                    <tr key={disp.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-mono text-white">
                        <div>{disp.recipientName || disp.recipientEmail}</div>
                        <div className="text-[10px] text-zinc-500">{disp.recipientEmail}</div>
                      </td>
                      <td className="py-4 px-6 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            disp.type === "thank_you"
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                              : disp.type === "blast"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                              : "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30"
                          }`}
                        >
                          {disp.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-zinc-300 font-sans max-w-xs truncate">
                        {disp.subject}
                      </td>
                      <td className="py-4 px-6 font-mono text-zinc-400">
                        {formatTimeAgo(disp.sentAt)}
                      </td>
                      <td className="py-4 px-6 font-mono">
                        <span className="text-emerald-400 uppercase text-[10px] font-bold">
                          &bull; SENT
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: BLAST ALL NON-SUBSCRIBERS                                       */}
      {/* ========================================================================= */}
      {blastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#0A0E1A] border border-amber-500/40 rounded-2xl shadow-[0_25px_80px_rgba(245,158,11,0.25)] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-[#070A12] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-[2.5px] uppercase text-amber-400 block">
                    MASS TRANSMISSION LAUNCHER
                  </span>
                  <h3 className="text-lg font-black uppercase text-white">
                    Blast Invite to Non-Subscribers
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setBlastModalOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-5">
              {/* Recipient summary banner */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs">
                <div>
                  <span className="font-mono text-[10px] uppercase text-amber-400 block">
                    TOTAL TARGET RECIPIENTS
                  </span>
                  <span className="text-lg font-black text-white">
                    {nonSubscribersList.length} Non-Subscribers Selected
                  </span>
                </div>
                <div className="text-right text-[11px] text-zinc-400 font-mono">
                  All registered members without Tha Network subscription
                </div>
              </div>

              {blastStatusMessage && (
                <div className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 text-xs font-mono">
                  {blastStatusMessage}
                </div>
              )}

              {/* Subject line input */}
              <div>
                <label className="block text-[11px] font-mono tracking-wider uppercase text-zinc-400 mb-1.5">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={blastSubject}
                  onChange={(e) => setBlastSubject(e.target.value)}
                  className="w-full bg-[#05060A] border border-white/15 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Body editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono tracking-wider uppercase text-zinc-400">
                    Email Copy (Authentic Tha Hogg Tone)
                  </label>
                  <span className="text-[10px] font-mono text-amber-400">
                    Always signed: Tha Hogg
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={blastBody}
                  onChange={(e) => setBlastBody(e.target.value)}
                  className="w-full bg-[#05060A] border border-white/15 focus:border-amber-400 rounded-xl p-4 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors leading-relaxed"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBlastModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isBlasting || nonSubscribersList.length === 0}
                  onClick={handleLaunchBlast}
                  className="px-7 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-black font-black text-xs uppercase tracking-[2px] rounded-xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-black" />
                  <span>
                    {isBlasting
                      ? "Transmitting Blast..."
                      : `Launch Blast to ${nonSubscribersList.length} User(s)`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1B: ANNOUNCE DIGITAL WORKFLOW TO ALL SUBSCRIBERS                    */}
      {/* ========================================================================= */}
      {subscriberBlastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#0A0E1A] border border-cyan-500/40 rounded-2xl shadow-[0_25px_80px_rgba(6,182,212,0.25)] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-[#070A12] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-[2.5px] uppercase text-cyan-400 block">
                    VIP SUBSCRIBER TRANSMISSION
                  </span>
                  <h3 className="text-lg font-black uppercase text-white">
                    Announce Digital Workflow to Subscribers
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSubscriberBlastModalOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-5">
              {/* Recipient summary banner */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs">
                <div>
                  <span className="font-mono text-[10px] uppercase text-cyan-400 block">
                    TARGET VIP AUDIENCE
                  </span>
                  <span className="text-lg font-black text-white">
                    {data?.metrics.totalSubscribers ?? 0} VIP Subscribers Selected
                  </span>
                </div>
                <div className="text-right text-[11px] text-zinc-400 font-mono">
                  All active members locked into Tha Network
                </div>
              </div>

              {subBlastStatusMessage && (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-400/40 text-emerald-300 text-xs font-mono">
                  {subBlastStatusMessage}
                </div>
              )}

              {/* Subject line input */}
              <div>
                <label className="block text-[11px] font-mono tracking-wider uppercase text-zinc-400 mb-1.5">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={subBlastSubject}
                  onChange={(e) => setSubBlastSubject(e.target.value)}
                  className="w-full bg-[#05060A] border border-white/15 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Body editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono tracking-wider uppercase text-zinc-400">
                    VIP Announcement Copy (Commitment to Monthly Prompt Bundles)
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Always signed: Tha Hogg
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={subBlastBody}
                  onChange={(e) => setSubBlastBody(e.target.value)}
                  className="w-full bg-[#05060A] border border-white/15 focus:border-cyan-400 rounded-xl p-4 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors leading-relaxed"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubscriberBlastModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isSubBlasting || (data?.metrics.totalSubscribers ?? 0) === 0}
                  onClick={handleLaunchSubscriberBlast}
                  className="px-7 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-black font-black text-xs uppercase tracking-[2px] rounded-xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-black" />
                  <span>
                    {isSubBlasting
                      ? "Transmitting VIP Announcement..."
                      : `Launch Announcement to ${data?.metrics.totalSubscribers ?? 0} VIPs`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SINGLE INVITE DISPATCH                                          */}
      {/* ========================================================================= */}
      {singleInviteModal.open && singleInviteModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl bg-[#0A0E1A] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-[#070A12] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-[2.5px] uppercase text-cyan-400 block">
                  DIRECT TRANSMISSION
                </span>
                <h3 className="text-lg font-black uppercase text-white">
                  Send Tha Network Invite to {singleInviteModal.user.fullName}
                </h3>
              </div>
              <button
                onClick={() => setSingleInviteModal({ open: false })}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                  Target Recipient Email
                </span>
                <span className="text-sm font-mono text-cyan-300 font-bold">
                  {singleInviteModal.user.email}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-mono tracking-wider uppercase text-zinc-400 mb-1.5">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={singleSubject}
                  onChange={(e) => setSingleSubject(e.target.value)}
                  className="w-full bg-[#05060A] border border-white/15 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono tracking-wider uppercase text-zinc-400 mb-1.5">
                  Message Content (Signed Tha Hogg)
                </label>
                <textarea
                  rows={8}
                  value={singleBody}
                  onChange={(e) => setSingleBody(e.target.value)}
                  className="w-full bg-[#05060A] border border-white/15 focus:border-cyan-400 rounded-xl p-4 text-xs font-mono text-zinc-200 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSingleInviteModal({ open: false })}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSendingSingle}
                  onClick={handleSendSingleInvite}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-black font-black text-xs uppercase tracking-[2px] rounded-xl shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-black" />
                  <span>{isSendingSingle ? "Sending..." : "Dispatch Invite"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: FULL EMAIL TEMPLATE INSPECTOR                                    */}
      {/* ========================================================================= */}
      {previewTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#0A0E1A] border border-white/20 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-white/10 bg-[#070A12] flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-mono tracking-[2.5px] uppercase text-amber-400 block">
                  TEMPLATE AUDIT // AUTHENTIC VOICE
                </span>
                <h3 className="text-lg font-black uppercase text-white">
                  {previewTemplateModal === "thankYou"
                    ? "Welcome to Tha Network (Thank You Email)"
                    : previewTemplateModal === "invite"
                    ? "Non-Subscriber Invitation Email"
                    : "Digital Workflow Announcement (Exclusive VIP Creator Assets)"}
                </h3>
              </div>
              <button
                onClick={() => setPreviewTemplateModal(null)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                  Subject Line:
                </span>
                <div className="p-3 bg-[#05060A] border border-white/10 rounded-xl font-mono text-sm text-white">
                  {previewTemplateModal === "thankYou"
                    ? data?.templates.thankYou.subject
                    : previewTemplateModal === "invite"
                    ? data?.templates.invite.subject
                    : data?.templates.digitalWorkflow?.subject}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                  Plaintext Copy:
                </span>
                <pre className="p-4 bg-[#05060A] border border-white/10 rounded-xl font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {previewTemplateModal === "thankYou"
                    ? data?.templates.thankYou.text
                    : previewTemplateModal === "invite"
                    ? data?.templates.invite.text
                    : data?.templates.digitalWorkflow?.text}
                </pre>
              </div>

              <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl flex items-center justify-between">
                <span className="text-xs font-mono text-amber-300">
                  Send a live test of this template directly to {user?.email}:
                </span>
                <button
                  onClick={() =>
                    handleTestDispatch(
                      previewTemplateModal === "thankYou"
                        ? "thank_you"
                        : previewTemplateModal === "invite"
                        ? "invite"
                        : "digital_workflow"
                    )
                  }
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Send Test To Me
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instant Direct Reply Email Modal */}
      <DirectReplyModal
        isOpen={!!replyModalInquiry}
        onClose={() => setReplyModalInquiry(null)}
        inquiry={replyModalInquiry}
        adminEmail={user?.email || "mrdulow12@gmail.com"}
        onSuccess={() => {
          fetchTelemetry();
        }}
      />
    </div>
  );
}

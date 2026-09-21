import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Activity } from "lucide-react";
import { LeadAnalyticsDashboard } from "@/components/admin/LeadAnalyticsDashboard";

export const metadata = {
  title: "Multi-App Lead Analytics | Quarter Spoon Network",
  description: "Universal multi-app lead conversion tracking & failover monitoring.",
};

export const dynamic = "force-dynamic";

export default function AdminLeadAnalyticsPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#0044FF] selection:text-white">
      {/* Background ambient lighting in metallic navy */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[650px] h-[500px] bg-[#0044FF]/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[#0033CC]/10 rounded-full blur-[140px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 w-full px-6 py-4 md:px-12 backdrop-blur-2xl bg-black/85 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin"
            className="flex items-center space-x-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-full cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </Link>
          <div className="flex items-center space-x-3 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-lg bg-[#0044FF] flex items-center justify-center text-white font-black text-xs shadow-[0_0_20px_rgba(0,68,255,0.6)]">
              LA
            </div>
            <div>
              <span className="font-extrabold tracking-[0.2em] text-white text-xs uppercase block leading-none">
                Universal Lead Analytics
              </span>
              <span className="text-[10px] tracking-[0.25em] text-[#94A3B8] uppercase font-mono">
                Multi-App Failover & Conversion Telemetry
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-[#0A0F1D] border border-[#0044FF]/30 px-3.5 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4 text-[#0044FF]" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Hard-Locked Admin Access
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 sm:py-10 md:px-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#0044FF]/10 border border-[#0044FF]/30 px-3 py-1 rounded-full text-[10px] tracking-[2px] uppercase text-white font-mono mb-2">
              <Activity className="w-3 h-3 text-[#0044FF]" />
              <span>V12/V13 MULTI-APP CONVERSION ENGINE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Lead Conversion & Failover Monitor
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] font-light max-w-2xl mt-1">
              Live tracking across Quarter Spoon Network, Unda Tha Radar, and affiliated portals.
              Zero dropped leads with automated secondary endpoint failover.
            </p>
          </div>
        </div>

        {/* Dashboard Component */}
        <LeadAnalyticsDashboard />
      </main>
    </div>
  );
}

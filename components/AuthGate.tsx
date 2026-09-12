"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User as UserIcon, Shield, ShieldCheck, Sparkles } from "lucide-react";
import ThaNetworkModal from "@/components/ThaNetworkModal";

const PUBLIC_PATHS = ["/auth/login", "/auth/register"];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth();

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicPath) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, isPublicPath, pathname, router]);

  // If loading session state, show cinematic loader
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#05060A] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center font-black text-xs text-cyan-400">
            QSN
          </div>
        </div>
        <span className="text-[11px] font-mono tracking-[3px] uppercase text-zinc-400 animate-pulse">
          Verifying Broadcast Authorization...
        </span>
      </div>
    );
  }

  // If on a public path (like /auth/login or /auth/register), just render children
  if (isPublicPath) {
    return <>{children}</>;
  }

  // If not authenticated, prevent rendering protected contents while redirecting
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#05060A] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <span className="text-xs font-mono tracking-widest text-zinc-400">
          Redirecting to Portal Login...
        </span>
      </div>
    );
  }

  // User is authenticated! Render the site with an unobtrusive account badge
  return (
    <>
      {/* Floating authenticated user HUD bar on home page */}
      {pathname === "/" && (
        <div className="fixed top-4 right-4 z-45 pointer-events-auto">
          <div className="flex items-center space-x-2.5 bg-black/75 backdrop-blur-xl border border-white/15 px-3 py-1.5 rounded-full shadow-2xl">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-extrabold text-[10px]">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[11px] font-bold text-white leading-tight truncate max-w-[130px]">
                {user?.fullName || user?.email}
              </span>
              <span className="text-[9px] font-mono text-cyan-400 leading-none">
                {user?.provider === "google" ? "GOOGLE AUTH" : "VERIFIED MEMBER"}
              </span>
            </div>

            {/* Digital Workflow Quick Link */}
            <Link
              href="/digital-workflow"
              className="flex items-center space-x-1 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider transition-all shadow-md cursor-pointer"
              title="Digital Workflow Creator Vault"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span className="font-bold uppercase tracking-wider">Workflow</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center space-x-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-300 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider transition-all shadow-lg cursor-pointer"
                title="Tha Hogg Command Center"
              >
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span className="font-bold uppercase tracking-wider">Admin</span>
              </Link>
            )}

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-full text-zinc-400 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {children}



      {/* Tha Network Email List Subscription Trigger & Modal */}
      {pathname !== "/admin" && (
        <Suspense fallback={null}>
          <ThaNetworkModal />
        </Suspense>
      )}
    </>
  );
}

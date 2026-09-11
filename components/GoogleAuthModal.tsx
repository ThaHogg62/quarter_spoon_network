"use client";

import React, { useState, useEffect } from "react";
import { X, User, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import { validateOfficialEmail } from "@/lib/emailValidator";

interface GoogleAccount {
  name: string;
  email: string;
  avatarColor: string;
}

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: { name: string; email: string }) => void;
}

const SAVED_ACCOUNTS_KEY = "qsn_saved_google_accounts";

export default function GoogleAuthModal({ isOpen, onClose, onSuccess }: GoogleAuthModalProps) {
  const [view, setView] = useState<"choose" | "add_account">("choose");
  const [accounts, setAccounts] = useState<GoogleAccount[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const [inputEmail, setInputEmail] = useState("");
  const [inputName, setInputName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Load remembered Google accounts
  useEffect(() => {
    if (!isOpen) return;
    try {
      const stored = localStorage.getItem(SAVED_ACCOUNTS_KEY);
      if (stored) {
        setAccounts(JSON.parse(stored));
      } else {
        // Initial clean state: if no saved accounts yet, start with default chooser or direct prompt
        setAccounts([]);
      }
    } catch {
      setAccounts([]);
    }
    setView("choose");
    setError(null);
    setIsVerifying(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectAccount = (account: GoogleAccount) => {
    setSelectedEmail(account.email);
    setIsVerifying(true);
    setError(null);

    setTimeout(() => {
      onSuccess({
        name: account.name,
        email: account.email,
      });
      onClose();
    }, 500);
  };

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrimmed = inputEmail.trim().toLowerCase();
    const nameTrimmed = inputName.trim() || emailTrimmed.split("@")[0].replace(/[._]/g, " ");

    const validation = validateOfficialEmail(emailTrimmed);
    if (!validation.isValid) {
      setError(validation.error || "Please enter a valid official email address.");
      return;
    }

    if (!emailTrimmed.endsWith("@gmail.com") && !emailTrimmed.includes("@")) {
      setError("Please select or enter a valid Google Account address (e.g. yourname@gmail.com).");
      return;
    }

    setIsVerifying(true);

    // Save account to remembered accounts list
    const colors = [
      "from-blue-500 to-indigo-600",
      "from-red-500 to-amber-600",
      "from-emerald-500 to-teal-600",
      "from-purple-500 to-pink-600",
    ];
    const newAccount: GoogleAccount = {
      name: nameTrimmed,
      email: emailTrimmed,
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
    };

    try {
      const updated = [newAccount, ...accounts.filter((a) => a.email !== emailTrimmed)].slice(0, 4);
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
      setAccounts(updated);
    } catch {}

    setTimeout(() => {
      onSuccess({
        name: nameTrimmed,
        email: emailTrimmed,
      });
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Authentic Google Account Chooser Card */}
      <div className="relative w-full max-w-sm bg-white text-zinc-900 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-6 sm:p-7 space-y-5 overflow-hidden">
        {/* Top Progress bar when verifying */}
        {isVerifying && (
          <div className="absolute top-0 inset-x-0 h-1 bg-zinc-200 overflow-hidden">
            <div className="w-1/2 h-full bg-blue-600 animate-[indeterminate_1.2s_infinite_linear]" />
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isVerifying}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Header */}
        <div className="space-y-3">
          {/* Google Logo SVG */}
          <div className="flex justify-start">
            <svg className="w-7 h-7" viewBox="0 0 24 24">
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
          </div>

          <div>
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 font-sans">
              {view === "choose" ? "Choose an account" : "Sign in with Google"}
            </h2>
            <p className="text-xs text-zinc-600 font-sans mt-0.5">
              to continue to{" "}
              <span className="font-semibold text-zinc-900">Quarter Spoon Network</span>
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start space-x-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* VIEW 1: ACCOUNT CHOOSER LIST */}
        {view === "choose" && (
          <div className="space-y-1 divide-y divide-zinc-100 -mx-6 px-6">
            {/* List of remembered accounts */}
            {accounts.map((acc) => {
              const isCurrent = selectedEmail === acc.email && isVerifying;
              return (
                <button
                  key={acc.email}
                  onClick={() => handleSelectAccount(acc)}
                  disabled={isVerifying}
                  className="w-full py-3 flex items-center space-x-3 text-left hover:bg-zinc-50 rounded-xl px-2 transition-colors cursor-pointer group disabled:opacity-60"
                >
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-tr ${acc.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0`}
                  >
                    {acc.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-zinc-900 truncate">
                      {acc.name}
                    </span>
                    <span className="block text-xs text-zinc-500 truncate">{acc.email}</span>
                  </div>
                  {isCurrent && (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  )}
                </button>
              );
            })}

            {/* If no remembered accounts yet, present direct entry button or quick option */}
            {accounts.length === 0 && (
              <div className="py-2">
                <button
                  onClick={() => setView("add_account")}
                  className="w-full py-3 flex items-center space-x-3 text-left hover:bg-zinc-50 rounded-xl px-2 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="block text-sm font-medium text-zinc-900">
                      Sign in with your Gmail
                    </span>
                    <span className="block text-xs text-zinc-500">
                      Select or enter your Google account
                    </span>
                  </div>
                </button>
              </div>
            )}

            {/* Option: Use another account */}
            {accounts.length > 0 && (
              <button
                onClick={() => {
                  setView("add_account");
                  setError(null);
                }}
                disabled={isVerifying}
                className="w-full py-3 flex items-center space-x-3 text-left hover:bg-zinc-50 rounded-xl px-2 transition-colors cursor-pointer group disabled:opacity-50"
              >
                <div className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0 group-hover:bg-zinc-200 transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-zinc-800">Use another account</span>
              </button>
            )}
          </div>
        )}

        {/* VIEW 2: SELECT / ENTER GMAIL ACCOUNT */}
        {view === "add_account" && (
          <form onSubmit={handleAddAccountSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-700">Full Name</label>
              <input
                type="text"
                required
                autoFocus
                placeholder="First and Last Name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                disabled={isVerifying}
                className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors disabled:bg-zinc-50"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-700">Google Account Email</label>
              <input
                type="email"
                required
                placeholder="yourname@gmail.com"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                disabled={isVerifying}
                className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors disabled:bg-zinc-50"
              />
              <span className="block text-[11px] text-zinc-500">
                Official Google Account or Gmail address required.
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              {accounts.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setView("choose")}
                  disabled={isVerifying}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                >
                  Back to accounts
                </button>
              ) : <div />}

              <button
                type="submit"
                disabled={isVerifying}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center space-x-2"
              >
                {isVerifying ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Next & Sign In</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer Disclaimer */}
        <div className="text-[11px] text-zinc-500 pt-3 border-t border-zinc-100 leading-normal">
          To continue, Google will share your name, email address, and language preference with{" "}
          <span className="font-semibold text-zinc-700">Quarter Spoon Network</span>.
        </div>
      </div>
    </div>
  );
}

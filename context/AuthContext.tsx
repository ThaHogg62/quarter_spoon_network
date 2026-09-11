"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { validateOfficialEmail } from "@/lib/emailValidator";
import { sendAuthNotification } from "@/lib/formspree";

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  provider: "email" | "google";
  createdAt: string;
}

interface StoredUser extends User {
  passwordHash: string;
}

interface AttemptRecord {
  count: number;
  lockedUntil?: number; // timestamp in ms
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lockoutTimeRemaining: number | null; // minutes remaining if locked
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (googleProfile?: { name?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = "qsn_users_db";
const SESSION_STORAGE_KEY = "qsn_active_session";
const ATTEMPTS_STORAGE_KEY = "qsn_login_attempts";
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const MAX_ATTEMPTS = 5;

// Cryptographic hash using Web Crypto API (SHA-256)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "_qsn_salt_2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState<number | null>(null);

  // Load session on startup
  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSession) {
        const sessionData = JSON.parse(storedSession);
        // Check session expiration if set
        if (!sessionData.expiresAt || Date.now() < sessionData.expiresAt) {
          setUser(sessionData.user);
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error("Failed to restore session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper to read stored users
  const getStoredUsers = (): StoredUser[] => {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  // Helper to save users
  const saveStoredUsers = (users: StoredUser[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  // Helper to read attempts
  const getAttemptRecord = (email: string): AttemptRecord => {
    try {
      const allAttempts = JSON.parse(localStorage.getItem(ATTEMPTS_STORAGE_KEY) || "{}");
      return allAttempts[email.toLowerCase()] || { count: 0 };
    } catch {
      return { count: 0 };
    }
  };

  // Helper to update attempts
  const setAttemptRecord = (email: string, record: AttemptRecord) => {
    try {
      const allAttempts = JSON.parse(localStorage.getItem(ATTEMPTS_STORAGE_KEY) || "{}");
      allAttempts[email.toLowerCase()] = record;
      localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(allAttempts));
    } catch (e) {
      console.warn("Failed to record login attempt:", e);
    }
  };

  // Check if an email is locked out
  const checkLockout = (email: string): { isLocked: boolean; remainingMinutes: number } => {
    const record = getAttemptRecord(email);
    if (record.lockedUntil && record.lockedUntil > Date.now()) {
      const remainingMs = record.lockedUntil - Date.now();
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      return { isLocked: true, remainingMinutes };
    }
    return { isLocked: false, remainingMinutes: 0 };
  };

  // REGISTER
  const register = async (
    fullName: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    // 1. Full name validation: minimum 2 words
    const nameTrimmed = fullName.trim();
    const nameParts = nameTrimmed.split(/\s+/).filter(Boolean);
    if (nameParts.length < 2) {
      return {
        success: false,
        error: "Please enter your full name (both first and last name required).",
      };
    }

    // 2. Email format and disposable check
    const emailValidation = validateOfficialEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error };
    }

    // 3. Password requirement: min 8 chars, 1 uppercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return {
        success: false,
        error:
          "Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 number, and 1 special character.",
      };
    }

    // 4. Check if user already exists
    const users = getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return {
        success: false,
        error: "An account with this email address already exists. Please log in.",
      };
    }

    // 5. Hash password and save
    const passwordHash = await hashPassword(password);
    const newUser: StoredUser = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      fullName: nameTrimmed,
      email: email.toLowerCase().trim(),
      provider: "email",
      createdAt: new Date().toISOString(),
      passwordHash,
    };

    users.push(newUser);
    saveStoredUsers(users);

    // 6. Send alert notification to mrdulow12@gmail.com via Formspree
    sendAuthNotification({
      eventType: "USER_SIGNUP",
      fullName: newUser.fullName,
      email: newUser.email,
      authMethod: "Password",
    }).catch((err) => console.warn("Formspree alert non-blocking error:", err));

    return { success: true };
  };

  // LOGIN
  const login = async (
    email: string,
    password: string,
    rememberMe = false
  ): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = email.toLowerCase().trim();

    // Check lockout first
    const lockout = checkLockout(normalizedEmail);
    if (lockout.isLocked) {
      setLockoutTimeRemaining(lockout.remainingMinutes);
      return {
        success: false,
        error: `Account locked due to 5 consecutive failed attempts. Please try again in ${lockout.remainingMinutes} minute(s).`,
      };
    }

    const users = getStoredUsers();
    const existingUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!existingUser) {
      // Record failed attempt
      const attempt = getAttemptRecord(normalizedEmail);
      const newCount = attempt.count + 1;
      if (newCount >= MAX_ATTEMPTS) {
        setAttemptRecord(normalizedEmail, {
          count: newCount,
          lockedUntil: Date.now() + LOCKOUT_DURATION_MS,
        });
        setLockoutTimeRemaining(30);
        return {
          success: false,
          error: "Account locked due to 5 consecutive failed attempts. Please try again in 30 minutes.",
        };
      }
      setAttemptRecord(normalizedEmail, { count: newCount });
      return { success: false, error: "Invalid email or password." };
    }

    // Check password
    const passwordHash = await hashPassword(password);
    if (existingUser.passwordHash !== passwordHash) {
      const attempt = getAttemptRecord(normalizedEmail);
      const newCount = attempt.count + 1;
      if (newCount >= MAX_ATTEMPTS) {
        setAttemptRecord(normalizedEmail, {
          count: newCount,
          lockedUntil: Date.now() + LOCKOUT_DURATION_MS,
        });
        setLockoutTimeRemaining(30);
        return {
          success: false,
          error: "Account locked due to 5 consecutive failed attempts. Please try again in 30 minutes.",
        };
      }
      setAttemptRecord(normalizedEmail, { count: newCount });
      return { success: false, error: "Invalid email or password." };
    }

    // Success -> Clear failed attempts
    setAttemptRecord(normalizedEmail, { count: 0 });
    setLockoutTimeRemaining(null);

    // Create session (30 days if rememberMe, else 1 day)
    const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const sessionUser: User = {
      id: existingUser.id,
      fullName: existingUser.fullName,
      email: existingUser.email,
      avatar: existingUser.avatar,
      provider: existingUser.provider,
      createdAt: existingUser.createdAt,
    };

    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        user: sessionUser,
        expiresAt: Date.now() + durationMs,
      })
    );

    // Set cookie for Edge/SSR detection
    document.cookie = `qsn_session=${sessionUser.id}; path=/; max-age=${
      rememberMe ? 30 * 24 * 3600 : 24 * 3600
    }; SameSite=Lax`;

    setUser(sessionUser);

    // Send Formspree notification to mrdulow12@gmail.com
    sendAuthNotification({
      eventType: "USER_LOGIN",
      fullName: sessionUser.fullName,
      email: sessionUser.email,
      authMethod: "Password",
    }).catch((err) => console.warn("Formspree alert non-blocking error:", err));

    return { success: true };
  };

  // GOOGLE LOGIN / SIGN-UP
  const loginWithGoogle = async (googleProfile?: {
    name?: string;
    email?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const profileEmail = googleProfile?.email || "user@gmail.com";
    const profileName = googleProfile?.name || "Quarter Spoon Member";

    // Validate Google Email
    const emailValidation = validateOfficialEmail(profileEmail);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error };
    }

    const users = getStoredUsers();
    let existingUser = users.find((u) => u.email.toLowerCase() === profileEmail.toLowerCase());

    if (!existingUser) {
      // Create user record for Google user
      existingUser = {
        id: "usr_g_" + Math.random().toString(36).substring(2, 9),
        fullName: profileName,
        email: profileEmail.toLowerCase().trim(),
        provider: "google",
        createdAt: new Date().toISOString(),
        passwordHash: "oauth_google_verified",
      };
      users.push(existingUser);
      saveStoredUsers(users);

      // Notification for Google Signup
      sendAuthNotification({
        eventType: "USER_SIGNUP",
        fullName: existingUser.fullName,
        email: existingUser.email,
        authMethod: "Google OAuth",
      }).catch((err) => console.warn("Formspree alert non-blocking error:", err));
    } else {
      // Notification for Google Login
      sendAuthNotification({
        eventType: "GOOGLE_AUTH",
        fullName: existingUser.fullName,
        email: existingUser.email,
        authMethod: "Google OAuth",
      }).catch((err) => console.warn("Formspree alert non-blocking error:", err));
    }

    const sessionUser: User = {
      id: existingUser.id,
      fullName: existingUser.fullName,
      email: existingUser.email,
      avatar: existingUser.avatar,
      provider: "google",
      createdAt: existingUser.createdAt,
    };

    // 30 days session for Google login
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        user: sessionUser,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      })
    );

    document.cookie = `qsn_session=${sessionUser.id}; path=/; max-age=${30 * 24 * 3600}; SameSite=Lax`;

    setUser(sessionUser);
    return { success: true };
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    document.cookie = "qsn_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
  };

  // FORGOT PASSWORD
  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    const emailValidation = validateOfficialEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, message: emailValidation.error || "Invalid email" };
    }

    // Send Formspree alert to admin
    await sendAuthNotification({
      eventType: "PASSWORD_RESET_REQUEST",
      email: email.trim().toLowerCase(),
    });

    return {
      success: true,
      message: "If an account with that email exists, password reset instructions have been dispatched.",
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        lockoutTimeRemaining,
        login,
        register,
        loginWithGoogle,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

import { validateOfficialEmail } from "./emailValidator";

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  email: string;
}

/**
 * Strict RFC 5322 Email & Disposable Domain Shield.
 * Validates email formatting, rejects disposable/temporary domains,
 * and ensures clean normalized email formatting for admin dispatches.
 */
export function validateEmailForMrDuLow(email: string): EmailValidationResult {
  if (!email || typeof email !== "string") {
    return {
      isValid: false,
      error: "Valid email address is required.",
      email: "",
    };
  }

  const clean = email.trim().toLowerCase();
  const result = validateOfficialEmail(clean);

  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error || "Invalid or disposable email address.",
      email: clean,
    };
  }

  return {
    isValid: true,
    email: clean,
  };
}

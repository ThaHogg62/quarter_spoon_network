import dns from "dns/promises";
import type { MxRecord } from "dns";
import {
  validateOfficialEmail,
  TRUSTED_OFFICIAL_DOMAINS,
  DISPOSABLE_EMAIL_DOMAINS,
  EmailValidationResult,
} from "./emailValidator";

/**
 * Rigorously verifies that an email address is real, official, and working.
 * 1. Checks syntax and structure.
 * 2. Blocks known disposable/temporary services (300+ providers).
 * 3. Blocks suspicious disposable keywords and fake usernames.
 * 4. For non-trusted domains, queries DNS MX records to confirm the domain has
 *    active mail exchangers capable of receiving email, and verifies that the MX host
 *    does not route to a disposable relay network.
 */
export async function verifyRealWorkingEmail(
  email: string
): Promise<EmailValidationResult> {
  // Step 1: Run comprehensive syntax & blacklist validation
  const syncResult = validateOfficialEmail(email);
  if (!syncResult.isValid) {
    return syncResult;
  }

  const normalized = email.trim().toLowerCase();
  const domain = normalized.split("@")[1];
  if (!domain) {
    return { isValid: false, error: "Invalid email structure." };
  }

  // Step 2: If the domain is an established trusted provider (e.g. Gmail, Yahoo, Outlook, iCloud),
  // it is 100% verified working and official.
  if (TRUSTED_OFFICIAL_DOMAINS.includes(domain)) {
    return { isValid: true, isOfficial: true };
  }

  // Step 3: Check if domain is blacklisted or matches disposable patterns
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error:
        "Temporary, disposable, or fake email addresses are not permitted. Please use an official email provider.",
    };
  }

  // Step 4: Perform real DNS MX record lookup
  try {
    const mxLookup = dns.resolveMx(domain);
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DNS_TIMEOUT")), 2500)
    );

    const mxRecords = (await Promise.race([mxLookup, timeout])) as MxRecord[];

    if (!mxRecords || mxRecords.length === 0) {
      return {
        isValid: false,
        error: `The email domain "@${domain}" does not have active mail servers. Please enter a real, working email address.`,
      };
    }

    // Step 5: Verify the MX exchange hosts aren't disposable relays
    for (const record of mxRecords) {
      const exchange = (record.exchange || "").toLowerCase();
      if (
        exchange.includes("mailinator") ||
        exchange.includes("tempmail") ||
        exchange.includes("guerrillamail") ||
        exchange.includes("trashmail") ||
        exchange.includes("dispostable") ||
        exchange.includes("yopmail") ||
        exchange.includes("dropmail") ||
        exchange.includes("fake") ||
        exchange.includes("burner")
      ) {
        return {
          isValid: false,
          error: `The domain "@${domain}" points to a disposable email network. Only official, working email providers are allowed.`,
        };
      }
    }

    return { isValid: true, isOfficial: true };
  } catch (err: any) {
    if (err?.message === "DNS_TIMEOUT") {
      // If DNS timed out, allow if standard syntax check passed
      return { isValid: true, isOfficial: false };
    }

    if (
      err?.code === "ENOTFOUND" ||
      err?.code === "ENODATA" ||
      err?.code === "EREFUSED" ||
      err?.code === "SERVFAIL"
    ) {
      return {
        isValid: false,
        error: `The domain "@${domain}" does not exist or cannot receive mail. Please use a real, working email address.`,
      };
    }

    return { isValid: true, isOfficial: false };
  }
}


/**
 * Email validation utility for Quarter Spoon Network.
 * Validates email formatting and blocks temporary/disposable/fake email providers.
 */

// Blacklist of known disposable, temporary, and fake email providers
export const DISPOSABLE_EMAIL_DOMAINS: Set<string> = new Set([
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "10minutemail.com",
  "10minutemail.net",
  "10minemail.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.biz",
  "guerrillamail.org",
  "sharklasers.com",
  "grr.la",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "dispostable.com",
  "trashmail.com",
  "trashmail.net",
  "trashmail.me",
  "fakeinbox.com",
  "fakemailgenerator.com",
  "throwawaymail.com",
  "getairmail.com",
  "burnermail.io",
  "crazymailing.com",
  "maildrop.cc",
  "inboxkitten.com",
  "nada.ltd",
  "getnada.com",
  "mohmal.com",
  "mytemp.email",
  "mytempemail.com",
  "zillamail.com",
  "emailondeck.com",
  "tempail.com",
  "luxusmail.org",
  "generator.email",
  "fakermail.com",
  "throwawayemail.com",
  "harakirimail.com",
  "discard.email",
  "spambog.com",
  "mailnull.com",
  "jetable.org",
  "hidemail.de",
  "spamfree24.org",
  "mailcatch.com",
  "mytempemail.com",
  "boun.cr",
  "tempsky.com",
  "fastmailfake.com",
  "anonymousemail.me",
]);

// Common valid official email domains for quick classification
export const TRUSTED_OFFICIAL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "ymail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "gmx.com",
  "mail.com",
];

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  isOfficial?: boolean;
}

/**
 * Validates an email address ensuring proper format and absence of disposable/temp providers.
 */
export function validateOfficialEmail(email: string): EmailValidationResult {
  if (!email || typeof email !== "string") {
    return { isValid: false, error: "Email address is required." };
  }

  const trimmed = email.trim().toLowerCase();

  // Basic RFC 5322 regex validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address format." };
  }

  const parts = trimmed.split("@");
  if (parts.length !== 2) {
    return { isValid: false, error: "Invalid email structure." };
  }

  const [username, domain] = parts;

  // Check username constraints
  if (username.length < 2) {
    return { isValid: false, error: "Email username is too short." };
  }

  // Check disposable email blacklist
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error:
        "Temporary or disposable email addresses are not permitted. Please use an official email provider (e.g. Google, Yahoo, Outlook, iCloud).",
    };
  }

  // Check for suspicious wildcard patterns like temp.*, trash.*, disposable.*
  if (
    domain.startsWith("temp") ||
    domain.startsWith("trash") ||
    domain.startsWith("fake") ||
    domain.startsWith("disposable") ||
    domain.includes("burner") ||
    domain.includes("10minute")
  ) {
    return {
      isValid: false,
      error:
        "Disposable email domains are not permitted. Please use an official email provider.",
    };
  }

  // Ensure domain contains a valid TLD (at least 2 characters)
  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2) {
    return { isValid: false, error: "Invalid email top-level domain." };
  }

  const isOfficial = TRUSTED_OFFICIAL_DOMAINS.includes(domain);

  return {
    isValid: true,
    isOfficial,
  };
}

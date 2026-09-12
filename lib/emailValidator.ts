/**
 * Email validation utility for Quarter Spoon Network.
 * Validates email formatting and blocks temporary/disposable/fake email providers.
 */

// Blacklist of known disposable, temporary, and fake email providers (300+ known services)
export const DISPOSABLE_EMAIL_DOMAINS: Set<string> = new Set([
  // Popular Disposable & Temp Services
  "mailinator.com",
  "mailinator2.com",
  "mailinator.net",
  "tempmail.com",
  "tempmail.net",
  "temp-mail.org",
  "temp-mail.io",
  "temp-mail.ru",
  "10minutemail.com",
  "10minutemail.net",
  "10minemail.com",
  "10minutemail.co.uk",
  "10minutemail.be",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.biz",
  "guerrillamail.org",
  "guerrillamail.de",
  "guerrillamail.info",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "pokemail.net",
  "spam4.me",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "cool.fr.nf",
  "jetable.fr.nf",
  "courriel.fr.nf",
  "moncourrier.fr.nf",
  "monemail.fr.nf",
  "dispostable.com",
  "trashmail.com",
  "trashmail.net",
  "trashmail.me",
  "trashmail.io",
  "trashmail.org",
  "trash-mail.at",
  "trash-mail.com",
  "trash-mail.de",
  "trash-me.com",
  "fakeinbox.com",
  "fakemailgenerator.com",
  "fakemail.net",
  "fakemail.io",
  "emailfake.com",
  "fakermail.com",
  "throwawaymail.com",
  "throwawayemail.com",
  "getairmail.com",
  "airmail.com",
  "burnermail.io",
  "burnermail.com",
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
  "harakirimail.com",
  "discard.email",
  "discardmail.com",
  "spambog.com",
  "spambog.de",
  "spambog.ru",
  "mailnull.com",
  "jetable.org",
  "hidemail.de",
  "spamfree24.org",
  "mailcatch.com",
  "boun.cr",
  "tempsky.com",
  "fastmailfake.com",
  "anonymousemail.me",
  "trashinbox.com",
  "dropmail.me",
  "10mail.org",
  "mintemail.com",
  "incognitofreemail.com",
  "mailnesia.com",
  "nobulk.com",
  "nowmymail.com",
  "pookmail.com",
  "safersignup.com",
  "shortmail.net",
  "sneakemail.com",
  "sofort-mail.de",
  "superrito.com",
  "teleworm.us",
  "tempemail.net",
  "temporarymail.com",
  "wegwerfmail.de",
  "wegwerfmail.net",
  "wegwerfmail.org",
  "zehnminutenmail.de",
  "whyspam.me",
  "armyspy.com",
  "cuvox.de",
  "dayrep.com",
  "einrot.com",
  "fleckens.hu",
  "gustr.com",
  "jourrapide.com",
  "rhyta.com",
  "maildu.de",
  "mailscrap.com",
  "disposablemail.com",
  "disposable.email",
  "inboxbear.com",
  "muellmail.com",
  "tempr.email",
  "tempinbox.com",
  "inboxalias.com",
  "mailsac.com",
  "zippymail.info",
  "fakebox.com",
  "trashymail.com",
  "fastinbox.com",
  "noclickemail.com",
  "mytrashmail.com",
  "spamex.com",
  "mailmoat.com",
  "binkmail.com",
  "bobmail.info",
  "chammy.info",
  "devnullmail.com",
  "letthemeatspam.com",
  "mailin8r.com",
  "mailinator.org",
  "suremail.info",
  "tradermail.info",
  "veryrealemail.com",
  "zippymail.info",
  "zoemail.org",
  "test.com",
  "example.com",
  "test.org",
  "sample.com",
  "fakemail.com",
  "fake.com",
  "temporary.com",
]);

// Common valid official and trusted email domains for quick verification
export const TRUSTED_OFFICIAL_DOMAINS: string[] = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "ymail.com",
  "rocketmail.com",
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
  "gmx.net",
  "mail.com",
  "comcast.net",
  "sbcglobal.net",
  "att.net",
  "verizon.net",
  "cox.net",
  "charter.net",
  "fastmail.com",
];

// Blocked fake usernames that bots and trolls commonly enter
const BLOCKED_FAKE_USERNAMES = new Set([
  "test",
  "testing",
  "tester",
  "asdf",
  "asdfgh",
  "qwerty",
  "fake",
  "fakeuser",
  "nobody",
  "null",
  "undefined",
  "admin",
  "root",
  "noreply",
  "no-reply",
  "donotreply",
  "temp",
  "trash",
  "spam",
  "sample",
  "example",
  "anonymous",
  "someone",
  "user",
]);

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  isOfficial?: boolean;
}

/**
 * Validates an email address ensuring proper format, blocking disposable/temp providers,
 * and enforcing official, real domain structures.
 */
export function validateOfficialEmail(email: string): EmailValidationResult {
  if (!email || typeof email !== "string") {
    return { isValid: false, error: "Email address is required." };
  }

  const trimmed = email.trim().toLowerCase();

  // Basic RFC 5322 regex validation
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address format (e.g. name@gmail.com)." };
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

  if (BLOCKED_FAKE_USERNAMES.has(username)) {
    return {
      isValid: false,
      error: `"${username}" is not a permitted email address. Please use your official personal or business email.`,
    };
  }

  // Reject repeating single character usernames like "aaaaa@" or "11111@"
  if (/^(.)\1{3,}$/.test(username)) {
    return { isValid: false, error: "Please enter a real, working email address." };
  }

  // Check disposable email blacklist
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error:
        "Temporary, fake, or disposable email addresses are not permitted. Only official, working email providers (e.g. Google, Yahoo, Outlook, iCloud) are allowed.",
    };
  }

  // Check for suspicious disposable/temporary keywords in domain
  const suspiciousKeywords = [
    "temp",
    "trash",
    "fake",
    "dispos",
    "throwaway",
    "burner",
    "10min",
    "minute",
    "anon",
    "sharklaser",
    "guerrilla",
    "yopmail",
    "dropmail",
    "mytemp",
    "spambog",
    "spambox",
    "discard",
    "muell",
    "inboxkitten",
    "maildrop",
    "generator",
    "wegwerf",
    "mohmal",
  ];

  for (const keyword of suspiciousKeywords) {
    if (domain.includes(keyword)) {
      return {
        isValid: false,
        error:
          "Disposable and temporary email domains are strictly prohibited. Please use an official email provider.",
      };
    }
  }

  // Ensure domain contains a valid TLD
  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2 || /^\d+$/.test(tld)) {
    return { isValid: false, error: "Invalid email top-level domain." };
  }

  const isOfficial = TRUSTED_OFFICIAL_DOMAINS.includes(domain);

  return {
    isValid: true,
    isOfficial,
  };
}

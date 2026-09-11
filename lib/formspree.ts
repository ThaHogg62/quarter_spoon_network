/**
 * Formspree notification dispatcher for Quarter Spoon Network.
 * Sends notifications to mrdulow12@gmail.com on user sign-up and login events.
 */

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xqarrpvl";
const NOTIFICATION_RECIPIENT = "mrdulow12@gmail.com";

export interface AuthNotificationPayload {
  eventType: "USER_SIGNUP" | "USER_LOGIN" | "GOOGLE_AUTH" | "PASSWORD_RESET_REQUEST";
  fullName?: string;
  email: string;
  authMethod?: "Password" | "Google OAuth";
  timestamp?: string;
}

export async function sendAuthNotification(payload: AuthNotificationPayload): Promise<boolean> {
  const timestamp = payload.timestamp || new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

  const subjectMap = {
    USER_SIGNUP: `[QSN ALERT] New User Registration: ${payload.fullName || payload.email}`,
    USER_LOGIN: `[QSN ALERT] User Login: ${payload.email}`,
    GOOGLE_AUTH: `[QSN ALERT] Google Sign-In: ${payload.fullName || payload.email}`,
    PASSWORD_RESET_REQUEST: `[QSN ALERT] Password Reset Request: ${payload.email}`,
  };

  const messageMap = {
    USER_SIGNUP: `A new user has registered on Quarter Spoon Network.\n\nName: ${payload.fullName || "N/A"}\nEmail: ${payload.email}\nMethod: ${payload.authMethod || "Password"}\nTime: ${timestamp}`,
    USER_LOGIN: `A user has logged in to Quarter Spoon Network.\n\nEmail: ${payload.email}\nMethod: ${payload.authMethod || "Password"}\nTime: ${timestamp}`,
    GOOGLE_AUTH: `A user has authenticated via Google OAuth on Quarter Spoon Network.\n\nName: ${payload.fullName || "N/A"}\nEmail: ${payload.email}\nTime: ${timestamp}`,
    PASSWORD_RESET_REQUEST: `A password reset was requested on Quarter Spoon Network.\n\nEmail: ${payload.email}\nTime: ${timestamp}`,
  };

  const requestBody = {
    _replyto: payload.email,
    target_admin_email: NOTIFICATION_RECIPIENT,
    subject: subjectMap[payload.eventType] || `[QSN ALERT] Auth Event: ${payload.email}`,
    eventType: payload.eventType,
    userName: payload.fullName || "Anonymous Member",
    userEmail: payload.email,
    authMethod: payload.authMethod || "Password",
    timestamp: timestamp,
    message: messageMap[payload.eventType] || `Auth event triggered by ${payload.email} at ${timestamp}`,
  };

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.warn("Formspree notification responded with status:", response.status);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to dispatch Formspree notification:", err);
    return false;
  }
}

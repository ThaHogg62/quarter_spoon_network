"use server";

import { prisma } from "@/lib/prisma";
import { validateEmailForMrDuLow } from "@/lib/validators";

export type NotificationEventType =
  | "NEW_SUBSCRIBER"
  | "FIRST_TIME_LOGIN"
  | "REPEAT_LOGIN"
  | "FILE_DOWNLOAD_REQUEST"
  | "QUESTION_OR_ORDER";

export interface NotificationRequest {
  email: string;
  eventType: NotificationEventType;
  name?: string;
  details?: string;
  fileName?: string;
  appName?: string;
  source?: string;
}

export async function processSelectiveNotification(payload: NotificationRequest) {
  const {
    email,
    eventType,
    name = "Anonymous",
    details = "",
    fileName = "",
    appName = "Quarter Spoon Network",
    source = "Web Form",
  } = payload;

  // 1. Strict RFC 5322 Email Validation
  const validation = validateEmailForMrDuLow(email);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }
  const cleanEmail = validation.email;

  // 2. Strict Filter Check: REPEAT_LOGIN IS STRICTLY SUPPRESSED
  if (eventType === "REPEAT_LOGIN") {
    console.log(
      `[QSE Notification Shield] Repeat login detected for ${cleanEmail}. Suppressing email dispatch to mrdulow12@gmail.com.`
    );
    return {
      success: true,
      suppressed: true,
      reason: "Repeat login notification suppressed by policy.",
    };
  }

  // 3. Database Event Logging via Prisma ORM
  let isNewUser = false;
  try {
    const existingUser = await prisma.userActivity.findUnique({
      where: { email: cleanEmail },
    });

    if (!existingUser) {
      isNewUser = true;
      await prisma.userActivity.create({
        data: {
          email: cleanEmail,
          name,
          loginCount: eventType === "FIRST_TIME_LOGIN" ? 1 : 0,
          lastEventType: eventType,
        },
      });
    } else {
      await prisma.userActivity.update({
        where: { email: cleanEmail },
        data: {
          loginCount:
            eventType === "FIRST_TIME_LOGIN"
              ? { increment: 1 }
              : existingUser.loginCount,
          lastEventType: eventType,
        },
      });
    }
  } catch (dbErr) {
    console.warn("Prisma UserActivity DB log warning:", dbErr);
  }

  // Double Check First-Time Login Logic
  if (eventType === "FIRST_TIME_LOGIN" && !isNewUser) {
    console.log(
      `[QSE Notification Shield] Login from existing account (${cleanEmail}). Suppressing repeat login notification.`
    );
    return {
      success: true,
      suppressed: true,
      reason: "Existing account login suppressed.",
    };
  }

  // 4. Formspree Dry-Run / Test Mode Check
  const IS_DRY_RUN =
    process.env.FORMSPREE_DRY_RUN === "true" || process.env.NODE_ENV === "development";
  const PRIMARY_ENDPOINT =
    process.env.FORMSPREE_PRIMARY || "https://formspree.io/f/xqarrpvl";
  const BACKUP_ENDPOINT =
    process.env.FORMSPREE_BACKUP || "https://formspree.io/f/mlgwjnyk";
  const TARGET_EMAIL = process.env.ADMIN_NOTIFICATION_TARGET || "mrdulow12@gmail.com";

  const formspreePayload = {
    _to: TARGET_EMAIL,
    _subject: `[${appName.toUpperCase()}] Alert: ${eventType} - ${cleanEmail}`,
    eventType,
    email: cleanEmail,
    name,
    details,
    fileName,
    appName,
    source,
    submittedAt: new Date().toISOString(),
  };

  if (IS_DRY_RUN) {
    console.log(
      `[FORMSPREE DRY-RUN ACTIVE] Email dispatch simulated. Zero Formspree quota consumed.`
    );
    console.log("Simulated Payload:", formspreePayload);
    return {
      success: true,
      dryRun: true,
      message:
        "Dry-run mode active. Event logged locally; Formspree API fetch skipped to preserve quota.",
    };
  }

  // 5. Production Formspree Dispatch with Automatic Failover
  try {
    let response = await fetch(PRIMARY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(formspreePayload),
    });

    if (!response.ok) {
      console.warn(
        `Primary Formspree Endpoint rejected payload (${response.status}). Executing failover to Backup Endpoint...`
      );
      response = await fetch(BACKUP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(formspreePayload),
      });
    }

    if (response.ok) {
      return {
        success: true,
        message: `Notification for ${eventType} delivered to ${TARGET_EMAIL}.`,
      };
    } else {
      return {
        success: false,
        error: "Formspree dispatch failed across all endpoints.",
      };
    }
  } catch (netErr) {
    console.error("Formspree dispatch network exception:", netErr);
    return { success: false, error: "Network error during notification dispatch." };
  }
}

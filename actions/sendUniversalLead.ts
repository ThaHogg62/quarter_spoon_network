"use server";

import { prisma } from "@/lib/prisma";
import { validateEmailForMrDuLow } from "@/lib/validators";

export async function sendUniversalLead(formData: FormData) {
  const email = formData.get("email") as string;
  const name = (formData.get("name") as string) || "Anonymous Lead";
  const details = (formData.get("details") as string) || "";
  const appName = (formData.get("app_name") as string) || "Quarter Spoon Network";
  const source = (formData.get("source") as string) || "Universal Web Contact";

  if (!email || typeof email !== "string") {
    return { success: false, error: "Valid email address is required." };
  }

  // 1. Strict RFC 5322 Email & Disposable Domain Shield
  const validation = validateEmailForMrDuLow(email);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  const cleanEmail = validation.email;
  const PRIMARY_ENDPOINT = process.env.FORMSPREE_PRIMARY || "https://formspree.io/f/xqarrpvl";
  const BACKUP_ENDPOINT = process.env.FORMSPREE_BACKUP || "https://formspree.io/f/mlgwjnyk";

  const payload = {
    _to: "mrdulow12@gmail.com",
    _subject: `[${appName.toUpperCase()}] New Lead: ${cleanEmail}`,
    email: cleanEmail,
    name,
    details,
    appName,
    source,
    submittedAt: new Date().toISOString(),
  };

  let endpointUsed = "PRIMARY_XQARR3VL";
  let status = "DELIVERED";
  let transmissionSuccess = false;

  try {
    // 2. Attempt Primary Formspree Endpoint
    let response = await fetch(PRIMARY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    // 3. Failover to Backup Endpoint if Primary is Full/Fails
    if (!response.ok) {
      console.warn(`[${appName}] Primary endpoint failed. Failover routing to Backup Endpoint...`);
      endpointUsed = "BACKUP_MLGWJNYK";
      status = "FAILOVER_REROUTED";

      response = await fetch(BACKUP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (response.ok) {
      transmissionSuccess = true;
    }
  } catch (err) {
    console.error(`[${appName}] Network dispatch exception:`, err);
    status = "NETWORK_ERROR";
  }

  // 4. Server-Side Data Conversion Logging in Database
  try {
    await prisma.leadConversion.create({
      data: {
        email: cleanEmail,
        name,
        appName,
        source,
        details,
        endpointUsed,
        status,
      },
    });
  } catch (dbErr) {
    console.error("Prisma analytics logging error:", dbErr);
  }

  if (transmissionSuccess) {
    return { success: true, message: `Lead successfully submitted to ${appName}.` };
  } else {
    return { success: false, error: "Transmission failed on both endpoints. Logged locally." };
  }
}

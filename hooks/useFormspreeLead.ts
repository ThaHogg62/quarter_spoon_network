import { useState } from "react";

export interface LeadPayload {
  email: string;
  name?: string;
  message?: string;
  source?: string;
}

export interface UseFormspreeOptions {
  appName: string;
  defaultSource?: string;
}

export function useFormspreeLead({
  appName,
  defaultSource = "React App Form",
}: UseFormspreeOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PRIMARY_ENDPOINT = "https://formspree.io/f/xqarrpvl";
  const BACKUP_ENDPOINT = "https://formspree.io/f/mlgwjnyk";
  const TARGET_ADMIN = "mrdulow12@gmail.com";

  const submitLead = async (data: LeadPayload) => {
    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);

    const payload = {
      _to: TARGET_ADMIN,
      _subject: `[${appName.toUpperCase()}] New Lead: ${data.email}`,
      appName,
      source: data.source || defaultSource,
      email: data.email,
      name: data.name || "Anonymous Lead",
      message: data.message || "",
      submittedAt: new Date().toISOString(),
    };

    const postToEndpoint = async (url: string) => {
      return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
    };

    try {
      // 1. Attempt Primary Endpoint
      let response = await postToEndpoint(PRIMARY_ENDPOINT);

      // 2. Failover to Backup Endpoint if primary fails or reaches submission limit
      if (!response.ok) {
        console.warn(
          `[${appName}] Primary Formspree endpoint rejected request. Triggering backup failover...`
        );
        response = await postToEndpoint(BACKUP_ENDPOINT);
      }

      if (response.ok) {
        setIsSuccess(true);
        return { success: true };
      } else {
        const errText = "Submission rejected by all endpoints.";
        setError(errText);
        return { success: false, error: errText };
      }
    } catch (err: any) {
      const netErr = err?.message || "Network transmission failure.";
      setError(netErr);
      return { success: false, error: netErr };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitLead, isSubmitting, isSuccess, error };
}

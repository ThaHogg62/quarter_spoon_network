"use client";

import { processSelectiveNotification } from "@/actions/selectiveNotification";

// Trigger A: New Subscriber Sign-up
export async function handleSubscriberSignup(email: string, name: string) {
  return await processSelectiveNotification({
    email,
    name,
    eventType: "NEW_SUBSCRIBER",
    appName: "Quarter Spoon Network",
    source: "Hero Umbrella Section",
  });
}

// Trigger B: First-Time Login Check
export async function handleUserLogin(email: string, isFirstLogin: boolean) {
  return await processSelectiveNotification({
    email,
    eventType: isFirstLogin ? "FIRST_TIME_LOGIN" : "REPEAT_LOGIN", // REPEAT_LOGIN will be suppressed automatically!
    appName: "Quarter Spoon Network",
    source: "NextAuth Login",
  });
}

// Trigger C: Downloadable File Request
export async function handleFileDownloadRequest(email: string, fileName: string) {
  return await processSelectiveNotification({
    email,
    eventType: "FILE_DOWNLOAD_REQUEST",
    fileName,
    appName: "Quarter Spoon Network",
    source: "Tech Spec Download Button",
  });
}

// Trigger D: Question or Order Submission
export async function handleQuestionOrOrder(email: string, name: string, details: string) {
  return await processSelectiveNotification({
    email,
    name,
    details,
    eventType: "QUESTION_OR_ORDER",
    appName: "Quarter Spoon Network",
    source: "On Tha Spot Consulting Contact Form",
  });
}

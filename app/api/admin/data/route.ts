import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getThankYouEmailTemplate,
  getInviteEmailTemplate,
  getDigitalWorkflowAnnouncementTemplate,
} from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get("adminEmail") || request.headers.get("x-admin-email");

    // Strictly enforce admin access
    if (!adminEmail || !db.isAdmin(adminEmail)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Classified for Tha Hogg command only." },
        { status: 403 }
      );
    }

    const data = db.getData();
    const subscribers = db.getSubscribers();
    const users = db.getUsers();
    const loginLogs = data.loginLogs;
    const dispatches = db.getEmailDispatches();
    const videoStats = db.getVideoStats();
    const recentVideoPlays = db.getRecentVideoPlays(30);
    const gameInquiries = db.getGameInquiries(30);
    const pdfStats = db.getPdfStats();
    const recentPdfDownloads = db.getRecentPdfDownloads(30);
    const totalPdfDownloads = pdfStats.reduce((acc, s) => acc + (s.totalDownloads || 0), 0);

    // Compute user subscription mapping
    const subscribedEmailSet = new Set(
      subscribers
        .filter((s) => s.status === "active")
        .map((s) => s.email.toLowerCase().trim())
    );

    const usersWithSubStatus = users.map((u) => ({
      ...u,
      isSubscribed: subscribedEmailSet.has(u.email.toLowerCase().trim()),
    }));

    // Active recently (logged in within last 24 hours)
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    const activeRecentlyCount = users.filter((u) => {
      try {
        return new Date(u.lastLoginAt).getTime() > twentyFourHoursAgo;
      } catch {
        return false;
      }
    }).length;

    const nonSubscribersCount = users.filter(
      (u) => !subscribedEmailSet.has(u.email.toLowerCase().trim())
    ).length;

    // Email templates preview
    const sampleThankYou = getThankYouEmailTemplate("Tha Network VIP");
    const sampleInvite = getInviteEmailTemplate("Tha Network Member");
    const sampleDigitalWorkflow = getDigitalWorkflowAnnouncementTemplate("Tha Network VIP");

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: {
        totalUsers: users.length,
        totalSubscribers: subscribers.filter((s) => s.status === "active").length,
        activeRecently: activeRecentlyCount,
        nonSubscribersCount,
        totalPdfDownloads,
      },
      subscribers,
      users: usersWithSubStatus,
      loginLogs: loginLogs.slice(0, 30),
      dispatches: dispatches.slice(0, 50),
      videoStats,
      recentVideoPlays,
      gameInquiries,
      pdfStats,
      recentPdfDownloads,
      templates: {
        thankYou: sampleThankYou,
        invite: sampleInvite,
        digitalWorkflow: sampleDigitalWorkflow,
      },
    });
  } catch (error: any) {
    console.error("Error fetching admin telemetry:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch telemetry data" },
      { status: 500 }
    );
  }
}

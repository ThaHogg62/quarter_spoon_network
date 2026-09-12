import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getInviteEmailTemplate,
  getThankYouEmailTemplate,
  getDigitalWorkflowAnnouncementTemplate,
} from "@/lib/emailTemplates";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xqarrpvl";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      adminEmail,
      target, // "all_non_subscribers" | "single" | "test"
      recipientEmail,
      recipientName,
      templateType = "invite", // "invite" | "thank_you" | "custom"
      customSubject,
      customBody,
    } = body;

    // Strict Admin verification
    if (!adminEmail || !db.isAdmin(adminEmail)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Command restricted to Tha Hogg." },
        { status: 403 }
      );
    }

    const results: {
      totalDispatched: number;
      recipients: string[];
      details: string;
    } = {
      totalDispatched: 0,
      recipients: [],
      details: "",
    };

    if (target === "all_non_subscribers") {
      const nonSubscribers = db.getNonSubscribers();

      if (nonSubscribers.length === 0) {
        return NextResponse.json({
          success: true,
          totalDispatched: 0,
          message: "All registered users are already subscribed to Tha Network!",
        });
      }

      for (const user of nonSubscribers) {
        const invite = getInviteEmailTemplate(user.fullName);
        const subject = customSubject || invite.subject;
        const text = customBody || invite.text;

        db.recordDispatch({
          type: "blast",
          recipientEmail: user.email,
          recipientName: user.fullName,
          subject,
          bodyText: text,
          status: "sent",
        });

        results.recipients.push(user.email);
        results.totalDispatched++;
      }

      results.details = `Blast successfully sent to ${results.totalDispatched} non-subscriber(s).`;

      // Notify Formspree of the blast event
      fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          subject: `[THA NETWORK BLAST] Sent to ${results.totalDispatched} non-subscribers`,
          eventType: "EMAIL_BLAST_DISPATCHED",
          adminEmail,
          totalDispatched: results.totalDispatched,
          recipients: results.recipients.join(", "),
          timestamp: new Date().toISOString(),
          message: `Admin ${adminEmail} dispatched an email blast to ${results.totalDispatched} non-subscribers.`,
        }),
      }).catch((err) => console.warn("Blast Formspree alert error:", err));
    } else if (target === "all_subscribers") {
      const subscribers = db.getSubscribers().filter((s) => s.status === "active");

      if (subscribers.length === 0) {
        return NextResponse.json({
          success: true,
          totalDispatched: 0,
          message: "No active subscribers found in Tha Network list.",
        });
      }

      for (const sub of subscribers) {
        const workflowAnnouncement = getDigitalWorkflowAnnouncementTemplate(sub.fullName);
        const subject = customSubject || workflowAnnouncement.subject;
        const text = customBody || workflowAnnouncement.text;

        db.recordDispatch({
          type: "digital_workflow",
          recipientEmail: sub.email,
          recipientName: sub.fullName,
          subject,
          bodyText: text,
          status: "sent",
        });

        results.recipients.push(sub.email);
        results.totalDispatched++;
      }

      results.details = `Digital Workflow announcement successfully blasted to ${results.totalDispatched} subscriber(s).`;

      fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          subject: `[SUBSCRIBER BLAST] Digital Workflow Announced to ${results.totalDispatched} subscribers`,
          eventType: "SUBSCRIBER_BLAST_DISPATCHED",
          adminEmail,
          totalDispatched: results.totalDispatched,
          recipients: results.recipients.join(", "),
          timestamp: new Date().toISOString(),
          message: `Admin ${adminEmail} announced Digital Workflow to ${results.totalDispatched} subscribers.`,
        }),
      }).catch((err) => console.warn("Subscriber blast Formspree alert error:", err));
    } else if (target === "single") {
      if (!recipientEmail) {
        return NextResponse.json(
          { success: false, error: "Recipient email is required for individual dispatch." },
          { status: 400 }
        );
      }

      let template;
      if (templateType === "thank_you") {
        template = getThankYouEmailTemplate(recipientName);
      } else if (templateType === "digital_workflow") {
        template = getDigitalWorkflowAnnouncementTemplate(recipientName);
      } else {
        template = getInviteEmailTemplate(recipientName);
      }

      const subject = customSubject || template.subject;
      const text = customBody || template.text;

      db.recordDispatch({
        type:
          templateType === "thank_you"
            ? "thank_you"
            : templateType === "digital_workflow"
            ? "digital_workflow"
            : "invite",
        recipientEmail: recipientEmail.toLowerCase().trim(),
        recipientName: recipientName || "Quarter Spoon Member",
        subject,
        bodyText: text,
        status: "sent",
      });

      results.totalDispatched = 1;
      results.recipients.push(recipientEmail);
      results.details = `Direct email successfully dispatched to ${recipientEmail}.`;
    } else if (target === "test") {
      // Send test email to admin
      let testTemplate;
      if (templateType === "thank_you") {
        testTemplate = getThankYouEmailTemplate("Tha Hogg (Admin Test)");
      } else if (templateType === "digital_workflow") {
        testTemplate = getDigitalWorkflowAnnouncementTemplate("Tha Hogg (Admin Test)");
      } else {
        testTemplate = getInviteEmailTemplate("Tha Hogg (Admin Test)");
      }

      const subject = `[TEST DISPATCH] ${customSubject || testTemplate.subject}`;
      const text = customBody || testTemplate.text;

      db.recordDispatch({
        type: "preview",
        recipientEmail: adminEmail,
        recipientName: "Tha Hogg (Admin Test)",
        subject,
        bodyText: text,
        status: "sent",
      });

      results.totalDispatched = 1;
      results.recipients.push(adminEmail);
      results.details = `Test dispatch transmitted to ${adminEmail}.`;
    }

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error: any) {
    console.error("Error executing email blast:", error);
    return NextResponse.json(
      { success: false, error: "Failed to dispatch email blast" },
      { status: 500 }
    );
  }
}

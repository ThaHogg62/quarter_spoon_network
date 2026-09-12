import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyRealWorkingEmail } from "@/lib/emailServerValidator";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xqarrpvl";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      adminEmail,
      inquiryId,
      recipientEmail,
      recipientName,
      subject,
      bodyText,
    } = body;

    // 1. Strict Admin Authentication
    if (!adminEmail || !db.isAdmin(adminEmail)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Reply command restricted to Tha Hogg." },
        { status: 403 }
      );
    }

    if (!recipientEmail || !recipientEmail.trim()) {
      return NextResponse.json(
        { success: false, error: "Recipient email is required." },
        { status: 400 }
      );
    }

    if (!bodyText || !bodyText.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter a message to send." },
        { status: 400 }
      );
    }

    // 2. Validate that recipient email is real, working, and not temporary or fake
    const emailCheck = await verifyRealWorkingEmail(recipientEmail);
    if (!emailCheck.isValid) {
      return NextResponse.json(
        {
          success: false,
          error:
            emailCheck.error ||
            "The recipient email address is invalid, temporary, or has no active mail servers.",
        },
        { status: 400 }
      );
    }

    const cleanSubject =
      subject?.trim() || "Tha Hogg // Direct Response from Quarter Spoon Network";
    const cleanBody = bodyText.trim();
    const now = new Date().toISOString();

    // 3. Update the inquiry in the database
    let updatedInquiry = null;
    if (inquiryId) {
      updatedInquiry = db.updateInquiryReply(inquiryId, {
        text: cleanBody,
        repliedAt: now,
        adminEmail: adminEmail.toLowerCase().trim(),
        subject: cleanSubject,
      });
    }

    // 4. Record the dispatch in database audit log
    const recordedDispatch = db.recordDispatch({
      type: "direct_reply",
      recipientEmail: recipientEmail.toLowerCase().trim(),
      recipientName: recipientName || "Quarter Spoon Member",
      subject: cleanSubject,
      bodyText: cleanBody,
      status: "sent",
    });

    // 5. Send notification payload to Formspree endpoint
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
    const fullEmailContent = `DIRECT REPLY DISPATCHED BY THA HOGG:\n\nTo: ${recipientName || "Member"} <${recipientEmail}>\nFrom: Tha Hogg <${adminEmail}>\nTime: ${timestamp}\nSubject: ${cleanSubject}\n\n=========================================\n${cleanBody}\n=========================================\n\n— Tha Hogg // Quarter Spoon Network // Unda Tha Radar Filmz // Fresno, CA`;

    try {
      await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _replyto: adminEmail,
          email: adminEmail,
          target_recipient: recipientEmail,
          subject: `[DIRECT REPLY] ${cleanSubject}`,
          _subject: `[DIRECT REPLY] ${cleanSubject}`,
          senderName: "Tha Hogg",
          senderEmail: adminEmail,
          recipientName: recipientName || "Member",
          recipientEmail: recipientEmail,
          message: fullEmailContent,
          timestamp,
        }),
      });
    } catch (fsErr) {
      console.warn("Formspree reply notification warning:", fsErr);
    }

    return NextResponse.json({
      success: true,
      message: `Direct reply successfully dispatched to ${recipientEmail}.`,
      inquiry: updatedInquiry,
      dispatch: recordedDispatch,
    });
  } catch (err: any) {
    console.error("Error processing admin reply:", err);
    return NextResponse.json(
      { success: false, error: "Failed to transmit reply. Please try again." },
      { status: 500 }
    );
  }
}


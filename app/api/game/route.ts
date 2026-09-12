import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyRealWorkingEmail } from "@/lib/emailServerValidator";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xqarrpvl";
const TARGET_ADMIN = "mrdulow12@gmail.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, category, question } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Your email address is required so Tha Hogg can reply." },
        { status: 400 }
      );
    }

    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter your question or bundle suggestion." },
        { status: 400 }
      );
    }

    const emailCheck = await verifyRealWorkingEmail(email);
    if (!emailCheck.isValid) {
      return NextResponse.json(
        { success: false, error: emailCheck.error || "Please enter a valid, official working email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Enforce: "GET U SOME GAME" suggestion section is ONLY available to subscribers
    const isSubscribed = db.isSubscribed(normalizedEmail);
    if (!isSubscribed) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The 'Get U Some Game' suggestion section is reserved exclusively for subscribers of Tha Network. Please subscribe to lock in.",
        },
        { status: 403 }
      );
    }

    // 1. Record inquiry in local persistent database
    const recordedInquiry = db.recordGameInquiry({
      fullName: fullName?.trim() || "VIP Subscriber",
      email: normalizedEmail,
      category: category || "General Question",
      question: question.trim(),
    });

    // 2. Dispatch email notification to mrdulow12@gmail.com via Formspree endpoint
    const subject = `[GET U SOME GAME] ${category || "Question"}: ${fullName || normalizedEmail}`;
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

    const message = `A VIP subscriber has submitted a question/suggestion via "GET U SOME GAME":\n\nName: ${
      fullName || "VIP Subscriber"
    }\nEmail: ${normalizedEmail}\nStatus: ACTIVE VIP SUBSCRIBER (Tha Network)\nCategory: ${
      category || "General Question"
    }\nTime: ${timestamp}\n\nQuestion / Suggestion:\n${question.trim()}\n\n---\n*NOTE FOR THA HOGG*: Simply hit "Reply" in your email software and your response will be delivered directly to ${normalizedEmail}.`;

    const requestBody = {
      _replyto: normalizedEmail,
      email: normalizedEmail,
      target_admin_email: TARGET_ADMIN,
      subject: subject,
      _subject: subject,
      senderName: fullName || "VIP Subscriber",
      senderEmail: normalizedEmail,
      subscriberStatus: "ACTIVE VIP SUBSCRIBER",
      category: category || "General Question",
      message: message,
      timestamp: timestamp,
    };

    try {
      const formspreeRes = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!formspreeRes.ok) {
        console.warn("Formspree notification returned status:", formspreeRes.status);
      }
    } catch (fsErr) {
      console.warn("Formspree game inquiry alert error:", fsErr);
    }

    return NextResponse.json({
      success: true,
      inquiry: recordedInquiry,
      message:
        "Your message has been sent directly to Tha Hogg. When he responds, his reply will arrive directly in your email inbox.",
    });
  } catch (err: any) {
    console.error("Error submitting game inquiry:", err);
    return NextResponse.json(
      { success: false, error: "Failed to transmit your message. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const limit = parseInt(searchParams.get("limit") || "40", 10);

    if (email && db.isAdmin(email)) {
      const inquiries = db.getGameInquiries(limit);
      return NextResponse.json({ success: true, inquiries });
    }

    const allInquiries = db.getGameInquiries(20);
    const suggestions = allInquiries
      .filter((inq) => (inq.category || "").toLowerCase().includes("suggestion") || (inq.category || "").toLowerCase().includes("prompt"))
      .map((inq) => ({
        id: inq.id,
        category: inq.category,
        question: inq.question,
        timestamp: inq.timestamp,
        replied: !!(inq.status === "replied" || inq.reply),
      }));

    return NextResponse.json({ success: true, suggestions });
  } catch (err: any) {
    console.error("Error fetching inquiries:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load inquiries" },
      { status: 500 }
    );
  }
}


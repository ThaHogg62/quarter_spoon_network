import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getThankYouEmailTemplate } from "@/lib/emailTemplates";
import { verifyRealWorkingEmail } from "@/lib/emailServerValidator";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xqarrpvl";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ isSubscribed: false });
  }

  const isSubscribed = db.isSubscribed(email);
  return NextResponse.json({ isSubscribed });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, fullName, source } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const emailCheck = await verifyRealWorkingEmail(email);
    if (!emailCheck.isValid) {
      return NextResponse.json(
        { success: false, error: emailCheck.error || "Please enter a valid official email address" },
        { status: 400 }
      );
    }

    const { subscriber, alreadySubscribed } = db.addSubscriber({
      email,
      fullName,
      source: source || "Tha Network Modal",
    });

    // Generate Thank You Email signed by Tha Hogg
    const thankYouTemplate = getThankYouEmailTemplate(subscriber.fullName);

    // Record email dispatch in database
    db.recordDispatch({
      type: "thank_you",
      recipientEmail: subscriber.email,
      recipientName: subscriber.fullName,
      subject: thankYouTemplate.subject,
      bodyText: thankYouTemplate.text,
      status: "sent",
    });

    // Send Formspree notification to admin alert endpoint (non-blocking)
    fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        subject: `[THA NETWORK] New Subscriber: ${subscriber.fullName} (${subscriber.email})`,
        eventType: "THA_NETWORK_SUBSCRIPTION",
        userName: subscriber.fullName,
        userEmail: subscriber.email,
        source: subscriber.source,
        timestamp: new Date().toISOString(),
        message: `New subscriber locked into Tha Network:\nName: ${subscriber.fullName}\nEmail: ${subscriber.email}\nSource: ${subscriber.source}\nThank-you email dispatched automatically.`,
      }),
    }).catch((err) => console.warn("Formspree subscription alert non-blocking error:", err));

    return NextResponse.json({
      success: true,
      subscriber,
      alreadySubscribed,
      thankYouEmail: {
        subject: thankYouTemplate.subject,
        preview: thankYouTemplate.text.substring(0, 180) + "...",
      },
    });
  } catch (error: any) {
    console.error("Error processing subscription:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyRealWorkingEmail } from "@/lib/emailServerValidator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, fullName, email, provider } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
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

    const recordedUser = db.recordUserLogin({
      id,
      fullName: fullName || "Quarter Spoon Member",
      email,
      provider: provider === "google" ? "google" : "email",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: recordedUser.id,
        fullName: recordedUser.fullName,
        email: recordedUser.email,
        lastLoginAt: recordedUser.lastLoginAt,
      },
    });
  } catch (error: any) {
    console.error("Error recording user session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record session" },
      { status: 500 }
    );
  }
}

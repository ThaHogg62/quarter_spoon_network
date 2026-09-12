import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videoId, videoTitle, userEmail, userName, isSubscriber, category } = body;

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: "videoId is required" },
        { status: 400 }
      );
    }

    const { play, stat } = db.recordVideoPlay({
      videoId,
      videoTitle: videoTitle || "Quarter Spoon Transmission",
      userEmail,
      userName,
      isSubscriber,
      category,
    });

    return NextResponse.json({
      success: true,
      play,
      stat,
    });
  } catch (err: any) {
    console.error("Error recording video play:", err);
    return NextResponse.json(
      { success: false, error: "Failed to record play event" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      pdfId,
      pdfTitle,
      fileName,
      category,
      fileSize,
      userEmail,
      userName,
      isSubscriber,
    } = body;

    if (!pdfId) {
      return NextResponse.json(
        { success: false, error: "pdfId is required" },
        { status: 400 }
      );
    }

    const { download, stat } = db.recordPdfDownload({
      pdfId,
      pdfTitle: pdfTitle || "Quarter Spoon PDF Blueprint",
      fileName: fileName || `${pdfId}.pdf`,
      category: category || "Digital Asset",
      fileSize: fileSize || "PDF",
      userEmail,
      userName,
      isSubscriber,
    });

    return NextResponse.json({
      success: true,
      download,
      stat,
    });
  } catch (err: any) {
    console.error("Error recording PDF download:", err);
    return NextResponse.json(
      { success: false, error: "Failed to record download event" },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const webhookSecret =
      req.headers.get("x-formspree-signature") || req.headers.get("authorization");

    // Optional Secret Header Verification
    if (
      process.env.FORMSPREE_WEBHOOK_SECRET &&
      webhookSecret !== process.env.FORMSPREE_WEBHOOK_SECRET
    ) {
      return NextResponse.json(
        { error: "Unauthorized webhook payload signature" },
        { status: 401 }
      );
    }

    const { email, name, appName, source, details, _endpoint } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Missing email in webhook payload" },
        { status: 400 }
      );
    }

    // Upsert Lead Conversion Record in Database
    const conversion = await prisma.leadConversion.create({
      data: {
        email: String(email),
        name: name ? String(name) : "Anonymous",
        appName: appName ? String(appName) : "External App Portal",
        source: source ? String(source) : "Formspree Webhook Event",
        details: details ? String(details) : "",
        endpointUsed: _endpoint || "FORMSPREE_WEBHOOK_SYNC",
        status: "WEBHOOK_CONFIRMED",
      },
    });

    return NextResponse.json({ success: true, conversionId: conversion.id });
  } catch (error) {
    console.error("Formspree Universal Webhook Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

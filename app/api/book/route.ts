// app/api/book/route.ts
// Handles booking form submission.
// 1. Creates a Zoom meeting (video calls only)
// 2. Sends confirmation emails via Resend
// 3. Writes booking directly to Firestore — no cross-deployment HTTP call

import { NextRequest, NextResponse } from "next/server";
import { createZoomMeeting } from "@/lib/zoom";
import { sendClientConfirmation, sendOwnerNotification } from "@/lib/emails";
import { getDb } from "@/lib/firebase-admin";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const maxDuration = 30;
const TZ = "Europe/London";

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const { name, email, phone, company, location, website, callType, date, time } = body;
  if (!name || !email || !phone || !company || !date || !time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [year, month, day] = (date as string).split("-").map(Number);
  const [hour, minute]     = (time as string).split(":").map(Number);
  const startDate = new Date(year, month - 1, day, hour, minute, 0, 0);
  const localDate = toZonedTime(startDate, TZ);
  const humanDate = format(localDate, "EEEE d MMMM yyyy");
  const humanTime = format(localDate, "h:mm a");
  const isVideo   = callType === "video";
  const duration  = isVideo ? 30 : 15;

  // ── 1. Create Zoom meeting (video calls only) ──────────────────────────────
  let zoom = null;
  if (isVideo) {
    zoom = await createZoomMeeting({
      topic:           `Level One — ${name} (${company})`,
      startTime:       startDate,
      durationMinutes: duration,
      agenda:          `Initial call with ${name} from ${company}${website ? `. Website: ${website}` : ""}`,
    });
  }

  // ── 2. Send confirmation emails ────────────────────────────────────────────
  const ep = {
    clientName:   name,
    clientEmail:  email,
    clientPhone:  phone,
    company,
    location,
    website,
    callType,
    date:         humanDate,
    time:         humanTime,
    durationMinutes: duration,
    zoomJoinUrl:  zoom?.joinUrl,
    zoomMeetingId:zoom?.meetingId,
    zoomPassword: zoom?.password,
  };
  await Promise.all([sendClientConfirmation(ep), sendOwnerNotification(ep)]);

  // ── 3. Write directly to Firestore ────────────────────────────────────────
  // No cross-deployment HTTP call — write to the shared Firebase database
  // using the credentials in this project's environment variables.
  try {
    const db = getDb();
    const id  = `booking_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    await db.collection("bookings").doc(id).set({
      id,
      clientName:     name,
      clientEmail:    email,
      clientPhone:    phone     ?? "",
      company:        company   ?? "",
      location:       location  ?? "",
      website:        website   || undefined,
      callType,
      date:           humanDate,
      time:           humanTime,
      slotIso:        startDate.toISOString(),
      durationMinutes: duration,
      zoomJoinUrl:    zoom?.joinUrl    || undefined,
      zoomMeetingId:  zoom?.meetingId  || undefined,
      status:         "confirmed",
      reminderSent:   false,
      createdAt:      new Date().toISOString(),
    });
  } catch (err) {
    // Non-fatal — booking is confirmed and emails sent even if Firebase write fails
    console.error("Failed to write booking to Firestore:", err);
  }

  return NextResponse.json({
    success:      true,
    date:         humanDate,
    time:         humanTime,
    callType,
    zoomJoinUrl:  zoom?.joinUrl   ?? null,
    zoomMeetingId:zoom?.meetingId ?? null,
  });
}

// app/api/book/route.ts
// Handles booking form submission.
// 1. Creates a Zoom meeting (video calls only)
// 2. Sends confirmation emails via Resend
// 3. Writes booking directly to Firestore

import { NextRequest, NextResponse } from "next/server";
import { createZoomMeeting } from "@/lib/zoom";
import { sendClientConfirmation, sendOwnerNotification } from "@/lib/emails";
import { getDb } from "@/lib/firebase-admin";
import { format, parse } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export const maxDuration = 30;
const TZ = "Europe/London";

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  // The booking page spreads the form object and adds date + time + callType
  // form fields: name, email, phone, company, location, website
  // extra fields: date (YYYY-MM-DD), time (HH:mm), callType
  const {
    name, email, phone, company, location, website,
    callType, date, time,
  } = body;

  if (!name || !email || !phone || !company || !date || !time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // ── Parse date + time correctly in London timezone ─────────────────────────
  // date = "2026-06-10", time = "09:30"
  // We parse them as London local time then convert to UTC for storage.
  // This avoids the bug where new Date(year, month, day, hour, min) uses
  // the server's UTC timezone instead of the user's London timezone.
  const localDateTimeStr = `${date} ${time}`; // "2026-06-10 09:30"
  const parsedLocal = parse(localDateTimeStr, "yyyy-MM-dd HH:mm", new Date());
  const startDateUtc = fromZonedTime(parsedLocal, TZ); // correct UTC equivalent
  const startDateLondon = toZonedTime(startDateUtc, TZ);

  const humanDate = format(startDateLondon, "EEEE d MMMM yyyy"); // "Wednesday 10 June 2026"
  const humanTime = format(startDateLondon, "h:mm a");           // "9:30 AM"
  const isVideo   = callType === "video";
  const duration  = isVideo ? 30 : 15;

  // ── 1. Create Zoom meeting (video calls only) ──────────────────────────────
  let zoom = null;
  if (isVideo) {
    zoom = await createZoomMeeting({
      topic:           `Level One — ${name} (${company})`,
      startTime:       startDateUtc,
      durationMinutes: duration,
      agenda:          `Initial call with ${name} from ${company}${website ? `. Website: ${website}` : ""}`,
    });
  }

  // ── 2. Send confirmation emails ────────────────────────────────────────────
  const ep = {
    clientName:      name,
    clientEmail:     email,
    clientPhone:     phone,
    company,
    location,
    website,
    callType,
    date:            humanDate,
    time:            humanTime,
    durationMinutes: duration,
    zoomJoinUrl:     zoom?.joinUrl,
    zoomMeetingId:   zoom?.meetingId,
    zoomPassword:    zoom?.password,
  };
  await Promise.all([sendClientConfirmation(ep), sendOwnerNotification(ep)]);

  // ── 3. Write directly to Firestore ────────────────────────────────────────
  try {
    const db = getDb();
    const id  = `booking_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    await db.collection("bookings").doc(id).set({
      id,
      clientName:      name,
      clientEmail:     email,
      clientPhone:     phone      ?? "",
      company:         company    ?? "",
      location:        location   ?? "",
      website:         website    || undefined,
      callType,
      date:            humanDate,   // "Wednesday 10 June 2026"
      time:            humanTime,   // "9:30 AM"
      slotIso:         startDateUtc.toISOString(), // correct UTC ISO string
      durationMinutes: duration,
      zoomJoinUrl:     zoom?.joinUrl    || undefined,
      zoomMeetingId:   zoom?.meetingId  || undefined,
      status:          "confirmed",
      reminderSent:    false,
      createdAt:       new Date().toISOString(),
    });
  } catch (err) {
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

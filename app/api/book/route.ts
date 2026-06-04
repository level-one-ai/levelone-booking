// app/api/book/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createZoomMeeting } from "@/lib/zoom";
import { sendClientConfirmation, sendOwnerNotification } from "@/lib/emails";
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

  const [year, month, day]   = (date as string).split("-").map(Number);
  const [hour, minute]       = (time as string).split(":").map(Number);
  const startDate  = new Date(year, month - 1, day, hour, minute, 0, 0);
  const localDate  = toZonedTime(startDate, TZ);
  const humanDate  = format(localDate, "EEEE d MMMM yyyy");
  const humanTime  = format(localDate, "h:mm a");
  const isVideo    = callType === "video";
  const duration   = isVideo ? 30 : 15;

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

  // ── 2. Send emails ─────────────────────────────────────────────────────────
  const ep = {
    clientName: name, clientEmail: email, clientPhone: phone,
    company, location, website, callType, date: humanDate, time: humanTime,
    durationMinutes: duration,
    zoomJoinUrl:  zoom?.joinUrl,
    zoomMeetingId:zoom?.meetingId,
    zoomPassword: zoom?.password,
  };
  await Promise.all([sendClientConfirmation(ep), sendOwnerNotification(ep)]);

  // ── 3. Save booking to outreach centre Firebase ────────────────────────────
  const outreachUrl = process.env.OUTREACH_CENTRE_URL;
  const secret      = process.env.BOOKING_WEBHOOK_SECRET;

  if (outreachUrl) {
    try {
      await fetch(`${outreachUrl}/api/bookings/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(secret ? { "x-booking-secret": secret } : {}),
        },
        body: JSON.stringify({
          clientName:    name,
          clientEmail:   email,
          clientPhone:   phone,
          company,
          location,
          website:       website || undefined,
          callType,
          date:          humanDate,
          time:          humanTime,
          slotIso:       startDate.toISOString(),
          durationMinutes: duration,
          zoomJoinUrl:   zoom?.joinUrl   || undefined,
          zoomMeetingId: zoom?.meetingId || undefined,
        }),
      });
    } catch (err) {
      // Non-fatal — booking is still confirmed, Zoom still created, emails sent
      console.error("Failed to save booking to outreach centre:", err);
    }
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

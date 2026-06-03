// app/api/book/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createCalendarEvent } from "@/lib/google-calendar";
import { createZoomMeeting } from "@/lib/zoom";
import { sendClientConfirmation, sendOwnerNotification } from "@/lib/emails";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const maxDuration = 30;
const TZ = "Europe/London";

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const { name, email, phone, company, location, website, callType, date, time, webhookUrl } = body;
  if (!name || !email || !phone || !company || !date || !time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Parse the date+time into a proper Date
  const [year, month, day] = (date as string).split("-").map(Number);
  const [hour, minute] = (time as string).split(":").map(Number);
  const startDate = new Date(year, month - 1, day, hour, minute, 0, 0);

  const localDate = toZonedTime(startDate, TZ);
  const humanDate = format(localDate, "EEEE d MMMM yyyy");
  const humanTime = format(localDate, "h:mm a");
  const isVideo = callType === "video";
  const duration = isVideo ? 30 : 15;

  // 1. Zoom
  let zoom = null;
  if (isVideo) {
    zoom = await createZoomMeeting({ topic: `Level One — ${name} (${company})`, startTime: startDate, durationMinutes: duration });
  }

  // 2. Google Calendar
  await createCalendarEvent({
    summary: `${isVideo ? "📹" : "📞"} ${name} — ${company}`,
    description: `Company: ${company}\nLocation: ${location}${website ? `\nWebsite: ${website}` : ""}`,
    start: startDate, durationMinutes: duration,
    attendeeEmail: email, attendeeName: name,
    zoomJoinUrl: zoom?.joinUrl, zoomMeetingId: zoom?.meetingId,
    isPhoneCall: !isVideo, attendeePhone: phone,
  });

  // 3. Emails
  const ep = { clientName: name, clientEmail: email, clientPhone: phone, company, location, website, callType, date: humanDate, time: humanTime, durationMinutes: duration, zoomJoinUrl: zoom?.joinUrl, zoomMeetingId: zoom?.meetingId, zoomPassword: zoom?.password };
  await Promise.all([sendClientConfirmation(ep), sendOwnerNotification(ep)]);

  // 4. Make.com webhook (original behaviour preserved)
  const hookUrl = webhookUrl || process.env.MAKE_WEBHOOK_URL;
  if (hookUrl) {
    try {
      await fetch(hookUrl, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, company, location, website: website || "", kickoffDate: date, kickoffTime: time, callType, callBooking: "Website", zoomJoinUrl: zoom?.joinUrl ?? "", timestamp: new Date().toISOString() }),
      });
    } catch { /* webhook failure is non-fatal */ }
  }

  return NextResponse.json({ success: true, date: humanDate, time: humanTime, callType, zoomJoinUrl: zoom?.joinUrl ?? null, zoomMeetingId: zoom?.meetingId ?? null });
}

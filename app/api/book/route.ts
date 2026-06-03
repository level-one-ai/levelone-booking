// app/api/book/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createCalendarEvent } from "@/lib/google-calendar";
import { sendClientConfirmation, sendOwnerNotification } from "@/lib/emails";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const maxDuration = 30;
const TZ = "Europe/London";

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const { name, email, phone, company, location, website, callType, date, time } = body;
  if (!name || !email || !phone || !company || !date || !time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [year, month, day] = (date as string).split("-").map(Number);
  const [hour, minute]     = (time as string).split(":").map(Number);
  const startDate  = new Date(year, month - 1, day, hour, minute, 0, 0);
  const localDate  = toZonedTime(startDate, TZ);
  const humanDate  = format(localDate, "EEEE d MMMM yyyy");
  const humanTime  = format(localDate, "h:mm a");
  const isVideo    = callType === "video";
  const duration   = isVideo ? 30 : 15;

  // Create Google Calendar event — Meet link generated automatically for video calls
  const { eventId, meetLink } = await createCalendarEvent({
    summary:        `${name} — ${company}`,
    description:    `Company: ${company}\nLocation: ${location}${website ? `\nWebsite: ${website}` : ""}`,
    start:          startDate,
    durationMinutes: duration,
    attendeeEmail:  email,
    attendeeName:   name,
    isPhoneCall:    !isVideo,
    attendeePhone:  phone,
    addMeet:        isVideo, // attach a Meet room only for video calls
  });

  // Send confirmation emails
  const ep = {
    clientName: name, clientEmail: email, clientPhone: phone,
    company, location, website, callType, date: humanDate, time: humanTime,
    durationMinutes: duration, meetLink: meetLink ?? undefined,
  };
  await Promise.all([sendClientConfirmation(ep), sendOwnerNotification(ep)]);

  return NextResponse.json({
    success: true,
    date:     humanDate,
    time:     humanTime,
    callType,
    meetLink: meetLink ?? null,
    eventId:  eventId  ?? null,
  });
}

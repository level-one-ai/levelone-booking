// lib/google-calendar.ts
import { google } from "googleapis";

export const TIMEZONE = "Europe/London";
export const LOOKAHEAD_DAYS = 60;

// Mon–Sun 09:00–17:00
export const AVAILABILITY: Record<number, { start: number; end: number }> = {
  0: { start: 9, end: 17 }, 1: { start: 9, end: 17 }, 2: { start: 9, end: 17 },
  3: { start: 9, end: 17 }, 4: { start: 9, end: 17 }, 5: { start: 9, end: 17 },
  6: { start: 9, end: 17 },
};

function getCalendar() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key   = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) return null;
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: key },
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  return google.calendar({ version: "v3", auth });
}

export async function getBusySlots(from: Date, to: Date): Promise<{ start: string; end: string }[]> {
  const calendar = getCalendar();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  if (!calendar) return [];
  try {
    const res = await calendar.freebusy.query({
      requestBody: { timeMin: from.toISOString(), timeMax: to.toISOString(), timeZone: TIMEZONE, items: [{ id: calendarId }] },
    });
    return (res.data.calendars?.[calendarId]?.busy ?? []) as { start: string; end: string }[];
  } catch { return []; }
}

export interface BookingDetails {
  summary: string; description: string; start: Date; durationMinutes: number;
  attendeeEmail: string; attendeeName: string; zoomJoinUrl?: string;
  zoomMeetingId?: string; isPhoneCall: boolean; attendeePhone?: string;
}

export async function createCalendarEvent(details: BookingDetails): Promise<string | null> {
  const calendar = getCalendar();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  if (!calendar) return null;
  const end = new Date(details.start.getTime() + details.durationMinutes * 60 * 1000);
  const desc = [
    details.description, "",
    `Client: ${details.attendeeName}`, `Email: ${details.attendeeEmail}`,
    details.attendeePhone ? `Phone: ${details.attendeePhone}` : null,
    details.isPhoneCall ? `Call type: Phone call` : `Call type: Video call via Zoom`,
    details.zoomJoinUrl ? `Zoom link: ${details.zoomJoinUrl}` : null,
    details.zoomMeetingId ? `Zoom ID: ${details.zoomMeetingId}` : null,
  ].filter(Boolean).join("\n");
  try {
    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: details.summary, description: desc,
        start: { dateTime: details.start.toISOString(), timeZone: TIMEZONE },
        end: { dateTime: end.toISOString(), timeZone: TIMEZONE },
        attendees: [{ email: details.attendeeEmail }],
        reminders: { useDefault: false, overrides: [{ method: "email", minutes: 60 }, { method: "popup", minutes: 15 }] },
      },
    });
    return event.data.id ?? null;
  } catch { return null; }
}

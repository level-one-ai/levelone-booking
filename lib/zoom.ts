// lib/zoom.ts
export interface ZoomMeeting { joinUrl: string; meetingId: string; password: string; startUrl: string; }

async function getToken(): Promise<string | null> {
  const id = process.env.ZOOM_ACCOUNT_ID, ci = process.env.ZOOM_CLIENT_ID, cs = process.env.ZOOM_CLIENT_SECRET;
  if (!id || !ci || !cs) return null;
  const creds = Buffer.from(`${ci}:${cs}`).toString("base64");
  try {
    const r = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${id}`, {
      method: "POST", headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" },
    });
    if (!r.ok) return null;
    return (await r.json()).access_token ?? null;
  } catch { return null; }
}

export async function createZoomMeeting(p: { topic: string; startTime: Date; durationMinutes: number; agenda?: string }): Promise<ZoomMeeting | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    const r = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ topic: p.topic, type: 2, start_time: p.startTime.toISOString(), duration: p.durationMinutes, timezone: "Europe/London", agenda: p.agenda ?? "", settings: { host_video: true, participant_video: true, waiting_room: true } }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    return { joinUrl: d.join_url, meetingId: String(d.id), password: d.password ?? "", startUrl: d.start_url };
  } catch { return null; }
}

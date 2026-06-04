// lib/emails.ts
import { Resend } from "resend";
function r() { const k = process.env.RESEND_API_KEY; return k ? new Resend(k) : null; }
const from       = () => process.env.RESEND_FROM_EMAIL || "bookings@levelone.io";
const ownerEmail = () => process.env.OWNER_EMAIL  || "";
const ownerName  = () => process.env.OWNER_NAME   || "Dean Finlayson";

export interface BookingEmailParams {
  clientName: string; clientEmail: string; clientPhone: string;
  company: string; location: string; website?: string;
  callType: "phone" | "video";
  date: string; time: string; durationMinutes: number;
  zoomJoinUrl?: string; zoomMeetingId?: string; zoomPassword?: string;
}

export async function sendClientConfirmation(p: BookingEmailParams) {
  const resend = r(); if (!resend) return;
  const isVideo = p.callType === "video";
  await resend.emails.send({
    from: from(), to: p.clientEmail,
    subject: `Your call with ${ownerName()} is confirmed — ${p.date} at ${p.time}`,
    html: `<div style="font-family:sans-serif;background:#1a1a1a;padding:30px;border-radius:12px;max-width:520px;margin:0 auto">
<div style="background:linear-gradient(135deg,#ff8c00,#ff7700);padding:20px;border-radius:8px;margin-bottom:20px;text-align:center">
<h1 style="color:#fff;margin:0;font-size:20px">You're booked in ✓</h1>
<p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px">Level One — ${isVideo ? "Video Call (Zoom)" : "Phone Call"}</p></div>
<table style="width:100%;border-collapse:collapse">
${[["Date",p.date],["Time",`${p.time} (London)`],["Duration",`${p.durationMinutes} minutes`],["Type",isVideo?"Video call (Zoom)":"Phone call"]].map(([l,v])=>`<tr><td style="padding:8px;color:#999;font-size:13px">${l}</td><td style="padding:8px;color:#fff;font-size:13px;text-align:right">${v}</td></tr>`).join("")}
</table>
${isVideo && p.zoomJoinUrl ? `
<div style="margin-top:16px;background:#1e2d4a;border:1px solid #2d4a7a;border-radius:8px;padding:16px;text-align:center">
  <p style="color:#93bbf5;font-size:12px;margin:0 0 10px;font-weight:600">ZOOM MEETING LINK</p>
  <a href="${p.zoomJoinUrl}" style="display:inline-block;background:#2D8CFF;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">Join Zoom Meeting</a>
  ${p.zoomMeetingId ? `<p style="color:#888;font-size:11px;margin:10px 0 0">Meeting ID: ${p.zoomMeetingId}${p.zoomPassword ? ` · Password: ${p.zoomPassword}` : ""}</p>` : ""}
</div>` : ""}
${!isVideo ? `<div style="background:#222;border-radius:8px;padding:12px;margin-top:16px;color:#ccc;font-size:13px">${ownerName()} will call you at <strong style="color:#fff">${p.clientPhone}</strong> at the scheduled time.</div>` : ""}
<p style="color:#666;font-size:12px;text-align:center;margin-top:20px">Questions? Reply to this email.</p></div>`,
  });
}

export async function sendOwnerNotification(p: BookingEmailParams) {
  const resend = r(); const to = ownerEmail(); if (!resend || !to) return;
  await resend.emails.send({
    from: from(), to,
    subject: `New booking: ${p.clientName} — ${p.date} at ${p.time}`,
    html: `<div style="font-family:sans-serif;background:#1a1a1a;padding:24px;border-radius:12px;max-width:480px">
<h2 style="color:#ff8c00;margin:0 0 16px">New booking</h2>
<table style="width:100%;border-collapse:collapse">
${([ ["Client",p.clientName],["Company",p.company],["Email",p.clientEmail],["Phone",p.clientPhone],["Location",p.location],p.website?["Website",p.website]:null,["Date",p.date],["Time",p.time],["Duration",`${p.durationMinutes} min`],["Type",p.callType==="video"?"Video call (Zoom)":"Phone call"] ] as (string[]|null)[]).filter((x): x is string[] => x !== null).map(([l,v])=>`<tr><td style="padding:7px;color:#888;font-size:13px">${l}</td><td style="padding:7px;color:#fff;font-size:13px">${v}</td></tr>`).join("")}
</table>
${p.zoomJoinUrl ? `
<div style="margin-top:16px;background:#1e2d4a;border:1px solid #2d4a7a;border-radius:8px;padding:14px;text-align:center">
  <a href="${p.zoomJoinUrl}" style="display:inline-block;background:#2D8CFF;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:600;font-size:13px">Join Zoom</a>
</div>` : ""}
</div>`,
  });
}

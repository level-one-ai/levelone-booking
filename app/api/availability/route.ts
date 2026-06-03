// app/api/availability/route.ts
import { NextResponse } from "next/server";
import { getBusySlots, AVAILABILITY, LOOKAHEAD_DAYS, TIMEZONE } from "@/lib/google-calendar";

export const maxDuration = 15;

export async function GET() {
  const now = new Date();
  const from = new Date(now); from.setDate(from.getDate() + 1); from.setHours(0,0,0,0);
  const to = new Date(from); to.setDate(to.getDate() + LOOKAHEAD_DAYS);

  const busy = await getBusySlots(from, to);
  const busyRanges = busy.map(b => ({ start: new Date(b.start).getTime(), end: new Date(b.end).getTime() }));

  function isFree(s: Date, mins: number): boolean {
    const st = s.getTime(), e = st + mins * 60000;
    return !busyRanges.some(b => st < b.end && e > b.start);
  }

  const busyDates: string[] = [];
  for (let d = 0; d < LOOKAHEAD_DAYS; d++) {
    const day = new Date(from); day.setDate(from.getDate() + d);
    const dow = day.getDay();
    const avail = AVAILABILITY[dow];
    if (!avail) continue;
    let hasAny = false;
    for (let h = avail.start; h < avail.end; h++) {
      for (const m of [0, 30]) {
        const slot = new Date(day); slot.setHours(h, m, 0, 0);
        if (slot > now && isFree(slot, 15)) { hasAny = true; break; }
      }
      if (hasAny) break;
    }
    if (!hasAny) {
      const dateStr = day.toISOString().slice(0, 10);
      busyDates.push(dateStr);
    }
  }

  return NextResponse.json({ busyDates });
}

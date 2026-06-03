"use client";

import * as React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "form" | "calendar" | "confirm" | "thankyou";
type CallType = "video" | "phone";

interface FormData {
  name: string; email: string; phone: string;
  company: string; location: string; website: string;
}

interface ConfirmData {
  date: string; time: string; callType: CallType;
  meetLink?: string;
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

const LOGO_URL = "https://github.com/level-one-ai/Level-One.Website-/blob/main/images/Whisk_krwz0utmjzjyjbtotqwywgtlxedo00smhjdmtqm%20(1).png?raw=true";

function HexLogo({ size = 140 }: { size?: number }) {
  const inner = size * 0.957;
  const h = size * 1.154;
  const hi = inner * 1.154;
  return (
    <div style={{ width: size, height: h, position: "relative" }}>
      <div style={{
        width: size, height: h,
        background: "#000",
        clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 12px rgba(255,255,255,0.1)",
      }}>
        <div style={{
          width: inner, height: hi,
          background: "white",
          clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_URL} alt="Level One" style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.05) translateX(-3px)" }} />
        </div>
      </div>
    </div>
  );
}

// ─── Shared panel style ───────────────────────────────────────────────────────

const PANEL: React.CSSProperties = {
  background: "linear-gradient(145deg,#1e1e1e,#161616)",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.05),0 0 40px rgba(255,140,0,0.05)",
};

const INSET: React.CSSProperties = {
  background: "linear-gradient(145deg,#0d0d0d,#080808)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.02)",
};

const ORANGE_BTN: React.CSSProperties = {
  background: "linear-gradient(135deg,#ff8c00,#ff7700)",
  color: "white", border: "none", borderRadius: 10,
  cursor: "pointer", fontWeight: 600, letterSpacing: "0.5px",
  textTransform: "uppercase" as const,
  boxShadow: "0 4px 12px rgba(255,140,0,0.3)",
  transition: "all 0.3s ease",
};

// ─── InfoItem (left panel row) ────────────────────────────────────────────────

function InfoItem({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <div style={{ ...INSET, padding: "8px 12px", display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%", background: "#ff8c00", flexShrink: 0,
        animation: `blink 2s ease-in-out ${delay}s infinite`,
      }} />
      <span style={{ fontSize: 11, color: "#fff", flex: 1, wordBreak: "break-word" }}>{text}</span>
    </div>
  );
}

// ─── STEP 1 — Form ────────────────────────────────────────────────────────────

function FormStep({ onNext }: { onNext: (data: FormData, ct: CallType) => void }) {
  const [form, setForm] = React.useState<FormData>({ name: "", email: "", phone: "", company: "", location: "", website: "" });
  const [callType, setCallType] = React.useState<CallType>("video");

  const valid = form.name && form.email && form.phone && form.company && form.location;

  function upd(k: keyof FormData, v: string) { setForm(p => ({ ...p, [k]: v })); }

  const inputStyle: React.CSSProperties = {
    ...INSET, width: "100%", padding: "11px 14px",
    color: "#fff", fontSize: 14, outline: "none",
    transition: "all 0.3s ease",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", color: "#fff", fontSize: 11, fontWeight: 600,
    marginBottom: 6, letterSpacing: "0.3px", textTransform: "uppercase",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 240px", gap: 20, maxWidth: 1050, width: "100%", height: 560 }}
      className="booking-grid">
      {/* Left — logo */}
      <div style={{ ...PANEL, padding: 18, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }} className="side-panel">
        <HexLogo size={140} />
      </div>

      {/* Centre — form */}
      <div style={{ ...PANEL, padding: "30px 35px", display: "flex", flexDirection: "column" }}>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 600, textAlign: "center", letterSpacing: "-0.5px", marginBottom: 4 }}>
          Client Information
        </h1>
        <p style={{ color: "#999", fontSize: 13, textAlign: "center", marginBottom: 14 }}>
          Fill out your details to schedule your kickoff call
        </p>

        {/* Call type selector */}
        <div style={{ marginBottom: 12 }}>
          <span style={{ ...labelStyle, marginBottom: 8, display: "block" }}>Call Type</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {(["video", "phone"] as CallType[]).map(ct => (
              <button key={ct} onClick={() => setCallType(ct)} style={{
                ...INSET,
                padding: "10px 14px", cursor: "pointer", textAlign: "left",
                borderRadius: 8, transition: "all 0.2s",
                border: callType === ct ? "1px solid #ff8c00" : "1px solid rgba(255,255,255,0.06)",
                background: callType === ct ? "linear-gradient(145deg,#1a0e00,#120a00)" : "linear-gradient(145deg,#0d0d0d,#080808)",
                boxShadow: callType === ct ? "0 0 12px rgba(255,140,0,0.2),inset 0 1px 0 rgba(255,255,255,0.02)" : undefined,
              }}>
                <div style={{ color: callType === ct ? "#ff8c00" : "#fff", fontSize: 12, fontWeight: 600 }}>
                  {ct === "video" ? "Video Call" : "Phone Call"}
                </div>
                <div style={{ color: "#777", fontSize: 10, marginTop: 2 }}>
                  {ct === "video" ? "30 min · Google Meet" : "15 min · Phone"}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={labelStyle}>Name</label>
          <input value={form.name} onChange={e => upd("name", e.target.value)} style={inputStyle} placeholder="Enter your full name" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={form.email} onChange={e => upd("email", e.target.value)} style={inputStyle} placeholder="your@email.com" />
          </div>
          <div>
            <label style={labelStyle}>Phone Number</label>
            <input type="tel" value={form.phone} onChange={e => upd("phone", e.target.value)} style={inputStyle} placeholder="07911 123456" />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
          <div>
            <label style={labelStyle}>Company Name</label>
            <input value={form.company} onChange={e => upd("company", e.target.value)} style={inputStyle} placeholder="Your company" />
          </div>
          <div>
            <label style={labelStyle}>Location</label>
            <input value={form.location} onChange={e => upd("location", e.target.value)} style={inputStyle} placeholder="City, Country" />
          </div>
        </div>

        <div>
          <label style={{ ...labelStyle }}>
            Website <span style={{ color: "#888", fontWeight: 400, fontSize: 10, textTransform: "lowercase" }}>(optional)</span>
          </label>
          <input type="url" value={form.website} onChange={e => upd("website", e.target.value)} style={inputStyle} placeholder="https://example.com" />
        </div>
      </div>

      {/* Right — next button */}
      <div style={{ ...PANEL, padding: 18, display: "flex", alignItems: "center", justifyContent: "center" }} className="side-panel">
        <button
          disabled={!valid}
          onClick={() => onNext(form, callType)}
          style={{
            ...ORANGE_BTN, padding: "16px 32px", width: "100%", maxWidth: 150, fontSize: 13,
            opacity: valid ? 1 : 0.4,
            cursor: valid ? "pointer" : "not-allowed",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ─── STEP 2 — Calendar ────────────────────────────────────────────────────────

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const TIMES = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"];
const TIME_LABELS: Record<string, string> = {
  "09:00":"9:00am","09:30":"9:30am","10:00":"10:00am","10:30":"10:30am","11:00":"11:00am","11:30":"11:30am",
  "12:00":"12:00pm","12:30":"12:30pm","13:00":"1:00pm","13:30":"1:30pm","14:00":"2:00pm","14:30":"2:30pm",
  "15:00":"3:00pm","15:30":"3:30pm","16:00":"4:00pm","16:30":"4:30pm","17:00":"5:00pm",
};

function CalendarStep({
  form, callType, onConfirm,
}: {
  form: FormData; callType: CallType;
  onConfirm: (date: string, time: string, meetLink?: string) => void;
}) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [current, setCurrent] = React.useState(new Date(today));
  const [selDate, setSelDate] = React.useState<Date | null>(null);
  const [selTime, setSelTime] = React.useState<string>("");
  const [busyDates, setBusyDates] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    fetch("/api/availability").then(r => r.json()).then(d => setBusyDates(d.busyDates ?? [])).catch(() => {});
  }, []);

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1);
  const startCell = new Date(firstDay); startCell.setDate(startCell.getDate() - firstDay.getDay());

  function isBusy(d: Date) {
    return busyDates.includes(d.toISOString().slice(0,10));
  }

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(startCell); d.setDate(startCell.getDate() + i);
    const inMonth = d.getMonth() === month;
    const isPast  = d < today;
    const isToday = d.toDateString() === today.toDateString();
    const isSel   = selDate?.toDateString() === d.toDateString();
    const busy    = isBusy(d);
    const disabled = !inMonth || isPast || busy;

    cells.push(
      <div key={i} onClick={disabled ? undefined : () => { setSelDate(d); setSelTime(""); }}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          color: disabled ? "#555" : "#fff",
          border: isToday ? "2px solid #ff8c00" : "1px solid rgba(255,255,255,0.06)",
          background: isSel
            ? "linear-gradient(135deg,#ff8c00,#ff7700)"
            : "linear-gradient(145deg,#0d0d0d,#080808)",
          boxShadow: isSel
            ? "0 4px 12px rgba(255,140,0,0.4),0 0 20px rgba(255,140,0,0.2)"
            : isToday ? "0 2px 8px rgba(0,0,0,0.4),0 0 20px rgba(255,140,0,0.15)"
            : "0 2px 8px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.02)",
        }}
        className={disabled ? "" : "cal-hover"}
      >
        {d.getDate()}
      </div>
    );
  }

  const selectedDateStr = selDate
    ? selDate.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" })
    : "Select a date";

  async function handleConfirm() {
    if (!selDate || !selTime) return;
    setSubmitting(true); setError("");
    const dateStr = selDate.toISOString().slice(0,10);
    try {
      const r = await fetch("/api/book", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form, callType, date: dateStr, time: selTime,
          webhookUrl: process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL || "",
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Booking failed");
      onConfirm(data.date || selectedDateStr, selTime, data.meetLink ?? undefined);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally { setSubmitting(false); }
  }

  const infoItems = [
    form.name, form.email, form.phone, form.company, form.location,
    ...(form.website ? [form.website] : []),
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 240px", gap: 20, maxWidth: 1050, width: "100%", height: 560 }}
      className="booking-grid">
      {/* Left — client info — no scroll, fixed height */}
      <div style={{ ...PANEL, padding: 18, display: "flex", flexDirection: "column", gap: 8, overflow: "hidden", height: "100%" }} className="side-panel">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
          <HexLogo size={100} />
        </div>
        {infoItems.map((t, i) => <InfoItem key={i} text={t} delay={i * 0.3} />)}
        <div style={{ ...INSET, padding: "8px 12px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: callType === "video" ? "#2D8CFF" : "#22c55e", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "#fff" }}>{callType === "video" ? "Video Call (30 min)" : "Phone Call (15 min)"}</span>
        </div>
      </div>

      {/* Centre — calendar — no scroll at all */}
      <div style={{ ...PANEL, padding: "14px 14px 10px", display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h2 style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>{MONTHS[month]} {year}</h2>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { id: "prev", label: "‹", onClick: () => setCurrent(p => { const n = new Date(p); n.setMonth(n.getMonth()-1); return n; }) },
              { id: "next", label: "›", onClick: () => setCurrent(p => { const n = new Date(p); n.setMonth(n.getMonth()+1); return n; }) },
            ].map(b => (
              <button key={b.id} onClick={b.onClick} style={{
                ...INSET, color: "white", width: 32, height: 32, borderRadius: 8,
                cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }} className="nav-hover">
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Weekday labels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
          {DAYS.map(d => <div key={d} style={{ textAlign: "center", color: "#999", fontSize: 9, fontWeight: 600, padding: "3px 0" }}>{d}</div>)}
        </div>

        {/* Day cells — flex:1 so they fill all remaining height */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, flex: 1 }}>
          {cells}
        </div>
      </div>

      {/* Right — time slots — ONLY this panel scrolls */}
      <div style={{ ...PANEL, padding: 18, display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
        {/* Sticky header */}
        <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, textAlign: "center", marginBottom: 10, flexShrink: 0 }}>
          {selectedDateStr}
        </div>
        {/* Scrollable slot list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7, overflowY: "auto", flex: 1 }}>
          {TIMES.map(t => (
            <div key={t} onClick={() => selDate && setSelTime(t)}
              style={{
                ...INSET, padding: "7px 8px", textAlign: "center", cursor: selDate ? "pointer" : "not-allowed",
                fontSize: 12, color: "#fff", transition: "all 0.2s", borderRadius: 8,
                opacity: !selDate ? 0.4 : 1,
                background: selTime === t ? "linear-gradient(135deg,#ff8c00,#ff7700)" : "linear-gradient(145deg,#0d0d0d,#080808)",
                border: selTime === t ? "1px solid #ff8c00" : "1px solid rgba(255,255,255,0.06)",
                boxShadow: selTime === t ? "0 4px 12px rgba(255,140,0,0.4),0 0 20px rgba(255,140,0,0.2)" : undefined,
                flexShrink: 0,
              }}
              className={selDate ? "slot-hover" : ""}
            >
              {TIME_LABELS[t]}
            </div>
          ))}
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: 11, textAlign: "center", marginTop: 6, flexShrink: 0 }}>{error}</p>}
        {/* Confirm button — always visible at bottom */}
        <button
          disabled={!selDate || !selTime || submitting}
          onClick={handleConfirm}
          style={{
            ...ORANGE_BTN, padding: "11px 24px", width: "100%", fontSize: 14,
            marginTop: 10, borderRadius: 8, flexShrink: 0,
            opacity: (!selDate || !selTime || submitting) ? 0.4 : 1,
            cursor: (!selDate || !selTime || submitting) ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Booking…" : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}

// ─── STEP 3 — Confirmation modal ──────────────────────────────────────────────

function ConfirmModal({ name, email, date, time, callType, meetLink, onFinish }: {
  name: string; email: string; date: string; time: string;
  callType: CallType; meetLink?: string; onFinish: () => void;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }}>
      <div style={{
        ...PANEL, padding: 30, maxWidth: 500, width: "90%",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.05),0 0 60px rgba(255,140,0,0.15)",
      }} className="modal-enter">
        <h2 style={{ color: "#ff8c00", fontSize: 20, fontWeight: 600, textAlign: "center", marginBottom: 20 }}>
          {callType === "video" ? "Video Call Confirmed" : "Phone Call Confirmed"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {[["Name", name], ["Email", email], ["Date", date], ["Time", time], ["Type", callType === "video" ? "Video Call (Google Meet) · 30 min" : "Phone Call · 15 min"]].map(([l,v]) => (
            <div key={l} style={{ ...INSET, padding: "10px 15px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#999", fontSize: 13, fontWeight: 600 }}>{l}:</span>
              <span style={{ color: "#fff", fontSize: 13, textAlign: "right" }}>{v}</span>
            </div>
          ))}
          {callType === "video" && meetLink && (
            <a href={meetLink} target="_blank" rel="noreferrer" style={{
              display: "block", background: "#1a73e8", color: "#fff", textDecoration: "none",
              padding: "10px 15px", borderRadius: 8, textAlign: "center", fontWeight: 600, fontSize: 13,
            }}>
              Join Google Meet →
            </a>
          )}
        </div>
        <button onClick={onFinish} style={{ ...ORANGE_BTN, width: "100%", padding: 14, fontSize: 16, borderRadius: 8 }}>
          Finish
        </button>
      </div>
    </div>
  );
}

// ─── STEP 4 — Thank you ───────────────────────────────────────────────────────

function ThankYou() {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", maxWidth: 500, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 25 }}>
        <HexLogo size={140} />
      </div>
      <h2 style={{ color: "#ff8c00", fontSize: 28, fontWeight: 600, marginBottom: 20 }}>Thank You!</h2>
      <p style={{ color: "#fff", fontSize: 16, lineHeight: 1.6, marginBottom: 15 }}>
        We're excited to begin this journey with you! Your kickoff call is confirmed and we can't wait to dive into your project.
      </p>
      <p style={{ color: "#999", fontSize: 14, lineHeight: 1.6, fontStyle: "italic" }}>
        You will receive a calendar invitation and email confirmation shortly. We'll send you a reminder before your scheduled kickoff time.
      </p>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function BookPage() {
  const [step, setStep] = React.useState<Step>("form");
  const [formData, setFormData] = React.useState<FormData>({ name:"",email:"",phone:"",company:"",location:"",website:"" });
  const [callType, setCallType] = React.useState<CallType>("video");
  const [confirm, setConfirm] = React.useState<ConfirmData | null>(null);

  return (
    <>
      <style>{`
        .booking-grid { transition: opacity 0.2s; }
        .cal-hover:hover { background: linear-gradient(135deg,#ff8c00,#ff7700) !important; border-color: #ff8c00 !important; box-shadow: 0 4px 12px rgba(255,140,0,0.4),0 0 20px rgba(255,140,0,0.2) !important; }
        .nav-hover:hover { background: linear-gradient(135deg,#ff8c00,#ff7700) !important; border-color: #ff8c00 !important; box-shadow: 0 4px 12px rgba(255,140,0,0.4),0 0 20px rgba(255,140,0,0.2) !important; }
        .slot-hover:hover { background: linear-gradient(135deg,#ff8c00,#ff7700) !important; border-color: #ff8c00 !important; color: white !important; box-shadow: 0 4px 12px rgba(255,140,0,0.4),0 0 20px rgba(255,140,0,0.2) !important; }
        @media (max-width: 900px) {
          .booking-grid { grid-template-columns: 1fr !important; height: auto !important; max-height: none !important; }
          .side-panel { display: none !important; }
        }
        @media (max-width: 768px) {
          body { padding: 10px !important; }
        }
      `}</style>

      {step === "form" && (
        <FormStep onNext={(data, ct) => { setFormData(data); setCallType(ct); setStep("calendar"); }} />
      )}

      {step === "calendar" && (
        <CalendarStep
          form={formData}
          callType={callType}
          onConfirm={(date, time, meetLink) => {
            setConfirm({ date, time, callType, meetLink });
            setStep("confirm");
          }}
        />
      )}

      {step === "confirm" && confirm && (
        <>
          <CalendarStep
            form={formData}
            callType={callType}
            onConfirm={() => {}}
          />
          <ConfirmModal
            name={formData.name}
            email={formData.email}
            date={confirm.date}
            time={confirm.time}
            callType={confirm.callType}
            meetLink={confirm.meetLink}
            onFinish={() => setStep("thankyou")}
          />
        </>
      )}

      {step === "thankyou" && <ThankYou />}
    </>
  );
}

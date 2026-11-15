/**
 * Save The Date — generate kalender (.ics) dan link Google Calendar
 * agar tamu bisa langsung menyimpan ke HP/laptop mereka.
 */

function pad(n: number) { return String(n).padStart(2, "0"); }

/** Format ISO date ke UTC compact: 20260614T010000Z */
function toICS(iso: string): string {
  const d = new Date(iso);
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    "00Z"
  );
}

/** Format untuk Google Calendar: 20260614T080000 */
function toGCal(iso: string): string {
  const d = new Date(iso);
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    "00"
  );
}

export function buildICSContent(opts: {
  title: string;
  location: string;
  description: string;
  startISO: string;
  durationHours?: number;
}): string {
  const start = toICS(opts.startISO);
  const endDate = new Date(opts.startISO);
  endDate.setHours(endDate.getHours() + (opts.durationHours ?? 3));
  const end = toICS(endDate.toISOString());
  const uid = `wedding-${Date.now()}@undangan`;
  const now = toICS(new Date().toISOString());

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${opts.title}`,
    `DESCRIPTION:${opts.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${opts.location}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadICS(opts: {
  title: string;
  location: string;
  description: string;
  startISO: string;
  durationHours?: number;
  filename?: string;
}) {
  const ics = buildICSContent(opts);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (opts.filename ?? "save-the-date") + ".ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

export function buildGoogleCalendarUrl(opts: {
  title: string;
  location: string;
  description: string;
  startISO: string;
  durationHours?: number;
}): string {
  const start = toGCal(opts.startISO);
  const endDate = new Date(opts.startISO);
  endDate.setHours(endDate.getHours() + (opts.durationHours ?? 3));
  const end = toGCal(endDate.toISOString());

  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${start}/${end}`,
    details: opts.description,
    location: opts.location,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

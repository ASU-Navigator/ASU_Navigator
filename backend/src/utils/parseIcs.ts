import ICAL from "ical.js";

export type ParsedEvent = {
  uid: string;
  summary: string;
  location: string;
  start: Date;
  end: Date;
  isRecurring: boolean;
};

export function parseIcsContent(rawIcs: string): ParsedEvent[] {
  const jcal = ICAL.parse(rawIcs);
  const comp = new ICAL.Component(jcal);
  const vevents = comp.getAllSubcomponents("vevent");

  const events: ParsedEvent[] = [];
  const endOfYear = new Date(new Date().getFullYear(), 11, 31);

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);

    if (event.isRecurring()) {
      const iter = event.iterator();
      let next = iter.next();
      while (next) {
        const startDate = next.toJSDate();
        if (startDate > endOfYear) break;
        const durationMs = event.duration.toSeconds() * 1000;
        const endDate = new Date(startDate.getTime() + durationMs);
        events.push({
          uid: `${event.uid}-${startDate.toISOString()}`,
          summary: event.summary ?? "Unknown Class",
          location: event.location ?? "",
          start: startDate,
          end: endDate,
          isRecurring: true,
        });
        next = iter.next();
      }
    } else {
      events.push({
        uid: event.uid,
        summary: event.summary ?? "Unknown Class",
        location: event.location ?? "",
        start: event.startDate.toJSDate(),
        end: event.endDate.toJSDate(),
        isRecurring: false,
      });
    }
  }

  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}

// Arizona is UTC-7 with no DST. Midnight Arizona = 07:00 UTC.
const ARIZONA_UTC_HOUR = 7;

export function filterEventsForDate(events: ParsedEvent[], date: Date): ParsedEvent[] {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const dayStart = Date.UTC(y, m, d, ARIZONA_UTC_HOUR, 0, 0);
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;
  return events.filter((e) => {
    const t = e.start.getTime();
    return t >= dayStart && t < dayEnd;
  });
}

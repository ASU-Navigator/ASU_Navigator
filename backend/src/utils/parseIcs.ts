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

export function filterEventsForDate(events: ParsedEvent[], date: Date): ParsedEvent[] {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  return events.filter((e) => {
    const s = e.start;
    return s.getFullYear() === y && s.getMonth() === m && s.getDate() === d;
  });
}

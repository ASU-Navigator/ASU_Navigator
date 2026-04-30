import ICAL from "ical.js";

export type ParsedEvent = {
  uid: string;
  summary: string;
  location: string;
  start: Date;
  end: Date;
  isRecurring: boolean;
  daysOfWeek: string[];
};

const ARIZONA_UTC_HOUR = 7;
const WEEKDAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function toArizonaLocal(date: Date): Date {
  return new Date(date.getTime() - ARIZONA_UTC_HOUR * 60 * 60 * 1000);
}

function fromArizonaLocal(localDate: Date): Date {
  return new Date(localDate.getTime() + ARIZONA_UTC_HOUR * 60 * 60 * 1000);
}

function getArizonaWeekdayCode(date: Date): string {
  return WEEKDAY_CODES[date.getUTCDay()];
}

function getRecurrenceDays(rrule: unknown): string[] {
  if (!rrule || typeof rrule !== "object") return [];
  const maybeByday = (rrule as any).byday ?? (rrule as any).parts?.BYDAY;
  if (!maybeByday) return [];
  return Array.isArray(maybeByday) ? maybeByday : [maybeByday];
}

function getRecurrenceUntil(rrule: unknown, fallback: Date): Date {
  if (!rrule || typeof rrule !== "object") return fallback;
  const until = (rrule as any).until;
  if (!until || typeof until.toJSDate !== "function") return fallback;
  return until.toJSDate();
}

function getRecurrenceExdates(component: ICAL.Component): Set<number> {
  const exdateTimestamps = new Set<number>();
  const exdateProperties = component.getAllProperties("exdate");
  for (const prop of exdateProperties) {
    const values = prop.getValues();
    const entries = Array.isArray(values) ? values : [values];
    for (const entry of entries) {
      if (entry && typeof entry.toJSDate === "function") {
        exdateTimestamps.add(entry.toJSDate().getTime());
      }
    }
  }
  return exdateTimestamps;
}

export function parseIcsContent(rawIcs: string): ParsedEvent[] {
  const jcal = ICAL.parse(rawIcs);
  const comp = new ICAL.Component(jcal);
  const vevents = comp.getAllSubcomponents("vevent");

  const events: ParsedEvent[] = [];
  const endOfYear = new Date(new Date().getFullYear(), 11, 31);

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);

    if (event.isRecurring()) {
      const rrule = event.component.getFirstPropertyValue('rrule');
      const daysOfWeek = getRecurrenceDays(rrule);
      const exdates = getRecurrenceExdates(event.component);
      const untilDate = getRecurrenceUntil(rrule, endOfYear);
      const startUtc = event.startDate.toJSDate();
      const durationMs = event.duration.toSeconds() * 1000;

      if (daysOfWeek.length > 0) {
        const initialLocal = toArizonaLocal(startUtc);
        for (const dayCode of daysOfWeek) {
          let localCandidate = new Date(initialLocal.getTime());
          while (getArizonaWeekdayCode(localCandidate) !== dayCode) {
            localCandidate = new Date(localCandidate.getTime() + 24 * 60 * 60 * 1000);
          }
          if (localCandidate.getTime() < initialLocal.getTime()) {
            localCandidate = new Date(localCandidate.getTime() + 7 * 24 * 60 * 60 * 1000);
          }

          while (true) {
            const occurrenceUtc = fromArizonaLocal(localCandidate);
            if (occurrenceUtc > untilDate || occurrenceUtc > endOfYear) break;
            if (occurrenceUtc >= startUtc && !exdates.has(occurrenceUtc.getTime())) {
              events.push({
                uid: `${event.uid}-${occurrenceUtc.toISOString()}`,
                summary: event.summary ?? "Unknown Class",
                location: event.location ?? "",
                start: occurrenceUtc,
                end: new Date(occurrenceUtc.getTime() + durationMs),
                isRecurring: true,
                daysOfWeek,
              });
            }
            localCandidate = new Date(localCandidate.getTime() + 7 * 24 * 60 * 60 * 1000);
          }
        }
      } else {
        const iter = event.iterator();
        let next = iter.next();
        while (next) {
          const startDate = next.toJSDate();
          if (startDate > endOfYear) break;
          const endDate = new Date(startDate.getTime() + durationMs);
          events.push({
            uid: `${event.uid}-${startDate.toISOString()}`,
            summary: event.summary ?? "Unknown Class",
            location: event.location ?? "",
            start: startDate,
            end: endDate,
            isRecurring: true,
            daysOfWeek: [],
          });
          next = iter.next();
        }
      }
    } else {
      events.push({
        uid: event.uid,
        summary: event.summary ?? "Unknown Class",
        location: event.location ?? "",
        start: event.startDate.toJSDate(),
        end: event.endDate.toJSDate(),
        isRecurring: false,
        daysOfWeek: [],
      });
    }
  }

  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}

function sameUtcCalendarDate(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function sameArizonaLocalCalendarDate(a: Date, b: Date): boolean {
  return sameUtcCalendarDate(toArizonaLocal(a), toArizonaLocal(b));
}

export function filterEventsForDate(events: ParsedEvent[], date: Date): ParsedEvent[] {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const selectedWeekday = WEEKDAY_CODES[date.getUTCDay()];
  const dayStart = Date.UTC(y, m, d, ARIZONA_UTC_HOUR, 0, 0);
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;

  return events.filter((e) => {
    if (e.isRecurring && e.daysOfWeek.includes(selectedWeekday)) {
      return sameArizonaLocalCalendarDate(e.start, date);
    }
    const t = e.start.getTime();
    return t >= dayStart && t < dayEnd;
  });
}

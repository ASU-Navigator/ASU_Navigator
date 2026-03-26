import type { ParsedEvent } from "../types";

export type SimulatedClass = {
  id: string;
  name: string;
  buildingCode: string;
  room: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  days: string[];    // subset of ['M','T','W','Th','F']
};

export const DAYS = ["M", "T", "W", "Th", "F"] as const;
export const DAY_LABELS: Record<string, string> = { M: "Mon", T: "Tue", W: "Wed", Th: "Thu", F: "Fri" };

const DAY_OF_WEEK_MAP: Record<number, string> = { 1: "M", 2: "T", 3: "W", 4: "Th", 5: "F" };

export function simulatedClassesToEvents(classes: SimulatedClass[], date: string): ParsedEvent[] {
  const dayCode = DAY_OF_WEEK_MAP[new Date(date + "T12:00:00").getDay()];
  if (!dayCode) return [];

  return classes
    .filter((c) => c.days.includes(dayCode))
    .map((c) => {
      const [startH, startM] = c.startTime.split(":").map(Number);
      const [endH, endM] = c.endTime.split(":").map(Number);
      const start = new Date(date + "T12:00:00");
      start.setHours(startH, startM, 0, 0);
      const end = new Date(date + "T12:00:00");
      end.setHours(endH, endM, 0, 0);
      return {
        uid: c.id,
        summary: c.name,
        location: `[${c.buildingCode}]${c.room ? ` ${c.room}` : ""}`,
        start,
        end,
        isRecurring: true,
      };
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

export const SIMULATE_KEY = "simulatedSchedule";

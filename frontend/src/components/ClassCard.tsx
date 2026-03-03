import type { ParsedEvent } from "../types";
import { resolveBuilding, extractRoom } from "../utils/buildingLookup";
import { CAMPUS_LABELS } from "../data/asuBuildings";

const CAMPUS_COLORS: Record<string, string> = {
  tempe: "bg-yellow-600/30 text-yellow-300",
  west: "bg-blue-600/30 text-blue-300",
  polytechnic: "bg-green-600/30 text-green-300",
  downtown: "bg-purple-600/30 text-purple-300",
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

type Props = {
  event: ParsedEvent;
  isTight?: boolean;
  walkMinutes?: number;
};

export default function ClassCard({ event, isTight, walkMinutes }: Props) {
  const building = resolveBuilding(event.location);
  const room = extractRoom(event.location);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors">
      {isTight && walkMinutes !== undefined && (
        <div className="flex items-center gap-2 mb-3 text-red-400 text-xs bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-1.5">
          <span>⚠</span>
          <span>Only {Math.round((event.start.getTime() - new Date().getTime()) / 60000)} min gap · {walkMinutes} min walk</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{event.summary}</p>
          <p className="text-gray-400 text-xs mt-1">
            {formatTime(event.start)} – {formatTime(event.end)}
          </p>
          {building ? (
            <p className="text-gray-300 text-xs mt-1">
              {building.name}{room ? ` · Room ${room}` : ""}
            </p>
          ) : event.location ? (
            <p className="text-gray-500 text-xs mt-1 truncate">{event.location}</p>
          ) : null}
        </div>

        {building && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${CAMPUS_COLORS[building.campus] ?? "bg-gray-600/30 text-gray-300"}`}>
            {CAMPUS_LABELS[building.campus]}
          </span>
        )}
      </div>
    </div>
  );
}

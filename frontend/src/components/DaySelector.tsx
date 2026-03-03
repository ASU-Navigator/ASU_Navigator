type Props = {
  date: string; // YYYY-MM-DD
  onChange: (date: string) => void;
};

function offsetDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00"); // noon to avoid DST edge cases
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatDisplay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export default function DaySelector({ date, onChange }: Props) {
  const isToday = date === todayStr();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(offsetDate(date, -1))}
        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        aria-label="Previous day"
      >
        ‹
      </button>

      <div className="flex items-center gap-2">
        <span className="text-white font-medium">{formatDisplay(date)}</span>
        {!isToday && (
          <button
            onClick={() => onChange(todayStr())}
            className="text-xs px-2 py-0.5 rounded border transition-colors hover:bg-white/10"
            style={{ color: "var(--color-asu-gold)", borderColor: "var(--color-asu-gold)" }}
          >
            Today
          </button>
        )}
      </div>

      <button
        onClick={() => onChange(offsetDate(date, 1))}
        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        aria-label="Next day"
      >
        ›
      </button>
    </div>
  );
}

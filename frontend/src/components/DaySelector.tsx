import { useState, useEffect, useRef } from "react";

type Props = {
  date: string; // YYYY-MM-DD
  onChange: (date: string) => void;
};

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function offsetDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return localDateStr(d);
}

function todayStr(): string {
  return localDateStr(new Date());
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_HEADERS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function buildCalendarDays(year: number, month: number): (string | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function DaySelector({ date, onChange }: Props) {
  const today = todayStr();
  const isToday = date === today;

  const selectedDate = new Date(date + "T12:00:00");
  const [showCal, setShowCal] = useState(false);
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showCal) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowCal(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showCal]);

  function openCal() {
    const d = new Date(date + "T12:00:00");
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setShowCal((v) => !v);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  function selectDay(d: string) {
    onChange(d);
    setShowCal(false);
  }

  const cells = buildCalendarDays(viewYear, viewMonth);

  return (
    <div className="flex items-center gap-2" ref={containerRef}>
      <button
        onClick={() => onChange(offsetDate(date, -1))}
        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        aria-label="Previous day"
      >
        ‹
      </button>

      <div className="relative flex items-center gap-2">
        <span className="text-white font-medium">
          {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </span>

        <button
          onClick={openCal}
          title="Open calendar"
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-sm ${
            showCal ? "bg-asu-maroon text-white" : "bg-white/10 hover:bg-white/20 text-gray-300"
          }`}
        >
          📅
        </button>

        {!isToday && (
          <button
            onClick={() => onChange(today)}
            className="text-xs px-2 py-0.5 rounded border transition-colors hover:bg-white/10"
            style={{ color: "var(--color-asu-gold)", borderColor: "var(--color-asu-gold)" }}
          >
            Today
          </button>
        )}

        {showCal && (
          <div className="absolute top-full left-0 mt-2 z-50 bg-gray-900 border border-white/20 rounded-2xl shadow-2xl p-4 w-72">
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">‹</button>
              <span className="text-white font-semibold text-sm">{MONTH_NAMES[viewMonth]} {viewYear}</span>
              <button onClick={nextMonth} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">›</button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {DAY_HEADERS.map((h) => (
                <div key={h} className="text-center text-gray-500 text-xs py-1">{h}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((cell, i) => {
                if (!cell) return <div key={i} />;
                const isSelected = cell === date;
                const isTodayCell = cell === today;
                return (
                  <button
                    key={cell}
                    onClick={() => selectDay(cell)}
                    className={`w-8 h-8 mx-auto rounded-full text-xs font-medium transition-colors flex items-center justify-center ${
                      isSelected
                        ? "bg-asu-maroon text-white"
                        : isTodayCell
                        ? "border border-asu-gold text-asu-gold hover:bg-asu-gold/20"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    {new Date(cell + "T12:00:00").getDate()}
                  </button>
                );
              })}
            </div>
          </div>
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

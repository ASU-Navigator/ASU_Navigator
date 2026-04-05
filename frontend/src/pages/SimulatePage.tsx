import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ASU_BUILDINGS, CAMPUS_LABELS } from "../data/asuBuildings";
import { type SimulatedClass, DAYS, DAY_LABELS, SIMULATE_KEY } from "../utils/simulate";
import { START_LOCATION_KEY } from "./MapPage";

function nearestWeekday() {
  const d = new Date();
  const day = d.getDay();
  if (day === 0) d.setDate(d.getDate() + 1);
  else if (day === 6) d.setDate(d.getDate() + 2);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const CAMPUSES = ["tempe", "west", "polytechnic", "downtown"] as const;

export default function SimulatePage() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState<SimulatedClass[]>([]);
  const [name, setName] = useState("");
  const [buildingCode, setBuildingCode] = useState(ASU_BUILDINGS[0]?.code ?? "");
  const [room, setRoom] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:50");
  const [selectedDays, setSelectedDays] = useState<string[]>(["M", "W", "F"]);
  const [error, setError] = useState<string | null>(null);

  function toggleDay(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function addClass() {
    if (!name.trim()) { setError("Enter a course name."); return; }
    if (selectedDays.length === 0) { setError("Select at least one day."); return; }
    if (startTime >= endTime) { setError("End time must be after start time."); return; }
    setError(null);
    setClasses((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        buildingCode,
        room: room.trim(),
        startTime,
        endTime,
        days: [...selectedDays],
      },
    ]);
    setName("");
    setRoom("");
  }

  function viewOnMap() {
    localStorage.setItem(SIMULATE_KEY, JSON.stringify(classes));
    navigate(`/map?mode=simulate&date=${nearestWeekday()}`);
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom right, #0f0f1a, #1e1e2f)" }}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Simulate a Schedule</h2>
          <p className="text-gray-400 mt-1 text-sm">
            Build a hypothetical schedule to preview walking routes between classes.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Course name (e.g. MAT 243)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addClass()}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/40"
            />

            <div className="flex gap-3">
              <select
                value={buildingCode}
                onChange={(e) => setBuildingCode(e.target.value)}
                className="flex-1 bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
              >
                {CAMPUSES.map((campus) => (
                  <optgroup key={campus} label={CAMPUS_LABELS[campus]}>
                    {ASU_BUILDINGS.filter((b) => b.campus === campus).map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <input
                type="text"
                placeholder="Room"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-24 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/40"
              />
            </div>

            <div className="flex gap-3 items-center">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
              />
              <span className="text-gray-500 text-sm">to</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
              />
            </div>

            <div className="flex gap-2">
              {DAYS.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedDays.includes(d)
                      ? "bg-asu-maroon text-white"
                      : "bg-white/5 border border-white/20 text-gray-400 hover:text-white"
                  }`}
                >
                  {DAY_LABELS[d]}
                </button>
              ))}
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              onClick={addClass}
              className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors"
            >
              + Add Class
            </button>
          </div>
        </div>

        {classes.length > 0 && (
          <div className="space-y-2 mb-6">
            {classes.map((c) => {
              const building = ASU_BUILDINGS.find((b) => b.code === c.buildingCode);
              return (
                <div
                  key={c.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{c.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {building?.name ?? c.buildingCode}
                      {c.room ? ` · Room ${c.room}` : ""} · {c.startTime}–{c.endTime}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {c.days.map((d) => DAY_LABELS[d]).join(", ")}
                    </p>
                  </div>
                  <button
                    onClick={() => setClasses((prev) => prev.filter((x) => x.id !== c.id))}
                    className="text-gray-500 hover:text-red-400 transition-colors shrink-0 text-lg leading-none"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 rounded-lg text-sm text-gray-400 border border-white/20 hover:text-white hover:border-white/40 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={viewOnMap}
            disabled={classes.length === 0 || (classes.length < 2 && !localStorage.getItem(START_LOCATION_KEY))}
            title={classes.length === 0 ? "Add at least 1 class to view a route" : classes.length < 2 && !localStorage.getItem(START_LOCATION_KEY) ? "Add another class, or set a start pin on the map" : ""}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-asu-maroon transition-opacity disabled:opacity-40"
          >
            🗺 View Route
          </button>
        </div>
      </main>
    </div>
  );
}

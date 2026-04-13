import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import DaySelector from "../components/DaySelector";
import ClassCard from "../components/ClassCard";
import UploadSection from "../components/UploadSection";
import LoadingScreen from "../components/LoadingScreen";
import { trpc } from "../utils/trpc/client";
import { resolveBuilding } from "../utils/buildingLookup";
import type { ParsedEvent } from "../types";
import { START_LOCATION_KEY } from "./MapPage";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function defaultLabel() {
  const m = new Date().getMonth();
  const y = new Date().getFullYear();
  return m >= 7 ? `Fall ${y}` : `Spring ${y}`;
}

function isPhysical(location: string | undefined) {
  const upper = (location ?? "").toUpperCase();
  return !!location && !upper.includes("ONLINE") && !upper.includes("VIRTUAL") && !upper.includes("ZOOM");
}

function haversineMinutes(a: ParsedEvent, b: ParsedEvent): number | null {
  const fromB = resolveBuilding(a.location);
  const toB = resolveBuilding(b.location);
  if (!fromB || !toB || fromB.code === toB.code) return null;
  const R = 6_371_000;
  const dLat = (toB.lat - fromB.lat) * (Math.PI / 180);
  const dLng = (toB.lng - fromB.lng) * (Math.PI / 180);
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(fromB.lat * (Math.PI / 180)) *
      Math.cos(toB.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;
  const dist = R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return Math.ceil(dist / 1.4 / 60);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const date = searchParams.get("date") ?? todayStr();
  const scheduleId = searchParams.get("schedule") ?? "";

  const [showUpload, setShowUpload] = useState(false);
  const [newLabel, setNewLabel] = useState(defaultLabel);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const listQuery = trpc.schedule.list.useQuery();
  const scheduleQuery = trpc.schedule.get.useQuery(
    { scheduleId, date },
    { enabled: !!scheduleId },
  );

  useEffect(() => {
    if (!scheduleId && listQuery.data && listQuery.data.length > 0) {
      setSearchParams((p) => { p.set("schedule", listQuery.data[0].id); return p; }, { replace: true });
    }
  }, [listQuery.data, scheduleId, setSearchParams]);

  const uploadMutation = trpc.schedule.upload.useMutation({
    onSuccess: (data) => {
      toast.success(`Schedule uploaded! Found ${data.totalEvents} events.`);
      setShowUpload(false);
      setNewLabel(defaultLabel());
      void listQuery.refetch();
      setSearchParams((p) => { p.set("schedule", data.scheduleId); return p; }, { replace: true });
    },
    onError: (err) => toast.error(err.message || "Failed to upload schedule."),
  });

  const renameMutation = trpc.schedule.rename.useMutation({
    onSuccess: () => void listQuery.refetch(),
  });

  function startRename(s: { id: string; label: string }, e: React.MouseEvent) {
    e.stopPropagation();
    setRenamingId(s.id);
    setRenameValue(s.label);
  }

  function commitRename(id: string) {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== schedules.find((s) => s.id === id)?.label) {
      renameMutation.mutate({ scheduleId: id, label: trimmed });
    }
    setRenamingId(null);
  }

  const deleteMutation = trpc.schedule.delete.useMutation({
    onSuccess: async (_, vars) => {
      toast.success("Schedule removed.");
      const result = await listQuery.refetch();
      const remaining = result.data ?? [];
      if (vars.scheduleId === scheduleId) {
        setSearchParams((p) => {
          if (remaining.length > 0) p.set("schedule", remaining[0].id);
          else p.delete("schedule");
          return p;
        }, { replace: true });
      }
    },
  });

  const events: ParsedEvent[] = scheduleQuery.data?.events ?? [];

  // Walk connectors between consecutive events (index i = connector before event i)
  const walkConnectors = useMemo(() =>
    events.map((_, i) => {
      if (i === 0) return null;
      const gapMs = events[i].start.getTime() - events[i - 1].end.getTime();
      const gapMinutes = Math.round(gapMs / 60000);
      const walkMinutes = haversineMinutes(events[i - 1], events[i]);
      const isTight = walkMinutes !== null && walkMinutes * 60 > gapMs / 1000 - 300;
      return { walkMinutes, gapMinutes, isTight };
    }),
  [events]);

  if (listQuery.isPending) return <LoadingScreen message="Loading your schedules…" />;

  const schedules = listQuery.data ?? [];
  const hasSchedules = schedules.length > 0;
  const physicalEvents = events.filter((e) => isPhysical(e.location));
  const hasStartPin = !!localStorage.getItem(START_LOCATION_KEY);
  const canViewRoute = physicalEvents.length >= 2 || (physicalEvents.length === 1 && hasStartPin);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom right, #0f0f1a, #1e1e2f)" }}>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Schedule tabs */}
        {hasSchedules && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {schedules.map((s) => (
              <div
                key={s.id}
                onClick={() => { if (renamingId !== s.id) setSearchParams((p) => { p.set("schedule", s.id); return p; }); }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  startRename(s, e);
                }}
                title="Double-click to rename"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors select-none ${
                  scheduleId === s.id
                    ? "bg-asu-maroon border-asu-maroon text-white"
                    : "border-white/20 text-gray-400 hover:text-white hover:border-white/40"
                }`}
              >
                {renamingId === s.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => commitRename(s.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename(s.id);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-transparent outline-none border-b border-white/50 text-white w-28"
                  />
                ) : (
                  <>
                    <span>{s.label}</span>
                    <button
                      onClick={(e) => startRename(s, e)}
                      title="Rename schedule"
                      className="opacity-40 hover:opacity-100 leading-none text-xs transition-opacity"
                    >
                      ✏
                    </button>
                  </>
                )}
                <button
                  className="opacity-50 hover:opacity-100 leading-none text-base"
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate({ scheduleId: s.id }); }}
                  title="Remove this schedule"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => setShowUpload(true)}
              className="px-3 py-1.5 rounded-lg border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 text-sm transition-colors"
            >
              + Add
            </button>
          </div>
        )}

        {/* Upload panel */}
        {(!hasSchedules || showUpload) && (
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {showUpload ? "Add Schedule" : "Upload Your Schedule"}
                </h2>
                <p className="text-gray-400 mt-1 text-sm">
                  Upload your ASU .ics file to see your optimized campus route.
                </p>
              </div>
              {showUpload && (
                <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-white text-xl leading-none mt-1">✕</button>
              )}
            </div>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Schedule name (e.g. Spring 2026)"
              className="w-full mb-3 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/40"
            />
            <UploadSection
              onUpload={(icsContent) => uploadMutation.mutate({ icsContent, label: newLabel || defaultLabel() })}
              isLoading={uploadMutation.isPending}
            />
          </div>
        )}

        {/* Class list */}
        {!!scheduleId && !showUpload && (
          scheduleQuery.isPending ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: "var(--color-asu-gold)", borderTopColor: "transparent" }} />
            </div>
          ) : !scheduleQuery.data?.hasSchedule ? null : (
            <div className="space-y-6">
              {/* Header row */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <DaySelector
                  date={date}
                  onChange={(d) => setSearchParams((p) => { p.set("date", d); return p; })}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate("/simulate")}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 border border-white/20 hover:text-white hover:border-white/40 transition-colors"
                  >
                    Simulate
                  </button>
                  <button
                    onClick={() => navigate(`/map?date=${date}&schedule=${scheduleId}`)}
                    disabled={!canViewRoute}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-40 bg-asu-maroon"
                    title={!canViewRoute ? "Need at least 2 in-person classes, or 1 class with a start pin set" : ""}
                  >
                    🗺 View Route
                  </button>
                </div>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">🎉</p>
                  <p className="text-white font-medium">No classes today!</p>
                  <p className="text-gray-400 text-sm mt-1">Use the arrows to check another day.</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 text-sm mb-3">
                    {events.length} class{events.length !== 1 ? "es" : ""} today
                  </p>
                  <div className="space-y-1">
                    {events.map((event, i) => (
                      <div key={event.uid}>
                        {walkConnectors[i] && (
                          <div className={`mx-2 my-1 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 ${
                            walkConnectors[i]!.isTight
                              ? "bg-red-900/30 border border-red-500/30 text-red-300"
                              : "bg-blue-900/20 border border-blue-500/20 text-blue-300"
                          }`}>
                            <span>{walkConnectors[i]!.isTight ? "⚠" : "🚶"}</span>
                            <span>
                              {walkConnectors[i]!.walkMinutes !== null
                                ? `${walkConnectors[i]!.walkMinutes} min walk · `
                                : ""}
                              {walkConnectors[i]!.gapMinutes} min gap
                              {walkConnectors[i]!.isTight && " — Tight!"}
                            </span>
                          </div>
                        )}
                        <ClassCard event={event} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </main>
    </div>
  );
}

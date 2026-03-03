import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import DaySelector from "../components/DaySelector";
import ClassCard from "../components/ClassCard";
import UploadSection from "../components/UploadSection";
import LoadingScreen from "../components/LoadingScreen";
import { trpc } from "../utils/trpc/client";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const scheduleQuery = trpc.schedule.get.useQuery({ date: selectedDate });

  const uploadMutation = trpc.schedule.upload.useMutation({
    onSuccess: (data) => {
      toast.success(`Schedule uploaded! Found ${data.totalEvents} events.`);
      void scheduleQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to upload schedule.");
    },
  });

  const deleteMutation = trpc.schedule.delete.useMutation({
    onSuccess: () => {
      toast.success("Schedule removed.");
      void scheduleQuery.refetch();
    },
  });

  if (scheduleQuery.isPending) return <LoadingScreen message="Loading your schedule…" />;

  const { hasSchedule, events } = scheduleQuery.data ?? { hasSchedule: false, events: [] };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom right, #0f0f1a, #1e1e2f)" }}>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {!hasSchedule ? (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">Upload Your Schedule</h2>
              <p className="text-gray-400 mt-1 text-sm">
                Upload your ASU .ics file to see your optimized campus route.
              </p>
            </div>
            <UploadSection
              onUpload={(icsContent) => uploadMutation.mutate({ icsContent })}
              isLoading={uploadMutation.isPending}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header row */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <DaySelector date={selectedDate} onChange={setSelectedDate} />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/map?date=${selectedDate}`)}
                  disabled={events.length < 2}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: "var(--color-asu-maroon)" }}
                  title={events.length < 2 ? "Need at least 2 classes to view a route" : ""}
                >
                  🗺 View Route
                </button>
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 border border-white/20 hover:bg-white/10 transition-colors"
                >
                  Re-upload
                </button>
              </div>
            </div>

            {/* Class list */}
            {events.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🎉</p>
                <p className="text-white font-medium">No classes today!</p>
                <p className="text-gray-400 text-sm mt-1">Use the arrows to check another day.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-400 text-sm">{events.length} class{events.length !== 1 ? "es" : ""} today</p>
                {events.map((event) => (
                  <ClassCard key={event.uid} event={event} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

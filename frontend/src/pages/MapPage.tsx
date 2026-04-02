import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GoogleMap, Polyline, useJsApiLoader } from "@react-google-maps/api";
import type { ParsedEvent } from "../types";
import { trpc, trpcClient } from "../utils/trpc/client";
import { resolveBuilding } from "../utils/buildingLookup";
import { CAMPUS_CENTERS, CAMPUS_LABELS, type Campus } from "../data/asuBuildings";
import LoadingScreen from "../components/LoadingScreen";
import { simulatedClassesToEvents, SIMULATE_KEY, type SimulatedClass } from "../utils/simulate";

type RouteSegment = {
  fromIndex: number;
  toIndex: number;
  path: { lat: number; lng: number }[];
  durationSeconds: number;
  gapSeconds: number;
  isTight: boolean;
  isFallback?: boolean;
};

const geocodeCache = new Map<string, { lat: number; lng: number } | null>();

async function geocodeLocation(locationStr: string): Promise<{ lat: number; lng: number } | null> {
  const upper = locationStr.toUpperCase();
  if (!locationStr || upper.includes("ONLINE") || upper.includes("VIRTUAL") || upper.includes("ZOOM")) return null;
  if (geocodeCache.has(locationStr)) return geocodeCache.get(locationStr) ?? null;

  let query = locationStr;
  const asuMatch = locationStr.match(
    /^(Tempe|West|Polytechnic|Downtown)\s+([A-Z][A-Z0-9]+)(?:\s+\S+)?$/i,
  );
  if (asuMatch) {
    query = `${asuMatch[2]} Building, Arizona State University, Tempe, AZ`;
  }

  return new Promise((resolve) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { address: query, region: "us" },
      (results, status) => {
        try {
          const loc = status === "OK" ? results?.[0]?.geometry?.location ?? null : null;
          const result = loc ? { lat: loc.lat(), lng: loc.lng() } : null;
          geocodeCache.set(locationStr, result);
          resolve(result);
        } catch {
          geocodeCache.set(locationStr, null);
          resolve(null);
        }
      },
    );
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const LIBRARIES: ("geometry" | "marker")[] = ["geometry", "marker"];

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const date = searchParams.get("date") ?? todayStr();
  const scheduleId = searchParams.get("schedule") ?? "";
  const mode = searchParams.get("mode") ?? "";
  const isSimulate = mode === "simulate";

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: LIBRARIES,
  });

  const scheduleQuery = trpc.schedule.get.useQuery(
    { scheduleId, date },
    { enabled: !!scheduleId && !isSimulate },
  );

  const simulateEvents = useMemo<ParsedEvent[]>(() => {
    if (!isSimulate) return [];
    try {
      const raw = localStorage.getItem(SIMULATE_KEY);
      const classes = raw ? (JSON.parse(raw) as SimulatedClass[]) : [];
      return simulatedClassesToEvents(classes, date);
    } catch {
      return [];
    }
  }, [isSimulate, date]);

  const events: ParsedEvent[] = isSimulate ? simulateEvents : (scheduleQuery.data?.events ?? []);

  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [isComputingRoutes, setIsComputingRoutes] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [activeEventIndex, setActiveEventIndex] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mapCenter = (() => {
    const campusCounts: Partial<Record<Campus, number>> = {};
    for (const e of events) {
      const b = resolveBuilding(e.location);
      if (b) campusCounts[b.campus] = (campusCounts[b.campus] ?? 0) + 1;
    }
    const dominant = (Object.entries(campusCounts) as [Campus, number][])
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    return CAMPUS_CENTERS[dominant ?? "tempe"];
  })();

  useEffect(() => {
    if (!isLoaded || events.length < 2) return;

    function straightLineSegment(
      fromIndex: number,
      toIndex: number,
      fromLat: number, fromLng: number,
      toLat: number, toLng: number,
      gapSeconds: number,
    ): RouteSegment {
      const R = 6_371_000;
      const dLat = (toLat - fromLat) * (Math.PI / 180);
      const dLng = (toLng - fromLng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(fromLat * (Math.PI / 180)) *
          Math.cos(toLat * (Math.PI / 180)) *
          Math.sin(dLng / 2) ** 2;
      const distMeters = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const durationSeconds = Math.round(distMeters / 1.4);
      return {
        fromIndex,
        toIndex,
        path: [{ lat: fromLat, lng: fromLng }, { lat: toLat, lng: toLng }],
        durationSeconds,
        gapSeconds,
        isTight: durationSeconds > gapSeconds - 300,
      };
    }

    async function compute() {
      setIsComputingRoutes(true);
      const segments: RouteSegment[] = [];

      for (let i = 0; i < events.length - 1; i++) {
        const from = events[i];
        const to = events[i + 1];
        const fromB = resolveBuilding(from.location);
        const toB = resolveBuilding(to.location);

        const fromCoords = fromB
          ? { lat: fromB.lat, lng: fromB.lng }
          : await geocodeLocation(from.location);
        const toCoords = toB
          ? { lat: toB.lat, lng: toB.lng }
          : await geocodeLocation(to.location);

        if (!fromCoords || !toCoords) continue;

        if (fromB && toB && fromB.code === toB.code) continue;
        if (
          fromCoords.lat === toCoords.lat && fromCoords.lng === toCoords.lng
        ) continue;

        const gapSeconds = (to.start.getTime() - from.end.getTime()) / 1000;

        let usedFallback = false;
        try {
          const result = await trpcClient.schedule.route.query({
            originLat: fromCoords.lat,
            originLng: fromCoords.lng,
            destLat: toCoords.lat,
            destLng: toCoords.lng,
          });
          if (!result.ok) {
            usedFallback = true;
          } else {
            const decoded = window.google.maps.geometry.encoding.decodePath(
              result.encodedPolyline,
            );
            const path = decoded.map((pt) => ({ lat: pt.lat(), lng: pt.lng() }));
            segments.push({
              fromIndex: i,
              toIndex: i + 1,
              path,
              durationSeconds: result.durationSeconds,
              gapSeconds,
              isTight: result.durationSeconds > gapSeconds - 300,
            });
          }
        } catch {
          usedFallback = true;
        }

        if (usedFallback) {
          segments.push({ ...straightLineSegment(i, i + 1, fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng, gapSeconds), isFallback: true });
        }
      }

      setRouteSegments(segments);
      setIsComputingRoutes(false);
    }

    void compute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, events.length, date]);

  useEffect(() => {
    if (!map || events.length === 0) return;

    markersRef.current.forEach(marker => marker.map = null);
    markersRef.current = [];

    const createMarkers = async () => {
      const { AdvancedMarkerElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;

      for (const [i, event] of events.entries()) {
        const building = resolveBuilding(event.location);
        const coords = building
          ? { lat: building.lat, lng: building.lng }
          : await geocodeLocation(event.location);
        if (!coords) continue;
        const displayName = building?.name ?? event.location;

        const content = document.createElement('div');
        content.style.color = 'white';
        content.style.fontWeight = 'bold';
        content.style.fontSize = '12px';
        content.style.background = '#8C1D40';
        content.style.borderRadius = '50%';
        content.style.width = '24px';
        content.style.height = '24px';
        content.style.display = 'flex';
        content.style.alignItems = 'center';
        content.style.justifyContent = 'center';
        content.style.border = '2px solid white';
        content.style.position = 'relative';
        content.textContent = String(i + 1);

        const marker = new AdvancedMarkerElement({
          map,
          position: coords,
          content,
          title: `${event.summary} — ${displayName}`,
        });

        marker.addListener("gmp-click", () => setActiveEventIndex(i));
        markersRef.current.push(marker);
      }
    };

    createMarkers();
  }, [map, events]);

  if (!isSimulate && !scheduleId) {
    navigate("/dashboard", { replace: true });
    return null;
  }
  if (!isSimulate && scheduleQuery.isPending) return <LoadingScreen message="Loading schedule…" />;
  if (!isLoaded) return <LoadingScreen message="Loading map…" />;

  const allVirtual =
    events.length > 0 &&
    events.every((e) => {
      const u = (e.location ?? "").toUpperCase();
      return !e.location || u.includes("ONLINE") || u.includes("VIRTUAL") || u.includes("ZOOM");
    });

  const activeEvent = activeEventIndex !== null ? events[activeEventIndex] : null;
  const activeBuilding = activeEvent ? resolveBuilding(activeEvent.location) : null;

  return (
    <div className="flex h-screen overflow-hidden relative">
      {sidebarOpen && (
        <div
          className="md:hidden absolute inset-0 bg-black/50 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        w-80 shrink-0 flex flex-col bg-gray-900 border-r border-white/10 overflow-y-auto
        absolute md:relative inset-y-0 left-0 z-20 transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="p-4 border-b border-white/10 bg-asu-maroon">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white font-bold">ASU Navigator</span>
            <button
              onClick={() => navigate(isSimulate ? "/simulate" : `/dashboard?schedule=${scheduleId}&date=${date}`)}
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              ← Back
            </button>
          </div>
          <p className="text-white/70 text-xs">
            {new Date(date + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {isComputingRoutes && (
          <div className="px-4 py-2 bg-yellow-900/30 border-b border-yellow-500/20 text-yellow-300 text-xs flex items-center gap-2">
            <span className="animate-spin">⟳</span> Computing walking routes…
          </div>
        )}

        <div className="flex-1 p-3 space-y-2">
          {events.length === 0 ? (
            <p className="text-gray-400 text-sm text-center mt-8">No classes on this day.</p>
          ) : (
            events.map((event, i) => {
              const building = resolveBuilding(event.location);
              const seg = routeSegments.find((s) => s.fromIndex === i);
              const loc = (event.location ?? "").toUpperCase();
              const isVirtual = !event.location || loc.includes("ONLINE") || loc.includes("VIRTUAL") || loc.includes("ZOOM");
              const isActive = activeEventIndex === i;

              return (
                <div key={event.uid} className="space-y-1">
                  <button
                    onClick={() => setActiveEventIndex(isActive ? null : i)}
                    className={`w-full text-left rounded-xl p-3 border transition-colors ${
                      isActive
                        ? "bg-asu-maroon/30 border-asu-maroon/60"
                        : "bg-white/5 border-white/10 hover:bg-white/8"
                    }`}
                  >
                    <p className="text-white text-sm font-semibold truncate">{event.summary}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {formatTime(event.start)} – {formatTime(event.end)}
                    </p>
                    {building ? (
                      <p className="text-gray-300 text-xs mt-1">{building.name} · {CAMPUS_LABELS[building.campus]}</p>
                    ) : (
                      <p className="text-gray-500 text-xs mt-1 italic">
                        {event.location || "No location specified"}
                      </p>
                    )}
                    {isVirtual && (
                      <span className="inline-block mt-1 text-xs bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded-full">
                        Online / Virtual
                      </span>
                    )}
                  </button>

                  {seg && (
                    <div className={`mx-3 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 ${
                      seg.isTight
                        ? "bg-red-900/30 border border-red-500/30 text-red-300"
                        : "bg-blue-900/20 border border-blue-500/20 text-blue-300"
                    }`}>
                      {seg.isTight ? "⚠" : "🚶"}
                      <span>
                        {Math.round(seg.durationSeconds / 60)} min walk
                        {seg.isTight && (
                          <span className="text-red-400 ml-1">
                            · Only {Math.round(seg.gapSeconds / 60)} min gap!
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      <div className="flex-1 relative">
        <button
          className="md:hidden absolute top-4 left-4 z-10 bg-gray-900/90 border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-medium shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "✕ Close" : "☰ Classes"}
        </button>

        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={{ lat: mapCenter.lat, lng: mapCenter.lng }}
          zoom={mapCenter.zoom}
          onLoad={(mapInstance) => setMap(mapInstance)}
          onClick={() => setActiveEventIndex(null)}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            mapId: "bdfa66bd0ca03dc990ecaed7",
          }}
        >
          {routeSegments.map((seg) => (
            <Polyline
              key={`${seg.fromIndex}-${seg.toIndex}`}
              path={seg.path}
              options={{
                strokeColor: seg.isTight ? "#EF4444" : "#3B82F6",
                strokeWeight: seg.isFallback ? 3 : 5,
                strokeOpacity: seg.isFallback ? 0.55 : 0.85,
                icons: seg.isFallback
                  ? [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "12px" }]
                  : undefined,
              }}
            />
          ))}
        </GoogleMap>

        {allVirtual && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-gray-900/95 border border-white/20 rounded-2xl p-6 text-center max-w-xs shadow-xl">
              <p className="text-3xl mb-2">💻</p>
              <p className="text-white font-semibold">All classes online today</p>
              <p className="text-gray-400 text-sm mt-1">No in-person locations to navigate to.</p>
            </div>
          </div>
        )}

        {activeEvent && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 border border-white/20 rounded-2xl p-4 shadow-xl w-72 z-10">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{activeEvent.summary}</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {formatTime(activeEvent.start)} – {formatTime(activeEvent.end)}
                </p>
                {activeBuilding ? (
                  <p className="text-gray-300 text-xs mt-1">
                    {activeBuilding.name} · {CAMPUS_LABELS[activeBuilding.campus]}
                  </p>
                ) : (
                  <p className="text-gray-500 text-xs mt-1 italic">{activeEvent.location}</p>
                )}
              </div>
              <button
                onClick={() => setActiveEventIndex(null)}
                className="text-gray-500 hover:text-white text-lg leading-none shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

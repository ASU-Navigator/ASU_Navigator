import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GoogleMap, Polyline, useJsApiLoader } from "@react-google-maps/api";
import type { ParsedEvent } from "../types";
import { trpc, trpcClient } from "../utils/trpc/client";
import { resolveBuilding } from "../utils/buildingLookup";
import { CAMPUS_CENTERS, CAMPUS_LABELS, type Campus } from "../data/asuBuildings";
import LoadingScreen from "../components/LoadingScreen";

type RouteSegment = {
  fromIndex: number;
  toIndex: number;
  path: { lat: number; lng: number }[];
  durationSeconds: number;
  gapSeconds: number;
  isTight: boolean;
  isFallback?: boolean;
};

// Module-level geocode cache — persists across re-renders
const geocodeCache = new Map<string, { lat: number; lng: number } | null>();

async function geocodeLocation(locationStr: string): Promise<{ lat: number; lng: number } | null> {
  const upper = locationStr.toUpperCase();
  if (!locationStr || upper.includes("ONLINE") || upper.includes("VIRTUAL") || upper.includes("ZOOM")) return null;
  if (geocodeCache.has(locationStr)) return geocodeCache.get(locationStr) ?? null;

  return new Promise((resolve) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { address: `${locationStr}, Arizona State University`, region: "us" },
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
  return new Date().toISOString().split("T")[0];
}

const LIBRARIES: ("geometry" | "marker")[] = ["geometry", "marker"];

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const date = searchParams.get("date") ?? todayStr();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: LIBRARIES,
  });

  const scheduleQuery = trpc.schedule.get.useQuery({ date });
  const events: ParsedEvent[] = scheduleQuery.data?.events ?? [];

  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [isComputingRoutes, setIsComputingRoutes] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  // Determine map center from the most common campus
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

    /** Straight-line walking estimate used as fallback when the Routes API is unavailable */
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
      const durationSeconds = Math.round(distMeters / 1.4); // ~5 km/h walking
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

        // Fall back to Geocoding API for buildings not in static DB
        const fromCoords = fromB
          ? { lat: fromB.lat, lng: fromB.lng }
          : await geocodeLocation(from.location);
        const toCoords = toB
          ? { lat: toB.lat, lng: toB.lng }
          : await geocodeLocation(to.location);

        if (!fromCoords || !toCoords) continue;

        // Skip if same building (exact coords match or same static code)
        if (
          fromB && toB && fromB.code === toB.code
        ) continue;
        if (
          fromCoords.lat === toCoords.lat && fromCoords.lng === toCoords.lng
        ) continue;

        const gapSeconds = (to.start.getTime() - from.end.getTime()) / 1000;

        // Try the Routes API via backend proxy; fall back to straight-line estimate on failure
        let usedFallback = false;
        try {
          const result = await trpcClient.schedule.route.query({
            originLat: fromCoords.lat,
            originLng: fromCoords.lng,
            destLat: toCoords.lat,
            destLng: toCoords.lng,
          });
          console.log('Route API result:', result);
          if (!result.ok) {
            console.log('Route API failed:', result.error);
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
        } catch (error) {
          console.log('Route API exception:', error);
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

  // Advanced Markers Effect
  useEffect(() => {
    console.log('Advanced Markers Effect running:', { map: !!map, eventsLength: events.length });
    if (!map || events.length === 0) {
      console.log('Skipping marker creation:', { map: !!map, eventsLength: events.length });
      return;
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.map = null);
    markersRef.current = [];

    // Load marker library and create markers
    const createMarkers = async () => {
      // console.log('Creating markers for', events.length, 'events');
      const { AdvancedMarkerElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;
      console.log('AdvancedMarkerElement loaded');

      for (const [i, event] of events.entries()) {
        const building = resolveBuilding(event.location);
        const coords = building
          ? { lat: building.lat, lng: building.lng }
          : await geocodeLocation(event.location);
        if (!coords) continue;
        const displayName = building?.name ?? event.location;

        // console.log('Creating marker for', building.name, building.lat, building.lng);

        // Create custom content for the marker
        const content = document.createElement('div');
        content.style.color = 'white';
        content.style.fontWeight = 'bold';
        content.style.fontSize = '12px';
        content.style.background = '#dc2626'; // ASU maroon
        content.style.borderRadius = '50%';
        content.style.width = '24px';
        content.style.height = '24px';
        content.style.display = 'flex';
        content.style.alignItems = 'center';
        content.style.justifyContent = 'center';
        content.style.border = '2px solid white';
        content.style.zIndex = '1000'; // Ensure it's above the map
        content.style.position = 'relative';
        content.textContent = String(i + 1 % 100); // Show event index (1-99) on marker

        // Create the advanced marker
        const marker = new AdvancedMarkerElement({
          map,
          position: coords,
          content,
          title: `${event.summary} — ${displayName}`,
        });

        markersRef.current.push(marker);
        console.log('Marker created for', building.name);
      }
      console.log('Total markers created:', markersRef.current.length);
    };

    createMarkers();
  }, [map, events]);

  if (scheduleQuery.isPending) return <LoadingScreen message="Loading schedule…" />;
  if (!isLoaded) return <LoadingScreen message="Loading map…" />;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 shrink-0 flex flex-col bg-gray-900 border-r border-white/10 overflow-y-auto">
        {/* Sidebar header */}
        <div className="p-4 border-b border-white/10 bg-asu-maroon">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white font-bold">ASU Navigator</span>
            <button
              onClick={() => navigate("/dashboard")}
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

{/* Event list */}
        <div className="flex-1 p-3 space-y-2">
          {events.length === 0 ? (
            <p className="text-gray-400 text-sm text-center mt-8">No classes on this day.</p>
          ) : (
            events.map((event, i) => {
              const building = resolveBuilding(event.location);
              const seg = routeSegments.find((s) => s.fromIndex === i);
              const loc = (event.location ?? "").toUpperCase();
              const isVirtual = !event.location || loc.includes("ONLINE") || loc.includes("VIRTUAL") || loc.includes("ZOOM");

              return (
                <div key={event.uid} className="space-y-1">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
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
                  </div>

                  {/* Route connector */}
                  {seg && (
                    <div
                      className={`mx-3 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 ${
                        seg.isTight
                          ? "bg-red-900/30 border border-red-500/30 text-red-300"
                          : "bg-blue-900/20 border border-blue-500/20 text-blue-300"
                      }`}
                    >
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

      {/* Map */}
      <div className="flex-1">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={{ lat: mapCenter.lat, lng: mapCenter.lng }}
          zoom={mapCenter.zoom}
          onLoad={(mapInstance) => setMap(mapInstance)}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            mapId: "bdfa66bd0ca03dc990ecaed7", //load map styles from Google Cloud Console with ASU branding and highlighted buildings
          }}
        >
          {/* Walking route polylines */}
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
      </div>
    </div>
  );
}

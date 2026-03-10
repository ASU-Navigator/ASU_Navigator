import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";
import type { ParsedEvent } from "../types";
import { trpc } from "../utils/trpc/client";
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
  if (geocodeCache.has(locationStr)) return geocodeCache.get(locationStr)!;

  return new Promise((resolve) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { address: `${locationStr}, Arizona State University`, region: "us" },
      (results, status) => {
        const result =
          status === "OK" && results?.[0]
            ? {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng(),
              }
            : null;
        geocodeCache.set(locationStr, result);
        resolve(result);
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

const LIBRARIES: ("geometry")[] = ["geometry"];

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
  const [routeApiError, setRouteApiError] = useState<string | null>(null);

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

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

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
      setRouteApiError(null);
      const segments: RouteSegment[] = [];
      let firstApiError: string | null = null;

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

        // Try the Routes API; fall back to a straight-line estimate on any failure
        let usedFallback = false;
        try {
          const res = await fetch(
            "https://routes.googleapis.com/directions/v2:computeRoutes",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": "routes.duration,routes.polyline.encodedPolyline",
              },
              body: JSON.stringify({
                origin: { location: { latLng: { latitude: fromCoords.lat, longitude: fromCoords.lng } } },
                destination: { location: { latLng: { latitude: toCoords.lat, longitude: toCoords.lng } } },
                travelMode: "WALK",
              }),
            },
          );

          type RoutesResponse = {
            routes?: { duration?: string; polyline?: { encodedPolyline?: string } }[];
            error?: { message?: string; status?: string };
          };
          const data = await res.json() as RoutesResponse;

          if (data.error) {
            firstApiError ??= data.error.message ?? data.error.status ?? "Routes API error";
            usedFallback = true;
          } else {
            const route = data.routes?.[0];
            if (route?.duration && route.polyline?.encodedPolyline) {
              const durationSeconds = parseInt(route.duration, 10);
              const decoded = window.google.maps.geometry.encoding.decodePath(
                route.polyline.encodedPolyline,
              );
              const path = decoded.getArray().map((pt) => ({ lat: pt.lat(), lng: pt.lng() }));
              segments.push({ fromIndex: i, toIndex: i + 1, path, durationSeconds, gapSeconds, isTight: durationSeconds > gapSeconds - 300 });
            } else {
              usedFallback = true;
            }
          }
        } catch {
          firstApiError ??= "Network error contacting Routes API";
          usedFallback = true;
        }

        if (usedFallback) {
          segments.push({ ...straightLineSegment(i, i + 1, fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng, gapSeconds), isFallback: true });
        }
      }

      if (firstApiError) setRouteApiError(firstApiError);
      setRouteSegments(segments);
      setIsComputingRoutes(false);
    }

    void compute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, events.length, date]);

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

        {routeApiError && !isComputingRoutes && (
          <div className="px-4 py-2 bg-orange-900/30 border-b border-orange-500/20 text-orange-300 text-xs">
            <p className="font-semibold mb-0.5">Routes API unavailable — showing estimates</p>
            <p className="text-orange-400/80">{routeApiError}</p>
            <p className="mt-1 text-orange-400/60">Enable the <strong>Routes API</strong> in Google Cloud Console to get real walking paths.</p>
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
              const isVirtual = !building;

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
                        {event.location || "No location"}
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
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            styles: [{ featureType: "poi.school", elementType: "labels", stylers: [{ visibility: "on" }] }],
          }}
        >
          {/* Markers for each class location */}
          {events.map((event, i) => {
            const building = resolveBuilding(event.location);
            if (!building) return null;
            return (
              <Marker
                key={event.uid}
                position={{ lat: building.lat, lng: building.lng }}
                label={{
                  text: String(i + 1),
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
                title={`${event.summary} — ${building.name}`}
              />
            );
          })}

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

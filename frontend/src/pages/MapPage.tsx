import { useEffect, useState, useRef, useMemo, useCallback } from "react";
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

export type StartLocation = {
  lat: number;
  lng: number;
  label: string;
  savedId?: string;
};

export type SavedPin = {
  id: string;
  label: string;
  lat: number;
  lng: number;
};

export const START_LOCATION_KEY = "asuStartLocation";
export const SAVED_PINS_KEY = "asuSavedPins";

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

function offsetDate(dateStr: string, days: number) {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const LIBRARIES: ("geometry" | "marker")[] = ["geometry", "marker"];

const SELECTED_ROUTE_COLOR = "#FFD54F"; // bright yellow when a route is clicked/active
const START_ROUTE_COLOR = "#FFC627";   // ASU gold for the segment from start pin to first class

const ROUTE_COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#8B5CF6", // violet
  "#F97316", // orange
  "#06B6D4", // cyan
  "#EC4899", // pink
  "#84CC16", // lime
  "#A78BFA", // purple-light
  "#F59E0B", // amber
  "#14B8A6", // teal
  "#6366F1", // indigo
  "#FB7185", // rose
  "#34D399", // green-light
  "#60A5FA", // blue-light
  "#C084FC", // fuchsia
  "#FBBF24", // yellow
  "#2DD4BF", // teal-light
  "#818CF8", // indigo-light
  "#4ADE80", // green-bright
];

export default function MapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
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

  const [startLocation, setStartLocationState] = useState<StartLocation | null>(() => {
    try {
      const raw = localStorage.getItem(START_LOCATION_KEY);
      return raw ? (JSON.parse(raw) as StartLocation) : null;
    } catch {
      return null;
    }
  });

  const [savedPins, setSavedPinsState] = useState<SavedPin[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_PINS_KEY);
      return raw ? (JSON.parse(raw) as SavedPin[]) : [];
    } catch {
      return [];
    }
  });

  const [isPickingStart, setIsPickingStart] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [savePinLabel, setSavePinLabel] = useState("");
  const startMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  function persistStartLocation(loc: StartLocation | null) {
    if (loc) localStorage.setItem(START_LOCATION_KEY, JSON.stringify(loc));
    else localStorage.removeItem(START_LOCATION_KEY);
    setStartLocationState(loc);
  }

  function persistSavedPins(pins: SavedPin[]) {
    localStorage.setItem(SAVED_PINS_KEY, JSON.stringify(pins));
    setSavedPinsState(pins);
  }

  function saveCurrentPin() {
    if (!startLocation || !savePinLabel.trim()) return;
    const pin: SavedPin = {
      id: crypto.randomUUID(),
      label: savePinLabel.trim(),
      lat: startLocation.lat,
      lng: startLocation.lng,
    };
    persistSavedPins([...savedPins, pin]);
    persistStartLocation({ ...startLocation, label: pin.label, savedId: pin.id });
    setSavePinLabel("");
  }

  function loadSavedPin(pin: SavedPin) {
    persistStartLocation({ lat: pin.lat, lng: pin.lng, label: pin.label, savedId: pin.id });
  }

  function deleteSavedPin(id: string) {
    persistSavedPins(savedPins.filter((p) => p.id !== id));
    if (startLocation?.savedId === id) {
      persistStartLocation({ ...startLocation, savedId: undefined });
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        persistStartLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: "My Location" });
        setIsGeolocating(false);
      },
      () => setIsGeolocating(false),
    );
  }

  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [isComputingRoutes, setIsComputingRoutes] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const markerContentsRef = useRef<HTMLDivElement[]>([]);
  const startMarkerContentRef = useRef<HTMLDivElement | null>(null);
  const [activeEventIndex, setActiveEventIndex] = useState<number | null>(null);
  const [activeRouteSegmentIndex, setActiveRouteSegmentIndex] = useState<number | null>(null);

  useEffect(() => {
    setRouteSegments([]);
    setActiveEventIndex(null);
    setActiveRouteSegmentIndex(null);
  }, [date]);

  const highlightedRouteIndexes = useMemo(() => {
    const selected = new Set<number>();
    if (activeEventIndex !== null) selected.add(activeEventIndex);
    if (activeRouteSegmentIndex !== null) {
      const seg = routeSegments[activeRouteSegmentIndex];
      if (seg) {
        if (seg.fromIndex >= 0) selected.add(seg.fromIndex);
        if (seg.toIndex >= 0) selected.add(seg.toIndex);
      }
    }
    return selected;
  }, [activeEventIndex, activeRouteSegmentIndex, routeSegments]);
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
    if (!isLoaded || events.length === 0) return;

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

    async function fetchRoute(
      fromIndex: number,
      toIndex: number,
      fromCoords: { lat: number; lng: number },
      toCoords: { lat: number; lng: number },
      gapSeconds: number,
    ): Promise<RouteSegment> {
      try {
        const result = await trpcClient.schedule.route.query({
          originLat: fromCoords.lat,
          originLng: fromCoords.lng,
          destLat: toCoords.lat,
          destLng: toCoords.lng,
        });
        if (result.ok) {
          const decoded = window.google.maps.geometry.encoding.decodePath(result.encodedPolyline);
          return {
            fromIndex,
            toIndex,
            path: decoded.map((pt) => ({ lat: pt.lat(), lng: pt.lng() })),
            durationSeconds: result.durationSeconds,
            gapSeconds,
            isTight: result.durationSeconds > gapSeconds - 300,
          };
        }
      } catch {
        // fall through to straight line
      }
      return {
        ...straightLineSegment(fromIndex, toIndex, fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng, gapSeconds),
        isFallback: true,
      };
    }

    async function compute() {
      setIsComputingRoutes(true);
      setRouteSegments([]);
      setActiveEventIndex(null);
      setActiveRouteSegmentIndex(null);
      const segments: RouteSegment[] = [];

      if (events.length === 0) {
        setIsComputingRoutes(false);
        return;
      }

      if (startLocation && events.length > 0) {
        const firstB = resolveBuilding(events[0].location);
        const firstCoords = firstB ? { lat: firstB.lat, lng: firstB.lng } : await geocodeLocation(events[0].location);
        if (firstCoords) {
          const seg = await fetchRoute(-1, 0, startLocation, firstCoords, Infinity);
          seg.isTight = false;
          segments.push(seg);
        }
      }

      for (let i = 0; i < events.length - 1; i++) {
        const from = events[i];
        const to = events[i + 1];
        const fromB = resolveBuilding(from.location);
        const toB = resolveBuilding(to.location);

        const fromCoords = fromB ? { lat: fromB.lat, lng: fromB.lng } : await geocodeLocation(from.location);
        const toCoords = toB ? { lat: toB.lat, lng: toB.lng } : await geocodeLocation(to.location);

        if (!fromCoords || !toCoords) continue;
        if (fromB && toB && fromB.code === toB.code) continue;
        if (fromCoords.lat === toCoords.lat && fromCoords.lng === toCoords.lng) continue;

        const gapSeconds = (to.start.getTime() - from.end.getTime()) / 1000;
        segments.push(await fetchRoute(i, i + 1, fromCoords, toCoords, gapSeconds));
      }

      setRouteSegments(segments);
      setIsComputingRoutes(false);
    }

    void compute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, events.length, date, startLocation]);

  useEffect(() => {
    if (!map || events.length === 0) return;

    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];
    markerContentsRef.current = [];

    const createMarkers = async () => {
      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

      for (const [i, event] of events.entries()) {
        const building = resolveBuilding(event.location);
        const coords = building
          ? { lat: building.lat, lng: building.lng }
          : await geocodeLocation(event.location);
        if (!coords) continue;
        const displayName = building?.name ?? event.location;

        const content = document.createElement("div");
        content.style.color = "white";
        content.style.fontWeight = "bold";
        content.style.fontSize = "12px";
        content.style.background = "#8C1D40";
        content.style.borderRadius = "50%";
        content.style.width = "24px";
        content.style.height = "24px";
        content.style.display = "flex";
        content.style.alignItems = "center";
        content.style.justifyContent = "center";
        content.style.border = "2px solid white";
        content.style.transition = "transform 0.15s ease, width 0.15s ease, height 0.15s ease, border 0.15s ease, font-size 0.15s ease";
        content.textContent = String(i + 1);

        const marker = new AdvancedMarkerElement({
          map,
          position: coords,
          content,
          title: `${event.summary} — ${displayName}`,
        });

        marker.addListener("gmp-click", () => {
          setActiveEventIndex(i);
          setActiveRouteSegmentIndex(null);
        });
        markersRef.current.push(marker);
        markerContentsRef.current.push(content);
      }
    };

    createMarkers();
  }, [map, events]);

  useEffect(() => {
    if (!map || !isLoaded) return;

    if (startMarkerRef.current) {
      startMarkerRef.current.map = null;
      startMarkerRef.current = null;
      startMarkerContentRef.current = null;
    }

    if (!startLocation) return;

    const createStartMarker = async () => {
      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

      const content = document.createElement("div");
      content.style.background = "#FFC627";
      content.style.borderRadius = "50%";
      content.style.width = "28px";
      content.style.height = "28px";
      content.style.display = "flex";
      content.style.alignItems = "center";
      content.style.justifyContent = "center";
      content.style.border = "3px solid white";
      content.style.fontSize = "14px";
      content.style.transition = "transform 0.15s ease, width 0.15s ease, height 0.15s ease, border 0.15s ease, font-size 0.15s ease";
      content.textContent = "⚑";

      startMarkerRef.current = new AdvancedMarkerElement({
        map,
        position: startLocation,
        content,
        title: startLocation.label,
      });
      startMarkerContentRef.current = content;
    };

    createStartMarker();
  }, [map, isLoaded, startLocation]);

  useEffect(() => {
    const selectedMarkerIndexes = new Set<number>();
    if (activeEventIndex !== null) selectedMarkerIndexes.add(activeEventIndex);
    if (activeRouteSegmentIndex !== null) {
      const seg = routeSegments[activeRouteSegmentIndex];
      if (seg) {
        if (seg.fromIndex >= 0) selectedMarkerIndexes.add(seg.fromIndex);
        if (seg.toIndex >= 0) selectedMarkerIndexes.add(seg.toIndex);
      }
    }

    markerContentsRef.current.forEach((content, index) => {
      const isSelected = selectedMarkerIndexes.has(index);
      content.style.width = isSelected ? "32px" : "24px";
      content.style.height = isSelected ? "32px" : "24px";
      content.style.fontSize = isSelected ? "14px" : "12px";
      content.style.borderWidth = isSelected ? "3px" : "2px";
      content.style.transform = isSelected ? "scale(1.15)" : "scale(1)";
    });

    if (startMarkerContentRef.current) {
      const startSelected = activeRouteSegmentIndex !== null && routeSegments[activeRouteSegmentIndex]?.fromIndex === -1;
      const content = startMarkerContentRef.current;
      content.style.width = startSelected ? "34px" : "28px";
      content.style.height = startSelected ? "34px" : "28px";
      content.style.transform = startSelected ? "scale(1.1)" : "scale(1)";
    }
  }, [activeEventIndex, activeRouteSegmentIndex, routeSegments]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (isPickingStart && e.latLng) {
      persistStartLocation({ lat: e.latLng.lat(), lng: e.latLng.lng(), label: "Custom Pin" });
      setIsPickingStart(false);
    } else {
      setActiveEventIndex(null);
      setActiveRouteSegmentIndex(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPickingStart]);

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
  const startSeg = routeSegments.find((s) => s.fromIndex === -1);
  const isCurrentPinSaved = !!startLocation?.savedId && savedPins.some((p) => p.id === startLocation.savedId);

  return (
    <div className="flex h-screen overflow-hidden relative">
      {sidebarOpen && (
        <div
          className="md:hidden absolute inset-0 bg-black/50 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        w-80 shrink-0 flex flex-col border-r border-white/10 overflow-y-auto
        absolute md:relative inset-y-0 left-0 z-20 transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `} style={{ background: "#111118" }}>
        <div
          className="p-4 border-b border-white/10"
          style={{ background: "var(--color-asu-maroon)", boxShadow: "0 1px 0 rgba(255,198,39,0.2)" }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-lg" style={{ color: "var(--color-asu-gold)" }}>🗺</span>
              <span className="text-white font-bold text-sm">ASU Navigator</span>
            </div>
            <button
              onClick={() => navigate(isSimulate ? "/simulate" : `/dashboard?schedule=${scheduleId}&date=${date}`)}
              className="text-white/60 hover:text-white text-xs transition-colors px-2 py-1 rounded hover:bg-white/10"
            >
              ← Back
            </button>
          </div>
          <p className="text-white/60 text-xs mt-1">
            {new Date(date + "T12:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveEventIndex(null);
                setActiveRouteSegmentIndex(null);
                setRouteSegments([]);
                setSearchParams((p) => { p.set("date", offsetDate(date, -1)); return p; });
              }}
              className="px-3 py-1 rounded-lg bg-white/10 text-white text-xs transition-colors hover:bg-white/20"
            >
              Yesterday
            </button>
            <button
              onClick={() => {
                setActiveEventIndex(null);
                setActiveRouteSegmentIndex(null);
                setRouteSegments([]);
                setSearchParams((p) => { p.set("date", todayStr()); return p; });
              }}
              className="px-3 py-1 rounded-lg bg-asu-gold/10 text-asu-gold text-xs transition-colors hover:bg-asu-gold/20"
            >
              Today
            </button>
            <button
              onClick={() => {
                setActiveEventIndex(null);
                setActiveRouteSegmentIndex(null);
                setRouteSegments([]);
                setSearchParams((p) => { p.set("date", offsetDate(date, 1)); return p; });
              }}
              className="px-3 py-1 rounded-lg bg-white/10 text-white text-xs transition-colors hover:bg-white/20"
            >
              Tomorrow
            </button>
          </div>
        </div>

        {/* Starting location */}
        <div className="p-3 border-b border-white/10">
          <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">Starting From</p>

          {startLocation && (
            <div className="space-y-2 mb-2">
              <div className="bg-asu-gold/10 border border-asu-gold/30 rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-asu-gold text-sm shrink-0">⚑</span>
                    <p className="text-white text-sm truncate">{startLocation.label}</p>
                  </div>
                  <button
                    onClick={() => persistStartLocation(null)}
                    className="text-gray-500 hover:text-red-400 transition-colors text-sm shrink-0"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {!isCurrentPinSaved && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Name this pin…"
                    value={savePinLabel}
                    onChange={(e) => setSavePinLabel(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveCurrentPin()}
                    className="flex-1 bg-white/5 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-white/40"
                  />
                  <button
                    onClick={saveCurrentPin}
                    disabled={!savePinLabel.trim()}
                    className="px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs disabled:opacity-40 transition-colors"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={() => { setIsPickingStart(true); setSidebarOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
                isPickingStart
                  ? "bg-asu-gold/20 border-asu-gold/40 text-asu-gold"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/8"
              }`}
            >
              {isPickingStart ? "Click anywhere on the map…" : "📍 Click map to pin start"}
            </button>
            <button
              onClick={useMyLocation}
              disabled={isGeolocating}
              className="w-full text-left px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-gray-300 hover:bg-white/8 transition-colors disabled:opacity-50"
            >
              {isGeolocating ? "Getting location…" : "⊕ Use my current location"}
            </button>
          </div>

          {savedPins.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-gray-500 text-xs mb-1.5">Saved pins</p>
              {savedPins.map((pin) => {
                const isActive = startLocation?.savedId === pin.id;
                return (
                  <div
                    key={pin.id}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border text-sm ${
                      isActive
                        ? "bg-asu-gold/10 border-asu-gold/30"
                        : "bg-white/3 border-white/10"
                    }`}
                  >
                    <span className={isActive ? "text-asu-gold" : "text-gray-500"}>⚑</span>
                    <span className={`flex-1 truncate text-xs ${isActive ? "text-white" : "text-gray-300"}`}>
                      {pin.label}
                    </span>
                    {!isActive && (
                      <button
                        onClick={() => loadSavedPin(pin)}
                        className="text-xs text-gray-400 hover:text-white transition-colors"
                      >
                        Use
                      </button>
                    )}
                    <button
                      onClick={() => deleteSavedPin(pin.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
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
                  {i === 0 && startSeg && (
                    <div className="mx-3 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 bg-asu-gold/10 border border-asu-gold/20 text-asu-gold">
                      ⚑ <span>{Math.round(startSeg.durationSeconds / 60)} min walk to class</span>
                    </div>
                  )}
                      <button
                    onClick={() => {
                      setActiveEventIndex(isActive ? null : i);
                      setActiveRouteSegmentIndex(null);
                    }}
                    className={`w-full text-left rounded-xl p-3 border transition-colors ${
                      isActive
                        ? "bg-asu-maroon/30 border-asu-maroon/60"
                        : highlightedRouteIndexes.has(i)
                        ? "bg-asu-maroon/20 border-asu-maroon/40"
                        : "bg-white/5 border-white/10 hover:bg-white/[0.08]"
                    }`}
                  >
                    <p className="text-white text-sm font-semibold truncate">{event.summary}</p>
                    <p className="text-xs mt-0.5 font-medium tabular-nums" style={{ color: "var(--color-asu-gold)", opacity: 0.8 }}>
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

        {isPickingStart && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-asu-gold text-gray-900 font-semibold text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none">
            Click anywhere on the map to set your start
          </div>
        )}

        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={{ lat: mapCenter.lat, lng: mapCenter.lng }}
          zoom={mapCenter.zoom}
          onLoad={(mapInstance) => setMap(mapInstance)}
          onClick={handleMapClick}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: true,
            mapTypeControl: true,
            mapId: "bdfa66bd0ca03dc990ecaed7",
          }}
        >
          {routeSegments.map((seg, idx) => {
            const isSelected = activeRouteSegmentIndex === idx;
            return (
              <Polyline
                key={`${seg.fromIndex}-${seg.toIndex}`}
                path={seg.path}
                onClick={() => setActiveRouteSegmentIndex(isSelected ? null : idx)}
                options={{
                  strokeColor: isSelected ? SELECTED_ROUTE_COLOR : seg.fromIndex === -1 ? START_ROUTE_COLOR : ROUTE_COLORS[idx % ROUTE_COLORS.length],
                  strokeWeight: isSelected ? 8 : seg.isFallback ? 3 : 5,
                  strokeOpacity: isSelected ? 1 : seg.isFallback ? 0.55 : 0.85,
                  zIndex: isSelected ? 2 : 1,
                  icons: seg.isFallback
                    ? [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "12px" }]
                    : undefined,
                }}
              />
            );
          })}
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
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-2xl p-4 w-72 z-10"
            style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{activeEvent.summary}</p>
                <p className="text-xs mt-1 font-medium tabular-nums" style={{ color: "var(--color-asu-gold)", opacity: 0.85 }}>
                  {formatTime(activeEvent.start)} – {formatTime(activeEvent.end)}
                </p>
                {activeBuilding ? (
                  <p className="text-gray-300 text-xs mt-1">
                    {activeBuilding.name}
                    <span className="text-gray-500"> · {CAMPUS_LABELS[activeBuilding.campus]}</span>
                  </p>
                ) : (
                  <p className="text-gray-500 text-xs mt-1 italic">{activeEvent.location}</p>
                )}
              </div>
              <button
                onClick={() => setActiveEventIndex(null)}
                className="text-gray-500 hover:text-white text-base leading-none shrink-0 mt-0.5 transition-colors"
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

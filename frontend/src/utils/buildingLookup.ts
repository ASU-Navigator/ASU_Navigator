import { ASU_BUILDINGS, type Building } from "../data/asuBuildings";

export function resolveBuilding(locationString: string): Building | null {
  if (!locationString) return null;
  const upper = locationString.toUpperCase().trim();

  // Skip virtual/online classes
  if (upper.includes("ONLINE") || upper.includes("VIRTUAL") || upper.includes("ZOOM")) {
    return null;
  }

  // Priority 1: bracketed code like [WGHL]
  const bracketMatch = upper.match(/\[([A-Z0-9_]+)\]/);
  if (bracketMatch) {
    const found = ASU_BUILDINGS.find((b) => b.code === bracketMatch[1]);
    if (found) return found;
  }

  // Priority 2: code at start followed by space+digits (e.g. "COOR 174")
  const prefixMatch = upper.match(/^([A-Z][A-Z0-9]{1,7})\s+\d/);
  if (prefixMatch) {
    const found = ASU_BUILDINGS.find((b) => b.code === prefixMatch[1]);
    if (found) return found;
  }

  // Priority 3: exact code anywhere in string
  for (const building of ASU_BUILDINGS) {
    if (upper.includes(building.code + " ") || upper.includes(building.code + ",")) {
      return building;
    }
  }

  // Priority 4: building name contains check
  return (
    ASU_BUILDINGS.find((b) => upper.includes(b.name.toUpperCase())) ?? null
  );
}

export function extractRoom(locationString: string): string {
  // Try to extract room number like "101", "B201", "LL04"
  const match = locationString.match(/\b([A-Z]?\d{2,4}[A-Z]?)\b/);
  return match ? match[1] : "";
}

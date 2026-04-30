import { ASU_BUILDINGS, type Building } from "../data/asuBuildings";

export function resolveBuilding(locationString: string): Building | null {
  if (!locationString) return null;
  const upper = locationString.toUpperCase().trim();

  if (upper.includes("ONLINE") || upper.includes("VIRTUAL") || upper.includes("ZOOM")) {
    return null;
  }

  const bracketMatch = upper.match(/\[([A-Z0-9_]+)\]/);
  if (bracketMatch) {
    const found = ASU_BUILDINGS.find((b) => b.code === bracketMatch[1]);
    if (found) return found;
  }

  const psCodeMatch = upper.match(/PSCODE=([A-Z0-9]+)/);
  if (psCodeMatch) {
    const found = ASU_BUILDINGS.find((b) => b.code === psCodeMatch[1]);
    if (found) return found;
  }

  const prefixMatch = upper.match(/\b([A-Z][A-Z0-9]{1,7})\s+\d/);
  if (prefixMatch) {
    const found = ASU_BUILDINGS.find((b) => b.code === prefixMatch[1]);
    if (found) return found;
  }

  for (const building of ASU_BUILDINGS) {
    const codeRegex = new RegExp(`\\b${building.code}\\b`);
    if (codeRegex.test(upper)) {
      return building;
    }
  }

  return (
    ASU_BUILDINGS.find((b) => upper.includes(b.name.toUpperCase())) ?? null
  );
}

export function extractRoom(locationString: string): string {
  const match = locationString.match(/\b([A-Z]?\d{2,4}[A-Z]?)\b/);
  return match ? match[1] : "";
}

import buildingsData from './scripts/asu_buildings.json';

export type Campus = "tempe" | "west" | "polytechnic" | "downtown";

export type Building = {
  code: string;
  name: string;
  campus: Campus;
  lat: number;
  lng: number;
};

export const ASU_BUILDINGS: Building[] = buildingsData.map(({ place_id, ...rest }) => rest as Building);

export const CAMPUS_CENTERS: Record<Campus, { lat: number; lng: number; zoom: number }> = {
  tempe:       { lat: 33.4195, lng: -111.9335, zoom: 17 },
  west:        { lat: 33.6065, lng: -112.1534, zoom: 17 },
  polytechnic: { lat: 33.3053, lng: -111.6784, zoom: 17 },
  downtown:    { lat: 33.4500, lng: -112.0667, zoom: 17 },
};

export const CAMPUS_LABELS: Record<Campus, string> = {
  tempe:       "Tempe",
  west:        "West",
  polytechnic: "Polytechnic",
  downtown:    "Downtown Phoenix",
};

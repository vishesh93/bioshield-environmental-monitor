// Real data overrides per monitoring station
// Fill this with known-good values (and source) to show exact readings in the UI.
// Matching is case-insensitive by station name. You may also add an "id" to target a specific DB id.

export type Pollutants = {
  lead: number;
  mercury: number;
  cadmium: number;
  arsenic: number;
};

export interface StationOverride {
  // Match either by exact name (case-insensitive) or by id if known
  name?: string;
  id?: number;
  pollutants: Pollutants;
  // Optional metadata
  lastUpdated?: string; // ISO timestamp
  source?: string; // URL or citation
}

export const STATION_OVERRIDES: StationOverride[] = [
  // Example template (disabled):
  // {
  //   name: 'Ganga - Patna',
  //   pollutants: { lead: 0.34, mercury: 0.07, cadmium: 0.04, arsenic: 0.07 },
  //   lastUpdated: '2025-09-19T00:00:00.000Z',
  //   source: 'https://example.com/source',
  // },
];

export function findOverride(name: string, id?: number): StationOverride | undefined {
  const normalizedName = (name || '').trim().toLowerCase();
  return STATION_OVERRIDES.find((o) => {
    const nameMatch = o.name ? o.name.trim().toLowerCase() === normalizedName : false;
    const idMatch = typeof o.id === 'number' && typeof id === 'number' ? o.id === id : false;
    return nameMatch || idMatch;
  });
}

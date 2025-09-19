// Database types (imported from supabaseClient)
import { MonitoringStation as DBMStation } from '../supabaseClient';

// Extended interface for UI components
export interface MonitoringStation extends DBMStation {
  city: string;
  state: string;
  coordinates: [number, number]; // [lat, lng]
  status: 'safe' | 'caution' | 'danger';
  pollutants: {
    lead: number;
    mercury: number;
    cadmium: number;
    arsenic: number;
  };
  lastUpdated: Date;
}

export interface TimeSeriesData {
  timestamp: string;
  lead: number;
  mercury: number;
  cadmium: number;
  arsenic: number;
}

export interface Alert {
  id: string;
  stationId: string;
  stationName: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

// Top 5 monitoring stations for consistent dashboard display
// Static timestamp to prevent constant updates
const STATIC_TIMESTAMP = new Date('2024-01-15T10:30:00Z');

// Function to calculate station status based on pollutant levels
const calculateStationStatus = (pollutants: {
  lead: number;
  mercury: number;
  cadmium: number;
  arsenic: number;
}): 'safe' | 'caution' | 'danger' => {
  // Thresholds for each pollutant (in ppm) - matching Dashboard.tsx
  const thresholds = {
    lead: { safe: 0.2, caution: 0.5 },
    mercury: { safe: 0.05, caution: 0.1 },
    cadmium: { safe: 0.03, caution: 0.06 },
    arsenic: { safe: 0.05, caution: 0.1 },
  };

  // Check if ANY pollutant is in danger zone
  if (pollutants.lead > thresholds.lead.caution ||
      pollutants.mercury > thresholds.mercury.caution ||
      pollutants.cadmium > thresholds.cadmium.caution ||
      pollutants.arsenic > thresholds.arsenic.caution) {
    return 'danger';
  }

  // Check if ANY pollutant is in caution zone
  if (pollutants.lead > thresholds.lead.safe ||
      pollutants.mercury > thresholds.mercury.safe ||
      pollutants.cadmium > thresholds.cadmium.safe ||
      pollutants.arsenic > thresholds.arsenic.safe) {
    return 'caution';
  }

  return 'safe';
};

console.log('🔄 LOADING UPDATED MOCK DATA - Station changes should be visible now!');

export const monitoringStations: MonitoringStation[] = [
  {
    id: 1,
    name: 'Ganga - Haridwar',
    lat: 29.9457,
    lng: 78.1642,
    description: 'Ganga river monitoring station in Haridwar',
    created_at: STATIC_TIMESTAMP.toISOString(),
    city: 'Haridwar',
    state: 'Uttarakhand',
    coordinates: [29.9457, 78.1642],
    pollutants: {
      lead: 0.12, // SAFE LEVEL (≤ 0.2)
      mercury: 0.03, // SAFE LEVEL (≤ 0.05)
      cadmium: 0.015, // SAFE LEVEL (≤ 0.03)
      arsenic: 0.035 // SAFE LEVEL (≤ 0.05)
    },
    get status() {
      return calculateStationStatus(this.pollutants);
    },
    lastUpdated: STATIC_TIMESTAMP
  },
  {
    id: 2,
    name: 'Hooghly - Kolkata',
    lat: 22.5726,
    lng: 88.3639,
    description: 'Hooghly river monitoring station in Kolkata',
    created_at: STATIC_TIMESTAMP.toISOString(),
    city: 'Kolkata',
    state: 'West Bengal',
    coordinates: [22.5726, 88.3639],
    pollutants: {
      lead: 0.42, // CAUTION LEVEL (0.2 < x ≤ 0.5)
      mercury: 0.09, // CAUTION LEVEL (0.05 < x ≤ 0.1)
      cadmium: 0.05, // CAUTION LEVEL (0.03 < x ≤ 0.06)
      arsenic: 0.08 // CAUTION LEVEL (0.05 < x ≤ 0.1)
    },
    get status() {
      return calculateStationStatus(this.pollutants);
    },
    lastUpdated: STATIC_TIMESTAMP
  },
  {
    id: 3,
    name: 'Yamuna - New Delhi',
    lat: 28.7135,
    lng: 77.2234,
    description: 'Yamuna river monitoring station in New Delhi',
    created_at: STATIC_TIMESTAMP.toISOString(),
    city: 'New Delhi',
    state: 'Delhi',
    coordinates: [28.7135, 77.2234],
    pollutants: {
      lead: 0.75, // DANGER LEVEL (>0.5)
      mercury: 0.13, // DANGER LEVEL (>0.1)
      cadmium: 0.09, // DANGER LEVEL (>0.06)
      arsenic: 0.12 // DANGER LEVEL (>0.1)
    },
    get status() {
      return calculateStationStatus(this.pollutants);
    },
    lastUpdated: STATIC_TIMESTAMP
  },
  {
    id: 4,
    name: 'Godavari - Nashik',
    lat: 19.9975,
    lng: 73.7898,
    description: 'Godavari river monitoring station in Nashik',
    created_at: STATIC_TIMESTAMP.toISOString(),
    city: 'Nashik',
    state: 'Maharashtra',
    coordinates: [19.9975, 73.7898],
    pollutants: {
      lead: 0.15, // SAFE LEVEL (≤ 0.2)
      mercury: 0.03, // SAFE LEVEL (≤ 0.05)
      cadmium: 0.02, // SAFE LEVEL (≤ 0.03)
      arsenic: 0.04 // SAFE LEVEL (≤ 0.05)
    },
    get status() {
      return calculateStationStatus(this.pollutants);
    },
    lastUpdated: STATIC_TIMESTAMP
  },
  {
    id: 5,
    name: 'Ganga - Patna',
    lat: 25.5941,
    lng: 85.1376,
    description: 'Ganga river monitoring station in Patna',
    created_at: STATIC_TIMESTAMP.toISOString(),
    city: 'Patna',
    state: 'Bihar',
    coordinates: [25.5941, 85.1376],
    pollutants: {
      lead: 0.35, // CAUTION LEVEL (0.2 < x ≤ 0.5)
      mercury: 0.07, // CAUTION LEVEL (0.05 < x ≤ 0.1)
      cadmium: 0.04, // CAUTION LEVEL (0.03 < x ≤ 0.06)
      arsenic: 0.08 // CAUTION LEVEL (0.05 < x ≤ 0.1)
    },
    get status() {
      return calculateStationStatus(this.pollutants);
    },
    lastUpdated: STATIC_TIMESTAMP
  },
  {
    id: 6,
    name: 'Ganga - Prayagraj',
    lat: 25.4358,
    lng: 81.8463,
    description: 'Ganga river monitoring station in Prayagraj (formerly Allahabad)',
    created_at: STATIC_TIMESTAMP.toISOString(),
    city: 'Prayagraj',
    state: 'Uttar Pradesh',
    coordinates: [25.4358, 81.8463],
    pollutants: {
      lead: 0.25, // CAUTION LEVEL (0.2 < x ≤ 0.5)
      mercury: 0.08, // CAUTION LEVEL (0.05 < x ≤ 0.1)
      cadmium: 0.04, // CAUTION LEVEL (0.03 < x ≤ 0.06)
      arsenic: 0.07 // CAUTION LEVEL (0.05 < x ≤ 0.1)
    },
    get status() {
      return calculateStationStatus(this.pollutants);
    },
    lastUpdated: STATIC_TIMESTAMP
  }
];

// Simple deterministic pseudo-random function based on seed
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Generate STATIC time series data for the last 30 days - NEVER CHANGES
export const generateTimeSeriesData = (): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const baseDate = new Date('2024-01-15'); // Fixed reference date
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    // Use deterministic "random" values based on day index
    const seed = i * 1000; // Unique seed for each day
    
    data.push({
      timestamp: date.toISOString().split('T')[0],
      lead: 0.2 + seededRandom(seed + 1) * 0.6,
      mercury: 0.01 + seededRandom(seed + 2) * 0.1,
      cadmium: 0.005 + seededRandom(seed + 3) * 0.06,
      arsenic: 0.02 + seededRandom(seed + 4) * 0.12
    });
  }
  
  return data;
};

export const mockAlerts: Alert[] = [
  {
    id: 'mock-1',
    stationId: '1',
    stationName: 'Yamuna River - Delhi',
    type: 'critical',
    message: 'Lead levels exceed safe limits by 70%. Immediate action required.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    acknowledged: false
  },
  {
    id: 'mock-2',
    stationId: '3',
    stationName: 'Hooghly River - Kolkata',
    type: 'critical',
    message: 'Multiple heavy metals detected above threshold levels.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    acknowledged: false
  },
  {
    id: 'mock-3',
    stationId: '2',
    stationName: 'Ganges - Varanasi',
    type: 'warning',
    message: 'Mercury levels approaching caution threshold.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    acknowledged: true
  },
  {
    id: 'mock-4',
    stationId: '5',
    stationName: 'Kaveri River - Bangalore',
    type: 'warning',
    message: 'Arsenic levels showing upward trend.',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    acknowledged: false
  }
];

// Historical data for analytics - STATIC, NEVER CHANGES
export const generateHistoricalData = (stationId: string, days: number = 90): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const baseDate = new Date('2024-01-15'); // Fixed reference date
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    // Add deterministic variation based on station and day
    const baseMultiplier = stationId === '1' || stationId === '3' ? 2.5 : 1;
    const stationSeed = parseInt(stationId) * 1000;
    const daySeed = i;
    
    data.push({
      timestamp: date.toISOString().split('T')[0],
      lead: (0.1 + seededRandom(stationSeed + daySeed + 1) * 0.4) * baseMultiplier,
      mercury: (0.01 + seededRandom(stationSeed + daySeed + 2) * 0.08) * baseMultiplier,
      cadmium: (0.005 + seededRandom(stationSeed + daySeed + 3) * 0.04) * baseMultiplier,
      arsenic: (0.02 + seededRandom(stationSeed + daySeed + 4) * 0.1) * baseMultiplier
    });
  }
  
  return data;
};

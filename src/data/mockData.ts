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
export const monitoringStations: MonitoringStation[] = [
  {
    id: 1,
    name: 'Yamuna River - Delhi',
    city: 'Delhi',
    state: 'Delhi',
    coordinates: [28.6139, 77.2090],
    status: 'danger',
    pollutants: {
      lead: 0.85, // ppm
      mercury: 0.12,
      cadmium: 0.08,
      arsenic: 0.15
    },
    lastUpdated: new Date()
  },
  {
    id: 2,
    name: 'Ganges - Varanasi',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    coordinates: [25.3176, 82.9739],
    status: 'caution',
    pollutants: {
      lead: 0.25,
      mercury: 0.08,
      cadmium: 0.04,
      arsenic: 0.07
    },
    lastUpdated: new Date()
  },
  {
    id: 3,
    name: 'Hooghly River - Kolkata',
    city: 'Kolkata',
    state: 'West Bengal',
    coordinates: [22.5726, 88.3639],
    status: 'caution',
    pollutants: {
      lead: 0.35,
      mercury: 0.06,
      cadmium: 0.05,
      arsenic: 0.09
    },
    lastUpdated: new Date()
  },
  {
    id: 4,
    name: 'Godavari River - Nashik',
    city: 'Nashik',
    state: 'Maharashtra',
    coordinates: [19.9975, 73.7898],
    status: 'safe',
    pollutants: {
      lead: 0.12,
      mercury: 0.02,
      cadmium: 0.01,
      arsenic: 0.03
    },
    lastUpdated: new Date()
  },
  {
    id: 5,
    name: 'Kaveri River - Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    coordinates: [12.9716, 77.5946],
    status: 'safe',
    pollutants: {
      lead: 0.18,
      mercury: 0.03,
      cadmium: 0.02,
      arsenic: 0.04
    },
    lastUpdated: new Date()
  }
];

// Generate time series data for the last 30 days
export const generateTimeSeriesData = (): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      timestamp: date.toISOString().split('T')[0],
      lead: 0.2 + Math.random() * 0.6,
      mercury: 0.01 + Math.random() * 0.1,
      cadmium: 0.005 + Math.random() * 0.06,
      arsenic: 0.02 + Math.random() * 0.12
    });
  }
  
  return data;
};

export const mockAlerts: Alert[] = [
  {
    id: 1,
    stationId: '1',
    stationName: 'Yamuna River - Delhi',
    type: 'critical',
    message: 'Lead levels exceed safe limits by 70%. Immediate action required.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    acknowledged: false
  },
  {
    id: 2,
    stationId: '3',
    stationName: 'Hooghly River - Kolkata',
    type: 'critical',
    message: 'Multiple heavy metals detected above threshold levels.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    acknowledged: false
  },
  {
    id: 3,
    stationId: '2',
    stationName: 'Ganges - Varanasi',
    type: 'warning',
    message: 'Mercury levels approaching caution threshold.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    acknowledged: true
  },
  {
    id: 4,
    stationId: '5',
    stationName: 'Kaveri River - Bangalore',
    type: 'warning',
    message: 'Arsenic levels showing upward trend.',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    acknowledged: false
  }
];

// Historical data for analytics
export const generateHistoricalData = (stationId: string, days: number = 90): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add some variation based on station (Delhi and Kolkata have higher pollution)
    const baseMultiplier = stationId === '1' || stationId === '3' ? 2.5 : 1;
    
    data.push({
      timestamp: date.toISOString().split('T')[0],
      lead: (0.1 + Math.random() * 0.4) * baseMultiplier,
      mercury: (0.01 + Math.random() * 0.08) * baseMultiplier,
      cadmium: (0.005 + Math.random() * 0.04) * baseMultiplier,
      arsenic: (0.02 + Math.random() * 0.1) * baseMultiplier
    });
  }
  
  return data;
};

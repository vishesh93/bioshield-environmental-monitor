// Firebase service for sensor data management
import { 
  ref, 
  push, 
  set, 
  onValue, 
  off, 
  query, 
  orderByChild, 
  limitToLast,
  DataSnapshot,
  DatabaseReference
} from 'firebase/database';
import { database, DB_PATHS } from '../config/firebase';

// Types for sensor data
export interface SensorReading {
  stationId: string;
  timestamp: number;
  ph: number;
  tds: number;
  temperature?: number;
  turbidity?: number;
  latitude: number;
  longitude: number;
  status: 'safe' | 'caution' | 'danger';
}

export interface StationData {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  lastUpdated: number;
  currentReading?: SensorReading;
}

class FirebaseService {
  // Add sensor reading to Firebase
  async addSensorReading(reading: SensorReading): Promise<string> {
    try {
      const readingsRef = ref(database, `${DB_PATHS.SENSOR_DATA}/${reading.stationId}`);
      const newReadingRef = push(readingsRef);
      await set(newReadingRef, {
        ...reading,
        timestamp: Date.now()
      });
      
      // Update real-time data
      const realtimeRef = ref(database, `${DB_PATHS.REAL_TIME}/${reading.stationId}`);
      await set(realtimeRef, reading);
      
      return newReadingRef.key!;
    } catch (error) {
      console.error('Error adding sensor reading:', error);
      throw error;
    }
  }

  // Listen to real-time sensor data for a specific station
  listenToStationData(stationId: string, callback: (reading: SensorReading | null) => void): () => void {
    const stationRef = ref(database, `${DB_PATHS.REAL_TIME}/${stationId}`);
    
    const unsubscribe = onValue(stationRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      callback(data);
    });

    // Return unsubscribe function
    return () => off(stationRef);
  }

  // Listen to all real-time sensor data
  listenToAllStations(callback: (stations: Record<string, SensorReading>) => void): () => void {
    const allStationsRef = ref(database, DB_PATHS.REAL_TIME);
    
    const unsubscribe = onValue(allStationsRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val() || {};
      callback(data);
    });

    return () => off(allStationsRef);
  }

  // Get historical data for a station
  async getHistoricalData(stationId: string, limit: number = 100): Promise<SensorReading[]> {
    try {
      const historicalRef = ref(database, `${DB_PATHS.SENSOR_DATA}/${stationId}`);
      const limitedQuery = query(
        historicalRef,
        orderByChild('timestamp'),
        limitToLast(limit)
      );

      return new Promise((resolve, reject) => {
        onValue(limitedQuery, (snapshot: DataSnapshot) => {
          const data = snapshot.val() || {};
          const readings: SensorReading[] = Object.values(data);
          resolve(readings.sort((a, b) => b.timestamp - a.timestamp));
        }, reject);
      });
    } catch (error) {
      console.error('Error getting historical data:', error);
      throw error;
    }
  }

  // Update station configuration
  async updateStationConfig(stationData: StationData): Promise<void> {
    try {
      const stationRef = ref(database, `${DB_PATHS.STATIONS}/${stationData.id}`);
      await set(stationRef, stationData);
    } catch (error) {
      console.error('Error updating station config:', error);
      throw error;
    }
  }

  // Get all station configurations
  async getStationConfigs(): Promise<StationData[]> {
    try {
      const stationsRef = ref(database, DB_PATHS.STATIONS);
      
      return new Promise((resolve, reject) => {
        onValue(stationsRef, (snapshot: DataSnapshot) => {
          const data = snapshot.val() || {};
          const stations: StationData[] = Object.values(data);
          resolve(stations);
        }, reject);
      });
    } catch (error) {
      console.error('Error getting station configs:', error);
      throw error;
    }
  }

  // Determine status based on sensor values
  calculateStatus(ph: number, tds: number): 'safe' | 'caution' | 'danger' {
    // pH should be between 6.5 and 8.5 for safe water
    // TDS should be below 500 ppm for safe water
    
    if (ph < 6.0 || ph > 9.0 || tds > 1000) {
      return 'danger';
    } else if (ph < 6.5 || ph > 8.5 || tds > 500) {
      return 'caution';
    }
    return 'safe';
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
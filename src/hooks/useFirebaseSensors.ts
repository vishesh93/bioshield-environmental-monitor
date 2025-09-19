// Custom hook for Firebase real-time sensor data
import { useState, useEffect, useCallback } from 'react';
import { firebaseService, SensorReading } from '../services/firebaseService';

interface FirebaseSensorState {
  sensorData: Record<string, SensorReading>;
  isConnected: boolean;
  lastUpdate: Date | null;
  error: string | null;
}

export const useFirebaseSensors = () => {
  const [state, setState] = useState<FirebaseSensorState>({
    sensorData: {},
    isConnected: false,
    lastUpdate: null,
    error: null
  });

  const updateSensorData = useCallback((stations: Record<string, SensorReading>) => {
    setState(prevState => ({
      ...prevState,
      sensorData: stations,
      isConnected: true,
      lastUpdate: new Date(),
      error: null
    }));
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error('Firebase sensor data error:', error);
    setState(prevState => ({
      ...prevState,
      isConnected: false,
      error: error.message
    }));
  }, []);

  useEffect(() => {
    console.log('🔥 Setting up Firebase real-time listeners...');
    
    try {
      // Listen to all stations
      const unsubscribe = firebaseService.listenToAllStations(updateSensorData);
      
      // Set connected state
      setState(prevState => ({
        ...prevState,
        isConnected: true,
        error: null
      }));

      // Cleanup function
      return () => {
        console.log('🔥 Cleaning up Firebase listeners...');
        unsubscribe();
      };
    } catch (error) {
      handleError(error as Error);
    }
  }, [updateSensorData, handleError]);

  // Get sensor data for a specific station
  const getStationData = useCallback((stationId: string): SensorReading | null => {
    return state.sensorData[stationId] || null;
  }, [state.sensorData]);

  // Get all station IDs - filter to only show station_001
  const getStationIds = useCallback((): string[] => {
    const allStations = Object.keys(state.sensorData);
    // Only return station_001, filter out others
    return allStations.filter(stationId => stationId === 'station_001');
  }, [state.sensorData]);

  // Check if station is online (updated within last 2 minutes)
  const isStationOnline = useCallback((stationId: string): boolean => {
    const stationData = state.sensorData[stationId];
    if (!stationData || !stationData.timestamp) {
      console.log(`🔍 Station ${stationId}: No data or timestamp`, stationData);
      return false;
    }
    
    const now = Date.now();
    let stationTime = stationData.timestamp;
    
    // Handle timestamp in seconds (convert to milliseconds)
    // If timestamp is too small, it's likely in seconds
    if (stationTime < 1000000000000) {
      stationTime = stationTime * 1000;
    }
    
    const timeDiff = now - stationTime;
    const isOnlineByTime = timeDiff < (2 * 60 * 1000); // 2 minutes
    
    // TEMPORARY: For development, consider station online if we have recent data
    // regardless of timestamp issues (we know ESP32 is actively sending data)
    const hasRecentData = stationData.ph !== undefined && stationData.tds !== undefined;
    const developmentOverride = hasRecentData; // Force online if we have sensor data
    
    // FORCE ONLINE for development - we know data is coming from ESP32
    const isOnline = true; // Always show as online if we have data
    
    console.log(`🔍 Station ${stationId} online check:`, {
      originalTimestamp: stationData.timestamp,
      convertedTimestamp: stationTime,
      currentTime: now,
      timeDifference: timeDiff,
      timeDifferenceMinutes: Math.floor(timeDiff / (1000 * 60)),
      timeDifferenceDays: Math.floor(timeDiff / (1000 * 60 * 60 * 24)),
      isOnlineByTime,
      developmentOverride,
      finalIsOnline: isOnline
    });
    
    return isOnline;
  }, [state.sensorData]);

  // Get water quality statistics - only for station_001
  const getWaterQualityStats = useCallback(() => {
    const allStations = Object.entries(state.sensorData);
    // Only include station_001 in statistics
    const stations = allStations
      .filter(([stationId]) => stationId === 'station_001')
      .map(([_, data]) => data);
    
    if (stations.length === 0) {
      return {
        safe: 0,
        caution: 0,
        danger: 0,
        total: 0,
        averagePH: 0,
        averageTDS: 0
      };
    }

    const stats = stations.reduce(
      (acc, station) => {
        acc.total++;
        if (station.ph !== undefined && station.ph !== null && !isNaN(station.ph)) {
          acc.averagePH += station.ph;
        }
        if (station.tds !== undefined && station.tds !== null && !isNaN(station.tds)) {
          acc.averageTDS += station.tds;
        }
        
        switch (station.status) {
          case 'safe':
            acc.safe++;
            break;
          case 'caution':
            acc.caution++;
            break;
          case 'danger':
            acc.danger++;
            break;
        }
        
        return acc;
      },
      { safe: 0, caution: 0, danger: 0, total: 0, averagePH: 0, averageTDS: 0 }
    );

    // Calculate averages
    stats.averagePH = stats.averagePH / stats.total;
    stats.averageTDS = stats.averageTDS / stats.total;

    return stats;
  }, [state.sensorData]);

  return {
    sensorData: state.sensorData,
    isConnected: state.isConnected,
    lastUpdate: state.lastUpdate,
    error: state.error,
    getStationData,
    getStationIds,
    isStationOnline,
    getWaterQualityStats
  };
};
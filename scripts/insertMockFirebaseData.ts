// Mock Firebase data insertion script for testing
// Run this to populate Firebase with test sensor data

import { ref, set } from 'firebase/database';
import { database } from '../src/config/firebase';

// Mock sensor readings that match the SensorReading interface
const mockSensorData = {
  'station_001': {
    stationId: 'station_001',
    timestamp: Date.now(),
    ph: 7.2,
    tds: 450,
    temperature: 24.5,
    latitude: 28.7041,
    longitude: 77.1025,
    status: 'safe'
  },
  'station_002': {
    stationId: 'station_002', 
    timestamp: Date.now(),
    ph: 6.1,
    tds: 650,
    temperature: 26.8,
    latitude: 19.0760,
    longitude: 72.8777,
    status: 'caution'
  },
  'station_003': {
    stationId: 'station_003',
    timestamp: Date.now(), 
    ph: 5.2,
    tds: 1200,
    temperature: 28.9,
    latitude: 22.5726,
    longitude: 88.3639,
    status: 'danger'
  }
};

// Function to insert mock data
async function insertMockData() {
  try {
    console.log('🔥 Inserting mock Firebase data...');
    
    // Insert each station's data
    for (const [stationId, data] of Object.entries(mockSensorData)) {
      const stationRef = ref(database, `realtime/${stationId}`);
      await set(stationRef, data);
      console.log(`✅ Inserted data for ${stationId}`);
    }
    
    console.log('🎉 Mock data insertion completed!');
  } catch (error) {
    console.error('❌ Error inserting mock data:', error);
  }
}

// Export for use
export { insertMockData, mockSensorData };

// If running directly with node
if (typeof window === 'undefined') {
  insertMockData();
}
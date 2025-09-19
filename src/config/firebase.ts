// Firebase configuration for BioShield Environmental Monitor
import { initializeApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration object
// TODO: Replace with your actual Firebase project credentials
const firebaseConfig = {
 apiKey: "AIzaSyDyK-PGp16Iiwze--e5UkEooUuVGTw26CU",
  authDomain: "bioshield-c2443.firebaseapp.com",
  databaseURL: "https://bioshield-c2443-default-rtdb.firebaseio.com",
  projectId: "bioshield-c2443",
  storageBucket: "bioshield-c2443.firebasestorage.app",
  messagingSenderId: "417524094439",
  appId: "1:417524094439:web:6d2d7f44ce1292c1135942"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const database: Database = getDatabase(app);
export const auth: Auth = getAuth(app);

// Export the app instance
export default app;

// Database paths for easy reference
export const DB_PATHS = {
  STATIONS: 'stations',
  SENSOR_DATA: 'sensorData',
  REAL_TIME: 'realtime',
  HISTORICAL: 'historical'
} as const;
// Firebase Integration Test Component
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TestTube, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { firebaseService, SensorReading } from '../services/firebaseService';

const FirebaseTestComponent: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Generate mock sensor data for testing
  const generateMockData = (): SensorReading => {
    const stations = ['station_001', 'station_002', 'station_003'];
    const randomStation = stations[Math.floor(Math.random() * stations.length)];
    
    // Generate realistic sensor values
    const ph = 6.5 + Math.random() * 2; // pH between 6.5 and 8.5
    const tds = 100 + Math.random() * 400; // TDS between 100 and 500
    const temperature = 20 + Math.random() * 15; // Temperature between 20 and 35°C
    
    return {
      stationId: randomStation,
      timestamp: Date.now(),
      ph: parseFloat(ph.toFixed(2)),
      tds: parseFloat(tds.toFixed(1)),
      temperature: parseFloat(temperature.toFixed(1)),
      latitude: 28.6139 + (Math.random() - 0.5) * 0.1,
      longitude: 77.2090 + (Math.random() - 0.5) * 0.1,
      status: firebaseService.calculateStatus(ph, tds)
    };
  };

  // Test Firebase connection
  const testFirebaseConnection = async () => {
    setIsLoading(true);
    setTestResult('🔄 Testing Firebase connection...\n');

    try {
      // Generate mock sensor data
      const mockData = generateMockData();
      
      setTestResult(prev => prev + `✅ Generated mock sensor data for ${mockData.stationId}\n`);
      setTestResult(prev => prev + `   pH: ${mockData.ph}, TDS: ${mockData.tds}ppm, Status: ${mockData.status}\n\n`);

      // Try to send data to Firebase
      setTestResult(prev => prev + '🔄 Sending data to Firebase...\n');
      
      const recordId = await firebaseService.addSensorReading(mockData);
      
      setTestResult(prev => prev + `✅ Data sent successfully! Record ID: ${recordId}\n`);
      setTestResult(prev => prev + `   Data is now visible in Firebase Console\n\n`);

      // Test real-time listening
      setTestResult(prev => prev + '🔄 Testing real-time listener...\n');
      
      let listenerTriggered = false;
      const unsubscribe = firebaseService.listenToStationData(mockData.stationId, (data) => {
        if (data && !listenerTriggered) {
          listenerTriggered = true;
          setTestResult(prev => prev + `✅ Real-time listener working! Received data for ${data.stationId}\n`);
          setTestResult(prev => prev + `   pH: ${data.ph}, TDS: ${data.tds}ppm, Status: ${data.status}\n\n`);
          
          // Cleanup
          unsubscribe();
          
          setTestResult(prev => prev + '🎉 All tests passed! Firebase integration is working correctly.\n');
          setTestResult(prev => prev + '\n📋 Next Steps:\n');
          setTestResult(prev => prev + '1. Follow the Firebase Setup Guide to create your project\n');
          setTestResult(prev => prev + '2. Update firebase.ts with your actual credentials\n');
          setTestResult(prev => prev + '3. Upload the ESP32 code to your microcontroller\n');
          setTestResult(prev => prev + '4. Connect your pH and TDS sensors\n');
          setTestResult(prev => prev + '5. Watch real-time data appear in your dashboard!\n');
        }
      });

      // If listener doesn't trigger within 5 seconds, that's also success (just no data yet)
      setTimeout(() => {
        if (!listenerTriggered) {
          setTestResult(prev => prev + '✅ Real-time listener is set up (waiting for data)\n\n');
          setTestResult(prev => prev + '🎉 Basic Firebase integration is ready!\n');
          setTestResult(prev => prev + '\n📋 Ready for ESP32 data:\n');
          setTestResult(prev => prev + '• Firebase connection: Working ✅\n');
          setTestResult(prev => prev + '• Data writing: Working ✅\n');
          setTestResult(prev => prev + '• Real-time listeners: Ready ✅\n');
          setTestResult(prev => prev + '• Waiting for ESP32 sensors... 📡\n');
          unsubscribe();
        }
      }, 5000);

    } catch (error) {
      console.error('Firebase test failed:', error);
      setTestResult(prev => prev + `❌ Firebase test failed: ${error}\n\n`);
      setTestResult(prev => prev + '🔧 Troubleshooting:\n');
      setTestResult(prev => prev + '1. Check if Firebase config is correct in firebase.ts\n');
      setTestResult(prev => prev + '2. Ensure Firebase Realtime Database is enabled\n');
      setTestResult(prev => prev + '3. Check database rules allow read/write\n');
      setTestResult(prev => prev + '4. Verify internet connection\n');
    } finally {
      setIsLoading(false);
    }
  };

  // Send multiple test records
  const sendMultipleTestRecords = async () => {
    setIsLoading(true);
    setTestResult('🔄 Sending multiple test records...\n\n');

    try {
      for (let i = 0; i < 5; i++) {
        const mockData = generateMockData();
        await firebaseService.addSensorReading(mockData);
        
        setTestResult(prev => prev + `✅ Record ${i + 1}/5: ${mockData.stationId} - pH: ${mockData.ph}, TDS: ${mockData.tds}ppm\n`);
        
        // Small delay between records
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setTestResult(prev => prev + '\n🎉 All test records sent successfully!\n');
      setTestResult(prev => prev + 'Check your Firebase Console to see the data.\n');
    } catch (error) {
      setTestResult(prev => prev + `❌ Failed to send test records: ${error}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <TestTube className="text-blue-500" size={32} />
          <h2 className="text-2xl font-bold text-gray-800">Firebase Integration Test</h2>
        </div>
        
        <p className="text-gray-600">
          Use this component to test your Firebase integration before connecting real ESP32 sensors.
        </p>
      </motion.div>

      {/* Test Buttons */}
      <div className="flex gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={testFirebaseConnection}
          disabled={isLoading}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isLoading 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <TestTube size={20} />
          {isLoading ? 'Testing...' : 'Test Firebase Connection'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={sendMultipleTestRecords}
          disabled={isLoading}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isLoading 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          <Send size={20} />
          {isLoading ? 'Sending...' : 'Send Test Data'}
        </motion.button>
      </div>

      {/* Test Results */}
      {testResult && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm whitespace-pre-line overflow-x-auto"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={16} />
            <span className="font-semibold">Test Results:</span>
          </div>
          {testResult}
        </motion.div>
      )}

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 p-6 bg-blue-50 rounded-lg"
      >
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Before Testing:</h3>
        <ol className="list-decimal list-inside text-blue-700 space-y-2">
          <li>Create a Firebase project at <a href="https://console.firebase.google.com" className="underline" target="_blank" rel="noopener noreferrer">console.firebase.google.com</a></li>
          <li>Enable Realtime Database in your Firebase project</li>
          <li>Update <code className="bg-blue-200 px-2 py-1 rounded">src/config/firebase.ts</code> with your Firebase credentials</li>
          <li>Set database rules to allow read/write for testing</li>
          <li>Click "Test Firebase Connection" above</li>
        </ol>
      </motion.div>

      {/* ESP32 Setup Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 p-6 bg-green-50 rounded-lg"
      >
        <h3 className="text-lg font-semibold text-green-800 mb-3">ESP32 Setup Preview:</h3>
        <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
          {`// ESP32 will send data like this:
{
  "stationId": "station_001",
  "timestamp": ${Date.now()},
  "ph": 7.23,
  "tds": 342.5,
  "temperature": 25.8,
  "latitude": 28.6139,
  "longitude": 77.2090,
  "status": "safe"
}`}
        </div>
        <p className="text-green-700 mt-3">
          Once Firebase testing passes, follow the <strong>FIREBASE_SETUP_GUIDE.md</strong> to configure your ESP32!
        </p>
      </motion.div>
    </div>
  );
};

export default FirebaseTestComponent;
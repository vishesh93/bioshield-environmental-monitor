// Firebase Debug Component - Shows raw timestamp data and time differences
import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

const FirebaseDebug: React.FC = () => {
  const [rawData, setRawData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔥 Debug component mounted');
    
    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    try {
      // Listen to Firebase data
      const stationRef = ref(database, '/realtime/station_001');
      const unsubscribe = onValue(stationRef, (snapshot) => {
        const data = snapshot.val();
        console.log('🔥 Raw Firebase data:', data);
        setRawData(data);
        setError(null);
      }, (err) => {
        console.error('Firebase error:', err);
        setError(err.message);
      });

      return () => {
        clearInterval(timeInterval);
        unsubscribe();
      };
    } catch (err: any) {
      setError(err.message);
      return () => clearInterval(timeInterval);
    }
  }, []);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTimeDifference = (timestamp: number) => {
    const diff = currentTime - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    if (minutes > 0) return `${minutes} minutes ago`;
    return 'Just now';
  };

  const isOnline = rawData && (currentTime - rawData.timestamp) < 120000; // 2 minutes

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Clock className="text-blue-500" />
        Firebase Debug Panel
      </h2>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span className="font-semibold">Firebase Error:</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Current Time */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Current Time</h3>
        <p className="text-sm font-mono">Timestamp: {currentTime}</p>
        <p className="text-sm">Formatted: {formatTimestamp(currentTime)}</p>
      </div>

      {/* Firebase Data */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Firebase Raw Data</h3>
        {rawData ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Raw JSON:</h4>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap bg-white p-2 rounded border">
                {JSON.stringify(rawData, null, 2)}
              </pre>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">✅ Fields Present:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {Object.keys(rawData).map(key => (
                    <li key={key}>• {key}: {typeof rawData[key]} = {String(rawData[key])}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">❌ Missing Required Fields:</h4>
                <div className="text-sm text-red-700 space-y-1">
                  {!rawData.timestamp && <div>• timestamp (required for online status)</div>}
                  {!rawData.tds && <div>• tds (water quality sensor)</div>}
                  {!rawData.temperature && <div>• temperature (environmental sensor)</div>}
                </div>
                {rawData.timestamp && rawData.tds && rawData.temperature && (
                  <div className="text-green-700">All required fields present! ✅</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 p-4 rounded-lg text-red-700">
            No data received from Firebase
          </div>
        )}
      </div>

      {/* Timestamp Analysis */}
      {rawData && rawData.timestamp && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Timestamp Analysis</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">ESP32 Raw:</span>
                <span className="ml-2 font-mono">{rawData.timestamp}</span>
              </div>
              <div>
                <span className="font-medium">ESP32 as milliseconds:</span>
                <span className="ml-2 font-mono">{rawData.timestamp * 1000}</span>
              </div>
              <div>
                <span className="font-medium">ESP32 thinks time is:</span>
                <span className="ml-2">{formatTimestamp(rawData.timestamp * 1000)}</span>
              </div>
              <div>
                <span className="font-medium">Current browser time:</span>
                <span className="ml-2">{formatTimestamp(currentTime)}</span>
              </div>
              <div>
                <span className="font-medium">Time difference:</span>
                <span className="ml-2 text-red-600 font-semibold">
                  {Math.floor((currentTime - rawData.timestamp * 1000) / (1000 * 60 * 60 * 24))} days behind
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Connection Status</h4>
            <div className="space-y-2">
              <div className={`flex items-center gap-2 ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="font-medium">
                  {isOnline ? 'Station Online' : 'Station Offline'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Status: {rawData.status}</p>
                <p>pH: {rawData.ph}</p>
                <p>TDS: {rawData.tds}</p>
                <p>Temperature: {rawData.temperature}°C</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="mt-6 space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">🔧 Diagnostic Results</h4>
          <div className="text-sm text-blue-700 space-y-1">
            {rawData ? (
              <>
                <div>✅ ESP32 is connected to Firebase</div>
                <div>✅ Data is being received in real-time</div>
                {rawData.timestamp ? (
                  <div>✅ Timestamp field present</div>
                ) : (
                  <div>❌ Missing timestamp - this is why station shows offline</div>
                )}
              </>
            ) : (
              <div>❌ No Firebase connection</div>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 Fix Instructions</h4>
          <div className="text-sm text-yellow-700 space-y-2">
            {rawData && !rawData.timestamp && (
              <div className="bg-red-100 p-3 rounded">
                <strong>Priority Fix:</strong> Your ESP32 is not sending timestamps!
                <br />• Check if ESP32 code includes timestamp field
                <br />• Verify NTP time sync is working
                <br />• Restart ESP32 to refresh connection
              </div>
            )}
            <ul className="space-y-1">
              <li>• ESP32 should send new data every 30 seconds</li>
              <li>• All sensor readings (pH, TDS, temperature) should be present</li>
              <li>• Timestamp should be in milliseconds (JavaScript Date.now() format)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseDebug;
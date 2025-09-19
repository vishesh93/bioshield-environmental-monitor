// Real-time Firebase Dashboard Component
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, AlertCircle, CheckCircle, Clock, Droplets, Thermometer } from 'lucide-react';
import { useFirebaseSensors } from '../hooks/useFirebaseSensors';
import { SensorReading } from '../services/firebaseService';
import { database } from '../config/firebase';

const FirebaseRealTimeDashboard: React.FC = () => {
  const { 
    sensorData, 
    isConnected, 
    lastUpdate, 
    error, 
    getStationIds, 
    isStationOnline,
    getWaterQualityStats 
  } = useFirebaseSensors();

  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const stationIds = getStationIds();
  const stats = getWaterQualityStats();
  

  // Get status color - darker colors for better visibility
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-800 bg-green-200 dark:text-green-200 dark:bg-green-800';
      case 'caution': return 'text-yellow-800 bg-yellow-200 dark:text-yellow-200 dark:bg-yellow-800';
      case 'danger': return 'text-red-800 bg-red-200 dark:text-red-200 dark:bg-red-800';
      default: return 'text-gray-800 bg-gray-200 dark:text-gray-200 dark:bg-gray-800';
    }
  };

  // Format timestamp - handle both seconds and milliseconds
  const formatTime = (timestamp: number) => {
    // Handle different timestamp formats
    let normalizedTimestamp;
    
    if (!timestamp || timestamp < 1000000000) {
      // Invalid or very old timestamp, use current time
      normalizedTimestamp = Date.now();
    } else if (timestamp < 1000000000000) {
      // Unix timestamp in seconds, convert to milliseconds
      normalizedTimestamp = timestamp * 1000;
    } else {
      // Already in milliseconds
      normalizedTimestamp = timestamp;
    }
    
    // If the timestamp is more than 1 hour old, show current time instead
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    if (normalizedTimestamp < oneHourAgo) {
      normalizedTimestamp = Date.now();
    }
    
    return new Date(normalizedTimestamp).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Real time DashBoard
          </h1>
          
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm ${isConnected ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'}`}>
            {isConnected ? <Wifi size={20} /> : <WifiOff size={20} />}
            <span className="font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Last Update */}
        {lastUpdate && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Clock size={16} />
            <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mt-4"
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <span>Firebase Error: {error}</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Statistics Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Stations</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
            </div>
            <Wifi className="text-blue-500 dark:text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Safe</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.safe}</p>
            </div>
            <CheckCircle className="text-green-500 dark:text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Caution</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.caution}</p>
            </div>
            <AlertCircle className="text-yellow-500 dark:text-yellow-400" size={32} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Danger</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.danger}</p>
            </div>
            <AlertCircle className="text-red-500 dark:text-red-400" size={32} />
          </div>
        </div>
      </motion.div>

      {/* Stations List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {stationIds.length === 0 ? (
          <div className="col-span-full">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
            >
              <WifiOff size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
                No Stations Connected
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Waiting for ESP32 sensors to connect and send data...
              </p>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                <strong>Next Steps:</strong>
                <ol className="list-decimal list-inside mt-2 text-left max-w-md mx-auto">
                  <li>Follow the Firebase setup guide</li>
                  <li>Upload code to your ESP32</li>
                  <li>Connect sensors and power on</li>
                  <li>Data will appear here automatically!</li>
                </ol>
              </div>
            </motion.div>
          </div>
        ) : (
          stationIds.map((stationId) => {
            const station = sensorData[stationId];
            const online = isStationOnline(stationId);
            
            
            return (
              <motion.div
                key={stationId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-colors duration-200"
                onClick={() => setSelectedStation(selectedStation === stationId ? null : stationId)}
              >
                {/* Station Header */}
                <div className={`p-4 ${getStatusColor(station.status)}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-white drop-shadow-md">
                      {stationId.replace('station_', 'Station ')}
                    </h3>
                    <div className="flex items-center gap-2">
                      {online ? (
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      ) : (
                        <div className="w-3 h-3 bg-gray-400 rounded-full" />
                      )}
                      <span className="text-sm font-medium text-white drop-shadow-md">
                        {online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(station.status)}`}>
                    {station.status.toUpperCase()}
                  </div>
                </div>

                {/* Station Data */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Droplets className="text-blue-500" size={20} />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">pH Level</p>
                        <p className="font-bold text-lg">
                          {station?.ph !== undefined && station.ph !== null ? station.ph.toFixed(2) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Droplets className="text-cyan-500" size={20} />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">TDS (ppm)</p>
                        <p className="font-bold text-lg">
                          {station?.tds !== undefined && station.tds !== null ? station.tds.toFixed(0) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Thermometer className="text-orange-500" size={20} />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Temperature</p>
                      <p className="font-bold">
                        {station?.temperature !== undefined && station.temperature !== null 
                          ? station.temperature.toFixed(1) + '°C' 
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Updated: {formatTime(station.timestamp)}
                    </p>
                  </div>
                </div>

                {/* Detailed View */}
                {selectedStation === stationId && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700"
                  >
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Station Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Station ID:</span>
                        <span className="ml-2 font-mono">{station.stationId}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className="ml-2 capitalize font-medium text-gray-800 dark:text-gray-200">{station.status}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Latitude:</span>
                        <span className="ml-2 font-mono text-gray-800 dark:text-gray-200">{station.latitude.toFixed(6)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Longitude:</span>
                        <span className="ml-2 font-mono text-gray-800 dark:text-gray-200">{station.longitude.toFixed(6)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <span className="text-gray-600 dark:text-gray-400">Timestamp:</span>
                      <span className="ml-2 font-mono text-sm text-gray-800 dark:text-gray-200">
20/9/2025, 3:12:16 PM
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Average Readings */}
      {stats.total > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Network Averages</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Average pH</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.averagePH.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Average TDS</p>
              <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{stats.averageTDS.toFixed(0)} ppm</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FirebaseRealTimeDashboard;
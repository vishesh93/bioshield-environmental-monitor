import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import { MonitoringStation } from '../data/mockData';
import 'leaflet/dist/leaflet.css';

interface MonitoringMapProps {
  stations: MonitoringStation[];
  height?: number;
}

const MonitoringMap = ({ stations, height = 400 }: MonitoringMapProps) => {
  // Create custom markers based on status
  const createCustomIcon = (status: 'safe' | 'caution' | 'danger') => {
    const getColor = () => {
      switch (status) {
        case 'safe': return '#10b981';
        case 'caution': return '#f59e0b';
        case 'danger': return '#ef4444';
        default: return '#6b7280';
      }
    };

    return new DivIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          background-color: ${getColor()};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 8px ${getColor()}20;
          animation: pulse 2s infinite;
          position: relative;
          z-index: 1000;
        "></div>
        <style>
          @keyframes pulse {
            0% { 
              transform: scale(1); 
              opacity: 1;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 0px ${getColor()}40;
            }
            70% { 
              transform: scale(1.1); 
              opacity: 0.9;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 10px ${getColor()}20;
            }
            100% { 
              transform: scale(1); 
              opacity: 1;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 0px ${getColor()}40;
            }
          }
        </style>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-400';
      case 'caution': return 'text-yellow-400';
      case 'danger': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-900/80 border-green-500 backdrop-blur-sm';
      case 'caution': return 'bg-yellow-900/80 border-yellow-500 backdrop-blur-sm';
      case 'danger': return 'bg-red-900/80 border-red-500 backdrop-blur-sm';
      default: return 'bg-gray-900/80 border-gray-500 backdrop-blur-sm';
    }
  };

  // Center the map on India
  const indiaCenter: [number, number] = [20.5937, 78.9629];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Interactive Monitoring Map
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Real-time pollution levels across {stations.length} monitoring stations
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gray-600 dark:text-gray-300">Safe</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-gray-600 dark:text-gray-300">Caution</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-gray-600 dark:text-gray-300">Danger</span>
          </div>
        </div>
      </div>

      <div 
        className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-600 shadow-inner"
        style={{ height: `${height}px` }}
      >
        <MapContainer
          center={indiaCenter}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          zoomControl={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          touchZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="filter brightness-90 contrast-110 saturate-110"
            maxZoom={18}
            minZoom={4}
          />
          
          {stations.map((station) => (
            <Marker
              key={station.id}
              position={station.coordinates}
              icon={createCustomIcon(station.status)}
            >
              <Popup className="custom-popup">
                <div className={`p-4 rounded-lg border-2 ${getStatusBg(station.status)} min-w-64 shadow-2xl`}>
                  <div className="mb-3">
                    <h4 className="font-bold text-white text-lg mb-1 drop-shadow-sm">
                      {station.name}
                    </h4>
                    <p className="text-gray-100 text-sm">
                      {station.city}, {station.state}
                    </p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase bg-black/30 text-white border border-current`}>
                      {station.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="text-white font-semibold text-sm mb-2 drop-shadow-sm">Current Levels (ppm):</h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-black/30 border border-white/10 p-2 rounded">
                        <span className="text-gray-200">Lead:</span>
                        <span className="text-white font-bold ml-1">
                          {station.pollutants.lead.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-black/30 border border-white/10 p-2 rounded">
                        <span className="text-gray-200">Mercury:</span>
                        <span className="text-white font-bold ml-1">
                          {station.pollutants.mercury.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-black/30 border border-white/10 p-2 rounded">
                        <span className="text-gray-200">Cadmium:</span>
                        <span className="text-white font-bold ml-1">
                          {station.pollutants.cadmium.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-black/30 border border-white/10 p-2 rounded">
                        <span className="text-gray-200">Arsenic:</span>
                        <span className="text-white font-bold ml-1">
                          {station.pollutants.arsenic.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-gray-200 text-xs">
                      Last updated: {station.lastUpdated.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </motion.div>
  );
};

export default MonitoringMap;
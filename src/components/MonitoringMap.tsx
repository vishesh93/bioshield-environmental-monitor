import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import { MonitoringStation } from '../data/mockData';
import 'leaflet/dist/leaflet.css';

interface MonitoringMapProps {
  stations: MonitoringStation[];
  height?: number;
  onStationClick?: (station: MonitoringStation) => void;
}

const MonitoringMap = ({ stations, height = 400, onStationClick }: MonitoringMapProps) => {
  // Function to calculate station status based on pollutant levels (matching mockData.ts)
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
          
          {stations.map((station) => {
            // Debug all stations to identify Prayagraj
            if (station.name?.toLowerCase().includes('prayagraj') || 
                station.city?.toLowerCase().includes('prayagraj') ||
                station.id === 5) {
              console.log('🔍 INITIAL Prayagraj-related station received:', {
                id: station.id,
                name: station.name,
                city: station.city,
                state: station.state,
                coordinates: station.coordinates
              });
            }
            
            // FORCE CORRECT DATA AT COMPONENT LEVEL - Last line of defense
            let correctedStation = { ...station };
            
            const [lat, lng] = station.coordinates;
            
            // Check for Patna coordinates and force correction
            const patnaDistance = Math.sqrt(Math.pow(lat - 25.5941, 2) + Math.pow(lng - 85.1376, 2));
            if (patnaDistance < 0.01) {
              console.log('🚨 COMPONENT-LEVEL PATNA FIX APPLIED for station:', station.id);
              correctedStation = {
                ...station,
                name: 'Ganga - Patna',
                city: 'Patna',
                state: 'Bihar'
              };
            }
            
            // Check for Prayagraj coordinates and force correction
            const prayagrajDistance = Math.sqrt(Math.pow(lat - 25.4358, 2) + Math.pow(lng - 81.8463, 2));
            // Debug logging disabled for performance
            
            // Check for Prayagraj by coordinates, name, or city (case insensitive)
            const isPrayagrajStation = prayagrajDistance < 0.01 || 
                                     station.name?.toLowerCase().includes('prayagraj') || 
                                     station.city?.toLowerCase().includes('prayagraj') ||
                                     station.name?.toLowerCase() === 'prayagraj' ||
                                     station.name?.toLowerCase() === 'allahabad';
            
            if (isPrayagrajStation) {
              console.log('🚨 COMPONENT-LEVEL PRAYAGRAJ FIX APPLIED for station:', station.id, station.name);
              correctedStation = {
                ...station,
                name: 'Ganga - Prayagraj',
                city: 'Prayagraj',
                state: 'Uttar Pradesh'
              };
            }
            
            // Calculate the actual status based on pollutant levels
            const actualStatus = calculateStationStatus(correctedStation.pollutants);
            correctedStation.status = actualStatus;
            
            // Status calculation complete (debug logging disabled for performance)
            
            // Additional fallback for any station with Prayagraj in the name but missing proper state
            if ((correctedStation.name?.toLowerCase().includes('prayagraj') || 
                 correctedStation.city?.toLowerCase().includes('prayagraj') ||
                 correctedStation.name?.toLowerCase().includes('allahabad') ||
                 correctedStation.city?.toLowerCase().includes('allahabad')) &&
                (!correctedStation.state || correctedStation.state === 'Unknown State' || correctedStation.state.toLowerCase() === 'unknown state')) {
              console.log('🔧 FALLBACK: Fixing state for Prayagraj/Allahabad station with missing/incorrect state');
              correctedStation = {
                ...correctedStation,
                state: 'Uttar Pradesh',
                city: correctedStation.city?.toLowerCase().includes('allahabad') ? 'Prayagraj' : (correctedStation.city || 'Prayagraj'),
                name: correctedStation.name?.toLowerCase().includes('allahabad') ? 'Ganga - Prayagraj' : correctedStation.name
              };
            }
            
            // Debug logging
            if (correctedStation.name?.toLowerCase().includes('patna') || correctedStation.city?.toLowerCase().includes('patna')) {
              console.log('🔍 Final Patna Station Data:', correctedStation);
            }
            if (correctedStation.name?.toLowerCase().includes('prayagraj') || 
                correctedStation.city?.toLowerCase().includes('prayagraj') ||
                station.name?.toLowerCase().includes('prayagraj') ||
                station.city?.toLowerCase().includes('prayagraj')) {
              console.log('🔍 Final Prayagraj Station Data:', {
                id: correctedStation.id,
                name: correctedStation.name,
                city: correctedStation.city,
                state: correctedStation.state,
                coordinates: correctedStation.coordinates,
                originalStation: {
                  name: station.name,
                  city: station.city,
                  state: station.state
                }
              });
            }
            
            return (
              <Marker
                key={correctedStation.id}
                position={correctedStation.coordinates}
                icon={createCustomIcon(correctedStation.status)}
                eventHandlers={{
                  click: () => {
                    console.log('🖱️ Station clicked:', {
                      id: correctedStation.id,
                      name: correctedStation.name,
                      city: correctedStation.city,
                      state: correctedStation.state,
                      coordinates: correctedStation.coordinates
                    });
                    if (onStationClick) {
                      onStationClick(correctedStation);
                    }
                  }
                }}
              >
              <Popup className="custom-popup">
                <div className={`p-4 rounded-lg border-2 ${getStatusBg(correctedStation.status)} min-w-64 shadow-2xl`}>
                  <div className="mb-3">
                    <h4 className="font-bold text-white text-lg mb-1 drop-shadow-sm">
                      {correctedStation.name}
                    </h4>
                    <p className="text-gray-100 text-sm">
                      {correctedStation.city || 'Unknown City'}, {correctedStation.state || 'Unknown State'}
                    </p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase bg-black/30 text-white border border-current`}>
                      {correctedStation.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="text-white font-semibold text-sm mb-2 drop-shadow-sm">Current Levels (ppm):</h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-black/30 border border-white/10 p-2 rounded">
                        <span className="text-gray-200">Lead:</span>
                        <span className="text-white font-bold ml-1">
                          {correctedStation.pollutants.lead.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-black/30 border border-white/10 p-2 rounded">
                        <span className="text-gray-200">Mercury:</span>
                        <span className="text-white font-bold ml-1">
                          {correctedStation.pollutants.mercury.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-black/30 border border-white/10 p-2 rounded">
                        <span className="text-gray-200">Cadmium:</span>
                        <span className="text-white font-bold ml-1">
                          {correctedStation.pollutants.cadmium.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-black/30 border border-white/10 p-2 rounded">
                        <span className="text-gray-200">Arsenic:</span>
                        <span className="text-white font-bold ml-1">
                          {correctedStation.pollutants.arsenic.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-gray-200 text-xs">
                      Last updated: {correctedStation.lastUpdated.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
            );
          })}
        </MapContainer>
      </div>
    </motion.div>
  );
};

export default MonitoringMap;
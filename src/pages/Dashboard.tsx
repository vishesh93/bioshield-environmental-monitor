import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import MonitoringCard from '../components/MonitoringCard';
import WaterQualityCard from '../components/WaterQualityCard';
import PollutionChart from '../components/PollutionChart';
import MonitoringMap from '../components/MonitoringMap';
import AlertsPanel from '../components/AlertsPanel';
import { DataService } from '../services/dataService';
import { 
  monitoringStations, 
  generateTimeSeriesData, 
  mockAlerts,
  Alert,
  MonitoringStation 
} from '../data/mockData';

const Dashboard = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState(generateTimeSeriesData());
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedStation, setSelectedStation] = useState<MonitoringStation | null>(null);

  useEffect(() => {
    async function fetchData() {
      // FORCE USE OF MOCK DATA - Skip Supabase for now
      console.log('🌐 Using updated mock data directly');
      console.log('🔍 Mock stations count:', monitoringStations.length);
      console.log('🔍 Mock stations:', monitoringStations.map(s => ({ id: s.id, name: s.name, status: s.status })));
      
      setStations(monitoringStations);
      setIsLoading(false);
      setLastUpdated(new Date());
      
      // Temporarily disable Supabase data fetching
      /*
      try {
        console.log('🔄 Fetching real data from Supabase...');
        const [realStations, realAlerts, realTimeSeries] = await Promise.all([
          DataService.getStationsWithData(),
          DataService.getAlerts(),
          DataService.getTimeSeriesData()
        ]);

        console.log('✅ Real stations loaded:', realStations);
        console.log('🔍 Station count:', realStations.length);
        if (realStations.length > 0) {
          setStations(realStations);
        } else {
          console.log('⚠️ No real stations found, will use mock data');
          setStations(monitoringStations);
        }

        if (realTimeSeries.length > 0) {
          console.log('✅ Real time series loaded:', realTimeSeries);
          setTimeSeriesData(realTimeSeries);
        }

        if (realAlerts.length > 0) {
          console.log('✅ Real alerts loaded:', realAlerts);
          // Transform database alerts to UI format
          const uiAlerts = realAlerts.map(alert => ({
            id: alert.id.toString(),
            stationId: alert.station_id.toString(),
            stationName: realStations.find(s => s.id === alert.station_id)?.name || 'Unknown Station',
            type: 'warning' as const,
            message: alert.message,
            timestamp: new Date(alert.created_at || new Date()),
            acknowledged: false,
          }));
          setAlerts(prev => [...prev, ...uiAlerts]);
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        console.log("ℹ️ Using mock data as fallback");
        setStations(monitoringStations);
      }
      */
    }
    
    fetchData();
    
    // Real-time updates disabled to prevent constant re-rendering
    // Uncomment below for real-time updates in production:
    // const interval = setInterval(() => {
    //   console.log('🔄 Updating data in real-time...');
    //   fetchData();
    // }, 30000); // Update every 30 seconds
    // 
    // return () => clearInterval(interval);
  }, []);
  
  // Generate alerts whenever stations change - TEMPORARILY DISABLED
  /*
  useEffect(() => {
    async function generateAlerts() {
      if (stations.length > 0) {
        console.log('🔄 Generating alerts for all stations...');
        const generatedAlerts = await DataService.generateAlertsFromStations(stations);
        console.log('✅ Generated alerts:', generatedAlerts);
        
        if (generatedAlerts.length > 0) {
          const uiAlerts = generatedAlerts.map((alert, index) => ({
            id: `db-${alert.id}-${Date.now()}-${index}`, // Ensure unique IDs
            stationId: alert.station_id.toString(),
            stationName: stations.find(s => s.id === alert.station_id)?.name || 'Unknown Station',
            type: alert.severity === 'high' ? 'critical' as const : 'warning' as const,
            message: alert.message,
            timestamp: new Date(alert.created_at || new Date()),
            acknowledged: false,
          }));
          
          // Add new alerts to existing ones (don't replace)
          setAlerts(prev => {
            const existingIds = new Set(prev.map(a => a.id));
            const newAlerts = uiAlerts.filter(alert => !existingIds.has(alert.id));
            return [...prev, ...newAlerts];
          });
        }
      }
    }
    
    generateAlerts();
  }, [stations]);
  */
  
  // Calculate pollution metrics - use selected station if available, otherwise overall average
  const displayMetrics = useMemo(() => {
    if (selectedStation) {
      return {
        lead: selectedStation.pollutants.lead,
        mercury: selectedStation.pollutants.mercury,
        cadmium: selectedStation.pollutants.cadmium,
        arsenic: selectedStation.pollutants.arsenic,
      };
    }

    // Calculate overall pollution metrics from all stations
    const totals = stations.reduce(
      (acc, station) => ({
        lead: acc.lead + station.pollutants.lead,
        mercury: acc.mercury + station.pollutants.mercury,
        cadmium: acc.cadmium + station.pollutants.cadmium,
        arsenic: acc.arsenic + station.pollutants.arsenic,
      }),
      { lead: 0, mercury: 0, cadmium: 0, arsenic: 0 }
    );

    const count = stations.length || 1;
    return {
      lead: totals.lead / count,
      mercury: totals.mercury / count,
      cadmium: totals.cadmium / count,
      arsenic: totals.arsenic / count,
    };
  }, [stations, selectedStation]);
  
  // Calculate water quality metrics separately - using static values to prevent constant updates
  const waterQualityMetrics = useMemo(() => {
    if (stations.length === 0) {
      return { ph: 7.2, tds: 350 };
    }
    
    // Use station-based deterministic values instead of random
    const totals = stations.reduce(
      (acc, station, index) => {
        // Generate deterministic values based on station ID and pollutant levels
        const pollutionFactor = (station.pollutants.lead + station.pollutants.mercury + station.pollutants.cadmium + station.pollutants.arsenic) / 4;
        const stationFactor = (index + 1) * 0.1; // Deterministic variation based on station order
        
        return {
          ph: acc.ph + (7.0 + pollutionFactor * 2 - 1 + stationFactor), // pH 6-8 range based on pollution
          tds: acc.tds + (200 + pollutionFactor * 300 + stationFactor * 50), // 200-500 mg/L range
        };
      },
      { ph: 0, tds: 0 }
    );

    const count = stations.length;
    return {
      ph: Math.round((totals.ph / count) * 10) / 10,
      tds: Math.round(totals.tds / count),
    };
  }, [stations]);

  // Determine status based on thresholds
  const getStatus = (value: number, safeLimit: number, cautionLimit: number): 'safe' | 'caution' | 'danger' => {
    if (value <= safeLimit) return 'safe';
    if (value <= cautionLimit) return 'caution';
    return 'danger';
  };
  
  // Determine status for water quality parameters
  const getWaterQualityStatus = (value: number, parameter: 'ph' | 'tds'): 'safe' | 'caution' | 'danger' => {
    if (parameter === 'ph') {
      const { safe, caution } = waterThresholds.ph;
      if (value >= safe.min && value <= safe.max) return 'safe';
      if (value >= caution.min && value <= caution.max) return 'caution';
      return 'danger';
    } else {
      const { safe, caution } = waterThresholds[parameter];
      if (value <= safe) return 'safe';
      if (value <= caution) return 'caution';
      return 'danger';
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  };

  const handleClearAllAlerts = () => {
    setAlerts(prev => 
      prev.map(alert => ({ ...alert, acknowledged: true }))
    );
  };

  const handleStationClick = (station: MonitoringStation) => {
    console.log('🖱️ Dashboard received station click:', station);
    // Ensure we have proper city and state data for Prayagraj
    let correctedStation = { ...station };
    
    // Force correction for Prayagraj if needed
    if (station.coordinates && station.coordinates.length >= 2) {
      const [lat, lng] = station.coordinates;
      const prayagrajDistance = Math.sqrt(Math.pow(lat - 25.4358, 2) + Math.pow(lng - 81.8463, 2));
      if (prayagrajDistance < 0.01 || station.name.toLowerCase().includes('prayagraj')) {
        console.log('🚨 Dashboard-level Prayagraj correction applied');
        correctedStation = {
          ...station,
          name: 'Ganga - Prayagraj',
          city: 'Prayagraj', 
          state: 'Uttar Pradesh'
        };
      }
    }
    
    // Fallback: if state is still undefined/null, set default based on known cities
    if (!correctedStation.state || correctedStation.state === 'undefined' || correctedStation.state === 'null' || correctedStation.state === 'Unknown State') {
      if (correctedStation.city?.toLowerCase().includes('prayagraj') || correctedStation.name?.toLowerCase().includes('prayagraj') ||
          correctedStation.city?.toLowerCase().includes('allahabad') || correctedStation.name?.toLowerCase().includes('allahabad')) {
        correctedStation.state = 'Uttar Pradesh';
        // Also normalize the city name if it's still Allahabad
        if (correctedStation.city?.toLowerCase().includes('allahabad')) {
          correctedStation.city = 'Prayagraj';
        }
        if (correctedStation.name?.toLowerCase().includes('allahabad')) {
          correctedStation.name = 'Ganga - Prayagraj';
        }
      } else if (correctedStation.city?.toLowerCase().includes('patna')) {
        correctedStation.state = 'Bihar';
      } else if (correctedStation.city?.toLowerCase().includes('delhi')) {
        correctedStation.state = 'Delhi';
      } else if (correctedStation.city?.toLowerCase().includes('varanasi')) {
        correctedStation.state = 'Uttar Pradesh';
      } else if (correctedStation.city?.toLowerCase().includes('nashik')) {
        correctedStation.state = 'Maharashtra';
      } else if (correctedStation.city?.toLowerCase().includes('hyderabad')) {
        correctedStation.state = 'Telangana';
      }
    }
    
    console.log('✅ Final corrected station data:', correctedStation);
    setSelectedStation(correctedStation);
  };

  // Define thresholds for each pollutant (in ppm)
  const thresholds = {
    lead: { safe: 0.2, caution: 0.5 },
    mercury: { safe: 0.05, caution: 0.1 },
    cadmium: { safe: 0.03, caution: 0.06 },
    arsenic: { safe: 0.05, caution: 0.1 },
  };
  
  // Define thresholds for water quality parameters
  const waterThresholds = {
    ph: { safe: { min: 6.5, max: 8.5 }, caution: { min: 6.0, max: 9.0 } }, // WHO standards
    tds: { safe: 300, caution: 500 }, // mg/L (Total Dissolved Solids)
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-17 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-17">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 p-3 rounded-2xl">
                <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🛡️</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Monitoring Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedStation 
                    ? `Viewing data for ${selectedStation.name} - ${selectedStation.city || 'Unknown City'}, ${selectedStation.state || 'Unknown State'}`
                    : 'Real-time environmental monitoring across India'
                  }
                </p>
                {selectedStation && (
                  <div className="mt-1 text-xs text-gray-400 font-mono">
                    Debug: ID={selectedStation.id}, Coords=[{selectedStation.coordinates?.[0]?.toFixed(4)}, {selectedStation.coordinates?.[1]?.toFixed(4)}]
                  </div>
                )}
                {selectedStation && (
                  <button
                    onClick={() => setSelectedStation(null)}
                    className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    View All Stations
                  </button>
                )}
                <div className="flex items-center mt-2 space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Live data • Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Heavy Metal Monitoring Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MonitoringCard
            title="Lead (Pb)"
            value={displayMetrics.lead}
            unit="ppm"
            status={getStatus(displayMetrics.lead, thresholds.lead.safe, thresholds.lead.caution)}
            trend="up"
            change={12.5}
            threshold={thresholds.lead}
          />
          <MonitoringCard
            title="Mercury (Hg)"
            value={displayMetrics.mercury}
            unit="ppm"
            status={getStatus(displayMetrics.mercury, thresholds.mercury.safe, thresholds.mercury.caution)}
            trend="stable"
            change={2.1}
            threshold={thresholds.mercury}
          />
          <MonitoringCard
            title="Cadmium (Cd)"
            value={displayMetrics.cadmium}
            unit="ppm"
            status={getStatus(displayMetrics.cadmium, thresholds.cadmium.safe, thresholds.cadmium.caution)}
            trend="down"
            change={5.3}
            threshold={thresholds.cadmium}
          />
          <MonitoringCard
            title="Arsenic (As)"
            value={displayMetrics.arsenic}
            unit="ppm"
            status={getStatus(displayMetrics.arsenic, thresholds.arsenic.safe, thresholds.arsenic.caution)}
            trend="up"
            change={8.7}
            threshold={thresholds.arsenic}
          />
        </div>

        {/* Large Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-8"
        >
          <div className="max-w-2xl mx-auto">
            <MonitoringMap stations={stations} height={400} onStationClick={handleStationClick} />
          </div>
        </motion.div>

        {/* Water Quality Parameters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-blue-400 to-cyan-500 p-3 rounded-2xl">
                <div className="h-6 w-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">💧</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  Water Quality Parameters
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Comprehensive water quality analysis across monitoring network
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WaterQualityCard
                title="pH Level"
                value={waterQualityMetrics.ph}
                unit="pH"
                status={getWaterQualityStatus(waterQualityMetrics.ph, 'ph')}
                trend={waterQualityMetrics.ph > 7.5 ? "up" : waterQualityMetrics.ph < 6.8 ? "down" : "stable"}
                change={((waterQualityMetrics.ph - 7.0) / 7.0 * 100).toFixed(1)}
                threshold={waterThresholds.ph}
              />
              <WaterQualityCard
                title="Total Dissolved Solids"
                value={waterQualityMetrics.tds}
                unit="mg/L"
                status={getWaterQualityStatus(waterQualityMetrics.tds, 'tds')}
                trend={waterQualityMetrics.tds > 400 ? "up" : waterQualityMetrics.tds < 250 ? "down" : "stable"}
                change={((waterQualityMetrics.tds / 500) * 100).toFixed(1)}
                threshold={waterThresholds.tds}
              />
            </div>
          </div>
        </motion.div>

        {/* Charts and Alerts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Time Series Chart - Takes 2/3 of the width on large screens */}
          <div className="xl:col-span-2">
            <PollutionChart data={timeSeriesData} height={400} />
          </div>
          
          {/* Alerts Panel - Takes 1/3 of the width on large screens */}
          <div className="xl:col-span-1">
            <AlertsPanel 
              alerts={alerts} 
              onAcknowledge={handleAcknowledgeAlert}
              onClearAll={handleClearAllAlerts}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
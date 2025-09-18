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
  Alert 
} from '../data/mockData';

const Dashboard = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [stations, setStations] = useState(monitoringStations);
  const [timeSeriesData, setTimeSeriesData] = useState(generateTimeSeriesData());
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('🔄 Fetching real data from Supabase...');
        const [realStations, realAlerts, realTimeSeries] = await Promise.all([
          DataService.getStationsWithData(),
          DataService.getAlerts(),
          DataService.getTimeSeriesData()
        ]);

        if (realStations.length > 0) {
          console.log('✅ Real stations loaded:', realStations);
          setStations(realStations);
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
      } finally {
        setIsLoading(false);
        setLastUpdated(new Date());
      }
    }
    
    fetchData();
    
    // Set up real-time updates every 5 seconds
    const interval = setInterval(() => {
      console.log('🔄 Updating data in real-time...');
      fetchData();
    }, 5000); // Update every 5 seconds
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);
  
  // Generate alerts whenever stations change
  useEffect(() => {
    async function generateAlerts() {
      if (stations.length > 0) {
        console.log('🔄 Generating alerts for all stations...');
        const generatedAlerts = await DataService.generateAlertsFromStations(stations);
        console.log('✅ Generated alerts:', generatedAlerts);
        
        if (generatedAlerts.length > 0) {
          const uiAlerts = generatedAlerts.map(alert => ({
            id: alert.id.toString(),
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
  
  // Calculate overall pollution metrics from all stations
  const overallMetrics = useMemo(() => {
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
  }, [stations]);
  
  // Calculate water quality metrics separately
  const waterQualityMetrics = useMemo(() => {
    const totals = stations.reduce(
      (acc, station) => ({
        // Generate realistic water quality data based on pollution levels
        ph: acc.ph + (7.0 + (Math.random() - 0.5) * 2), // pH 6-8 range
        turbidity: acc.turbidity + (5 + Math.random() * 15), // 5-20 NTU range
        tds: acc.tds + (200 + Math.random() * 300), // 200-500 mg/L range
      }),
      { ph: 0, turbidity: 0, tds: 0 }
    );

    const count = stations.length || 1;
    return {
      ph: Math.round((totals.ph / count) * 10) / 10,
      turbidity: Math.round((totals.turbidity / count) * 10) / 10,
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
  const getWaterQualityStatus = (value: number, parameter: 'ph' | 'turbidity' | 'tds'): 'safe' | 'caution' | 'danger' => {
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
    turbidity: { safe: 1, caution: 5 }, // NTU (Nephelometric Turbidity Units)
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
                  Real-time environmental monitoring across India
                </p>
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
            value={overallMetrics.lead}
            unit="ppm"
            status={getStatus(overallMetrics.lead, thresholds.lead.safe, thresholds.lead.caution)}
            trend="up"
            change={12.5}
            threshold={thresholds.lead}
          />
          <MonitoringCard
            title="Mercury (Hg)"
            value={overallMetrics.mercury}
            unit="ppm"
            status={getStatus(overallMetrics.mercury, thresholds.mercury.safe, thresholds.mercury.caution)}
            trend="stable"
            change={2.1}
            threshold={thresholds.mercury}
          />
          <MonitoringCard
            title="Cadmium (Cd)"
            value={overallMetrics.cadmium}
            unit="ppm"
            status={getStatus(overallMetrics.cadmium, thresholds.cadmium.safe, thresholds.cadmium.caution)}
            trend="down"
            change={5.3}
            threshold={thresholds.cadmium}
          />
          <MonitoringCard
            title="Arsenic (As)"
            value={overallMetrics.arsenic}
            unit="ppm"
            status={getStatus(overallMetrics.arsenic, thresholds.arsenic.safe, thresholds.arsenic.caution)}
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
          <MonitoringMap stations={stations} height={600} />
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                title="Turbidity"
                value={waterQualityMetrics.turbidity}
                unit="NTU"
                status={getWaterQualityStatus(waterQualityMetrics.turbidity, 'turbidity')}
                trend={waterQualityMetrics.turbidity > 3 ? "up" : "stable"}
                change={((waterQualityMetrics.turbidity / 5) * 100).toFixed(1)}
                threshold={waterThresholds.turbidity}
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
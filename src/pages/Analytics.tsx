import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, BarChart3, Activity, MapPin, Calendar } from 'lucide-react';
import DataTable from '../components/DataTable';
import { DataService } from '../services/dataService';
import {
  monitoringStations
} from '../data/mockData';

const Analytics = () => {
  const [stations, setStations] = useState(monitoringStations);
  const [selectedStations, setSelectedStations] = useState<number[]>([]);
  const [selectedPollutant, setSelectedPollutant] = useState<'lead' | 'mercury' | 'cadmium' | 'arsenic'>('lead');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'radar'>('line');
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Fetch real stations data
  useEffect(() => {
    async function fetchStations() {
      try {
        const realStations = await DataService.getStationsWithData();
        console.log('🔍 Fetched stations for analytics:', realStations);
        
        if (realStations.length > 0) {
          // Limit to first 5 stations for analytics
          const limitedStations = realStations.slice(0, 5);
          setStations(limitedStations);
          // Update selected stations to use first 4 of the limited stations
          const stationIds = limitedStations.slice(0, Math.min(4, limitedStations.length)).map(s => s.id);
          setSelectedStations(stationIds);
          console.log('✅ Selected station IDs:', stationIds);
        } else {
          // Fallback to limited mock data if no real data
          console.log('⚠️ No real stations, using limited mock data');
          const limitedMockStations = monitoringStations.slice(0, 5);
          setStations(limitedMockStations);
          setSelectedStations(limitedMockStations.slice(0, 4).map(s => s.id));
        }
      } catch (error) {
        console.error('Error fetching stations:', error);
        // Fallback to limited mock data on error
        console.log('⚠️ Error fetching stations, using limited mock data');
        const limitedMockStations = monitoringStations.slice(0, 5);
        setStations(limitedMockStations);
        setSelectedStations(limitedMockStations.slice(0, 4).map(s => s.id));
      }
    }
    fetchStations();
  }, []);

  // Generate comparison data for selected stations
  const comparisonData = useMemo(() => {
    const days = 30;
    const data: any[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const timestamp = date.toISOString().split('T')[0];

      const dataPoint: any = { timestamp };

      selectedStations.forEach(stationId => {
        const station = stations.find(s => s.id === stationId);
        if (station) {
          // Generate realistic historical data with variation
          const baseValue = station.pollutants[selectedPollutant];
          const variation = (Math.random() - 0.5) * 0.3 * Math.max(baseValue, 0.01); // Ensure minimum value
          const trend = Math.sin((i / days) * Math.PI) * 0.1 * Math.max(baseValue, 0.01);
          dataPoint[station.name] = Math.max(0.001, baseValue + variation + trend); // Ensure minimum value
        }
      });

      data.push(dataPoint);
    }

    return data;
  }, [selectedStations, selectedPollutant, stations]);

  // Generate radar chart data
  const radarData = useMemo(() => {
    return selectedStations.map(stationId => {
      const station = stations.find(s => s.id === stationId);
      if (!station) return null;

      return {
        station: station.name,
        lead: Math.min((station.pollutants.lead / 1.0) * 100, 100), // Normalize to percentage, cap at 100
        mercury: Math.min((station.pollutants.mercury / 0.2) * 100, 100),
        cadmium: Math.min((station.pollutants.cadmium / 0.1) * 100, 100),
        arsenic: Math.min((station.pollutants.arsenic / 0.2) * 100, 100),
      };
    }).filter(Boolean);
  }, [selectedStations, stations]);

  // Current levels comparison data
  const currentLevelsData = useMemo(() => {
    return selectedStations.map(stationId => {
      const station = stations.find(s => s.id === stationId);
      if (!station) return null;

      return {
        station: station.name,
        lead: station.pollutants.lead,
        mercury: station.pollutants.mercury,
        cadmium: station.pollutants.cadmium,
        arsenic: station.pollutants.arsenic,
      };
    }).filter(Boolean);
  }, [selectedStations, stations]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const pollutantColors: Record<string, string> = {
    lead: '#60A5FA',
    mercury: '#F87171',
    cadmium: '#FBBF24',
    arsenic: '#34D399',
  };

  const stationColors = [
    '#60A5FA', '#F87171', '#FBBF24', '#34D399', 
    '#A78BFA', '#FB7185', '#FCA5A5', '#6EE7B7'
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-gray-300 text-sm mb-2">
            {chartType === 'line' ? `Date: ${formatDate(label)}` : `Station: ${label}`}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(3)} {chartType === 'radar' ? '%' : 'ppm'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const toggleStation = (stationId: number) => {
    setSelectedStations(prev => 
      prev.includes(stationId) 
        ? prev.filter(id => id !== stationId)
        : [...prev, stationId]
    );
  };

  // Historical data for table (using first selected station)
  const tableData = useMemo(() => {
    if (selectedStations.length === 0) return [];
    
    const station = stations.find(s => s.id === selectedStations[0]);
    if (!station) return [];
    
    // Generate 90 days of historical data for the selected station
    const data = [];
    const today = new Date();
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic historical data with some variation
      const baseValues = station.pollutants;
      const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
      const seasonalFactor = 1 + 0.1 * Math.sin((i / 90) * 2 * Math.PI); // Seasonal variation
      
      data.push({
        timestamp: date.toISOString(),
        lead: Math.max(0.001, baseValues.lead * (1 + variation) * seasonalFactor),
        mercury: Math.max(0.001, baseValues.mercury * (1 + variation) * seasonalFactor),
        cadmium: Math.max(0.001, baseValues.cadmium * (1 + variation) * seasonalFactor),
        arsenic: Math.max(0.001, baseValues.arsenic * (1 + variation) * seasonalFactor),
      });
    }
    
    return data;
  }, [selectedStations, stations]);

  const selectedStationName = selectedStations.length > 0 
    ? stations.find(s => s.id === selectedStations[0])?.name || 'Unknown Station'
    : 'No Station Selected';

  // Generate date-filtered data for selected date range
  const dateFilteredData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const data: any[] = [];
    
    for (let i = 0; i < diffDays; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const timestamp = date.toISOString().split('T')[0];
      
      const dataPoint: any = { 
        timestamp,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
      
      selectedStations.forEach(stationId => {
        const station = stations.find(s => s.id === stationId);
        if (station) {
          // Generate realistic data with some variation
          const baseValue = station.pollutants[selectedPollutant];
          const variation = (Math.random() - 0.5) * 0.2 * Math.max(baseValue, 0.01);
          const seasonalFactor = 1 + 0.1 * Math.sin((i / diffDays) * 2 * Math.PI);
          dataPoint[station.name] = Math.max(0.001, (baseValue + variation) * seasonalFactor);
        }
      });
      
      data.push(dataPoint);
    }
    
    return data;
  }, [selectedStations, selectedPollutant, startDate, endDate, stations]);

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
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-3 rounded-2xl">
                <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">📈</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Compare trends and analyze environmental data
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Station Selection */}
            <div>
              <h3 className="text-white font-medium mb-3 flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Select Stations</span>
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {stations.map((station, index) => (
                  <label key={`${station.id}-${station.name}-${index}`} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStations.includes(station.id)}
                      onChange={() => toggleStation(station.id)}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-300 text-sm truncate">
                      {station.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pollutant Selection */}
            <div>
              <h3 className="text-white font-medium mb-3 flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Pollutant</span>
              </h3>
              <select
                value={selectedPollutant}
                onChange={(e) => setSelectedPollutant(e.target.value as any)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="lead">Lead (Pb)</option>
                <option value="mercury">Mercury (Hg)</option>
                <option value="cadmium">Cadmium (Cd)</option>
                <option value="arsenic">Arsenic (As)</option>
              </select>
            </div>

            {/* Chart Type */}
            <div>
              <h3 className="text-white font-medium mb-3 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Chart Type</span>
              </h3>
              <div className="flex space-x-2">
                {[
                  { type: 'line', icon: TrendingUp, label: 'Trend' },
                  { type: 'bar', icon: BarChart3, label: 'Compare' },
                  { type: 'radar', icon: Activity, label: 'Profile' }
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type as any)}
                    className={`
                      flex items-center space-x-1 px-3 py-2 rounded text-sm transition-colors duration-200
                      ${chartType === type 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Date Range Selection */}
            <div className="xl:col-span-1">
              <h3 className="text-white font-medium mb-3 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Date Range</span>
              </h3>
              <div className="space-y-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Date-Sensitive Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              Date-Filtered Pollution Trends
            </h3>
            <div className="text-sm text-gray-400">
              {new Date(startDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })} - {new Date(endDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={dateFilteredData}>
              <defs>
                {selectedStations.map((stationId, index) => {
                  const station = stations.find(s => s.id === stationId);
                  if (!station) return null;
                  
                  return (
                    <linearGradient key={stationId} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={stationColors[index]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={stationColors[index]} stopOpacity={0.1}/>
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                stroke="#6B7280"
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                stroke="#6B7280"
                label={{
                  value: `${selectedPollutant} (ppm)`,
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#9CA3AF' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {selectedStations.map((stationId, index) => {
                const station = stations.find(s => s.id === stationId);
                if (!station) return null;
                
                return (
                  <Area
                    key={stationId}
                    type="monotone"
                    dataKey={station.name}
                    stroke={stationColors[index]}
                    fill={`url(#gradient-${index})`}
                    fillOpacity={0.6}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5, stroke: stationColors[index], strokeWidth: 2, fill: '#1F2937' }}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trend Comparison Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              {chartType === 'line' && 'Pollution Trend Comparison'}
              {chartType === 'bar' && 'Current Levels Comparison'}
              {chartType === 'radar' && 'Station Pollution Profile'}
            </h3>
            
            {chartType === 'line' && (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                  <XAxis
                    dataKey="timestamp"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    stroke="#6B7280"
                    tickFormatter={formatDate}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    stroke="#6B7280"
                    label={{
                      value: `${selectedPollutant} (ppm)`,
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fill: '#9CA3AF' }
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {selectedStations.map((stationId, index) => {
                    const station = stations.find(s => s.id === stationId);
                    if (!station) return null;
                    
                    return (
                      <Line
                        key={stationId}
                        type="monotone"
                        dataKey={station.name}
                        stroke={stationColors[index]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            )}
            
            {chartType === 'bar' && (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={currentLevelsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                  <XAxis
                    dataKey="station"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    stroke="#6B7280"
                  />
                  <YAxis
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    stroke="#6B7280"
                    label={{
                      value: 'Concentration (ppm)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fill: '#9CA3AF' }
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey={selectedPollutant}
                    fill={pollutantColors[selectedPollutant]}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
            
            {chartType === 'radar' && (
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    className="text-xs"
                  />
                  <PolarRadiusAxis 
                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {radarData.map((_, index) => (
                    <Radar
                      key={index}
                      name={radarData[index]?.station || ''}
                      dataKey="lead"
                      stroke={stationColors[index]}
                      fill={stationColors[index]}
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Summary Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Summary Statistics
            </h3>
            <div className="space-y-4">
              {['lead', 'mercury', 'cadmium', 'arsenic'].map((pollutant) => {
                // Calculate statistics from the actual chart data
                const chartValues = comparisonData.flatMap(dataPoint => 
                  selectedStations.map(stationId => {
                    const station = stations.find(s => s.id === stationId);
                    if (!station) return 0;
                    return dataPoint[station.name] || 0;
                  })
                ).filter(val => val > 0);
                
                const avg = chartValues.length > 0 ? chartValues.reduce((a, b) => a + b, 0) / chartValues.length : 0;
                const max = chartValues.length > 0 ? Math.max(...chartValues) : 0;
                const min = chartValues.length > 0 ? Math.min(...chartValues) : 0;
                
                return (
                  <div key={pollutant} className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2 capitalize">
                      {pollutant}
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Average:</span>
                        <div className="text-white font-mono">
                          {avg.toFixed(3)} ppm
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Maximum:</span>
                        <div className="text-red-400 font-mono">
                          {max.toFixed(3)} ppm
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Minimum:</span>
                        <div className="text-green-400 font-mono">
                          {min.toFixed(3)} ppm
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Historical Data Table */}
        <DataTable 
          data={tableData} 
          stationName={selectedStationName}
        />
      </div>
    </div>
  );
};

export default Analytics;

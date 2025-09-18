import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TimeSeriesData } from '../data/mockData';

interface PollutionChartProps {
  data: TimeSeriesData[];
  height?: number;
}

const PollutionChart = ({ data, height = 400 }: PollutionChartProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-gray-300 text-sm mb-2">
            Date: {formatDate(label)}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(3)} ppm
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="bg-gray-800 rounded-lg p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">
          Pollution Trends (Last 30 Days)
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-400 rounded-full" />
            <span className="text-gray-300">Lead</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-400 rounded-full" />
            <span className="text-gray-300">Mercury</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-400 rounded-full" />
            <span className="text-gray-300">Cadmium</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-400 rounded-full" />
            <span className="text-gray-300">Arsenic</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#374151"
            opacity={0.5}
          />
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
              value: 'Concentration (ppm)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#9CA3AF' }
            }}
          />
          <Tooltip 
            content={<CustomTooltip />}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px'
            }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="lead"
            stroke="#60A5FA"
            strokeWidth={2}
            dot={{ r: 3, fill: '#60A5FA' }}
            activeDot={{ r: 5, fill: '#60A5FA' }}
            name="Lead"
          />
          <Line
            type="monotone"
            dataKey="mercury"
            stroke="#F87171"
            strokeWidth={2}
            dot={{ r: 3, fill: '#F87171' }}
            activeDot={{ r: 5, fill: '#F87171' }}
            name="Mercury"
          />
          <Line
            type="monotone"
            dataKey="cadmium"
            stroke="#FBBF24"
            strokeWidth={2}
            dot={{ r: 3, fill: '#FBBF24' }}
            activeDot={{ r: 5, fill: '#FBBF24' }}
            name="Cadmium"
          />
          <Line
            type="monotone"
            dataKey="arsenic"
            stroke="#34D399"
            strokeWidth={2}
            dot={{ r: 3, fill: '#34D399' }}
            activeDot={{ r: 5, fill: '#34D399' }}
            name="Arsenic"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default PollutionChart;
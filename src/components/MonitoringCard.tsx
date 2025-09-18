import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

interface MonitoringCardProps {
  title: string;
  value: number;
  unit: string;
  status: 'safe' | 'caution' | 'danger';
  trend?: 'up' | 'down' | 'stable';
  change?: number | string;
  threshold: {
    safe: number | { min: number; max: number };
    caution: number | { min: number; max: number };
  };
}

const MonitoringCard = ({ 
  title, 
  value, 
  unit, 
  status, 
  trend, 
  change, 
  threshold 
}: MonitoringCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'safe':
        return 'border-green-500 bg-green-500/10';
      case 'caution':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'danger':
        return 'border-red-500 bg-red-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIndicator = () => {
    switch (status) {
      case 'safe':
        return <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />;
      case 'caution':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />;
      case 'danger':
        return <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-400" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'safe':
        return 'Safe';
      case 'caution':
        return 'Caution';
      case 'danger':
        return 'Danger';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        scale: 1.02, 
        transition: { duration: 0.2 } 
      }}
      className={`
        p-6 rounded-lg border-2 backdrop-blur-sm transition-all duration-300
        hover:shadow-lg hover:shadow-gray-800/20 cursor-pointer
        ${getStatusColor()}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
          {title}
        </h3>
        <div className="flex items-center space-x-2">
          {getStatusIndicator()}
          {status === 'danger' && (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          )}
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline space-x-2 mb-2">
        <span className="text-3xl font-bold text-white">
          {value.toFixed(2)}
        </span>
        <span className="text-sm text-gray-400">
          {unit}
        </span>
      </div>

      {/* Status and Trend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`
            text-xs font-medium px-2 py-1 rounded-full
            ${status === 'safe' ? 'bg-green-500/20 text-green-400' : 
              status === 'caution' ? 'bg-yellow-500/20 text-yellow-400' : 
              'bg-red-500/20 text-red-400'}
          `}>
            {getStatusText()}
          </span>
          {trend && change !== undefined && (
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className={`
                text-xs
                ${trend === 'up' ? 'text-red-400' : 
                  trend === 'down' ? 'text-green-400' : 
                  'text-gray-400'}
              `}>
                {typeof change === 'string' ? change : Math.abs(change).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Threshold indicator */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between text-xs text-gray-400">
          {typeof threshold.safe === 'object' ? (
            // pH range display
            <>
              <span>Safe: {threshold.safe.min}-{threshold.safe.max} {unit}</span>
              <span>Caution: {threshold.caution.min}-{threshold.caution.max} {unit}</span>
            </>
          ) : (
            // Standard threshold display
            <>
              <span>Safe: &lt; {threshold.safe} {unit}</span>
              <span>Caution: &lt; {threshold.caution} {unit}</span>
            </>
          )}
        </div>
        <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"
            style={{ width: '100%' }}
          />
          <div 
            className="absolute w-2 h-2 bg-white rounded-full border-2 border-gray-800 transform -translate-y-1/2 -translate-x-1/2"
            style={{ 
              left: typeof threshold.safe === 'object' 
                ? `${((value - threshold.caution.min) / (threshold.caution.max - threshold.caution.min)) * 100}%`
                : `${Math.min((value / (threshold.caution * 2)) * 100, 100)}%`,
              top: '50%'
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default MonitoringCard;
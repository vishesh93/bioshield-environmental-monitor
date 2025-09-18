import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface WaterLevelIndicatorProps {
  level: number; // 0-100
  maxLevel?: number;
  width?: number;
  height?: number;
  className?: string;
  label?: string;
  animated?: boolean;
  showPercentage?: boolean;
  colorThresholds?: {
    safe: { min: number; max: number; color: string };
    warning: { min: number; max: number; color: string };
    danger: { min: number; max: number; color: string };
  };
}

const WaterLevelIndicator: React.FC<WaterLevelIndicatorProps> = ({
  level,
  maxLevel = 100,
  width = 200,
  height = 300,
  className = '',
  label,
  animated = true,
  showPercentage = true,
  colorThresholds = {
    safe: { min: 0, max: 30, color: 'from-green-400 to-emerald-500' },
    warning: { min: 31, max: 70, color: 'from-yellow-400 to-orange-500' },
    danger: { min: 71, max: 100, color: 'from-red-400 to-pink-500' }
  }
}) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const controls = useAnimation();

  // Animate to new level
  useEffect(() => {
    if (animated) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setCurrentLevel(level);
        setIsAnimating(false);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setCurrentLevel(level);
    }
  }, [level, animated]);

  // Get color based on level
  const getWaterColor = (currentLvl: number) => {
    if (currentLvl >= colorThresholds.danger.min) return colorThresholds.danger.color;
    if (currentLvl >= colorThresholds.warning.min) return colorThresholds.warning.color;
    return colorThresholds.safe.color;
  };

  // Get status text
  const getStatus = (currentLvl: number) => {
    if (currentLvl >= colorThresholds.danger.min) return { text: 'Critical', color: 'text-red-500' };
    if (currentLvl >= colorThresholds.warning.min) return { text: 'Warning', color: 'text-yellow-500' };
    return { text: 'Safe', color: 'text-green-500' };
  };

  const waterHeight = Math.max(0, Math.min(100, (currentLevel / maxLevel) * 100));
  const waterColor = getWaterColor(currentLevel);
  const status = getStatus(currentLevel);

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      {/* Label */}
      {label && (
        <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </div>
      )}

      {/* Main Container */}
      <div
        className="relative rounded-3xl border-4 border-gray-300 dark:border-gray-600 overflow-hidden shadow-lg"
        style={{
          width,
          height,
          background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.1), rgba(34, 197, 94, 0.05))'
        }}
      >
        {/* Background Grid */}
        <div className="absolute inset-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-gray-200 dark:border-gray-700 opacity-30"
              style={{ top: `${(i + 1) * 10}%` }}
            />
          ))}
        </div>

        {/* Level Markers */}
        <div className="absolute left-0 top-0 bottom-0 w-full">
          {[25, 50, 75, 100].map((marker) => (
            <div
              key={marker}
              className="absolute left-2 text-xs text-gray-500 font-mono"
              style={{ 
                bottom: `${marker}%`,
                transform: 'translateY(50%)'
              }}
            >
              {marker}%
            </div>
          ))}
        </div>

        {/* Water Level */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${waterColor}`}
          initial={{ height: '0%' }}
          animate={{ 
            height: `${waterHeight}%`
          }}
          transition={{
            duration: animated ? 2 : 0,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          style={{
            opacity: 0.8
          }}
        >
          {/* Animated Water Surface */}
          <div className="absolute top-0 left-0 right-0 h-full overflow-hidden">
            {/* Primary Wave */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-full"
              style={{
                background: `linear-gradient(to top, rgba(255, 255, 255, 0.2), transparent)`,
                clipPath: `polygon(
                  0 20%, 
                  10% 15%, 
                  20% 25%, 
                  30% 10%, 
                  40% 30%, 
                  50% 15%, 
                  60% 25%, 
                  70% 10%, 
                  80% 20%, 
                  90% 15%, 
                  100% 25%, 
                  100% 100%, 
                  0 100%
                )`
              }}
              animate={{
                clipPath: [
                  `polygon(0 20%, 10% 15%, 20% 25%, 30% 10%, 40% 30%, 50% 15%, 60% 25%, 70% 10%, 80% 20%, 90% 15%, 100% 25%, 100% 100%, 0 100%)`,
                  `polygon(0 25%, 10% 20%, 20% 15%, 30% 30%, 40% 10%, 50% 25%, 60% 15%, 70% 25%, 80% 10%, 90% 20%, 100% 15%, 100% 100%, 0 100%)`,
                  `polygon(0 15%, 10% 25%, 20% 20%, 30% 15%, 40% 25%, 50% 10%, 60% 30%, 70% 15%, 80% 25%, 90% 10%, 100% 20%, 100% 100%, 0 100%)`,
                  `polygon(0 20%, 10% 15%, 20% 25%, 30% 10%, 40% 30%, 50% 15%, 60% 25%, 70% 10%, 80% 20%, 90% 15%, 100% 25%, 100% 100%, 0 100%)`
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Secondary Wave */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-full"
              style={{
                background: `linear-gradient(to top, rgba(255, 255, 255, 0.1), transparent)`,
                clipPath: `polygon(
                  0 30%, 
                  15% 25%, 
                  30% 35%, 
                  45% 20%, 
                  60% 40%, 
                  75% 25%, 
                  90% 35%, 
                  100% 30%, 
                  100% 100%, 
                  0 100%
                )`
              }}
              animate={{
                clipPath: [
                  `polygon(0 30%, 15% 25%, 30% 35%, 45% 20%, 60% 40%, 75% 25%, 90% 35%, 100% 30%, 100% 100%, 0 100%)`,
                  `polygon(0 35%, 15% 30%, 30% 25%, 45% 40%, 60% 20%, 75% 35%, 90% 25%, 100% 35%, 100% 100%, 0 100%)`,
                  `polygon(0 25%, 15% 35%, 30% 30%, 45% 25%, 60% 35%, 75% 20%, 90% 40%, 100% 25%, 100% 100%, 0 100%)`,
                  `polygon(0 30%, 15% 25%, 30% 35%, 45% 20%, 60% 40%, 75% 25%, 90% 35%, 100% 30%, 100% 100%, 0 100%)`
                ]
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
          </div>

          {/* Floating Bubbles in Water */}
          {waterHeight > 10 && (
            <div className="absolute inset-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full opacity-30"
                  style={{
                    left: `${20 + i * 15}%`,
                    bottom: `${Math.random() * 80 + 10}%`
                  }}
                  animate={{
                    y: [-10, -30, -10],
                    x: [0, Math.sin(i) * 10, 0],
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          )}

          {/* Water Glow Effect */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center top, rgba(255, 255, 255, 0.3), transparent 70%)`,
              opacity: 0.6
            }}
          />
        </motion.div>

        {/* Level Text Overlay */}
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="text-2xl font-bold text-white drop-shadow-lg"
              animate={isAnimating ? {
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8]
              } : {}}
              transition={{ duration: 0.5 }}
            >
              {Math.round(currentLevel)}%
            </motion.div>
          </div>
        )}

        {/* Overflow Warning */}
        {currentLevel >= 90 && (
          <motion.div
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs bg-red-500 text-white px-2 py-1 rounded-full"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 1,
              repeat: Infinity
            }}
          >
            OVERFLOW RISK
          </motion.div>
        )}
      </div>

      {/* Status and Info */}
      <div className="mt-3 text-center">
        <div className={`text-sm font-semibold ${status.color}`}>
          {status.text}
        </div>
        {showPercentage && (
          <div className="text-xs text-gray-500 mt-1">
            {currentLevel.toFixed(1)}% of {maxLevel}
          </div>
        )}
      </div>

      {/* Level Legend */}
      <div className="mt-2 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500" />
          <span className="text-gray-600">Safe</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500" />
          <span className="text-gray-600">Warning</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-pink-500" />
          <span className="text-gray-600">Critical</span>
        </div>
      </div>
    </div>
  );
};

export default WaterLevelIndicator;
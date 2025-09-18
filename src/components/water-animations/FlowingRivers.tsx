import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FlowingRiversProps {
  paths?: Array<{
    id: string;
    d: string;
    color?: string;
    width?: number;
    speed?: number;
    opacity?: number;
  }>;
  className?: string;
  width?: number;
  height?: number;
  animated?: boolean;
  showParticles?: boolean;
  particleCount?: number;
}

const FlowingRivers: React.FC<FlowingRiversProps> = ({
  paths = [
    {
      id: 'river-1',
      d: 'M50,50 Q150,100 250,50 T450,100 T650,50',
      color: 'rgba(59, 130, 246, 0.6)',
      width: 8,
      speed: 1,
      opacity: 0.8
    },
    {
      id: 'river-2', 
      d: 'M100,150 Q200,200 300,150 T500,200 T700,150',
      color: 'rgba(34, 197, 94, 0.6)',
      width: 6,
      speed: 1.2,
      opacity: 0.6
    }
  ],
  className = '',
  width = 800,
  height = 400,
  animated = true,
  showParticles = true,
  particleCount = 20
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Get path length for animation
  const getPathLength = (pathElement: SVGPathElement): number => {
    return pathElement.getTotalLength();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0"
      >
        <defs>
          {/* Gradient definitions for water flow */}
          <linearGradient id="waterGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
            <stop offset="30%" stopColor="rgba(59, 130, 246, 0.8)" />
            <stop offset="70%" stopColor="rgba(34, 197, 94, 0.8)" />
            <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
          </linearGradient>

          <linearGradient id="waterGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(34, 197, 94, 0)" />
            <stop offset="30%" stopColor="rgba(34, 197, 94, 0.6)" />
            <stop offset="70%" stopColor="rgba(16, 185, 129, 0.6)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
          </linearGradient>

          {/* Flow animation patterns */}
          <pattern id="flowPattern" x="0" y="0" width="40" height="10" patternUnits="userSpaceOnUse">
            <motion.rect
              x="0"
              y="0"
              width="20"
              height="10"
              fill="rgba(255, 255, 255, 0.3)"
              animate={animated ? {
                x: [0, 40, 0]
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </pattern>

          {/* Ripple effect filter */}
          <filter id="ripple">
            <feTurbulence
              baseFrequency="0.02"
              numOctaves="3"
              result="noise"
              seed="1"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2"
            />
          </filter>

          {/* Glow effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Render river paths */}
        {paths.map((path, index) => (
          <g key={path.id}>
            {/* Background river bed */}
            <motion.path
              d={path.d}
              fill="none"
              stroke={path.color}
              strokeWidth={path.width + 4}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={path.opacity * 0.3}
              filter="url(#glow)"
            />

            {/* Main river flow */}
            <motion.path
              d={path.d}
              fill="none"
              stroke={path.color}
              strokeWidth={path.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={path.opacity}
              strokeDasharray={animated ? "20 10" : undefined}
              animate={animated ? {
                strokeDashoffset: [0, -30, 0]
              } : {}}
              transition={{
                duration: 3 / path.speed,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* Flow highlights */}
            <motion.path
              d={path.d}
              fill="none"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth={path.width * 0.3}
              strokeLinecap="round"
              opacity={0.8}
              strokeDasharray="10 20"
              animate={animated ? {
                strokeDashoffset: [0, 30, 0]
              } : {}}
              transition={{
                duration: 2 / path.speed,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* Flow particles */}
            {showParticles && animated && (
              <>
                {Array.from({ length: Math.floor(particleCount / paths.length) }).map((_, particleIndex) => (
                  <motion.circle
                    key={`${path.id}-particle-${particleIndex}`}
                    r="2"
                    fill="rgba(255, 255, 255, 0.8)"
                    opacity={0.7}
                    animate={{
                      offsetDistance: ["0%", "100%"]
                    }}
                    transition={{
                      duration: 4 / path.speed,
                      repeat: Infinity,
                      ease: "linear",
                      delay: (particleIndex * 0.5) / path.speed
                    }}
                    style={{
                      offsetPath: `path('${path.d}')`,
                      offsetRotate: '0deg'
                    }}
                  />
                ))}
              </>
            )}

            {/* Bubble effects along the path */}
            {animated && (
              <>
                {Array.from({ length: 3 }).map((_, bubbleIndex) => (
                  <motion.circle
                    key={`${path.id}-bubble-${bubbleIndex}`}
                    r={2 + Math.random() * 3}
                    fill="rgba(255, 255, 255, 0.4)"
                    opacity={0.6}
                    animate={{
                      offsetDistance: ["0%", "100%"],
                      r: [2, 5, 2],
                      opacity: [0.6, 0.9, 0.6]
                    }}
                    transition={{
                      duration: 6 / path.speed,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: bubbleIndex * 2
                    }}
                    style={{
                      offsetPath: `path('${path.d}')`,
                      offsetRotate: '0deg'
                    }}
                  />
                ))}
              </>
            )}
          </g>
        ))}

        {/* Connection nodes */}
        {animated && (
          <>
            {/* Source point */}
            <motion.circle
              cx="50"
              cy="50"
              r="8"
              fill="rgba(59, 130, 246, 0.8)"
              animate={{
                r: [8, 12, 8],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Destination point */}
            <motion.circle
              cx="650"
              cy="50"
              r="8"
              fill="rgba(34, 197, 94, 0.8)"
              animate={{
                r: [8, 12, 8],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />

            {/* Intermediate nodes */}
            <motion.circle
              cx="300"
              cy="150"
              r="6"
              fill="rgba(16, 185, 129, 0.6)"
              animate={{
                r: [6, 9, 6],
                opacity: [0.6, 0.9, 0.6]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </>
        )}

        {/* Water surface reflections */}
        {paths.map((path, index) => (
          <motion.path
            key={`${path.id}-reflection`}
            d={path.d}
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={path.width * 0.5}
            strokeLinecap="round"
            opacity={0.4}
            transform="scale(1, -0.3) translate(0, -100)"
            animate={animated ? {
              opacity: [0.2, 0.6, 0.2]
            } : {}}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5
            }}
          />
        ))}
      </svg>

      {/* Overlay effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Ambient water glow */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 90% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 70%)
            `
          }}
        />

        {/* Interactive hint */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-400 opacity-70">
          Data Flow Visualization
        </div>
      </div>
    </div>
  );
};

// Utility function to generate curved paths between points
export const generateRiverPath = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  curve?: number
): string => {
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const controlOffset = curve || 50;

  // Create a smooth S-curve
  return `M${startX},${startY} Q${midX},${midY - controlOffset} ${endX},${endY}`;
};

// Predefined river configurations
export const riverPresets = {
  horizontal: {
    id: 'horizontal-flow',
    d: 'M50,200 Q150,150 300,200 T600,150 T750,200',
    color: 'rgba(59, 130, 246, 0.7)',
    width: 8,
    speed: 1,
    opacity: 0.8
  },
  vertical: {
    id: 'vertical-flow', 
    d: 'M200,50 Q150,150 200,300 T250,500 T200,650',
    color: 'rgba(34, 197, 94, 0.7)',
    width: 6,
    speed: 1.2,
    opacity: 0.7
  },
  connecting: {
    id: 'connection-flow',
    d: 'M100,100 Q200,50 400,100 Q600,150 700,100',
    color: 'rgba(16, 185, 129, 0.6)',
    width: 5,
    speed: 0.8,
    opacity: 0.6
  }
};

export default FlowingRivers;
import { motion, useTime, useTransform, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { throttle } from 'lodash-es';

interface MorphingBackgroundProps {
  className?: string;
  colors?: string[];
  intensity?: number;
}

export const MorphingBackground: React.FC<MorphingBackgroundProps> = ({
  className = '',
  colors = ['#3B82F6', '#10B981', '#8B5CF6', '#06B6D4'],
  intensity = 1
}) => {
  const prefersReducedMotion = useReducedMotion();
  const time = useTime();
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [isVisible, setIsVisible] = useState(true);

  // Throttled resize handler for performance
  const updateDimensions = useCallback(
    throttle(() => {
      setDimensions({
        width: Math.min(window.innerWidth, 1920), // Cap at 1920px
        height: Math.min(window.innerHeight, 1080) // Cap at 1080px
      });
    }, 100),
    []
  );

  // Intersection observer for visibility optimization
  const handleIntersection = useCallback(
    throttle((entries: IntersectionObserverEntry[]) => {
      setIsVisible(entries[0].isIntersecting);
    }, 200),
    []
  );

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions, { passive: true });
    
    // Add intersection observer
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1
    });
    
    const element = document.querySelector(`[data-morph-bg]`);
    if (element) observer.observe(element);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      observer.disconnect();
    };
  }, [updateDimensions, handleIntersection]);

  // Create multiple morphing paths with different speeds - optimized for performance
  const paths = useMemo(() => {
    if (prefersReducedMotion || !isVisible) {
      // Static paths for reduced motion preference
      return Array(3).fill(null).map(() => 
        `M0,0 Q${dimensions.width * 0.3},${dimensions.height * 0.4} ${dimensions.width * 0.6},${dimensions.height * 0.3} Q${dimensions.width * 0.8},${dimensions.height * 0.6} ${dimensions.width},${dimensions.height * 0.5} L${dimensions.width},${dimensions.height} L0,${dimensions.height} Z`
      );
    }

    const createPath = (offset: number, amplitude: number, frequency: number) => {
      return useTransform(time, (t) => {
        // Reduce calculation frequency for smoother performance
        const time1 = (t + offset) * 0.0008 * frequency; // Reduced from 0.001
        const time2 = (t + offset * 1.5) * 0.0006 * frequency; // Reduced from 0.0008
        const time3 = (t + offset * 2) * 0.0009 * frequency; // Reduced from 0.0012
        
        const w = dimensions.width;
        const h = dimensions.height;
        
        const x1 = w * 0.1 + Math.sin(time1) * amplitude * intensity;
        const y1 = h * 0.2 + Math.cos(time1 * 1.2) * amplitude * intensity;
        
        const x2 = w * 0.3 + Math.sin(time2 * 1.3) * amplitude * intensity;
        const y2 = h * 0.4 + Math.cos(time2) * amplitude * intensity;
        
        const x3 = w * 0.6 + Math.sin(time3 * 0.8) * amplitude * intensity;
        const y3 = h * 0.3 + Math.cos(time3 * 1.5) * amplitude * intensity;
        
        const x4 = w * 0.8 + Math.sin(time1 * 1.1) * amplitude * intensity;
        const y4 = h * 0.6 + Math.cos(time2 * 0.9) * amplitude * intensity;
        
        const x5 = w * 0.9 + Math.sin(time3 * 1.4) * amplitude * intensity;
        const y5 = h * 0.8 + Math.cos(time1 * 1.3) * amplitude * intensity;
        
        return `M0,0 Q${x1},${y1} ${x2},${y2} T${x3},${y3} Q${x4},${y4} ${x5},${y5} Q${w},${y5} ${w},${h} L0,${h} Z`;
      });
    };

    return [
      createPath(0, 60, 1.0), // Reduced amplitude and frequency
      createPath(1000, 45, 1.2),
      createPath(2000, 55, 0.9)
      // Reduced from 4 to 3 paths for better performance
    ];
  }, [time, dimensions, intensity]);

  // Rotating gradient animation
  const gradientRotation = useTransform(time, (t) => `${(t * 0.02) % 360}deg`);

  // Skip rendering if not visible or reduced motion is preferred
  if (!isVisible && !prefersReducedMotion) {
    return <div className={`absolute inset-0 ${className}`} data-morph-bg />;
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} data-morph-bg>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="absolute inset-0"
        style={{ transform: 'translateZ(0)' }}
      >
        <defs>
          {colors.map((color, index) => (
            <linearGradient
              key={index}
              id={`morphGradient${index}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={color} stopOpacity={0.1} />
              <stop offset="50%" stopColor={color} stopOpacity={0.05} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          ))}
          
          <radialGradient id="morphRadialGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors[0]} stopOpacity={0.08} />
            <stop offset="50%" stopColor={colors[1]} stopOpacity={0.04} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {paths.map((path, index) => (
          <motion.path
            key={index}
            d={path}
            fill={`url(#morphGradient${index % colors.length})`}
            style={{
              filter: `blur(${2 + index}px)`,
              transformOrigin: 'center',
            }}
          />
        ))}

        {/* Central morphing blob */}
        <motion.ellipse
          cx={useTransform(time, (t) => dimensions.width * 0.5 + Math.sin(t * 0.001) * 100)}
          cy={useTransform(time, (t) => dimensions.height * 0.5 + Math.cos(t * 0.001) * 80)}
          rx={useTransform(time, (t) => 200 + Math.sin(t * 0.002) * 100)}
          ry={useTransform(time, (t) => 150 + Math.cos(t * 0.0015) * 80)}
          fill="url(#morphRadialGradient)"
          style={{
            filter: 'blur(3px)',
            transform: gradientRotation,
            transformOrigin: 'center'
          }}
        />
      </svg>

      {/* CSS-based morphing background overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: useTransform(time, (t) => {
            const hue1 = (t * 0.01) % 360;
            const hue2 = (t * 0.015 + 120) % 360;
            const hue3 = (t * 0.008 + 240) % 360;
            
            return `
              radial-gradient(circle at ${30 + Math.sin(t * 0.001) * 20}% ${40 + Math.cos(t * 0.0012) * 20}%, 
                hsla(${hue1}, 60%, 70%, 0.03) 0%, transparent 50%),
              radial-gradient(circle at ${70 + Math.sin(t * 0.0015) * 25}% ${60 + Math.cos(t * 0.001) * 30}%, 
                hsla(${hue2}, 65%, 75%, 0.04) 0%, transparent 60%),
              radial-gradient(circle at ${50 + Math.sin(t * 0.0008) * 15}% ${30 + Math.cos(t * 0.0018) * 25}%, 
                hsla(${hue3}, 70%, 80%, 0.02) 0%, transparent 70%)
            `;
          }),
          filter: 'blur(1px)'
        }}
      />
    </div>
  );
};

export default MorphingBackground;
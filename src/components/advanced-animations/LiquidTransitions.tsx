import { motion, useTime, useTransform, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { useEffect, useState, useMemo, ReactNode, useRef, useCallback } from 'react';
import { throttle } from 'lodash-es';

interface LiquidBlobProps {
  className?: string;
  color?: string;
  size?: number;
  intensity?: number;
  speed?: number;
}

export const LiquidBlob: React.FC<LiquidBlobProps> = ({
  className = '',
  color = '#3B82F6',
  size = 200,
  intensity = 1,
  speed = 1
}) => {
  const prefersReducedMotion = useReducedMotion();
  const time = useTime();
  const [isVisible, setIsVisible] = useState(true);

  const pathTransform = useTransform(time, (t) => {
    if (prefersReducedMotion) {
      // Static blob shape for reduced motion
      const staticRadius = size / 4;
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = size / 2 + Math.cos(angle) * staticRadius;
        const y = size / 2 + Math.sin(angle) * staticRadius;
        points.push(`${x},${y}`);
      }
      return `M${points.join(' L')} Z`;
    }
    
    const timeOffset = t * 0.0008 * speed; // Reduced frequency
    const points = [];
    const numPoints = 6; // Reduced from 8
    const baseRadius = size / 4;
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const variation1 = Math.sin(angle * 3 + timeOffset) * intensity * 15;
      const variation2 = Math.cos(angle * 2 + timeOffset * 1.5) * intensity * 10;
      const variation3 = Math.sin(angle * 4 + timeOffset * 0.8) * intensity * 8;
      
      const radius = baseRadius + variation1 + variation2 + variation3;
      
      const x = size / 2 + Math.cos(angle) * radius;
      const y = size / 2 + Math.sin(angle) * radius;
      
      // Create smooth curves using quadratic bezier curves
      const nextAngle = ((i + 1) / numPoints) * Math.PI * 2;
      const nextRadius = baseRadius + 
        Math.sin(nextAngle * 3 + timeOffset) * intensity * 15 +
        Math.cos(nextAngle * 2 + timeOffset * 1.5) * intensity * 10 +
        Math.sin(nextAngle * 4 + timeOffset * 0.8) * intensity * 8;
      
      const nextX = size / 2 + Math.cos(nextAngle) * nextRadius;
      const nextY = size / 2 + Math.sin(nextAngle) * nextRadius;
      
      // Control points for smooth curves
      const controlX = x + Math.cos(angle + Math.PI / 4) * 10;
      const controlY = y + Math.sin(angle + Math.PI / 4) * 10;
      
      if (i === 0) {
        points.push(`M${x},${y}`);
      } else {
        points.push(`Q${controlX},${controlY} ${x},${y}`);
      }
    }
    
    // Close the path smoothly
    const firstX = size / 2 + Math.cos(0) * (baseRadius + Math.sin(timeOffset) * intensity * 15);
    const firstY = size / 2 + Math.sin(0) * (baseRadius + Math.cos(timeOffset * 1.5) * intensity * 10);
    points.push(`Q${firstX + 10},${firstY + 10} ${firstX},${firstY}`);
    points.push('Z');
    
    return points.join(' ');
  });

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
        <defs>
          <filter id="liquidBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2"/>
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"/>
            <feBlend in="SourceGraphic" in2="result"/>
          </filter>
          <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="50%" stopColor={color} stopOpacity="0.7" />
            <stop offset="100%" stopColor={color} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        
        <motion.path
          d={pathTransform}
          fill="url(#liquidGradient)"
          filter="url(#liquidBlur)"
          style={{
            filter: `drop-shadow(0 0 20px ${color}40)`
          }}
        />
      </svg>
    </div>
  );
};

interface LiquidTransitionProps {
  isVisible: boolean;
  children: ReactNode;
  className?: string;
  color?: string;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'center';
}

export const LiquidTransition: React.FC<LiquidTransitionProps> = ({
  isVisible,
  children,
  className = '',
  color = '#3B82F6',
  duration = 0.8,
  direction = 'center'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getTransitionVariants = () => {
    const { width, height } = dimensions;
    
    switch (direction) {
      case 'up':
        return {
          hidden: { clipPath: `circle(0% at 50% 100%)` },
          visible: { clipPath: `circle(150% at 50% 100%)` }
        };
      case 'down':
        return {
          hidden: { clipPath: `circle(0% at 50% 0%)` },
          visible: { clipPath: `circle(150% at 50% 0%)` }
        };
      case 'left':
        return {
          hidden: { clipPath: `circle(0% at 100% 50%)` },
          visible: { clipPath: `circle(150% at 100% 50%)` }
        };
      case 'right':
        return {
          hidden: { clipPath: `circle(0% at 0% 50%)` },
          visible: { clipPath: `circle(150% at 0% 50%)` }
        };
      default: // center
        return {
          hidden: { clipPath: `circle(0% at 50% 50%)` },
          visible: { clipPath: `circle(150% at 50% 50%)` }
        };
    }
  };

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={getTransitionVariants()}
            transition={{
              duration,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "tween"
            }}
            className="relative"
            style={{
              backgroundColor: `${color}10`,
              backdropFilter: 'blur(10px)'
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface LiquidButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'fill' | 'outline' | 'ghost';
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const LiquidButton: React.FC<LiquidButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'fill',
  color = '#3B82F6',
  size = 'md',
  disabled = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const baseClasses = 'relative overflow-hidden rounded-2xl font-semibold transition-all duration-300 transform';

  const variantClasses = {
    fill: `bg-[${color}] text-white shadow-lg`,
    outline: `border-2 border-[${color}] text-[${color}] hover:text-white`,
    ghost: `text-[${color}] hover:bg-[${color}10`
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  // Liquid effect path
  const liquidPath = useTransform([mouseX, mouseY], ([x, y]) => {
    if (!isHovered) return 'M0,50 Q50,50 100,50 T200,50 L200,100 L0,100 Z';
    
    const rippleRadius = isPressed ? 60 : 40;
    const centerX = x || 100;
    const centerY = y || 25;
    
    return `M0,${centerY + rippleRadius} 
            Q${centerX - rippleRadius},${centerY} ${centerX},${centerY}
            Q${centerX + rippleRadius},${centerY} 200,${centerY + rippleRadius}
            L200,100 L0,100 Z`;
  });

  return (
    <motion.button
      ref={buttonRef}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {/* Liquid background effect */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 200 100"
          className="absolute inset-0"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="liquidButtonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={variant === 'outline' ? "0.3" : "0.8"} />
              <stop offset="100%" stopColor={color} stopOpacity={variant === 'outline' ? "0.1" : "0.4"} />
            </linearGradient>
          </defs>
          
          <motion.path
            d={liquidPath}
            fill="url(#liquidButtonGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </svg>
      </div>

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center space-x-2">
        {children}
      </span>

      {/* Ripple effect on click */}
      <AnimatePresence>
        {isPressed && (
          <motion.div
            className="absolute inset-0 bg-white rounded-2xl"
            initial={{ scale: 0, opacity: 0.3 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: `radial-gradient(circle at ${mouseX.get()}px ${mouseY.get()}px, rgba(255,255,255,0.3) 0%, transparent 70%)`
            }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
};

interface LiquidLoaderProps {
  isLoading: boolean;
  className?: string;
  color?: string;
  size?: number;
  text?: string;
}

export const LiquidLoader: React.FC<LiquidLoaderProps> = ({
  isLoading,
  className = '',
  color = '#3B82F6',
  size = 80,
  text = 'Loading...'
}) => {
  const time = useTime();

  const liquidAnimation = useTransform(time, (t) => {
    const timeOffset = t * 0.002;
    const waveHeight = Math.sin(timeOffset) * 10 + 30;
    const waveOffset = Math.cos(timeOffset * 1.5) * 20;
    
    return `M0,${waveHeight} 
            Q25,${waveHeight - 10 + waveOffset} 50,${waveHeight}
            T100,${waveHeight}
            L100,100 L0,100 Z`;
  });

  const bubbles = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: Math.random() * 60 + 20,
      y: Math.random() * 40 + 50,
      size: Math.random() * 6 + 3,
      delay: i * 0.3
    }));
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={`flex flex-col items-center space-y-4 ${className}`}
        >
          <div className="relative" style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              viewBox="0 0 100 100"
              className="rounded-full overflow-hidden"
            >
              <defs>
                <linearGradient id="liquidLoaderGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.4" />
                </linearGradient>
                <filter id="liquidLoaderBlur">
                  <feGaussianBlur stdDeviation="1"/>
                </filter>
              </defs>
              
              {/* Background circle */}
              <circle cx="50" cy="50" r="48" fill={`${color}20`} stroke={`${color}40`} strokeWidth="2"/>
              
              {/* Liquid fill */}
              <motion.path
                d={liquidAnimation}
                fill="url(#liquidLoaderGradient)"
                filter="url(#liquidLoaderBlur)"
              />
              
              {/* Bubbles */}
              {bubbles.map((bubble) => (
                <motion.circle
                  key={bubble.id}
                  cx={bubble.x}
                  cy={bubble.y}
                  r={bubble.size}
                  fill={color}
                  opacity={0.6}
                  animate={{
                    y: [bubble.y, bubble.y - 30, bubble.y],
                    scale: [1, 0.8, 1],
                    opacity: [0.6, 0.2, 0.6]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: bubble.delay
                  }}
                />
              ))}
            </svg>
          </div>
          
          {text && (
            <motion.p
              className="text-gray-600 dark:text-gray-400 font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {text}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface LiquidPageTransitionProps {
  isTransitioning: boolean;
  onComplete?: () => void;
  className?: string;
  color?: string;
  direction?: 'horizontal' | 'vertical' | 'radial';
}

export const LiquidPageTransition: React.FC<LiquidPageTransitionProps> = ({
  isTransitioning,
  onComplete,
  className = '',
  color = '#3B82F6',
  direction = 'horizontal'
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isTransitioning && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        onComplete?.();
        setTimeout(() => setIsAnimating(false), 500);
      }, 800);
    }
  }, [isTransitioning, isAnimating, onComplete]);

  const getTransitionPath = (progress: number) => {
    switch (direction) {
      case 'vertical':
        return `M0,${100 - progress} Q50,${100 - progress - 10} 100,${100 - progress} L100,100 L0,100 Z`;
      case 'radial':
        const radius = progress * 150;
        return `circle(${radius}% at 50% 50%)`;
      default: // horizontal
        const wave1 = Math.sin(progress * Math.PI) * 10;
        const wave2 = Math.cos(progress * Math.PI * 1.5) * 8;
        return `M0,0 L${progress},0 Q${progress + 10},${50 + wave1} ${progress},${100} L0,100 Z`;
    }
  };

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          className={`fixed inset-0 z-50 pointer-events-none ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <linearGradient id="pageTransitionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={color} stopOpacity="0.7" />
              </linearGradient>
            </defs>
            
            <motion.path
              d="M0,0 L0,0 L0,100 Z"
              fill="url(#pageTransitionGradient)"
              animate={{
                d: [
                  "M0,0 L0,0 L0,100 Z",
                  getTransitionPath(100),
                  "M0,0 L100,0 L100,100 L0,100 Z",
                  getTransitionPath(0),
                  "M100,0 L100,0 L100,100 Z"
                ]
              }}
              transition={{
                duration: 1.3,
                ease: [0.25, 0.46, 0.45, 0.94],
                times: [0, 0.3, 0.5, 0.7, 1]
              }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export {
  LiquidBlob as default,
  LiquidTransition,
  LiquidButton,
  LiquidLoader,
  LiquidPageTransition
};
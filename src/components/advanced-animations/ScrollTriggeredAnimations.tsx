import { motion, useScroll, useTransform, useSpring, useTime, MotionValue, useReducedMotion } from 'framer-motion';
import { useRef, ReactNode, useMemo, useCallback, useState, useEffect } from 'react';
import { throttle } from 'lodash-es';

interface ScrollMorphingShapeProps {
  className?: string;
  colors?: string[];
  shapeType?: 'blob' | 'geometric' | 'organic';
  intensity?: number;
}

export const ScrollMorphingShape: React.FC<ScrollMorphingShapeProps> = ({
  className = '',
  colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'],
  shapeType = 'blob',
  intensity = 1
}) => {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);
  const time = useTime();
  const [isVisible, setIsVisible] = useState(true);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Smooth scrolling with optimized spring physics
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: prefersReducedMotion ? 200 : 80, // Faster for reduced motion
    damping: prefersReducedMotion ? 35 : 25,
    restDelta: 1 // Increased for better performance
  });

  // Intersection observer for performance
  useEffect(() => {
    const observer = new IntersectionObserver(
      throttle((entries) => {
        setIsVisible(entries[0].isIntersecting);
      }, 200),
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);

  // Morphing path animation with performance optimization
  const pathTransform = useTransform(
    [smoothScrollProgress, time],
    ([scroll, t]) => {
      if (prefersReducedMotion || !isVisible) {
        return `M50,50 Q75,25 100,50 T150,50 L150,150 L50,150 Z`; // Static path
      }
      
      const timeOffset = t * 0.0008; // Reduced frequency
      const scrollOffset = scroll * Math.PI * 1.5; // Reduced multiplier

      if (shapeType === 'blob') {
        const points = [];
        for (let i = 0; i < 6; i++) { // Reduced points for better performance
          const angle = (i / 6) * Math.PI * 2;
          const baseRadius = 50;
          const variation = Math.sin(angle * 2.5 + scrollOffset + timeOffset) * intensity * 10; // Reduced variation
          const radius = baseRadius + variation;
          
          const x = 100 + Math.cos(angle) * radius;
          const y = 100 + Math.sin(angle) * radius;
          points.push(`${x},${y}`);
        }
        return `M${points.join(' L')} Z`;
      }

      if (shapeType === 'geometric') {
        const centerX = 100;
        const centerY = 100;
        const baseSize = 40;
        const sides = 6;
        const rotation = scroll * 360 + timeOffset * 50;
        const scale = 1 + Math.sin(scrollOffset) * intensity * 0.5;
        
        const points = [];
        for (let i = 0; i < sides; i++) {
          const angle = (i / sides) * Math.PI * 2 + (rotation * Math.PI / 180);
          const x = centerX + Math.cos(angle) * baseSize * scale;
          const y = centerY + Math.sin(angle) * baseSize * scale;
          points.push(`${x},${y}`);
        }
        return `M${points.join(' L')} Z`;
      }

      // Organic shape
      const baseRadius = 45;
      const points = [];
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const noise1 = Math.sin(angle * 2 + scrollOffset * 2 + timeOffset) * intensity * 8;
        const noise2 = Math.cos(angle * 3 + scrollOffset + timeOffset * 1.5) * intensity * 6;
        const radius = baseRadius + noise1 + noise2;
        
        const x = 100 + Math.cos(angle) * radius;
        const y = 100 + Math.sin(angle) * radius;
        points.push(`${x},${y}`);
      }
      return `M${points.join(' L')} Z`;
    }
  );

  // Color transitions
  const colorIndex = useTransform(smoothScrollProgress, [0, 1], [0, colors.length - 1]);
  const currentColor = useTransform(colorIndex, (index) => {
    const i = Math.floor(index);
    const progress = index - i;
    const color1 = colors[i] || colors[0];
    const color2 = colors[i + 1] || colors[colors.length - 1];
    
    // Simple color interpolation (hex to RGB and back)
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    
    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);
    
    return `rgb(${r}, ${g}, ${b})`;
  });

  // 3D transformations
  const rotateX = useTransform(smoothScrollProgress, [0, 1], [0, 360]);
  const rotateY = useTransform(smoothScrollProgress, [0, 1], [0, 180]);
  const scale = useTransform(smoothScrollProgress, [0, 0.5, 1], [0.5, 1.2, 0.8]);

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: 'preserve-3d'
      }}
    >
      <svg width="200" height="200" viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <linearGradient id="morphGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={currentColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={currentColor} stopOpacity="0.3" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <motion.path
          d={pathTransform}
          fill="url(#morphGradient)"
          filter="url(#glow)"
          stroke={currentColor}
          strokeWidth="2"
          strokeOpacity="0.6"
        />
      </svg>
    </motion.div>
  );
};

interface Scroll3DElementProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  direction?: 'x' | 'y' | 'z' | 'all';
}

export const Scroll3DElement: React.FC<Scroll3DElementProps> = ({
  children,
  className = '',
  intensity = 1,
  direction = 'all'
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const transforms = useMemo(() => {
    const baseRange = 50 * intensity;
    const rotationRange = 45 * intensity;
    
    switch (direction) {
      case 'x':
        return {
          rotateX: useTransform(scrollYProgress, [0, 1], [-rotationRange, rotationRange]),
          x: useTransform(scrollYProgress, [0, 1], [-baseRange, baseRange])
        };
      case 'y':
        return {
          rotateY: useTransform(scrollYProgress, [0, 1], [-rotationRange, rotationRange]),
          y: useTransform(scrollYProgress, [0, 1], [-baseRange, baseRange])
        };
      case 'z':
        return {
          scale: useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.8]),
          z: useTransform(scrollYProgress, [0, 1], [-baseRange, baseRange])
        };
      default:
        return {
          rotateX: useTransform(scrollYProgress, [0, 1], [-rotationRange/2, rotationRange/2]),
          rotateY: useTransform(scrollYProgress, [0, 1], [-rotationRange/3, rotationRange/3]),
          scale: useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.1, 0.9]),
          z: useTransform(scrollYProgress, [0, 1], [-baseRange/2, baseRange/2])
        };
    }
  }, [scrollYProgress, intensity, direction]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        ...transforms,
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {children}
    </motion.div>
  );
};

interface ScrollColorTransitionProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  property?: 'background' | 'color' | 'border';
}

export const ScrollColorTransition: React.FC<ScrollColorTransitionProps> = ({
  children,
  className = '',
  colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'],
  property = 'background'
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const colorTransition = useTransform(
    scrollYProgress,
    colors.map((_, index) => index / (colors.length - 1)),
    colors
  );

  const style = useMemo(() => {
    switch (property) {
      case 'color':
        return { color: colorTransition };
      case 'border':
        return { borderColor: colorTransition };
      default:
        return { backgroundColor: colorTransition };
    }
  }, [colorTransition, property]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

interface ScrollRevealMaskProps {
  children: ReactNode;
  className?: string;
  maskType?: 'slide' | 'circle' | 'wave' | 'diagonal';
  direction?: 'left' | 'right' | 'up' | 'down';
}

export const ScrollRevealMask: React.FC<ScrollRevealMaskProps> = ({
  children,
  className = '',
  maskType = 'slide',
  direction = 'right'
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const maskPosition = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const clipPath = useTransform(maskPosition, (progress) => {
    switch (maskType) {
      case 'circle':
        const radius = progress * 150;
        return `circle(${radius}% at 50% 50%)`;
      
      case 'wave':
        return `polygon(0% 0%, ${progress}% 0%, ${progress * 0.9}% 50%, ${progress}% 100%, 0% 100%)`;
      
      case 'diagonal':
        return `polygon(0% 0%, ${progress}% 0%, ${Math.max(0, progress - 20)}% 100%, 0% 100%)`;
      
      default: // slide
        switch (direction) {
          case 'left':
            return `polygon(${100 - progress}% 0%, 100% 0%, 100% 100%, ${100 - progress}% 100%)`;
          case 'up':
            return `polygon(0% ${100 - progress}%, 100% ${100 - progress}%, 100% 100%, 0% 100%)`;
          case 'down':
            return `polygon(0% 0%, 100% 0%, 100% ${progress}%, 0% ${progress}%)`;
          default: // right
            return `polygon(0% 0%, ${progress}% 0%, ${progress}% 100%, 0% 100%)`;
        }
    }
  });

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
    >
      <motion.div
        style={{ clipPath }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

interface ParallaxLayersProps {
  layers: Array<{
    content: ReactNode;
    speed: number;
    className?: string;
    scale?: [number, number];
    opacity?: [number, number];
  }>;
  className?: string;
}

export const ParallaxLayers: React.FC<ParallaxLayersProps> = ({
  layers,
  className = ''
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  return (
    <div ref={ref} className={`relative ${className}`}>
      {layers.map((layer, index) => {
        const y = useTransform(scrollYProgress, [0, 1], [0, layer.speed * 100]);
        const scale = layer.scale 
          ? useTransform(scrollYProgress, [0, 1], layer.scale)
          : undefined;
        const opacity = layer.opacity
          ? useTransform(scrollYProgress, [0, 1], layer.opacity)
          : undefined;

        return (
          <motion.div
            key={index}
            className={`absolute inset-0 ${layer.className || ''}`}
            style={{
              y,
              scale,
              opacity,
              willChange: 'transform'
            }}
          >
            {layer.content}
          </motion.div>
        );
      })}
    </div>
  );
};

interface ScrollProgressIndicatorProps {
  className?: string;
  color?: string;
  thickness?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const ScrollProgressIndicator: React.FC<ScrollProgressIndicatorProps> = ({
  className = '',
  color = '#3B82F6',
  thickness = 4,
  position = 'top'
}) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const positionStyles = {
    top: 'top-0 left-0 right-0 h-1 origin-left',
    bottom: 'bottom-0 left-0 right-0 h-1 origin-left',
    left: 'top-0 bottom-0 left-0 w-1 origin-top',
    right: 'top-0 bottom-0 right-0 w-1 origin-top'
  };

  const scaleDirection = position === 'left' || position === 'right' ? 'scaleY' : 'scaleX';

  return (
    <motion.div
      className={`fixed z-50 ${positionStyles[position]} ${className}`}
      style={{
        backgroundColor: color,
        height: position === 'left' || position === 'right' ? '100%' : thickness,
        width: position === 'top' || position === 'bottom' ? '100%' : thickness,
        [scaleDirection]: position === 'left' || position === 'right' ? scrollYProgress : scaleX
      }}
    />
  );
};

export {
  ScrollMorphingShape as default,
  Scroll3DElement,
  ScrollColorTransition,
  ScrollRevealMask,
  ParallaxLayers,
  ScrollProgressIndicator
};
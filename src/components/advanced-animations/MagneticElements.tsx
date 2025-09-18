import { motion, useMotionValue, useSpring, useTransform, MotionValue, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, ReactNode, useCallback, useState } from 'react';
import { throttle } from 'lodash-es';

interface MagneticElementProps {
  children: ReactNode;
  className?: string;
  magneticStrength?: number;
  magneticRadius?: number;
  stiffness?: number;
  damping?: number;
  disabled?: boolean;
  scaleFactor?: number;
  rotationFactor?: number;
  glowEffect?: boolean;
  borderRadius?: string;
}

export const MagneticElement: React.FC<MagneticElementProps> = ({
  children,
  className = '',
  magneticStrength = 0.3,
  magneticRadius = 150,
  stiffness = 120, // Reduced for smoother motion
  damping = 20, // Increased for stability
  disabled = false,
  scaleFactor = 1.05,
  rotationFactor = 0.1,
  glowEffect = true,
  borderRadius = '1rem'
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isActive, setIsActive] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scale = useMotionValue(1);
  
  const springConfig = { 
    stiffness: prefersReducedMotion ? 200 : stiffness, 
    damping: prefersReducedMotion ? 30 : damping, 
    restDelta: 0.5 // Increased for better performance
  };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);
  const springScale = useSpring(scale, springConfig);

  // Glow effect based on proximity
  const glowOpacity = useTransform([springX, springY], ([x, y]) => {
    const distance = Math.sqrt(x * x + y * y);
    return glowEffect ? Math.max(0, 1 - distance / magneticRadius) * 0.5 : 0;
  });

  const glowSize = useTransform([springX, springY], ([x, y]) => {
    const distance = Math.sqrt(x * x + y * y);
    return Math.max(0, (magneticRadius - distance) / magneticRadius) * 50;
  });

  // Throttled mouse move handler for performance
  const handleMouseMove = useCallback(
    throttle((e: MouseEvent) => {
      if (disabled || prefersReducedMotion || !isActive || !ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distanceSq = dx * dx + dy * dy; // Skip sqrt for performance
      const radiusSq = magneticRadius * magneticRadius;
      
      if (distanceSq < radiusSq) {
        const distance = Math.sqrt(distanceSq);
        const strength = (magneticRadius - distance) / magneticRadius;
        const deltaX = dx * magneticStrength * strength * 0.8; // Reduced multiplier
        const deltaY = dy * magneticStrength * strength * 0.8;
        
        x.set(deltaX);
        y.set(deltaY);
        
        // Reduced 3D rotation for smoother performance
        rotateX.set((deltaY / magneticRadius) * rotationFactor * -15);
        rotateY.set((deltaX / magneticRadius) * rotationFactor * 15);
        
        // Scale effect
        scale.set(1 + strength * (scaleFactor - 1) * 0.7);
      } else {
        // Return to original position when mouse is far away
        x.set(0);
        y.set(0);
        rotateX.set(0);
        rotateY.set(0);
        scale.set(1);
      }
    }, 16), // ~60fps
    [disabled, prefersReducedMotion, isActive, magneticStrength, magneticRadius, scaleFactor, rotationFactor]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  }, [x, y, rotateX, rotateY, scale]);

  // Intersection observer for performance
  useEffect(() => {
    const observer = new IntersectionObserver(
      throttle((entries) => {
        setIsActive(entries[0].isIntersecting);
      }, 200),
      { threshold: 0.1 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (disabled || prefersReducedMotion) return;

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    if (ref.current) {
      ref.current.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (ref.current) {
        ref.current.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [handleMouseMove, handleMouseLeave, disabled, prefersReducedMotion]);

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{
        x: springX,
        y: springY,
        rotateX: springRotateX,
        rotateY: springRotateY,
        scale: springScale,
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {glowEffect && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius,
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
            opacity: glowOpacity,
            filter: useTransform(glowSize, (size) => `blur(${size}px)`),
            scale: useTransform(glowSize, (size) => 1 + size * 0.01)
          }}
        />
      )}
      {children}
    </motion.div>
  );
};

interface MagneticFieldProps {
  children: ReactNode;
  className?: string;
  fieldStrength?: number;
  particleCount?: number;
  showField?: boolean;
}

export const MagneticField: React.FC<MagneticFieldProps> = ({
  children,
  className = '',
  fieldStrength = 0.5,
  particleCount = 12, // Reduced for better performance
  showField = true
}) => {
  const prefersReducedMotion = useReducedMotion();
  const fieldRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback(
    throttle((e: MouseEvent) => {
      if (!fieldRef.current || prefersReducedMotion) return;
      
      const rect = fieldRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    }, 32), // Reduced frequency for field particles
    [mouseX, mouseY, prefersReducedMotion]
  );

  useEffect(() => {
    if (fieldRef.current) {
      fieldRef.current.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      if (fieldRef.current) {
        fieldRef.current.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [handleMouseMove]);

  // Create magnetic field particles
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 2
  }));

  if (prefersReducedMotion) {
    return (
      <div ref={fieldRef} className={`relative ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div ref={fieldRef} className={`relative ${className}`}>
      {showField && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle) => (
            <MagneticFieldParticle
              key={particle.id}
              mouseX={mouseX}
              mouseY={mouseY}
              initialX={particle.initialX}
              initialY={particle.initialY}
              size={particle.size}
              strength={fieldStrength * 0.7} // Reduced strength
              delay={particle.delay}
            />
          ))}
        </div>
      )}
      {children}
    </div>
  );
};

interface MagneticFieldParticleProps {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  initialX: number;
  initialY: number;
  size: number;
  strength: number;
  delay: number;
}

const MagneticFieldParticle: React.FC<MagneticFieldParticleProps> = ({
  mouseX,
  mouseY,
  initialX,
  initialY,
  size,
  strength,
  delay
}) => {
  const x = useTransform([mouseX], ([mx]) => {
    const dx = mx - (initialX * window.innerWidth / 100);
    return initialX + (dx * strength * 0.1);
  });

  const y = useTransform([mouseY], ([my]) => {
    const dy = my - (initialY * window.innerHeight / 100);
    return initialY + (dy * strength * 0.1);
  });

  const opacity = useTransform([mouseX, mouseY], ([mx, my]) => {
    const distance = Math.sqrt(
      Math.pow(mx - (initialX * window.innerWidth / 100), 2) + 
      Math.pow(my - (initialY * window.innerHeight / 100), 2)
    );
    return Math.max(0.1, 1 - distance / 300) * 0.6;
  });

  return (
    <motion.div
      className="absolute rounded-full bg-blue-400"
      style={{
        left: `${initialX}%`,
        top: `${initialY}%`,
        width: size,
        height: size,
        x,
        y,
        opacity,
        filter: 'blur(1px)'
      }}
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 360]
      }}
      transition={{
        scale: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay
        },
        rotate: {
          duration: 10,
          repeat: Infinity,
          ease: "linear",
          delay
        }
      }}
    />
  );
};

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  magneticStrength?: number;
  disabled?: boolean;
  onClick?: () => void;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  magneticStrength = 0.4,
  disabled = false,
  onClick
}) => {
  const baseStyles = "relative inline-flex items-center justify-center font-semibold transition-all duration-300 overflow-hidden";
  
  const variantStyles = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300",
    ghost: "bg-transparent text-blue-600 hover:bg-blue-50"
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-xl",
    lg: "px-8 py-4 text-lg rounded-2xl"
  };

  return (
    <MagneticElement
      magneticStrength={magneticStrength}
      magneticRadius={120}
      disabled={disabled}
      scaleFactor={1.05}
      glowEffect={variant === 'primary'}
    >
      <motion.button
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled}
        onClick={onClick}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        {variant === 'primary' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 hover:opacity-100 transition-opacity duration-300"
            style={{ borderRadius: 'inherit' }}
          />
        )}
        
        <span className="relative z-10 flex items-center space-x-2">
          {children}
        </span>

        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 bg-white opacity-0"
          style={{ borderRadius: 'inherit' }}
          whileTap={{
            opacity: [0, 0.3, 0],
            scale: [0.8, 1, 1],
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>
    </MagneticElement>
  );
};

export { MagneticElement as default };
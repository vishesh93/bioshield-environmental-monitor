import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Ripple {
  id: string;
  x: number;
  y: number;
  size: 'small' | 'medium' | 'large';
  color: string;
}

interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  rippleColor?: string;
  maxRipples?: number;
}

const RippleEffect: React.FC<RippleEffectProps> = ({
  children,
  className = '',
  disabled = false,
  rippleColor = 'rgba(59, 130, 246, 0.6)',
  maxRipples = 5
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const rippleIdRef = useRef(0);

  const createRipple = useCallback((
    event: React.MouseEvent,
    size: 'small' | 'medium' | 'large' = 'medium'
  ) => {
    if (disabled || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple: Ripple = {
      id: `ripple-${rippleIdRef.current++}`,
      x,
      y,
      size,
      color: rippleColor
    };

    setRipples(prev => {
      const updated = [...prev, newRipple];
      return updated.slice(-maxRipples); // Keep only the last maxRipples
    });

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1500);
  }, [disabled, rippleColor, maxRipples]);

  const handleClick = (event: React.MouseEvent) => {
    createRipple(event, 'large');
  };

  const handleMouseEnter = (event: React.MouseEvent) => {
    createRipple(event, 'medium');
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    // Create small ripples on mouse move (throttled)
    if (Math.random() > 0.95) { // Only 5% chance to create ripple on move
      createRipple(event, 'small');
    }
  };

  const sizeConfig = {
    small: { maxSize: 100, duration: 1 },
    medium: { maxSize: 200, duration: 1.2 },
    large: { maxSize: 400, duration: 1.5 }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
    >
      {children}
      
      {/* Ripple Container */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {ripples.map((ripple) => {
            const config = sizeConfig[ripple.size];
            
            return (
              <React.Fragment key={ripple.id}>
                {/* Main Ripple */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    left: ripple.x,
                    top: ripple.y,
                    backgroundColor: ripple.color,
                    transform: 'translate(-50%, -50%)'
                  }}
                  initial={{
                    width: 0,
                    height: 0,
                    opacity: 0.8
                  }}
                  animate={{
                    width: config.maxSize,
                    height: config.maxSize,
                    opacity: 0
                  }}
                  exit={{
                    opacity: 0
                  }}
                  transition={{
                    duration: config.duration,
                    ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for water-like effect
                  }}
                />

                {/* Secondary Ripple Wave */}
                <motion.div
                  className="absolute rounded-full border-2"
                  style={{
                    left: ripple.x,
                    top: ripple.y,
                    borderColor: ripple.color,
                    transform: 'translate(-50%, -50%)'
                  }}
                  initial={{
                    width: 0,
                    height: 0,
                    opacity: 0.6
                  }}
                  animate={{
                    width: config.maxSize * 0.8,
                    height: config.maxSize * 0.8,
                    opacity: 0
                  }}
                  transition={{
                    duration: config.duration * 0.8,
                    ease: "easeOut",
                    delay: 0.1
                  }}
                />

                {/* Inner Ripple */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    left: ripple.x,
                    top: ripple.y,
                    backgroundColor: ripple.color,
                    transform: 'translate(-50%, -50%)'
                  }}
                  initial={{
                    width: 0,
                    height: 0,
                    opacity: 0.4
                  }}
                  animate={{
                    width: config.maxSize * 0.6,
                    height: config.maxSize * 0.6,
                    opacity: 0
                  }}
                  transition={{
                    duration: config.duration * 0.6,
                    ease: "easeOut",
                    delay: 0.2
                  }}
                />

                {/* Particle Splash Effect */}
                {ripple.size === 'large' && (
                  <div
                    style={{
                      position: 'absolute',
                      left: ripple.x,
                      top: ripple.y,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {Array.from({ length: 8 }).map((_, i) => {
                      const angle = (i * 360) / 8;
                      const distance = 30 + Math.random() * 20;
                      const radian = (angle * Math.PI) / 180;
                      const endX = Math.cos(radian) * distance;
                      const endY = Math.sin(radian) * distance;

                      return (
                        <motion.div
                          key={`particle-${ripple.id}-${i}`}
                          className="absolute w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: ripple.color,
                            left: 0,
                            top: 0
                          }}
                          initial={{
                            x: 0,
                            y: 0,
                            opacity: 0.8,
                            scale: 1
                          }}
                          animate={{
                            x: endX,
                            y: endY,
                            opacity: 0,
                            scale: 0.3
                          }}
                          transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: 0.1 + (i * 0.02)
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Hook for programmatic ripple creation
export const useRipple = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleIdRef = useRef(0);

  const createRipple = useCallback((
    x: number,
    y: number,
    size: 'small' | 'medium' | 'large' = 'medium',
    color: string = 'rgba(59, 130, 246, 0.6)'
  ) => {
    const newRipple: Ripple = {
      id: `ripple-${rippleIdRef.current++}`,
      x,
      y,
      size,
      color
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1500);

    return newRipple.id;
  }, []);

  const clearRipples = useCallback(() => {
    setRipples([]);
  }, []);

  return {
    ripples,
    createRipple,
    clearRipples
  };
};

export default RippleEffect;
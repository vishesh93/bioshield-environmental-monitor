import { motion, useMotionValue, useSpring, useTransform, useTime, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { throttle, debounce } from 'lodash-es';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  mass: number;
  alpha: number;
  connected: boolean;
}

interface InteractiveParticlesProps {
  particleCount?: number;
  className?: string;
  colors?: string[];
  connectionDistance?: number;
  attractionStrength?: number;
  showConnections?: boolean;
  enablePhysics?: boolean;
}

export const InteractiveParticles: React.FC<InteractiveParticlesProps> = ({
  particleCount = 30, // Reduced from 50 for better performance
  className = '',
  colors = ['#3B82F6', '#10B981', '#8B5CF6', '#06B6D4', '#F59E0B'],
  connectionDistance = 120, // Reduced from 150
  attractionStrength = 0.0001,
  showConnections = true,
  enablePhysics = true
}) => {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [connections, setConnections] = useState<Array<{ from: Particle; to: Particle; distance: number }>>([]);
  const [isActive, setIsActive] = useState(true);
  const animationFrameRef = useRef<number>();
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const time = useTime();

  // Smooth mouse following with optimized spring config
  const smoothMouseX = useSpring(mouseX, { stiffness: 15, damping: 20, restDelta: 0.5 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 15, damping: 20, restDelta: 0.5 });

  // Throttled dimension updates for performance
  const updateDimensions = useCallback(
    throttle(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ 
          width: Math.min(rect.width, 1920), 
          height: Math.min(rect.height, 1080) 
        });
      }
    }, 100),
    []
  );

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions, { passive: true });
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  // Optimized mouse tracking with throttling
  const handleMouseMove = useCallback(
    throttle((e: MouseEvent) => {
      if (containerRef.current && isActive) {
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }
    }, 16), // ~60fps
    [mouseX, mouseY, isActive]
  );

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Initialize particles
  useEffect(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        mass: Math.random() * 3 + 1,
        alpha: Math.random() * 0.6 + 0.3,
        connected: false
      });
    }
    setParticles(newParticles);
  }, [particleCount, dimensions, colors]);

  // Optimized physics and connection calculation
  useEffect(() => {
    if (!enablePhysics || particles.length === 0 || prefersReducedMotion || !isActive) return;

    const animate = () => {
      const mouseXVal = smoothMouseX.get();
      const mouseYVal = smoothMouseY.get();
      
      const updatedParticles = particles.map(particle => {
        let { x, y, vx, vy } = particle;

        // Mouse attraction with distance check optimization
        const dx = mouseXVal - x;
        const dy = mouseYVal - y;
        const distanceSq = dx * dx + dy * dy; // Skip sqrt for performance
        
        if (distanceSq < 40000) { // 200^2
          const distance = Math.sqrt(distanceSq);
          const force = attractionStrength * particle.mass / (distance || 1);
          vx += dx * force;
          vy += dy * force;
        }

        // Optimized particle-to-particle interaction (only with nearby particles)
        const nearbyParticles = particles.filter(other => {
          if (other.id === particle.id) return false;
          const dx2 = other.x - x;
          const dy2 = other.y - y;
          return (dx2 * dx2 + dy2 * dy2) < 10000; // 100^2
        });
        
        nearbyParticles.forEach(otherParticle => {
          const dx2 = otherParticle.x - x;
          const dy2 = otherParticle.y - y;
          const distSq = dx2 * dx2 + dy2 * dy2;
          const dist = Math.sqrt(distSq);
          
          if (dist > 0) {
            const force2 = attractionStrength * 0.3 / (distSq || 1); // Reduced force
            vx += dx2 * force2;
            vy += dy2 * force2;
          }
        });

        // Apply velocity with friction
        x += vx;
        y += vy;
        vx *= 0.99; // friction
        vy *= 0.99; // friction

        // Boundary collision with bounce
        if (x <= 0 || x >= dimensions.width) {
          vx *= -0.8;
          x = Math.max(0, Math.min(dimensions.width, x));
        }
        if (y <= 0 || y >= dimensions.height) {
          vy *= -0.8;
          y = Math.max(0, Math.min(dimensions.height, y));
        }

        return { ...particle, x, y, vx, vy };
      });

      // Calculate connections
      if (showConnections) {
        const newConnections: Array<{ from: Particle; to: Particle; distance: number }> = [];
        for (let i = 0; i < updatedParticles.length; i++) {
          for (let j = i + 1; j < updatedParticles.length; j++) {
            const p1 = updatedParticles[i];
            const p2 = updatedParticles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < connectionDistance) {
              newConnections.push({ from: p1, to: p2, distance });
            }
          }
        }
        setConnections(newConnections);
      }

      setParticles(updatedParticles);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particles, smoothMouseX, smoothMouseY, dimensions, enablePhysics, showConnections, connectionDistance, attractionStrength, prefersReducedMotion, isActive]);

  // Mouse influence area visualization
  const mouseInfluenceRadius = useTransform(
    [smoothMouseX, smoothMouseY],
    ([x, y]) => `radial-gradient(circle at ${x}px ${y}px, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 30%, transparent 70%)`
  );

  // Pause animations when component is not visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      throttle((entries) => {
        setIsActive(entries[0].isIntersecting);
      }, 200),
      { threshold: 0.1 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  if (prefersReducedMotion) {
    return (
      <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
        {/* Static particles for reduced motion */}
        {particles.slice(0, 10).map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              left: particle.x - particle.size / 2,
              top: particle.y - particle.size / 2,
              opacity: particle.alpha * 0.5,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Mouse influence visualization */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: mouseInfluenceRadius,
          mixBlendMode: 'overlay'
        }}
      />

      {/* Particle connections */}
      {showConnections && (
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
          {connections.map(({ from, to, distance }, index) => {
            const opacity = Math.max(0, 1 - distance / connectionDistance) * 0.3;
            const strokeWidth = Math.max(0.5, 2 - distance / connectionDistance * 2);
            
            return (
              <motion.line
                key={`connection-${from.id}-${to.id}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={from.color}
                strokeWidth={strokeWidth}
                strokeOpacity={opacity}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3 }}
              />
            );
          })}
        </svg>
      )}

      {/* Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            left: particle.x - particle.size / 2,
            top: particle.y - particle.size / 2,
            opacity: particle.alpha,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}40`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [particle.alpha, particle.alpha * 1.3, particle.alpha],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2
          }}
        />
      ))}

      {/* Cursor particle */}
      <motion.div
        className="absolute pointer-events-none rounded-full border-2 border-blue-400/50"
        style={{
          width: 20,
          height: 20,
          left: smoothMouseX,
          top: smoothMouseY,
          x: -10,
          y: -10,
        }}
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 360]
        }}
        transition={{
          scale: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          },
          rotate: {
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }
        }}
      >
        <motion.div
          className="w-2 h-2 bg-blue-400 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </div>
  );
};

export default InteractiveParticles;
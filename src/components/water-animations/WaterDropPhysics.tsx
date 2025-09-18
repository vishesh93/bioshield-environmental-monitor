import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface WaterDrop {
  id: string;
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  size: number;
  color: string;
  opacity: number;
  mass: number;
  bounces: number;
  merged: boolean;
}

interface WaterDropPhysicsProps {
  containerWidth?: number;
  containerHeight?: number;
  gravity?: number;
  damping?: number;
  dropCount?: number;
  autoGenerate?: boolean;
  generateInterval?: number;
  className?: string;
  colors?: string[];
}

const WaterDropPhysics: React.FC<WaterDropPhysicsProps> = ({
  containerWidth = 800,
  containerHeight = 400,
  gravity = 0.5,
  damping = 0.8,
  dropCount = 15,
  autoGenerate = true,
  generateInterval = 2000,
  className = '',
  colors = [
    'rgba(59, 130, 246, 0.8)',   // blue
    'rgba(34, 197, 94, 0.8)',    // green
    'rgba(16, 185, 129, 0.8)',   // emerald
    'rgba(6, 182, 212, 0.8)',    // cyan
    'rgba(8, 145, 178, 0.8)',    // light blue
  ]
}) => {
  const [drops, setDrops] = useState<WaterDrop[]>([]);
  const animationFrameRef = useRef<number>();
  const dropIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create a new water drop
  const createDrop = useCallback((x?: number, y?: number) => {
    const newDrop: WaterDrop = {
      id: `drop-${dropIdRef.current++}`,
      x: x ?? Math.random() * (containerWidth - 40) + 20,
      y: y ?? Math.random() * 100 + 10,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 2 + 1,
      size: Math.random() * 20 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0.7 + Math.random() * 0.3,
      mass: 1,
      bounces: 0,
      merged: false
    };
    return newDrop;
  }, [containerWidth, colors]);

  // Initialize drops
  useEffect(() => {
    const initialDrops = Array.from({ length: dropCount }, () => createDrop());
    setDrops(initialDrops);
  }, [dropCount, createDrop]);

  // Auto-generate new drops
  useEffect(() => {
    if (!autoGenerate) return;

    const interval = setInterval(() => {
      setDrops(prev => {
        if (prev.length < dropCount * 2) {
          return [...prev, createDrop()];
        }
        return prev;
      });
    }, generateInterval);

    return () => clearInterval(interval);
  }, [autoGenerate, generateInterval, createDrop, dropCount]);

  // Check if two drops should merge
  const shouldMerge = (drop1: WaterDrop, drop2: WaterDrop): boolean => {
    const dx = drop1.x - drop2.x;
    const dy = drop1.y - drop2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (drop1.size + drop2.size) * 0.3;
    return distance < minDistance;
  };

  // Merge two drops
  const mergeDrops = (drop1: WaterDrop, drop2: WaterDrop): WaterDrop => {
    const totalMass = drop1.mass + drop2.mass;
    const mergedDrop: WaterDrop = {
      id: `merged-${dropIdRef.current++}`,
      x: (drop1.x * drop1.mass + drop2.x * drop2.mass) / totalMass,
      y: (drop1.y * drop1.mass + drop2.y * drop2.mass) / totalMass,
      vx: (drop1.vx * drop1.mass + drop2.vx * drop2.mass) / totalMass,
      vy: (drop1.vy * drop1.mass + drop2.vy * drop2.mass) / totalMass,
      size: Math.sqrt(drop1.size * drop1.size + drop2.size * drop2.size),
      color: drop1.size > drop2.size ? drop1.color : drop2.color,
      opacity: Math.max(drop1.opacity, drop2.opacity),
      mass: totalMass,
      bounces: Math.min(drop1.bounces, drop2.bounces),
      merged: true
    };
    return mergedDrop;
  };

  // Physics animation loop
  useEffect(() => {
    const animate = () => {
      setDrops(prevDrops => {
        let newDrops = [...prevDrops];
        
        // Update physics for each drop
        newDrops = newDrops.map(drop => {
          if (drop.merged && drop.bounces === 0) {
            // Give merged drops a little bounce effect
            return {
              ...drop,
              vy: drop.vy - 2,
              bounces: 1
            };
          }

          let newX = drop.x + drop.vx;
          let newY = drop.y + drop.vy;
          let newVx = drop.vx;
          let newVy = drop.vy + gravity;
          let newBounces = drop.bounces;

          // Boundary collisions
          if (newX <= drop.size / 2 || newX >= containerWidth - drop.size / 2) {
            newVx = -newVx * damping;
            newX = newX <= drop.size / 2 ? drop.size / 2 : containerWidth - drop.size / 2;
            newBounces++;
          }

          if (newY >= containerHeight - drop.size / 2) {
            newVy = -Math.abs(newVy) * damping;
            newY = containerHeight - drop.size / 2;
            newBounces++;
            
            // Add some randomness to prevent drops from settling
            if (Math.abs(newVy) < 0.5) {
              newVy = -Math.random() * 2 - 1;
              newVx += (Math.random() - 0.5) * 2;
            }
          }

          // Remove drops that have bounced too much and are slow
          if (newBounces > 8 && Math.abs(newVx) < 0.1 && Math.abs(newVy) < 0.1) {
            return null;
          }

          return {
            ...drop,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            bounces: newBounces
          };
        }).filter(Boolean) as WaterDrop[];

        // Handle merging
        const mergedDrops: WaterDrop[] = [];
        const toRemove = new Set<string>();

        for (let i = 0; i < newDrops.length; i++) {
          if (toRemove.has(newDrops[i].id)) continue;
          
          let currentDrop = newDrops[i];
          let merged = false;

          for (let j = i + 1; j < newDrops.length; j++) {
            if (toRemove.has(newDrops[j].id)) continue;
            
            if (shouldMerge(currentDrop, newDrops[j])) {
              currentDrop = mergeDrops(currentDrop, newDrops[j]);
              toRemove.add(newDrops[i].id);
              toRemove.add(newDrops[j].id);
              merged = true;
              break;
            }
          }

          if (merged) {
            mergedDrops.push(currentDrop);
          }
        }

        // Combine unmerged drops with merged drops
        const finalDrops = [
          ...newDrops.filter(drop => !toRemove.has(drop.id)),
          ...mergedDrops
        ];

        return finalDrops;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gravity, damping, containerWidth, containerHeight]);

  // Handle click to create new drop
  const handleClick = (event: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newDrop = createDrop(x, y);
    setDrops(prev => [...prev, newDrop]);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-pointer ${className}`}
      style={{
        width: containerWidth,
        height: containerHeight,
        background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.1), rgba(34, 197, 94, 0.05))'
      }}
      onClick={handleClick}
    >
      {/* Water drops */}
      {drops.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: drop.x - drop.size / 2,
            top: drop.y - drop.size / 2,
            width: drop.size,
            height: drop.size,
            backgroundColor: drop.color,
            opacity: drop.opacity,
            boxShadow: `
              0 0 ${drop.size * 0.5}px ${drop.color},
              inset 0 ${drop.size * 0.1}px ${drop.size * 0.2}px rgba(255, 255, 255, 0.3),
              inset 0 -${drop.size * 0.05}px ${drop.size * 0.1}px rgba(0, 0, 0, 0.2)
            `,
            filter: 'blur(0.5px)'
          }}
          animate={drop.merged ? {
            scale: [1, 1.3, 1],
            opacity: [drop.opacity, drop.opacity * 1.2, drop.opacity]
          } : {}}
          transition={drop.merged ? {
            duration: 0.5,
            ease: "easeOut"
          } : {}}
        />
      ))}

      {/* Surface reflection effect */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '30%',
          background: 'linear-gradient(to top, rgba(255, 255, 255, 0.1), transparent)',
          backdropFilter: 'blur(1px)'
        }}
      />

      {/* Click instruction */}
      <div className="absolute top-2 left-2 text-xs text-gray-500 pointer-events-none">
        Click to create water drops
      </div>

      {/* Physics info */}
      <div className="absolute top-2 right-2 text-xs text-gray-500 pointer-events-none">
        Drops: {drops.length}
      </div>
    </div>
  );
};

export default WaterDropPhysics;
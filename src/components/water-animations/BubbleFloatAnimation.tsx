import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Bubble {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
  wobble: number;
  delay: number;
}

interface BubbleFloatAnimationProps {
  bubbleCount?: number;
  containerHeight?: number;
  containerWidth?: number;
  autoGenerate?: boolean;
  generateInterval?: number;
  className?: string;
  colors?: string[];
  direction?: 'up' | 'down' | 'left' | 'right';
  interactive?: boolean;
}

const BubbleFloatAnimation: React.FC<BubbleFloatAnimationProps> = ({
  bubbleCount = 20,
  containerHeight = 600,
  containerWidth = 800,
  autoGenerate = true,
  generateInterval = 1000,
  className = '',
  colors = [
    'rgba(59, 130, 246, 0.6)',   // blue
    'rgba(34, 197, 94, 0.6)',    // green
    'rgba(16, 185, 129, 0.6)',   // emerald
    'rgba(6, 182, 212, 0.6)',    // cyan
    'rgba(147, 197, 253, 0.6)',  // light blue
    'rgba(255, 255, 255, 0.4)',  // white
  ],
  direction = 'up',
  interactive = true
}) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const bubbleIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create a new bubble
  const createBubble = (x?: number, y?: number): Bubble => {
    const size = Math.random() * 30 + 8;
    const startPositions = {
      up: { x: x ?? Math.random() * containerWidth, y: y ?? containerHeight + 50 },
      down: { x: x ?? Math.random() * containerWidth, y: y ?? -50 },
      left: { x: x ?? containerWidth + 50, y: y ?? Math.random() * containerHeight },
      right: { x: x ?? -50, y: y ?? Math.random() * containerHeight }
    };

    return {
      id: `bubble-${bubbleIdRef.current++}`,
      ...startPositions[direction],
      size,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      wobble: Math.random() * 2 + 1,
      delay: Math.random() * 2
    };
  };

  // Initialize bubbles
  useEffect(() => {
    const initialBubbles = Array.from({ length: bubbleCount }, () => createBubble());
    setBubbles(initialBubbles);
  }, [bubbleCount]);

  // Auto-generate bubbles
  useEffect(() => {
    if (!autoGenerate) return;

    const interval = setInterval(() => {
      setBubbles(prev => {
        // Remove bubbles that are out of bounds
        const inBounds = prev.filter(bubble => {
          switch (direction) {
            case 'up':
              return bubble.y > -100;
            case 'down':
              return bubble.y < containerHeight + 100;
            case 'left':
              return bubble.x > -100;
            case 'right':
              return bubble.x < containerWidth + 100;
            default:
              return true;
          }
        });

        // Add new bubble if needed
        if (inBounds.length < bubbleCount * 1.5) {
          return [...inBounds, createBubble()];
        }
        return inBounds;
      });
    }, generateInterval);

    return () => clearInterval(interval);
  }, [autoGenerate, generateInterval, bubbleCount, direction, containerWidth, containerHeight]);

  // Handle click to create bubble
  const handleClick = (event: React.MouseEvent) => {
    if (!interactive || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Create multiple bubbles on click
    const newBubbles = Array.from({ length: 3 }, () => {
      const bubble = createBubble(x + (Math.random() - 0.5) * 50, y + (Math.random() - 0.5) * 50);
      return {
        ...bubble,
        size: bubble.size * 1.5, // Larger bubbles for click effect
        opacity: bubble.opacity * 1.5
      };
    });
    
    setBubbles(prev => [...prev, ...newBubbles]);
  };

  // Get animation properties based on direction
  const getAnimationProps = (bubble: Bubble) => {
    const wobbleAmount = bubble.wobble * 20;
    const duration = (containerHeight / bubble.speed) * 0.01;

    switch (direction) {
      case 'up':
        return {
          y: [bubble.y, -bubble.size - 50],
          x: [
            bubble.x,
            bubble.x + Math.sin(0) * wobbleAmount,
            bubble.x + Math.sin(Math.PI) * wobbleAmount,
            bubble.x + Math.sin(2 * Math.PI) * wobbleAmount,
            bubble.x
          ],
          transition: {
            duration: duration * 2,
            ease: "linear",
            delay: bubble.delay,
            x: {
              duration: duration * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }
        };
      case 'down':
        return {
          y: [bubble.y, containerHeight + bubble.size + 50],
          x: [
            bubble.x,
            bubble.x + Math.sin(0) * wobbleAmount,
            bubble.x + Math.sin(Math.PI) * wobbleAmount,
            bubble.x
          ],
          transition: {
            duration: duration * 2,
            ease: "linear",
            delay: bubble.delay
          }
        };
      case 'left':
        return {
          x: [bubble.x, -bubble.size - 50],
          y: [
            bubble.y,
            bubble.y + Math.sin(0) * wobbleAmount,
            bubble.y + Math.sin(Math.PI) * wobbleAmount,
            bubble.y
          ],
          transition: {
            duration: duration * 2,
            ease: "linear",
            delay: bubble.delay
          }
        };
      case 'right':
        return {
          x: [bubble.x, containerWidth + bubble.size + 50],
          y: [
            bubble.y,
            bubble.y + Math.sin(0) * wobbleAmount,
            bubble.y + Math.sin(Math.PI) * wobbleAmount,
            bubble.y
          ],
          transition: {
            duration: duration * 2,
            ease: "linear",
            delay: bubble.delay
          }
        };
      default:
        return {};
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${interactive ? 'cursor-pointer' : ''} ${className}`}
      style={{
        width: containerWidth,
        height: containerHeight
      }}
      onClick={handleClick}
    >
      <AnimatePresence>
        {bubbles.map((bubble) => {
          const animationProps = getAnimationProps(bubble);
          
          return (
            <motion.div
              key={bubble.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: bubble.size,
                height: bubble.size,
                left: bubble.x - bubble.size / 2,
                top: bubble.y - bubble.size / 2,
              }}
              initial={{
                scale: 0,
                opacity: 0
              }}
              animate={{
                scale: 1,
                opacity: bubble.opacity,
                ...animationProps
              }}
              exit={{
                scale: 0,
                opacity: 0
              }}
              onAnimationComplete={() => {
                // Remove bubble when animation completes
                setBubbles(prev => prev.filter(b => b.id !== bubble.id));
              }}
            >
              {/* Main bubble body */}
              <div
                className="w-full h-full rounded-full relative"
                style={{
                  backgroundColor: bubble.color,
                  background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), ${bubble.color})`,
                  boxShadow: `
                    inset 0 0 ${bubble.size * 0.3}px rgba(255, 255, 255, 0.5),
                    0 0 ${bubble.size * 0.5}px ${bubble.color},
                    0 ${bubble.size * 0.1}px ${bubble.size * 0.3}px rgba(0, 0, 0, 0.1)
                  `,
                  filter: 'blur(0.5px)'
                }}
              >
                {/* Bubble highlight */}
                <motion.div
                  className="absolute rounded-full bg-white"
                  style={{
                    width: bubble.size * 0.3,
                    height: bubble.size * 0.3,
                    top: bubble.size * 0.15,
                    left: bubble.size * 0.2,
                    opacity: 0.6,
                    filter: 'blur(1px)'
                  }}
                  animate={{
                    opacity: [0.6, 0.9, 0.6],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Secondary highlight */}
                <div
                  className="absolute rounded-full bg-white"
                  style={{
                    width: bubble.size * 0.15,
                    height: bubble.size * 0.15,
                    top: bubble.size * 0.6,
                    right: bubble.size * 0.25,
                    opacity: 0.3
                  }}
                />
              </div>

              {/* Trailing particles for larger bubbles */}
              {bubble.size > 20 && (
                <motion.div
                  className="absolute"
                  style={{
                    width: bubble.size * 0.1,
                    height: bubble.size * 0.1,
                    backgroundColor: bubble.color,
                    borderRadius: '50%',
                    left: '50%',
                    top: '100%',
                    transform: 'translateX(-50%)',
                    opacity: 0.3
                  }}
                  animate={{
                    y: [0, bubble.size * 0.5, 0],
                    opacity: [0.3, 0.1, 0.3],
                    scale: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Interactive hint */}
      {interactive && (
        <div className="absolute bottom-2 left-2 text-xs text-gray-400 pointer-events-none opacity-70">
          Click to create bubbles
        </div>
      )}

      {/* Bubble count */}
      <div className="absolute top-2 right-2 text-xs text-gray-400 pointer-events-none opacity-70">
        Bubbles: {bubbles.length}
      </div>
    </div>
  );
};

export default BubbleFloatAnimation;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiquidWaveLoaderProps {
  isLoading: boolean;
  onComplete?: () => void;
  duration?: number;
  color?: string;
  showClickToEnter?: boolean;
}

const LiquidWaveLoader: React.FC<LiquidWaveLoaderProps> = ({
  isLoading,
  onComplete,
  duration = 1200,
  color = "from-blue-500 to-cyan-400",
  showClickToEnter = true
}) => {
  const [progress, setProgress] = useState(0);
  const [showWaves, setShowWaves] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setShowWaves(true);
      setLoadingComplete(false);
      setIsExiting(false);
      setAnimationTime(0);
      
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setLoadingComplete(true);
            return 100;
          }
          return prev + (100 / (duration / 50));
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isLoading, duration]);
  
  // Animation time updater for realistic wave physics
  useEffect(() => {
    if (showWaves) {
      const animationInterval = setInterval(() => {
        setAnimationTime(prev => prev + 0.016); // ~60fps
      }, 16);
      
      return () => clearInterval(animationInterval);
    }
  }, [showWaves]);

  // Handle scroll to enter
  const handleScrollToEnter = () => {
    if (loadingComplete) {
      setIsExiting(true);
      setTimeout(() => {
        setShowWaves(false);
        onComplete?.();
      }, 300); // Even faster transition to reveal content
    }
  };

  // Listen for scroll events
  useEffect(() => {
    let touchStartY = 0;
    
    const handleScroll = (e: WheelEvent) => {
      if (loadingComplete && e.deltaY > 0) { // Scroll down
        handleScrollToEnter();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (loadingComplete && e.touches[0]) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (loadingComplete && e.touches[0] && touchStartY) {
        const touchY = e.touches[0].clientY;
        const deltaY = touchY - touchStartY;
        
        // Swipe down detection (finger moves down from start position)
        if (deltaY > 50) {
          handleScrollToEnter();
        }
      }
    };

    if (showWaves && loadingComplete && showClickToEnter) {
      window.addEventListener('wheel', handleScroll, { passive: false });
      window.addEventListener('touchstart', handleTouchStart, { passive: false });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [loadingComplete, showWaves, showClickToEnter]);

  // Auto enter when loading completes and click/scroll prompt is disabled
  useEffect(() => {
    if (loadingComplete && !showClickToEnter && showWaves && !isExiting) {
      // Immediately reveal content to avoid any perceived blank time
      setIsExiting(true);
      setShowWaves(false);
      onComplete?.();
    }
  }, [loadingComplete, showClickToEnter, showWaves, isExiting, onComplete]);

  // Generate realistic horizontal ocean wave with depth
  const generateHorizontalWave = (yPosition = 50, amplitude = 15, speed = 1, frequency = 0.02, offset = 0) => {
    const points = [];
    const time = (animationTime * speed) + offset;
    
    for (let i = 0; i <= 100; i += 1) {
      // Create complex wave using multiple sine waves for realism
      let waveHeight = 0;
      
      // Primary wave
      waveHeight += amplitude * Math.sin((i * frequency) + time);
      
      // Secondary harmonic (half amplitude, double frequency)
      waveHeight += (amplitude * 0.5) * Math.sin((i * frequency * 2) + (time * 1.3));
      
      // Tertiary harmonic for complexity
      waveHeight += (amplitude * 0.25) * Math.sin((i * frequency * 4) + (time * 0.7));
      
      // Add natural irregularity
      waveHeight += amplitude * 0.1 * Math.sin((i * 0.1) + (time * 2.1));
      
      const finalY = yPosition + waveHeight;
      points.push(`${i}% ${Math.max(0, Math.min(100, finalY))}%`);
    }
    
    // Create wave that flows across screen
    return `polygon(${points.join(', ')}, 100% 100%, 0% 100%)`;
  };

  // Generate wave crest highlights
  const generateWaveCrest = (yPosition = 45, amplitude = 8, speed = 1.2, offset = 1) => {
    const points = [];
    const time = (animationTime * speed) + offset;
    
    for (let i = 0; i <= 100; i += 2) {
      let waveHeight = amplitude * Math.sin((i * 0.03) + time);
      waveHeight += (amplitude * 0.3) * Math.sin((i * 0.08) + (time * 1.5));
      
      const finalY = yPosition + waveHeight;
      points.push(`${i}% ${Math.max(0, Math.min(100, finalY))}%`);
    }
    
    return `polygon(${points.join(', ')}, 100% 100%, 0% 100%)`;
  };

  return (
    <AnimatePresence>
      {showWaves && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #020617 0%, #0f172a 30%, #1e293b 70%, #0f1629 100%)'
          }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: isExiting ? 0 : 1,
            y: isExiting ? "-100vh" : 0,
            scale: isExiting ? 0.98 : 1
          }}
          exit={{ 
            opacity: 0,
            y: "-100vh",
            scale: 0.95
          }}
          transition={{ 
            duration: isExiting ? 0.3 : 0.5,
            ease: isExiting ? [0.23, 1, 0.32, 1] : "easeOut"
          }}
        >
          {/* Professional Water Container */}
          <div className="relative w-full h-full overflow-hidden">
            {/* Realistic Water Surface Effect */}
            <div className="absolute inset-0">
              {/* Ocean depth gradient background */}
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, 
                    rgba(2, 6, 23, 0.98) 0%, 
                    rgba(8, 15, 35, 0.95) 20%, 
                    rgba(12, 25, 45, 0.9) 40%, 
                    rgba(15, 35, 60, 0.85) 60%, 
                    rgba(20, 45, 75, 0.8) 80%, 
                    rgba(25, 55, 90, 0.75) 100%
                  )`
                }}
              />
            </div>
            {/* Horizontal Ocean Waves with Depth */}
            <div className="absolute inset-0">
              {/* Deep Ocean Background - Darkest Layer */}
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, 
                    rgba(5, 15, 25, 0.95) 0%,
                    rgba(8, 25, 35, 0.98) 30%,
                    rgba(10, 30, 45, 1) 60%,
                    rgba(5, 20, 35, 1) 100%
                  )`
                }}
              />
              
              {/* Deep Water Wave Layer 1 - Bottom depth */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, 
                    transparent 0%,
                    rgba(15, 45, 65, 0.8) 40%,
                    rgba(20, 50, 75, 0.9) 70%,
                    rgba(12, 35, 55, 1) 100%
                  )`,
                  clipPath: generateHorizontalWave(65, 12, 0.8, 0.025, 0)
                }}
              />
              
              {/* Mid-depth Wave Layer 2 */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, 
                    transparent 0%,
                    rgba(25, 60, 85, 0.7) 30%,
                    rgba(30, 70, 95, 0.85) 60%,
                    rgba(20, 55, 80, 0.9) 100%
                  )`,
                  clipPath: generateHorizontalWave(55, 15, 1.1, 0.03, 2.5)
                }}
              />
              
              {/* Surface Wave Layer 3 - Main waves */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, 
                    transparent 0%,
                    rgba(35, 75, 105, 0.6) 20%,
                    rgba(40, 85, 120, 0.8) 50%,
                    rgba(25, 65, 95, 0.9) 100%
                  )`,
                  clipPath: generateHorizontalWave(45, 18, 1.4, 0.035, 5)
                }}
              />
              
              {/* Wave Crests and Foam */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, 
                    transparent 0%,
                    rgba(60, 120, 160, 0.4) 10%,
                    rgba(80, 140, 180, 0.6) 40%,
                    rgba(45, 105, 145, 0.7) 100%
                  )`,
                  clipPath: generateWaveCrest(38, 10, 1.8, 7.5)
                }}
              />
              
              {/* Surface Highlights and Reflections */}
              <div
                className="absolute inset-0 opacity-60"
                style={{
                  background: `linear-gradient(180deg, 
                    transparent 0%,
                    rgba(100, 160, 200, 0.3) 5%,
                    rgba(120, 180, 220, 0.4) 30%,
                    rgba(80, 140, 180, 0.5) 100%
                  )`,
                  clipPath: generateWaveCrest(32, 6, 2.2, 10)
                }}
              />
              
              {/* Subtle Foam Details */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background: `linear-gradient(180deg, 
                    transparent 0%,
                    rgba(140, 200, 240, 0.2) 0%,
                    rgba(160, 220, 255, 0.3) 25%,
                    transparent 50%
                  )`,
                  clipPath: generateWaveCrest(28, 4, 2.8, 12.5)
                }}
              />
              
              {/* Underwater Light Rays */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  background: `
                    radial-gradient(ellipse 200% 40% at 20% 30%, rgba(60, 130, 170, 0.3) 0%, transparent 70%),
                    radial-gradient(ellipse 150% 30% at 80% 40%, rgba(80, 150, 190, 0.2) 0%, transparent 60%),
                    radial-gradient(ellipse 120% 25% at 50% 50%, rgba(100, 170, 210, 0.15) 0%, transparent 50%)
                  `
                }}
              />
              
              {/* Subtle underwater floating elements */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-px h-px bg-blue-300/20 rounded-full"
                    style={{
                      left: `${15 + (i * 12)}%`,
                      top: `${30 + (i * 8)}%`
                    }}
                    animate={{
                      x: [-20, 20],
                      y: [-10, 10],
                      opacity: [0.1, 0.4, 0.1]
                    }}
                    transition={{
                      duration: 8 + i * 2,
                      repeat: Infinity,
                      delay: i * 1.5,
                      ease: "easeInOut"
                    }}
                  />
                ))}
                
                {/* Larger floating elements */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={`large-${i}`}
                    className="absolute w-0.5 h-0.5 bg-teal-400/15 rounded-full"
                    style={{
                      left: `${25 + (i * 25)}%`,
                      top: `${40 + (i * 10)}%`
                    }}
                    animate={{
                      x: [-30, 30],
                      y: [-15, 15],
                      opacity: [0.05, 0.25, 0.05],
                      scale: [0.5, 1.2, 0.5]
                    }}
                    transition={{
                      duration: 12 + i * 3,
                      repeat: Infinity,
                      delay: i * 2.5,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Loading Text or Click to Enter */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center">
                <motion.div
                  className="text-6xl font-bold text-white mb-4 tracking-wider"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{
                    textShadow: '0 0 30px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  WELCOME TO BIOSHIELD
                </motion.div>
                
                {/* Conditional content based on loading state */}
                {!loadingComplete ? (
                  <>
                    <motion.div
                      className="text-xl text-blue-200 mb-8 font-light"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Environmental Protection System Loading...
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div
                      className="text-xl text-emerald-300 mb-12 font-light"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1,
                        y: 0
                      }}
                      transition={{ 
                        duration: 0.8,
                        ease: "easeOut"
                      }}
                    >
                      System Ready
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Professional Continue Button */}
            {loadingComplete && showClickToEnter && (
              <motion.div
                className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-20 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0
                }}
                transition={{
                  duration: 1,
                  delay: 1,
                  ease: "easeOut"
                }}
              >
                <motion.div
                  className="text-sm text-slate-400 mb-4 font-light tracking-wide"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  SWIPE DOWN TO CONTINUE
                </motion.div>
                
                {/* Downward Arrow Animation */}
                <motion.div
                  className="flex flex-col items-center space-y-1"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.div
                    className="w-4 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent"
                    animate={{ 
                      scaleX: [0.5, 1, 0.5],
                      opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-slate-400"
                    animate={{ 
                      opacity: [0.4, 0.8, 0.4],
                      y: [0, 3, 0]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LiquidWaveLoader;
/**
 * Animation Performance Configuration
 * Centralized configuration for smooth animations across all components
 */

// Detect user preferences and device capabilities
export const getPerformanceSettings = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isLowEndDevice = navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 2;
  const isSlowConnection = navigator.connection?.effectiveType === 'slow-2g' || 
                          navigator.connection?.effectiveType === '2g';

  return {
    prefersReducedMotion,
    isLowEndDevice,
    isSlowConnection,
    shouldOptimize: prefersReducedMotion || isLowEndDevice || isSlowConnection
  };
};

// Optimized spring configurations
export const springConfigs = {
  // Ultra smooth for critical interactions
  ultraSmooth: {
    stiffness: 120,
    damping: 25,
    restDelta: 0.5,
    restSpeed: 0.5
  },
  
  // Smooth for general animations
  smooth: {
    stiffness: 100,
    damping: 20,
    restDelta: 1,
    restSpeed: 1
  },
  
  // Fast for micro-interactions
  fast: {
    stiffness: 200,
    damping: 30,
    restDelta: 2,
    restSpeed: 2
  },
  
  // Gentle for background elements
  gentle: {
    stiffness: 60,
    damping: 15,
    restDelta: 1,
    restSpeed: 1
  }
};

// Animation durations (in seconds)
export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  verySlow: 0.8
};

// Easing curves
export const easings = {
  // Standard easing
  easeOut: [0.25, 0.46, 0.45, 0.94],
  easeIn: [0.55, 0.06, 0.68, 0.19],
  easeInOut: [0.42, 0, 0.58, 1],
  
  // Smooth easing for performance
  smoothOut: [0.16, 1, 0.3, 1],
  smoothIn: [0.7, 0, 0.84, 0],
  
  // Bouncy but controlled
  gentleBounce: [0.68, -0.1, 0.265, 1.1]
};

// Throttle delays for different interaction types
export const throttleDelays = {
  mouseMove: 16,    // ~60fps
  scroll: 16,       // ~60fps
  resize: 100,      // 10fps
  intersection: 200, // 5fps
  field: 32         // ~30fps for particle fields
};

// Performance-optimized particle counts
export const particleCounts = {
  low: 10,
  medium: 20,
  high: 50,
  ultra: 100
};

// Get optimal particle count based on device
export const getOptimalParticleCount = () => {
  const { shouldOptimize } = getPerformanceSettings();
  
  if (shouldOptimize) return particleCounts.low;
  if (navigator.hardwareConcurrency <= 4) return particleCounts.medium;
  return particleCounts.high;
};

// Animation frame rate control
export const frameRateConfig = {
  // Target frame rates for different animation types
  critical: 60,     // UI interactions
  standard: 30,     // Background animations
  ambient: 15       // Ambient effects
};

// Will-change property management for GPU acceleration
export const willChangeProperties = {
  transform: 'transform',
  opacity: 'opacity',
  scroll: 'scroll-position',
  filter: 'filter',
  all: 'transform, opacity, filter'
};

// CSS custom properties for smooth transitions
export const cssVariables = {
  '--animation-duration-fast': `${durations.fast}s`,
  '--animation-duration-normal': `${durations.normal}s`,
  '--animation-duration-slow': `${durations.slow}s`,
  '--animation-easing-smooth': `cubic-bezier(${easings.smoothOut.join(',')})`,
  '--animation-spring-stiff': `${springConfigs.smooth.stiffness}`,
  '--animation-spring-damp': `${springConfigs.smooth.damping}`
};

// Intersection Observer optimized options
export const intersectionOptions = {
  // High performance observer for visibility tracking
  performance: {
    root: null,
    rootMargin: '50px',
    threshold: [0, 0.1]
  },
  
  // Precise observer for animation triggers
  precise: {
    root: null,
    rootMargin: '-20px',
    threshold: [0, 0.25, 0.5, 0.75, 1]
  },
  
  // Lazy observer for non-critical elements
  lazy: {
    root: null,
    rootMargin: '200px',
    threshold: 0.01
  }
};

// Memory management helpers
export const memoryManagement = {
  // Clean up animation references
  cleanupAnimations: (animations: Array<() => void>) => {
    animations.forEach(cleanup => cleanup?.());
    animations.length = 0;
  },
  
  // Debounced cleanup for frequent updates
  debouncedCleanup: (() => {
    let timeoutId: NodeJS.Timeout;
    return (callback: () => void, delay: number = 1000) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    };
  })(),
  
  // Check if element is in viewport
  isInViewport: (element: Element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }
};

// GPU acceleration hints
export const gpuAcceleration = {
  // Force GPU layer creation
  forceLayer: {
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden' as const,
    perspective: 1000
  },
  
  // Optimize for transforms
  optimizeTransforms: {
    transformStyle: 'preserve-3d' as const,
    willChange: 'transform'
  }
};

// Export default optimized configuration
export const defaultAnimationConfig = {
  spring: springConfigs.smooth,
  duration: durations.normal,
  easing: easings.smoothOut,
  throttle: throttleDelays.mouseMove,
  particles: getOptimalParticleCount()
};

export default defaultAnimationConfig;
import { useEffect, useRef, useCallback, useState } from 'react';
import { getPerformanceSettings } from '../utils/animationConfig';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  isOptimized: boolean;
}

interface UsePerformanceMonitorOptions {
  enabled?: boolean;
  sampleSize?: number;
  onPerformanceChange?: (metrics: PerformanceMetrics) => void;
}

export const usePerformanceMonitor = (options: UsePerformanceMonitorOptions = {}) => {
  const {
    enabled = true,
    sampleSize = 60, // 1 second at 60fps
    onPerformanceChange
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    isOptimized: false
  });

  const frameTimesRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  const animationFrameRef = useRef<number>();

  // Measure frame performance
  const measureFrame = useCallback(() => {
    const currentTime = performance.now();
    const frameTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // Add to frame time history
    frameTimesRef.current.push(frameTime);
    
    // Keep only recent samples
    if (frameTimesRef.current.length > sampleSize) {
      frameTimesRef.current.shift();
    }

    // Calculate metrics every few frames to avoid overhead
    if (frameTimesRef.current.length % 10 === 0) {
      const avgFrameTime = frameTimesRef.current.reduce((sum, time) => sum + time, 0) / frameTimesRef.current.length;
      const fps = Math.round(1000 / avgFrameTime);
      
      const newMetrics: PerformanceMetrics = {
        fps,
        frameTime: Math.round(avgFrameTime * 100) / 100,
        memoryUsage: (performance as any).memory?.usedJSHeapSize,
        isOptimized: fps < 50 || avgFrameTime > 20
      };

      setMetrics(prev => {
        // Only update if there's a significant change
        if (Math.abs(prev.fps - fps) > 5 || Math.abs(prev.frameTime - avgFrameTime) > 2) {
          onPerformanceChange?.(newMetrics);
          return newMetrics;
        }
        return prev;
      });
    }

    if (enabled) {
      animationFrameRef.current = requestAnimationFrame(measureFrame);
    }
  }, [enabled, sampleSize, onPerformanceChange]);

  // Auto-optimization based on performance
  const shouldOptimize = useCallback(() => {
    const settings = getPerformanceSettings();
    return settings.shouldOptimize || metrics.fps < 45 || metrics.frameTime > 22;
  }, [metrics.fps, metrics.frameTime]);

  // Get recommended settings based on current performance
  const getRecommendedSettings = useCallback(() => {
    const optimize = shouldOptimize();
    
    return {
      particleCount: optimize ? 10 : metrics.fps > 55 ? 30 : 20,
      animationQuality: optimize ? 'low' : metrics.fps > 55 ? 'high' : 'medium',
      useGPUAcceleration: metrics.fps < 50,
      throttleRate: optimize ? 32 : 16, // ms between updates
      enableBlur: metrics.fps > 50,
      enableShadows: metrics.fps > 55,
      maxAnimationLayers: optimize ? 3 : 6
    };
  }, [shouldOptimize, metrics.fps]);

  // Start monitoring
  useEffect(() => {
    if (enabled) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(measureFrame);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, measureFrame]);

  // Performance warning system
  const getPerformanceStatus = useCallback(() => {
    if (metrics.fps >= 55) return 'excellent';
    if (metrics.fps >= 45) return 'good';
    if (metrics.fps >= 30) return 'fair';
    return 'poor';
  }, [metrics.fps]);

  // Memory pressure detection
  const isMemoryPressure = useCallback(() => {
    if (!metrics.memoryUsage) return false;
    
    // Rough heuristic for memory pressure (>50MB for animations)
    return metrics.memoryUsage > 50 * 1024 * 1024;
  }, [metrics.memoryUsage]);

  return {
    metrics,
    shouldOptimize: shouldOptimize(),
    recommendedSettings: getRecommendedSettings(),
    performanceStatus: getPerformanceStatus(),
    isMemoryPressure: isMemoryPressure(),
    
    // Utility functions
    startMonitoring: () => {
      if (!enabled && !animationFrameRef.current) {
        lastTimeRef.current = performance.now();
        animationFrameRef.current = requestAnimationFrame(measureFrame);
      }
    },
    
    stopMonitoring: () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    },
    
    resetMetrics: () => {
      frameTimesRef.current = [];
      setMetrics({
        fps: 60,
        frameTime: 16.67,
        isOptimized: false
      });
    }
  };
};

// Hook for adaptive animation quality
export const useAdaptiveQuality = () => {
  const { shouldOptimize, recommendedSettings, metrics } = usePerformanceMonitor();
  
  const getQualitySettings = useCallback((animationType: 'particle' | 'morphing' | 'text' | 'magnetic') => {
    const base = recommendedSettings;
    
    switch (animationType) {
      case 'particle':
        return {
          count: base.particleCount,
          enableConnections: !shouldOptimize,
          enablePhysics: metrics.fps > 45,
          updateRate: base.throttleRate
        };
        
      case 'morphing':
        return {
          complexity: shouldOptimize ? 'low' : base.animationQuality,
          enableBlur: base.enableBlur,
          layerCount: Math.min(base.maxAnimationLayers, 4),
          updateRate: base.throttleRate
        };
        
      case 'text':
        return {
          enableGlow: base.enableShadows,
          staggerDelay: shouldOptimize ? 0.02 : 0.05,
          enableMotionBlur: base.enableBlur,
          animationDuration: shouldOptimize ? 0.3 : 0.5
        };
        
      case 'magnetic':
        return {
          magneticRadius: shouldOptimize ? 100 : 150,
          enableRotation: metrics.fps > 50,
          enableScale: !shouldOptimize,
          updateRate: base.throttleRate
        };
        
      default:
        return base;
    }
  }, [shouldOptimize, recommendedSettings, metrics.fps]);
  
  return {
    getQualitySettings,
    currentFPS: metrics.fps,
    shouldOptimize,
    performanceLevel: metrics.fps > 55 ? 'high' : metrics.fps > 45 ? 'medium' : 'low'
  };
};

export default usePerformanceMonitor;
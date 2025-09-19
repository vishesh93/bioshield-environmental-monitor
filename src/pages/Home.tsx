import { motion, useScroll, useTransform, useSpring, useMotionValue, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Droplets, Shield, AlertTriangle, TrendingUp, MapPin, Activity, ArrowRight, Play } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import '../scroll-performance.css';
import { 
  LiquidWaveLoader, 
  RippleEffect, 
  BubbleFloatAnimation, 
  FlowingRivers,
  riverPresets 
} from '../components/water-animations';

// Animated Water Wave Logo Component
const WaterWaveLogo = () => {
  return (
    <div className="relative w-16 h-16 rounded-3xl overflow-hidden bg-gradient-to-b from-gray-700 to-gray-800">
      {/* Shield icon as background */}
      <div className="absolute inset-0 flex items-center justify-center z-30">
        <Shield className="h-10 w-10 text-white" />
      </div>
      
      {/* Base water background */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400" />
      
      {/* Simplified First wave layer */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-cyan-500 to-blue-400"
        animate={{
          clipPath: [
            'polygon(0 45%, 25% 40%, 50% 45%, 75% 40%, 100% 45%, 100% 100%, 0% 100%)',
            'polygon(0 40%, 25% 45%, 50% 40%, 75% 45%, 100% 40%, 100% 100%, 0% 100%)'
          ]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Simplified Second wave layer */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-blue-500 to-cyan-400 opacity-70"
        animate={{
          clipPath: [
            'polygon(0 55%, 33% 50%, 66% 55%, 100% 50%, 100% 100%, 0% 100%)',
            'polygon(0 50%, 33% 55%, 66% 50%, 100% 55%, 100% 100%, 0% 100%)'
          ]
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      {/* Simplified water surface highlights */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-transparent to-white/20"
        animate={{
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

// Water Droplet Animation Component
const WaterDroplet = ({ delay = 0, size = 'small', position = { left: '20%', top: '10%' } }) => {
  const sizeClasses = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4'
  };

  return (
    <motion.div
      className={`absolute ${sizeClasses[size]} bg-gradient-to-b from-blue-400 to-blue-600 rounded-full opacity-20`}
      style={position}
      animate={{
        y: [0, -20, 0],
        scale: [1, 1.1, 1],
        opacity: [0.2, 0.4, 0.2]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    />
  );
};

// Floating Particle Component
const FloatingParticle = ({ delay = 0, duration = 4 }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setPosition({
      x: Math.random() * 100,
      y: Math.random() * 100
    });
  }, []);

  return (
    <motion.div
      className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      animate={{
        y: [-20, 20, -20],
        x: [-10, 10, -10],
        opacity: [0.1, 0.3, 0.1]
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    />
  );
};

// Floating Geometric Shapes Component
const FloatingShape = ({ shape = 'circle', delay = 0, size = 'medium', color = 'blue' }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setPosition({
      x: Math.random() * 90 + 5, // Keep shapes within 5-95% of screen
      y: Math.random() * 90 + 5
    });
  }, []);

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-400/10 to-blue-600/10 border-blue-400/20',
    green: 'bg-gradient-to-br from-green-400/10 to-green-600/10 border-green-400/20',
    purple: 'bg-gradient-to-br from-purple-400/10 to-purple-600/10 border-purple-400/20'
  };

  const shapeClass = shape === 'circle' ? 'rounded-full' : shape === 'square' ? 'rounded-lg' : 'rounded-none rotate-45';

  return (
    <motion.div
      className={`absolute ${sizeClasses[size]} ${colorClasses[color]} ${shapeClass} border backdrop-blur-sm`}
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      animate={{
        y: [-30, 30, -30],
        x: [-15, 15, -15],
        rotate: shape === 'diamond' ? [45, 90, 45] : [0, 360, 0],
        opacity: [0.1, 0.3, 0.1],
        scale: [1, 1.2, 1]
      }}
      transition={{
        duration: 6 + Math.random() * 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    />
  );
};

// Parallax Background Component
const ParallaxBackground = ({ children, offset = 50 }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, offset]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1.1, 1, 1, 1.1]);
  
  return (
    <motion.div
      ref={ref}
      style={{ y, opacity, scale }}
      className="absolute inset-0"
    >
      {children}
    </motion.div>
  );
};

// Optimized Parallax Element - Simplified for better performance
const ParallaxElement = ({ children, speed = 0.5, className = "" }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);
  
  return (
    <motion.div
      ref={ref}
      style={{ 
        y,
        willChange: 'transform'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Optimized Tilt Card Component - Reduced complexity for better performance
const TiltCard = ({ children, className = "" }) => {
  return (
    <motion.div
      className={`${className}`}
      whileHover={{ 
        scale: 1.02,
        y: -2
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25
      }}
      style={{
        willChange: 'transform'
      }}
    >
      {children}
    </motion.div>
  );
};

// Optimized Zoom Parallax Component - Simpler for better performance
const ZoomParallax = ({ children, zoomRange = [0.95, 1.05], className = "" }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [zoomRange[0], 1, zoomRange[1]]);
  
  return (
    <motion.div
      ref={ref}
      style={{ 
        scale,
        willChange: 'transform'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Scroll-Triggered Reveal Component
const ScrollReveal = ({ children, direction = "up", delay = 0, className = "" }) => {
  const ref = useRef(null);
  const controls = useAnimation();
  const [hasAnimated, setHasAnimated] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          controls.start("visible");
          setHasAnimated(true);
        }
      },
      { threshold: 0.1, rootMargin: "-50px" }
    );
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [controls, hasAnimated]);
  
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 60 : direction === "down" ? -60 : 0,
      x: direction === "left" ? 60 : direction === "right" ? -60 : 0,
      scale: 0.9,
      rotateX: direction === "up" ? 15 : direction === "down" ? -15 : 0
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.8,
        delay,
        ease: [0.25, 0.25, 0.25, 0.75],
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const Home = () => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(() => {
    // Only show loading animation once per session
    const hasSeenLoading = sessionStorage.getItem('bioshield-seen-loading');
    return !hasSeenLoading;
  });
  
  // Mark as seen when component mounts
  useEffect(() => {
    if (isLoading) {
      sessionStorage.setItem('bioshield-seen-loading', 'true');
    }
  }, [isLoading]);
  
  // Fallback to show content after maximum wait time
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (isLoading) {
        console.warn('[Home] Loader fallback fired. Forcing content visible.');
        setIsLoading(false);
      }
    }, 2000); // Reduce fallback to 2 seconds to avoid long blank screens
    
    return () => clearTimeout(fallbackTimer);
  }, [isLoading]);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Auto-complete loading after animation finishes
  useEffect(() => {
    // Loading will be controlled by the loader component's auto-completion
    // No additional timer needed here
    console.log('[Home] isLoading:', isLoading);
  }, []);
  
  // Advanced 6-Layer Parallax System
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  const heroRotate = useTransform(scrollYProgress, [0, 1], [0, -5]);
  
  // Multi-depth background layers with advanced transforms
  const bgLayer1Y = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const bgLayer2Y = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const bgLayer3Y = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const bgLayer4Y = useTransform(scrollYProgress, [0, 1], [0, -700]);
  const bgLayer5Y = useTransform(scrollYProgress, [0, 1], [0, -900]);
  const bgLayer6Y = useTransform(scrollYProgress, [0, 1], [0, -1200]);
  
  // 3D rotation effects for background layers
  const bgLayer1Rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const bgLayer2Scale = useTransform(scrollYProgress, [0, 1], [1, 2.5]);
  const bgLayer3Rotate = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const bgLayer4Opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 0.6, 0.3]);
  
  // Advanced spring configurations for different layers
  const smoothHeroY = useSpring(heroY, { stiffness: 90, damping: 25, restDelta: 0.001 });
  const smoothHeroOpacity = useSpring(heroOpacity, { stiffness: 120, damping: 30 });
  const smoothHeroRotate = useSpring(heroRotate, { stiffness: 80, damping: 20 });
  
  const smoothBgLayer1Y = useSpring(bgLayer1Y, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const smoothBgLayer2Y = useSpring(bgLayer2Y, { stiffness: 85, damping: 28, restDelta: 0.001 });
  const smoothBgLayer3Y = useSpring(bgLayer3Y, { stiffness: 70, damping: 25, restDelta: 0.001 });
  const smoothBgLayer4Y = useSpring(bgLayer4Y, { stiffness: 60, damping: 22, restDelta: 0.001 });
  const smoothBgLayer5Y = useSpring(bgLayer5Y, { stiffness: 50, damping: 20, restDelta: 0.001 });
  const smoothBgLayer6Y = useSpring(bgLayer6Y, { stiffness: 40, damping: 18, restDelta: 0.001 });
  
  const smoothBgLayer1Rotate = useSpring(bgLayer1Rotate, { stiffness: 60, damping: 35 });
  const smoothBgLayer2Scale = useSpring(bgLayer2Scale, { stiffness: 80, damping: 25 });
  const smoothBgLayer3Rotate = useSpring(bgLayer3Rotate, { stiffness: 50, damping: 30 });
  const smoothBgLayer4Opacity = useSpring(bgLayer4Opacity, { stiffness: 100, damping: 25 });

  const features = [
    {
      icon: Activity,
      title: 'Real-time Monitoring',
      description: 'Track heavy metal pollution levels across monitoring stations in real-time.',
      gradient: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/25'
    },
    {
      icon: MapPin,
      title: 'Interactive Maps',
      description: 'Visualize pollution data on interactive maps with location-based insights.',
      gradient: 'from-green-500 to-emerald-500',
      shadowColor: 'shadow-green-500/25'
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Analyze trends and patterns in water quality data with comprehensive charts.',
      gradient: 'from-purple-500 to-violet-500',
      shadowColor: 'shadow-purple-500/25'
    },
    {
      icon: AlertTriangle,
      title: 'Instant Alerts',
      description: 'Receive immediate notifications when pollution levels exceed safe thresholds.',
      gradient: 'from-red-500 to-pink-500',
      shadowColor: 'shadow-red-500/25'
    }
  ];

  const stats = [
    { label: 'Monitoring Stations', value: '5', icon: MapPin, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Cities Covered', value: '5', icon: Droplets, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Active Alerts', value: '4', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Safe Stations', value: '2', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
  ];

  return (
    <>
      {/* Liquid Wave Loader */}
      <LiquidWaveLoader 
        isLoading={isLoading} 
        onComplete={() => setIsLoading(false)}
        duration={1100}
        showClickToEnter={false}
      />

      {/* Main Content - Only render when not loading */}
      {!isLoading && (
        <motion.div 
          ref={containerRef} 
          className="home-container min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            scrollBehavior: 'smooth',
            transform: 'translateZ(0)', // Force hardware acceleration
            willChange: 'scroll-position'
          }}
        >
      {/* Simplified Hero Section with Optimized Parallax */}
      <div className="relative overflow-hidden h-screen flex items-center justify-center">
        {/* Background Layer 1 - Static Gradient */}
        <div className="background-layer absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/20 dark:from-blue-900/10 dark:to-purple-900/10" />
        
        {/* Background Layer 2 - Simple Parallax */}
        <ParallaxElement speed={-0.3} className="parallax-element absolute inset-0">
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-br from-green-400/8 to-blue-400/8 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-gradient-to-br from-blue-400/8 to-purple-400/8 rounded-full blur-3xl" />
        </ParallaxElement>
        
        {/* Background Layer 3 - Gentle Movement */}
        <ParallaxElement speed={-0.6} className="parallax-element absolute inset-0">
          <div className="background-layer absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.06) 0%, transparent 40%), radial-gradient(circle at 70% 80%, rgba(34, 197, 94, 0.06) 0%, transparent 40%)'
          }} />
        </ParallaxElement>
        {/* Simplified Floating Elements for Better Performance */}
        <ParallaxElement speed={-0.3} className="parallax-element floating-element">
          <WaterDroplet delay={0} size="medium" position={{ left: '15%', top: '20%' }} />
          <WaterDroplet delay={2} size="small" position={{ left: '85%', top: '60%' }} />
        </ParallaxElement>
        
        {/* Minimal Floating Particles */}
        <ParallaxElement speed={-0.5} className="parallax-element floating-element">
          {Array.from({ length: 3 }).map((_, i) => (
            <FloatingParticle key={i} delay={i * 1} duration={4 + i} />
          ))}
        </ParallaxElement>
        
        {/* Reduced Geometric Shapes */}
        <ParallaxElement speed={-0.4} className="parallax-element floating-element">
          <FloatingShape shape="circle" delay={0} size="small" color="blue" />
          <FloatingShape shape="diamond" delay={1.5} size="medium" color="purple" />
        </ParallaxElement>
        
        {/* Simplified Hero Content with Ripple Effects */}
        <RippleEffect 
          className="w-full h-full"
          rippleColor="rgba(59, 130, 246, 0.3)"
          maxRipples={8}
        >
          <ZoomParallax zoomRange={[0.98, 1.02]} className="relative w-full h-full flex items-center justify-center px-6">
            <motion.div 
              style={{ 
                y: smoothHeroY, 
                opacity: smoothHeroOpacity
              }}
              className="w-full flex items-center justify-center"
            >
              <TiltCard className="text-center max-w-4xl mx-auto">
              <ScrollReveal direction="up" delay={0.3}>
                {/* Simplified Logo Container */}
                <TiltCard className="flex justify-center mb-8 relative">
                  <motion.div 
                    className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 p-8 rounded-3xl shadow-2xl"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <WaterWaveLogo />
                  </motion.div>
                </TiltCard>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.6}>
                <TiltCard magneticStrength={0.3}>
                  <motion.h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                    <motion.span 
                      className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent inline-block"
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                      }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        backgroundSize: '200% 200%'
                      }}
                    >
                      BioShield
                    </motion.span>
                    <br />
                    <ScrollReveal direction="right" delay={0.9}>
                      <motion.span 
                        className="text-3xl md:text-4xl lg:text-5xl text-gray-600 dark:text-gray-300 font-medium"
                        whileHover={{ scale: 1.05, color: "#3B82F6" }}
                        transition={{ duration: 0.3 }}
                      >
                        Environmental Monitor
                      </motion.span>
                    </ScrollReveal>
                  </motion.h1>
                </TiltCard>
              </ScrollReveal>
              
              <ScrollReveal direction="up" delay={1.2}>
                <ZoomParallax zoomRange={[0.95, 1.05]}>
                  <motion.p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                    <motion.span
                      whileHover={{ color: "#10B981" }}
                      transition={{ duration: 0.3 }}
                    >
                      Advanced environmental monitoring and analysis of heavy metal pollution in water bodies across India.
                    </motion.span>
                    {" "}
                    <motion.span
                      className="text-blue-600 dark:text-blue-400 font-semibold"
                      whileHover={{ scale: 1.05, color: "#3B82F6" }}
                      transition={{ duration: 0.3 }}
                    >
                      Your comprehensive protection system for water quality management.
                    </motion.span>
                  </motion.p>
                </ZoomParallax>
              </ScrollReveal>
            
              <ScrollReveal direction="up" delay={1.5}>
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <TiltCard magneticStrength={0.6}>
                    <Link to="/dashboard" className="block">
                      <motion.button
                        whileHover={{ 
                          scale: 1.08, 
                          y: -8,
                          rotateX: -5,
                          boxShadow: "0 35px 60px -12px rgba(34, 197, 94, 0.6)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="relative bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all duration-300 flex items-center space-x-3 overflow-hidden group min-w-[250px]"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        {/* Button background glow */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-600 to-purple-600 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          animate={{
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Play className="h-6 w-6 relative z-10" />
                        </motion.div>
                        <span className="relative z-10">Start Monitoring</span>
                        
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-pulse"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.6 }}
                        />
                      </motion.button>
                    </Link>
                  </TiltCard>
                  
                  <TiltCard magneticStrength={0.6}>
                    <Link to="/analytics" className="block">
                      <motion.button
                        whileHover={{ 
                          scale: 1.08, 
                          y: -8,
                          rotateX: -5,
                          borderColor: "rgba(59, 130, 246, 0.8)",
                          boxShadow: "0 35px 60px -12px rgba(59, 130, 246, 0.4)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="relative bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl border-2 border-gray-200/30 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all duration-300 flex items-center space-x-3 overflow-hidden group min-w-[250px]"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        {/* Gradient background on hover */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        
                        <span className="relative z-10">View Analytics</span>
                        <motion.div
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ArrowRight className="h-6 w-6 relative z-10" />
                        </motion.div>
                        
                        {/* Border glow */}
                        <motion.div
                          className="absolute inset-0 rounded-2xl border-2 border-blue-400/0 group-hover:border-blue-400/50 transition-all duration-300"
                        />
                      </motion.button>
                    </Link>
                  </TiltCard>
                </div>
              </ScrollReveal>
            </TiltCard>
          </motion.div>
          </ZoomParallax>
        </RippleEffect>
      </div>

      {/* Advanced Stats Section with 3D Effects */}
      <div className="relative pt-0 pb-4 bg-gradient-to-b from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Floating Bubbles Background */}
        <BubbleFloatAnimation
          bubbleCount={4}
          containerHeight={200}
          containerWidth={1200}
          className="absolute inset-0"
          direction="up"
          interactive={false}
          generateInterval={2000}
          colors={[
            'rgba(59, 130, 246, 0.3)',
            'rgba(34, 197, 94, 0.3)',
            'rgba(16, 185, 129, 0.3)',
            'rgba(147, 197, 253, 0.2)'
          ]}
        />
        
        {/* Multi-layer background parallax */}
        <ParallaxElement speed={-0.3} className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-blue-400/8 to-green-400/8 rounded-full blur-3xl" />
          <div className="absolute bottom-32 right-32 w-32 h-32 bg-gradient-to-br from-green-400/8 to-purple-400/8 rounded-full blur-3xl" />
        </ParallaxElement>
        
        <ParallaxElement speed={-0.5} className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/5 to-blue-400/5 rounded-full blur-3xl" />
        </ParallaxElement>
        
        <ZoomParallax zoomRange={[0.95, 1.05]} className="relative px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal direction="up" delay={0.2}>
              <div className="text-center mb-20">
                <TiltCard magneticStrength={0.2}>
                  <motion.h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                    <motion.span
                      className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent"
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                      }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      style={{ backgroundSize: '200% 200%' }}
                    >
                      System Overview
                    </motion.span>
                  </motion.h2>
                  <motion.p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    Real-time monitoring statistics across our environmental protection network
                  </motion.p>
                </TiltCard>
              </div>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8, y: 60, rotateY: -15 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0, rotateY: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    duration: 0.7, 
                    delay: index * 0.15,
                    type: "spring",
                    stiffness: 100,
                    damping: 10
                  }}
                  whileHover={{ 
                    scale: 1.08, 
                    y: -8,
                    rotateY: 5,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    transition: { duration: 0.3 }
                  }}
                  className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 cursor-pointer group min-h-[180px] w-full flex flex-col justify-between perspective-1000"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="flex-1 flex flex-col items-center text-center">
                    <motion.div 
                      className={`${stat.bg} rounded-2xl p-3 w-fit mb-4 relative overflow-hidden`}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </motion.div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {stat.value}
                    </div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors text-center">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
            </div>
          </div>
        </ZoomParallax>
      </div>

      {/* Features Section with Enhanced Parallax and Ripple Effects */}
      <RippleEffect 
        className="relative py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
        rippleColor="rgba(34, 197, 94, 0.3)"
        maxRipples={6}
      >
        {/* Animated background elements */}
        <ParallaxElement speed={-0.3} className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-40 h-40 bg-gradient-to-br from-green-400/5 to-blue-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-60 h-60 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-3xl" />
        </ParallaxElement>
        
        <ParallaxElement speed={0.2} className="relative px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center mb-16"
            >
              <motion.h2 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
              >
                Powerful Environmental Protection
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              >
                Advanced features designed to provide comprehensive water quality monitoring and environmental protection.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 80, rotateX: 15, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ 
                      duration: 0.8, 
                      delay: index * 0.2,
                      type: "spring",
                      stiffness: 80,
                      damping: 12
                    }}
                    whileHover={{ 
                      y: -12,
                      rotateX: -3,
                      scale: 1.02,
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                      transition: { duration: 0.4 }
                    }}
                    className="group perspective-1000"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-500 relative overflow-hidden">
                    
                    <motion.div 
                      className={`bg-gradient-to-r ${feature.gradient} rounded-2xl p-4 w-fit mb-6 shadow-lg ${feature.shadowColor} relative z-10`}
                      whileHover={{ 
                        scale: 1.1,
                        rotate: [0, -5, 5, 0]
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </motion.div>
                    
                    <motion.h3 
                      className="text-2xl font-bold text-gray-900 dark:text-white mb-3 relative z-10"
                      whileHover={{ scale: 1.05 }}
                    >
                      {feature.title}
                    </motion.h3>
                    <motion.p 
                      className="text-gray-600 dark:text-gray-300 leading-relaxed relative z-10"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {feature.description}
                    </motion.p>
                  </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ParallaxElement>
      </RippleEffect>

      {/* CTA Section with Enhanced Parallax */}
      <div className="relative py-32 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 overflow-hidden">
        {/* Animated background elements */}
        <ParallaxElement speed={-0.4} className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" />
        </ParallaxElement>
        
        <ParallaxElement speed={-0.6} className="absolute inset-0">
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/8 to-purple-400/8 rounded-full blur-3xl animate-pulse" />
        </ParallaxElement>
        
        {/* Floating shapes in background */}
        <ParallaxElement speed={-0.2}>
          <FloatingShape shape="circle" delay={0} size="large" color="blue" />
          <FloatingShape shape="diamond" delay={1} size="medium" color="green" />
        </ParallaxElement>
        
        <ParallaxElement speed={0.3} className="relative px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 80, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ 
                duration: 1,
                type: "spring",
                stiffness: 60,
                damping: 15
              }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 relative overflow-hidden"
            >
              {/* Card background animation */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-blue-400/5 rounded-3xl"
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-4 w-fit mx-auto mb-6 relative z-10"
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              >
                <Shield className="h-10 w-10 text-white" />
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 relative z-10"
              >
                Ready to Protect Our Environment?
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.7 }}
                className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto relative z-10"
              >
                Start monitoring water quality and environmental conditions with BioShield's comprehensive protection system.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.9 }}
                className="relative z-10"
              >
                <Link to="/dashboard">
                  <motion.button
                    whileHover={{ 
                      scale: 1.08, 
                      y: -6,
                      boxShadow: "0 25px 50px -12px rgba(34, 197, 94, 0.6)",
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="relative bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-12 py-5 rounded-2xl font-bold text-lg shadow-lg shadow-green-500/25 transition-all duration-300 inline-flex items-center space-x-3 overflow-hidden group"
                  >
                    <motion.span 
                      className="relative z-10"
                      animate={{ 
                        backgroundPosition: ['0% 0%', '100% 0%', '0% 0%']
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      Start Monitoring Now
                    </motion.span>
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                    
                    {/* Button background animation */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </ParallaxElement>
      </div>
      </motion.div>
      )}
    </>
  );
};

export default Home;

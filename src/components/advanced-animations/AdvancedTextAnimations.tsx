import { motion, useInView, useAnimation, Variants, useTime, useTransform, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { throttle } from 'lodash-es';

interface AdvancedTextAnimationsProps {
  text: string;
  type?: 'typewriter' | 'letterReveal' | 'wordReveal' | 'glitch' | 'morphing' | 'wave' | 'neon';
  className?: string;
  delay?: number;
  duration?: number;
  staggerDelay?: number;
  repeat?: boolean;
  colors?: string[];
  onComplete?: () => void;
}

export const AdvancedTextAnimations: React.FC<AdvancedTextAnimationsProps> = ({
  text,
  type = 'letterReveal',
  className = '',
  delay = 0,
  duration = 1,
  staggerDelay = 0.05,
  repeat = false,
  colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'],
  onComplete
}) => {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: !repeat, margin: "-100px" });
  const controls = useAnimation();
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const time = useTime();
  const [isAnimating, setIsAnimating] = useState(false);

  // Memoize expensive operations
  const letters = useMemo(() => text.split(''), [text]);
  const words = useMemo(() => text.split(' '), [text]);

  useEffect(() => {
    if (isInView && !isAnimating) {
      setIsAnimating(true);
      controls.start('visible').then(() => {
        setIsAnimating(false);
        onComplete?.();
      });
    }
  }, [isInView, controls, isAnimating, onComplete]);

  // Optimized typewriter effect
  const typewriterEffect = useCallback(() => {
    if (type === 'typewriter' && isInView && !prefersReducedMotion) {
      const speed = prefersReducedMotion ? 50 : 80; // Faster for better performance
      const typewriterTimer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= text.length) {
            if (repeat) {
              setDisplayText('');
              return 0;
            }
            onComplete?.();
            clearInterval(typewriterTimer);
            return prev;
          }
          setDisplayText(text.slice(0, prev + 1));
          return prev + 1;
        });
      }, speed);

      return () => clearInterval(typewriterTimer);
    }
  }, [text, type, isInView, repeat, onComplete, prefersReducedMotion]);

  useEffect(() => {
    return typewriterEffect();
  }, [typewriterEffect]);

  // Optimized glitch text effect with throttling
  const glitchChars = useMemo(() => '!@#$%^&*()_+-=[]{}|;:,.<>?', []);
  const [glitchText, setGlitchText] = useState(text);

  const glitchEffect = useCallback(
    throttle(() => {
      if (type === 'glitch' && isInView && !prefersReducedMotion) {
        const randomIndex = Math.floor(Math.random() * text.length);
        const randomChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        
        setGlitchText(prev => {
          const chars = prev.split('');
          chars[randomIndex] = Math.random() > 0.8 ? randomChar : text[randomIndex];
          return chars.join('');
        });

        // Reset after brief glitch
        setTimeout(() => setGlitchText(text), 30);
      }
    }, 150),
    [type, isInView, text, glitchChars, prefersReducedMotion]
  );

  useEffect(() => {
    if (type === 'glitch' && isInView) {
      const glitchInterval = setInterval(glitchEffect, 180);
      setTimeout(() => clearInterval(glitchInterval), duration * 1000);
      return () => clearInterval(glitchInterval);
    }
  }, [glitchEffect, type, isInView, duration]);

  // Optimized animation variants
  const containerVariants: Variants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
        delayChildren: prefersReducedMotion ? 0 : delay
      }
    }
  }), [staggerDelay, delay, prefersReducedMotion]);

  const letterVariants: Variants = useMemo(() => ({
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 30, // Reduced motion amplitude
      scale: prefersReducedMotion ? 1 : 0.8,
      rotateX: prefersReducedMotion ? 0 : -45, // Reduced rotation
      filter: prefersReducedMotion ? 'none' : 'blur(5px)', // Reduced blur
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      filter: 'blur(0px)',
      transition: {
        type: prefersReducedMotion ? 'tween' : 'spring',
        stiffness: 150, // Reduced stiffness for smoother animation
        damping: 15,
        duration: prefersReducedMotion ? 0.3 : duration * 0.8 // Faster duration
      }
    }
  }), [duration, prefersReducedMotion]);

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      x: -50,
      rotateY: -25,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 150,
        damping: 10,
        duration: duration
      }
    }
  };

  const morphingVariants: Variants = {
    hidden: {
      scaleY: 0,
      scaleX: 0.5,
      opacity: 0,
      skewX: 45
    },
    visible: {
      scaleY: 1,
      scaleX: 1,
      opacity: 1,
      skewX: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 15,
        duration: duration
      }
    }
  };

  // Optimized wave animation using time
  const waveY = useTransform(time, (t) => prefersReducedMotion ? 0 : Math.sin(t * 0.0015) * 8); // Reduced frequency and amplitude
  const waveRotate = useTransform(time, (t) => prefersReducedMotion ? 0 : Math.sin(t * 0.0008) * 1.5);

  // Optimized neon glow effect
  const neonGlow = useMemo(() => {
    if (prefersReducedMotion) return colors[0];
    return colors[Math.floor((Date.now() * 0.001) % colors.length)];
  }, [colors, prefersReducedMotion]);

  // Fallback for reduced motion preference
  if (prefersReducedMotion) {
    return (
      <div className={`inline-block ${className}`}>
        {text}
      </div>
    );
  }

  const renderTypewriter = () => (
    <motion.span 
      className={`inline-block ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        className="inline-block w-0.5 h-6 bg-current ml-1"
      />
    </motion.span>
  );

  const renderLetterReveal = () => (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={controls}
      className={`inline-block ${className}`}
      style={{ perspective: '1000px' }}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          className="inline-block"
          style={{ 
            transformStyle: 'preserve-3d',
            transformOrigin: 'center bottom'
          }}
          whileHover={{
            scale: 1.2,
            color: colors[index % colors.length],
            textShadow: `0 0 20px ${colors[index % colors.length]}`,
            transition: { duration: 0.3 }
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  );

  const renderWordReveal = () => (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={controls}
      className={`inline-block ${className}`}
      style={{ perspective: '1000px' }}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={wordVariants}
          className="inline-block mr-2"
          style={{ 
            transformStyle: 'preserve-3d',
            transformOrigin: 'center'
          }}
          whileHover={{
            scale: 1.1,
            rotateY: 5,
            color: colors[index % colors.length],
            transition: { duration: 0.3 }
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );

  const renderGlitch = () => (
    <motion.div
      ref={ref}
      className={`inline-block relative ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <motion.span
        animate={{
          x: [0, -2, 2, 0],
          textShadow: [
            '0 0 0 transparent',
            '2px 0 0 #ff0000, -2px 0 0 #00ffff',
            '-2px 0 0 #ff0000, 2px 0 0 #00ffff',
            '0 0 0 transparent'
          ]
        }}
        transition={{
          duration: 0.3,
          repeat: Infinity,
          repeatDelay: 1,
          ease: "easeInOut"
        }}
      >
        {glitchText}
      </motion.span>
      
      {/* Glitch overlay lines */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'linear-gradient(90deg, transparent 0%, transparent 100%)',
            'linear-gradient(90deg, transparent 20%, #ff0000 21%, #ff0000 22%, transparent 23%)',
            'linear-gradient(90deg, transparent 60%, #00ffff 61%, #00ffff 62%, transparent 63%)',
            'linear-gradient(90deg, transparent 0%, transparent 100%)'
          ]
        }}
        transition={{
          duration: 0.3,
          repeat: Infinity,
          repeatDelay: 1.5
        }}
      />
    </motion.div>
  );

  const renderMorphing = () => (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={controls}
      className={`inline-block ${className}`}
      style={{ perspective: '1000px' }}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={morphingVariants}
          className="inline-block"
          style={{ 
            transformStyle: 'preserve-3d',
            transformOrigin: 'center'
          }}
          animate={{
            rotateY: [0, 360],
            color: colors[Math.floor((index + time.get() * 0.001) % colors.length)]
          }}
          transition={{
            rotateY: {
              duration: 4,
              repeat: Infinity,
              ease: "linear",
              delay: index * 0.1
            },
            color: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  );

  const renderWave = () => (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      style={{ 
        y: waveY,
        rotate: waveRotate
      }}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          className="inline-block"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.1
          }}
          whileHover={{
            scale: 1.3,
            color: colors[index % colors.length],
            transition: { duration: 0.3 }
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  );

  const renderNeon = () => (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        textShadow: [
          `0 0 5px ${neonGlow}, 0 0 10px ${neonGlow}, 0 0 15px ${neonGlow}`,
          `0 0 10px ${neonGlow}, 0 0 20px ${neonGlow}, 0 0 30px ${neonGlow}`,
          `0 0 5px ${neonGlow}, 0 0 10px ${neonGlow}, 0 0 15px ${neonGlow}`
        ]
      }}
      transition={{
        opacity: { delay, duration: 0.5 },
        textShadow: { 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }
      }}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          className="inline-block"
          animate={{
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.05
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  );

  switch (type) {
    case 'typewriter':
      return renderTypewriter();
    case 'letterReveal':
      return renderLetterReveal();
    case 'wordReveal':
      return renderWordReveal();
    case 'glitch':
      return renderGlitch();
    case 'morphing':
      return renderMorphing();
    case 'wave':
      return renderWave();
    case 'neon':
      return renderNeon();
    default:
      return renderLetterReveal();
  }
};

export default AdvancedTextAnimations;
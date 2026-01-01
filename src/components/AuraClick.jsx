import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AuraClick = () => {
  const [clicks, setClicks] = useState([]);
  const [animationTypes] = useState([
    'dark-energy',
    'ki-blast',
    'god-power',
    'ultra-instinct',
    'time-skip',
    'destruction'
  ]);

  const getRandomAnimation = useCallback(() => {
    return animationTypes[Math.floor(Math.random() * animationTypes.length)];
  }, [animationTypes]);

  const getAnimationConfig = useCallback((type) => {
    const configs = {
      'dark-energy': {
        coreColor: 'bg-violet-900',
        auraColor: 'border-violet-500',
        glow: 'shadow-[0_0_25px_#8b5cf6]',
        particleColor: 'bg-violet-400',
        size: 'medium'
      },
      'ki-blast': {
        coreColor: 'bg-cyan-500',
        auraColor: 'border-cyan-300',
        glow: 'shadow-[0_0_30px_#06b6d4]',
        particleColor: 'bg-cyan-300',
        size: 'large'
      },
      'god-power': {
        coreColor: 'bg-rose-600',
        auraColor: 'border-rose-400',
        glow: 'shadow-[0_0_35px_#e11d48]',
        particleColor: 'bg-rose-300',
        size: 'large'
      },
      'ultra-instinct': {
        coreColor: 'bg-white',
        auraColor: 'border-slate-300',
        glow: 'shadow-[0_0_40px_#ffffff]',
        particleColor: 'bg-slate-200',
        size: 'small'
      },
      'time-skip': {
        coreColor: 'bg-indigo-700',
        auraColor: 'border-indigo-400',
        glow: 'shadow-[0_0_20px_#6366f1]',
        particleColor: 'bg-indigo-300',
        size: 'medium'
      },
      'destruction': {
        coreColor: 'bg-purple-950',
        auraColor: 'border-purple-700',
        glow: 'shadow-[0_0_50px_#6d28d9]',
        particleColor: 'bg-purple-600',
        size: 'large'
      }
    };
    return configs[type] || configs['dark-energy'];
  }, []);

  const getParticleCount = useCallback((type) => {
    const counts = {
      'dark-energy': 8,
      'ki-blast': 12,
      'god-power': 15,
      'ultra-instinct': 10,
      'time-skip': 6,
      'destruction': 20
    };
    return counts[type] || 8;
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      const id = Date.now() + Math.random();
      const animationType = getRandomAnimation();
      const config = getAnimationConfig(animationType);
      
      setClicks((prev) => [
        ...prev, 
        { 
          x: e.clientX, 
          y: e.clientY, 
          id, 
          type: animationType,
          config,
          particleCount: getParticleCount(animationType)
        }
      ]);
      
      setTimeout(() => {
        setClicks((prev) => prev.filter((c) => c.id !== id));
      }, 1200);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [getRandomAnimation, getAnimationConfig, getParticleCount]);

  const getSize = (sizeType) => {
    switch(sizeType) {
      case 'small': return { core: 12, ring: 40 };
      case 'medium': return { core: 16, ring: 60 };
      case 'large': return { core: 20, ring: 80 };
      default: return { core: 16, ring: 60 };
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <AnimatePresence>
        {clicks.map((click) => {
          const size = getSize(click.config.size);
          
          return (
            <React.Fragment key={click.id}>
              {/* 1. Core Energy Ball */}
              <motion.div
                initial={{ 
                  opacity: 1, 
                  scale: 0,
                  rotate: 0 
                }}
                animate={{ 
                  opacity: 0, 
                  scale: click.type === 'ultra-instinct' ? 3 : 2,
                  rotate: 360 
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: click.type === 'destruction' ? 1.2 : 0.8,
                  ease: click.type === 'ultra-instinct' ? "linear" : "easeOut"
                }}
                className={`absolute rounded-full blur-[3px] ${click.config.coreColor}`}
                style={{ 
                  left: click.x - size.core/2, 
                  top: click.y - size.core/2,
                  width: size.core,
                  height: size.core,
                  boxShadow: `0 0 15px ${click.config.coreColor.split('-')[1] || '#000'}`
                }}
              />

              {/* 2. Expanding Aura Ring */}
              <motion.div
                initial={{ 
                  opacity: 0.9, 
                  scale: 0, 
                  borderWidth: "3px",
                  rotate: 0
                }}
                animate={{ 
                  opacity: 0, 
                  scale: click.type === 'god-power' ? 5 : 3.5,
                  borderWidth: "0px",
                  rotate: click.type === 'time-skip' ? 180 : 0
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: click.type === 'destruction' ? 1 : 0.6,
                  ease: "easeOut"
                }}
                className={`absolute rounded-full ${click.config.auraColor} ${click.config.glow}`}
                style={{ 
                  left: click.x - size.ring/2, 
                  top: click.y - size.ring/2,
                  width: size.ring,
                  height: size.ring
                }}
              />

              {/* 3. Secondary Shockwave (for premium animations) */}
              {(click.type === 'god-power' || click.type === 'destruction' || click.type === 'ultra-instinct') && (
                <motion.div
                  initial={{ opacity: 0.6, scale: 0 }}
                  animate={{ opacity: 0, scale: 6 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
                  className={`absolute rounded-full border-2 ${click.config.auraColor}`}
                  style={{ 
                    left: click.x - size.ring, 
                    top: click.y - size.ring,
                    width: size.ring * 2,
                    height: size.ring * 2
                  }}
                />
              )}

              {/* 4. Energy Particles */}
              {[...Array(click.particleCount)].map((_, i) => {
                const angle = (i * 360) / click.particleCount;
                const distance = click.type === 'destruction' ? 120 : 80;
                const duration = 0.7 + Math.random() * 0.5;
                
                return (
                  <motion.div
                    key={`${click.id}-${i}`}
                    initial={{ 
                      x: 0, 
                      y: 0, 
                      opacity: 1,
                      scale: 1
                    }}
                    animate={{
                      x: Math.cos(angle * Math.PI / 180) * distance,
                      y: Math.sin(angle * Math.PI / 180) * distance,
                      opacity: 0,
                      scale: 0
                    }}
                    transition={{ 
                      duration,
                      ease: click.type === 'ultra-instinct' ? "easeInOut" : "easeOut"
                    }}
                    className={`absolute w-2 h-2 rounded-full blur-[1px] ${click.config.particleColor}`}
                    style={{ 
                      left: click.x - 4, 
                      top: click.y - 4,
                      boxShadow: `0 0 8px ${click.config.particleColor.split('-')[1] || '#fff'}`
                    }}
                  />
                );
              })}

              {/* 5. Special Effects for Specific Types */}
              {click.type === 'time-skip' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.3, scale: 2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute rounded-full bg-indigo-300 blur-[10px]"
                  style={{ 
                    left: click.x - 50, 
                    top: click.y - 50,
                    width: 100,
                    height: 100
                  }}
                />
              )}

              {click.type === 'ultra-instinct' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.2, scale: 4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute rounded-full border border-white blur-[5px]"
                  style={{ 
                    left: click.x - 75, 
                    top: click.y - 75,
                    width: 150,
                    height: 150
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AuraClick;
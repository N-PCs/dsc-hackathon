import { motion } from 'motion/react';

export const OriginSun = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-[1]">
      {/* Massive sun container centered */}
      <div className="relative w-[360px] h-[360px] sm:w-[550px] sm:h-[550px] md:w-[700px] md:h-[700px] flex items-center justify-center">
        
        {/* Layer 1: Giant Red-Orange Solar Glow (Highly visible) */}
        <motion.div
          className="absolute w-[80%] h-[80%] rounded-full bg-[#FF2200] opacity-80 blur-[100px]"
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Layer 2: Medium Orange Corona Flare (Highly visible) */}
        <motion.div
          className="absolute w-[60%] h-[60%] rounded-full bg-[#FF5F00] opacity-75 blur-[50px]"
          animate={{
            scale: [1.1, 0.95, 1.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Layer 3: Stylized Outer Solar Flares (Rotating clockwise) */}
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute w-full h-full text-[#FF5F00]"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            ease: 'linear',
            duration: 90,
          }}
        >
          {/* 16 sharp triangulated flares radiating from center */}
          {[...Array(16)].map((_, i) => {
            const angle = (i * 360) / 16;
            return (
              <polygon
                key={i}
                points="49,12 51,12 50,0"
                transform={`rotate(${angle} 50 50)`}
                fill="#FF5F00"
                stroke="#000000"
                strokeWidth="0.8"
              />
            );
          })}
        </motion.svg>

        {/* Layer 4: Stylized Inner Ray Spokes (Rotating counter-clockwise) */}
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute w-[80%] h-[80%] text-[#FF2200] opacity-100"
          animate={{ rotate: -360 }}
          transition={{
            repeat: Infinity,
            ease: 'linear',
            duration: 60,
          }}
        >
          {[...Array(24)].map((_, i) => {
            const angle = (i * 360) / 24;
            return (
              <line
                key={i}
                x1="50"
                y1="50"
                x2="50"
                y2="20"
                transform={`rotate(${angle} 50 50)`}
                stroke="#FF5F00"
                strokeWidth="0.6"
              />
            );
          })}
        </motion.svg>

        {/* Layer 5: Glowing Eclipse Sun Core with solid thick borders */}
        <motion.div
          className="absolute w-[160px] h-[160px] sm:w-[240px] sm:h-[240px] md:w-[320px] md:h-[320px] rounded-full bg-[#FF5F00] border-6 border-black shadow-[0_0_80px_rgba(255,34,0,0.85)] flex items-center justify-center z-[2]"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* The black core disc representing the Eclipse (Origin) */}
          <div className="w-[88%] h-[88%] rounded-full bg-black border-4 border-black relative flex items-center justify-center overflow-hidden">
            {/* Comic hatching lines printed in orange on the black core */}
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#FF5F00]">
                <line x1="10" y1="10" x2="90" y2="90" stroke="#FF5F00" strokeWidth="0.8" />
                <line x1="20" y1="5" x2="95" y2="80" stroke="#FF5F00" strokeWidth="0.5" />
                <line x1="5" y1="20" x2="80" y2="95" stroke="#FF5F00" strokeWidth="0.5" />
                <line x1="30" y1="0" x2="100" y2="70" stroke="#FF5F00" strokeWidth="0.5" />
                <line x1="0" y1="30" x2="70" y2="100" stroke="#FF5F00" strokeWidth="0.5" />
              </svg>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

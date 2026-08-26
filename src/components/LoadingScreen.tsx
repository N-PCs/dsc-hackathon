import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame } from 'lucide-react';

interface LoadingScreenProps {
  onComplete?: () => void;
  minimumTimeMs?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onComplete,
  minimumTimeMs = 2200,
}) => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  // Smooth linear progress counter (0 to 100%)
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / minimumTimeMs) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsDone(true);
          if (onComplete) onComplete();
        }, 300);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [minimumTimeMs, onComplete]);

  if (isDone) return null;

  // 20 block segments for the signature brutalist loader bar
  const totalBlocks = 20;
  const filledBlocks = Math.floor((progress / 100) * totalBlocks);
  const letters = ['O', 'R', 'I', 'G', 'I', 'N'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed inset-0 z-[100] bg-[#0A0A0A] text-white flex flex-col justify-between p-6 sm:p-12 select-none overflow-hidden font-mono"
      >
        {/* Subtle fiery orange background ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF3B00]/15 via-transparent to-transparent pointer-events-none" />

        {/* Top Header Bar (Website Catalog Theme) */}
        <div className="relative z-10 flex items-center justify-between border-b border-[#222222] pb-4 text-xs tracking-widest uppercase">
          <div className="flex items-center gap-3 text-[#FF3B00] font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B00] animate-ping" />
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#FF3B00]" />
              ORIGIN '26 // SYSTEM_INIT
            </span>
          </div>
          <div className="text-neutral-500 hidden sm:block font-heading">
            DATA SCIENCE CLUB · VIT BHOPAL
          </div>
        </div>

        {/* Center Content Box */}
        <div className="relative z-10 max-w-3xl mx-auto w-full space-y-8 my-auto">
          {/* Logos & Staggered Animated Title */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <img
                src="/DSClogo.png"
                alt="DSC Logo"
                className="h-8 w-auto object-contain filter drop-shadow-[0_0_10px_rgba(255,59,0,0.5)]"
              />
              <span className="text-neutral-600 text-sm">|</span>
              <img
                src="/origin-logo.png"
                alt="ORIGIN Logo"
                className="h-12 w-auto object-contain filter drop-shadow-[0_0_15px_rgba(255,59,0,0.8)]"
              />
            </div>

            {/* Main Animated Headline: "ORIGIN HACKATHON" */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-1 sm:gap-x-2 py-1">
              <div className="flex items-center">
                {letters.map((letter, index) => (
                  <motion.span
                    key={index}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.06,
                      ease: 'easeOut',
                    }}
                    className="font-display text-5xl sm:text-7xl uppercase tracking-tight text-[#FF3B00] drop-shadow-[0_0_20px_rgba(255,59,0,0.6)]"
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="font-display text-5xl sm:text-7xl uppercase tracking-tight text-white ml-2"
              >
                HACKATHON
              </motion.span>
            </div>

            <p className="text-xs text-neutral-400 tracking-widest uppercase font-sans">
              18-HOUR OVERNIGHT CODE FREEZE PROTOCOL
            </p>
          </div>

          {/* THE SIGNATURE BRUTALIST FIERY BLOCK LOADING BAR CONTAINER */}
          <div className="relative bg-[#111111] border border-[#262626] p-6 shadow-[0_0_30px_rgba(255,59,0,0.2)] space-y-4">
            {/* Corner tape graphic accents matching website theme */}
            <div className="tape-strip" />
            <div className="tape-strip-left" />

            {/* Status & Numeric Percentage */}
            <div className="flex justify-between items-end font-mono text-xs uppercase tracking-widest">
              <div className="text-neutral-300 flex items-center gap-2">
                <span className="text-[#FF3B00] font-bold">&gt;</span>
                {progress < 30 && 'INITIALIZING CORE MODULES...'}
                {progress >= 30 && progress < 70 && 'SYNCHRONIZING INNOVATION TRACKS...'}
                {progress >= 70 && progress < 100 && 'PREPARING VENUE SYSTEMS...'}
                {progress >= 100 && 'SYSTEM READY — WELCOME TO ORIGIN'}
              </div>
              <div className="font-display text-3xl text-[#FF3B00] tracking-wider drop-shadow-[0_0_12px_#FF3B00]">
                {String(progress).padStart(3, '0')}%
              </div>
            </div>

            {/* Segmented Block Progress Bar */}
            <div className="flex gap-1 sm:gap-1.5 p-2 bg-[#171717] border border-[#262626] rounded-none">
              {Array.from({ length: totalBlocks }).map((_, idx) => {
                const isFilled = idx < filledBlocks;
                return (
                  <div
                    key={idx}
                    className={`flex-1 h-6 sm:h-8 transition-colors duration-100 ${
                      isFilled
                        ? 'bg-[#FF3B00] shadow-[0_0_10px_#FF3B00]'
                        : 'bg-[#222222]'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Footer Metadata */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between border-t border-[#222222] pt-4 text-[11px] text-neutral-500 uppercase tracking-widest gap-2">
          <span>AB02 AUDITORIUM 1 & 2 · 4 SEP 6:00 PM – 5 SEP 12:00 PM</span>
          <span className="text-[#FF3B00] font-bold">EVALUATION BY SHERYIANS CODING ACADEMY</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

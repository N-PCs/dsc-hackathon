import React from 'react';

interface OriginLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const OriginLogo: React.FC<OriginLogoProps> = ({ size = 'md' }) => {
  const containerClasses = {
    sm: 'h-10 text-xl',
    md: 'h-16 text-3xl md:text-4xl',
    lg: 'h-36 text-6xl md:text-8xl',
  };

  const flareClasses = {
    sm: 'w-10 h-10 -left-3 -top-1 blur-md bg-[#FF2200]',
    md: 'w-16 h-16 -left-4 -top-1 blur-lg bg-[#FF2200]',
    lg: 'w-36 h-36 -left-8 -top-2 blur-2xl bg-[#FF1100] opacity-90',
  };

  const textStyle = {
    fontFamily: 'var(--font-heading)',
    letterSpacing: '0.04em',
    textShadow: size === 'lg' ? '5px 5px 0px #000000' : '2px 2px 0px #000000',
  };

  return (
    <div className={`relative flex items-center select-none ${containerClasses[size]}`}>
      {/* Red-orange solar lens flare behind the 'O' */}
      <div className={`absolute rounded-full pointer-events-none z-0 ${flareClasses[size]}`} />

      {/* The word ORIGIN */}
      <span
        style={textStyle}
        className="font-extrabold uppercase relative z-10 text-[#FF5F00]"
      >
        ORIGIN
      </span>
    </div>
  );
};

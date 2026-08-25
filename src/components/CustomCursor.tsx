import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export const CustomCursor = () => {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth springs for trailing outer ring
  const springConfig = { stiffness: 250, damping: 28 };
  const ringX = useSpring(cursorX, springConfig);
  const ringY = useSpring(cursorY, springConfig);

  // Soft spring config for lagging solar lens flare aura
  const auraSpringConfig = { stiffness: 90, damping: 18 };
  const auraX = useSpring(cursorX, auraSpringConfig);
  const auraY = useSpring(cursorY, auraSpringConfig);

  useEffect(() => {
    // Hide default cursor on desktop device detection
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    if (isMobile) {
      setVisible(false);
      return;
    }

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    const handleMouseEnter = () => {
      setVisible(true);
    };

    const handleMouseDown = () => {
      setClicked(true);
    };

    const handleMouseUp = () => {
      setClicked(false);
    };

    // Event delegation to detect hovering on clickable elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'A' ||
          target.tagName === 'BUTTON' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA' ||
          target.closest('a') ||
          target.closest('button') ||
          target.closest('[role="button"]') ||
          target.classList.contains('cursor-pointer'))
      ) {
        setHovered(true);
      }
    };

    const handleMouseOut = () => {
      setHovered(false);
    };

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [visible, cursorX, cursorY]);

  if (!visible) return null;

  return (
    <>
      {/* Solar lens flare aura (lagging blurred glow) */}
      <motion.div
        className="fixed top-0 left-0 w-16 h-16 rounded-full bg-[#FF2200] opacity-40 blur-[14px] z-[9998] pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{
          x: auraX,
          y: auraY,
          scale: hovered ? 1.7 : clicked ? 0.7 : 1,
        }}
      />
      {/* Outer ring (lagging spring-driven circle) */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-[#FF5F00] z-[9999] pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{
          x: ringX,
          y: ringY,
          scale: hovered ? 1.5 : clicked ? 0.8 : 1,
        }}
        animate={{
          borderColor: hovered ? '#FF8700' : '#FF5F00',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      />
      {/* Inner dot (follows mouse instantly) */}
      <motion.div
        className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full bg-[#FF5F00] z-[9999] pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{
          x: cursorX,
          y: cursorY,
        }}
        animate={{
          scale: hovered ? 0.6 : clicked ? 1.3 : 1,
          backgroundColor: hovered ? '#FFC599' : '#FF5F00',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      />
    </>
  );
};

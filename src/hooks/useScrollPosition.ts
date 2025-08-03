import { useState, useEffect } from 'react';

interface ScrollPosition {
  scrollY: number;
  scrollDirection: 'up' | 'down';
  isNearTop: boolean;
  isScrolled: boolean;
}

export const useScrollPosition = (threshold = 20) => {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    scrollY: 0,
    scrollDirection: 'down',
    isNearTop: true,
    isScrolled: false
  });

  useEffect(() => {
    let ticking = false;
    let lastScrollY = 0;

    const updateScrollPosition = () => {
      const scrollY = window.scrollY;
      const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';
      
      setScrollPosition({
        scrollY,
        scrollDirection,
        isNearTop: scrollY < threshold,
        isScrolled: scrollY > threshold
      });
      
      lastScrollY = scrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollPosition);
        ticking = true;
      }
    };

    // Set initial values
    updateScrollPosition();

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return scrollPosition;
};
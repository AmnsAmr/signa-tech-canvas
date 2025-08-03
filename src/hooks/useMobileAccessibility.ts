import { useEffect, useState } from 'react';
import { useIsMobile } from './use-mobile';

interface AccessibilitySettings {
  isMobile: boolean;
  reducedMotion: boolean;
  touchDevice: boolean;
  screenHeight: number;
}

export const useMobileAccessibility = () => {
  const isMobileDevice = useIsMobile();
  const [settings, setSettings] = useState<AccessibilitySettings>({
    isMobile: false,
    reducedMotion: false,
    touchDevice: false,
    screenHeight: 0
  });

  useEffect(() => {
    const updateSettings = () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const screenHeight = window.innerHeight;

      setSettings({
        isMobile: isMobileDevice,
        reducedMotion,
        touchDevice,
        screenHeight
      });
    };

    // Initial check
    updateSettings();

    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => updateSettings();
    
    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener('resize', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('resize', handleChange);
    };
  }, [isMobileDevice]);

  // Determine if we should show sticky header based on screen size
  const shouldUseCompactHeader = settings.screenHeight < 700 && settings.isMobile;
  
  // Determine optimal scroll threshold based on device
  const scrollThreshold = settings.isMobile ? 150 : 200;
  
  // Check if animations should be reduced
  const shouldReduceAnimations = settings.reducedMotion || (settings.isMobile && settings.screenHeight < 600);

  return {
    ...settings,
    shouldUseCompactHeader,
    scrollThreshold,
    shouldReduceAnimations
  };
};
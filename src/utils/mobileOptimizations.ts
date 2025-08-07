// Mobile-specific performance optimizations

// Detect mobile devices
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
};

// Reduce animations on mobile
export const shouldReduceAnimations = (): boolean => {
  return isMobile() || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Optimize touch interactions
export const optimizeTouchInteractions = () => {
  if (isMobile()) {
    // Add touch-action optimization to body
    document.body.style.touchAction = 'manipulation';
    
    // Disable hover effects on mobile
    const style = document.createElement('style');
    style.textContent = `
      @media (hover: none) and (pointer: coarse) {
        .hover\\:scale-105:hover,
        .hover\\:scale-110:hover,
        .group-hover\\:scale-105,
        .group-hover\\:scale-110 {
          transform: none !important;
        }
        
        .hover\\:shadow-glow:hover,
        .hover\\:shadow-pink:hover,
        .hover\\:shadow-strong:hover {
          box-shadow: none !important;
        }
        
        .animate-float,
        .animate-creative-spin,
        .animate-gradient-shift {
          animation: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// Optimize scroll performance
export const optimizeScrollPerformance = () => {
  // Use passive event listeners for better scroll performance
  let ticking = false;
  
  const updateScrollPosition = () => {
    // Update scroll-dependent elements here
    ticking = false;
  };
  
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollPosition);
      ticking = true;
    }
  };
  
  window.addEventListener('scroll', onScroll, { passive: true });
  
  return () => {
    window.removeEventListener('scroll', onScroll);
  };
};

// Preload critical resources
export const preloadCriticalResources = () => {
  // Skip preloading in development to avoid CORS issues with hardcoded URLs
  // Let the image cache and usePreloadCriticalImages hook handle this instead
  if (import.meta.env.DEV) {
    return;
  }
  
  const criticalImages = [
    '/uploads/Logo.png',
    '/uploads/hero-workshop.jpg',
    '/uploads/main_pic.jpg'
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  });
};

// Initialize all mobile optimizations
export const initMobileOptimizations = () => {
  if (typeof window !== 'undefined') {
    optimizeTouchInteractions();
    preloadCriticalResources();
    
    // Return cleanup function for scroll optimization
    return optimizeScrollPerformance();
  }
  
  return () => {};
};
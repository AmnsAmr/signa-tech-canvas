// Critical performance optimizations for mobile devices

// Remove unused CSS and optimize critical path
export const optimizeCriticalPath = () => {
  // Remove unused animations on mobile
  if (window.innerWidth <= 768) {
    const style = document.createElement('style');
    style.textContent = `
      * { animation: none !important; transition: none !important; }
      .mobile-transform { transition: transform 0.1s ease-out !important; }
      .perf-layer { contain: layout style paint; }
    `;
    document.head.appendChild(style);
  }
};

// Preload critical resources
export const preloadCritical = () => {
  const criticalImages = ['/uploads/Logo.png'];
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.fetchPriority = 'high';
    document.head.appendChild(link);
  });
};

// Optimize scroll performance
export const optimizeScroll = () => {
  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => { ticking = false; });
      ticking = true;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
};

// Initialize all optimizations
export const initPerformanceOptimizations = () => {
  optimizeCriticalPath();
  preloadCritical();
  optimizeScroll();
};
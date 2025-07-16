// Performance optimization utilities

// Debounce function to limit API calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function to limit function calls
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy loading for images
export const lazyLoadImage = (img: HTMLImageElement, src: string) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        img.src = src;
        observer.unobserve(img);
      }
    });
  });
  observer.observe(img);
};

// Preload critical images with enhanced options
export const preloadImage = (src: string, options: { fetchPriority?: 'high' | 'low' | 'auto' } = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    
    // Set fetchPriority if supported by the browser
    if ('fetchPriority' in img && options.fetchPriority) {
      (img as any).fetchPriority = options.fetchPriority;
    }
    
    img.src = src;
  });
};

// Preload multiple critical images
export const preloadImages = (sources: string[]): Promise<void[]> => {
  return Promise.all(sources.map(src => preloadImage(src, { fetchPriority: 'high' })));
};

// Add link preload to document head
export const addLinkPreload = (href: string, as: string): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  
  if (as === 'image') {
    link.setAttribute('fetchpriority', 'high');
  }
  
  document.head.appendChild(link);
};

// Memory cleanup for components
export const createCleanupRef = () => {
  const cleanupFunctions: (() => void)[] = [];
  
  const addCleanup = (fn: () => void) => {
    cleanupFunctions.push(fn);
  };
  
  const cleanup = () => {
    cleanupFunctions.forEach(fn => fn());
    cleanupFunctions.length = 0;
  };
  
  return { addCleanup, cleanup };
};
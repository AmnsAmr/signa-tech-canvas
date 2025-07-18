/**
 * Cache refresh utilities for immediate updates
 */

export const refreshImageCache = () => {
  // Clear browser cache for images API
  if ('caches' in window) {
    caches.delete('images-cache');
  }
  
  // Dispatch custom event to refresh all image hooks
  window.dispatchEvent(new CustomEvent('imagesUpdated'));
  
  // Force reload of image components
  window.dispatchEvent(new CustomEvent('forceImageRefresh'));
};

export const refreshAllCaches = () => {
  // Clear all browser caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  
  // Clear localStorage cache if any
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('image-cache-') || key.startsWith('api-cache-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Dispatch refresh events
  refreshImageCache();
};
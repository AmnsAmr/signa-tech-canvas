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

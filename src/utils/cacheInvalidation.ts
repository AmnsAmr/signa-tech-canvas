/**
 * Global cache invalidation utility for instant admin updates
 */

import { apiCache } from '@/api/cache';

class CacheInvalidation {
  // Clear all menu-related caches
  static clearMenuCache() {
    // Clear frontend API cache
    apiCache.invalidatePattern('menu');
    apiCache.invalidatePattern('category');
    apiCache.invalidatePattern('product');
    
    // Dispatch custom events to refresh components
    window.dispatchEvent(new CustomEvent('menuUpdated'));
    window.dispatchEvent(new CustomEvent('cacheInvalidated'));
  }

  // Clear specific product cache
  static clearProductCache(productId: string) {
    apiCache.delete(`product-${productId}`);
    apiCache.invalidatePattern(`product/${productId}`);
    
    // Dispatch product-specific update event
    window.dispatchEvent(new CustomEvent('productUpdated', { 
      detail: { productId } 
    }));
  }

  // Clear specific category cache
  static clearCategoryCache(categoryId: string) {
    apiCache.delete(`category-${categoryId}`);
    apiCache.invalidatePattern(`category/${categoryId}`);
    
    // Dispatch category-specific update event
    window.dispatchEvent(new CustomEvent('categoryUpdated', { 
      detail: { categoryId } 
    }));
  }

  // Clear all caches (nuclear option)
  static clearAllCache() {
    apiCache.clear();
    
    // Clear browser cache if available
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Dispatch global cache clear event
    window.dispatchEvent(new CustomEvent('allCacheCleared'));
  }

  // Force reload specific components
  static forceComponentReload(componentType: 'menu' | 'product' | 'category', id?: string) {
    const eventName = `force${componentType.charAt(0).toUpperCase() + componentType.slice(1)}Reload`;
    window.dispatchEvent(new CustomEvent(eventName, { 
      detail: id ? { id } : undefined 
    }));
  }
}

export default CacheInvalidation;
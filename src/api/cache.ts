import { CacheEntry } from './types';

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL, etag?: string): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      etag
    });
    
    // Auto cleanup after TTL
    setTimeout(() => this.delete(key), ttl);
  }

  get<T>(key: string, maxAge: number = this.DEFAULT_TTL): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > maxAge) {
      this.delete(key);
      return null;
    }
    
    return entry.data;
  }

  getWithEtag<T>(key: string, maxAge: number = this.DEFAULT_TTL): { data: T; etag?: string } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > maxAge) {
      this.delete(key);
      return null;
    }
    
    return { data: entry.data, etag: entry.etag };
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key);
      }
    }
  }
}

export const apiCache = new ApiCache();
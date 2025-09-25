import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/api/client';

interface ProjectSection {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
}

interface Project {
  id: number;
  section_id: number;
  title: string;
  description?: string;
  image_filename?: string;
  display_order: number;
  is_active: boolean;
}

// Global cache to prevent duplicate requests
const projectCache = new Map<string, any>();
const loadingStates = new Map<string, boolean>();
const cacheEnabled = import.meta.env.VITE_ENABLE_CACHE !== 'false';

export const useProjectCache = (type: 'sections' | 'projects', sectionId?: number) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Log cache status on first use
  useEffect(() => {
    console.log(`[useProjectCache] Cache ${cacheEnabled ? 'enabled' : 'disabled'}`);
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const cacheKey = type === 'sections' ? 'sections' : `projects:${sectionId}`;
    
    console.log(`[useProjectCache] Effect triggered for type: ${type}, sectionId: ${sectionId}`);
    console.log(`[useProjectCache] Cache key: ${cacheKey}`);
    
    // Check cache first (only if caching is enabled)
    if (cacheEnabled && projectCache.has(cacheKey)) {
      console.log(`[useProjectCache] Found cached data for ${cacheKey}`);
      setData(projectCache.get(cacheKey) || []);
      setLoading(false);
      return;
    }

    // Check if already loading
    if (cacheEnabled && loadingStates.get(cacheKey)) {
      console.log(`[useProjectCache] Already loading ${cacheKey}, waiting...`);
      const checkLoading = () => {
        if (!loadingStates.get(cacheKey) && projectCache.has(cacheKey)) {
          if (mountedRef.current) {
            setData(projectCache.get(cacheKey) || []);
            setLoading(false);
          }
        } else {
          setTimeout(checkLoading, 100);
        }
      };
      checkLoading();
      return;
    }

    console.log(`[useProjectCache] Starting fetch for ${cacheKey}`);
    fetchData(cacheKey);

    // Listen for cache updates
    const handleProjectUpdate = () => {
      console.log('Projects updated event received, clearing cache and refetching');
      // Clear all project cache when projects are updated
      projectCache.clear();
      loadingStates.clear();
      // Force immediate refetch
      setLoading(true);
      setTimeout(() => fetchData(cacheKey), 100);
    };
    
    window.addEventListener('projectsUpdated', handleProjectUpdate);
    return () => window.removeEventListener('projectsUpdated', handleProjectUpdate);
  }, [type, sectionId]);

  const fetchData = async (cacheKey: string) => {
    if (loadingStates.get(cacheKey)) return;
    
    try {
      loadingStates.set(cacheKey, true);
      setLoading(true);
      
      let endpoint: string;
      if (type === 'sections') {
        endpoint = '/api/projects/sections';
      } else {
        endpoint = `/api/projects/sections/${sectionId}/projects`;
      }
      
      console.log(`[useProjectCache] Fetching data for type: ${type}`);
      console.log(`[useProjectCache] Endpoint: ${endpoint}`);
      console.log(`[useProjectCache] Cache key: ${cacheKey}`);
      console.log(`[useProjectCache] Full URL will be: ${apiClient.buildUrl(endpoint)}`);
      
      const response = await apiClient.get<any[]>(endpoint, cacheKey);
      console.log(`[useProjectCache] API response:`, response);
      
      if (response.success && response.data) {
        console.log(`[useProjectCache] Successfully fetched ${response.data.length} items:`, response.data);
        if (cacheEnabled) {
          projectCache.set(cacheKey, response.data);
        }
        
        if (mountedRef.current) {
          setData(response.data);
          setError(null);
        }
      } else {
        console.error(`[useProjectCache] API call failed:`, response.error);
        if (mountedRef.current) {
          setError(response.error || 'Failed to fetch data');
        }
      }
    } catch (err) {
      console.error(`[useProjectCache] Exception caught:`, err);
      if (mountedRef.current) {
        setError('Network error');
      }
    } finally {
      loadingStates.set(cacheKey, false);
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  return { data, loading, error };
};

export default useProjectCache;
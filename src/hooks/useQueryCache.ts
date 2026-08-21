import { useState, useEffect, useCallback, useRef } from 'react';
import { globalCache } from '@/src/lib/cacheManager';

interface QueryOptions {
  enabled?: boolean;
  ttl?: number;
}

export function useQueryCache<T>(key: string, fetcher: () => Promise<T>, options?: QueryOptions) {
  const enabled = options?.enabled !== false;
  
  // Init state from cache if available
  const [data, setData] = useState<T | null>(() => globalCache.get(key) as T | null);
  const [isLoading, setIsLoading] = useState(!globalCache.get(key) && enabled);
  const [error, setError] = useState<Error | null>(null);

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const executeFetch = useCallback(async (force = false) => {
    if (!enabled) return;
    
    // If not forced, check cache
    if (!force) {
      const cached = globalCache.get(key);
      if (cached) {
        setData(cached as T);
        setIsLoading(false);
        return;
      }
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await fetcherRef.current();
      globalCache.set(key, res, options?.ttl);
      setData(res);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [key, enabled, options?.ttl]);

  // Subscribe to cache changes (e.g. from optimistic updates or other components)
  useEffect(() => {
    const unsubscribe = globalCache.subscribe(key, (newData) => {
      if (newData === undefined) {
        // Invalidation triggered, refetch
        executeFetch(true);
      } else {
        // Cache updated directly
        setData(newData);
      }
    });
    
    return unsubscribe;
  }, [key, executeFetch]);

  // Initial fetch
  useEffect(() => {
    executeFetch();
  }, [executeFetch]);

  return { data, isLoading, error, refetch: () => executeFetch(true) };
}

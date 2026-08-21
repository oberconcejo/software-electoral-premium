export type CacheKey = string;
export type Listener = (data: any) => void;

export interface CacheEntry {
  data: any;
  timestamp: number;
}

export class CacheManager {
  private cache = new Map<CacheKey, CacheEntry>();
  private listeners = new Map<CacheKey, Set<Listener>>();
  
  // 5 minutes default TTL
  private defaultTTL = 5 * 60 * 1000;

  get(key: CacheKey): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check TTL
    if (Date.now() - entry.timestamp > this.defaultTTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(key: CacheKey, data: any, ttl?: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    this.notify(key, data);
  }

  updateOptimistic(key: CacheKey, updater: (oldData: any) => any) {
    const current = this.get(key);
    if (current !== null) {
      const newData = updater(current);
      this.set(key, newData);
    }
  }

  invalidate(key: CacheKey) {
    this.cache.delete(key);
    this.notify(key, undefined); 
  }

  invalidatePrefix(prefix: string) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.invalidate(key);
      }
    }
  }

  // Helper for realtime list updates
  updateListItem(keyPrefix: string, payload: any, idField: string = 'id') {
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        const entry = this.cache.get(key);
        if (entry && Array.isArray(entry.data)) {
          const newData = entry.data.map(item => 
            item[idField] === payload[idField] ? { ...item, ...payload } : item
          );
          // Only update if it actually changed
          if (newData.some((item, i) => item !== entry.data[i])) {
            this.set(key, newData);
          }
        }
      }
    }
  }

  deleteListItem(keyPrefix: string, payloadId: any, idField: string = 'id') {
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        const entry = this.cache.get(key);
        if (entry && Array.isArray(entry.data)) {
          const newData = entry.data.filter(item => item[idField] !== payloadId);
          if (newData.length !== entry.data.length) {
            this.set(key, newData);
          }
        }
      }
    }
  }

  upsertListItem(keyPrefix: string, payload: any, idField: string = 'id') {
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        const entry = this.cache.get(key);
        if (entry && Array.isArray(entry.data)) {
          const exists = entry.data.find(item => item[idField] === payload[idField]);
          if (exists) {
            const newData = entry.data.map(item => 
              item[idField] === payload[idField] ? { ...item, ...payload } : item
            );
            this.set(key, newData);
          } else {
            // Unshift new item (assumes most recent first, or frontend will sort)
            this.set(key, [payload, ...entry.data]);
          }
        }
      }
    }
  }

  subscribe(key: CacheKey, listener: Listener) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);
    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  private notify(key: CacheKey, data: any) {
    if (this.listeners.has(key)) {
      this.listeners.get(key)!.forEach(listener => listener(data));
    }
  }
}

export const globalCache = new CacheManager();

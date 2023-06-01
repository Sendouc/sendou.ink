import type { CacheEntry } from "cachified";
import LRUCache from "lru-cache";

declare global {
  // This preserves the LRU cache during development
  // eslint-disable-next-line
  var __lruCache: LRUCache<string, CacheEntry<unknown>> | undefined;
}

export const cache = (global.__lruCache = global.__lruCache
  ? global.__lruCache
  : new LRUCache<string, CacheEntry<unknown>>({ max: 5000 }));

export const ttl = (ms: number) =>
  process.env.NODE_ENV === "production" ? ms : 0;

export function syncCached<T>(key: string, getFreshValue: () => T) {
  if (cache.has(key)) {
    return cache.get(key) as T;
  }

  const value = getFreshValue();
  cache.set(key, value as any);

  return value;
}

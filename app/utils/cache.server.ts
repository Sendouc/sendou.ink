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

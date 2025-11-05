/**
 * Data Cache Service
 * Simple in-memory cache with TTL support
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

class DataCache {
    private cache = new Map<string, CacheEntry<unknown>>();
    private readonly defaultTTL = 24 * 60 * 60 * 1000; // 24 hours

    /**
     * Store data in cache with optional TTL
     */
    set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttl,
        });
    }

    /**
     * Retrieve data from cache if not expired
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Clear all cached data
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Clear specific cache entry
     */
    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    /**
     * Check if key exists and is not expired
     */
    has(key: string): boolean {
        return this.get(key) !== null;
    }

    /**
     * Get cache size
     */
    get size(): number {
        // Clean expired entries first
        for (const [key, entry] of this.cache.entries()) {
            if (Date.now() > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
        return this.cache.size;
    }

    /**
     * Get cache statistics
     */
    getStats(): {
        totalEntries: number;
        expiredEntries: number;
        activeEntries: number;
    } {
        let expired = 0;
        const now = Date.now();

        for (const entry of this.cache.values()) {
            if (now > entry.expiresAt) expired++;
        }

        return {
            totalEntries: this.cache.size,
            expiredEntries: expired,
            activeEntries: this.cache.size - expired,
        };
    }
}

// Global cache instance
export const dataCache = new DataCache();

/**
 * Wrapper function to fetch data with automatic caching
 * @param key Cache key
 * @param fetcher Function to fetch data if not in cache
 * @param ttl Time to live in milliseconds (optional)
 */
export async function fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
): Promise<T> {
    // Check cache first
    const cached = dataCache.get<T>(key);
    if (cached !== null) {
        console.log(`[Cache] Hit: ${key}`);
        return cached;
    }

    // Fetch data
    console.log(`[Cache] Miss: ${key}`);
    const data = await fetcher();

    // Store in cache
    dataCache.set(key, data, ttl);

    return data;
}

/**
 * Clear cache entries matching a pattern
 */
export function clearCacheByPattern(pattern: string): number {
    let cleared = 0;
    const regex = new RegExp(pattern);

    for (const key of Array.from(dataCache["cache"].keys())) {
        if (regex.test(key)) {
            dataCache.delete(key);
            cleared++;
        }
    }

    console.log(`[Cache] Cleared ${cleared} entries matching "${pattern}"`);
    return cleared;
}

/**
 * Preload data into cache
 */
export async function preloadCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
): Promise<void> {
    if (!dataCache.has(key)) {
        await fetchWithCache(key, fetcher, ttl);
    }
}

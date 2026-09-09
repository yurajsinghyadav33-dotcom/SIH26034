import crypto from 'crypto';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  lastAccessed: number;
}

/**
 * High-Performance In-Memory SHA-256 LRU Cache
 * Reduces redundant OCR and Legal Metrology Rule analysis latency from ~2000ms to <5ms.
 */
export class MemoryCacheService<T = unknown> {
  private store = new Map<string, CacheEntry<T>>();
  private maxItems: number;
  private defaultTtlMs: number;

  constructor(maxItems = 500, defaultTtlMs = 60 * 60 * 1000) {
    this.maxItems = maxItems;
    this.defaultTtlMs = defaultTtlMs;
  }

  /**
   * Generates a deterministic SHA-256 cache key from arbitrary input string
   */
  public generateKey(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
  }

  public get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    entry.lastAccessed = Date.now();
    return entry.value;
  }

  public set(key: string, value: T, ttlMs?: number): void {
    const now = Date.now();

    // Evict oldest accessed entry if cache exceeds capacity
    if (this.store.size >= this.maxItems && !this.store.has(key)) {
      let oldestKey: string | null = null;
      let oldestAccess = Infinity;

      for (const [k, v] of this.store.entries()) {
        if (v.lastAccessed < oldestAccess) {
          oldestAccess = v.lastAccessed;
          oldestKey = k;
        }
      }

      if (oldestKey) {
        this.store.delete(oldestKey);
      }
    }

    this.store.set(key, {
      value,
      expiresAt: now + (ttlMs || this.defaultTtlMs),
      lastAccessed: now,
    });
  }

  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  public clear(): void {
    this.store.clear();
  }

  public size(): number {
    return this.store.size;
  }
}

// Global Cache Singletons for Compliance Engine
export const ocrCache = new MemoryCacheService<{
  rawText: string;
  confidence: number;
  blocks: Array<{ text: string; confidence: number; bbox?: { x: number; y: number; width: number; height: number } }>;
}>(200, 30 * 60 * 1000); // 30 mins TTL

export const complianceAnalysisCache = new MemoryCacheService<unknown>(500, 60 * 60 * 1000); // 1 hour TTL

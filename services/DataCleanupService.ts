/**
 * DataCleanupService
 * Automatically purges stale cache entries, temporary UI states,
 * and validates critical persistent data in localStorage upon app initialization.
 * Prevents localStorage bloat and state corruption over time.
 */

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl?: number; // Time-to-live in ms
}

class DataCleanupServiceImpl {
  private readonly CLEANUP_TIMESTAMP_KEY = 'nexus_last_data_cleanup_timestamp';
  private readonly CLEANUP_INTERVAL_MS = 1000 * 60 * 30; // 30 minutes minimum between full sweeps
  private readonly MAX_CACHE_AGE_MS = 1000 * 60 * 60 * 24 * 3; // 3 days for general cache

  /**
   * Initializes data cleanup routine. Called when app boots.
   */
  public init(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      this.runPeriodicCleanup();
      this.sanitizeCorruptedStates();
      this.purgeTransientUIKeys();
    } catch (err) {
      console.warn('[DataCleanupService] Error during storage hygiene sweep:', err);
    }
  }

  /**
   * Runs periodic storage hygiene if threshold interval has passed
   */
  private runPeriodicCleanup(): void {
    const now = Date.now();
    const lastCleanupStr = localStorage.getItem(this.CLEANUP_TIMESTAMP_KEY);
    const lastCleanup = lastCleanupStr ? parseInt(lastCleanupStr, 10) : 0;

    if (now - lastCleanup < this.CLEANUP_INTERVAL_MS) {
      return; // Already cleaned up recently
    }

    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // Check temporary cache prefixes
      if (key.startsWith('nexus_cache_') || key.startsWith('temp_') || key.startsWith('cache_')) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw) as CacheEntry;
            if (parsed && typeof parsed.timestamp === 'number') {
              const ttl = parsed.ttl || this.MAX_CACHE_AGE_MS;
              if (now - parsed.timestamp > ttl) {
                keysToRemove.push(key);
              }
            }
          }
        } catch (_) {
          // If unparseable cache key, mark for removal
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (_) {}
    });

    localStorage.setItem(this.CLEANUP_TIMESTAMP_KEY, now.toString());
  }

  /**
   * Cleans ephemeral session UI flags that shouldn't persist across restarts
   */
  private purgeTransientUIKeys(): void {
    const transientKeys = [
      'nexus_transient_toast',
      'nexus_temp_call_session',
      'nexus_active_modal_temp',
      'nexus_incoming_call_ring_active',
      'nexus_upload_progress_temp',
    ];

    transientKeys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (_) {}
    });
  }

  /**
   * Validates critical stored objects (streak, settings, tasks).
   * If any corrupted/invalid JSON is found, heals it to safe defaults.
   */
  private sanitizeCorruptedStates(): void {
    const criticalKeys = [
      'nexus_daily_login_streak',
      'nexus_audio_settings',
      'nexus_gaming_tasks',
      'nexus_gamertag_user',
    ];

    criticalKeys.forEach((key) => {
      const val = localStorage.getItem(key);
      if (val !== null) {
        try {
          JSON.parse(val);
        } catch (_) {
          console.warn(`[DataCleanupService] Healing corrupted entry for ${key}`);
          localStorage.removeItem(key);
        }
      }
    });
  }
}

export const DataCleanupService = new DataCleanupServiceImpl();
export default DataCleanupService;

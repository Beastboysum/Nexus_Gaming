import { VideoPost } from '../../types';

export interface CachedVideoMetadata {
  id: string;
  title: string;
  thumbnail: string;
  highResThumbnail: string;
  author: string;
  authorAvatar?: string;
  duration: string;
  views: string;
  category: string;
  sourceType?: 'youtube' | 'twitch' | 'direct';
  youtubeId?: string;
  twitchChannel?: string;
  cachedAt: number;
}

export interface WatchHistoryItem {
  id: string;
  video: VideoPost;
  watchedAt: number;
  progressSeconds: number;
  durationSeconds: number;
  progressPercent: number;
}

export interface TaskRecord {
  id: string;
  title: string;
  category: 'Daily Login' | 'Social Engagement' | 'Stream Performance';
  xp: number;
  coins: number;
  completed: boolean;
  type: 'daily' | 'weekly';
  description?: string;
}

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  rarity: 'rare' | 'epic' | 'legendary';
  category: string;
  price: number;
  unlocked: boolean;
  equipped: boolean;
  iconName: string;
}

const DB_NAME = 'nexus_gaming_cache_v2';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

const getDB = (): Promise<IDBDatabase> => {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Video metadata store
      if (!db.objectStoreNames.contains('video_metadata')) {
        const videoStore = db.createObjectStore('video_metadata', { keyPath: 'id' });
        videoStore.createIndex('category', 'category', { unique: false });
        videoStore.createIndex('cachedAt', 'cachedAt', { unique: false });
      }

      // 2. Watch history store
      if (!db.objectStoreNames.contains('watch_history')) {
        const historyStore = db.createObjectStore('watch_history', { keyPath: 'id' });
        historyStore.createIndex('watchedAt', 'watchedAt', { unique: false });
      }

      // 3. User Gamification store (tasks, coins, badges)
      if (!db.objectStoreNames.contains('gamification_store')) {
        db.createObjectStore('gamification_store', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onerror = () => {
      console.warn('IndexedDB failed to open, falling back to in-memory/localStorage');
      reject(request.error);
    };
  });
};

/**
 * Cache single video metadata into IndexedDB
 */
export async function cacheVideo(video: VideoPost): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('video_metadata', 'readwrite');
    const store = tx.objectStore('video_metadata');
    const record: CachedVideoMetadata = {
      id: video.id,
      title: video.title,
      thumbnail: video.thumbnail,
      highResThumbnail: (video as any).highResThumbnail || video.thumbnail,
      author: video.author,
      authorAvatar: (video as any).authorAvatar || video.channelAvatar,
      duration: video.duration,
      views: video.views,
      category: video.category || 'Gaming',
      sourceType: video.sourceType,
      youtubeId: video.youtubeId,
      twitchChannel: video.twitchChannel,
      cachedAt: Date.now(),
    };
    store.put(record);
  } catch (err) {
    console.debug('Failed to cache video metadata in IndexedDB:', err);
  }
}

/**
 * Batch cache videos
 */
export async function cacheVideosBatch(videos: VideoPost[]): Promise<void> {
  if (!videos || videos.length === 0) return;
  try {
    const db = await getDB();
    const tx = db.transaction('video_metadata', 'readwrite');
    const store = tx.objectStore('video_metadata');
    const now = Date.now();
    for (const v of videos) {
      const record: CachedVideoMetadata = {
        id: v.id,
        title: v.title,
        thumbnail: v.thumbnail,
        highResThumbnail: (v as any).highResThumbnail || v.thumbnail,
        author: v.author,
        authorAvatar: (v as any).authorAvatar || v.channelAvatar,
        duration: v.duration,
        views: v.views,
        category: v.category || 'Gaming',
        sourceType: v.sourceType,
        youtubeId: v.youtubeId,
        twitchChannel: v.twitchChannel,
        cachedAt: now,
      };
      store.put(record);
    }
  } catch (err) {
    console.debug('Failed to batch cache videos:', err);
  }
}

/**
 * Retrieve cached videos
 */
export async function getCachedVideos(limit?: number): Promise<CachedVideoMetadata[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('video_metadata', 'readonly');
      const store = tx.objectStore('video_metadata');
      const request = store.getAll();
      request.onsuccess = () => {
        const res = (request.result as CachedVideoMetadata[]) || [];
        // Sort by cachedAt descending
        const sorted = res.sort((a, b) => b.cachedAt - a.cachedAt);
        resolve(typeof limit === 'number' ? sorted.slice(0, limit) : sorted);
      };
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/**
 * Watch History Management
 */
export async function recordWatchHistory(
  video: VideoPost,
  progressSeconds = 0,
  durationSeconds = 0
): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('watch_history', 'readwrite');
    const store = tx.objectStore('watch_history');
    
    const progressPercent = durationSeconds > 0 
      ? Math.min(100, Math.round((progressSeconds / durationSeconds) * 100))
      : 35; // Default sensible resume preview

    const item: WatchHistoryItem = {
      id: video.id,
      video,
      watchedAt: Date.now(),
      progressSeconds,
      durationSeconds,
      progressPercent,
    };
    store.put(item);

    // Also dispatch a custom window event for instant reactive UI updates
    window.dispatchEvent(new CustomEvent('nexus_watch_history_updated', { detail: item }));
  } catch (err) {
    console.debug('Failed to record watch history:', err);
  }
}

export async function getWatchHistory(limit?: number): Promise<WatchHistoryItem[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('watch_history', 'readonly');
      const store = tx.objectStore('watch_history');
      const request = store.getAll();
      request.onsuccess = () => {
        const items = (request.result as WatchHistoryItem[]) || [];
        const sorted = items.sort((a, b) => b.watchedAt - a.watchedAt);
        resolve(typeof limit === 'number' ? sorted.slice(0, limit) : sorted);
      };
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function clearWatchHistory(): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('watch_history', 'readwrite');
    const store = tx.objectStore('watch_history');
    store.clear();
    window.dispatchEvent(new CustomEvent('nexus_watch_history_cleared'));
  } catch (err) {
    console.debug('Failed to clear watch history:', err);
  }
}

export async function removeWatchHistoryItem(id: string): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('watch_history', 'readwrite');
    const store = tx.objectStore('watch_history');
    store.delete(id);
    window.dispatchEvent(new CustomEvent('nexus_watch_history_updated'));
  } catch (err) {
    console.debug('Failed to delete history item:', err);
  }
}

/**
 * Gamification Storage (Coins, Badges, Tasks)
 */
export async function getGamificationData<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('gamification_store', 'readonly');
      const store = tx.objectStore('gamification_store');
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result && req.result.value !== undefined) {
          resolve(req.result.value as T);
        } else {
          resolve(defaultValue);
        }
      };
      req.onerror = () => resolve(defaultValue);
    });
  } catch {
    return defaultValue;
  }
}

export async function saveGamificationData<T>(key: string, value: T): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('gamification_store', 'readwrite');
    const store = tx.objectStore('gamification_store');
    store.put({ key, value });
  } catch (err) {
    console.debug('Failed to save gamification data:', err);
  }
}

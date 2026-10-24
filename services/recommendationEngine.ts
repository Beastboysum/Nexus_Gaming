import { VideoPost, ScoredVideo, UserTasteProfile } from '../types';

const STORAGE_KEY = 'nexus_user_taste_profile_v2';

export const VIDEO_CATALOG: VideoPost[] = [
  {
    id: 'vid-minecraft-treehouse',
    title: 'I Built THE ULTIMATE TREE HOUSE in Minecraft Hardcore (#96)',
    author: 'Farzy',
    views: '4.4M',
    duration: '19:28',
    category: 'Minecraft',
    tags: ['Minecraft', 'Building', 'Survival', 'Kids', 'Creative', 'Adventure'],
    kidFriendly: true,
    thumbnail: 'https://i.ytimg.com/vi/YiiHhT7NdGk/maxresdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=101',
    description: 'We built the biggest treehouse kingdom ever seen in Minecraft hardcore! Complete with zip lines, automatic farms, and secret rooms.',
    likes: 245000,
    sourceType: 'youtube',
    youtubeId: 'YiiHhT7NdGk',
    videoUrl: 'https://www.youtube.com/watch?v=YiiHhT7NdGk'
  },
  {
    id: 'vid-roblox-1',
    title: "LAVA BARRY'S PRISON RUN Escape In Roblox (New Scary Obby)",
    author: 'Lovely Boss',
    views: '1.6M',
    duration: '15:03',
    category: 'Roblox',
    tags: ['Roblox', 'Obby', 'Funny', 'Multiplayer', 'Kids', 'Challenge'],
    kidFriendly: true,
    thumbnail: 'https://i.ytimg.com/vi/R3Eos53EsfE/maxresdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=102',
    description: 'Can we beat 100 levels of crazy rainbow obstacles before the lava catches us? Watch till the end for the secret rainbow jetpack!',
    likes: 180000,
    sourceType: 'youtube',
    youtubeId: 'R3Eos53EsfE',
    videoUrl: 'https://www.youtube.com/watch?v=R3Eos53EsfE'
  },
  {
    id: 'vid-mario-1',
    title: 'Super Mario Bros Wonder - All Wonder Flowers',
    author: 'packattack04082',
    views: '1.4M',
    duration: '1:17:39',
    category: 'Nintendo',
    tags: ['Mario', 'Nintendo', 'Secrets', 'Kids', 'Fun', 'Platformer'],
    kidFriendly: true,
    thumbnail: 'https://i.ytimg.com/vi/9lvnlGiJGUQ/maxresdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=103',
    description: 'Every secret wonder seed location unlocked with Elephant Mario and Yoshi! Super fun guide for all ages.',
    likes: 112000,
    sourceType: 'youtube',
    youtubeId: '9lvnlGiJGUQ',
    videoUrl: 'https://www.youtube.com/watch?v=9lvnlGiJGUQ'
  },
  {
    id: 'vid-pokemon-1',
    title: 'VGC Day 1 | 2027 Pokémon Regional Championships',
    author: 'The Official Pokémon YouTube channel',
    views: '2.4M',
    duration: '9:04:47',
    category: 'Pokemon',
    tags: ['Pokemon', 'Nintendo', 'Adventure', 'Kids', 'Collecting', 'Challenge'],
    kidFriendly: true,
    thumbnail: 'https://i.ytimg.com/vi/87ruoF7dg-E/maxresdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=104',
    description: 'The highest-level Pokémon tournament matches with live professional commentary and championship tactics.',
    likes: 165000,
    sourceType: 'youtube',
    youtubeId: '87ruoF7dg-E',
    videoUrl: 'https://www.youtube.com/watch?v=87ruoF7dg-E'
  },
  {
    id: 'vid-rocketleague-1',
    title: 'ROCKET LEAGUE BEST OF INSANITY (BEST GOALS, FREESTYLES)',
    author: 'ROCKET LEAGUE FX',
    views: '1.5M',
    duration: '14:31',
    category: 'Sports & Fun',
    tags: ['Rocket League', 'Goals', 'Cars', 'Kids', 'Multiplayer', 'Highlights'],
    kidFriendly: true,
    thumbnail: 'https://i.ytimg.com/vi/9eOUDbbePII/maxresdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=105',
    description: 'Incredible flips, ceiling resets, and buzzer beaters set to high-energy upbeat music.',
    likes: 98000,
    sourceType: 'youtube',
    youtubeId: '9eOUDbbePII',
    videoUrl: 'https://www.youtube.com/watch?v=9eOUDbbePII'
  },
  {
    id: 'vid-fallguys-1',
    title: 'WINNING EVERY GAME of Fall Guys! Winstreak WORLD RECORD!?',
    author: 'SypherPK',
    views: '1.7M',
    duration: '15:23',
    category: 'Party Games',
    tags: ['Fall Guys', 'Funny Moments', 'Kids', 'Multiplayer', 'Obstacles'],
    kidFriendly: true,
    thumbnail: 'https://i.ytimg.com/vi/chwlp3grb28/maxresdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=106',
    description: 'World record win streak across slime climb, hex-a-gone, and door dash with the funniest gameplay!',
    likes: 74000,
    sourceType: 'youtube',
    youtubeId: 'chwlp3grb28',
    videoUrl: 'https://www.youtube.com/watch?v=chwlp3grb28'
  },
  {
    id: 'vid-minecraft-trailer',
    title: 'Official Minecraft Trailer & Building Showcase',
    author: 'Minecraft',
    views: '160M',
    duration: '02:00',
    category: 'Creative Builds',
    tags: ['Minecraft', 'Creative', 'Building', 'Kids', 'Official', 'Fun'],
    kidFriendly: true,
    thumbnail: 'https://i.ytimg.com/vi/MmB9b5njVbA/maxresdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=107',
    description: 'Explore infinite worlds and build everything from the simplest of homes to the grandest of castles.',
    likes: 3100000,
    sourceType: 'youtube',
    youtubeId: 'MmB9b5njVbA',
    videoUrl: 'https://www.youtube.com/watch?v=MmB9b5njVbA'
  },
  {
    id: 'vid-minecraft-speedrun',
    title: 'I Survived 1000 Days in Minecraft Hardcore [MOVIE]',
    author: 'halvetone',
    views: '2.8M',
    duration: '2:44:24',
    category: 'Minecraft',
    tags: ['Minecraft', 'Hardcore', 'Survival', '1000 Days', 'Adventure'],
    kidFriendly: true,
    thumbnail: 'https://i.ytimg.com/vi/3n72DQR6WKk/maxresdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=108',
    description: 'The complete cinematic saga of 1,000 consecutive days survived in Minecraft hardcore difficulty.',
    likes: 215000,
    sourceType: 'youtube',
    youtubeId: '3n72DQR6WKk',
    videoUrl: 'https://www.youtube.com/watch?v=3n72DQR6WKk'
  },
  {
    id: 'vid-twitch-minecraft',
    title: 'Minecraft Championship Creator Live Stream Showcase',
    author: 'Minecraft',
    views: '1.2M',
    duration: 'LIVE',
    category: 'Minecraft',
    tags: ['Minecraft', 'Live Stream', 'Twitch', 'Kids', 'Tournament'],
    kidFriendly: true,
    isLive: true,
    thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_minecraft-1280x720.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=120',
    description: 'Official live broadcast showcasing world-class builder creations, mini-games, and survival challenges.',
    likes: 195000,
    sourceType: 'twitch',
    twitchChannel: 'minecraft',
    videoUrl: 'https://twitch.tv/minecraft'
  },
  {
    id: 'vid-valorant-pro',
    title: 'The VALORANT Ultimate Guide for Beginners !! | SEN TenZ',
    author: 'TenZ',
    views: '4.2M',
    duration: '23:04',
    category: 'Esports',
    tags: ['Valorant', 'Esports', 'Aim', 'Competitive', 'Pro Guide'],
    kidFriendly: false,
    thumbnail: 'https://i.ytimg.com/vi/3xjpx8-2gD0/maxresdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=109',
    description: 'Daily aim routine, mouse sensitivity calibration, and micro-adjustments for radiant lobby dominations.',
    likes: 340000,
    sourceType: 'youtube',
    youtubeId: '3xjpx8-2gD0',
    videoUrl: 'https://www.youtube.com/watch?v=3xjpx8-2gD0'
  },
  {
    id: 'vid-twitch-riot',
    title: 'Riot Games World Championship Live Broadcast Stream',
    author: 'Riot Games',
    views: '890K',
    duration: 'LIVE',
    category: 'Esports',
    tags: ['Esports', 'Twitch', 'Live Stream', 'Tournament', 'Pro'],
    kidFriendly: false,
    isLive: true,
    thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_riotgames-1280x720.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=121',
    description: 'Direct Twitch stream of world-class pro tournament matches with live commentary, instant replays, and crowd audio.',
    likes: 410000,
    sourceType: 'twitch',
    twitchChannel: 'riotgames',
    videoUrl: 'https://twitch.tv/riotgames'
  },
  {
    id: 'vid-twitch-tarik',
    title: 'Tarik Pro Watch Party & Ranked High-ELO Matchmaking',
    author: 'Tarik',
    views: '1.4M',
    duration: 'LIVE',
    category: 'Valorant',
    tags: ['Valorant', 'Live Stream', 'Twitch', 'Watch Party', 'FPS'],
    kidFriendly: false,
    isLive: true,
    thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_tarik-1280x720.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=122',
    description: 'Non-stop competitive gameplay, high-energy reactions, and match breakdowns live on Twitch.',
    likes: 290000,
    sourceType: 'twitch',
    twitchChannel: 'tarik',
    videoUrl: 'https://twitch.tv/tarik'
  },
  {
    id: 'vid-mrbeast-squid',
    title: '$456,000 Squid Game In Real Life!',
    author: 'MrBeast',
    views: '650M',
    duration: '25:41',
    category: 'Entertainment',
    tags: ['MrBeast', 'Challenge', 'Gaming', 'Squid Game'],
    kidFriendly: true,
    thumbnail: 'https://i.ytimg.com/vi/0e3GPea1Tyg/maxresdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=125',
    description: '456 people compete for $456,000 in the most viral real life challenge game ever made.',
    likes: 18000000,
    sourceType: 'youtube',
    youtubeId: '0e3GPea1Tyg',
    videoUrl: 'https://www.youtube.com/watch?v=0e3GPea1Tyg'
  },
  {
    id: 'vid-eldenring-dlc',
    title: 'What Boss Order to BEAT the Shadow of the Erdtree DLC ► Elden Ring',
    author: 'ConCon',
    views: '3.1M',
    duration: '32:37',
    category: 'RPG & Action',
    tags: ['Elden Ring', 'Boss Fight', 'Secrets', 'Action', 'Lore'],
    kidFriendly: false,
    thumbnail: 'https://i.ytimg.com/vi/qXKvuRw-4R0/maxresdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=110',
    description: 'Detailed walkthrough of the hardest hidden encounters and fragments in the Realm of Shadow.',
    likes: 290000,
    sourceType: 'youtube',
    youtubeId: 'qXKvuRw-4R0',
    videoUrl: 'https://www.youtube.com/watch?v=qXKvuRw-4R0'
  },
  {
    id: 'vid-hardware-build',
    title: 'We Built the BEST PC - Ultimate Gaming Setup',
    author: 'Linus Tech Tips',
    views: '4.5M',
    duration: '13:43',
    category: 'Hardware',
    tags: ['PC Build', 'Setup', 'Tech', 'Desk Setup', 'RGB'],
    kidFriendly: true,
    thumbnail: 'https://i.ytimg.com/vi/X8sgBpmdCT8/maxresdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=111',
    description: 'Cable management tricks, ultra-wide OLED monitor, and silent liquid cooling assembly.',
    likes: 145000,
    sourceType: 'youtube',
    youtubeId: 'X8sgBpmdCT8',
    videoUrl: 'https://www.youtube.com/watch?v=X8sgBpmdCT8'
  },
  {
    id: 'vid-cs2-launch',
    title: 'Counter-Strike 2 - Official Launch Trailer & Highlights',
    author: 'GameSpot',
    views: '5.6M',
    duration: '13:55',
    category: 'Esports',
    tags: ['CS2', 'CounterStrike', 'Esports', 'Highlights', 'FPS'],
    kidFriendly: false,
    thumbnail: 'https://i.ytimg.com/vi/c80dVYcL69E/maxresdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=112',
    description: 'Dynamic volumetric smokes, sub-tick precision, and upgraded Premier mode gameplay in CS2.',
    likes: 420000,
    sourceType: 'youtube',
    youtubeId: 'c80dVYcL69E',
    videoUrl: 'https://www.youtube.com/watch?v=c80dVYcL69E'
  },
  {
    id: 'vid-vct-grandfinal',
    title: 'LOUD vs. VIT — FULL MATCH — VALORANT Champions Shanghai',
    author: 'VALORANT Champions Tour',
    views: '1.5M',
    duration: '2:22:01',
    category: 'Valorant',
    tags: ['Valorant', 'VCT', 'Tournament', 'Grand Finals', 'Pro'],
    kidFriendly: false,
    thumbnail: 'https://i.ytimg.com/vi/lXdvR5iMU3Y/maxresdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=113',
    description: 'The complete Grand Finals series between LOUD and Team Vitality at VALORANT Champions Shanghai.',
    likes: 380000,
    sourceType: 'youtube',
    youtubeId: 'lXdvR5iMU3Y',
    videoUrl: 'https://www.youtube.com/watch?v=lXdvR5iMU3Y'
  }
];

const DEFAULT_PROFILE: UserTasteProfile = {
  watchDurations: {},
  completedVideos: {},
  likedVideoIds: [],
  searchHistory: [],
  categoryAffinities: {
    'Minecraft': 15,
    'Roblox': 10,
    'Nintendo': 12
  },
  tagAffinities: {
    'Minecraft': 15,
    'Building': 10,
    'Kids': 12
  },
  creatorAffinities: {},
  lastRefreshTimestamp: 0,
  lastUpdated: new Date().toISOString()
};

// Storage key for live platform synced video items
const SYNCED_VIDEOS_STORAGE_KEY = 'nexus_synced_videos_catalog_v2';

// In-memory synced videos loaded from storage
let SYNCED_VIDEOS: VideoPost[] = [];
try {
  const cached = localStorage.getItem(SYNCED_VIDEOS_STORAGE_KEY);
  if (cached) {
    SYNCED_VIDEOS = JSON.parse(cached);
  }
} catch (e) {
  SYNCED_VIDEOS = [];
}

/**
 * Returns all active catalog videos, fusing static seeds with newly ingested platform streams.
 */
export const getAllCatalogVideos = (): VideoPost[] => {
  const map = new Map<string, VideoPost>();
  
  // Seed with base videos
  VIDEO_CATALOG.forEach(v => {
    map.set(v.id, v);
    if (v.youtubeId) map.set(v.youtubeId, v);
  });

  // Overlay newly synced live videos
  SYNCED_VIDEOS.forEach(v => {
    map.set(v.id, v);
    if (v.youtubeId) map.set(v.youtubeId, v);
  });

  return Array.from(new Set(map.values()));
};

export const getUserTasteProfile = (): UserTasteProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        watchDurations: parsed.watchDurations || {},
        completedVideos: parsed.completedVideos || {},
        likedVideoIds: Array.isArray(parsed.likedVideoIds) ? parsed.likedVideoIds : [],
        searchHistory: Array.isArray(parsed.searchHistory) ? parsed.searchHistory : [],
        categoryAffinities: parsed.categoryAffinities || {},
        tagAffinities: parsed.tagAffinities || {},
        creatorAffinities: parsed.creatorAffinities || {},
        lastRefreshTimestamp: parsed.lastRefreshTimestamp || 0,
        lastUpdated: parsed.lastUpdated || new Date().toISOString()
      };
    }
  } catch (e) {
    console.error('Failed reading user taste profile', e);
  }
  return { ...DEFAULT_PROFILE };
};

export const saveUserTasteProfile = (profile: UserTasteProfile): void => {
  try {
    profile.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('nexus_recommendations_updated'));
  } catch (e) {
    console.error('Failed saving user taste profile', e);
  }
};

/**
 * Tracks seconds watched of a video.
 * Applies YouTube-style algorithm weights:
 * - Direct watch seconds: 1.6 pts / sec
 * - Creator affinity: 1.2 pts / sec
 * - Category affinity: 1.0 pt / sec
 * - Tag affinities: 0.8 pt / sec
 * - Completed bonus: +30 pts
 */
export const trackVideoWatch = (videoId: string, secondsWatched: number, completed = false): void => {
  if (secondsWatched <= 0) return;
  const profile = getUserTasteProfile();
  const allVids = getAllCatalogVideos();
  const video = allVids.find(v => v.id === videoId || v.youtubeId === videoId);

  // Update video duration record
  profile.watchDurations[videoId] = (profile.watchDurations[videoId] || 0) + secondsWatched;
  if (completed) {
    profile.completedVideos[videoId] = (profile.completedVideos[videoId] || 0) + 1;
  }

  if (video) {
    // Update Category Affinity
    if (video.category) {
      profile.categoryAffinities[video.category] = (profile.categoryAffinities[video.category] || 0) + (secondsWatched * 1.0) + (completed ? 30 : 0);
    }
    // Update Tag Affinities
    if (video.tags) {
      video.tags.forEach(tag => {
        profile.tagAffinities[tag] = (profile.tagAffinities[tag] || 0) + (secondsWatched * 0.8) + (completed ? 15 : 0);
      });
    }
    // Update Creator Affinity
    if (video.author) {
      if (!profile.creatorAffinities) profile.creatorAffinities = {};
      profile.creatorAffinities[video.author] = (profile.creatorAffinities[video.author] || 0) + (secondsWatched * 1.2) + (completed ? 25 : 0);
    }
  }

  saveUserTasteProfile(profile);
};

/**
 * Tracks when a user likes or unlikes a video.
 * Gives massive positive signal to video, creator channel, its category, and tags.
 */
export const trackVideoLike = (videoId: string, isLiked: boolean): void => {
  const profile = getUserTasteProfile();
  const allVids = getAllCatalogVideos();
  const video = allVids.find(v => v.id === videoId || v.youtubeId === videoId);

  const set = new Set(profile.likedVideoIds);
  if (isLiked) {
    set.add(videoId);
    if (video) {
      if (video.category) {
        profile.categoryAffinities[video.category] = (profile.categoryAffinities[video.category] || 0) + 45;
      }
      if (video.tags) {
        video.tags.forEach(tag => {
          profile.tagAffinities[tag] = (profile.tagAffinities[tag] || 0) + 20;
        });
      }
      if (video.author) {
        if (!profile.creatorAffinities) profile.creatorAffinities = {};
        profile.creatorAffinities[video.author] = (profile.creatorAffinities[video.author] || 0) + 60;
      }
    }
  } else {
    set.delete(videoId);
  }
  profile.likedVideoIds = Array.from(set);
  saveUserTasteProfile(profile);
};

/**
 * Records a search term into search history and immediately boosts tag and creator affinities.
 */
export const trackSearch = (query: string): void => {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed || trimmed.length < 2) return;

  const profile = getUserTasteProfile();
  const filtered = profile.searchHistory.filter(q => q.toLowerCase() !== trimmed);
  profile.searchHistory = [trimmed, ...filtered].slice(0, 15);

  const allVids = getAllCatalogVideos();
  allVids.forEach(video => {
    const titleMatch = video.title.toLowerCase().includes(trimmed);
    const catMatch = video.category?.toLowerCase().includes(trimmed);
    const authorMatch = video.author.toLowerCase().includes(trimmed);
    const tagMatch = video.tags?.some(t => t.toLowerCase().includes(trimmed));

    if (titleMatch || catMatch || authorMatch || tagMatch) {
      if (video.category) {
        profile.categoryAffinities[video.category] = (profile.categoryAffinities[video.category] || 0) + 18;
      }
      if (video.author) {
        if (!profile.creatorAffinities) profile.creatorAffinities = {};
        profile.creatorAffinities[video.author] = (profile.creatorAffinities[video.author] || 0) + 25;
      }
      if (video.tags) {
        video.tags.forEach(t => {
          if (t.toLowerCase().includes(trimmed)) {
            profile.tagAffinities[t] = (profile.tagAffinities[t] || 0) + 22;
          }
        });
      }
    }
  });

  saveUserTasteProfile(profile);
};

/**
 * Resets history for testing.
 */
export const resetRecommendationHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('nexus_recommendations_updated'));
};

/**
 * Performs a live synchronization with YouTube and platform creators via the server proxy.
 * Ingests authentic new videos immediately into the catalog.
 */
export const syncFreshPlatformVideos = async (isJuniorMode = false): Promise<VideoPost[]> => {
  try {
    const profile = getUserTasteProfile();
    const topCategories = Object.entries(profile.categoryAffinities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    const recentSearches = profile.searchHistory.slice(0, 2);

    const response = await fetch('/api/sync-feed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categories: topCategories,
        searchTopics: recentSearches,
        juniorMode: isJuniorMode,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const newVideos: VideoPost[] = Array.isArray(data.videos) ? data.videos : [];

      if (newVideos.length > 0) {
        // Merge with existing synced videos
        const existingIds = new Set(SYNCED_VIDEOS.map(v => v.youtubeId || v.id));
        const filteredNew = newVideos.filter(v => v.youtubeId && !existingIds.has(v.youtubeId));

        SYNCED_VIDEOS = [...filteredNew, ...SYNCED_VIDEOS].slice(0, 40);
        try {
          localStorage.setItem(SYNCED_VIDEOS_STORAGE_KEY, JSON.stringify(SYNCED_VIDEOS));
        } catch (e) {}

        // Populate metadata cache so projector immediately recognizes them
        filteredNew.forEach(v => {
          if (v.youtubeId) {
            METADATA_CACHE.set(v.youtubeId, {
              title: v.title,
              author: v.author,
              thumbnail: `https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg`,
              category: v.category,
            });
          }
        });

        profile.lastRefreshTimestamp = Date.now();
        saveUserTasteProfile(profile);
      }

      return newVideos;
    }
  } catch (err) {
    console.warn('syncFreshPlatformVideos error:', err);
  }
  return [];
};

/**
 * Computes personalized recommendations ranking using the multi-signal algorithm.
 * Incorporates:
 * - Direct watch duration
 * - Completed views
 * - Explicit likes
 * - Creator channel affinities
 * - Category affinities
 * - Tag affinities
 * - Search keyword matching
 * - Fresh upload signals
 * - Subtle exploratory random variation for fresh YouTube-like shuffling on refresh
 */
export const getPersonalizedRecommendations = (limit = 12, isJuniorMode = false, withExploration = true): ScoredVideo[] => {
  const profile = getUserTasteProfile();
  const allCatalog = getAllCatalogVideos();

  // Find top categories & tags for reason badge generation
  const sortedCategories = Object.entries(profile.categoryAffinities)
    .sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : 'Minecraft';

  const sortedTags = Object.entries(profile.tagAffinities)
    .sort((a, b) => b[1] - a[1]);
  const topTag = sortedTags.length > 0 ? sortedTags[0][0] : 'Building';

  const sortedCreators = Object.entries(profile.creatorAffinities || {})
    .sort((a, b) => b[1] - a[1]);
  const topCreator = sortedCreators.length > 0 ? sortedCreators[0][0] : null;

  const scored: ScoredVideo[] = allCatalog.map(video => {
    // Junior Mode Filter: non-kid-friendly videos receive heavy penalty or are excluded
    if (isJuniorMode && video.kidFriendly === false) {
      return {
        ...video,
        score: -9999,
        matchPercentage: 20,
        reasonBadge: 'Restricted in Junior Mode',
        userWatchDuration: profile.watchDurations[video.id] || 0,
        isLikedByUser: profile.likedVideoIds.includes(video.id)
      };
    }

    let score = 50; // Base prior

    // 1. Direct watch time signal
    const watchSec = profile.watchDurations[video.id] || (video.youtubeId ? profile.watchDurations[video.youtubeId] || 0 : 0);
    score += watchSec * 1.6;

    // 2. Completed views
    const completedCount = profile.completedVideos[video.id] || (video.youtubeId ? profile.completedVideos[video.youtubeId] || 0 : 0);
    score += completedCount * 35;

    // 3. User Likes
    const isLiked = profile.likedVideoIds.includes(video.id) || (video.youtubeId ? profile.likedVideoIds.includes(video.youtubeId) : false);
    if (isLiked) {
      score += 75;
    }

    // 4. Creator affinity
    if (video.author && profile.creatorAffinities && profile.creatorAffinities[video.author]) {
      score += profile.creatorAffinities[video.author] * 1.5;
    }

    // 5. Category affinity
    if (video.category && profile.categoryAffinities[video.category]) {
      score += profile.categoryAffinities[video.category] * 1.8;
    }

    // 6. Tag affinities
    if (video.tags) {
      video.tags.forEach(tag => {
        if (profile.tagAffinities[tag]) {
          score += profile.tagAffinities[tag] * 1.2;
        }
      });
    }

    // 7. Search keyword matching
    profile.searchHistory.forEach((q, idx) => {
      const recencyMultiplier = Math.max(0.4, 1 - idx * 0.1);
      const titleHit = video.title.toLowerCase().includes(q);
      const catHit = video.category?.toLowerCase().includes(q);
      const authorHit = video.author.toLowerCase().includes(q);
      const tagHit = video.tags?.some(t => t.toLowerCase().includes(q));

      if (titleHit || catHit || authorHit || tagHit) {
        score += 40 * recencyMultiplier;
      }
    });

    // 8. Fresh upload boost (from live sync)
    if (video.isFreshUpload) {
      score += 45;
    }

    // 9. Junior Mode boost for kid-friendly content
    if (isJuniorMode && video.kidFriendly) {
      score += 120;
    }

    // 10. YouTube-style serendipity/exploratory jitter (makes refresh feel alive with fresh video variants)
    if (withExploration) {
      score += Math.random() * 18;
    }

    // Determine intuitive, gamer-focused reason badge
    let reasonBadge = '🔥 Recommended';
    if (isLiked) {
      reasonBadge = `❤️ Because you liked ${video.author}`;
    } else if (video.isFreshUpload) {
      reasonBadge = `⚡ Fresh Upload from ${video.author}`;
    } else if (topCreator && video.author === topCreator && (profile.creatorAffinities?.[topCreator] || 0) > 15) {
      reasonBadge = `🌟 Top Creator: ${video.author}`;
    } else if (profile.searchHistory.some(q => video.title.toLowerCase().includes(q) || video.tags?.some(t => t.toLowerCase().includes(q)))) {
      const matchedQuery = profile.searchHistory.find(q => video.title.toLowerCase().includes(q) || video.tags?.some(t => t.toLowerCase().includes(q)));
      reasonBadge = `🔍 Matches "${matchedQuery}"`;
    } else if (video.category === topCategory && (profile.categoryAffinities[topCategory] || 0) > 20) {
      reasonBadge = `🎮 Because you watch ${topCategory}`;
    } else if (video.tags?.includes(topTag) && (profile.tagAffinities[topTag] || 0) > 20) {
      reasonBadge = `✨ High match for #${topTag}`;
    } else if (watchSec > 10) {
      reasonBadge = '⏱️ Watch it again';
    } else if (isJuniorMode && video.kidFriendly) {
      reasonBadge = '⭐ Top Pick for Junior Mode';
    }

    // Calculate human-friendly match % between 74% and 99%
    const normalizedScore = Math.min(99, Math.max(74, Math.round(74 + Math.log10(Math.max(1, score)) * 9)));
    const matchPercentage = Math.min(99, normalizedScore);

    return {
      ...video,
      score,
      matchPercentage,
      reasonBadge,
      userWatchDuration: watchSec,
      isLikedByUser: isLiked
    };
  });

  // Filter out negative scores (e.g. non-kid-friendly in Junior Mode) and sort by highest score
  const filtered = scored.filter(v => v.score > 0);
  filtered.sort((a, b) => b.score - a.score);

  return filtered.slice(0, limit);
};

export const getTopTasteCategories = (): { category: string; points: number; percent: number }[] => {
  const profile = getUserTasteProfile();
  const entries = Object.entries(profile.categoryAffinities);
  const total = entries.reduce((sum, [, pts]) => sum + pts, 0);

  if (total <= 0) {
    return [
      { category: 'Minecraft', points: 45, percent: 50 },
      { category: 'Roblox', points: 25, percent: 28 },
      { category: 'Creative Builds', points: 20, percent: 22 }
    ];
  }

  return entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([cat, pts]) => ({
      category: cat,
      points: Math.round(pts),
      percent: Math.round((pts / total) * 100)
    }));
};

/**
 * Parses any YouTube or Twitch URL into structured stream metadata.
 */
export function parseMediaStreamUrl(input: string): {
  sourceType: 'youtube' | 'twitch' | 'direct';
  idOrChannel: string;
} {
  const trimmed = (input || '').trim();
  if (!trimmed) return { sourceType: 'direct', idOrChannel: '' };

  // 1. YouTube standard URL or embed or short: youtu.be/xxx or watch?v=xxx
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return { sourceType: 'youtube', idOrChannel: ytMatch[1] };
  }

  // 1b. Bare 11-char YouTube ID (e.g. W_7LqXj2C70)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return { sourceType: 'youtube', idOrChannel: trimmed };
  }

  // 2. Twitch URL: twitch.tv/channel or twitch.tv/videos/123456
  const twitchChannelMatch = trimmed.match(/(?:twitch\.tv\/)([a-zA-Z0-9_]{3,25})/i);
  if (twitchChannelMatch && twitchChannelMatch[1]) {
    const channelName = twitchChannelMatch[1].toLowerCase();
    if (channelName !== 'videos' && channelName !== 'directory') {
      return { sourceType: 'twitch', idOrChannel: channelName };
    }
  }

  return { sourceType: 'direct', idOrChannel: trimmed };
}

// Memory & LocalStorage metadata cache for projected streams
const METADATA_CACHE = new Map<string, { title: string; author: string; thumbnail: string; category?: string }>();

// Seed cache with known videos
VIDEO_CATALOG.forEach(v => {
  if (v.youtubeId) {
    METADATA_CACHE.set(v.youtubeId, {
      title: v.title,
      author: v.author,
      thumbnail: `https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg`,
      category: v.category,
    });
  }
  if (v.twitchChannel) {
    METADATA_CACHE.set(`twitch:${v.twitchChannel.toLowerCase()}`, {
      title: v.title,
      author: v.author,
      thumbnail: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${v.twitchChannel.toLowerCase()}-1280x720.jpg`,
      category: v.category,
    });
  }
});

/**
 * Creates a playable ScoredVideo from an arbitrary YouTube or Twitch stream URL.
 * Immediately applies authentic cached metadata if available, and sets official platform thumbnail.
 */
export function createProjectedVideo(
  streamInput: string,
  customTitle?: string,
  isJuniorFriendly: boolean = false
): ScoredVideo {
  const { sourceType, idOrChannel } = parseMediaStreamUrl(streamInput);
  const videoId = `projected-${Date.now()}`;

  const isTwitch = sourceType === 'twitch';
  const isYouTube = sourceType === 'youtube';

  const cacheKey = isTwitch ? `twitch:${idOrChannel.toLowerCase()}` : idOrChannel;
  const cached = METADATA_CACHE.get(cacheKey);

  const title = customTitle || (cached 
    ? cached.title 
    : isTwitch 
      ? `Live Stream • ${idOrChannel.charAt(0).toUpperCase() + idOrChannel.slice(1)}` 
      : isYouTube 
        ? `YouTube Video [${idOrChannel}]` 
        : 'Custom Stream Video');

  const thumbnail = cached?.thumbnail || (isYouTube 
    ? `https://img.youtube.com/vi/${idOrChannel}/maxresdefault.jpg`
    : isTwitch
      ? `https://static-cdn.jtvnw.net/previews-ttv/live_user_${idOrChannel.toLowerCase()}-1280x720.jpg`
      : 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop');

  const author = cached?.author || (isTwitch 
    ? idOrChannel.charAt(0).toUpperCase() + idOrChannel.slice(1) 
    : isYouTube 
      ? 'YouTube Creator' 
      : 'Custom Stream');

  return {
    id: videoId,
    title,
    author,
    views: '1.5M',
    duration: isTwitch ? 'LIVE' : 'Projected',
    category: cached?.category || (isJuniorFriendly ? 'Minecraft' : 'Gaming'),
    tags: isJuniorFriendly ? ['Kids', 'Gaming', 'Stream'] : ['Gaming', 'Live', 'Stream'],
    kidFriendly: isJuniorFriendly,
    thumbnail,
    sourceType,
    youtubeId: isYouTube ? idOrChannel : undefined,
    twitchChannel: isTwitch ? idOrChannel : undefined,
    videoUrl: streamInput,
    isLive: isTwitch,
    likes: 85000,
    score: 950,
    matchPercentage: 98,
    reasonBadge: '🚀 Directly Projected Stream',
    userWatchDuration: 0,
    isLikedByUser: false
  };
}

/**
 * Asynchronously resolves authentic title, creator channel name, and official thumbnail
 * from the Nexus media resolver endpoint for any YouTube video or Twitch channel.
 */
export async function resolveStreamMetadata(
  streamInput: string,
  isJuniorFriendly: boolean = false
): Promise<ScoredVideo> {
  const base = createProjectedVideo(streamInput, undefined, isJuniorFriendly);
  try {
    const res = await fetch('/api/resolve-media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: streamInput })
    });
    if (res.ok) {
      const data = await res.json();
      const updated = {
        ...base,
        title: data.title || base.title,
        author: data.author || base.author,
        thumbnail: data.thumbnail || base.thumbnail,
        category: data.category || base.category,
        views: data.views || base.views,
        youtubeId: data.youtubeId || base.youtubeId,
        twitchChannel: data.twitchChannel || base.twitchChannel,
        sourceType: data.sourceType || base.sourceType,
      };

      // Store in metadata cache
      const { idOrChannel, sourceType } = parseMediaStreamUrl(streamInput);
      const cacheKey = sourceType === 'twitch' ? `twitch:${idOrChannel.toLowerCase()}` : idOrChannel;
      METADATA_CACHE.set(cacheKey, {
        title: updated.title,
        author: updated.author,
        thumbnail: updated.thumbnail,
        category: updated.category,
      });

      // Persist projected stream to Cloud SQL
      fetch('/api/projections/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamUrl: streamInput,
          title: updated.title,
          channelName: updated.author,
          thumbnailUrl: updated.thumbnail,
          platform: updated.sourceType,
        }),
      }).catch(() => {});

      return updated;
    }
  } catch (err) {
    console.warn('Metadata resolution failed, using best-effort stream:', err);
  }
  return base;
}

/**
 * Returns the authentic thumbnail for any video.
 * For YouTube, guarantees the official HQ thumbnail: https://img.youtube.com/vi/{id}/maxresdefault.jpg
 * For Twitch, guarantees the official live preview image.
 */
export function getVideoThumbnail(video: { thumbnail?: string; youtubeId?: string; sourceType?: string; twitchChannel?: string }): string {
  if (video.youtubeId) {
    return `https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg`;
  }
  if (video.sourceType === 'twitch' && video.twitchChannel) {
    return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${video.twitchChannel.toLowerCase()}-1280x720.jpg`;
  }
  if (video.thumbnail && video.thumbnail.startsWith('http')) {
    return video.thumbnail;
  }
  return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop';
}

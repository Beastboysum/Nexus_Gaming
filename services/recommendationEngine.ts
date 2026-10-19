import { VideoPost, ScoredVideo, UserTasteProfile } from '../types';

const STORAGE_KEY = 'nexus_user_taste_profile_v2';

export const VIDEO_CATALOG: VideoPost[] = [
  {
    id: 'vid-minecraft-1',
    title: 'Surviving 100 Days in a Mega Minecraft Treehouse!',
    author: 'Forge Labs',
    views: '4.8M',
    duration: '18:45',
    category: 'Minecraft',
    tags: ['Minecraft', 'Building', 'Survival', 'Kids', 'Creative', 'Adventure'],
    kidFriendly: true,
    thumbnail: 'https://img.youtube.com/vi/W_7LqXj2C70/hqdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=101',
    description: 'We built the biggest treehouse kingdom ever seen in Minecraft hardcore! Complete with zip lines, automatic farms, and secret rooms.',
    likes: 245000,
    sourceType: 'youtube',
    youtubeId: 'W_7LqXj2C70',
    videoUrl: 'https://www.youtube.com/watch?v=W_7LqXj2C70'
  },
  {
    id: 'vid-roblox-1',
    title: 'Escape the Giant Rainbow Lava Obby with Friends!',
    author: 'RainbowGamer Squad',
    views: '3.2M',
    duration: '12:20',
    category: 'Roblox',
    tags: ['Roblox', 'Obby', 'Funny', 'Multiplayer', 'Kids', 'Challenge'],
    kidFriendly: true,
    thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=102',
    description: 'Can we beat 100 levels of crazy rainbow obstacles before the lava catches us? Watch till the end for the secret rainbow jetpack!',
    likes: 180000,
    sourceType: 'youtube',
    youtubeId: 'kJQP7kiw5Fk',
    videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk'
  },
  {
    id: 'vid-mario-1',
    title: 'Super Mario Wonder - Finding ALL Hidden Wonder Seeds!',
    author: 'Nintendo',
    views: '1.9M',
    duration: '15:10',
    category: 'Nintendo',
    tags: ['Mario', 'Nintendo', 'Secrets', 'Kids', 'Fun', 'Platformer'],
    kidFriendly: true,
    thumbnail: 'https://img.youtube.com/vi/J3_A0-4H-pA/hqdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=103',
    description: 'Every secret wonder seed location unlocked with Elephant Mario and Yoshi! Super fun guide for all ages.',
    likes: 112000,
    sourceType: 'youtube',
    youtubeId: 'J3_A0-4H-pA',
    videoUrl: 'https://www.youtube.com/watch?v=J3_A0-4H-pA'
  },
  {
    id: 'vid-pokemon-1',
    title: 'I Caught Every Rare Legendary Pokémon in 24 Hours!',
    author: 'The Official Pokémon YouTube Channel',
    views: '2.4M',
    duration: '21:05',
    category: 'Pokemon',
    tags: ['Pokemon', 'Nintendo', 'Adventure', 'Kids', 'Collecting', 'Challenge'],
    kidFriendly: true,
    thumbnail: 'https://img.youtube.com/vi/3dsh1p4rP7Y/hqdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=104',
    description: 'From Mewtwo to Rayquaza, here is the ultimate shiny hunting guide! Guaranteed easy tricks.',
    likes: 165000,
    sourceType: 'youtube',
    youtubeId: '3dsh1p4rP7Y',
    videoUrl: 'https://www.youtube.com/watch?v=3dsh1p4rP7Y'
  },
  {
    id: 'vid-rocketleague-1',
    title: 'Top 50 Most Satisfying Rocket League Aerial Goals!',
    author: 'Rocket League',
    views: '1.5M',
    duration: '09:50',
    category: 'Sports & Fun',
    tags: ['Rocket League', 'Goals', 'Cars', 'Kids', 'Multiplayer', 'Highlights'],
    kidFriendly: true,
    thumbnail: 'https://img.youtube.com/vi/lq7eB84fX_M/hqdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=105',
    description: 'Incredible flips, ceiling resets, and buzzer beaters set to high-energy upbeat music.',
    likes: 98000,
    sourceType: 'youtube',
    youtubeId: 'lq7eB84fX_M',
    videoUrl: 'https://www.youtube.com/watch?v=lq7eB84fX_M'
  },
  {
    id: 'vid-fallguys-1',
    title: 'Ultimate Fall Guys Crown Win Streak (No Disqualifications!)',
    author: 'Fall Guys',
    views: '1.1M',
    duration: '11:15',
    category: 'Party Games',
    tags: ['Fall Guys', 'Funny Moments', 'Kids', 'Multiplayer', 'Obstacles'],
    kidFriendly: true,
    thumbnail: 'https://img.youtube.com/vi/kK_Wk4zR5l0/hqdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=106',
    description: '10 straight wins across slime climb, hex-a-gone, and door dash with the funniest costume combos!',
    likes: 74000,
    sourceType: 'youtube',
    youtubeId: 'kK_Wk4zR5l0',
    videoUrl: 'https://www.youtube.com/watch?v=kK_Wk4zR5l0'
  },
  {
    id: 'vid-lego-1',
    title: 'Building a Working Rollercoaster from 5,000 LEGO Bricks',
    author: 'LEGO',
    views: '3.7M',
    duration: '16:30',
    category: 'Creative Builds',
    tags: ['LEGO', 'Creative', 'Building', 'Kids', 'Science', 'Fun'],
    kidFriendly: true,
    thumbnail: 'https://img.youtube.com/vi/vLnPwxZdW4Y/hqdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=107',
    description: 'We engineered motorized lifts, double loops, and light effects. You can build this at home too!',
    likes: 310000,
    sourceType: 'youtube',
    youtubeId: 'vLnPwxZdW4Y',
    videoUrl: 'https://www.youtube.com/watch?v=vLnPwxZdW4Y'
  },
  {
    id: 'vid-minecraft-speedrun',
    title: 'Minecraft World Record Speedrun Explained Step by Step',
    author: 'Minecraft',
    views: '2.8M',
    duration: '14:22',
    category: 'Minecraft',
    tags: ['Minecraft', 'Speedrun', 'Guide', 'World Record', 'Tips'],
    kidFriendly: true,
    thumbnail: 'https://img.youtube.com/vi/rV3bZl68y1s/hqdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=108',
    description: 'How top runners find fortresses in seconds, perform blind portals, and one-cycle the Ender Dragon.',
    likes: 215000,
    sourceType: 'youtube',
    youtubeId: 'rV3bZl68y1s',
    videoUrl: 'https://www.youtube.com/watch?v=rV3bZl68y1s'
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
    title: 'TenZ Ultimate Aim & Crosshair Placement Masterclass',
    author: 'TenZ',
    views: '4.2M',
    duration: '22:15',
    category: 'Esports',
    tags: ['Valorant', 'Esports', 'Aim', 'Competitive', 'Pro Guide'],
    kidFriendly: false,
    thumbnail: 'https://img.youtube.com/vi/j6rF0_3s4tE/hqdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=109',
    description: 'Daily aim routine, mouse sensitivity calibration, and micro-adjustments for radiant lobby dominations.',
    likes: 340000,
    sourceType: 'youtube',
    youtubeId: 'j6rF0_3s4tE',
    videoUrl: 'https://www.youtube.com/watch?v=j6rF0_3s4tE'
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
    thumbnail: 'https://img.youtube.com/vi/0e3GPea1Tyg/hqdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=125',
    description: '456 people compete for $456,000 in the most viral real life challenge game ever made.',
    likes: 18000000,
    sourceType: 'youtube',
    youtubeId: '0e3GPea1Tyg',
    videoUrl: 'https://www.youtube.com/watch?v=0e3GPea1Tyg'
  },
  {
    id: 'vid-eldenring-dlc',
    title: 'Shadow of the Erdtree - All 10 Secret Boss Locations & Lore',
    author: 'VaatiVidya',
    views: '3.1M',
    duration: '35:40',
    category: 'RPG & Action',
    tags: ['Elden Ring', 'Boss Fight', 'Secrets', 'Action', 'Lore'],
    kidFriendly: false,
    thumbnail: 'https://img.youtube.com/vi/h8qT1-t-PBs/hqdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=110',
    description: 'Detailed walkthrough of the hardest hidden encounters and fragments in the Realm of Shadow.',
    likes: 290000,
    sourceType: 'youtube',
    youtubeId: 'h8qT1-t-PBs',
    videoUrl: 'https://www.youtube.com/watch?v=h8qT1-t-PBs'
  },
  {
    id: 'vid-hardware-build',
    title: 'Building the Ultimate $2000 Dream Gaming Setup in 2026',
    author: 'Linus Tech Tips',
    views: '1.8M',
    duration: '19:40',
    category: 'Hardware',
    tags: ['PC Build', 'Setup', 'Tech', 'Desk Setup', 'RGB'],
    kidFriendly: true,
    thumbnail: 'https://img.youtube.com/vi/BL4DCEp7blY/hqdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=111',
    description: 'Cable management tricks, ultra-wide OLED monitor, and silent liquid cooling assembly.',
    likes: 145000,
    sourceType: 'youtube',
    youtubeId: 'BL4DCEp7blY',
    videoUrl: 'https://www.youtube.com/watch?v=BL4DCEp7blY'
  },
  {
    id: 'vid-funny-fails',
    title: 'Funniest Gaming Fails & Instant Karma Moments of the Month',
    author: 'BBC News / Gaming',
    views: '5.6M',
    duration: '13:55',
    category: 'Funny Clips',
    tags: ['Funny Moments', 'Fails', 'Gaming', 'Highlights', 'Kids'],
    kidFriendly: true,
    thumbnail: 'https://img.youtube.com/vi/9y4f_Q28Z_w/hqdefault.jpg',
    channelAvatar: 'https://picsum.photos/80/80?random=112',
    description: 'Hilarious glitches, unexpected physics moments, and team betrayal clips that will make you laugh out loud.',
    likes: 420000,
    sourceType: 'youtube',
    youtubeId: '9y4f_Q28Z_w',
    videoUrl: 'https://www.youtube.com/watch?v=9y4f_Q28Z_w'
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
  lastUpdated: new Date().toISOString()
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
 * - Direct watch seconds: 1.5 pts / sec
 * - Category affinity: 1.0 pt / sec
 * - Tag affinities: 0.8 pt / sec
 * - Completed bonus: +25 pts
 */
export const trackVideoWatch = (videoId: string, secondsWatched: number, completed = false): void => {
  if (secondsWatched <= 0) return;
  const profile = getUserTasteProfile();
  const video = VIDEO_CATALOG.find(v => v.id === videoId);

  // Update video duration record
  profile.watchDurations[videoId] = (profile.watchDurations[videoId] || 0) + secondsWatched;
  if (completed) {
    profile.completedVideos[videoId] = (profile.completedVideos[videoId] || 0) + 1;
  }

  if (video) {
    // Update Category Affinity
    if (video.category) {
      profile.categoryAffinities[video.category] = (profile.categoryAffinities[video.category] || 0) + (secondsWatched * 1.0) + (completed ? 25 : 0);
    }
    // Update Tag Affinities
    if (video.tags) {
      video.tags.forEach(tag => {
        profile.tagAffinities[tag] = (profile.tagAffinities[tag] || 0) + (secondsWatched * 0.8) + (completed ? 15 : 0);
      });
    }
  }

  saveUserTasteProfile(profile);
};

/**
 * Tracks when a user likes or unlikes a video.
 * Gives massive positive signal to video, its category, and its tags.
 */
export const trackVideoLike = (videoId: string, isLiked: boolean): void => {
  const profile = getUserTasteProfile();
  const video = VIDEO_CATALOG.find(v => v.id === videoId);

  const set = new Set(profile.likedVideoIds);
  if (isLiked) {
    set.add(videoId);
    if (video) {
      if (video.category) {
        profile.categoryAffinities[video.category] = (profile.categoryAffinities[video.category] || 0) + 40;
      }
      if (video.tags) {
        video.tags.forEach(tag => {
          profile.tagAffinities[tag] = (profile.tagAffinities[tag] || 0) + 20;
        });
      }
    }
  } else {
    set.delete(videoId);
  }
  profile.likedVideoIds = Array.from(set);
  saveUserTasteProfile(profile);
};

/**
 * Records a search term into search history and immediately boosts tag affinities matching keywords.
 */
export const trackSearch = (query: string): void => {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed || trimmed.length < 2) return;

  const profile = getUserTasteProfile();
  // Keep last 15 searches
  const filtered = profile.searchHistory.filter(q => q.toLowerCase() !== trimmed);
  profile.searchHistory = [trimmed, ...filtered].slice(0, 15);

  // Boost any category or tags mentioned in query
  VIDEO_CATALOG.forEach(video => {
    const titleMatch = video.title.toLowerCase().includes(trimmed);
    const catMatch = video.category?.toLowerCase().includes(trimmed);
    const tagMatch = video.tags?.some(t => t.toLowerCase().includes(trimmed));

    if (titleMatch || catMatch || tagMatch) {
      if (video.category) {
        profile.categoryAffinities[video.category] = (profile.categoryAffinities[video.category] || 0) + 15;
      }
      if (video.tags) {
        video.tags.forEach(t => {
          if (t.toLowerCase().includes(trimmed)) {
            profile.tagAffinities[t] = (profile.tagAffinities[t] || 0) + 20;
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
 * Computes personalized recommendations ranking using the multi-signal algorithm.
 */
export const getPersonalizedRecommendations = (limit = 12, isJuniorMode = false): ScoredVideo[] => {
  const profile = getUserTasteProfile();

  // Find top categories & tags for reason badge generation
  const sortedCategories = Object.entries(profile.categoryAffinities)
    .sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : 'Minecraft';

  const sortedTags = Object.entries(profile.tagAffinities)
    .sort((a, b) => b[1] - a[1]);
  const topTag = sortedTags.length > 0 ? sortedTags[0][0] : 'Building';

  const scored: ScoredVideo[] = VIDEO_CATALOG.map(video => {
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
    const watchSec = profile.watchDurations[video.id] || 0;
    score += watchSec * 1.5;

    // 2. Completed views
    const completedCount = profile.completedVideos[video.id] || 0;
    score += completedCount * 30;

    // 3. User Likes
    const isLiked = profile.likedVideoIds.includes(video.id);
    if (isLiked) {
      score += 65;
    }

    // 4. Category affinity
    if (video.category && profile.categoryAffinities[video.category]) {
      score += profile.categoryAffinities[video.category] * 1.8;
    }

    // 5. Tag affinities
    if (video.tags) {
      video.tags.forEach(tag => {
        if (profile.tagAffinities[tag]) {
          score += profile.tagAffinities[tag] * 1.2;
        }
      });
    }

    // 6. Search keyword matching
    profile.searchHistory.forEach((q, idx) => {
      const recencyMultiplier = Math.max(0.5, 1 - idx * 0.1);
      const titleHit = video.title.toLowerCase().includes(q);
      const catHit = video.category?.toLowerCase().includes(q);
      const tagHit = video.tags?.some(t => t.toLowerCase().includes(q));

      if (titleHit || catHit || tagHit) {
        score += 35 * recencyMultiplier;
      }
    });

    // 7. Junior Mode boost for kid-friendly content
    if (isJuniorMode && video.kidFriendly) {
      score += 120;
    }

    // Determine intuitive reason badge
    let reasonBadge = '🔥 Recommended';
    if (isLiked) {
      reasonBadge = '❤️ Because you liked this';
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

    // Calculate human-friendly match % between 72% and 99%
    const normalizedScore = Math.min(100, Math.max(72, Math.round(72 + Math.log10(Math.max(1, score)) * 10)));
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
      thumbnail: `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`,
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
    ? `https://img.youtube.com/vi/${idOrChannel}/hqdefault.jpg`
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
 * For YouTube, guarantees the official HQ thumbnail: https://img.youtube.com/vi/{id}/hqdefault.jpg
 * For Twitch, guarantees the official live preview image.
 */
export function getVideoThumbnail(video: { thumbnail?: string; youtubeId?: string; sourceType?: string; twitchChannel?: string }): string {
  if (video.youtubeId) {
    return `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
  }
  if (video.sourceType === 'twitch' && video.twitchChannel) {
    return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${video.twitchChannel.toLowerCase()}-1280x720.jpg`;
  }
  if (video.thumbnail && video.thumbnail.startsWith('http')) {
    return video.thumbnail;
  }
  return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop';
}

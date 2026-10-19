import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Settings, User, MoreVertical, 
  Heart, Signal, Eye, Gamepad2, Mic, Music, Trophy, Search, Filter, X, 
  MessageCircle, Share2, ThumbsUp, CheckCircle2, Sparkles, Video, Radio, 
  Star, Rocket, Tv, Users, Bell, ShieldCheck, Loader2
} from 'lucide-react';
import { SocialFeedSection } from '../components/SocialFeedSection';
import { playCategorizedAudio, getEffectiveVolume } from '../services/audioManager';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { PersonalizedVideoShelf } from '../components/PersonalizedVideoShelf';
import { ChannelProfileModal } from '../components/ChannelProfileModal';
import { isJuniorModeEnabled } from '../services/juniorModeContext';
import { 
  trackSearch, getPersonalizedRecommendations, VIDEO_CATALOG, 
  getVideoThumbnail, parseMediaStreamUrl, createProjectedVideo 
} from '../services/recommendationEngine';
import { CREATOR_DIRECTORY, searchLocalCreators } from '../services/creatorDirectory';
import { ScoredVideo, CreatorChannel, VideoPost } from '../types';

// --- Mock Data ---

const CATEGORIES = [
  { id: '1', name: 'Just Chatting', viewers: '250K', color: 'from-purple-500 to-indigo-500', icon: Mic },
  { id: '2', name: 'Valorant', viewers: '145K', color: 'from-red-500 to-pink-500', icon: Gamepad2 },
  { id: '3', name: 'Minecraft', viewers: '85K', color: 'from-green-500 to-emerald-500', icon: Gamepad2 },
  { id: '4', name: 'Music', viewers: '42K', color: 'from-blue-500 to-cyan-500', icon: Music },
  { id: '5', name: 'Esports', viewers: '12K', color: 'from-yellow-500 to-orange-500', icon: Trophy },
];

const FEATURED_STREAM = {
  id: 'featured-lck',
  title: 'GRAND FINALS: T1 vs GEN.G - LCK Official Championship',
  streamer: 'LCK Official',
  channel: 'LCK Official',
  game: 'League of Legends',
  viewers: '245K',
  avatar: 'https://picsum.photos/100/100?random=88',
  thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
  duration: 'LIVE',
  sourceType: 'twitch',
  twitchChannel: 'riotgames'
};

const LIVE_CHANNELS = [
  { 
    id: 'live-tenz', 
    streamer: 'TenZ', 
    title: 'RANK 1 GRIND! Valorant Radiant Masterclass', 
    game: 'Valorant', 
    viewers: '42.5K', 
    tags: ['English', 'Pro', 'FPS'],
    avatar: 'https://picsum.photos/50/50?random=101',
    thumbnail: 'https://images.unsplash.com/photo-1624138784180-48145465d61f?q=80&w=400&auto=format&fit=crop',
    sourceType: 'youtube',
    youtubeId: 'j6rF0_3s4tE'
  },
  { 
    id: 'live-tarik', 
    streamer: 'Tarik', 
    title: 'VCT AMERICAS WATCH PARTY & HIGH ELO', 
    game: 'Valorant', 
    viewers: '85.3K', 
    tags: ['Esports', 'Watch Party'],
    avatar: 'https://picsum.photos/50/50?random=103',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&auto=format&fit=crop',
    sourceType: 'twitch',
    twitchChannel: 'tarik'
  },
  { 
    id: 'live-minecraft', 
    streamer: 'Minecraft Live', 
    title: 'Minecraft World Championship Live Showcase', 
    game: 'Minecraft', 
    viewers: '68.1K', 
    tags: ['Creative', 'Tournament', 'Kids'],
    avatar: 'https://picsum.photos/50/50?random=104',
    thumbnail: 'https://images.unsplash.com/photo-1607677914754-58a36d240214?q=80&w=400&auto=format&fit=crop',
    sourceType: 'twitch',
    twitchChannel: 'minecraft'
  }
];

const VIDEOS = [
  { id: '201', title: 'I Spent 100 Days in Mega Treehouse Minecraft', channel: 'BlockMaster Tim', views: '5.2M', time: '2 days ago', duration: '18:45', thumbnail: 'https://images.unsplash.com/photo-1607677914754-58a36d240214?q=80&w=400&auto=format&fit=crop', avatar: 'https://picsum.photos/50/50?random=50', sourceType: 'youtube', youtubeId: 'W_7LqXj2C70' },
  { id: '202', title: 'Escape The Giant Rainbow Lava Obby!', channel: 'RainbowGamer Squad', views: '3.2M', time: '1 day ago', duration: '12:20', thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop', avatar: 'https://picsum.photos/50/50?random=51', sourceType: 'youtube', youtubeId: 'kJQP7kiw5Fk' },
  { id: '203', title: 'Super Mario Wonder - All Hidden Wonder Seeds', channel: 'NintendoNerd Joy', views: '1.9M', time: '3 days ago', duration: '15:10', thumbnail: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=400&auto=format&fit=crop', avatar: 'https://picsum.photos/50/50?random=52', sourceType: 'youtube', youtubeId: 'J3_A0-4H-pA' },
  { id: '204', title: 'Top 50 Satisfying Rocket League Aerial Goals', channel: 'TurboBoost TV', views: '1.5M', time: '4 days ago', duration: '09:50', thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&auto=format&fit=crop', avatar: 'https://picsum.photos/50/50?random=53', sourceType: 'youtube', youtubeId: 'lq7eB84fX_M' },
  { id: '205', title: 'Building the Ultimate Dream Gaming Setup 2026', channel: 'SetupWars', views: '1.8M', time: '1 day ago', duration: '19:40', thumbnail: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=400&auto=format&fit=crop', avatar: 'https://picsum.photos/50/50?random=54', sourceType: 'youtube', youtubeId: 'BL4DCEp7blY' },
  { id: '206', title: 'Shadow of the Erdtree - All Secret Boss Locations', channel: 'VaatiVid', views: '3.1M', time: '5 days ago', duration: '35:40', thumbnail: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=400&auto=format&fit=crop', avatar: 'https://picsum.photos/50/50?random=55', sourceType: 'youtube', youtubeId: 'h8qT1-t-PBs' },
  { id: '207', title: 'Minecraft World Record Speedrun Explained', channel: 'SpeedrunCentral', views: '2.8M', time: '2 hours ago', duration: '14:22', thumbnail: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?q=80&w=400&auto=format&fit=crop', avatar: 'https://picsum.photos/50/50?random=56', sourceType: 'youtube', youtubeId: 'rV3bZl68y1s' },
  { id: '208', title: 'Funniest Gaming Fails & Instant Karma Moments', channel: 'ClutchKarma', views: '5.6M', time: '3 days ago', duration: '13:55', thumbnail: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=400&auto=format&fit=crop', avatar: 'https://picsum.photos/50/50?random=57', sourceType: 'youtube', youtubeId: '9y4f_Q28Z_w' },
];

export const BrowseView: React.FC = () => {
  const [browseSection, setBrowseSection] = useState<'streams' | 'social'>('streams');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<CreatorChannel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiChannels, setAiChannels] = useState<CreatorChannel[]>([]);
  const [aiVideos, setAiVideos] = useState<any[]>([]);
  const [aiSearchLoading, setAiSearchLoading] = useState<boolean>(false);
  
  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [progress, setProgress] = useState(0);

  const [isJunior, setIsJunior] = useState<boolean>(isJuniorModeEnabled());
  const [recommendedVideos, setRecommendedVideos] = useState<ScoredVideo[]>(() => getPersonalizedRecommendations(12, isJuniorModeEnabled()));

  // Interaction State
  const [likes, setLikes] = useState(125000);
  const [isLiked, setIsLiked] = useState(false);

  // Sync Recommendation Engine & Junior Mode
  useEffect(() => {
    const syncAlgo = () => {
      const junior = isJuniorModeEnabled();
      setIsJunior(junior);
      setRecommendedVideos(getPersonalizedRecommendations(12, junior));
    };
    window.addEventListener('nexus_recommendations_updated', syncAlgo);
    window.addEventListener('nexus_junior_mode_changed', syncAlgo);
    return () => {
      window.removeEventListener('nexus_recommendations_updated', syncAlgo);
      window.removeEventListener('nexus_junior_mode_changed', syncAlgo);
    };
  }, []);

  // Track search terms into recommendation algorithm & trigger live AI media discovery
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        trackSearch(searchQuery);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Live AI-grounded YouTube and Twitch search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setAiChannels([]);
      setAiVideos([]);
      setAiSearchLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setAiSearchLoading(true);
        const res = await fetch('/api/search-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery.trim(), juniorMode: isJunior })
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.channels)) {
            setAiChannels(data.channels);
          }
          if (Array.isArray(data.videos)) {
            setAiVideos(data.videos);
          }
        }
      } catch (err) {
        console.warn('Live search media error:', err);
      } finally {
        setAiSearchLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery, isJunior]);

  // Ambient Music State
  const [isAmbientMusic, setIsAmbientMusic] = useState(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // "Harry Potter" style magical background music
    bgmRef.current = new Audio('https://assets.mixkit.co/music/preview/mixkit-fantasy-mystery-558.mp3'); 
    bgmRef.current.volume = 0.2;
    bgmRef.current.loop = true;

    return () => {
        if (bgmRef.current) {
            bgmRef.current.pause();
            bgmRef.current = null;
        }
    };
  }, []);

  const toggleAmbientMusic = () => {
      if (!bgmRef.current) return;

      if (isAmbientMusic) {
          bgmRef.current.pause();
          setIsAmbientMusic(false);
      } else {
          bgmRef.current.play().catch(e => {
              console.log("Audio autoplay blocked or failed.", e);
          });
          setIsAmbientMusic(true);
      }
  };

  const handleVideoClick = (video: any) => {
    // Play generic click sound
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-interface-click-901.mp3', 'system', 0.5);

    const enrichedVideo = {
      id: video.id || `browse-${Date.now()}`,
      title: video.title,
      author: video.channel || video.streamer || video.author || 'Nexus Creator',
      views: video.views || video.viewers || '1.2M',
      duration: video.duration || 'LIVE',
      category: video.game || video.category || 'Gaming',
      tags: video.tags || ['Gaming', 'Stream'],
      thumbnail: video.thumbnail || (video.youtubeId ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop'),
      channelAvatar: video.avatar || video.channelAvatar,
      sourceType: video.sourceType || (video.twitchChannel ? 'twitch' : 'youtube'),
      youtubeId: video.youtubeId || (video.sourceType === 'youtube' ? video.id : undefined),
      twitchChannel: video.twitchChannel,
      videoUrl: video.videoUrl,
      likes: video.likes || Math.floor(Math.random() * 500000) + 10000,
      kidFriendly: isJunior
    };

    setSelectedVideo(enrichedVideo);
    setIsPlaying(true);
    setProgress(15);

    // Reset interaction state for new video
    setLikes(enrichedVideo.likes);
    setIsLiked(false);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
    setIsPlaying(false);
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const toggleLike = () => {
    if (isLiked) {
        setLikes(prev => prev - 1);
        setIsLiked(false);
    } else {
        setLikes(prev => prev + 1);
        setIsLiked(true);
        // Play magical sparkle sound on like
        playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-magical-glitter-sparkle-2629.mp3', 'system', 0.6);
    }
  };

  // Search Results: Channel and Video matching
  const trimmedSearch = searchQuery.trim().toLowerCase();
  const localMatchedChannels = trimmedSearch ? searchLocalCreators(searchQuery, isJunior) : [];
  const allMatchedChannels = [...localMatchedChannels];
  aiChannels.forEach(aiChan => {
    if (!allMatchedChannels.some(c => c.id.toLowerCase() === aiChan.id.toLowerCase() || c.name.toLowerCase() === aiChan.name.toLowerCase())) {
      allMatchedChannels.push(aiChan);
    }
  });

  const filteredLiveChannels = LIVE_CHANNELS.filter(channel => 
    channel.title.toLowerCase().includes(trimmedSearch) ||
    channel.streamer.toLowerCase().includes(trimmedSearch) ||
    channel.game.toLowerCase().includes(trimmedSearch)
  );

  const localFilteredVideos = VIDEOS.filter(video => 
    video.title.toLowerCase().includes(trimmedSearch) ||
    video.channel.toLowerCase().includes(trimmedSearch)
  );

  // Search through global VIDEO_CATALOG
  const catalogFilteredVideos = VIDEO_CATALOG.filter(video => {
    if (isJunior && !video.kidFriendly) return false;
    const titleHit = video.title.toLowerCase().includes(trimmedSearch);
    const authorHit = video.author.toLowerCase().includes(trimmedSearch);
    const catHit = video.category?.toLowerCase().includes(trimmedSearch);
    const tagHit = video.tags?.some(t => t.toLowerCase().includes(trimmedSearch));
    return titleHit || authorHit || catHit || tagHit;
  });

  // Check if search query is a direct YouTube/Twitch URL or video ID
  const directStreamParsed = trimmedSearch.length >= 8 ? parseMediaStreamUrl(searchQuery.trim()) : null;
  const directProjected = (directStreamParsed && (directStreamParsed.sourceType === 'youtube' || directStreamParsed.sourceType === 'twitch'))
    ? [createProjectedVideo(searchQuery.trim(), undefined, isJunior)]
    : [];

  // Collect videos from matched channels
  const channelVideos = allMatchedChannels.flatMap(c => c.videos || []);
  const allSearchVideos: any[] = [...directProjected];

  // Helper to deduplicate and attach original thumbnail
  const addVideoIfNotPresent = (v: any) => {
    const yId = v.youtubeId || (v.sourceType === 'youtube' ? v.id : undefined);
    const thumb = getVideoThumbnail({
      thumbnail: v.thumbnail,
      youtubeId: yId,
      sourceType: v.sourceType,
      twitchChannel: v.twitchChannel
    });
    const enriched = {
      ...v,
      thumbnail: thumb,
      youtubeId: yId,
      author: v.author || v.channel || v.streamer || 'Nexus Creator'
    };
    if (!allSearchVideos.some(existing => (existing.youtubeId && existing.youtubeId === yId) || existing.id === v.id || existing.title === v.title)) {
      allSearchVideos.push(enriched);
    }
  };

  catalogFilteredVideos.forEach(addVideoIfNotPresent);
  channelVideos.forEach(addVideoIfNotPresent);
  localFilteredVideos.forEach(addVideoIfNotPresent);
  aiVideos.forEach(addVideoIfNotPresent);

  const hasResults = allMatchedChannels.length > 0 || filteredLiveChannels.length > 0 || allSearchVideos.length > 0;

  const TRENDING_SEARCHES = [
    'MrBeast', 'DanTDM', 'PewDiePie', 'Kai Cenat', 'TenZ', 'Tarik', 
    'Ninja', 'Aphmau', 'Shroud', 'Minecraft 100 Days', 'Elden Ring DLC', 
    'Linus Tech Tips', 'Roblox Obby'
  ];

  return (
    <div className="h-full flex flex-col bg-[#0f1014] text-white overflow-y-auto custom-scrollbar">
      
      {/* --- Search Bar Section --- */}
      <div className="sticky top-0 z-40 bg-[#0f1014]/80 backdrop-blur-xl border-b border-white/5 p-2.5 xs:p-3 sm:p-4">
        <div className="max-w-4xl mx-auto relative group">
            <Search className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 w-4 h-4 sm:w-5 sm:h-5 ${isSearching ? 'text-purple-500' : 'text-slate-500'}`} />
            <input 
                type="text"
                placeholder="Search streams, videos, gamers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearching(true)}
                onBlur={() => !searchQuery && setIsSearching(false)}
                className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl py-2 xs:py-2.5 sm:py-3 pl-9 sm:pl-12 pr-9 sm:pr-12 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
            />
            {searchQuery && (
                <button 
                    onClick={() => { setSearchQuery(''); setIsSearching(false); }}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X size={15} className="text-slate-400" />
                </button>
            )}
        </div>
        
        {/* Trending Searches Pills */}
        {isSearching && !searchQuery && (
            <div className="max-w-4xl mx-auto mt-4 flex flex-wrap gap-2 animate-fadeIn">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mr-2"><Sparkles size={12} /> Trending:</span>
                {TRENDING_SEARCHES.map(term => (
                    <button 
                        key={term} 
                        onClick={() => setSearchQuery(term)}
                        className="px-3 py-1 bg-white/5 hover:bg-purple-600/20 border border-white/5 hover:border-purple-500/50 rounded-full text-xs text-slate-400 hover:text-purple-400 transition-all"
                    >
                        {term}
                    </button>
                ))}
            </div>
        )}

        {/* --- Top Navigation Tabs: Streams vs Social Feed --- */}
        {!searchQuery && (
          <div className="max-w-4xl mx-auto mt-3.5 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 p-1 rounded-2xl bg-black/50 border border-white/5">
              <button
                type="button"
                onClick={() => setBrowseSection('streams')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  browseSection === 'streams'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Video size={14} />
                <span>Live Streams & VODs</span>
              </button>
              <button
                type="button"
                onClick={() => setBrowseSection('social')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  browseSection === 'social'
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Radio size={14} className="text-cyan-400 animate-pulse" />
                <span>AI Social Feed</span>
                <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-black uppercase">
                  Live Intel
                </span>
              </button>
            </div>

            <div className="text-xs font-medium text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Nexus Content Network Active</span>
            </div>
          </div>
        )}
      </div>

      {!searchQuery ? (
        browseSection === 'social' ? (
          <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full">
            <SocialFeedSection onPlayClip={handleVideoClick} />
          </div>
        ) : (
        <>
          {/* --- Featured Hero Section (Twitch Style) --- */}
      <div className="relative w-full h-[260px] xs:h-[320px] sm:h-[400px] md:h-[500px] shrink-0 group">
         <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-transparent to-transparent z-10"></div>
         <img src={FEATURED_STREAM.thumbnail} className="w-full h-full object-cover opacity-80" alt="Featured" />
         
         {/* Magical Ambience Toggle */}
         <button 
            onClick={toggleAmbientMusic}
            className={`absolute top-3 right-3 sm:top-6 sm:right-6 z-30 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-md border transition-all duration-300
                ${isAmbientMusic 
                    ? 'bg-purple-600/80 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)]' 
                    : 'bg-black/40 border-white/10 text-slate-300 hover:bg-black/60 hover:text-white'}
            `}
         >
             <Sparkles size={14} className={`sm:w-4 sm:h-4 ${isAmbientMusic ? 'animate-spin-slow text-yellow-300' : ''}`} />
             <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{isAmbientMusic ? 'Ambience On' : 'Ambience'}</span>
         </button>

         <div className="absolute bottom-0 left-0 p-3.5 xs:p-5 sm:p-8 z-20 w-full max-w-4xl">
            <div className="flex items-start gap-2.5 xs:gap-3.5 sm:gap-4 animate-slideUp">
                <img src={FEATURED_STREAM.avatar} className="w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl border-2 border-purple-500 shadow-lg shadow-purple-500/20 shrink-0" alt="Streamer" />
                <div className="min-w-0">
                    <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold mb-1 sm:mb-2 inline-block">FEATURED</span>
                    <h1 className="text-base xs:text-xl sm:text-3xl md:text-4xl font-black mb-1 sm:mb-2 drop-shadow-lg truncate">{FEATURED_STREAM.title}</h1>
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium flex-wrap">
                        <span className="text-purple-400 font-bold">{FEATURED_STREAM.streamer}</span>
                        <span className="text-slate-300 hidden xs:inline">•</span>
                        <span className="text-slate-300">{FEATURED_STREAM.game}</span>
                        <span className="flex items-center gap-1 text-red-500"><Signal size={14} /> {FEATURED_STREAM.viewers}</span>
                    </div>
                    <p className="mt-1 xs:mt-2 sm:mt-4 text-slate-300 max-w-xl text-[11px] sm:text-sm line-clamp-1 xs:line-clamp-2">The ultimate showdown begins! Watch the best teams in the world compete for the championship trophy in this historic best of 5 series.</p>
                    
                    <div className="mt-2.5 xs:mt-4 sm:mt-6 flex gap-2 sm:gap-4">
                        <button 
                            onClick={() => handleVideoClick(FEATURED_STREAM)}
                            className="px-3.5 xs:px-5 sm:px-6 py-1.5 xs:py-2.5 sm:py-3 bg-white text-black font-bold text-xs sm:text-sm rounded-xl hover:scale-105 transition-transform flex items-center gap-1.5 sm:gap-2 shadow-lg"
                        >
                            <Play size={16} fill="black" /> Watch Now
                        </button>
                    </div>
                </div>
            </div>
         </div>
         
         <div className="absolute top-1/2 right-8 transform -translate-y-1/2 hidden lg:block opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-10 group-hover:translate-x-0">
             <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 w-64">
                <h4 className="font-bold mb-2 text-slate-300 uppercase text-xs tracking-wider">Up Next</h4>
                <div className="space-y-3">
                    {[1,2,3].map(i => (
                        <div key={i} className="flex gap-3 items-center hover:bg-white/5 p-2 rounded-lg cursor-pointer transition-colors">
                            <img src={`https://picsum.photos/50/50?random=${i+50}`} className="w-10 h-10 rounded-lg" />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">Faker's POV</p>
                                <p className="text-xs text-slate-400">LoL Esports</p>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
         </div>
      </div>

      <div className="p-6 md:p-8 space-y-12">
        
        {/* --- YouTube-Style Personalized Recommendations (Always featured prominently) --- */}
        <section className="bg-gradient-to-b from-purple-950/20 to-transparent p-4 sm:p-6 rounded-[2rem] border border-white/5">
            <PersonalizedVideoShelf 
                title="Personalized Video Feed" 
                subtitle="Real-time YouTube-style algorithm tuned to your watch time, likes & searches" 
                limit={6} 
            />
        </section>

        {/* --- Featured Creators in Nexus Theme (YouTube & Twitch Channels) --- */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Users className="text-purple-400" size={18} />
                <span>{isJunior ? 'Kid-Friendly Gaming Creators' : 'Featured Creators in Nexus Theme'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Browse YouTube & Twitch channels rendered directly inside our custom theme
              </p>
            </div>
            {isJunior && (
              <span className="text-xs font-bold text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                Kid-Safe Verified ✨
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(isJunior ? CREATOR_DIRECTORY.filter(c => c.kidFriendly) : CREATOR_DIRECTORY).slice(0, 4).map(creator => (
              <div
                key={creator.id}
                onClick={() => {
                  playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.4);
                  setSelectedChannel(creator);
                }}
                className="group relative rounded-2xl overflow-hidden bg-[#151622] border border-white/5 hover:border-purple-500/40 p-4 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-purple-500/40 shrink-0">
                    <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    {creator.isLive && (
                      <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-black animate-pulse" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <h4 className="font-bold text-sm text-white truncate group-hover:text-purple-300 transition-colors">{creator.name}</h4>
                      {creator.verified && <CheckCircle2 size={13} className="text-purple-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-purple-400 font-medium">{creator.handle}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{creator.subscribers}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-slate-300">
                    {creator.platform === 'both' ? 'YT & Twitch' : creator.platform === 'twitch' ? 'Twitch' : 'YouTube'}
                  </span>
                  <span className="text-purple-400 font-bold group-hover:underline flex items-center gap-1">
                    View Channel →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Categories Filters --- */}
        <section>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                    {isJunior ? <Star className="text-amber-400" size={18} /> : <Gamepad2 className="text-purple-400" size={18} />}
                    <span>{isJunior ? 'Kid-Friendly Categories' : 'Browse Categories'}</span>
                </h3>
                {isJunior && (
                    <span className="text-xs font-bold text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                        Junior Filter Active ✨
                    </span>
                )}
            </div>

            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {(isJunior ? [
                    { id: 'j1', name: '⛏️ Minecraft', viewers: '320K', color: 'from-emerald-500 to-green-600', icon: Gamepad2 },
                    { id: 'j2', name: '🌈 Roblox', viewers: '410K', color: 'from-pink-500 to-rose-600', icon: Rocket },
                    { id: 'j3', name: '🍄 Nintendo & Mario', viewers: '180K', color: 'from-red-500 to-amber-500', icon: Star },
                    { id: 'j4', name: '⚽ Sports & Goals', viewers: '95K', color: 'from-blue-500 to-cyan-500', icon: Trophy },
                    { id: 'j5', name: '🧱 LEGO Builds', viewers: '150K', color: 'from-yellow-500 to-orange-500', icon: Sparkles },
                    { id: 'j6', name: '😂 Funny Clips', viewers: '280K', color: 'from-purple-500 to-indigo-500', icon: Mic },
                ] : CATEGORIES).map(cat => (
                    <div 
                        key={cat.id} 
                        onClick={() => {
                            setActiveCategory(cat.name);
                            playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.4);
                        }}
                        className="flex-shrink-0 group cursor-pointer"
                    >
                        <div className={`w-36 h-36 rounded-2xl bg-gradient-to-br ${cat.color} p-4 relative overflow-hidden transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-2xl select-none ${
                            activeCategory === cat.name ? 'ring-4 ring-white shadow-xl scale-105' : ''
                        }`}>
                            <h3 className="font-bold text-xl relative z-10 leading-snug">{cat.name}</h3>
                            <p className="text-xs opacity-80 relative z-10 mt-1">{cat.viewers} watching</p>
                            <cat.icon className="absolute -bottom-4 -right-4 text-white/20 w-24 h-24 transform group-hover:rotate-12 transition-transform" />
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* --- Live Channels Grid --- */}
        {!isJunior && (
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span> 
                        Live Channels
                    </h2>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><Filter size={20}/></button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {LIVE_CHANNELS.map(channel => (
                        <div key={channel.id} className="group cursor-pointer" onClick={() => handleVideoClick(channel)}>
                            <div className="relative aspect-video rounded-xl overflow-hidden mb-3 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/20 group-hover:ring-1 group-hover:ring-white/10">
                                <img src={channel.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={channel.title} />
                                <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                                    <Signal size={10} /> Live
                                </div>
                                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded">
                                    {channel.viewers} viewers
                                </div>
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-purple-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                    <Play size={48} className="text-white drop-shadow-lg scale-50 group-hover:scale-100 transition-transform duration-300 ease-out" fill="white" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <img src={channel.avatar} className="w-10 h-10 rounded-full ring-2 ring-transparent group-hover:ring-purple-500 transition-all" alt="Avatar" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm text-white truncate group-hover:text-purple-400 transition-colors">{channel.title}</h3>
                                    <p className="text-xs text-slate-400 mt-1">{channel.streamer}</p>
                                    <p className="text-xs text-slate-500 mt-0.5 hover:text-purple-400 transition-colors cursor-pointer">{channel.game}</p>
                                    <div className="flex gap-2 mt-2">
                                        {channel.tags.map(tag => (
                                            <span key={tag} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full hover:bg-slate-700 transition-colors">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button className="self-start text-slate-500 hover:text-white"><MoreVertical size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

      </div>
        </>
        )
      ) : (
        /* --- Search Results Screen with Creator Channels & Videos in Nexus Theme --- */
        <div className="p-6 md:p-8 space-y-10 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <span>Search Results for</span>
                    <span className="text-purple-400">"{searchQuery}"</span>
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                    Found {allMatchedChannels.length} creator channels & {allSearchVideos.length + filteredLiveChannels.length} videos
                  </p>
                </div>

                {aiSearchLoading && (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-bold animate-pulse">
                    <Loader2 size={14} className="animate-spin text-purple-400" />
                    <span>Live AI YouTube & Twitch Search...</span>
                  </div>
                )}
            </div>

            {!hasResults && !aiSearchLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
                        <Search size={40} className="text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No matches found</h3>
                    <p className="text-slate-500 max-w-xs">We couldn't find any videos or channels matching "{searchQuery}". Try different keywords or click a popular creator below.</p>
                    <div className="flex flex-wrap gap-2 justify-center max-w-md mt-6">
                      {['TenZ', 'MrBeast', 'DanTDM', 'Shroud', 'Tarik', 'Minecraft Speedrun'].map(tag => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-purple-600/20 text-xs font-bold text-slate-300 border border-white/10"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* --- MATCHED CREATOR CHANNELS IN NEXUS THEME --- */}
                    {allMatchedChannels.length > 0 && (
                      <section className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-black text-white flex items-center gap-2">
                            <Users size={18} className="text-purple-400" />
                            <span>Creator Channels in Nexus Theme</span>
                          </h3>
                          <span className="text-xs text-slate-400 font-semibold">
                            Click to open full channel profile
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {allMatchedChannels.map(creator => (
                            <div
                              key={creator.id}
                              onClick={() => {
                                playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.4);
                                setSelectedChannel(creator);
                              }}
                              className="group relative rounded-3xl overflow-hidden bg-[#14151e] border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer shadow-xl hover:shadow-2xl flex flex-col justify-between"
                            >
                              {/* Banner Preview */}
                              <div className="relative h-24 w-full overflow-hidden bg-black/40">
                                <img src={creator.banner} alt={creator.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#14151e] to-transparent" />
                                
                                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold text-slate-200">
                                  {creator.platform === 'twitch' ? (
                                    <span className="text-[#bf94ff] flex items-center gap-1"><Radio size={10} /> Twitch Channel</span>
                                  ) : creator.platform === 'both' ? (
                                    <span className="text-purple-300 flex items-center gap-1"><Sparkles size={10} /> YT & Twitch</span>
                                  ) : (
                                    <span className="text-red-400 flex items-center gap-1"><Tv size={10} /> YouTube Channel</span>
                                  )}
                                </div>
                              </div>

                              {/* Content Body */}
                              <div className="p-5 pt-0 relative z-10 -mt-8 flex-1 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-end gap-3 mb-3">
                                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden ring-3 ring-[#14151e] bg-black shadow-lg shrink-0">
                                      <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
                                      {creator.isLive && (
                                        <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border border-black animate-pulse" />
                                      )}
                                    </div>
                                    <div className="min-w-0 pb-0.5">
                                      <div className="flex items-center gap-1">
                                        <h4 className="font-black text-sm text-white truncate group-hover:text-purple-300 transition-colors">{creator.name}</h4>
                                        {creator.verified && <CheckCircle2 size={13} className="text-purple-400 shrink-0" />}
                                      </div>
                                      <p className="text-xs text-purple-400 font-medium">{creator.handle}</p>
                                    </div>
                                  </div>

                                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                                    {creator.bio}
                                  </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                                  <span className="text-[11px] font-semibold text-slate-400">{creator.subscribers}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedChannel(creator);
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold transition-all"
                                  >
                                    View Channel in Nexus →
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* --- MATCHING VIDEOS WITH AUTHENTIC ORIGINAL THUMBNAILS --- */}
                    {allSearchVideos.length > 0 && (
                      <section className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-black text-white flex items-center gap-2">
                            <Video size={18} className="text-purple-400" />
                            <span>Matching Videos (Direct YouTube Streams)</span>
                          </h3>
                          <span className="text-xs text-slate-400 font-semibold">
                            Plays inside Nexus with original YouTube thumbnails
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                          {allSearchVideos.map(video => (
                            <div
                              key={video.id}
                              onClick={() => handleVideoClick(video)}
                              className="group relative rounded-2xl overflow-hidden cursor-pointer bg-[#14151e] border border-white/5 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl flex flex-col justify-between"
                            >
                              {/* Authentic Original YouTube Thumbnail */}
                              <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                                <img
                                  src={getVideoThumbnail(video)}
                                  alt={video.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  onError={(e) => {
                                    if (video.youtubeId) {
                                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                                    }
                                  }}
                                />

                                {/* Duration Badge */}
                                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-white font-mono text-xs font-bold shadow-md">
                                  {video.duration}
                                </div>

                                {/* Provider badge */}
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold text-red-400 flex items-center gap-1">
                                  <Tv size={10} /> YouTube
                                </div>

                                {/* Hover Play Overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                  <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
                                    <Play size={20} fill="currentColor" className="ml-0.5" />
                                  </div>
                                </div>
                              </div>

                              {/* Details */}
                              <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                  <h4 className="font-bold text-sm text-white line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors">
                                    {video.title}
                                  </h4>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                                  <span className="truncate max-w-[130px] font-medium text-slate-300">{video.channel || video.author}</span>
                                  <span>{video.views}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                </>
            )}
        </div>
      )}

      {/* --- Channel Profile Modal in Nexus Theme --- */}
      {selectedChannel && (
        <ChannelProfileModal
          channel={selectedChannel}
          onClose={() => setSelectedChannel(null)}
          onSelectVideo={handleVideoClick}
        />
      )}

      {/* --- Video Player Modal with Direct Server Streaming --- */}
      {selectedVideo && (
        <VideoPlayerModal 
          video={selectedVideo} 
          onClose={closeVideo} 
          onSelectVideo={(v) => setSelectedVideo(v)} 
        />
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        @keyframes zoomIn {
            0% { opacity: 0; transform: scale(0.5); }
            100% { opacity: 1; transform: scale(1); }
        }
        .animate-zoomIn {
            animation: zoomIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes slideUp {
             0% { opacity: 0; transform: translateY(20px); }
             100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
             animation: slideUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
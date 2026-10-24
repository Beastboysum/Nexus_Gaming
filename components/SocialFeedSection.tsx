import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Flame, 
  MessageCircle, 
  Heart, 
  Share2, 
  Bookmark, 
  Play, 
  CheckCircle2, 
  TrendingUp, 
  Radio, 
  Zap, 
  Clock, 
  Eye, 
  RefreshCw, 
  Filter, 
  Send, 
  Award,
  ShieldAlert,
  ChevronDown,
  Volume2
} from 'lucide-react';
import { playCategorizedAudio } from '../services/audioManager';
import { HDImage } from './HDImage';

export interface SocialClipPost {
  id: string;
  creator: {
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
    role: string;
    roleColor: string;
  };
  game: string;
  title: string;
  timestamp: string;
  thumbnail: string;
  duration: string;
  aiTag: string;
  aiAnalysis: string;
  likes: number;
  commentsCount: number;
  shares: number;
  views: string;
  category: 'clip' | 'meta' | 'clutch' | 'meme';
  isNew?: boolean;
  sourceType?: 'youtube' | 'twitch';
  youtubeId?: string;
  twitchChannel?: string;
}

const INITIAL_POSTS: SocialClipPost[] = [
  {
    id: 'post-1',
    creator: {
      name: 'Tyson Ngo (TenZ)',
      handle: '@TenZ',
      avatar: 'https://picsum.photos/100/100?random=101',
      verified: true,
      role: 'Pro Player',
      roleColor: 'text-red-400 bg-red-500/10 border-red-500/30',
    },
    game: 'Valorant',
    title: 'The VALORANT Ultimate Guide for Beginners !! | SEN TenZ',
    timestamp: '2m ago',
    thumbnail: 'https://i.ytimg.com/vi/3xjpx8-2gD0/maxresdefault.jpg',
    duration: '23:04',
    aiTag: 'AI Highlight: 99.4% Precision',
    aiAnalysis: 'AI Vision Telemetry: 142ms average trigger reaction time. Crosshair placement deviation < 1.2° during flick on 4th enemy. Win probability adjusted from 1.8% to 100%.',
    likes: 4210,
    commentsCount: 382,
    shares: 1120,
    views: '1.2M',
    category: 'clutch',
    isNew: true,
    sourceType: 'youtube',
    youtubeId: '3xjpx8-2gD0',
  },
  {
    id: 'post-2',
    creator: {
      name: 'VALORANT Champions Tour',
      handle: '@ValorantEsports',
      avatar: 'https://picsum.photos/100/100?random=105',
      verified: true,
      role: 'Official',
      roleColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
    game: 'Valorant',
    title: 'LOUD vs. VIT — FULL MATCH — VALORANT Champions Shanghai',
    timestamp: '14m ago',
    thumbnail: 'https://i.ytimg.com/vi/lXdvR5iMU3Y/maxresdefault.jpg',
    duration: '2:22:01',
    aiTag: 'AI Meta Pulse: Grand Finals',
    aiAnalysis: 'AI Meta Engine: Cypher trap wire positioning on Sunset B Main shifted defense win-rate to 56.4%. Phantom pick rate surged +18% following Vandal falloff tuning.',
    likes: 8940,
    commentsCount: 954,
    shares: 3410,
    views: '1.5M',
    category: 'meta',
    sourceType: 'youtube',
    youtubeId: 'lXdvR5iMU3Y',
  },
  {
    id: 'post-3',
    creator: {
      name: 'Counter-Strike Official',
      handle: '@CS2',
      avatar: 'https://picsum.photos/100/100?random=103',
      verified: true,
      role: 'AWPer',
      roleColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    game: 'Counter-Strike 2',
    title: 'Counter-Strike 2 - Official Launch Trailer & Highlights',
    timestamp: '32m ago',
    thumbnail: 'https://i.ytimg.com/vi/c80dVYcL69E/maxresdefault.jpg',
    duration: '13:55',
    aiTag: 'AI Highlight: Smoke Physics',
    aiAnalysis: 'AI Audio Sensor: Volumetric smoke interaction with HE grenade explosion verified 100% responsive. Bullet penetration trajectory accurate to 0.01mm.',
    likes: 6720,
    commentsCount: 512,
    shares: 2190,
    views: '5.6M',
    category: 'clutch',
    sourceType: 'youtube',
    youtubeId: 'c80dVYcL69E',
  },
  {
    id: 'post-4',
    creator: {
      name: 'ConCon Souls',
      handle: '@ConCon',
      avatar: 'https://picsum.photos/100/100?random=88',
      verified: true,
      role: 'Soulslike Pro',
      roleColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    },
    game: 'Elden Ring',
    title: 'What Boss Order to BEAT the Shadow of the Erdtree DLC',
    timestamp: '1h ago',
    thumbnail: 'https://i.ytimg.com/vi/qXKvuRw-4R0/maxresdefault.jpg',
    duration: '32:37',
    aiTag: 'AI Tactical Route: Boss Order',
    aiAnalysis: 'AI Tactical Analysis: Route planning maximizes Scadutree fragment collection efficiency before facing Rellana and Messmer.',
    likes: 19400,
    commentsCount: 2310,
    shares: 8400,
    views: '664K',
    category: 'clip',
    sourceType: 'youtube',
    youtubeId: 'qXKvuRw-4R0',
  },
  {
    id: 'post-5',
    creator: {
      name: 'Linus Tech Tips',
      handle: '@LinusTech',
      avatar: 'https://picsum.photos/100/100?random=108',
      verified: true,
      role: 'Hardware Guru',
      roleColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    },
    game: 'Hardware',
    title: 'We Built the BEST PC - Ultimate Gaming Setup',
    timestamp: '2h ago',
    thumbnail: 'https://i.ytimg.com/vi/X8sgBpmdCT8/maxresdefault.jpg',
    duration: '13:43',
    aiTag: 'AI Hardware Pulse: Dream Rig',
    aiAnalysis: 'AI Thermal Benchmark: 360mm AIO liquid loop sustained <62°C under 100% synthetic stress test. Zero thermal throttling measured.',
    likes: 5120,
    commentsCount: 420,
    shares: 980,
    views: '4.5M',
    category: 'meta',
    sourceType: 'youtube',
    youtubeId: 'X8sgBpmdCT8',
  },
];

const LIVE_DROP_POOL: Omit<SocialClipPost, 'id' | 'timestamp'>[] = [
  {
    creator: {
      name: 'Tarik Celik (tarik)',
      handle: '@tarik',
      avatar: 'https://picsum.photos/100/100?random=109',
      verified: true,
      role: 'Content King',
      roleColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    game: 'Valorant',
    title: 'VCT AMERICAS WATCH PARTY & HIGH ELO WITH PROS',
    thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_tarik-1280x720.jpg',
    duration: 'LIVE',
    aiTag: 'AI Highlight: Live Twitch',
    aiAnalysis: 'Live Broadcast Radar: Tarik hosting co-stream with 85,000 active viewers. Peak round reaction telemetry analyzed.',
    likes: 1240,
    commentsCount: 194,
    shares: 512,
    views: '85.3K',
    category: 'clutch',
    isNew: true,
    sourceType: 'twitch',
    twitchChannel: 'tarik',
  },
  {
    creator: {
      name: 'Shroud',
      handle: '@shroud',
      avatar: 'https://picsum.photos/100/100?random=110',
      verified: true,
      role: 'Aim God',
      roleColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    },
    game: 'Valorant / CS2',
    title: 'Testing the new Sub-Tick networking in Premier Top 500',
    thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_shroud-1280x720.jpg',
    duration: 'LIVE',
    aiTag: 'AI Deep Dive: Sub-Tick',
    aiAnalysis: 'AI Network Profiler: Packet timing variance measured at 7.8ms. Hit registration hit-box alignment 98.7% identical to 128-tick benchmarks.',
    likes: 3890,
    commentsCount: 410,
    shares: 1100,
    views: '64.8K',
    category: 'clip',
    isNew: true,
    sourceType: 'twitch',
    twitchChannel: 'shroud',
  },
];

interface SocialFeedSectionProps {
  onPlayClip?: (clipData: any) => void;
}

export const SocialFeedSection: React.FC<SocialFeedSectionProps> = ({ onPlayClip }) => {
  const [posts, setPosts] = useState<SocialClipPost[]>(INITIAL_POSTS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'clutch' | 'meta' | 'clip'>('all');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, string[]>>({
    'post-1': ['THAT 4TH FLICK WAS IMPOSSIBLE', 'Check his mouse sensor right now 😭', 'TenZ is back in prime form'],
    'post-2': ['Sunset is literally unplayable on attack without Cypher flank', 'Great AI breakdown on the phantom changes'],
  });
  const [newCommentInput, setNewCommentInput] = useState('');
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropIndexRef = useRef(0);

  // Periodically update feed to simulate live activity
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isLiveSimulating) return;

    const interval = setInterval(() => {
      // 1. Tick up likes/views on existing posts
      setPosts((prevPosts) => {
        return prevPosts.map((post) => {
          const randAdd = Math.floor(Math.random() * 5);
          return {
            ...post,
            likes: post.likes + randAdd,
          };
        });
      });

      // 2. Occasionally drop a new live clip
      if (Math.random() > 0.4 && dropIndexRef.current < LIVE_DROP_POOL.length) {
        const nextTemplate = LIVE_DROP_POOL[dropIndexRef.current];
        dropIndexRef.current = (dropIndexRef.current + 1) % LIVE_DROP_POOL.length;

        const newPost: SocialClipPost = {
          ...nextTemplate,
          id: `live-drop-${Date.now()}`,
          timestamp: 'Just now',
          isNew: true,
        };

        setPosts((prev) => [newPost, ...prev.slice(0, 11)]);
        setToastMessage(`⚡ Live Intel Drop: ${newPost.creator.name} just posted a new clip!`);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          setToastMessage(null);
          toastTimeoutRef.current = null;
        }, 4000);
      }
    }, 14000);

    return () => clearInterval(interval);
  }, [isLiveSimulating]);

  const handleManualRefresh = () => {
    const nextTemplate = LIVE_DROP_POOL[dropIndexRef.current % LIVE_DROP_POOL.length];
    dropIndexRef.current += 1;

    const newPost: SocialClipPost = {
      ...nextTemplate,
      id: `live-drop-${Date.now()}`,
      timestamp: 'Just now',
      isNew: true,
    };

    setPosts((prev) => [newPost, ...prev]);
    setToastMessage(`✨ Fresh Live Intel retrieved from Nexus radar!`);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 3000);

    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.5);
  };

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const isCurrentlyLiked = !!prev[postId];
      const nextLiked = !isCurrentlyLiked;
      
      setPosts((currentPosts) =>
        currentPosts.map((p) =>
          p.id === postId
            ? { ...p, likes: p.likes + (nextLiked ? 1 : -1) }
            : p
        )
      );

      return { ...prev, [postId]: nextLiked };
    });

    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-2586.mp3', 'system', 0.5);
  };

  const toggleBookmark = (postId: string) => {
    setBookmarkedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleShare = (postId: string) => {
    const shareUrl = `${window.location.origin}/#clip-${postId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(postId);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const handleAddComment = (postId: string) => {
    if (!newCommentInput.trim()) return;

    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newCommentInput.trim()],
    }));

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
      )
    );

    setNewCommentInput('');
  };

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === 'all') return true;
    return post.category === activeFilter;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-gradient-to-r from-purple-950 via-indigo-900 to-black border border-purple-500/40 text-purple-200 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-slideDown">
          <Radio size={16} className="text-purple-400 animate-pulse" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Hero Header for Social Feed */}
      <div className="relative rounded-3xl p-6 md:p-8 overflow-hidden bg-gradient-to-r from-purple-950/40 via-[#181622] to-indigo-950/40 border border-purple-500/20 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Radio size={12} className="text-purple-400 animate-pulse" />
                Live Gaming Social Feed
              </span>
              <span className="text-xs font-semibold text-slate-400">• AI Telemetry Highlights</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Trending Clips & Community Intel
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl font-medium">
              Real-time feed of tournament highlights, meta shifts, clutch play VODs, and AI-annotated gameplay telemetry. Updates live as creators stream.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleManualRefresh}
              className="px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-purple-900/20"
            >
              <RefreshCw size={14} className="hover:rotate-180 transition-transform duration-500" />
              <span>Simulate Live Drop</span>
            </button>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Feed Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: 'All Content', icon: Sparkles },
            { id: 'clutch', label: 'Pro Clutches', icon: Zap },
            { id: 'meta', label: 'Meta & Analysis', icon: TrendingUp },
            { id: 'clip', label: 'Tournament VODs', icon: Award },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isSelected = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5'
                }`}
              >
                <TabIcon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <span className="text-xs font-bold text-slate-400">
          Showing {filteredPosts.length} curated community items
        </span>
      </div>

      {/* Social Clips Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredPosts.map((post) => {
          const isLiked = !!likedPosts[post.id];
          const isBookmarked = !!bookmarkedPosts[post.id];
          const isCopied = copiedId === post.id;
          const showComments = activeCommentPostId === post.id;
          const commentsList = commentsMap[post.id] || [];

          return (
            <article
              key={post.id}
              className={`rounded-3xl bg-[#14131c] border border-white/10 overflow-hidden shadow-xl hover:border-purple-500/30 transition-all duration-300 flex flex-col justify-between group ${
                post.isNew ? 'ring-1 ring-purple-500/50 shadow-purple-900/20' : ''
              }`}
            >
              {/* Creator Info Row */}
              <div className="p-5 pb-4 flex items-center justify-between gap-3 border-b border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={post.creator.avatar}
                    alt={post.creator.name}
                    className="w-11 h-11 rounded-2xl object-cover ring-2 ring-purple-500/40 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-black text-white truncate">{post.creator.name}</h4>
                      {post.creator.verified && (
                        <CheckCircle2 size={13} className="text-purple-400 fill-purple-400/20 shrink-0" />
                      )}
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${post.creator.roleColor}`}>
                        {post.creator.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{post.creator.handle}</span>
                      <span>•</span>
                      <span className="text-purple-400 font-semibold">{post.game}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock size={11} /> {post.timestamp}
                      </span>
                    </div>
                  </div>
                </div>

                {post.isNew && (
                  <span className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-[10px] font-black uppercase tracking-wider text-red-400 animate-pulse shrink-0">
                    NEW LIVE
                  </span>
                )}
              </div>

              {/* Title & AI Summary */}
              <div className="px-5 pt-4 pb-3 space-y-3">
                <h3 className="text-base font-bold text-white leading-snug group-hover:text-purple-300 transition-colors">
                  {post.title}
                </h3>

                {/* AI Annotated Commentary Box */}
                <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/25 space-y-1.5 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/30 border border-purple-400/30 text-[10px] font-black uppercase tracking-wider text-purple-300 flex items-center gap-1">
                      <Sparkles size={11} className="text-purple-300" />
                      {post.aiTag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {post.aiAnalysis}
                  </p>
                </div>
              </div>

              {/* Video Thumbnail with Interactive Play Button */}
              <div 
                onClick={() => {
                  if (onPlayClip) {
                    onPlayClip({
                      id: post.id,
                      title: post.title,
                      channel: post.creator.name,
                      avatar: post.creator.avatar,
                      thumbnail: post.thumbnail,
                      duration: post.duration,
                      game: post.game,
                      views: post.views,
                      sourceType: post.sourceType || 'youtube',
                      youtubeId: post.youtubeId || '3xjpx8-2gD0',
                      twitchChannel: post.twitchChannel,
                    });
                  }
                }}
                className="relative aspect-video mx-5 rounded-2xl overflow-hidden cursor-pointer group/thumb bg-black shadow-lg"
              >
                <HDImage
                  src={post.thumbnail}
                  youtubeId={post.youtubeId}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500 opacity-90 group-hover/thumb:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>

                {/* Duration Badge */}
                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-sm text-white font-bold text-xs border border-white/10">
                  {post.duration}
                </span>

                {/* Viewers badge */}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-slate-300 font-bold text-[11px] border border-white/10 flex items-center gap-1">
                  <Eye size={12} className="text-purple-400" /> {post.views}
                </span>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-purple-600/90 group-hover/thumb:bg-purple-500 text-white flex items-center justify-center shadow-2xl shadow-purple-600/50 group-hover/thumb:scale-110 transition-all">
                    <Play size={24} fill="currentColor" className="ml-1" />
                  </div>
                </div>
              </div>

              {/* Engagement Action Bar */}
              <div className="p-5 pt-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-t border-white/5 pt-3">
                  <div className="flex items-center gap-4">
                    {/* Like Button */}
                    <button
                      type="button"
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-all active:scale-95 ${
                        isLiked ? 'text-rose-400' : 'hover:text-rose-400'
                      }`}
                    >
                      <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'animate-bounce' : ''} />
                      <span>{post.likes.toLocaleString()}</span>
                    </button>

                    {/* Comment Toggle */}
                    <button
                      type="button"
                      onClick={() => setActiveCommentPostId(showComments ? null : post.id)}
                      className={`flex items-center gap-1.5 transition-all active:scale-95 ${
                        showComments ? 'text-purple-400' : 'hover:text-purple-400'
                      }`}
                    >
                      <MessageCircle size={16} />
                      <span>{post.commentsCount}</span>
                    </button>

                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={() => handleShare(post.id)}
                      className="flex items-center gap-1.5 hover:text-cyan-400 transition-all active:scale-95"
                    >
                      <Share2 size={16} />
                      <span>{isCopied ? 'Copied!' : post.shares}</span>
                    </button>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={() => toggleBookmark(post.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isBookmarked ? 'text-amber-400' : 'hover:text-amber-400'
                    }`}
                  >
                    <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Expandable Comment Thread */}
                {showComments && (
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-3 animate-fadeIn">
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {commentsList.map((c, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-white/5 text-xs text-slate-300">
                          <span className="font-bold text-purple-400">@gamer_{idx + 1}: </span>
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newCommentInput}
                        onChange={(e) => setNewCommentInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        placeholder="Add a comment to this clip..."
                        className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(post.id)}
                        className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                      >
                        <Send size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Play, Flame, Heart, Clock, RefreshCw, Star, Info, 
  Compass, Trophy, Link2, Tv, Radio, ShieldCheck, ArrowDown, Check 
} from 'lucide-react';
import { ScoredVideo } from '../types';
import { 
  getPersonalizedRecommendations, 
  getTopTasteCategories, 
  resetRecommendationHistory,
  createProjectedVideo,
  resolveStreamMetadata,
  getVideoThumbnail,
  syncFreshPlatformVideos
} from '../services/recommendationEngine';
import { isJuniorModeEnabled } from '../services/juniorModeContext';
import { VideoPlayerModal } from './VideoPlayerModal';
import { playCategorizedAudio } from '../services/audioManager';
import { HDImage } from './HDImage';
import { cacheVideosBatch, getCachedVideos } from '../services/videoCacheDb';

interface PersonalizedVideoShelfProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  showTasteInsights?: boolean;
}

export const PersonalizedVideoShelf: React.FC<PersonalizedVideoShelfProps> = ({
  title = 'Recommended For You',
  subtitle = 'YouTube-style personalized picks based on your watch time, likes & searches',
  limit = 6,
  showTasteInsights = true
}) => {
  const [isJunior, setIsJunior] = useState<boolean>(isJuniorModeEnabled());
  const [videos, setVideos] = useState<ScoredVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<ScoredVideo | null>(null);
  const [topCategories, setTopCategories] = useState<{ category: string; points: number; percent: number }[]>([]);
  const [showTasteModal, setShowTasteModal] = useState<boolean>(false);
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);
  const [projectUrlInput, setProjectUrlInput] = useState<string>('');

  // Pull-to-refresh & feed refresh state
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const touchStartY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadRecommendations = (withExploration = false) => {
    const junior = isJuniorModeEnabled();
    setIsJunior(junior);
    const recs = getPersonalizedRecommendations(limit, junior, withExploration);
    setVideos(recs);
    setTopCategories(getTopTasteCategories());

    // Asynchronously save to IndexedDB cache
    if (recs && recs.length > 0) {
      cacheVideosBatch(recs);
    }
  };

  useEffect(() => {
    // 1. Immediately hydrate from IndexedDB cache if available to prevent any layout/thumbnail flash
    getCachedVideos(limit).then(cached => {
      if (cached && cached.length > 0) {
        setVideos(prev => (prev.length === 0 ? (cached as any) : prev));
      }
    }).catch(() => {});

    // 2. Load fresh recommendation engine profile
    loadRecommendations(false);

    const handleAlgoUpdate = () => {
      loadRecommendations(false);
    };

    const handleJuniorUpdate = (e: any) => {
      const junior = e.detail?.enabled ?? isJuniorModeEnabled();
      setIsJunior(junior);
      const recs = getPersonalizedRecommendations(limit, junior, false);
      setVideos(recs);
      if (recs && recs.length > 0) {
        cacheVideosBatch(recs);
      }
    };

    window.addEventListener('nexus_recommendations_updated', handleAlgoUpdate);
    window.addEventListener('nexus_junior_mode_changed', handleJuniorUpdate);

    return () => {
      window.removeEventListener('nexus_recommendations_updated', handleAlgoUpdate);
      window.removeEventListener('nexus_junior_mode_changed', handleJuniorUpdate);
    };
  }, [limit]);

  // YouTube-like feed refresh trigger
  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-interface-click-901.mp3', 'system', 0.4);

    try {
      // 1. Live platform synchronization for newest YouTube uploads & Twitch streams
      await syncFreshPlatformVideos(isJunior);

      // 2. Re-compute recommendations with fresh exploration weights
      const updatedRecs = getPersonalizedRecommendations(limit, isJunior, true);
      setVideos(updatedRecs);
      setTopCategories(getTopTasteCategories());
    } catch (e) {
      console.warn('Feed refresh error:', e);
      loadRecommendations(true);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
        setIsPulling(false);
      }, 500);
    }
  };

  // Touch event handlers for pull-to-refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;

    if (diff > 0) {
      // Elastic resistance math (damping)
      const dampedDistance = Math.min(85, diff * 0.42);
      setPullDistance(dampedDistance);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling) return;
    if (pullDistance >= 55) {
      handleRefresh();
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  const handlePlayVideo = (video: ScoredVideo) => {
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-interface-click-901.mp3', 'system', 0.4);
    setSelectedVideo(video);
  };

  const handleResetTaste = () => {
    resetRecommendationHistory();
    loadRecommendations(false);
    setShowTasteModal(false);
  };

  const pullThresholdReached = pullDistance >= 55;

  return (
    <section 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="space-y-4 relative"
    >
      {/* Pull To Refresh Elastic Indicator Banner */}
      <div 
        className="overflow-hidden transition-all duration-200 flex items-center justify-center pointer-events-none"
        style={{ 
          height: isRefreshing ? 48 : `${pullDistance}px`,
          opacity: pullDistance > 10 || isRefreshing ? 1 : 0
        }}
      >
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-purple-500/30 backdrop-blur-md shadow-xl text-xs font-semibold text-slate-200">
          <div 
            className={`transition-transform duration-150 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ transform: !isRefreshing ? `rotate(${pullDistance * 4.5}deg)` : undefined }}
          >
            <RefreshCw size={14} className={pullThresholdReached || isRefreshing ? 'text-purple-400' : 'text-slate-400'} />
          </div>
          <span className="text-[11px] tracking-tight">
            {isRefreshing 
              ? 'Fetching fresh videos from YouTube...' 
              : pullThresholdReached 
                ? 'Release to refresh feed' 
                : 'Pull down to refresh'}
          </span>
        </div>
      </div>

      {/* Header with Algorithm Info & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-xl ${
              isJunior ? 'bg-amber-400 text-black' : 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
            }`}>
              {isJunior ? <Star size={18} fill="currentColor" /> : <Sparkles size={18} />}
            </div>
            <h2 className={`font-black text-white tracking-tight ${isJunior ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
              {isJunior ? '🌟 Fun Videos For You!' : title}
            </h2>
            <span className="text-xs font-medium text-purple-400">
              Personalized Feed
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-medium">
            {isJunior ? 'Picked just for you! Safe, awesome gaming clips and adventures.' : subtitle}
          </p>
        </div>

        {/* Controls: Refresh Button, Taste Profile & Project Stream */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* YouTube-like Refresh Feed Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
              isRefreshing
                ? 'bg-purple-600/30 border-purple-500/50 text-purple-200 cursor-wait'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Refresh recommendations with latest uploads from YouTube and creators"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-purple-400' : 'text-purple-400'} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => setShowProjectModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold text-purple-300 hover:text-white transition-all active:scale-95"
            title="Project any YouTube video or Twitch stream into Nexus"
          >
            <Link2 size={13} className="text-purple-400" />
            <span>Project Stream</span>
          </button>

          {showTasteInsights && (
            <button
              onClick={() => setShowTasteModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all active:scale-95"
              title="View Algorithm signals and taste profile"
            >
              <Compass size={13} className="text-purple-400" />
              <span className="hidden sm:inline">Taste Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Affinity Taste Category Unboxed Typography */}
      {topCategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-400">
          <span className="font-semibold text-slate-500 shrink-0">
            Active Taste Signals:
          </span>
          {topCategories.map((cat, idx) => (
            <React.Fragment key={cat.category}>
              {idx > 0 && <span className="text-slate-600" aria-hidden="true">·</span>}
              <span className="font-medium text-slate-300 shrink-0 hover:text-purple-300 transition-colors">
                {cat.category} ({cat.percent}%)
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Video Cards Grid or Shimmer Loading State */}
      {isRefreshing ? (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: limit }).map((_, i) => (
            <div 
              key={`shimmer-${i}`} 
              className="rounded-3xl overflow-hidden bg-slate-900/60 border border-white/5 p-3 space-y-3 animate-pulse"
            >
              {/* Thumbnail Shimmer */}
              <div className="aspect-video w-full rounded-2xl bg-slate-800/80 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite]" />
              </div>
              {/* Content Skeleton */}
              <div className="space-y-2 px-1">
                <div className="h-4 bg-slate-800/90 rounded w-3/4" />
                <div className="h-3 bg-slate-800/60 rounded w-1/2" />
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800" />
                  <div className="h-3 bg-slate-800/60 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map(video => (
            <div
              key={video.id}
              onClick={() => handlePlayVideo(video)}
              className={`group relative rounded-3xl overflow-hidden cursor-pointer bg-[#18181b] border border-white/5 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1.5 shadow-lg hover:shadow-2xl flex flex-col ${
                isJunior ? 'hover:shadow-amber-500/20 ring-1 ring-white/10' : 'hover:shadow-purple-500/20'
              }`}
            >
              {/* Thumbnail Box */}
              <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                <HDImage
                  src={getVideoThumbnail(video)}
                  youtubeId={video.youtubeId}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Match Percentage Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-xs font-black shadow-lg">
                  <Sparkles size={12} className={isJunior ? 'text-amber-400' : 'text-purple-400'} />
                  <span className={video.matchPercentage >= 90 ? 'text-emerald-400' : 'text-purple-300'}>
                    {video.matchPercentage}% Match
                  </span>
                </div>

                {/* Stream Origin Provider Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-bold text-white shadow-md">
                  {video.sourceType === 'twitch' || video.twitchChannel ? (
                    <span className="flex items-center gap-1 text-[#bf94ff]">
                      <Radio size={10} className="animate-pulse" /> Twitch Live
                    </span>
                  ) : isJunior ? (
                    <span className="flex items-center gap-1 text-amber-300">
                      <Star size={10} fill="currentColor" /> Kid-Safe
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400">
                      <Tv size={10} /> YouTube
                    </span>
                  )}
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-white font-mono text-xs font-bold shadow-md">
                  {video.duration}
                </div>

                {/* Play Hover Overlay */}
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <div className={`rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 ${
                    isJunior 
                      ? 'w-16 h-16 bg-amber-400 text-black ring-4 ring-amber-300/80' 
                      : 'w-14 h-14 bg-white/90 text-black'
                  }`}>
                    <Play size={isJunior ? 28 : 22} fill="currentColor" className="ml-1" />
                  </div>
                </div>

                {/* Previously Watched indicator */}
                {video.userWatchDuration > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${Math.min(100, (video.userWatchDuration / 60) * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Video Details */}
              <div className={`p-4 flex-1 flex flex-col justify-between ${isJunior ? 'p-5' : 'p-4'}`}>
                <div>
                  {/* Algorithm Reason & Fresh Upload Indicator */}
                  <div className="mb-2 flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] font-semibold ${
                      isJunior ? 'text-amber-400' : 'text-purple-400'
                    }`}>
                      {video.reasonBadge}
                    </span>
                    {video.isFreshUpload && (
                      <>
                        <span className="text-slate-600 text-xs" aria-hidden="true">·</span>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                          New Sync
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className={`font-black text-white line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors ${
                    isJunior ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                  }`}>
                    {video.title}
                  </h3>
                </div>

                {/* Creator & Metadata Unboxed Typography */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2 min-w-0">
                    {video.channelAvatar ? (
                      <img 
                        src={video.channelAvatar} 
                        alt={video.author} 
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full object-cover shrink-0" 
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {video.author[0]}
                      </div>
                    )}
                    <span className="font-semibold text-slate-300 truncate">{video.author}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span>{video.views}</span>
                    {video.isLikedByUser && (
                      <Heart size={14} fill="#f43f5e" className="text-rose-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Direct Stream Projector Modal */}
      {showProjectModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setShowProjectModal(false)}
        >
          <div 
            className="w-full max-w-lg bg-[#151722] border border-white/10 rounded-3xl p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
                  <Link2 size={18} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">Direct Stream Projector</h3>
                  <p className="text-xs text-slate-400">Project YouTube videos or Twitch live streams into Nexus</p>
                </div>
              </div>
              <button
                onClick={() => setShowProjectModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Paste any YouTube video link/ID or Twitch channel name. It plays directly inside our responsive theater player without opening external tabs or third-party links!
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!projectUrlInput.trim()) return;
                const streamUrl = projectUrlInput.trim();
                const newVid = createProjectedVideo(streamUrl, undefined, isJunior);
                setSelectedVideo(newVid);
                setShowProjectModal(false);
                setProjectUrlInput('');

                // Resolve authentic channel name & title
                resolveStreamMetadata(streamUrl, isJunior).then(resolved => {
                  setSelectedVideo(prev => (prev && prev.id === newVid.id ? resolved : prev));
                }).catch(() => {});
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Video URL or Channel Name:
                </label>
                <input
                  type="text"
                  value={projectUrlInput}
                  onChange={(e) => setProjectUrlInput(e.target.value)}
                  placeholder="e.g., https://www.youtube.com/watch?v=... or twitch.tv/tarik"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  autoFocus
                />
              </div>

              {/* Quick Preset Stream Picks */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Or Quick-Project Curated Stream:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newVid = createProjectedVideo('https://www.youtube.com/watch?v=W_7LqXj2C70', 'Minecraft Hardcore 100 Days', isJunior);
                      setSelectedVideo(newVid);
                      setShowProjectModal(false);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    <span>⛏️ Minecraft Hardcore</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newVid = createProjectedVideo('https://www.youtube.com/watch?v=kJQP7kiw5Fk', 'Roblox Rainbow Lava Obby', isJunior);
                      setSelectedVideo(newVid);
                      setShowProjectModal(false);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    <span>🌈 Roblox Rainbow Obby</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newVid = createProjectedVideo('twitch.tv/tarik', 'Tarik Live Ranked & Watch Party', isJunior);
                      setSelectedVideo(newVid);
                      setShowProjectModal(false);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    <span>🎯 Tarik (Twitch Live)</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!projectUrlInput.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 disabled:opacity-50 transition-all"
                >
                  Project Video Now 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Taste Profile Insights Modal */}
      {showTasteModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setShowTasteModal(false)}
        >
          <div 
            className="w-full max-w-md bg-[#18181b] border border-white/10 rounded-3xl p-6 shadow-2xl relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Compass size={20} className="text-purple-400" />
                <h3 className="font-black text-lg text-white">Your YouTube-Style Algorithm</h3>
              </div>
              <button
                onClick={() => setShowTasteModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Nexus learns dynamically what you love to watch. Every second you spend watching, every video you like, and every search query tunes your custom feed in real time.
            </p>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">What Drives Your Feed:</h4>
              <div className="space-y-2">
                {topCategories.map(cat => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-200">
                      <span>{cat.category}</span>
                      <span className="text-purple-400">{cat.percent}% affinity</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: `${cat.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={handleResetTaste}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors"
              >
                <RefreshCw size={13} />
                <span>Reset Taste History</span>
              </button>

              <button
                onClick={() => setShowTasteModal(false)}
                className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onSelectVideo={(v) => setSelectedVideo(v as ScoredVideo)}
        />
      )}
    </section>
  );
};

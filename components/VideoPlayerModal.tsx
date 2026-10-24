import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, X, Heart, MessageCircle, Share2, 
  Sparkles, CheckCircle, Flame, ArrowRight, ShieldCheck, Eye, Star, 
  RotateCcw, ThumbsUp, Radio, Tv, Link2, ExternalLink, RefreshCw
} from 'lucide-react';
import { ScoredVideo, VideoPost } from '../types';
import { 
  trackVideoWatch, 
  trackVideoLike, 
  getPersonalizedRecommendations,
  parseMediaStreamUrl,
  createProjectedVideo,
  resolveStreamMetadata,
  getVideoThumbnail
} from '../services/recommendationEngine';
import { playCategorizedAudio, SoundEffectEngine } from '../services/audioManager';
import { isJuniorModeEnabled } from '../services/juniorModeContext';
import { recordWatchHistory, cacheVideo } from '../services/videoCacheDb';
import { HDImage } from './HDImage';

interface VideoPlayerModalProps {
  video: ScoredVideo | VideoPost | null;
  onClose: () => void;
  onSelectVideo?: (video: ScoredVideo | VideoPost) => void;
}

const JUNIOR_REACTIONS = [
  { emoji: '🚀', label: 'Awesome!' },
  { emoji: '🎮', label: 'Cool Game!' },
  { emoji: '⭐', label: 'Super Star!' },
  { emoji: '🔥', label: 'Epic Win!' },
  { emoji: '🎉', label: 'So Fun!' },
];

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
  onSelectVideo
}) => {
  const [activeVideo, setActiveVideo] = useState<ScoredVideo | VideoPost | null>(video);
  const [watchSeconds, setWatchSeconds] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [reactionSent, setReactionSent] = useState<string | null>(null);
  const [algoToast, setAlgoToast] = useState<string | null>(null);
  const [isJunior, setIsJunior] = useState<boolean>(isJuniorModeEnabled());
  const [showProjectorInput, setShowProjectorInput] = useState<boolean>(false);
  const [customStreamUrl, setCustomStreamUrl] = useState<string>('');

  const watchTrackerRef = useRef<number | null>(null);

  // Sync Junior mode state
  useEffect(() => {
    setIsJunior(isJuniorModeEnabled());
    const onJuniorChange = (e: any) => {
      setIsJunior(e.detail?.enabled ?? isJuniorModeEnabled());
    };
    window.addEventListener('nexus_junior_mode_changed', onJuniorChange);
    return () => window.removeEventListener('nexus_junior_mode_changed', onJuniorChange);
  }, []);

  // Sync prop video changes
  useEffect(() => {
    setActiveVideo(video);
  }, [video]);

  // Sync when activeVideo changes
  useEffect(() => {
    if (!activeVideo) return;

    const initialLiked = ('isLikedByUser' in activeVideo && activeVideo.isLikedByUser) || false;
    setIsLiked(initialLiked);
    setLikesCount(activeVideo.likes || 125000);
    setWatchSeconds(0);
    setReactionSent(null);
    setAlgoToast(null);

    // Initial audio cue
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-interface-click-901.mp3', 'system', 0.4);

    // Cache metadata and record initial watch session to IndexedDB
    cacheVideo(activeVideo);
    recordWatchHistory(activeVideo, 0, 180);

    // If active video has placeholder author or title, resolve authentic creator & title in background
    if (activeVideo.author === 'YouTube Creator' || activeVideo.author === 'Custom Stream' || activeVideo.title.startsWith('YouTube Video [')) {
      const streamInput = activeVideo.youtubeId || activeVideo.videoUrl || (activeVideo.twitchChannel ? `twitch.tv/${activeVideo.twitchChannel}` : '');
      if (streamInput) {
        resolveStreamMetadata(streamInput, isJunior).then(resolved => {
          setActiveVideo(prev => {
            if (!prev || prev.id !== activeVideo.id) return prev;
            const updated = {
              ...prev,
              title: resolved.title,
              author: resolved.author,
              thumbnail: resolved.thumbnail,
              category: resolved.category,
              views: resolved.views,
            };
            cacheVideo(updated);
            recordWatchHistory(updated, watchSeconds, 180);
            return updated;
          });
        }).catch(() => {});
      }
    }

    return () => {
      if (watchTrackerRef.current) {
        clearInterval(watchTrackerRef.current);
      }
    };
  }, [activeVideo]);

  // Continuously track real watch duration & feed into algorithm & IndexedDB watch history while modal is open
  useEffect(() => {
    if (!activeVideo) {
      if (watchTrackerRef.current) {
        clearInterval(watchTrackerRef.current);
        watchTrackerRef.current = null;
      }
      return;
    }

    watchTrackerRef.current = window.setInterval(() => {
      setWatchSeconds(prev => {
        const next = prev + 1;
        // Feed real viewing second into recommendation taste profile
        trackVideoWatch(activeVideo.id, 1, false);
        // Persist watch progress every 5 seconds
        if (next % 5 === 0) {
          recordWatchHistory(activeVideo, next, 180);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (watchTrackerRef.current) {
        clearInterval(watchTrackerRef.current);
        watchTrackerRef.current = null;
      }
    };
  }, [activeVideo]);

  // Escape key handler to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Determine media stream type and IDs
  const streamInfo = useMemo(() => {
    if (!activeVideo) return { type: 'youtube', id: '3xjpx8-2gD0' };

    // 1. Explicit YouTube ID
    if (activeVideo.youtubeId) {
      return { type: 'youtube', id: activeVideo.youtubeId };
    }

    // 2. Explicit Twitch Channel
    if (activeVideo.twitchChannel) {
      return { type: 'twitch', channel: activeVideo.twitchChannel };
    }

    // 3. Inspect videoUrl for YouTube or Twitch patterns
    if (activeVideo.videoUrl) {
      const parsed = parseMediaStreamUrl(activeVideo.videoUrl);
      if (parsed.sourceType === 'youtube') {
        return { type: 'youtube', id: parsed.idOrChannel };
      }
      if (parsed.sourceType === 'twitch') {
        return { type: 'twitch', channel: parsed.idOrChannel };
      }
      // Direct MP4 video fallback
      if (activeVideo.videoUrl.endsWith('.mp4') || activeVideo.videoUrl.includes('commondatastorage')) {
        return { type: 'direct', url: activeVideo.videoUrl };
      }
    }

    // Fallbacks
    if (activeVideo.sourceType === 'twitch') {
      return { type: 'twitch', channel: 'minecraft' };
    }

    // Default high-quality YouTube gaming stream
    if (isJunior) {
      return { type: 'youtube', id: 'YiiHhT7NdGk' }; // Farzy Minecraft Hardcore
    }
    return { type: 'youtube', id: '3xjpx8-2gD0' }; // TenZ Masterclass Guide
  }, [activeVideo, isJunior]);

  if (!activeVideo) return null;

  const handleLike = () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount(prev => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    trackVideoLike(activeVideo.id, nextState);

    if (nextState) {
      playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-magical-glitter-sparkle-2629.mp3', 'system', 0.6);
      SoundEffectEngine.play('streak-burst');
      setAlgoToast(`Algorithm updated! More "${activeVideo.category || 'gaming'}" videos prioritized for you.`);
      setTimeout(() => setAlgoToast(null), 3500);
    }
  };

  const handleSendReaction = (emoji: string) => {
    setReactionSent(emoji);
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.5);
    // Treat positive reaction as engagement
    trackVideoWatch(activeVideo.id, 5, false);
    setAlgoToast(`Reaction saved! Your feed tuned for ${emoji}`);
    setTimeout(() => {
      setReactionSent(null);
      setAlgoToast(null);
    }, 2500);
  };

  const handleSwitchVideo = (newVideo: ScoredVideo | VideoPost) => {
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-interface-click-901.mp3', 'system', 0.4);
    setActiveVideo(newVideo);
    if (onSelectVideo) {
      onSelectVideo(newVideo);
    }
  };

  const handleProjectCustomStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStreamUrl.trim()) return;

    const streamInput = customStreamUrl.trim();
    const projected = createProjectedVideo(streamInput, undefined, isJunior);
    setActiveVideo(projected);
    setShowProjectorInput(false);
    setCustomStreamUrl('');
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-interface-click-901.mp3', 'system', 0.5);
    setAlgoToast('Stream projected! Resolving authentic title & channel... 🚀');

    // Asynchronously resolve authentic channel name, exact title, and official thumbnail
    try {
      const resolved = await resolveStreamMetadata(streamInput, isJunior);
      setActiveVideo(prev => {
        if (!prev || prev.id !== projected.id) return prev;
        return {
          ...prev,
          title: resolved.title,
          author: resolved.author,
          thumbnail: resolved.thumbnail,
          category: resolved.category,
          views: resolved.views,
        };
      });
      setAlgoToast(`✨ ${resolved.author} • ${resolved.title.slice(0, 32)}...`);
      setTimeout(() => setAlgoToast(null), 3000);
    } catch {
      setTimeout(() => setAlgoToast(null), 2500);
    }
  };

  // Determine current host for Twitch parent embed security
  const embedHost = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';

  // Get next recommendation
  const nextVideos = getPersonalizedRecommendations(6, isJunior).filter(v => v.id !== activeVideo.id);
  const upNext = nextVideos[0];

  // Theme glow based on game category
  const glowColorClass = isJunior 
    ? 'from-amber-500/20 via-orange-500/10 to-transparent' 
    : activeVideo.category === 'Minecraft'
      ? 'from-emerald-500/20 via-green-500/10 to-transparent'
      : activeVideo.category === 'Valorant'
        ? 'from-rose-500/20 via-purple-500/10 to-transparent'
        : 'from-purple-600/20 via-indigo-600/10 to-transparent';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-2 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl bg-[#0c0d12] rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Backlight Glow */}
        <div className={`absolute top-0 left-0 right-0 h-40 bg-gradient-to-b ${glowColorClass} pointer-events-none blur-2xl opacity-60`} />

        {/* Top Header Bar */}
        <div className="relative z-10 flex items-center justify-between p-3.5 sm:p-4 bg-white/5 border-b border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-white shrink-0 shadow-lg ${
              isJunior 
                ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-black text-base' 
                : streamInfo.type === 'twitch'
                  ? 'bg-[#9146FF]'
                  : 'bg-red-600'
            }`}>
              {isJunior ? '⭐' : streamInfo.type === 'twitch' ? <Radio size={16} /> : <Tv size={16} />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white truncate max-w-lg">
                  {activeVideo.title}
                </h3>
                {isJunior && (
                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                    <ShieldCheck size={12} /> Kid-Safe
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="text-purple-400 font-semibold">{activeVideo.author}</span>
                <span>•</span>
                <span>{activeVideo.views} views</span>
                {activeVideo.category && (
                  <>
                    <span>•</span>
                    <span className="text-amber-400 font-medium">#{activeVideo.category}</span>
                  </>
                )}
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400">
                  <span>•</span>
                  <span>Direct Stream</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Project Custom Stream URL toggle */}
            <button
              onClick={() => setShowProjectorInput(!showProjectorInput)}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5"
              title="Project custom YouTube or Twitch stream URL"
            >
              <Link2 size={14} className="text-purple-400" />
              <span className="hidden md:inline">Project Stream</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`rounded-full flex items-center justify-center transition-all ${
                isJunior
                  ? 'w-11 h-11 bg-red-500/20 hover:bg-red-500/30 text-red-300 border-2 border-red-500/40 text-lg'
                  : 'w-9 h-9 bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Close Player (Esc)"
            >
              <X size={isJunior ? 22 : 18} />
            </button>
          </div>
        </div>

        {/* Optional Custom Stream Projector Input Dropdown */}
        {showProjectorInput && (
          <form 
            onSubmit={handleProjectCustomStream}
            className="p-3 bg-[#151722] border-b border-white/10 flex items-center gap-2 animate-fadeIn z-20"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={customStreamUrl}
                onChange={(e) => setCustomStreamUrl(e.target.value)}
                placeholder="Paste YouTube video URL/ID or Twitch channel (e.g., https://youtube.com/watch?v=... or twitch.tv/...)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 shrink-0"
            >
              Project Now
            </button>
            <button
              type="button"
              onClick={() => setShowProjectorInput(false)}
              className="p-2 hover:bg-white/10 rounded-xl text-slate-400"
            >
              <X size={14} />
            </button>
          </form>
        )}

        {/* Responsive Video Streaming Theater Viewport */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {streamInfo.type === 'youtube' ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${streamInfo.id}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1`}
              title={activeVideo.title}
              className="w-full h-full border-0 select-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : streamInfo.type === 'twitch' ? (
            <iframe
              src={`https://player.twitch.tv/?channel=${streamInfo.channel}&parent=${embedHost}&autoplay=true&muted=false`}
              title={activeVideo.title}
              className="w-full h-full border-0 select-none"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : streamInfo.type === 'direct' ? (
            <video
              src={streamInfo.url}
              poster={activeVideo.thumbnail}
              autoPlay
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="relative w-full h-full">
              <img src={activeVideo.thumbnail} alt={activeVideo.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Play size={48} className="text-purple-400 animate-pulse" />
              </div>
            </div>
          )}

          {/* Floating Reaction Animation */}
          {reactionSent && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
              <span className="text-8xl animate-bounce drop-shadow-[0_0_30px_rgba(255,255,255,0.7)]">{reactionSent}</span>
            </div>
          )}

          {/* Real-time Algorithm Toast Message */}
          {algoToast && (
            <div className="absolute top-4 left-4 right-4 z-40 flex justify-center pointer-events-none animate-fadeIn">
              <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 border border-white/20">
                <Sparkles size={16} className="text-yellow-300 animate-spin-slow" />
                <span>{algoToast}</span>
              </div>
            </div>
          )}
        </div>

        {/* Live Watch Time & Stream Telemetry Ribbon */}
        <div className="px-4 py-2 bg-black/80 border-b border-white/5 flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 ${
              isJunior 
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' 
                : 'bg-white/10 text-emerald-300 border border-emerald-500/20'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Watched: {watchSeconds}s</span>
            </div>

            <span className="text-slate-400 hidden sm:inline">
              Tuning recommendation algorithm for <strong className="text-white">#{activeVideo.category || 'Gaming'}</strong>
            </span>
          </div>

          {'matchPercentage' in activeVideo && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/30 font-bold text-purple-300">
              <Sparkles size={12} className="text-yellow-400" />
              <span>{activeVideo.matchPercentage}% Algorithm Match</span>
            </div>
          )}
        </div>

        {/* Bottom Interactive & Recommendations Rail */}
        <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar space-y-4 flex-1">
          {/* Main Action Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 rounded-2xl font-bold transition-all active:scale-95 shadow-md ${
                  isLiked
                    ? 'bg-rose-600 text-white shadow-rose-600/30 ring-2 ring-rose-400/50'
                    : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                } ${isJunior ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm'}`}
              >
                <Heart size={isJunior ? 22 : 18} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'animate-bounce' : ''} />
                <span>{isLiked ? 'Liked! ❤️' : 'Like Video'}</span>
                <span className="text-xs opacity-75 font-normal">({likesCount.toLocaleString()})</span>
              </button>

              <button
                onClick={() => {
                  playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.4);
                  setAlgoToast('Video link ready! Shared with your squad 🎮');
                  setTimeout(() => setAlgoToast(null), 2500);
                }}
                className={`flex items-center gap-2 rounded-2xl font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors ${
                  isJunior ? 'px-5 py-3 text-base' : 'px-4 py-2 text-sm'
                }`}
              >
                <Share2 size={isJunior ? 20 : 16} />
                <span>Share</span>
              </button>
            </div>

            {/* Algorithm Reason Pill */}
            {'reasonBadge' in activeVideo && (
              <div className="px-3 py-1.5 rounded-full bg-white/5 border border-purple-500/30 text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                <span>{activeVideo.reasonBadge}</span>
              </div>
            )}
          </div>

          {/* Kid-Friendly Reactions Bar for Junior Mode */}
          {isJunior && (
            <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-3">
              <p className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                <span>⭐ Quick Reactions (Tap to cheer!):</span>
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {JUNIOR_REACTIONS.map(reaction => (
                  <button
                    key={reaction.label}
                    onClick={() => handleSendReaction(reaction.emoji)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#1b1c24] hover:bg-amber-400 hover:text-black border border-white/10 rounded-2xl font-bold text-xs transition-all active:scale-95 shrink-0"
                  >
                    <span className="text-lg">{reaction.emoji}</span>
                    <span>{reaction.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Standard Mode Quick Emoji Reactions */}
          {!isJunior && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-xs font-bold text-slate-400 shrink-0">Live Reactions:</span>
              {['🔥 Fire', '🎮 GG', '🏆 Clutched', '❤️ Love', '⚡ Insane'].map(item => {
                const [emoji, label] = item.split(' ');
                return (
                  <button
                    key={label}
                    onClick={() => handleSendReaction(emoji)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold text-slate-300 hover:text-white transition-all active:scale-95 shrink-0"
                  >
                    <span>{emoji}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Video Description & Tags */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <h4 className="font-bold text-sm text-slate-200 mb-1">About this video</h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {activeVideo.description || 'Watch authentic community highlights, stream vods, and creator masterclasses directly inside Nexus.'}
            </p>
            {activeVideo.tags && activeVideo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {activeVideo.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-0.5 rounded-lg bg-white/5 text-[11px] font-medium text-slate-300 border border-white/5">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Up Next Algorithm Stream Queue */}
          {upNext && (
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-purple-400" /> Up Next (Personalized Stream Queue)
                </span>
                <span className="text-xs font-bold text-purple-400">{upNext.matchPercentage}% Match</span>
              </div>

              <div
                onClick={() => handleSwitchVideo(upNext)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all group"
              >
                <div className="relative w-32 sm:w-40 aspect-video rounded-xl overflow-hidden shrink-0 bg-black/40">
                  <HDImage 
                    src={getVideoThumbnail(upNext)} 
                    youtubeId={upNext.youtubeId}
                    alt={upNext.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  />
                  <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1.5 py-0.5 rounded text-white font-mono">{upNext.duration}</span>
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={20} fill="white" className="text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-sm text-white line-clamp-1 group-hover:text-purple-400 transition-colors">{upNext.title}</h5>
                  <p className="text-xs text-slate-400 mt-0.5">{upNext.author} • {upNext.views} views</p>
                  <span className="inline-block mt-1.5 text-[11px] text-amber-400 font-medium">{upNext.reasonBadge}</span>
                </div>
                <div className="p-2.5 bg-purple-600 rounded-xl text-white group-hover:scale-110 transition-transform shrink-0">
                  <Play size={16} fill="white" />
                </div>
              </div>

              {/* Related Feed Thumbnails */}
              {nextVideos.length > 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-2.5">
                  {nextVideos.slice(1, 4).map(v => (
                    <div
                      key={v.id}
                      onClick={() => handleSwitchVideo(v)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all flex items-center gap-2 group"
                    >
                      <div className="relative w-16 aspect-video rounded-lg overflow-hidden shrink-0">
                        <HDImage src={v.thumbnail} youtubeId={v.youtubeId} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate group-hover:text-purple-300">{v.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{v.author}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

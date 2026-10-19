import React, { useState, useEffect } from 'react';
import { Sparkles, Play, Flame, Heart, Clock, RefreshCw, Star, Info, Compass, Trophy, Link2, Tv, Radio, ShieldCheck } from 'lucide-react';
import { ScoredVideo } from '../types';
import { 
  getPersonalizedRecommendations, 
  getTopTasteCategories, 
  resetRecommendationHistory,
  createProjectedVideo,
  resolveStreamMetadata,
  getVideoThumbnail
} from '../services/recommendationEngine';
import { isJuniorModeEnabled } from '../services/juniorModeContext';
import { VideoPlayerModal } from './VideoPlayerModal';
import { playCategorizedAudio } from '../services/audioManager';

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

  const loadRecommendations = () => {
    const junior = isJuniorModeEnabled();
    setIsJunior(junior);
    const recs = getPersonalizedRecommendations(limit, junior);
    setVideos(recs);
    setTopCategories(getTopTasteCategories());
  };

  useEffect(() => {
    loadRecommendations();

    const handleAlgoUpdate = () => {
      loadRecommendations();
    };

    const handleJuniorUpdate = (e: any) => {
      const junior = e.detail?.enabled ?? isJuniorModeEnabled();
      setIsJunior(junior);
      const recs = getPersonalizedRecommendations(limit, junior);
      setVideos(recs);
    };

    window.addEventListener('nexus_recommendations_updated', handleAlgoUpdate);
    window.addEventListener('nexus_junior_mode_changed', handleJuniorUpdate);

    return () => {
      window.removeEventListener('nexus_recommendations_updated', handleAlgoUpdate);
      window.removeEventListener('nexus_junior_mode_changed', handleJuniorUpdate);
    };
  }, [limit]);

  const handlePlayVideo = (video: ScoredVideo) => {
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-interface-click-901.mp3', 'system', 0.4);
    setSelectedVideo(video);
  };

  const handleResetTaste = () => {
    resetRecommendationHistory();
    loadRecommendations();
    setShowTasteModal(false);
  };

  return (
    <section className="space-y-4">
      {/* Header with Algorithm Info & Taste Pills */}
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
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-[10px] font-black uppercase text-purple-300">
              Smart Feed
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-medium">
            {isJunior ? 'Picked just for you! Safe, awesome gaming clips and adventures.' : subtitle}
          </p>
        </div>

        {/* Controls: Taste Profile & Project Stream */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProjectModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold text-purple-300 hover:text-white transition-all active:scale-95"
            title="Project any YouTube video or Twitch stream into Nexus"
          >
            <Link2 size={14} className="text-purple-400" />
            <span>Project Stream</span>
          </button>

          {showTasteInsights && (
            <button
              onClick={() => setShowTasteModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all active:scale-95"
              title="View Algorithm signals and taste profile"
            >
              <Compass size={14} className="text-purple-400" />
              <span className="hidden sm:inline">Taste Profile</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
          )}
        </div>
      </div>

      {/* Top Affinity Taste Category Pills */}
      {topCategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
            Your Top Signals:
          </span>
          {topCategories.map(cat => (
            <div
              key={cat.category}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 border ${
                isJunior
                  ? 'bg-amber-400/10 border-amber-400/30 text-amber-300'
                  : 'bg-purple-600/10 border-purple-500/20 text-purple-300'
              }`}
            >
              <span>{cat.category}</span>
              <span className="text-[10px] opacity-75 font-mono">{cat.percent}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Video Cards Grid */}
      <div className={`grid gap-4 sm:gap-6 ${
        isJunior 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}>
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
                {/* Algorithm Reason Chip */}
                <div className="mb-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                    isJunior 
                      ? 'bg-amber-400/15 text-amber-300 border border-amber-400/25' 
                      : 'bg-purple-600/15 text-purple-300 border border-purple-500/20'
                  }`}>
                    {video.reasonBadge}
                  </span>
                </div>

                <h3 className={`font-black text-white line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors ${
                  isJunior ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                }`}>
                  {video.title}
                </h3>
              </div>

              {/* Creator & Metadata */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  {video.channelAvatar ? (
                    <img src={video.channelAvatar} alt={video.author} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[10px]">
                      {video.author[0]}
                    </div>
                  )}
                  <span className="font-semibold text-slate-300 truncate max-w-[120px]">{video.author}</span>
                </div>

                <div className="flex items-center gap-2">
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
                      const newVid = createProjectedVideo('https://www.youtube.com/watch?v=W_7LqXj2C70', 'Minecraft Treehouse Kingdom 100 Days', isJunior);
                      setSelectedVideo(newVid);
                      setShowProjectModal(false);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    <span>⛏️ Minecraft Treehouse</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newVid = createProjectedVideo('https://twitch.tv/riotgames', 'Riot Games World Championship Live', false);
                      setSelectedVideo(newVid);
                      setShowProjectModal(false);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-semibold text-purple-300 hover:text-white flex items-center gap-1.5"
                  >
                    <Radio size={12} className="animate-pulse" />
                    <span>Twitch • Riot Games</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newVid = createProjectedVideo('https://www.youtube.com/watch?v=kJQP7kiw5Fk', 'Roblox Rainbow Lava Obby', true);
                      setSelectedVideo(newVid);
                      setShowProjectModal(false);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    <span>🌈 Roblox Rainbow Obby</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
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

import React, { useState, useEffect } from 'react';
import { Play, X, Heart, MessageCircle, Share2, Tv, Radio, Sparkles, CheckCircle2 } from 'lucide-react';
import { VideoPost } from '../types';
import { playCategorizedAudio } from '../services/audioManager';
import { HDImage } from './HDImage';
import { cacheVideo, recordWatchHistory } from '../services/videoCacheDb';
import { getAllCatalogVideos, getVideoThumbnail } from '../services/recommendationEngine';

export const VideoFeed: React.FC = () => {
  const [videos, setVideos] = useState<VideoPost[]>(() => getAllCatalogVideos().slice(0, 9));
  const [selectedVideo, setSelectedVideo] = useState<VideoPost | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Sync with catalog
    const all = getAllCatalogVideos();
    if (all && all.length > 0) {
      setVideos(all.slice(0, 9));
    }
  }, []);

  const handleVideoClick = (video: VideoPost) => {
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-interface-click-901.mp3', 'system', 0.35);
    setSelectedVideo(video);
    cacheVideo(video);
    recordWatchHistory(video, 1, 180);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedMap(prev => {
      const next = !prev[id];
      if (next) {
        playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-magical-glitter-sparkle-2629.mp3', 'system', 0.5);
      }
      return { ...prev, [id]: next };
    });
  };

  const embedHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="text-purple-400" size={20} />
            <span>Trending Verified Video Feed</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official high-definition YouTube & Twitch broadcasts • Direct stream playback
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>HD Sync Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {videos.map((video) => {
          const isTwitch = video.sourceType === 'twitch' || Boolean(video.twitchChannel);
          const thumbUrl = getVideoThumbnail(video);

          return (
            <div 
              key={video.id}
              onClick={() => handleVideoClick(video)}
              className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1 bg-[#14141e] border border-white/5 hover:border-purple-500/40 flex flex-col justify-between"
            >
              {/* High-Resolution Direct Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                <HDImage
                  src={thumbUrl}
                  youtubeId={video.youtubeId}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Platform Badge */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold flex items-center gap-1 z-10 shadow-md">
                  {isTwitch ? (
                    <span className="text-purple-400 flex items-center gap-1">
                      <Radio size={11} className="animate-pulse" /> Twitch Live
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1">
                      <Tv size={11} /> YouTube HD
                    </span>
                  )}
                </div>

                {/* Duration Badge */}
                <span className="absolute bottom-2.5 right-2.5 bg-black/85 text-white font-mono text-[11px] font-bold px-2 py-0.5 rounded-md shadow-md z-10">
                  {video.duration || '12:00'}
                </span>

                {/* Play Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <div className="w-12 h-12 bg-purple-600/90 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform text-white">
                    <Play fill="currentColor" size={20} className="ml-1" />
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                    <span className="font-medium text-slate-300 truncate max-w-[140px]">{video.author}</span>
                    <CheckCircle2 size={12} className="text-purple-400 shrink-0" />
                    <span>•</span>
                    <span>{video.views}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                  <span className="px-2 py-0.5 rounded bg-white/5 font-medium text-[10px] text-purple-300">
                    #{video.category || 'Gaming'}
                  </span>
                  <button 
                    onClick={(e) => toggleLike(e, video.id)}
                    className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                      likedMap[video.id] ? 'text-rose-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Heart size={14} fill={likedMap[video.id] ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real Full Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6" onClick={closeVideo}>
          <div 
            className="relative w-full max-w-4xl bg-[#0e0e16] rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Player Topbar */}
            <div className="p-3.5 sm:p-4 bg-white/5 border-b border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 ${
                  selectedVideo.sourceType === 'twitch' || selectedVideo.twitchChannel ? 'bg-purple-600' : 'bg-red-600'
                }`}>
                  {selectedVideo.sourceType === 'twitch' || selectedVideo.twitchChannel ? <Radio size={16} /> : <Tv size={16} />}
                </span>
                <div className="min-w-0">
                  <h4 className="font-black text-sm text-white truncate max-w-md">{selectedVideo.title}</h4>
                  <p className="text-xs text-slate-400 truncate">{selectedVideo.author} • {selectedVideo.views}</p>
                </div>
              </div>
              <button 
                onClick={closeVideo}
                className="w-8 h-8 sm:w-9 sm:h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Embedded Direct Stream Player */}
            <div className="relative aspect-video w-full bg-black">
              {selectedVideo.sourceType === 'twitch' || selectedVideo.twitchChannel ? (
                <iframe
                  src={`https://player.twitch.tv/?channel=${selectedVideo.twitchChannel || 'riotgames'}&parent=${embedHost}&autoplay=true`}
                  title={selectedVideo.title}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              ) : (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId || '3xjpx8-2gD0'}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`}
                  title={selectedVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>

            {/* Bottom Controls / Info Bar */}
            <div className="p-3.5 sm:p-4 flex items-center justify-between bg-[#12121c] border-t border-white/5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 text-xs font-bold border border-purple-500/20">
                  {selectedVideo.category || 'Gaming'}
                </span>
                <span className="text-xs text-slate-400">Recorded to your Watch History</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => toggleLike(e, selectedVideo.id)}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                    likedMap[selectedVideo.id] 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  <Heart size={14} fill={likedMap[selectedVideo.id] ? 'currentColor' : 'none'} />
                  <span>{likedMap[selectedVideo.id] ? 'Liked' : 'Like'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

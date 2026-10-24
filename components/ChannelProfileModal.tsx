import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, CheckCircle2, Radio, Tv, Play, Bell, BellRing, 
  Sparkles, ShieldCheck, Flame, Film, Clock, RefreshCw, 
  ChevronDown, AlertCircle, Eye
} from 'lucide-react';
import { CreatorChannel, VideoPost } from '../types';
import { playCategorizedAudio, SoundEffectEngine } from '../services/audioManager';
import { getVideoThumbnail } from '../services/recommendationEngine';
import { HDImage } from './HDImage';

interface ChannelProfileModalProps {
  channel: CreatorChannel | null;
  onClose: () => void;
  onSelectVideo: (video: VideoPost) => void;
}

export const ChannelProfileModal: React.FC<ChannelProfileModalProps> = ({
  channel,
  onClose,
  onSelectVideo,
}) => {
  const [activeTab, setActiveTab] = useState<'latest' | 'popular' | 'live'>('latest');
  const [videos, setVideos] = useState<VideoPost[]>(() => channel?.videos || []);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(18);

  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    if (!channel) return false;
    try {
      const subs = JSON.parse(localStorage.getItem('nexus_subscribed_channels') || '[]');
      return subs.includes(channel.id);
    } catch {
      return false;
    }
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Fetch authentic YouTube & Twitch channel uploads on mount or channel change
  const fetchChannelVideos = async (forceRefresh = false) => {
    if (!channel) return;
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const resp = await fetch('/api/channel-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: channel.id || channel.youtubeChannelId,
          handle: channel.handle,
          name: channel.name,
          twitchChannel: channel.twitchChannel,
          platform: channel.platform,
        }),
      });

      if (!resp.ok) {
        throw new Error(`Server returned ${resp.status}`);
      }

      const data = await resp.json();
      if (Array.isArray(data.videos) && data.videos.length > 0) {
        setVideos(data.videos);
        channel.videos = data.videos; // Cache on channel object
      } else if (!channel.videos || channel.videos.length === 0) {
        // If empty, leave current or set empty
        setVideos([]);
      }
    } catch (err: any) {
      console.warn('Failed to sync creator videos from YouTube:', err);
      setError('Unable to sync latest videos. You can retry below.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (channel) {
      // If channel already has pre-cached videos, show them immediately but still refresh in background
      if (channel.videos && channel.videos.length > 0) {
        setVideos(channel.videos);
        setLoading(false);
      }
      fetchChannelVideos();
      setVisibleCount(18);
    }
  }, [channel?.id, channel?.handle]);

  if (!channel) return null;

  const handleToggleSubscribe = () => {
    const nextState = !isSubscribed;
    setIsSubscribed(nextState);
    try {
      const subs: string[] = JSON.parse(localStorage.getItem('nexus_subscribed_channels') || '[]');
      const updated = nextState 
        ? Array.from(new Set([...subs, channel.id]))
        : subs.filter(id => id !== channel.id);
      localStorage.setItem('nexus_subscribed_channels', JSON.stringify(updated));
    } catch {}

    if (nextState) {
      playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-magical-glitter-sparkle-2629.mp3', 'system', 0.6);
      SoundEffectEngine.play('streak-burst');
      setToastMsg(`Subscribed to ${channel.name} in Nexus! 🔔`);
    } else {
      playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.4);
      setToastMsg(`Unsubscribed from ${channel.name}`);
    }
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Helper to parse view strings into numbers for Popular sorting
  const parseViewVolume = (str?: string): number => {
    if (!str) return 0;
    const s = str.toLowerCase().trim();
    if (s === 'live') return 999999999;
    if (s.includes('billion') || s.endsWith('b')) return (parseFloat(s) || 1) * 1000000000;
    if (s.includes('million') || s.endsWith('m')) return (parseFloat(s) || 1) * 1000000;
    if (s.includes('thousand') || s.endsWith('k')) return (parseFloat(s) || 1) * 1000;
    const clean = s.replace(/[^0-9.]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  // Memoized lists by tab category
  const latestVideos = videos;
  const popularVideos = useMemo(() => {
    return [...videos].sort((a, b) => parseViewVolume(b.views) - parseViewVolume(a.views));
  }, [videos]);

  const liveVideos = useMemo(() => {
    return videos.filter(v => v.isLive || v.duration === 'LIVE' || v.category === 'Live Stream' || v.sourceType === 'twitch');
  }, [videos]);

  const currentTabList = activeTab === 'popular'
    ? popularVideos
    : activeTab === 'live'
      ? liveVideos
      : latestVideos;

  const displayedVideos = currentTabList.slice(0, visibleCount);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-2 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl bg-[#0c0d14] rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(139,92,246,0.2)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Area */}
        <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 shrink-0">
          <img 
            src={channel.banner} 
            alt={channel.name} 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d14] via-black/40 to-transparent"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-white flex items-center justify-center transition-all"
            title="Close Channel"
          >
            <X size={18} />
          </button>

          {/* Platform Origin Badge */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            {channel.platform === 'youtube' ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white text-xs font-black shadow-lg">
                <Tv size={13} /> YouTube Creator
              </span>
            ) : channel.platform === 'twitch' ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9146FF] text-white text-xs font-black shadow-lg">
                <Radio size={13} /> Twitch Channel
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-[#9146FF] text-white text-xs font-black shadow-lg">
                <Sparkles size={13} /> YouTube & Twitch
              </span>
            )}
            {channel.kidFriendly && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-black text-xs font-black shadow-lg">
                <ShieldCheck size={13} /> Kid-Safe
              </span>
            )}
          </div>
        </div>

        {/* Creator Info Header Row */}
        <div className="relative px-6 sm:px-8 pb-5 pt-0 border-b border-white/5 shrink-0 bg-[#0c0d14]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            <div className="flex items-end gap-4 min-w-0">
              {/* Creator Avatar with glowing aura */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden ring-4 ring-[#0c0d14] shadow-2xl shrink-0 bg-black">
                <img src={channel.avatar} alt={channel.name} className="w-full h-full object-cover" />
                {channel.isLive && (
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-red-600 text-white font-black text-[9px] uppercase tracking-wider animate-pulse">
                    LIVE
                  </span>
                )}
              </div>

              {/* Names and subscriber info */}
              <div className="min-w-0 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-white truncate">{channel.name}</h2>
                  {channel.verified && (
                    <CheckCircle2 size={18} className="text-purple-400 fill-purple-400/20 shrink-0" />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-purple-400 font-semibold">{channel.handle}</p>
                <p className="text-xs text-slate-400 mt-0.5">{channel.subscribers}</p>
              </div>
            </div>

            {/* Subscribe & Sync Refresh Buttons */}
            <div className="flex items-center gap-2 pb-1">
              <button
                onClick={() => fetchChannelVideos(true)}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all active:scale-95 disabled:opacity-50"
                title="Sync latest uploads from YouTube"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin text-purple-400' : ''} />
                <span className="hidden sm:inline">{refreshing ? 'Syncing...' : 'Sync Feed'}</span>
              </button>

              <button
                onClick={handleToggleSubscribe}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-lg ${
                  isSubscribed
                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-600/30 ring-2 ring-purple-400/40'
                }`}
              >
                {isSubscribed ? <BellRing size={16} className="text-yellow-300 animate-wiggle" /> : <Bell size={16} />}
                <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
              </button>
            </div>
          </div>

          {/* Bio Description */}
          <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            {channel.bio}
          </p>

          {/* Notification Toast */}
          {toastMsg && (
            <div className="mt-3 px-3.5 py-1.5 rounded-xl bg-purple-600/30 border border-purple-500/40 text-xs text-purple-200 font-bold inline-flex items-center gap-2 animate-fadeIn">
              <Sparkles size={14} className="text-yellow-300" />
              <span>{toastMsg}</span>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="px-6 sm:px-8 pt-3 border-b border-white/5 flex items-center justify-between gap-4 shrink-0 bg-[#0c0d14]">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab('latest');
                setVisibleCount(18);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'latest'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Clock size={14} className={activeTab === 'latest' ? 'text-purple-400' : ''} />
              <span>Latest Uploads ({latestVideos.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('popular');
                setVisibleCount(18);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'popular'
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Flame size={14} className={activeTab === 'popular' ? 'text-amber-400' : ''} />
              <span>Popular ({popularVideos.length})</span>
            </button>

            {liveVideos.length > 0 && (
              <button
                onClick={() => {
                  setActiveTab('live');
                  setVisibleCount(18);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'live'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Radio size={14} className="text-red-400 animate-pulse" />
                <span>Live Streams & VODs ({liveVideos.length})</span>
              </button>
            )}
          </div>

          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest hidden sm:inline">
            Direct Server Stream • Zero External Links
          </span>
        </div>

        {/* Channel Video Catalog Grid */}
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {/* Skeleton Loaders while fetching */}
          {loading && videos.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden bg-[#14151e] border border-white/5 p-0 animate-pulse">
                  <div className="aspect-video w-full bg-white/5 relative">
                    <div className="absolute bottom-2.5 right-2.5 w-12 h-4 rounded bg-white/10" />
                  </div>
                  <div className="p-4 space-y-2.5">
                    <div className="h-4 bg-white/10 rounded w-5/6" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Synchronized Video Cards */}
          {displayedVideos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedVideos.map(video => (
                <div
                  key={video.id}
                  onClick={() => {
                    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-interface-click-901.mp3', 'system', 0.4);
                    onSelectVideo(video);
                  }}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer bg-[#14151e] border border-white/5 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl flex flex-col"
                >
                  {/* Authentic YouTube/Twitch HD Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                    <HDImage
                      src={getVideoThumbnail(video)}
                      youtubeId={video.youtubeId}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Duration Badge */}
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-white font-mono text-xs font-bold shadow-md">
                      {video.duration}
                    </div>

                    {/* Platform Origin Badge */}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-bold text-slate-200">
                      {video.sourceType === 'twitch' ? (
                        <span className="text-[#bf94ff] flex items-center gap-1">
                          <Radio size={10} /> Twitch
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1">
                          <Tv size={10} /> YouTube
                        </span>
                      )}
                    </div>

                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
                        <Play size={20} fill="currentColor" className="ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Video Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h4 className="font-bold text-sm text-white line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors">
                      {video.title}
                    </h4>

                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono tabular-nums">{video.views}</span>
                      <span className="text-purple-400 font-medium">#{video.category || 'Gaming'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {displayedVideos.length < currentTabList.length && (
            <div className="pt-2 pb-4 text-center">
              <button
                onClick={() => setVisibleCount(c => c + 12)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg hover:border-purple-500/40"
              >
                <ChevronDown size={15} className="text-purple-400" />
                <span>Load More Videos (Showing {displayedVideos.length} of {currentTabList.length})</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && currentTabList.length === 0 && (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                <AlertCircle size={22} />
              </div>
              <p className="text-slate-300 text-sm font-medium">
                No videos found in this tab for {channel.name}.
              </p>
              <button
                onClick={() => fetchChannelVideos(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all"
              >
                <RefreshCw size={13} />
                <span>Sync with YouTube Now</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, User, MoreVertical, Heart, Signal, Eye, Gamepad2, Mic, Music, Trophy, Search, Filter, X, MessageCircle, Share2, ThumbsUp, CheckCircle2, Sparkles, Video, Radio } from 'lucide-react';
import { SocialFeedSection } from '../components/SocialFeedSection';
import { playCategorizedAudio, getEffectiveVolume } from '../services/audioManager';

// --- Mock Data ---

const CATEGORIES = [
  { id: '1', name: 'Just Chatting', viewers: '250K', color: 'from-purple-500 to-indigo-500', icon: Mic },
  { id: '2', name: 'Valorant', viewers: '145K', color: 'from-red-500 to-pink-500', icon: Gamepad2 },
  { id: '3', name: 'Minecraft', viewers: '85K', color: 'from-green-500 to-emerald-500', icon: Gamepad2 },
  { id: '4', name: 'Music', viewers: '42K', color: 'from-blue-500 to-cyan-500', icon: Music },
  { id: '5', name: 'Esports', viewers: '12K', color: 'from-yellow-500 to-orange-500', icon: Trophy },
];

const FEATURED_STREAM = {
  id: 'featured-1',
  title: 'GRAND FINALS: T1 vs GEN.G',
  streamer: 'LCK Official',
  channel: 'LCK Official',
  game: 'League of Legends',
  viewers: '245K',
  avatar: 'https://picsum.photos/100/100?random=88',
  thumbnail: 'https://picsum.photos/1920/1080?random=99',
  duration: 'LIVE'
};

const LIVE_CHANNELS = [
  { 
    id: '101', 
    streamer: 'TenZ', 
    title: 'RANK 1 GRIND! !sens !crosshair', 
    game: 'Valorant', 
    viewers: '42.5K', 
    tags: ['English', 'Pro'],
    avatar: 'https://picsum.photos/50/50?random=101',
    thumbnail: 'https://picsum.photos/400/225?random=101'
  },
  { 
    id: '102', 
    streamer: 'Kyedae', 
    title: 'Cooking stream + Valo later', 
    game: 'Just Chatting', 
    viewers: '12.1K', 
    tags: ['English', 'Cooking'],
    avatar: 'https://picsum.photos/50/50?random=102',
    thumbnail: 'https://picsum.photos/400/225?random=102'
  },
  { 
    id: '103', 
    streamer: 'Tarik', 
    title: 'WATCH PARTY VCT AMERICAS', 
    game: 'Valorant', 
    viewers: '85.3K', 
    tags: ['Esports', 'Watch Party'],
    avatar: 'https://picsum.photos/50/50?random=103',
    thumbnail: 'https://picsum.photos/400/225?random=103'
  }
];

const VIDEOS = [
  { id: '201', title: 'I Spent 100 Days in Hardcore Minecraft', channel: 'ForgeLabs', views: '5.2M', time: '2 days ago', duration: '45:10', thumbnail: 'https://picsum.photos/400/225?random=201', avatar: 'https://picsum.photos/50/50?random=50' },
  { id: '202', title: 'The STATE of Overwatch 2', channel: 'Seagull', views: '890K', time: '5 hours ago', duration: '12:05', thumbnail: 'https://picsum.photos/400/225?random=202', avatar: 'https://picsum.photos/50/50?random=51' },
  { id: '203', title: 'Elden Ring DLC is HARD', channel: 'MoistCr1TiKaL', views: '2.1M', time: '1 day ago', duration: '18:30', thumbnail: 'https://picsum.photos/400/225?random=203', avatar: 'https://picsum.photos/50/50?random=52' },
  { id: '204', title: 'Top 10 Valorant Plays of the Week', channel: 'Protatomonster', views: '350K', time: '3 days ago', duration: '10:01', thumbnail: 'https://picsum.photos/400/225?random=204', avatar: 'https://picsum.photos/50/50?random=53' },
  { id: '205', title: 'Building a PC in 2024', channel: 'Linus Tech Tips', views: '1.5M', time: '1 day ago', duration: '22:15', thumbnail: 'https://picsum.photos/400/225?random=205', avatar: 'https://picsum.photos/50/50?random=54' },
  { id: '206', title: 'Speedrun World Record', channel: 'Summoning Salt', views: '3.2M', time: '1 week ago', duration: '45:00', thumbnail: 'https://picsum.photos/400/225?random=206', avatar: 'https://picsum.photos/50/50?random=55' },
  { id: '207', title: 'Why I Quit League', channel: 'Tyler1', views: '800K', time: '2 hours ago', duration: '08:45', thumbnail: 'https://picsum.photos/400/225?random=207', avatar: 'https://picsum.photos/50/50?random=56' },
  { id: '208', title: 'Reacting to Your Setups', channel: 'RandomFrankP', views: '450K', time: '4 days ago', duration: '15:20', thumbnail: 'https://picsum.photos/400/225?random=208', avatar: 'https://picsum.photos/50/50?random=57' },
];

export const BrowseView: React.FC = () => {
  const [browseSection, setBrowseSection] = useState<'streams' | 'social'>('streams');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [progress, setProgress] = useState(0);

  // Interaction State
  const [likes, setLikes] = useState(125000);
  const [isLiked, setIsLiked] = useState(false);

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
    setSelectedVideo(video);
    setIsPlaying(true);
    setProgress(15); // Fake start progress

    // Reset interaction state for new video
    setLikes(Math.floor(Math.random() * 500000) + 10000);
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

  const filteredLiveChannels = LIVE_CHANNELS.filter(channel => 
    channel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.streamer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.game.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = VIDEOS.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.channel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasResults = filteredLiveChannels.length > 0 || filteredVideos.length > 0;

  const TRENDING_SEARCHES = ['Valorant Champions', 'Minecraft Speedrun', 'LCK Finals', 'Elden Ring DLC', 'ASMR Cooking'];

  return (
    <div className="h-full flex flex-col bg-[#0f1014] text-white overflow-y-auto custom-scrollbar">
      
      {/* --- Search Bar Section --- */}
      <div className="sticky top-0 z-40 bg-[#0f1014]/80 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-4xl mx-auto relative group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isSearching ? 'text-purple-500' : 'text-slate-500'}`} size={20} />
            <input 
                type="text"
                placeholder="Search for streams, videos, or gamers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearching(true)}
                onBlur={() => !searchQuery && setIsSearching(false)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
            />
            {searchQuery && (
                <button 
                    onClick={() => { setSearchQuery(''); setIsSearching(false); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X size={16} className="text-slate-400" />
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
      <div className="relative w-full h-[400px] md:h-[500px] shrink-0 group">
         <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-transparent to-transparent z-10"></div>
         <img src={FEATURED_STREAM.thumbnail} className="w-full h-full object-cover opacity-80" alt="Featured" />
         
         {/* Magical Ambience Toggle */}
         <button 
            onClick={toggleAmbientMusic}
            className={`absolute top-6 right-6 z-30 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border transition-all duration-300
                ${isAmbientMusic 
                    ? 'bg-purple-600/80 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)]' 
                    : 'bg-black/40 border-white/10 text-slate-300 hover:bg-black/60 hover:text-white'}
            `}
         >
             <Sparkles size={16} className={isAmbientMusic ? 'animate-spin-slow text-yellow-300' : ''} />
             <span className="text-xs font-bold uppercase tracking-wider">{isAmbientMusic ? 'Magical Ambience On' : 'Enable Ambience'}</span>
         </button>

         <div className="absolute bottom-0 left-0 p-8 z-20 w-full max-w-4xl">
            <div className="flex items-start gap-4 animate-slideUp">
                <img src={FEATURED_STREAM.avatar} className="w-20 h-20 rounded-2xl border-2 border-purple-500 shadow-lg shadow-purple-500/20" alt="Streamer" />
                <div>
                    <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold mb-2 inline-block">FEATURED</span>
                    <h1 className="text-4xl font-black mb-2 drop-shadow-lg">{FEATURED_STREAM.title}</h1>
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <span className="text-purple-400">{FEATURED_STREAM.streamer}</span>
                        <span className="text-slate-300">{FEATURED_STREAM.game}</span>
                        <span className="flex items-center gap-1 text-red-500"><Signal size={16} /> {FEATURED_STREAM.viewers} Viewers</span>
                    </div>
                    <p className="mt-4 text-slate-300 max-w-xl line-clamp-2">The ultimate showdown begins! Watch the best teams in the world compete for the championship trophy in this historic best of 5 series.</p>
                    
                    <div className="mt-6 flex gap-4">
                        <button 
                            onClick={() => handleVideoClick(FEATURED_STREAM)}
                            className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            <Play size={20} fill="black" /> Watch Now
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
        
        {/* --- Categories Filters --- */}
        <section>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {CATEGORIES.map(cat => (
                    <div key={cat.id} className="flex-shrink-0 group cursor-pointer">
                        <div className={`w-36 h-36 rounded-2xl bg-gradient-to-br ${cat.color} p-4 relative overflow-hidden transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-2xl`}>
                            <h3 className="font-bold text-xl relative z-10">{cat.name}</h3>
                            <p className="text-xs opacity-80 relative z-10">{cat.viewers}</p>
                            <cat.icon className="absolute -bottom-4 -right-4 text-white/20 w-24 h-24 transform group-hover:rotate-12 transition-transform" />
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* --- Live Channels Grid --- */}
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

        {/* --- Recommended Videos (YouTube Style) --- */}
        <section className="pt-8 border-t border-slate-800">
            <h2 className="text-2xl font-bold mb-6 text-slate-200 flex items-center gap-2">
                Recommended Videos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
                {VIDEOS.map(video => (
                    <div key={video.id} className="group cursor-pointer" onClick={() => handleVideoClick(video)}>
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-slate-800 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/20 group-hover:ring-1 group-hover:ring-white/10">
                            <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={video.title} />
                            <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                                {video.duration}
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <img src={video.avatar} className="w-9 h-9 rounded-full object-cover" alt={video.channel} />
                            <div className="flex-1">
                                <h3 className="font-bold text-sm text-white line-clamp-2 leading-tight group-hover:text-purple-400 transition-colors">
                                    {video.title}
                                </h3>
                                <div className="text-xs text-slate-400 mt-1 space-y-0.5">
                                    <p className="hover:text-white transition-colors flex items-center gap-1 group/channel">
                                        {video.channel}
                                        <CheckCircle2 size={12} className="text-slate-500 group-hover/channel:text-purple-400 transition-colors" />
                                    </p>
                                    <p>{video.views} views • {video.time}</p>
                                </div>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity self-start text-slate-400 hover:text-white">
                                <MoreVertical size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>

      </div>
        </>
        )
      ) : (
        <div className="p-6 md:p-8 space-y-12 animate-fadeIn">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white">
                    Search Results for <span className="text-purple-500">"{searchQuery}"</span>
                </h2>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                    {filteredLiveChannels.length + filteredVideos.length} Results Found
                </p>
            </div>

            {!hasResults ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
                        <Search size={40} className="text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No matches found</h3>
                    <p className="text-slate-500 max-w-xs">We couldn't find any videos or streams matching your search. Try different keywords.</p>
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="mt-8 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all active:scale-95"
                    >
                        Clear Search
                    </button>
                </div>
            ) : (
                <>
                    {/* Filtered Live Channels */}
                    {filteredLiveChannels.length > 0 && (
                        <section>
                            <h3 className="text-lg font-bold mb-6 text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Signal size={18} className="text-red-500" /> Live Streams
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredLiveChannels.map(channel => (
                                    <div key={channel.id} className="group cursor-pointer" onClick={() => handleVideoClick(channel)}>
                                        <div className="relative aspect-video rounded-xl overflow-hidden mb-3 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/20 group-hover:ring-1 group-hover:ring-white/10">
                                            <img src={channel.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={channel.title} />
                                            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                                                <Signal size={10} /> Live
                                            </div>
                                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded">
                                                {channel.viewers} viewers
                                            </div>
                                            <div className="absolute inset-0 bg-purple-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                <Play size={48} className="text-white drop-shadow-lg scale-50 group-hover:scale-100 transition-transform duration-300 ease-out" fill="white" />
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <img src={channel.avatar} className="w-10 h-10 rounded-full ring-2 ring-transparent group-hover:ring-purple-500 transition-all" alt="Avatar" />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-sm text-white truncate group-hover:text-purple-400 transition-colors">{channel.title}</h3>
                                                <p className="text-xs text-slate-400 mt-1">{channel.streamer}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{channel.game}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Filtered Videos */}
                    {filteredVideos.length > 0 && (
                        <section className="pt-8 border-t border-slate-800">
                            <h3 className="text-lg font-bold mb-6 text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Video size={18} className="text-purple-500" /> Videos
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
                                {filteredVideos.map(video => (
                                    <div key={video.id} className="group cursor-pointer" onClick={() => handleVideoClick(video)}>
                                        <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-slate-800 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/20 group-hover:ring-1 group-hover:ring-white/10">
                                            <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={video.title} />
                                            <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                                                {video.duration}
                                            </span>
                                        </div>
                                        <div className="flex gap-3">
                                            <img src={video.avatar} className="w-9 h-9 rounded-full object-cover" alt={video.channel} />
                                            <div className="flex-1">
                                                <h3 className="font-bold text-sm text-white line-clamp-2 leading-tight group-hover:text-purple-400 transition-colors">
                                                    {video.title}
                                                </h3>
                                                <div className="text-xs text-slate-400 mt-1">
                                                    <p className="hover:text-white transition-colors flex items-center gap-1 group/channel">
                                                        {video.channel}
                                                        <CheckCircle2 size={12} className="text-slate-500" />
                                                    </p>
                                                    <p>{video.views} views • {video.time}</p>
                                                </div>
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

      {/* --- Video Player Modal with Zoom Animation --- */}
      {selectedVideo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn" onClick={closeVideo}>
                <div 
                    className="relative w-full max-w-6xl bg-[#0f1014] rounded-2xl shadow-2xl overflow-hidden animate-zoomIn border border-slate-800"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#1e1f24]">
                        <h3 className="font-bold text-lg truncate pr-4">{selectedVideo.title}</h3>
                        <button onClick={closeVideo} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Video Area */}
                    <div className="aspect-video bg-black relative group cursor-pointer" onClick={togglePlay}>
                        <img src={selectedVideo.thumbnail || 'https://picsum.photos/1920/1080'} className="w-full h-full object-cover opacity-60" />
                        
                        {/* Centered Play Button (Show only when paused) */}
                        {!isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                <div className="w-24 h-24 rounded-full bg-purple-600/90 backdrop-blur-sm hover:bg-purple-500 flex items-center justify-center shadow-[0_0_40px_rgba(147,51,234,0.5)] transition-transform hover:scale-110 pointer-events-auto">
                                    <Play size={40} fill="white" className="ml-2" />
                                </div>
                            </div>
                        )}

                        {/* Controls Overlay */}
                        <div 
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-6 pb-6 pt-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-4 cursor-default"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Progress Bar */}
                            <div className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group/progress hover:h-2.5 transition-all" onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const percent = ((e.clientX - rect.left) / rect.width) * 100;
                                setProgress(Math.max(0, Math.min(100, percent)));
                            }}>
                                <div className="absolute h-full bg-purple-500 rounded-full" style={{ width: `${progress}%` }}>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 shadow-lg transform scale-0 group-hover/progress:scale-100 transition-all"></div>
                                </div>
                            </div>

                            {/* Control Buttons */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <button onClick={togglePlay} className="text-white hover:text-purple-400 transition-colors transform hover:scale-110 active:scale-95">
                                        {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                                    </button>
                                    
                                    <div className="flex items-center gap-3 group/vol">
                                        <button onClick={() => setVolume(volume === 0 ? 80 : 0)} className="text-white hover:text-purple-400 transition-colors">
                                             {volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                                        </button>
                                        <div className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300">
                                            <input 
                                                type="range" 
                                                min="0" 
                                                max="100" 
                                                value={volume} 
                                                onChange={(e) => setVolume(Number(e.target.value))}
                                                className="w-24 h-1 accent-purple-500 bg-white/20 rounded-lg appearance-none cursor-pointer" 
                                            />
                                        </div>
                                    </div>

                                    <div className="text-xs font-mono font-bold text-slate-300 tracking-wider">
                                        04:20 <span className="text-slate-500 mx-1">/</span> {selectedVideo.duration || '10:00'}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button className="text-slate-300 hover:text-white transition-colors hover:rotate-90 duration-300"><Settings size={22} /></button>
                                    <button className="text-slate-300 hover:text-white transition-colors hover:scale-110"><Maximize size={22} /></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Meta & Chat Area */}
                    <div className="p-6 flex flex-col md:flex-row gap-6 bg-[#0f1014]">
                        <div className="flex-1">
                             <div className="flex items-start gap-4 mb-6">
                                <img src={selectedVideo.avatar || `https://picsum.photos/50/50?random=${selectedVideo.id}`} className="w-12 h-12 rounded-full" />
                                <div>
                                    <h4 className="font-bold text-lg">{selectedVideo.channel || selectedVideo.streamer}</h4>
                                    <p className="text-slate-400 text-sm">{selectedVideo.viewers || selectedVideo.views} • {selectedVideo.game || selectedVideo.time}</p>
                                </div>
                                <button className="ml-auto bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                                    Subscribe
                                </button>
                             </div>
                             
                             <div className="flex gap-3 pb-4">
                                <button 
                                    onClick={toggleLike}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all transform active:scale-95
                                    ${isLiked ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}
                                    `}>
                                    <ThumbsUp size={16} fill={isLiked ? "currentColor" : "none"} /> 
                                    {likes.toLocaleString()}
                                </button>
                                <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full text-sm font-bold transition-colors text-slate-200">
                                    <MessageCircle size={16} /> Comment
                                </button>
                                <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full text-sm font-bold transition-colors text-slate-200">
                                    <Share2 size={16} /> Share
                                </button>
                             </div>
                        </div>
                        
                        {/* Pseudo Chat (Desktop Only) */}
                        <div className="hidden md:flex w-80 bg-[#1e1f24] rounded-xl flex-col h-64 border border-slate-800">
                             <div className="p-3 border-b border-slate-800 font-bold text-xs uppercase tracking-wider">Stream Chat</div>
                             <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm font-medium">
                                <p><span className="text-purple-400">User123:</span> POGGERS!</p>
                                <p><span className="text-green-400">Mod_Steve:</span> Please keep it clean.</p>
                                <p><span className="text-blue-400">GamerGirl:</span> That aim is insane</p>
                                <p><span className="text-orange-400">NoobSlayer:</span> LULW</p>
                             </div>
                             <div className="p-3 border-t border-slate-800">
                                 <input placeholder="Send a message..." className="w-full bg-black/30 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
                             </div>
                        </div>
                    </div>
                </div>
            </div>
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
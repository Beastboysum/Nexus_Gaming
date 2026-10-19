import React, { useState, useEffect } from 'react';
import { 
  Play, Users, Mic, Gamepad2, Plus, X, MessageSquare, Phone, Video, 
  MoreVertical, Shield, User, Trophy, Flame, Check, Star, Rocket, Sparkles,
  Search, Tv, Radio, CheckCircle2 
} from 'lucide-react';
import { User as UserType, CreatorChannel, VideoPost } from '../types';
import { DailyStreakCounter } from '../components/DailyStreakCounter';
import { InteractiveMascot } from '../components/InteractiveMascot';
import { MetaPulseWidget } from '../components/MetaPulseWidget';
import { PersonalizedVideoShelf } from '../components/PersonalizedVideoShelf';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { ChannelProfileModal } from '../components/ChannelProfileModal';
import { searchLocalCreators } from '../services/creatorDirectory';
import { VIDEO_CATALOG, getVideoThumbnail, trackSearch } from '../services/recommendationEngine';
import { isJuniorModeEnabled } from '../services/juniorModeContext';
import { playCategorizedAudio } from '../services/audioManager';

interface HomeProps {
    onNavigate: (view: any) => void;
    onOpenDM?: (user: UserType) => void;
    onCall?: (user: UserType) => void;
}

const ONLINE_FRIENDS = [
    { 
        id: '2', 
        username: 'Nelly', 
        game: 'Valorant', 
        status: 'online', 
        avatar: 'https://picsum.photos/100/100?random=10', 
        bio: 'Instalock Jett. If I dash in and die, it\'s lag.',
        banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop',
        level: 42
    },
    { 
        id: '4', 
        username: 'Graggle', 
        game: 'Minecraft', 
        status: 'online', 
        avatar: 'https://picsum.photos/100/100?random=12', 
        bio: 'Building a 1:1 scale replica of Earth. Currently on block 4,203,121.',
        banner: 'https://images.unsplash.com/photo-1607677914754-58a36d240214?q=80&w=1000&auto=format&fit=crop',
        level: 15
    },
    { 
        id: '3', 
        username: 'Mallow', 
        game: 'Lobby', 
        status: 'idle', 
        avatar: 'https://picsum.photos/100/100?random=11', 
        bio: 'Just vibing in the lobby. Probably eating.',
        banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop',
        level: 99
    },
    { 
        id: '5', 
        username: 'Jinx', 
        game: 'LoL', 
        status: 'dnd', 
        avatar: 'https://picsum.photos/100/100?random=45', 
        bio: 'ADC main. Support diff. Don\'t talk to me if I\'m losing.',
        banner: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1000&auto=format&fit=crop',
        level: 300
    }
];

export const HomeView: React.FC<HomeProps> = ({ onNavigate, onOpenDM, onCall }) => {
    const [selectedFriend, setSelectedFriend] = useState<typeof ONLINE_FRIENDS[0] | null>(null);
    const [inHeroList, setInHeroList] = useState(false);
    const [isJunior, setIsJunior] = useState<boolean>(isJuniorModeEnabled());
    const [homeSearch, setHomeSearch] = useState('');
    const [selectedVideo, setSelectedVideo] = useState<VideoPost | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<CreatorChannel | null>(null);

    useEffect(() => {
        setIsJunior(isJuniorModeEnabled());
        const handleJunior = (e: any) => {
            setIsJunior(e.detail?.enabled ?? isJuniorModeEnabled());
        };
        window.addEventListener('nexus_junior_mode_changed', handleJunior);
        return () => window.removeEventListener('nexus_junior_mode_changed', handleJunior);
    }, []);

    useEffect(() => {
        if (homeSearch.trim().length >= 2) {
            const timer = setTimeout(() => {
                trackSearch(homeSearch.trim());
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [homeSearch]);

    const trimmedHomeSearch = homeSearch.trim().toLowerCase();
    const matchedCreators = trimmedHomeSearch ? searchLocalCreators(trimmedHomeSearch, isJunior).slice(0, 3) : [];
    const matchedVideos = trimmedHomeSearch ? VIDEO_CATALOG.filter(v => {
        if (isJunior && !v.kidFriendly) return false;
        return v.title.toLowerCase().includes(trimmedHomeSearch) || 
               v.author.toLowerCase().includes(trimmedHomeSearch) ||
               v.category?.toLowerCase().includes(trimmedHomeSearch) ||
               v.tags?.some(t => t.toLowerCase().includes(trimmedHomeSearch));
    }).slice(0, 6) : [];

    const handleFriendClick = (friend: typeof ONLINE_FRIENDS[0]) => {
        playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.5);
        setSelectedFriend(friend);
    };

    const handleCloseModal = () => {
        setSelectedFriend(null);
    };

    const handleMessage = () => {
        if (selectedFriend && onOpenDM) {
            onOpenDM(selectedFriend as unknown as UserType);
        } else {
            onNavigate('chat');
        }
    };

    const handleCall = () => {
        if (selectedFriend && onCall) {
            // Need to cast the friend type to UserType for the callback
            const user: UserType = {
                id: selectedFriend.id,
                username: selectedFriend.username,
                avatar: selectedFriend.avatar,
                status: selectedFriend.status as any
            };
            handleCloseModal();
            onCall(user);
        } else {
            onNavigate('voice');
        }
    };

    return (
        <div className="p-3 xs:p-4 sm:p-6 md:p-8 space-y-4 xs:space-y-6 sm:space-y-8 md:space-y-10 animate-fadeIn max-w-[1800px] mx-auto pb-10 sm:pb-20">
            
            {/* --- FRIEND PROFILE MODAL --- */}
            {selectedFriend && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 xs:p-4 animate-fadeIn" onClick={handleCloseModal}>
                    <div 
                        className="relative w-full max-w-sm bg-[#18181b] rounded-2xl sm:rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 animate-zoomIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Banner */}
                        <div className="h-28 sm:h-32 w-full relative">
                            <img src={selectedFriend.banner} className="w-full h-full object-cover" alt="Banner" />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#18181b]/90"></div>
                            <button 
                                onClick={handleCloseModal}
                                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors backdrop-blur-md"
                            >
                                <X size={18} className="sm:w-5 sm:h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-4 sm:px-6 pb-6 sm:pb-8 relative">
                            {/* Avatar */}
                            <div className="absolute -top-10 sm:-top-12 left-4 sm:left-6">
                                <div className="relative">
                                    <img 
                                        src={selectedFriend.avatar} 
                                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl border-4 border-[#18181b] object-cover shadow-xl bg-[#202023]" 
                                        alt="Avatar" 
                                    />
                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-4 border-[#18181b] 
                                        ${selectedFriend.status === 'online' ? 'bg-green-500' : selectedFriend.status === 'idle' ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                    />
                                </div>
                            </div>

                            {/* Header Info */}
                            <div className="pt-12 sm:pt-14 flex justify-between items-start mb-4 sm:mb-6">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-white leading-none mb-1">{selectedFriend.username}</h2>
                                    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                                        <span className={`
                                            ${selectedFriend.status === 'online' ? 'text-green-400' : 
                                              selectedFriend.status === 'idle' ? 'text-yellow-400' : 'text-red-400'}
                                        `}>
                                            {selectedFriend.status === 'online' ? 'Online' : 
                                             selectedFriend.status === 'idle' ? 'Idle' : 'Do Not Disturb'}
                                        </span>
                                        <span className="text-slate-600">•</span>
                                        <span className="text-purple-400">{selectedFriend.game}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1 text-yellow-500 font-bold text-xs sm:text-sm bg-yellow-500/10 px-2 py-0.5 rounded-lg border border-yellow-500/20">
                                        <Trophy size={11} className="sm:w-3 sm:h-3" /> Lvl {selectedFriend.level}
                                    </div>
                                </div>
                            </div>

                            {/* About Me */}
                            <div className="bg-[#202023] rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 border border-white/5 relative group">
                                <h3 className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 sm:mb-2">About Me</h3>
                                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">"{selectedFriend.bio}"</p>
                            </div>

                            {/* Actions Grid */}
                            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2">
                                <button 
                                    onClick={handleMessage}
                                    className="col-span-1 py-2 sm:py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-lg shadow-purple-600/20 active:scale-95 text-xs sm:text-sm"
                                >
                                    <MessageSquare size={16} /> Message
                                </button>
                                <button 
                                    onClick={handleCall}
                                    className="col-span-1 py-2 sm:py-3 bg-[#202023] hover:bg-[#2b2b30] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all border border-white/5 active:scale-95 text-xs sm:text-sm"
                                >
                                    <Phone size={16} /> Call
                                </button>
                                <button 
                                    onClick={() => {
                                        handleCloseModal();
                                        onNavigate('dashboard');
                                    }}
                                    className="col-span-2 py-2.5 sm:py-3 bg-[#202023] hover:bg-[#2b2b30] text-slate-300 hover:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-white/5 active:scale-95 text-xs sm:text-sm"
                                >
                                    <User size={16} /> View Career Stats
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- DAILY LOGIN STREAK COUNTER --- */}
            <DailyStreakCounter />

            {/* --- JUNIOR MODE WELCOME & QUICK SHORTCUTS (10-YEAR OLD FRIENDLY) --- */}
            {isJunior ? (
                <div className="relative rounded-2xl xs:rounded-3xl sm:rounded-[2.5rem] overflow-hidden p-4 xs:p-6 sm:p-10 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white shadow-2xl ring-2 ring-amber-300/60 animate-fadeIn">
                    <div className="relative z-10 space-y-2.5 xs:space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3.5 py-0.5 xs:py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-black text-[10px] xs:text-xs uppercase tracking-wider">
                            <Rocket size={13} className="text-yellow-200 xs:w-3.5 xs:h-3.5" />
                            <span>Nexus Junior Mode Active</span>
                        </div>
                        <h1 className="text-2xl xs:text-3xl sm:text-5xl font-black leading-tight drop-shadow-md">
                            Hey Champion! 🌟<br />Ready for Fun Gaming?
                        </h1>
                        <p className="text-white/95 text-xs xs:text-base sm:text-lg font-medium leading-relaxed">
                            Watch the best Minecraft & Roblox videos, catch up with your friends, and unlock cool daily game trophies!
                        </p>
                        <div className="flex flex-wrap gap-2 xs:gap-3 pt-1 xs:pt-2">
                            <button
                                onClick={() => onNavigate('social')}
                                className="px-4 xs:px-6 py-2.5 xs:py-3.5 bg-white text-orange-600 font-black rounded-xl xs:rounded-2xl hover:scale-105 transition-transform flex items-center gap-1.5 xs:gap-2 text-xs xs:text-base shadow-xl active:scale-95"
                            >
                                <Play size={16} fill="currentColor" className="xs:w-5 xs:h-5" /> WATCH FUN VIDEOS
                            </button>
                            <button
                                onClick={() => onNavigate('chat')}
                                className="px-4 xs:px-6 py-2.5 xs:py-3.5 bg-black/30 hover:bg-black/40 text-white font-black rounded-xl xs:rounded-2xl transition-all border border-white/20 flex items-center gap-1.5 xs:gap-2 text-xs xs:text-base active:scale-95"
                            >
                                <MessageSquare size={16} className="xs:w-5 xs:h-5" /> SAY HI TO FRIENDS
                            </button>
                        </div>
                    </div>

                    {/* Playful Floating Decors */}
                    <div className="absolute right-3 bottom-3 sm:right-10 sm:bottom-6 text-5xl sm:text-9xl opacity-20 pointer-events-none select-none animate-bounce">
                        🚀
                    </div>
                </div>
            ) : (
                /* Standard Hero Section */
                <div className="relative h-[260px] xs:h-[320px] sm:h-[400px] md:h-[450px] w-full rounded-2xl xs:rounded-3xl sm:rounded-[2.5rem] overflow-hidden group shadow-2xl ring-1 ring-white/10">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent z-10"></div>
                    <img src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2665&auto=format&fit=crop" 
                        className="w-full h-full object-cover transition-transform duration-[10s] ease-linear group-hover:scale-110" alt="Hero" />
                    
                    <div className="absolute bottom-0 left-0 p-4 xs:p-6 sm:p-8 md:p-16 z-20 w-full md:w-2/3 space-y-2.5 xs:space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-2 xs:gap-3">
                            <span className="px-2 xs:px-3 py-0.5 xs:py-1 bg-red-600 text-white text-[10px] xs:text-xs font-black tracking-widest rounded uppercase">Live Event</span>
                            <span className="px-2 xs:px-3 py-0.5 xs:py-1 bg-white/10 backdrop-blur-md text-white text-[10px] xs:text-xs font-bold rounded uppercase border border-white/20">Valorant Champions</span>
                        </div>
                        <h1 className="text-2xl xs:text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[0.95] drop-shadow-2xl">
                            DEFY THE <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600">LIMITS</span>
                        </h1>
                        <p className="text-slate-200 text-xs xs:text-sm sm:text-base md:text-xl font-medium max-w-lg drop-shadow-md line-clamp-2 xs:line-clamp-3 sm:line-clamp-none">
                            Join the global community in the biggest esports event of the year. Watch live matches, earn drops, and predict the winner.
                        </p>
                        <div className="flex flex-wrap gap-2 xs:gap-3 sm:gap-4 pt-1 sm:pt-4">
                            <button onClick={() => onNavigate('social')} className="px-4 xs:px-6 sm:px-8 py-2 xs:py-3 sm:py-4 bg-white text-black font-black text-xs xs:text-sm sm:text-base rounded-xl sm:rounded-2xl hover:scale-105 transition-transform flex items-center gap-1.5 xs:gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                                <Play fill="black" size={16} className="xs:w-5 xs:h-5" /> WATCH LIVE
                            </button>
                            <button 
                                onClick={() => {
                                    setInHeroList(!inHeroList);
                                    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.5);
                                }}
                                className={`px-4 xs:px-6 sm:px-8 py-2 xs:py-3 sm:py-4 backdrop-blur-md font-bold text-xs xs:text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all border flex items-center gap-1.5 xs:gap-2 ${
                                    inHeroList 
                                        ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/30' 
                                        : 'bg-black/40 text-white hover:bg-black/60 border-white/10'
                                }`}
                            >
                                {inHeroList ? (
                                    <>
                                        <Check size={16} className="xs:w-5 xs:h-5 text-white" /> IN MY WATCHLIST
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} className="xs:w-5 xs:h-5" /> ADD TO LIST
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- QUICK SEARCH: VIDEOS & CREATOR CHANNELS IN NEXUS THEME --- */}
            <section className="bg-gradient-to-r from-purple-950/30 via-slate-900/40 to-indigo-950/30 p-3.5 xs:p-5 sm:p-7 rounded-2xl xs:rounded-3xl sm:rounded-[2rem] border border-white/10 shadow-2xl space-y-3 xs:space-y-4 sm:space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 xs:gap-3">
                    <div>
                        <h2 className="text-base xs:text-xl sm:text-2xl font-black text-white flex items-center gap-1.5 xs:gap-2">
                            <Search className="text-purple-400 w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
                            <span>Find Any Video or Creator Channel</span>
                        </h2>
                        <p className="text-[10px] xs:text-xs sm:text-sm text-slate-400 mt-0.5">
                            Search for any gaming video, YouTube channel, or Twitch stream — all rendered in Nexus theme with original thumbnails
                        </p>
                    </div>

                    <button
                        onClick={() => onNavigate('social')}
                        className="self-start sm:self-auto text-[11px] xs:text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 group py-1"
                    >
                        <span>Open Full Search Mode</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </div>

                {/* Search Bar Input */}
                <div className="relative">
                    <Search className="absolute left-3.5 xs:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 xs:w-4.5 xs:h-4.5" />
                    <input
                        type="text"
                        placeholder="Search for any YouTube creator (@MrBeast, DanTDM, TenZ) or topic (Minecraft, Valorant, Elden Ring)..."
                        value={homeSearch}
                        onChange={(e) => setHomeSearch(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl sm:rounded-2xl py-2.5 xs:py-3 pl-10 xs:pl-12 pr-10 xs:pr-12 text-xs xs:text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder:text-slate-500"
                    />
                    {homeSearch && (
                        <button
                            onClick={() => setHomeSearch('')}
                            className="absolute right-3 xs:right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full text-slate-400"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                {/* Quick Trending Creator Chips */}
                <div className="flex items-center gap-1.5 xs:gap-2 flex-wrap">
                    <span className="text-[10px] xs:text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Sparkles size={11} className="text-purple-400" /> Quick Channels:
                    </span>
                    {['MrBeast', 'DanTDM', 'PewDiePie', 'Kai Cenat', 'TenZ', 'Tarik', 'Ninja', 'Aphmau', 'Shroud', 'Minecraft 100 Days'].map(tag => (
                        <button
                            key={tag}
                            onClick={() => {
                                setHomeSearch(tag);
                                playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.4);
                            }}
                            className="px-2 xs:px-2.5 py-0.5 xs:py-1 rounded-lg xs:rounded-xl bg-white/5 hover:bg-purple-600/20 border border-white/5 hover:border-purple-500/40 text-[10px] xs:text-xs font-semibold text-slate-300 hover:text-purple-300 transition-all"
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Live Search Results (Channels + Videos) */}
                {homeSearch.trim() && (
                    <div className="space-y-4 xs:space-y-5 pt-3 border-t border-white/5 animate-fadeIn">
                        {/* Matched Creator Channels */}
                        {matchedCreators.length > 0 && (
                            <div className="space-y-2.5 xs:space-y-3">
                                <h3 className="text-[11px] xs:text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                                    <Users size={13} /> Creator Channels in Nexus Theme
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4">
                                    {matchedCreators.map(creator => (
                                        <div
                                            key={creator.id}
                                            onClick={() => {
                                                playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.4);
                                                setSelectedChannel(creator);
                                            }}
                                            className="group relative rounded-xl xs:rounded-2xl overflow-hidden bg-[#12131c] border border-white/10 hover:border-purple-500/50 p-3 xs:p-4 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg flex flex-col justify-between"
                                        >
                                            <div className="flex items-center gap-2.5 xs:gap-3">
                                                <div className="relative w-12 h-12 xs:w-14 xs:h-14 rounded-xl xs:rounded-2xl overflow-hidden ring-2 ring-purple-500/30 shrink-0 bg-black">
                                                    <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
                                                    {creator.isLive && (
                                                        <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-black animate-pulse" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1">
                                                        <h4 className="font-bold text-xs xs:text-sm text-white truncate group-hover:text-purple-300 transition-colors">
                                                            {creator.name}
                                                        </h4>
                                                        {creator.verified && <CheckCircle2 size={12} className="text-purple-400 shrink-0" />}
                                                    </div>
                                                    <p className="text-[11px] xs:text-xs text-purple-400 font-semibold">{creator.handle}</p>
                                                    <p className="text-[10px] xs:text-[11px] text-slate-400 mt-0.5">{creator.subscribers}</p>
                                                </div>
                                            </div>

                                            <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] xs:text-xs">
                                                <span className="px-1.5 xs:px-2 py-0.5 rounded-md bg-white/5 text-[9.5px] xs:text-[10px] font-bold text-slate-300">
                                                    {creator.platform === 'both' ? 'YT & Twitch' : creator.platform === 'twitch' ? 'Twitch' : 'YouTube'}
                                                </span>
                                                <span className="text-purple-400 font-bold group-hover:underline">
                                                    Open Channel in Nexus →
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Matched Videos */}
                        {matchedVideos.length > 0 && (
                            <div className="space-y-2.5 xs:space-y-3">
                                <h3 className="text-[11px] xs:text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                                    <Video size={13} /> Matching Videos (Original YouTube Thumbnails)
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4">
                                    {matchedVideos.map(video => (
                                        <div
                                            key={video.id}
                                            onClick={() => {
                                                playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-interface-click-901.mp3', 'system', 0.4);
                                                setSelectedVideo(video);
                                            }}
                                            className="group relative rounded-xl xs:rounded-2xl overflow-hidden cursor-pointer bg-[#12131c] border border-white/10 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1 shadow-lg flex flex-col justify-between"
                                        >
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
                                                <div className="absolute bottom-1.5 xs:bottom-2 right-1.5 xs:right-2 px-1.5 xs:px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-white font-mono text-[10px] xs:text-xs font-bold shadow-md">
                                                    {video.duration}
                                                </div>
                                                <div className="absolute top-1.5 xs:top-2 left-1.5 xs:left-2 px-1.5 xs:px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[9px] xs:text-[10px] font-bold text-red-400 flex items-center gap-1">
                                                    <Tv size={10} /> YouTube
                                                </div>
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                    <div className="w-9 h-9 xs:w-11 xs:h-11 rounded-xl xs:rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
                                                        <Play size={16} fill="currentColor" className="ml-0.5" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-2.5 xs:p-3.5 flex-1 flex flex-col justify-between">
                                                <h4 className="font-bold text-xs xs:text-sm text-white line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors">
                                                    {video.title}
                                                </h4>
                                                <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px] xs:text-xs text-slate-400">
                                                    <span className="truncate max-w-[120px] font-medium text-slate-300">{video.author}</span>
                                                    <span>{video.views}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {matchedCreators.length === 0 && matchedVideos.length === 0 && (
                            <div className="py-5 text-center text-slate-400 text-xs">
                                No local matches for "{homeSearch}". Click <span onClick={() => onNavigate('social')} className="text-purple-400 font-bold underline cursor-pointer">Open Full Search Mode</span> to search all of YouTube and Twitch with live AI discovery!
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* --- YOUTUBE-STYLE PERSONALIZED RECOMMENDATION SHELF --- */}
            <PersonalizedVideoShelf 
                title="Recommended For You" 
                subtitle="Personalized algorithm picks based on your watch time, likes & searches" 
                limit={6} 
            />

            {/* --- NEXUS METAPULSE AI RADAR (GOOGLE SEARCH GROUNDED) --- */}
            {!isJunior && (
                <MetaPulseWidget onOpenFullHub={() => onNavigate('metapulse')} />
            )}

            {/* --- INTERACTIVE MASCOT COMPANION --- */}
            <InteractiveMascot />

            {/* Quick Stats & Active Friends */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xs:gap-6 lg:gap-8">
                {/* Active Friends List */}
                <div className="lg:col-span-2 bg-[#121216]/50 backdrop-blur-sm rounded-2xl xs:rounded-3xl p-3.5 xs:p-4.5 sm:p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-3 xs:mb-4 sm:mb-6">
                        <h2 className="text-base xs:text-lg sm:text-xl font-bold flex items-center gap-1.5 xs:gap-2 text-white">
                            <Users className="text-purple-500 w-4 h-4 xs:w-5 xs:h-5" /> Online Friends <span className="text-slate-500 text-xs xs:text-sm font-medium">({ONLINE_FRIENDS.length})</span>
                        </h2>
                        <button onClick={() => onNavigate('friends')} className="text-xs xs:text-sm font-bold text-purple-400 hover:text-purple-300">View All</button>
                    </div>
                    <div className="flex gap-2.5 xs:gap-3.5 sm:gap-4 overflow-x-auto pb-2 xs:pb-4 no-scrollbar">
                        {ONLINE_FRIENDS.map((friend) => (
                            <div 
                                key={friend.id} 
                                onClick={() => handleFriendClick(friend)}
                                className="flex flex-col items-center min-w-[85px] xs:min-w-[95px] sm:min-w-[100px] p-2 xs:p-2.5 sm:p-3 rounded-xl xs:rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group relative overflow-hidden shrink-0"
                            >
                                <div className="relative mb-2 xs:mb-3">
                                    <img src={friend.avatar} className="w-11 h-11 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-xl xs:rounded-2xl object-cover ring-2 ring-transparent group-hover:ring-purple-500 transition-all" alt={friend.username} />
                                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 xs:w-4 xs:h-4 rounded-full border-2 border-[#121216] 
                                        ${friend.status === 'online' ? 'bg-green-500' : friend.status === 'idle' ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                    />
                                </div>
                                <span className="font-bold text-xs xs:text-sm truncate w-full text-center text-white">{friend.username}</span>
                                <span className="text-[10px] xs:text-xs text-purple-400 font-medium truncate w-full text-center">{friend.game}</span>
                            </div>
                        ))}
                        
                        {/* Invite Button */}
                        <button onClick={() => onNavigate('friends')} className="flex flex-col items-center justify-center min-w-[85px] xs:min-w-[95px] sm:min-w-[100px] h-[115px] xs:h-[125px] sm:h-[140px] rounded-xl xs:rounded-2xl border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-white/5 transition-all group shrink-0">
                            <div className="w-9 h-9 xs:w-11 xs:h-11 sm:w-12 sm:h-12 rounded-full bg-white/5 flex items-center justify-center mb-1.5 xs:mb-2 group-hover:scale-110 transition-transform">
                                <Plus className="text-slate-400 group-hover:text-purple-400 w-4 h-4 xs:w-5 xs:h-5" />
                            </div>
                            <span className="text-xs xs:text-sm font-bold text-slate-500 group-hover:text-white">Invite</span>
                        </button>
                    </div>
                </div>

                {/* Quick Join Voice */}
                <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-sm rounded-2xl xs:rounded-3xl p-4 sm:p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                     <div>
                        <div className="flex items-center gap-2 mb-2">
                             <Mic className="text-green-400 animate-pulse w-4 h-4 xs:w-5 xs:h-5" />
                             <span className="font-bold text-green-400 text-xs xs:text-sm tracking-wider uppercase">Active Voice</span>
                        </div>
                        <h3 className="text-lg xs:text-xl sm:text-2xl font-black text-white mb-0.5 xs:mb-1">General Voice</h3>
                        <p className="text-slate-300 text-xs xs:text-sm">3 Friends are chilling</p>
                        
                        <div className="flex -space-x-2 mt-3 xs:mt-4">
                            {[10,11,12].map(i => (
                                <img key={i} src={`https://picsum.photos/100/100?random=${i}`} className="w-7 h-7 xs:w-8 xs:h-8 rounded-full border-2 border-indigo-900" />
                            ))}
                        </div>
                     </div>
                     <button onClick={() => onNavigate('voice')} className="mt-4 xs:mt-6 w-full py-2.5 xs:py-3 bg-white text-black font-bold text-xs xs:text-sm rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-purple-500/20">
                         Jump In
                     </button>
                </div>
            </div>

            {/* Recent Games / Continue Playing */}
            <div>
                <h2 className="text-lg xs:text-xl sm:text-2xl font-bold mb-3 xs:mb-4 sm:mb-6 flex items-center gap-2 text-white">
                    <Gamepad2 className="text-pink-500 w-5 h-5 sm:w-6 sm:h-6" /> Jump Back In
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6">
                    {[
                        { title: 'Valorant', time: '2h ago', img: 'https://images.unsplash.com/photo-1624138784180-48145465d61f?q=80&w=1000&auto=format&fit=crop', color: 'text-red-500', bg: 'hover:shadow-red-500/20' },
                        { title: 'Minecraft', time: 'Yesterday', img: 'https://images.unsplash.com/photo-1607677914754-58a36d240214?q=80&w=1000&auto=format&fit=crop', color: 'text-green-500', bg: 'hover:shadow-green-500/20' },
                        { title: 'Apex Legends', time: '3d ago', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop', color: 'text-orange-500', bg: 'hover:shadow-orange-500/20' },
                        { title: 'Cyberpunk 2077', time: '1w ago', img: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1000&auto=format&fit=crop', color: 'text-yellow-500', bg: 'hover:shadow-yellow-500/20' },
                    ].map((game, i) => (
                        <div key={i} className={`group relative h-40 xs:h-44 sm:h-48 rounded-2xl xs:rounded-3xl overflow-hidden cursor-pointer shadow-lg transition-all duration-300 hover:scale-[1.02] ${game.bg}`}>
                            <img src={game.img} className="w-full h-full object-cover group-hover:blur-[2px] transition-all" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                            <div className="absolute bottom-3 xs:bottom-4 left-3 xs:left-4">
                                <h3 className="text-base xs:text-lg sm:text-xl font-black text-white">{game.title}</h3>
                                <p className="text-[11px] xs:text-xs text-slate-300 font-medium flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${game.color.replace('text', 'bg')}`}></span> Played {game.time}
                                </p>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-10 h-10 xs:w-12 xs:h-12 bg-white rounded-full flex items-center justify-center shadow-xl">
                                    <Play fill="black" className="ml-0.5 xs:ml-1 w-4 h-4 xs:w-5 xs:h-5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* --- Channel Profile Modal in Nexus Theme --- */}
            {selectedChannel && (
                <ChannelProfileModal
                    channel={selectedChannel}
                    onClose={() => setSelectedChannel(null)}
                    onSelectVideo={(video) => setSelectedVideo(video)}
                />
            )}

            {/* --- Embedded Direct Server Video Player Modal --- */}
            {selectedVideo && (
                <VideoPlayerModal
                    video={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                    onSelectVideo={(video) => setSelectedVideo(video)}
                />
            )}

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                @keyframes zoomIn {
                    0% { opacity: 0; transform: scale(0.9) translateY(20px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-zoomIn {
                    animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};
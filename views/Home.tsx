import React, { useState } from 'react';
import { Play, Users, Mic, Gamepad2, Plus, X, MessageSquare, Phone, Video, MoreVertical, Shield, User, Trophy, Flame, Check } from 'lucide-react';
import { User as UserType } from '../types';
import { DailyStreakCounter } from '../components/DailyStreakCounter';
import { InteractiveMascot } from '../components/InteractiveMascot';
import { MetaPulseWidget } from '../components/MetaPulseWidget';
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
        <div className="p-6 md:p-8 space-y-10 animate-fadeIn max-w-[1800px] mx-auto pb-20">
            
            {/* --- FRIEND PROFILE MODAL --- */}
            {selectedFriend && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={handleCloseModal}>
                    <div 
                        className="relative w-full max-w-sm bg-[#18181b] rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 animate-zoomIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Banner */}
                        <div className="h-32 w-full relative">
                            <img src={selectedFriend.banner} className="w-full h-full object-cover" alt="Banner" />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#18181b]/90"></div>
                            <button 
                                onClick={handleCloseModal}
                                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors backdrop-blur-md"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-6 pb-8 relative">
                            {/* Avatar */}
                            <div className="absolute -top-12 left-6">
                                <div className="relative">
                                    <img 
                                        src={selectedFriend.avatar} 
                                        className="w-24 h-24 rounded-3xl border-4 border-[#18181b] object-cover shadow-xl bg-[#202023]" 
                                        alt="Avatar" 
                                    />
                                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-[#18181b] 
                                        ${selectedFriend.status === 'online' ? 'bg-green-500' : selectedFriend.status === 'idle' ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                    />
                                </div>
                            </div>

                            {/* Header Info */}
                            <div className="pt-14 flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-white leading-none mb-1">{selectedFriend.username}</h2>
                                    <div className="flex items-center gap-2 text-sm font-medium">
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
                                    <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm bg-yellow-500/10 px-2 py-0.5 rounded-lg border border-yellow-500/20">
                                        <Trophy size={12} /> Lvl {selectedFriend.level}
                                    </div>
                                </div>
                            </div>

                            {/* About Me */}
                            <div className="bg-[#202023] rounded-2xl p-4 mb-6 border border-white/5 relative group">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">About Me</h3>
                                <p className="text-slate-300 text-sm leading-relaxed font-medium">"{selectedFriend.bio}"</p>
                            </div>

                            {/* Actions Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-2">
                                <button 
                                    onClick={handleMessage}
                                    className="col-span-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/20 active:scale-95"
                                >
                                    <MessageSquare size={18} /> Message
                                </button>
                                <button 
                                    onClick={handleCall}
                                    className="col-span-1 py-3 bg-[#202023] hover:bg-[#2b2b30] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-white/5 active:scale-95"
                                >
                                    <Phone size={18} /> Call
                                </button>
                                <button 
                                    onClick={() => {
                                        handleCloseModal();
                                        onNavigate('dashboard');
                                    }}
                                    className="col-span-2 py-3 bg-[#202023] hover:bg-[#2b2b30] text-slate-300 hover:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-white/5 active:scale-95 text-sm"
                                >
                                    <User size={18} /> View Career Stats
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- DAILY LOGIN STREAK COUNTER --- */}
            <DailyStreakCounter />

            {/* Hero Section */}
            <div className="relative h-[450px] w-full rounded-[2.5rem] overflow-hidden group shadow-2xl ring-1 ring-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent z-10"></div>
                <img src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2665&auto=format&fit=crop" 
                    className="w-full h-full object-cover transition-transform duration-[10s] ease-linear group-hover:scale-110" alt="Hero" />
                
                <div className="absolute bottom-0 left-0 p-8 md:p-16 z-20 w-full md:w-2/3 space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-red-600 text-white text-xs font-black tracking-widest rounded uppercase">Live Event</span>
                        <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-xs font-bold rounded uppercase border border-white/20">Valorant Champions</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] drop-shadow-2xl">
                        DEFY THE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600">LIMITS</span>
                    </h1>
                    <p className="text-slate-200 text-lg md:text-xl font-medium max-w-lg drop-shadow-md">
                        Join the global community in the biggest esports event of the year. Watch live matches, earn drops, and predict the winner.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <button onClick={() => onNavigate('social')} className="px-8 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                            <Play fill="black" size={20} /> WATCH LIVE
                        </button>
                        <button 
                            onClick={() => {
                                setInHeroList(!inHeroList);
                                playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.5);
                            }}
                            className={`px-8 py-4 backdrop-blur-md font-bold rounded-2xl transition-all border flex items-center gap-2 ${
                                inHeroList 
                                    ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/30' 
                                    : 'bg-black/40 text-white hover:bg-black/60 border-white/10'
                            }`}
                        >
                            {inHeroList ? (
                                <>
                                    <Check size={20} className="text-white" /> IN MY WATCHLIST
                                </>
                            ) : (
                                <>
                                    <Plus size={20} /> ADD TO LIST
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- NEXUS METAPULSE AI RADAR (GOOGLE SEARCH GROUNDED) --- */}
            <MetaPulseWidget onOpenFullHub={() => onNavigate('metapulse')} />

            {/* --- INTERACTIVE MASCOT COMPANION --- */}
            <InteractiveMascot />

            {/* Quick Stats & Active Friends */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Friends List */}
                <div className="lg:col-span-2 bg-[#121216]/50 backdrop-blur-sm rounded-3xl p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                            <Users className="text-purple-500" /> Online Friends <span className="text-slate-500 text-sm font-medium">({ONLINE_FRIENDS.length})</span>
                        </h2>
                        <button onClick={() => onNavigate('friends')} className="text-sm font-bold text-purple-400 hover:text-purple-300">View All</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {ONLINE_FRIENDS.map((friend) => (
                            <div 
                                key={friend.id} 
                                onClick={() => handleFriendClick(friend)}
                                className="flex flex-col items-center min-w-[100px] p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group relative overflow-hidden shrink-0"
                            >
                                <div className="relative mb-3">
                                    <img src={friend.avatar} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-transparent group-hover:ring-purple-500 transition-all" alt={friend.username} />
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#121216] 
                                        ${friend.status === 'online' ? 'bg-green-500' : friend.status === 'idle' ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                    />
                                </div>
                                <span className="font-bold text-sm truncate w-full text-center text-white">{friend.username}</span>
                                <span className="text-xs text-purple-400 font-medium truncate w-full text-center">{friend.game}</span>
                            </div>
                        ))}
                        
                        {/* Invite Button */}
                        <button onClick={() => onNavigate('friends')} className="flex flex-col items-center justify-center min-w-[100px] h-[140px] rounded-2xl border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-white/5 transition-all group shrink-0">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <Plus className="text-slate-400 group-hover:text-purple-400" />
                            </div>
                            <span className="text-sm font-bold text-slate-500 group-hover:text-white">Invite</span>
                        </button>
                    </div>
                </div>

                {/* Quick Join Voice */}
                <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-sm rounded-3xl p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                     <div>
                        <div className="flex items-center gap-2 mb-2">
                             <Mic className="text-green-400 animate-pulse" size={20} />
                             <span className="font-bold text-green-400 text-sm tracking-wider uppercase">Active Voice</span>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-1">General Voice</h3>
                        <p className="text-slate-300 text-sm">3 Friends are chilling</p>
                        
                        <div className="flex -space-x-2 mt-4">
                            {[10,11,12].map(i => (
                                <img key={i} src={`https://picsum.photos/100/100?random=${i}`} className="w-8 h-8 rounded-full border-2 border-indigo-900" />
                            ))}
                        </div>
                     </div>
                     <button onClick={() => onNavigate('voice')} className="mt-6 w-full py-3 bg-white text-black font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-purple-500/20">
                         Jump In
                     </button>
                </div>
            </div>

            {/* Recent Games / Continue Playing */}
            <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                    <Gamepad2 className="text-pink-500" /> Jump Back In
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: 'Valorant', time: '2h ago', img: 'https://images.unsplash.com/photo-1624138784180-48145465d61f?q=80&w=1000&auto=format&fit=crop', color: 'text-red-500', bg: 'hover:shadow-red-500/20' },
                        { title: 'Minecraft', time: 'Yesterday', img: 'https://images.unsplash.com/photo-1607677914754-58a36d240214?q=80&w=1000&auto=format&fit=crop', color: 'text-green-500', bg: 'hover:shadow-green-500/20' },
                        { title: 'Apex Legends', time: '3d ago', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop', color: 'text-orange-500', bg: 'hover:shadow-orange-500/20' },
                        { title: 'Cyberpunk 2077', time: '1w ago', img: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1000&auto=format&fit=crop', color: 'text-yellow-500', bg: 'hover:shadow-yellow-500/20' },
                    ].map((game, i) => (
                        <div key={i} className={`group relative h-48 rounded-3xl overflow-hidden cursor-pointer shadow-lg transition-all duration-300 hover:scale-[1.02] ${game.bg}`}>
                            <img src={game.img} className="w-full h-full object-cover group-hover:blur-[2px] transition-all" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                            <div className="absolute bottom-4 left-4">
                                <h3 className="text-xl font-black text-white">{game.title}</h3>
                                <p className="text-xs text-slate-300 font-medium flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${game.color.replace('text', 'bg')}`}></span> Played {game.time}
                                </p>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl">
                                    <Play fill="black" className="ml-1" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
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
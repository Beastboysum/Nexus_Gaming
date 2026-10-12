import React, { useState, useEffect, useRef } from 'react';
import { 
    Mic, MicOff, Headphones, Video, VideoOff, PhoneOff, Monitor, 
    Settings, MoreHorizontal, Signal, UserPlus, Volume2, LogIn, 
    X, Search, MessageSquare, LayoutGrid, Youtube, Send, 
    Smile, Paperclip, MonitorPlay, ChevronRight, ChevronLeft, Link as LinkIcon
} from 'lucide-react';
import { User } from '../types';
import { playCategorizedAudio, playCallAcceptedSound, playCallDeclinedSound } from '../services/audioManager';
import { VoiceAvatarWithGlowingRing } from '../components/VoiceAvatarWithGlowingRing';
import { CURRENT_USER } from '../services/serverService';

// --- Types ---
interface Participant extends User {
    isMuted: boolean;
    isTalking: boolean;
    isCamOn: boolean;
    isSharing?: boolean;
    volumeLevel?: number;
}

interface ChatMessage {
    id: string;
    sender: string;
    text: string;
    time: string;
}

interface Activity {
    id: string;
    title: string;
    thumbnail: string;
    url: string;
    type: 'youtube' | 'stream';
}

interface VoiceChatProps {
    onEndCall?: () => void;
}

// --- Mock Data ---
const INITIAL_USERS: Participant[] = [
  { id: '2', username: 'Nelly', avatar: 'https://picsum.photos/100/100?random=10', status: 'online', isMuted: false, isTalking: false, isCamOn: true },
  { id: '3', username: 'Mallow', avatar: 'https://picsum.photos/100/100?random=11', status: 'idle', isMuted: true, isTalking: false, isCamOn: false },
  { id: '4', username: 'Graggle', avatar: 'https://picsum.photos/100/100?random=12', status: 'online', isMuted: false, isTalking: false, isCamOn: false },
];

const WATCH_ACTIVITIES: Activity[] = [
    { id: '1', title: 'VALORANT Champions Tour 2024: Masters Madrid', thumbnail: 'https://picsum.photos/400/225?random=101', url: 'stream_1', type: 'stream' },
    { id: '2', title: 'Top 10 Minecraft Builds of the Week', thumbnail: 'https://picsum.photos/400/225?random=102', url: 'stream_2', type: 'youtube' },
    { id: '3', title: 'Elden Ring: Shadow of the Erdtree Gameplay', thumbnail: 'https://picsum.photos/400/225?random=103', url: 'stream_3', type: 'youtube' },
];

const FRIENDS_TO_INVITE = [
  { id: '11', username: 'Phibi', avatar: 'https://picsum.photos/100/100?random=13', status: 'dnd' },
  { id: '12', username: 'Locke', avatar: 'https://picsum.photos/100/100?random=14', status: 'idle' },
  { id: '6', username: 'Pixel_Panda', avatar: 'https://picsum.photos/100/100?random=15', status: 'online' },
  { id: '7', username: 'Sova_Main', avatar: 'https://picsum.photos/100/100?random=16', status: 'online' },
  { id: '8', username: 'JettLagged', avatar: 'https://picsum.photos/100/100?random=14', status: 'dnd' },
];

export const VoiceChat: React.FC<VoiceChatProps> = ({ onEndCall }) => {
  // --- State: Connection ---
  const [isConnected, setIsConnected] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // --- State: Local User ---
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [camera, setCamera] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);
  const [localVolume, setLocalVolume] = useState(0);
  
  // --- State: Participants ---
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_USERS);
  
  // --- State: Layout & Sidebar ---
  const [sidebarView, setSidebarView] = useState<'chat' | 'activities' | null>(null);
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
  
  // --- State: Chat ---
  const [messages, setMessages] = useState<ChatMessage[]>([
      { id: '1', sender: 'Nelly', text: 'Can you guys hear me?', time: '10:00' },
      { id: '2', sender: 'Mallow', text: 'Loud and clear!', time: '10:01' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // --- State: Modals ---
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSearch, setInviteSearch] = useState('');
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Effects ---
  useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  // Audio Simulation (Talking Status & Volume Levels)
  useEffect(() => {
    const interval = setInterval(() => {
        setParticipants(prev => prev.map(p => {
            if (p.isMuted) return { ...p, isTalking: false, volumeLevel: 0 };
            const willTalk = p.isTalking ? Math.random() > 0.35 : Math.random() > 0.75;
            const volume = willTalk ? Math.floor(Math.random() * 55 + 35) : 0;
            return { ...p, isTalking: willTalk, volumeLevel: volume };
        }));

        // Periodically simulate local user speaking when not muted
        if (!muted && !deafened) {
            const willLocalSpeak = Math.random() > 0.55;
            setIsLocalSpeaking(willLocalSpeak);
            setLocalVolume(willLocalSpeak ? Math.floor(Math.random() * 60 + 35) : 0);
        } else {
            setIsLocalSpeaking(false);
            setLocalVolume(0);
        }
    }, 650);
    return () => clearInterval(interval);
  }, [muted, deafened]);

  // Chat Auto-scroll
  useEffect(() => {
      if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
  }, [messages, sidebarView]);

  // --- Helpers ---

  const playSound = (type: 'join' | 'leave' | 'mute' | 'msg') => {
    if (type === 'join') {
        playCallAcceptedSound();
        return;
    }
    if (type === 'leave') {
        playCallDeclinedSound();
        return;
    }
    if (type === 'mute') {
        playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-interface-click-1126.mp3', 'system', 0.6);
        return;
    }
    if (type === 'msg') {
        playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-message-pop-alert-2354.mp3', 'notifications', 0.8);
        return;
    }
  };

  const handleJoinCall = () => {
    playSound('join');
    setIsConnected(true);
  };

  const handleLeaveCall = () => {
      playSound('leave');
      setIsExiting(true);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = setTimeout(() => {
          setIsConnected(false);
          setIsExiting(false);
          if (onEndCall) onEndCall();
          leaveTimeoutRef.current = null;
      }, 500);
  };

  const handleInvite = (friend: typeof FRIENDS_TO_INVITE[0]) => {
      // Prevent duplicates
      if (participants.find(p => p.id === friend.id)) return;
      
      // Add fake participant
      setParticipants(prev => [...prev, {
          ...friend,
          status: friend.status as any,
          isMuted: false, 
          isTalking: false, 
          isCamOn: Math.random() > 0.7 
      }]);
      playSound('join');
  };

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if(!chatInput.trim()) return;
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'You',
          text: chatInput,
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
      setChatInput('');
      playSound('msg');
  };

  const handleStartActivity = (activity: Activity) => {
      setActiveActivity(activity);
      // Auto switch to chat when watching something
      if (sidebarView !== 'chat') setSidebarView('chat');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'online': return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
        case 'idle': return 'bg-amber-500';
        case 'dnd': return 'bg-red-500';
        default: return 'bg-slate-500';
    }
  };

  const isFilmstrip = !!(activeActivity || sharing);
  
  // Calculate Grid Dimensions to fit screen
  const totalTiles = participants.length + 1; // +1 for Local User
  let cols = 1;
  let rows = 1;

  if (!isFilmstrip) {
      if (totalTiles === 1) { cols = 1; rows = 1; }
      else if (totalTiles === 2) { cols = 2; rows = 1; }
      else if (totalTiles <= 4) { cols = 2; rows = 2; }
      else if (totalTiles <= 6) { cols = 3; rows = 2; }
      else if (totalTiles <= 9) { cols = 3; rows = 3; }
      else { cols = 4; rows = Math.ceil(totalTiles / 4); }
  }


  // --- RENDER: Disconnected State ---
  if (!isConnected) {
      return (
        <div className="flex flex-col h-full items-center justify-center bg-[#0a0a0c] text-white p-6 animate-fadeIn">
             <div className="max-w-md w-full bg-[#121215] rounded-[2rem] p-8 border border-white/5 shadow-2xl text-center relative overflow-hidden group">
                <div className="w-24 h-24 rounded-full bg-white/5 mx-auto mb-6 flex items-center justify-center relative">
                    <Signal size={40} className="text-green-500" />
                    <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-20"></div>
                </div>
                <h2 className="text-2xl font-black mb-2">General Voice</h2>
                <p className="text-slate-400 mb-8">{participants.length} friends are hanging out</p>
                <button onClick={handleJoinCall} className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-all hover:scale-[1.02] shadow-lg shadow-green-600/20 flex items-center justify-center gap-2">
                    <LogIn size={20} /> Join Voice
                </button>
            </div>
        </div>
      );
  }

  // --- RENDER: Connected State ---
  return (
    <div className={`flex h-full bg-[#0a0a0c] text-white overflow-hidden transition-all duration-500 ${isExiting ? 'scale-95 opacity-0 filter blur-sm' : 'opacity-100'}`}>
      
      {/* === LEFT/TOP: MAIN STAGE === */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Header Info */}
        <div className="h-16 shrink-0 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0c]/90 backdrop-blur-md z-20">
             <div className="flex items-center gap-3">
                 <Signal className="text-green-500 animate-pulse" />
                 <div>
                     <h2 className="font-bold text-lg leading-tight">General Voice</h2>
                     <p className="text-xs text-slate-500">RTC Connected • 14ms Ping</p>
                 </div>
             </div>
             <div className="flex gap-2">
                 <button 
                    onClick={() => setSidebarView(sidebarView === 'chat' ? null : 'chat')}
                    className={`p-2.5 rounded-xl transition-all ${sidebarView === 'chat' ? 'bg-white text-black' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                 >
                     <MessageSquare size={20} />
                 </button>
                 <button 
                    onClick={() => setSidebarView(sidebarView === 'activities' ? null : 'activities')}
                    className={`p-2.5 rounded-xl transition-all ${sidebarView === 'activities' ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                 >
                     <MonitorPlay size={20} />
                 </button>
             </div>
        </div>

        {/* Stage Content */}
        <div className={`flex-1 overflow-hidden relative flex flex-col`}>
            
            {/* 1. Watch Activity Stage (Cinema Mode) */}
            {(activeActivity || sharing) && (
                <div className="flex-1 bg-black relative p-4 flex items-center justify-center min-h-0">
                    <div className="relative w-full h-full aspect-video bg-[#121215] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                        {sharing ? (
                             <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0c]">
                                 <Monitor size={64} className="text-slate-600 mb-4" />
                                 <p className="font-bold text-slate-500">Screen Share Active</p>
                             </div>
                        ) : (
                            <>
                                <img src={activeActivity?.thumbnail} className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer">
                                        <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1"></div>
                                    </div>
                                </div>
                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                                    <Youtube size={16} className="text-red-500" />
                                    {activeActivity?.title}
                                </div>
                            </>
                        )}
                        <button 
                            onClick={() => { setActiveActivity(null); setSharing(false); }}
                            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* 2. Participant Grid / Filmstrip */}
            <div className={`
                flex-1 w-full p-4 flex items-center justify-center overflow-hidden
                ${isFilmstrip ? 'h-48 flex-none border-t border-white/5 bg-[#0f1014]' : 'h-full'}
            `}>
                <div 
                    className={`
                        grid gap-4 justify-center content-center transition-all duration-500
                        ${isFilmstrip 
                            ? 'w-full grid-flow-col auto-cols-[12rem] h-full overflow-x-auto justify-start content-center' 
                            : 'w-auto h-auto max-w-full max-h-full aspect-[var(--ratio)]'
                        }
                    `}
                    style={!isFilmstrip ? { 
                        '--ratio': `${cols}/${rows}`,
                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
                    } as React.CSSProperties : {}}
                >
                    
                    {/* Local User Card */}
                    <div className={`relative bg-[#18181b] rounded-xl overflow-hidden group shadow-xl border-2 transition-all duration-300 ${muted ? 'border-red-500/20' : (isLocalSpeaking && !muted) ? 'border-emerald-500 shadow-[0_0_20px_rgba(34,197,94,0.35)]' : 'border-white/5'} ${isFilmstrip ? 'w-full h-full aspect-square' : 'w-full h-full aspect-square'}`}>
                        <div className="absolute inset-0">
                            {camera ? (
                                <img src="https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#1e1e22]">
                                    <VoiceAvatarWithGlowingRing
                                        avatar={CURRENT_USER.avatar || "https://picsum.photos/100/100?random=99"}
                                        username={CURRENT_USER.username || "You"}
                                        isSpeaking={isLocalSpeaking && !muted}
                                        volumeLevel={localVolume}
                                        size={isFilmstrip ? 'lg' : 'xl'}
                                        shape="circle"
                                        isMuted={muted}
                                        isDeafened={deafened}
                                        statusBadge="online"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                            <div className={`bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border transition-colors ${(isLocalSpeaking && !muted) ? 'border-emerald-500/50 text-emerald-400' : 'border-white/5 text-white'}`}>
                                <span className="font-bold text-xs md:text-sm">You</span>
                                {isLocalSpeaking && !muted && <Mic size={12} className="text-emerald-400 animate-pulse" />}
                                {muted && <MicOff size={12} className="text-red-500" />}
                            </div>
                        </div>
                        <div className="absolute top-3 right-3 flex gap-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor('online')} border-2 border-[#18181b]`}></div>
                        </div>
                    </div>

                    {/* Remote Participants */}
                    {participants.map(user => {
                        const isSpeaking = user.isTalking && !user.isMuted;
                        const volume = user.volumeLevel || (isSpeaking ? 70 : 0);
                        return (
                            <div key={user.id} className={`relative bg-[#18181b] rounded-xl overflow-hidden group shadow-xl border-2 transition-all duration-300 
                                ${isSpeaking ? 'border-emerald-500 shadow-[0_0_20px_rgba(34,197,94,0.35)]' : 'border-white/5'}
                                ${isFilmstrip ? 'w-full h-full aspect-square' : 'w-full h-full aspect-square'}
                            `}>
                                {/* Visualizer Background */}
                                {isSpeaking && !user.isCamOn && (
                                    <div className="absolute inset-0 flex items-end justify-center gap-1 p-8 opacity-20 pointer-events-none">
                                        {[1,2,3,4,5].map(i => (
                                            <div key={i} className="w-4 bg-emerald-500 animate-pulse rounded-t-lg" style={{ height: `${Math.random() * 80 + 20}%`, animationDuration: `${Math.random() * 0.3 + 0.2}s` }}></div>
                                        ))}
                                    </div>
                                )}

                                <div className="absolute inset-0">
                                    {user.isCamOn ? (
                                        <img src={`https://images.unsplash.com/photo-${user.id === '2' ? '1534528741775-53994a69daeb' : '1531427186611-ecfd6d936c79'}?auto=format&fit=crop&q=80&w=800`} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#1e1e22]">
                                            <VoiceAvatarWithGlowingRing
                                                avatar={user.avatar}
                                                username={user.username}
                                                isSpeaking={isSpeaking}
                                                volumeLevel={volume}
                                                size={isFilmstrip ? 'lg' : 'xl'}
                                                shape="circle"
                                                isMuted={user.isMuted}
                                                statusBadge={user.status as any}
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Name Tag */}
                                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                    <div className={`bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/5 transition-colors ${isSpeaking ? 'border-emerald-500/50 text-emerald-400' : 'text-white'}`}>
                                        {isSpeaking && <Mic size={12} className="animate-pulse" />}
                                        {user.isMuted && <MicOff size={12} className="text-red-500" />}
                                        <span className="font-bold text-xs md:text-sm">{user.username}</span>
                                    </div>
                                </div>
                                
                                {/* Status Indicator */}
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(user.status)} border-2 border-[#18181b]`}></div>
                                </div>

                                {/* Hover Controls */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                                    <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"><UserPlus size={18}/></button>
                                    <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"><MoreHorizontal size={18}/></button>
                                </div>
                            </div>
                        );
                    })}
                    
                    {/* Invite Tile (Only in Grid View) */}
                    {!isFilmstrip && (
                        <button 
                            onClick={() => setShowInviteModal(true)}
                            className="rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 hover:bg-white/5 hover:border-white/20 transition-all group w-full h-full aspect-square"
                        >
                            <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                                <UserPlus size={24} className="text-slate-400 group-hover:text-purple-400" />
                            </div>
                            <span className="font-bold text-slate-500 group-hover:text-purple-300">Invite Friend</span>
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="h-24 bg-[#121215] border-t border-white/5 flex items-center justify-center px-6 gap-4 relative z-30 shrink-0">
             {/* Left Info (Desktop) */}
             <div className="absolute left-6 hidden md:flex items-center gap-3">
                 <VoiceAvatarWithGlowingRing
                     avatar={CURRENT_USER.avatar || "https://picsum.photos/100/100?random=99"}
                     username={CURRENT_USER.username || "You"}
                     isSpeaking={isLocalSpeaking && !muted}
                     volumeLevel={localVolume}
                     size="md"
                     shape="circle"
                     isMuted={muted}
                     isDeafened={deafened}
                 />
                 <div>
                     <div className="font-bold text-sm text-white">{CURRENT_USER.username || "You"}</div>
                     <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                         <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400/50"></span> 
                         {muted ? 'Muted' : isLocalSpeaking ? `Speaking (${localVolume}%)` : 'Voice Connected'}
                     </div>
                 </div>
             </div>

             {/* Center Controls */}
             <div className="flex items-center gap-3 md:gap-4">
                <button onClick={() => setMuted(!muted)} className={`p-4 rounded-2xl transition-all ${muted ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 hover:bg-white/10 text-white'}`}>
                    {muted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                <button onClick={() => setDeafened(!deafened)} className={`p-4 rounded-2xl transition-all ${deafened ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 hover:bg-white/10 text-white'}`}>
                    {deafened ? <Volume2 size={24} className="opacity-50" /> : <Headphones size={24} />}
                </button>
                <button onClick={() => setCamera(!camera)} className={`p-4 rounded-2xl transition-all ${camera ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-white/5 hover:bg-white/10 text-white'}`}>
                    {camera ? <Video size={24} /> : <VideoOff size={24} />}
                </button>
                <button onClick={() => setSharing(!sharing)} className={`p-4 rounded-2xl transition-all ${sharing ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 hover:bg-white/10 text-white'}`}>
                    <Monitor size={24} />
                </button>
                <div className="w-px h-10 bg-white/10 mx-2"></div>
                <button onClick={handleLeaveCall} className="p-4 rounded-2xl bg-red-600 text-white hover:bg-red-700 hover:scale-105 transition-all shadow-lg shadow-red-600/20">
                    <PhoneOff size={24} />
                </button>
             </div>
             
             {/* Right Controls */}
             <div className="absolute right-6 hidden md:flex items-center gap-3">
                 <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"><Settings size={20} /></button>
             </div>
        </div>
      </div>

      {/* === RIGHT: SIDEBAR (Collapsible) === */}
      {sidebarView && (
          <div className="w-80 bg-[#121215] border-l border-white/5 flex flex-col shrink-0 animate-slideLeft z-30 shadow-2xl">
              
              {/* Sidebar Header */}
              <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#18181b]">
                  <h3 className="font-bold text-white uppercase text-sm tracking-wider flex items-center gap-2">
                      {sidebarView === 'chat' ? <><MessageSquare size={16} className="text-purple-500" /> Channel Chat</> : <><MonitorPlay size={16} className="text-purple-500" /> Activities</>}
                  </h3>
                  <button onClick={() => setSidebarView(null)} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"><X size={18} /></button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                  
                  {/* --- CHAT TAB --- */}
                  {sidebarView === 'chat' && (
                      <>
                        <div className="flex-1 p-4 space-y-4" ref={chatScrollRef}>
                            {messages.map(msg => (
                                <div key={msg.id} className="group">
                                    <div className="flex items-baseline justify-between mb-1">
                                        <span className={`text-sm font-bold ${msg.sender === 'You' ? 'text-purple-400' : 'text-slate-300'}`}>{msg.sender}</span>
                                        <span className="text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">{msg.time}</span>
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed break-words">{msg.text}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-[#18181b] border-t border-white/5">
                            <form onSubmit={handleSendMessage} className="relative">
                                <input 
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    placeholder="Say something..."
                                    className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3 pl-4 pr-10 text-sm text-white outline-none focus:border-purple-500 transition-colors"
                                />
                                <button type="submit" className="absolute right-2 top-2 p-1.5 bg-white/5 hover:bg-purple-600 text-slate-400 hover:text-white rounded-lg transition-colors">
                                    <Send size={14} />
                                </button>
                            </form>
                            <div className="flex gap-2 mt-2 px-1">
                                <button className="text-slate-500 hover:text-white"><Smile size={18}/></button>
                                <button className="text-slate-500 hover:text-white"><Paperclip size={18}/></button>
                            </div>
                        </div>
                      </>
                  )}

                  {/* --- ACTIVITIES TAB --- */}
                  {sidebarView === 'activities' && (
                      <div className="p-4 space-y-6">
                          {/* Paste URL */}
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Watch Together</label>
                              <div className="flex gap-2">
                                  <input placeholder="Paste YouTube link..." className="flex-1 bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500" />
                                  <button className="p-2 bg-white/5 hover:bg-purple-600 rounded-xl text-white transition-colors"><ChevronRight size={18}/></button>
                              </div>
                          </div>

                          {/* Suggested */}
                          <div className="space-y-4">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Suggested for you</label>
                              {WATCH_ACTIVITIES.map(activity => (
                                  <div 
                                    key={activity.id} 
                                    onClick={() => handleStartActivity(activity)}
                                    className="group cursor-pointer"
                                  >
                                      <div className="aspect-video rounded-xl overflow-hidden relative mb-2 ring-1 ring-white/10 group-hover:ring-purple-500 transition-all">
                                          <img src={activity.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                                                  <MonitorPlay size={20} className="text-white ml-0.5" />
                                              </div>
                                          </div>
                                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                                              {activity.type === 'youtube' ? <Youtube size={10} className="text-red-500" /> : <MonitorPlay size={10} className="text-purple-500" />}
                                              {activity.type}
                                          </div>
                                      </div>
                                      <h4 className="font-bold text-sm text-white leading-tight group-hover:text-purple-400 transition-colors line-clamp-2">{activity.title}</h4>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* --- Invite Modal --- */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setShowInviteModal(false)}>
            <div className="w-full max-w-sm bg-[#18181b] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-zoomIn" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#202023]">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <UserPlus size={18} className="text-purple-500"/> Invite Friends
                    </h3>
                    <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar space-y-2">
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                        <input 
                            placeholder="Search friends..." 
                            value={inviteSearch}
                            onChange={(e) => setInviteSearch(e.target.value)}
                            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white outline-none focus:border-purple-500" 
                        />
                    </div>
                    {FRIENDS_TO_INVITE.map(friend => {
                            const isInvited = participants.some(p => p.id === friend.id);
                            return (
                                <div key={friend.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <img src={friend.avatar} className="w-10 h-10 rounded-full" alt={friend.username} />
                                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-[#18181b] rounded-full ${getStatusColor(friend.status)}`}></div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-white">{friend.username}</h4>
                                            <p className="text-[10px] text-slate-500 capitalize">{friend.status}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleInvite(friend)}
                                        disabled={isInvited}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${isInvited ? 'bg-green-500/10 text-green-500' : 'bg-white/10 hover:bg-purple-600 text-white'}`}
                                    >
                                        {isInvited ? 'Joined' : 'Invite'}
                                    </button>
                                </div>
                            );
                    })}
                </div>
            </div>
        </div>
      )}

      <style>{`
          @keyframes slideLeft {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
          }
          .animate-slideLeft {
              animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
      `}</style>
    </div>
  );
};
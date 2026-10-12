import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, MessageSquare, Video, Gamepad2, Settings, LogOut, Bell, Search, Mic, Heart, Trophy, UserPlus, Gamepad, Users, BarChart2, Home, Menu, Flame, Radio, Shield } from 'lucide-react';
import { ViewState, User } from './types';
import { STREAK_BADGES } from './components/StreakRewardsModal';
import { HeaderStreakPill } from './components/HeaderStreakPill';
import { LoginView } from './views/Login';
import { StatsDashboard } from './views/StatsDashboard';
import { VoiceChat } from './views/VoiceChat';
import { TasksView } from './views/Tasks';
import { SettingsView } from './views/Settings';
import { FriendsView } from './views/Friends';
import { BrowseView } from './views/Browse';
import { HomeView } from './views/Home';
import { ChatView } from './views/Chat';
import { MetaPulseView } from './views/MetaPulseView';
import { ServersView } from './views/Servers';
import { CallOverlay } from './components/CallOverlay';
import { DataCleanupService } from './services/DataCleanupService';
import { 
  getEffectiveVolume, 
  playCategorizedAudio, 
  startCallRingtone, 
  startCallDialingSound, 
  playCallAcceptedSound, 
  playCallDeclinedSound, 
  ActiveRingtoneHandle,
  SoundEffectEngine
} from './services/audioManager';

// --- Bottom Nav Component ---
const BottomNavItem = ({ icon: Icon, active, onClick, badge, label }: any) => (
  <button
    onClick={(e) => {
      SoundEffectEngine.play('button-click');
      onClick(e);
    }}
    className={`flex flex-col items-center justify-center w-full py-3 gap-1 transition-all duration-300 relative
      ${active ? 'text-purple-500' : 'text-slate-500 hover:text-slate-300'}
    `}
  >
    <div className={`relative p-1 rounded-xl transition-all ${active ? 'bg-purple-500/10' : ''}`}>
        <Icon size={24} strokeWidth={active ? 2.5 : 2} className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
        {badge && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-[#121216] text-white text-[9px] font-bold flex items-center justify-center rounded-full animate-bounce">
            {badge}
        </span>
        )}
    </div>
    <span className={`text-[10px] font-medium ${active ? 'opacity-100' : 'opacity-0 hidden'}`}>{label}</span>
  </button>
);

// --- Mock Notifications Data ---
const NOTIFICATIONS = [
  { id: 1, title: 'ShadowSlayer invited you', desc: 'Valorant • Competitive', time: '2m ago', icon: Gamepad, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 2, title: 'New High Score!', desc: 'You reached Top 100 in Aim Labs', time: '1h ago', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 3, title: 'New Follower', desc: 'PixelMage started following you', time: '3h ago', icon: UserPlus, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 4, title: 'Clip Trending', desc: 'Your 1v5 clutch is blowing up!', time: '5h ago', icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10' },
];

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [view, setView] = useState<ViewState>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedChatFriend, setSelectedChatFriend] = useState<User | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // --- Daily Streak State ---
  const [streakCount, setStreakCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nexus_daily_login_streak');
      if (saved) {
        return JSON.parse(saved).count || 6;
      }
    } catch (_) {}
    return 6;
  });

  useEffect(() => {
    // Purge stale cache entries & sanitize persistent localStorage on boot
    DataCleanupService.init();

    const syncStreak = () => {
      try {
        const saved = localStorage.getItem('nexus_daily_login_streak');
        if (saved) {
          setStreakCount(JSON.parse(saved).count || 6);
        }
      } catch (_) {}
    };
    window.addEventListener('storage', syncStreak);
    const interval = setInterval(syncStreak, 1500);
    return () => {
      window.removeEventListener('storage', syncStreak);
      clearInterval(interval);
    };
  }, []);

  // --- Equipped Streak Badge State ---
  const [equippedBadgeId, setEquippedBadgeId] = useState<string>(() => {
    return localStorage.getItem('nexus_equipped_badge') || 'badge-3';
  });

  useEffect(() => {
    const syncBadge = () => {
      const savedBadge = localStorage.getItem('nexus_equipped_badge');
      if (savedBadge) setEquippedBadgeId(savedBadge);
    };
    window.addEventListener('storage', syncBadge);
    window.addEventListener('nexus_badge_updated', syncBadge);
    return () => {
      window.removeEventListener('storage', syncBadge);
      window.removeEventListener('nexus_badge_updated', syncBadge);
    };
  }, []);

  // --- Call State ---
  const [callStatus, setCallStatus] = useState<'idle' | 'incoming' | 'outgoing' | 'connected'>('idle');
  const [callUser, setCallUser] = useState<User | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const ringtoneHandleRef = useRef<ActiveRingtoneHandle | null>(null);

  // Theme Handling
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Click Outside Handler for Notifications
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  const handleLogin = () => {
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-positive-notification-266.mp3', 'system');
    setIsLoggedIn(true);
    setView('home'); // Default to Home view
  };

  const handleLogout = () => {
      setIsLoggedIn(false);
  };

  const handleOpenDM = (friend: User) => {
    setSelectedChatFriend(friend);
    setView('chat');
  };

  const toggleNotifications = () => {
    const newState = !showNotifications;
    setShowNotifications(newState);
    if (newState) {
        SoundEffectEngine.play('notification-popup');
        playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'notifications', 0.6);
    } else {
        SoundEffectEngine.play('button-click');
    }
  };

  // --- CALL LOGIC ---
  const stopRingtone = () => {
      if (ringtoneHandleRef.current) {
          ringtoneHandleRef.current.stop();
          ringtoneHandleRef.current = null;
      }
      if (ringtoneRef.current) {
          ringtoneRef.current.pause();
          ringtoneRef.current.currentTime = 0;
          ringtoneRef.current = null;
      }
  };

  const startOutgoingCall = (user: User) => {
      setCallUser(user);
      setCallStatus('outgoing');
      
      stopRingtone();
      ringtoneHandleRef.current = startCallDialingSound();

      // Simulate pickup after 3 seconds
      setTimeout(() => {
          if (ringtoneHandleRef.current) { // Check if not cancelled
              stopRingtone();
              playCallAcceptedSound();
              setCallStatus('connected');
              setView('servers');
              setCallStatus('idle'); // Clear overlay
              setCallUser(null);
          }
      }, 3000);
  };

  const simulateIncomingCall = () => {
      const randomUser = { 
          id: '99', 
          username: 'Nelly', 
          avatar: 'https://picsum.photos/100/100?random=10', 
          status: 'online' 
      } as User;
      
      setCallUser(randomUser);
      setCallStatus('incoming');
      
      stopRingtone();
      ringtoneHandleRef.current = startCallRingtone();
  };

  const acceptCall = () => {
      stopRingtone();
      playCallAcceptedSound();
      setCallStatus('connected');
      setView('servers');
      setCallStatus('idle');
      setCallUser(null);
  };

  const declineCall = () => {
      stopRingtone();
      playCallDeclinedSound();
      setCallStatus('idle');
      setCallUser(null);
  };

  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />;
  }

  const equippedBadge = STREAK_BADGES.find(b => b.id === equippedBadgeId) || STREAK_BADGES[0];
  const EquippedBadgeIcon = equippedBadge.icon;

  const renderContent = () => {
    switch (view) {
      case 'home': return <HomeView onNavigate={setView} onOpenDM={handleOpenDM} onCall={startOutgoingCall} />;
      case 'dashboard': return <StatsDashboard />;
      case 'voice': return <VoiceChat onEndCall={() => setView('home')} />;
      case 'chat': return <ChatView initialFriend={selectedChatFriend} onClearFriend={() => setSelectedChatFriend(null)} onNavigate={setView} onCall={startOutgoingCall} />;
      case 'social': return <BrowseView />;
      case 'friends': return <FriendsView onOpenDM={handleOpenDM} />;
      case 'tasks': return <TasksView />;
      case 'servers': return <ServersView onNavigate={setView} onOpenDM={handleOpenDM} onCall={startOutgoingCall} />;
      case 'metapulse': return <MetaPulseView />;
      case 'settings': 
        return <SettingsView isDark={isDark} toggleTheme={toggleTheme} onLogout={handleLogout} onSimulateCall={simulateIncomingCall} />;
      default: return <HomeView onNavigate={setView} onCall={startOutgoingCall} />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#09090b] text-white transition-colors overflow-hidden font-sans relative selection:bg-purple-500 selection:text-white">
      
      {/* Call Overlay */}
      {(callStatus === 'incoming' || callStatus === 'outgoing') && (
          <CallOverlay 
            status={callStatus} 
            user={callUser} 
            onAccept={acceptCall} 
            onDecline={declineCall} 
          />
      )}

      {/* --- Global Background Animation (Subtler for Mobile) --- */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-purple-900/30 rounded-full blur-[80px] animate-blob mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-900/30 rounded-full blur-[80px] animate-blob animation-delay-2000 mix-blend-screen"></div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
        
        {/* Top Header - Mobile Optimized */}
        {view !== 'chat' && view !== 'voice' && (
          <header className="h-16 px-4 flex items-center justify-between z-20 bg-[#09090b]/90 backdrop-blur-md sticky top-0 border-b border-white/5">
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-lg">N</div>
                 <h1 className="font-bold text-lg capitalize">{view === 'social' ? 'Watch' : view}</h1>
             </div>

             <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Servers Dedicated Tab Button */}
                <button
                  onClick={() => setView('servers')}
                  title="Nexus Custom Servers & Communities"
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                    view === 'servers'
                      ? 'bg-purple-600/25 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                      : 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-300 hover:text-white'
                  }`}
                >
                  <Shield size={14} className="text-purple-400" />
                  <span className="hidden sm:inline">Servers</span>
                </button>

                {/* MetaPulse Live Esports & Meta Radar (Google Search Grounded) */}
                <button
                  onClick={() => setView('metapulse')}
                  title="Nexus MetaPulse: Real-Time Esports & Meta Radar (Google Search Grounded)"
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                    view === 'metapulse'
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:text-cyan-300'
                  }`}
                >
                  <Radio size={14} className="text-cyan-400 animate-pulse" />
                  <span className="hidden sm:inline">MetaPulse</span>
                </button>

                {/* Daily Login Streak Pill with Flame Burst Micro-Interaction */}
                <HeaderStreakPill 
                  streakCount={streakCount} 
                  onClick={() => setView('home')} 
                />

                <button onClick={() => setView('friends')} className="p-2 hover:bg-white/10 rounded-full relative">
                    <Users size={20} className="text-slate-400" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full border border-[#09090b]"></span>
                </button>
                
                {/* Notification Dropdown */}
                <div className="relative" ref={notificationRef}>
                  <button 
                      onClick={toggleNotifications}
                      className="p-2 hover:bg-white/10 rounded-full relative"
                  >
                      <Bell size={20} className="text-slate-400" />
                      {!showNotifications && (
                          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#09090b]"></span>
                      )}
                  </button>

                  {showNotifications && (
                      <div className="absolute top-12 right-[-10px] w-80 bg-[#18181b] rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-notificationPop z-50">
                          <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/5">
                              <h3 className="font-bold text-white text-sm">Notifications</h3>
                          </div>
                          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                              {NOTIFICATIONS.map((notif, i) => (
                              <div key={notif.id} className="flex gap-3 p-3 hover:bg-white/5 border-b border-white/5 last:border-0">
                                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-white/5 border border-white/5`}>
                                      <notif.icon size={14} className={notif.color} />
                                  </div>
                                  <div>
                                      <p className="text-sm font-bold text-gray-200">{notif.title}</p>
                                      <p className="text-xs text-gray-500">{notif.desc}</p>
                                  </div>
                              </div>
                              ))}
                          </div>
                      </div>
                  )}
                </div>

                <div 
                  className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-blue-500 p-0.5 relative cursor-pointer group" 
                  onClick={() => setView('settings')}
                  title={`Profile Settings - Equipped Badge: ${equippedBadge.title}`}
                >
                   <img src="https://picsum.photos/100/100?random=88" className="w-full h-full rounded-[6px] object-cover bg-[#09090b]" alt="Profile" />
                   {/* Mini Equipped Badge Medallion */}
                   <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#121216] border border-orange-500/60 flex items-center justify-center shadow-md">
                      <EquippedBadgeIcon size={9} className={equippedBadge.rarityColor} />
                   </div>
                </div>
             </div>
          </header>
        )}

        {/* Scrollable Content View */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar ${view === 'chat' || view === 'voice' ? 'h-full bg-black' : ''}`}>
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation (Android Style) - Voice shifted to Servers */}
      <nav className="h-[72px] bg-[#121216] border-t border-white/10 flex items-center justify-around px-2 z-30 pb-safe">
          <BottomNavItem icon={Home} label="Home" active={view === 'home'} onClick={() => { setView('home'); setSelectedChatFriend(null); }} />
          <BottomNavItem icon={Shield} label="Servers" active={view === 'servers'} onClick={() => { setView('servers'); setSelectedChatFriend(null); }} />
          <BottomNavItem icon={MessageSquare} label="Chat" active={view === 'chat'} onClick={() => setView('chat')} badge={5} />
          <BottomNavItem icon={Video} label="Watch" active={view === 'social'} onClick={() => { setView('social'); setSelectedChatFriend(null); }} />
          <BottomNavItem icon={Gamepad2} label="Tasks" active={view === 'tasks'} onClick={() => { setView('tasks'); setSelectedChatFriend(null); }} />
      </nav>

      {/* Global Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        
        .pb-safe {
            padding-bottom: env(safe-area-inset-bottom);
        }

        @keyframes notificationPop {
            0% { opacity: 0; transform: scale(0.9) translateY(-10px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-notificationPop {
            animation: notificationPop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
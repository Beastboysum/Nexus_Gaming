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
import { CURRENT_USER } from './services/serverService';
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
    className={`flex flex-col items-center justify-center w-full py-1 xs:py-1.5 sm:py-2.5 gap-0.5 transition-all duration-300 relative
      ${active ? 'text-purple-500' : 'text-slate-500 hover:text-slate-300'}
    `}
  >
    <div className={`relative p-0.5 xs:p-1 rounded-lg sm:rounded-xl transition-all ${active ? 'bg-purple-500/10' : ''}`}>
        <Icon size={18} strokeWidth={active ? 2.5 : 2} className={`w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
        {badge && (
        <span className="absolute -top-1 -right-1 w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 bg-red-500 border-2 border-[#121216] text-white text-[7px] xs:text-[8px] sm:text-[9px] font-bold flex items-center justify-center rounded-full animate-bounce">
            {badge}
        </span>
        )}
    </div>
    <span className={`text-[7.5px] xs:text-[8.5px] sm:text-[10px] font-medium leading-none ${active ? 'opacity-100' : 'opacity-0 hidden'}`}>{label}</span>
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
  const [view, setView] = useState<ViewState>('home');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nexus_is_logged_in') === 'true';
    } catch (_) {
      return false;
    }
  });
  const [currentUser, setCurrentUser] = useState<User>(() => ({ ...CURRENT_USER }));
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

    // Sync current user profile updates
    const handleUserUpdate = (e: any) => {
      if (e.detail?.user) {
        setCurrentUser({ ...e.detail.user });
      }
    };
    window.addEventListener('nexus_current_user_updated', handleUserUpdate);

    const interval = setInterval(syncStreak, 1500);
    return () => {
      window.removeEventListener('storage', syncStreak);
      window.removeEventListener('nexus_current_user_updated', handleUserUpdate);
      clearInterval(interval);
    };
  }, []);

  // --- Equipped Streak Badge State ---
  const [equippedBadgeId, setEquippedBadgeId] = useState<string>(() => {
    return localStorage.getItem('nexus_equipped_badge') || 'badge-3';
  });

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
    try {
      localStorage.setItem('nexus_is_logged_in', 'true');
    } catch (_) {}
    setIsLoggedIn(true);
    setView('home'); // Default to Home view
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('nexus_is_logged_in');
      localStorage.removeItem('nexus_bypass_session');
    } catch (_) {}
    setIsLoggedIn(false);
    setView('login');
  };

  const handleOpenDM = (friend: User) => {
    setSelectedChatFriend(friend);
    setView('servers');
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
      case 'chat':
      case 'servers': return (
        <ServersView 
          onNavigate={setView} 
          onOpenDM={handleOpenDM} 
          onCall={startOutgoingCall} 
          initialViewMode={selectedChatFriend ? 'dashboard' : undefined}
          initialFriend={selectedChatFriend}
        />
      );
      case 'social': return <BrowseView />;
      case 'friends': return <FriendsView onOpenDM={handleOpenDM} />;
      case 'tasks': return <TasksView />;
      case 'metapulse': return <MetaPulseView />;
      case 'settings': 
        return <SettingsView isDark={isDark} toggleTheme={toggleTheme} onLogout={handleLogout} onSimulateCall={simulateIncomingCall} />;
      default: return <HomeView onNavigate={setView} onCall={startOutgoingCall} />;
    }
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] bg-[#09090b] text-white transition-colors overflow-hidden font-sans selection:bg-purple-500 selection:text-white flex flex-col">
      
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
      <main className="flex-1 min-h-0 flex flex-col w-full relative z-10 overflow-hidden">
        
        {/* Top Header - Fixed & Pinned */}
        {view !== 'voice' && (
          <header className="h-12 xs:h-13 sm:h-16 px-2 xs:px-3 sm:px-4 flex items-center justify-between z-30 bg-[#09090b]/95 backdrop-blur-md shrink-0 border-b border-white/5 select-none">
             <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3">
                 <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center font-black text-white text-xs sm:text-sm shadow-lg">N</div>
                 <h1 className="font-bold text-xs xs:text-sm sm:text-base md:text-lg capitalize truncate max-w-[90px] xs:max-w-[130px] sm:max-w-none">{view === 'social' ? 'Watch' : view === 'servers' ? 'Servers & DMs' : view}</h1>
             </div>

             <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-3">
                {/* Servers Dedicated Tab Button */}
                <button
                  onClick={() => setView('servers')}
                  title="Nexus Custom Servers & Communities"
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 xs:px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-[10px] xs:text-[11px] sm:text-xs font-bold transition-all active:scale-95 ${
                    view === 'servers' || view === 'chat'
                      ? 'bg-purple-600/25 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                      : 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-300 hover:text-white'
                  }`}
                >
                  <Shield size={13} className="text-purple-400 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline">Servers</span>
                </button>

                {/* MetaPulse Live Esports & Meta Radar (Google Search Grounded) */}
                <button
                  onClick={() => setView('metapulse')}
                  title="Nexus MetaPulse: Real-Time Esports & Meta Radar (Google Search Grounded)"
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 xs:px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-[10px] xs:text-[11px] sm:text-xs font-bold transition-all active:scale-95 ${
                    view === 'metapulse'
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:text-cyan-300'
                  }`}
                >
                  <Radio size={13} className="text-cyan-400 animate-pulse sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline">MetaPulse</span>
                </button>

                {/* Daily Login Streak Pill with Flame Burst Micro-Interaction */}
                <HeaderStreakPill 
                  streakCount={streakCount} 
                  onClick={() => setView('home')} 
                />

                <button onClick={() => setView('friends')} className="p-1 xs:p-1.5 sm:p-2 hover:bg-white/10 rounded-full relative" title="Friends">
                    <Users size={17} className="text-slate-400 sm:w-5 sm:h-5" />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full border border-[#09090b]"></span>
                </button>
                
                {/* Notification Dropdown */}
                <div className="relative" ref={notificationRef}>
                  <button 
                      onClick={toggleNotifications}
                      className="p-1 xs:p-1.5 sm:p-2 hover:bg-white/10 rounded-full relative"
                  >
                      <Bell size={17} className="text-slate-400 sm:w-5 sm:h-5" />
                      {!showNotifications && (
                          <span className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full border border-[#09090b]"></span>
                      )}
                  </button>

                  {showNotifications && (
                      <div className="absolute top-10 xs:top-12 right-[-10px] w-72 xs:w-80 bg-[#18181b] rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-notificationPop z-50">
                          <div className="p-2.5 xs:p-3 border-b border-white/5 flex justify-between items-center bg-white/5">
                              <h3 className="font-bold text-white text-xs xs:text-sm">Notifications</h3>
                          </div>
                          <div className="max-h-[260px] xs:max-h-[300px] overflow-y-auto custom-scrollbar">
                              {NOTIFICATIONS.map((notif) => (
                              <div key={notif.id} className="flex gap-2.5 xs:gap-3 p-2.5 xs:p-3 hover:bg-white/5 border-b border-white/5 last:border-0">
                                  <div className={`w-7 h-7 xs:w-8 xs:h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-white/5 border border-white/5`}>
                                      <notif.icon size={13} className={notif.color} />
                                  </div>
                                  <div>
                                      <p className="text-xs xs:text-sm font-bold text-gray-200">{notif.title}</p>
                                      <p className="text-[10px] xs:text-xs text-gray-500">{notif.desc}</p>
                                  </div>
                              </div>
                              ))}
                          </div>
                      </div>
                  )}
                </div>

                <div 
                  className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-blue-500 p-0.5 relative cursor-pointer group shrink-0" 
                  onClick={() => setView('settings')}
                  title={`Profile: ${currentUser.username} - Equipped Badge: ${equippedBadge.title}`}
                >
                   <img 
                     src={currentUser.avatar || "https://picsum.photos/100/100?random=88"} 
                     className="w-full h-full rounded-[6px] object-cover bg-[#09090b]" 
                     alt={currentUser.username} 
                   />
                   {/* Mini Equipped Badge Medallion */}
                   <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#121216] border border-orange-500/60 flex items-center justify-center shadow-md">
                      <EquippedBadgeIcon size={8} className={equippedBadge.rarityColor} />
                   </div>
                </div>
             </div>
          </header>
        )}

        {/* Scrollable Content View - internal scrolling only */}
        <div className={`flex-1 min-h-0 w-full flex flex-col ${
          view === 'servers' || view === 'chat' || view === 'voice' 
            ? 'overflow-hidden' 
            : 'overflow-y-auto custom-scrollbar'
        }`}>
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation (Fixed & Permanent on Mobile) */}
      <nav className="bg-[#121216] border-t border-white/10 flex items-center justify-around px-1 xs:px-2 z-30 pb-safe h-[52px] xs:h-[58px] sm:h-[64px] shrink-0 select-none">
          <BottomNavItem icon={Home} label="Home" active={view === 'home'} onClick={() => { setView('home'); setSelectedChatFriend(null); }} />
          <BottomNavItem icon={Video} label="Watch" active={view === 'social'} onClick={() => { setView('social'); setSelectedChatFriend(null); }} />
          <BottomNavItem icon={Shield} label="Servers" active={view === 'servers' || view === 'chat'} onClick={() => { setView('servers'); setSelectedChatFriend(null); }} />
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
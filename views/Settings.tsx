import React, { useState, useRef, useEffect } from 'react';
import { LampSwitch } from '../components/LampSwitch';
import { Camera, Save, Lock, Twitter, Twitch, Bell, Monitor, Shield, LogOut, Volume2, Play, ZoomIn, ZoomOut, Move, X, Check, Upload, Link2, Unlink, PhoneIncoming, Accessibility as AccessibilityIcon, Flame, Smartphone, PhoneCall, Sliders, VolumeX, Sparkles } from 'lucide-react';
import { STREAK_BADGES } from '../components/StreakRewardsModal';
import { isVibrationSupported, isHapticsEnabled, setHapticsEnabled, hapticMascotPoke, hapticStreakIncrement } from '../services/haptics';
import { AudioVolumeSlider } from '../components/AudioVolumeSlider';
import { Slider } from '../components/Slider';
import { getAudioVolumes, saveAudioVolumes, AudioVolumes, playCategorizedAudio } from '../services/audioManager';
import { SoundEffectEngine } from '../services/SoundEffectEngine';

// Custom Icons not in Lucide
const DiscordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z"/>
  </svg>
);

const SteamIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.979 0C5.666 0 .502 4.904.023 11.133L4.93 16.04c.068-.962.593-1.812 1.383-2.328l-2.07-3.104c.148-.225.318-.436.505-.634l2.067 3.098a3.155 3.155 0 011.69-.175l3.197-4.796A5.736 5.736 0 0111.979 8c3.168 0 5.736 2.568 5.736 5.736 0 3.168-2.568 5.736-5.736 5.736-1.584 0-3.025-.644-4.073-1.69l-4.223 6.336C6.115 23.94 8.924 24 11.979 24c6.627 0 12-5.373 12-12S18.606 0 11.979 0z"/>
  </svg>
);

const SOUND_OPTIONS = [
  { id: 'default', name: 'Nexus Default', url: 'https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-positive-notification-266.mp3' },
  { id: 'subtle', name: 'Subtle Chime', url: 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3' },
  { id: 'arcade', name: 'Arcade Coin', url: 'https://assets.mixkit.co/sfx/preview/mixkit-video-game-treasure-2066.mp3' },
  { id: 'alert', name: 'System Alert', url: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-2586.mp3' },
  { id: 'magic', name: 'Magic Sparkle', url: 'https://assets.mixkit.co/sfx/preview/mixkit-magical-glitter-sparkle-2629.mp3' },
];

interface SettingsProps {
  isDark: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
  onSimulateCall?: () => void;
}

export const SettingsView: React.FC<SettingsProps> = ({ isDark, toggleTheme, onLogout, onSimulateCall }) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    displayName: 'Bogdan Nikitin',
    bio: 'Pro gamer, coffee addict, and occasional streamer. Grinding for radiant!',
    email: 'bogdan@nexus.gg',
    twitter: '@bogdan_gaming',
    twitch: 'twitch.tv/bogdanplays',
    discord: 'Bogdan#8888',
    steam: '',
    avatar: 'https://picsum.photos/100/100?random=88',
    banner: 'https://picsum.photos/1200/400?random=99'
  });

  const [notificationSounds, setNotificationSounds] = useState({
    message: 'default',
    friendRequest: 'arcade',
    system: 'subtle'
  });

  const [accessibility, setAccessibility] = useState({
    fontSize: 100,
    highContrast: false,
    reduceMotion: false
  });

  const [systemPreferences, setSystemPreferences] = useState({
    notifications: true,
    streamerMode: false,
    privacyFilter: true,
  });

  const [hapticsEnabled, setHapticsEnabledState] = useState(() => isHapticsEnabled());
  const vibrationSupported = isVibrationSupported();

  const [audioVolumes, setAudioVolumes] = useState<AudioVolumes>(() => getAudioVolumes());

  const handleVolumeChange = (category: keyof AudioVolumes, val: number) => {
    const updated = saveAudioVolumes({ [category]: val });
    setAudioVolumes(updated);
  };

  const handleToggleMasterMute = () => {
    const updated = saveAudioVolumes({ isMuted: !audioVolumes.isMuted });
    setAudioVolumes(updated);
  };

  const handleToggleHaptics = () => {
    const next = !hapticsEnabled;
    setHapticsEnabledState(next);
    setHapticsEnabled(next);
    if (next) {
      hapticMascotPoke();
    }
  };

  const [equippedBadgeId, setEquippedBadgeId] = useState<string>(() => {
    return localStorage.getItem('nexus_equipped_badge') || 'badge-3';
  });

  useEffect(() => {
    const syncBadge = () => {
      const saved = localStorage.getItem('nexus_equipped_badge');
      if (saved) setEquippedBadgeId(saved);
    };
    window.addEventListener('storage', syncBadge);
    window.addEventListener('nexus_badge_updated', syncBadge);
    return () => {
      window.removeEventListener('storage', syncBadge);
      window.removeEventListener('nexus_badge_updated', syncBadge);
    };
  }, []);

  const equippedBadge = STREAK_BADGES.find(b => b.id === equippedBadgeId) || STREAK_BADGES[0];
  const EquippedBadgeIcon = equippedBadge.icon;

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const connectTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (connectTimerRef.current) clearTimeout(connectTimerRef.current);
    };
  }, []);

  // --- Image Cropping State ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [cropModal, setCropModal] = useState({ isOpen: false, imgUrl: '' });
  const [cropState, setCropState] = useState({ zoom: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setCropModal({ isOpen: true, imgUrl: url });
      setCropState({ zoom: 1, x: 0, y: 0 });
    }
    // Reset input so same file can be selected again if needed
    if (e.target) e.target.value = '';
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - cropState.x, y: e.clientY - cropState.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCropState(prev => ({
      ...prev,
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleSaveCrop = () => {
    // 1. Create a canvas
    const canvas = document.createElement('canvas');
    const size = 300; // Output Resolution
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (ctx && imgRef.current) {
        // 2. Draw background
        ctx.fillStyle = '#121216';
        ctx.fillRect(0, 0, size, size);
        
        // 3. Transform context to match user interaction
        // Center the coordinate system
        ctx.translate(size / 2, size / 2);
        // Apply user's pan
        ctx.translate(cropState.x, cropState.y);
        // Apply user's zoom
        ctx.scale(cropState.zoom, cropState.zoom);
        
        // 4. Draw image centered
        const img = imgRef.current;
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        
        // 5. Export
        const result = canvas.toDataURL('image/jpeg', 0.9);
        setProfile(prev => ({ ...prev, avatar: result }));
        setCropModal({ isOpen: false, imgUrl: '' });
    }
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setLoading(false);
      playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.5);
      saveTimerRef.current = null;
    }, 1500);
  };

  const handleSocialConnect = (platform: 'discord' | 'steam') => {
      if (profile[platform]) {
          // Disconnect logic
          setProfile(prev => ({...prev, [platform]: ''}));
          playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-simple-game-countdown-921.mp3', 'system', 0.5);
      } else {
          // Connect logic (Simulate OAuth)
          playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-click-900.mp3', 'system', 0.5);
          // Simulate a popup or delay
          if (connectTimerRef.current) clearTimeout(connectTimerRef.current);
          connectTimerRef.current = setTimeout(() => {
              const mockId = platform === 'discord' ? 'Bogdan#8888' : 'bogdan_steam_id';
              setProfile(prev => ({...prev, [platform]: mockId}));
              playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-2586.mp3', 'system', 0.5);
              connectTimerRef.current = null;
          }, 800);
      }
  };

  const previewSound = (soundId: string) => {
    const sound = SOUND_OPTIONS.find(s => s.id === soundId);
    if (sound) {
        playCategorizedAudio(sound.url, 'notifications', 0.8);
    }
  };

  const renderSoundOption = (label: string, key: keyof typeof notificationSounds) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5 hover:border-purple-500/30 transition-colors group">
        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            {label}
        </span>
        <div className="flex items-center gap-3">
            <select 
                value={notificationSounds[key]}
                onChange={(e) => setNotificationSounds(prev => ({ ...prev, [key]: e.target.value }))}
                className="bg-white dark:bg-[#0f1014] border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-sm font-medium outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
                {SOUND_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
            </select>
            <button 
                onClick={() => previewSound(notificationSounds[key])}
                className="p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-500 dark:hover:text-white rounded-lg transition-all transform active:scale-95"
                title="Preview Sound"
            >
                <Play size={14} fill="currentColor" />
            </button>
        </div>
    </div>
  );

  return (
    <div className="pb-12 animate-fadeIn h-full">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept="image/*" 
        className="hidden" 
      />

      {/* --- CROP MODAL --- */}
      {cropModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-[#1e1f24] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#25262b]">
                    <h3 className="font-bold text-white flex items-center gap-2"><Camera size={18} /> Adjust Avatar</h3>
                    <button onClick={() => setCropModal({isOpen: false, imgUrl: ''})} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-8 flex flex-col items-center justify-center bg-[#0f1014] relative select-none">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest flex items-center gap-1">
                        <Move size={12} /> Drag to Reposition
                    </p>
                    
                    {/* Viewport */}
                    <div 
                        className="w-[260px] h-[260px] relative overflow-hidden bg-black/50 border-2 border-dashed border-white/20 rounded-xl cursor-move group"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {/* Image Layer */}
                        <div 
                            className="absolute top-1/2 left-1/2 origin-center will-change-transform"
                            style={{
                                transform: `translate(-50%, -50%) translate(${cropState.x}px, ${cropState.y}px) scale(${cropState.zoom})`
                            }}
                        >
                            <img 
                                ref={imgRef}
                                src={cropModal.imgUrl} 
                                alt="Crop Target"
                                className="max-w-none pointer-events-none select-none"
                                draggable={false}
                            />
                        </div>

                        {/* Visual Overlay for Circle Crop */}
                        <div className="absolute inset-0 pointer-events-none rounded-full border-[100px] border-black/60 box-content -m-[100px] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.3)]"></div>
                        
                        {/* Grid Lines (Decoration) */}
                        <div className="absolute inset-0 pointer-events-none opacity-20">
                            <div className="absolute top-1/3 w-full h-px bg-white"></div>
                            <div className="absolute top-2/3 w-full h-px bg-white"></div>
                            <div className="absolute left-1/3 h-full w-px bg-white"></div>
                            <div className="absolute left-2/3 h-full w-px bg-white"></div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="w-full mt-6 px-4 space-y-2">
                        <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                            <span>Zoom</span>
                            <span>{Math.round(cropState.zoom * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <ZoomOut size={16} className="text-slate-500" />
                            <input 
                                type="range" 
                                min="0.5" 
                                max="3" 
                                step="0.1" 
                                value={cropState.zoom} 
                                onChange={(e) => setCropState(prev => ({...prev, zoom: parseFloat(e.target.value)}))}
                                className="flex-1 accent-purple-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                            />
                            <ZoomIn size={16} className="text-slate-500" />
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-white/5 bg-[#25262b] flex justify-end gap-3">
                    <button 
                        onClick={() => setCropModal({isOpen: false, imgUrl: ''})}
                        className="px-4 py-2 rounded-xl font-bold text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSaveCrop}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
                    >
                        <Check size={16} /> Save Avatar
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Banner Section */}
      <div className="relative h-36 xs:h-48 sm:h-64 w-full group">
        <img 
          src={profile.banner} 
          className="w-full h-full object-cover mask-gradient-b" 
          alt="Cover"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
        <button className="absolute top-2.5 xs:top-4 right-2.5 xs:right-4 bg-black/50 hover:bg-black/70 text-white px-3 xs:px-4 py-1.5 xs:py-2 rounded-full backdrop-blur-md flex items-center gap-1.5 xs:gap-2 transition-all opacity-0 group-hover:opacity-100 font-medium text-xs xs:text-sm">
          <Camera size={14} className="xs:w-4 xs:h-4" /> Change Cover
        </button>
      </div>

      <div className="px-3 xs:px-4 md:px-8 max-w-7xl mx-auto -mt-10 xs:-mt-14 sm:-mt-20 relative z-10">
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-8">
          
          {/* Left Column: Profile & Socials */}
          <div className="flex-1 space-y-4 sm:space-y-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-3 xs:gap-4 sm:gap-6 mb-2 sm:mb-4">
              <div 
                className="relative group cursor-pointer"
                onClick={handleAvatarClick}
              >
                {/* Equipped Badge Medallion on Settings Avatar */}
                <div className={`absolute -top-1.5 -left-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#121216] border ${equippedBadge.borderColor} flex items-center justify-center shadow-lg z-10`} title={`Equipped Badge: ${equippedBadge.title}`}>
                   <EquippedBadgeIcon size={13} className={`${equippedBadge.rarityColor} sm:w-4 sm:h-4`} />
                </div>

                <img 
                  src={profile.avatar} 
                  className="w-20 h-20 xs:w-24 xs:h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-white dark:border-[#0f1014] shadow-2xl object-cover bg-slate-200" 
                  alt="Avatar"
                />
                <div className="absolute inset-0 bg-black/60 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] text-white">
                   <Upload size={18} className="sm:w-6 sm:h-6 mb-0.5" />
                   <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Upload</span>
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 bg-purple-500 text-white p-1.5 sm:p-2 rounded-full border-2 sm:border-4 border-[#0f1014] shadow-lg group-hover:scale-110 transition-transform">
                    <Camera size={12} className="sm:w-3.5 sm:h-3.5" />
                </div>
              </div>
              <div className="pb-1 sm:pb-2">
                <h1 className="text-xl xs:text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">{profile.displayName}</h1>
                <div className="flex items-center gap-2 mt-0.5 sm:mt-1 flex-wrap">
                  <p className="text-purple-500 font-bold text-xs sm:text-sm">Level 42 • Pro Member</p>
                  <span className="text-slate-500">•</span>
                  <div className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-lg bg-black/40 border ${equippedBadge.borderColor} ${equippedBadge.rarityColor} text-[10px] sm:text-xs font-bold`}>
                    <EquippedBadgeIcon size={11} className="sm:w-3 sm:h-3" />
                    <span>{equippedBadge.title}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white dark:bg-[#1e1f24] p-3.5 xs:p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800/50">
               <h3 className="text-lg xs:text-xl font-bold text-slate-800 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                 Personal Information
               </h3>
               
               <div className="space-y-4 sm:space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6">
                   <div className="space-y-1.5 sm:space-y-2">
                     <label className="text-[10px] xs:text-xs font-bold uppercase text-slate-400 tracking-wider">Display Name</label>
                     <input 
                        value={profile.displayName}
                        onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                        className="w-full p-2.5 xs:p-3 sm:p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-transparent focus:border-purple-500 outline-none font-semibold text-xs xs:text-sm sm:text-base text-slate-700 dark:text-white transition-all"
                     />
                   </div>
                   <div className="space-y-1.5 sm:space-y-2">
                     <label className="text-[10px] xs:text-xs font-bold uppercase text-slate-400 tracking-wider">Email (Private)</label>
                     <div className="relative">
                        <input 
                            value={profile.email}
                            disabled
                            className="w-full p-2.5 xs:p-3 sm:p-4 bg-slate-100 dark:bg-black/40 rounded-xl border border-transparent outline-none font-semibold text-xs xs:text-sm sm:text-base text-slate-500 dark:text-slate-500 cursor-not-allowed pl-10 sm:pl-12"
                        />
                        <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                     </div>
                   </div>
                 </div>

                 <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[10px] xs:text-xs font-bold uppercase text-slate-400 tracking-wider">Bio</label>
                    <textarea 
                        value={profile.bio}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        className="w-full p-2.5 xs:p-3 sm:p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-transparent focus:border-purple-500 outline-none font-medium text-xs xs:text-sm text-slate-700 dark:text-white h-24 xs:h-28 sm:h-32 resize-none transition-all"
                    />
                 </div>
               </div>
            </div>

            {/* Social Connections */}
            <div className="bg-white dark:bg-[#1e1f24] p-3.5 xs:p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800/50">
               <h3 className="text-lg xs:text-xl font-bold text-slate-800 dark:text-white mb-4 sm:mb-6">Social Connections</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6">
                 {/* Existing Inputs */}
                 <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                        <Twitter size={20} />
                    </div>
                    <input 
                        value={profile.twitter}
                        onChange={(e) => setProfile({...profile, twitter: e.target.value})}
                        className="bg-transparent outline-none font-bold text-slate-700 dark:text-blue-100 w-full placeholder-blue-300"
                        placeholder="@username"
                    />
                 </div>
                 <div className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-900/30">
                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white">
                        <Twitch size={20} />
                    </div>
                    <input 
                        value={profile.twitch}
                        onChange={(e) => setProfile({...profile, twitch: e.target.value})}
                        className="bg-transparent outline-none font-bold text-slate-700 dark:text-purple-100 w-full placeholder-purple-300"
                        placeholder="channel"
                    />
                 </div>

                 {/* Discord Link */}
                 <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${profile.discord ? 'bg-[#5865F2]/10 border-[#5865F2]/50' : 'bg-slate-50 dark:bg-black/20 border-transparent hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#5865F2] rounded-xl flex items-center justify-center text-white">
                            <DiscordIcon />
                        </div>
                        <div>
                            <div className="font-bold text-slate-700 dark:text-white text-sm">Discord</div>
                            {profile.discord ? (
                                <div className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                    <Check size={12} strokeWidth={3} /> {profile.discord}
                                </div>
                            ) : (
                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Not Connected</div>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={() => handleSocialConnect('discord')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            profile.discord
                            ? 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white'
                            : 'bg-white dark:bg-black/20 text-slate-700 dark:text-white hover:bg-[#5865F2] hover:text-white shadow-sm'
                        }`}
                    >
                        {profile.discord ? <><Unlink size={14} /> Unlink</> : <><Link2 size={14} /> Link</>}
                    </button>
                 </div>

                 {/* Steam Link */}
                 <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${profile.steam ? 'bg-[#171a21]/10 dark:bg-[#171a21]/50 border-[#171a21]/50 dark:border-white/20' : 'bg-slate-50 dark:bg-black/20 border-transparent hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#171a21] rounded-xl flex items-center justify-center text-white">
                            <SteamIcon />
                        </div>
                        <div>
                            <div className="font-bold text-slate-700 dark:text-white text-sm">Steam</div>
                            {profile.steam ? (
                                <div className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                    <Check size={12} strokeWidth={3} /> {profile.steam}
                                </div>
                            ) : (
                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Not Connected</div>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={() => handleSocialConnect('steam')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            profile.steam
                            ? 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white'
                            : 'bg-white dark:bg-black/20 text-slate-700 dark:text-white hover:bg-[#171a21] hover:text-white shadow-sm'
                        }`}
                    >
                         {profile.steam ? <><Unlink size={14} /> Unlink</> : <><Link2 size={14} /> Link</>}
                    </button>
                 </div>
               </div>
            </div>

             {/* Persistent Audio Settings Panel */}
            <div className="bg-white dark:bg-[#1e1f24] p-3.5 xs:p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800/50 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <Volume2 className="text-purple-500" /> Audio & Volume Controls
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Independent volume control for notifications, incoming calls, and system interactions. Persists across sessions.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={handleToggleMasterMute}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                          audioVolumes.isMuted 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-md shadow-red-500/20' 
                            : 'bg-slate-100 dark:bg-black/30 hover:bg-slate-200 dark:hover:bg-black/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                        }`}
                      >
                        {audioVolumes.isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                        <span>{audioVolumes.isMuted ? 'Unmute Master' : 'Mute All'}</span>
                      </button>

                      <span className="px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-wider">
                        Auto-Saved
                      </span>
                    </div>
                </div>

                {/* Master Volume Slider */}
                <AudioVolumeSlider
                  label="Master Output Volume"
                  category="system"
                  value={audioVolumes.isMuted ? 0 : audioVolumes.master}
                  onChange={(v) => handleVolumeChange('master', v)}
                  icon={Sliders}
                  accentColor="purple"
                  description="Global volume ceiling for all application audio channels"
                  previewSoundUrl="https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-click-900.mp3"
                  disabled={audioVolumes.isMuted}
                />

                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Independent Channel Controls</h4>
                  
                  {/* Notifications Volume */}
                  <AudioVolumeSlider
                    label="Notifications Volume"
                    category="notifications"
                    value={audioVolumes.isMuted ? 0 : audioVolumes.notifications}
                    onChange={(v) => handleVolumeChange('notifications', v)}
                    icon={Bell}
                    accentColor="rose"
                    description="Incoming chat DMs, friend invites, and activity alerts"
                    previewSoundUrl="https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-positive-notification-266.mp3"
                    disabled={audioVolumes.isMuted}
                  />

                  {/* Incoming Calls Volume */}
                  <AudioVolumeSlider
                    label="Incoming Calls & Ringtone"
                    category="calls"
                    value={audioVolumes.isMuted ? 0 : audioVolumes.calls}
                    onChange={(v) => handleVolumeChange('calls', v)}
                    icon={PhoneCall}
                    accentColor="emerald"
                    description="Ringtone volume for incoming voice calls & video chats"
                    previewSoundUrl="https://assets.mixkit.co/sfx/preview/mixkit-classic-phone-ring-1611.mp3"
                    disabled={audioVolumes.isMuted}
                  />

                  {/* System Interactions Volume */}
                  <AudioVolumeSlider
                    label="System Interactions & SFX"
                    category="system"
                    value={audioVolumes.isMuted ? 0 : audioVolumes.system}
                    onChange={(v) => handleVolumeChange('system', v)}
                    icon={Sparkles}
                    accentColor="amber"
                    description="UI taps, streak flame ignition, Barnaby mascot reactions, and level-ups"
                    previewSoundUrl="https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3"
                    disabled={audioVolumes.isMuted}
                  />
                </div>

                {/* Sound Profile Selectors (Notification Sounds) */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-400" />
                    Chime Tone Presets
                  </h4>
                  <div className="space-y-3">
                      {renderSoundOption('New Messages', 'message')}
                      {renderSoundOption('Friend Requests', 'friendRequest')}
                      {renderSoundOption('System Alerts', 'system')}
                  </div>
                </div>
            </div>
            
            <div className="flex justify-end pt-4">
                 <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-600/30 flex items-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={20} /> Save Changes
                        </>
                    )}
                 </button>
            </div>
          </div>

          {/* Right Column: Settings */}
          <div className="w-full xl:w-96 space-y-4 sm:space-y-8">
             {/* Visual Settings */}
             <div className="bg-white dark:bg-[#1e1f24] p-3.5 xs:p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800/50">
                <h3 className="text-base xs:text-lg font-bold text-slate-800 dark:text-white mb-4 sm:mb-6">Visual Preferences</h3>
                <LampSwitch isDark={isDark} toggleTheme={toggleTheme} />
             </div>

             {/* Accessibility Settings - NEW */}
             <div className="bg-white dark:bg-[#1e1f24] p-3.5 xs:p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800/50 space-y-3 sm:space-y-4">
                <h3 className="text-base xs:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <AccessibilityIcon className="text-purple-500" size={20} />
                    Accessibility
                </h3>
                
                {/* Font Size */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                        <span>Font Size</span>
                        <span>{accessibility.fontSize}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="75" 
                        max="150" 
                        step="25"
                        value={accessibility.fontSize} 
                        onChange={(e) => setAccessibility(prev => ({...prev, fontSize: parseInt(e.target.value)}))}
                        className="w-full accent-purple-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] xs:text-xs text-slate-400 font-bold px-1">
                        <span>Aa</span>
                        <span className="text-base sm:text-lg">Aa</span>
                    </div>
                </div>

                {/* High Contrast Toggle */}
                <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">High Contrast</span>
                    <button 
                        onClick={() => setAccessibility(prev => ({...prev, highContrast: !prev.highContrast}))}
                        className={`w-11 xs:w-12 h-6 rounded-full relative transition-colors ${accessibility.highContrast ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${accessibility.highContrast ? 'left-6 xs:left-7' : 'left-1'}`}></div>
                    </button>
                </div>

                {/* Reduce Motion Toggle */}
                <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">Reduce Motion</span>
                    <button 
                        onClick={() => setAccessibility(prev => ({...prev, reduceMotion: !prev.reduceMotion}))}
                        className={`w-11 xs:w-12 h-6 rounded-full relative transition-colors ${accessibility.reduceMotion ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${accessibility.reduceMotion ? 'left-6 xs:left-7' : 'left-1'}`}></div>
                    </button>
                </div>
             </div>

             {/* System Settings */}
             <div className="bg-white dark:bg-[#1e1f24] p-3.5 xs:p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800/50 space-y-2">
                <h3 className="text-base xs:text-lg font-bold text-slate-800 dark:text-white mb-3 sm:mb-4">System</h3>
                
                {[
                    { key: 'notifications' as const, label: 'Notifications', icon: Bell, active: systemPreferences.notifications },
                    { key: 'streamerMode' as const, label: 'Streamer Mode', icon: Monitor, active: systemPreferences.streamerMode },
                    { key: 'privacyFilter' as const, label: 'Privacy Filter', icon: Shield, active: systemPreferences.privacyFilter },
                ].map((item) => (
                    <div 
                      key={item.key} 
                      onClick={() => setSystemPreferences(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-black/20 rounded-xl cursor-pointer transition-colors group"
                    >
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                            <item.icon size={20} className="group-hover:text-purple-500 transition-colors" />
                            <span className="font-semibold">{item.label}</span>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${item.active ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${item.active ? 'left-7' : 'left-1'}`}></div>
                        </div>
                    </div>
                ))}

                {/* --- PHYSICAL HAPTIC FEEDBACK (navigator.vibrate) --- */}
                <div 
                  onClick={handleToggleHaptics}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-black/20 rounded-xl cursor-pointer transition-colors group"
                >
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <Smartphone size={20} className="group-hover:text-amber-400 transition-colors" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Haptic Feedback</span>
                            <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                              vibrationSupported ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-500/20 text-slate-400'
                            }`}>
                              {vibrationSupported ? 'Device Ready' : 'Desktop (Emulated)'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-normal mt-0.5">Physical vibrations for mascot poke, snacks & streak burst animations</p>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ml-3 ${hapticsEnabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${hapticsEnabled ? 'left-7' : 'left-1'}`}></div>
                    </div>
                </div>

                {/* Haptic Quick Test Actions */}
                {hapticsEnabled && (
                  <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-wrap items-center justify-between gap-2.5 my-2">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Smartphone size={14} className="animate-pulse" /> Test Physical Feedback:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          SoundEffectEngine.play('button-click');
                          hapticMascotPoke();
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-all active:scale-95"
                      >
                        🦉 Mascot Poke
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          SoundEffectEngine.play('streak-burst');
                          hapticStreakIncrement();
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-xs font-bold transition-all active:scale-95"
                      >
                        🔥 Streak Burst
                      </button>
                    </div>
                  </div>
                )}

                {/* --- SIMULATION TOOLS --- */}
                {onSimulateCall && (
                    <div 
                        onClick={onSimulateCall}
                        className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-black/20 rounded-xl cursor-pointer transition-colors group border border-purple-500/20 mt-4"
                    >
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                            <PhoneIncoming size={20} className="text-purple-500 animate-bounce" />
                            <span className="font-semibold text-purple-400">Simulate Call</span>
                        </div>
                        <div className="px-2 py-1 bg-purple-500/20 rounded text-[10px] font-bold text-purple-400 uppercase">
                            Test
                        </div>
                    </div>
                )}
                
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <button 
                        onClick={onLogout}
                        className="w-full p-4 flex items-center justify-center gap-2 text-red-500 font-bold bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                        <LogOut size={20} /> Log Out
                    </button>
                </div>
             </div>
          </div>

        </div>
      </div>
      
      <style>{`
        .mask-gradient-b {
            mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
            -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
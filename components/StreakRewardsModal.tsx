import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Shield, 
  Swords, 
  Crown, 
  Sun, 
  Sparkles, 
  Check, 
  Lock, 
  Trophy, 
  X, 
  Zap, 
  Gift, 
  Award,
  ChevronRight,
  User,
  ArrowUpRight
} from 'lucide-react';
import { hapticBadgeEquip } from '../services/haptics';
import { playCategorizedAudio } from '../services/audioManager';
import { SoundEffectEngine } from '../services/SoundEffectEngine';

export interface StreakBadge {
  id: string;
  milestoneDays: number;
  title: string;
  subtitle: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'amethyst' | 'solar' | 'mythic';
  icon: React.ComponentType<{ size?: number; className?: string }>;
  rewards: string[];
  rarityColor: string;
  badgeBg: string;
  borderColor: string;
  glowClass: string;
}

export const STREAK_BADGES: StreakBadge[] = [
  {
    id: 'badge-3',
    milestoneDays: 3,
    title: 'Ember Spark',
    subtitle: 'The Spark of Discipline',
    description: 'Started the fire. Logged in for 3 consecutive days without faltering.',
    tier: 'bronze',
    icon: Flame,
    rewards: ['+10% Match XP', 'Bronze Ember Profile Flare', '50 Nexus Coins'],
    rarityColor: 'text-amber-500',
    badgeBg: 'from-amber-900/40 via-orange-950/30 to-amber-950/20',
    borderColor: 'border-amber-600/40',
    glowClass: 'shadow-amber-500/20',
  },
  {
    id: 'badge-7',
    milestoneDays: 7,
    title: 'Blaze Vanguard',
    subtitle: 'One Week Unbroken',
    description: 'Held the frontline for 7 days straight. You stand at the vanguard of the arena.',
    tier: 'silver',
    icon: Shield,
    rewards: ['+25% Match XP', 'Silver Vanguard Profile Badge', '100 Nexus Coins', '1x Free Streak Shield'],
    rarityColor: 'text-slate-200',
    badgeBg: 'from-slate-800/60 via-zinc-800/40 to-slate-900/30',
    borderColor: 'border-slate-400/50',
    glowClass: 'shadow-slate-300/20',
  },
  {
    id: 'badge-14',
    milestoneDays: 14,
    title: 'Inferno Champion',
    subtitle: 'Fortnight of Fury',
    description: 'Two full weeks of relentless dedication. You forge victories in white-hot flame.',
    tier: 'gold',
    icon: Swords,
    rewards: ['+45% Match XP', 'Golden Inferno Champion Badge', '250 Nexus Coins', 'Special Chat Flair'],
    rarityColor: 'text-yellow-400',
    badgeBg: 'from-yellow-900/40 via-amber-900/30 to-yellow-950/20',
    borderColor: 'border-yellow-500/50',
    glowClass: 'shadow-yellow-500/25',
  },
  {
    id: 'badge-30',
    milestoneDays: 30,
    title: 'Hellfire Legend',
    subtitle: 'The 30-Day Pillar',
    description: 'A full month of consecutive daily supremacy. Celebrated across all Nexus gaming hubs.',
    tier: 'amethyst',
    icon: Crown,
    rewards: ['+75% Match XP', 'Amethyst Crystal Fire Badge', '500 Nexus Coins', '2x Streak Shields'],
    rarityColor: 'text-purple-400',
    badgeBg: 'from-purple-900/40 via-fuchsia-950/30 to-indigo-950/20',
    borderColor: 'border-purple-500/50',
    glowClass: 'shadow-purple-500/30',
  },
  {
    id: 'badge-60',
    milestoneDays: 60,
    title: 'Solar Ascendant',
    subtitle: 'Two Months of Supremacy',
    description: '60 days unbroken. Your daily consistency radiates with the power of a star.',
    tier: 'solar',
    icon: Sun,
    rewards: ['+100% Match XP', 'Solar Crown Animated Aura', '1,000 Nexus Coins', 'VIP Channel Access'],
    rarityColor: 'text-orange-400',
    badgeBg: 'from-orange-900/50 via-amber-950/40 to-red-950/30',
    borderColor: 'border-orange-500/60',
    glowClass: 'shadow-orange-500/35',
  },
  {
    id: 'badge-100',
    milestoneDays: 100,
    title: 'Eternal Phoenix',
    subtitle: 'Centurion of Fire',
    description: 'The monumental 100-day centurion milestone! Reborn each day in immortal, eternal flame.',
    tier: 'mythic',
    icon: Sparkles,
    rewards: ['+150% XP Multiplier', 'Mythic Animated Phoenix Badge & Frame', '2,500 Nexus Coins', 'Hall of Fame Immortal Title'],
    rarityColor: 'text-rose-400',
    badgeBg: 'from-rose-950/60 via-red-900/40 to-amber-950/40',
    borderColor: 'border-rose-500/70',
    glowClass: 'shadow-rose-500/40',
  },
];

interface StreakRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
  onSetStreak: (newStreak: number) => void;
}

export const StreakRewardsModal: React.FC<StreakRewardsModalProps> = ({
  isOpen,
  onClose,
  currentStreak,
  onSetStreak,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [equippedBadgeId, setEquippedBadgeId] = useState<string>(() => {
    return localStorage.getItem('nexus_equipped_badge') || 'badge-3';
  });
  const [justEquippedId, setJustEquippedId] = useState<string | null>(null);
  const equipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync equipped badge
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('nexus_equipped_badge');
      if (saved) setEquippedBadgeId(saved);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('nexus_badge_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('nexus_badge_updated', handleStorage);
      if (equipTimeoutRef.current) clearTimeout(equipTimeoutRef.current);
    };
  }, []);

  // Auto-equip first unlocked badge if current equipped badge is locked
  useEffect(() => {
    const currentEquipped = STREAK_BADGES.find(b => b.id === equippedBadgeId);
    if (!currentEquipped || currentStreak < currentEquipped.milestoneDays) {
      const highestUnlocked = [...STREAK_BADGES]
        .reverse()
        .find(b => currentStreak >= b.milestoneDays);
      if (highestUnlocked) {
        setEquippedBadgeId(highestUnlocked.id);
        localStorage.setItem('nexus_equipped_badge', highestUnlocked.id);
      }
    }
  }, [currentStreak, equippedBadgeId]);

  if (!isOpen) return null;

  const equippedBadge = STREAK_BADGES.find(b => b.id === equippedBadgeId) || STREAK_BADGES[0];
  const unlockedCount = STREAK_BADGES.filter(b => currentStreak >= b.milestoneDays).length;

  const handleEquipBadge = (badge: StreakBadge) => {
    if (currentStreak < badge.milestoneDays) return;
    
    // Play equip sound & streak flare
    SoundEffectEngine.play('streak-burst');
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.5);

    // Physical haptic mechanical feedback
    hapticBadgeEquip();

    setEquippedBadgeId(badge.id);
    localStorage.setItem('nexus_equipped_badge', badge.id);
    window.dispatchEvent(new Event('nexus_badge_updated'));
    window.dispatchEvent(new Event('storage'));

    setJustEquippedId(badge.id);
    if (equipTimeoutRef.current) clearTimeout(equipTimeoutRef.current);
    equipTimeoutRef.current = setTimeout(() => {
      setJustEquippedId(null);
      equipTimeoutRef.current = null;
    }, 2000);
  };

  const filteredBadges = STREAK_BADGES.filter(badge => {
    const isUnlocked = currentStreak >= badge.milestoneDays;
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#131316] rounded-[2.5rem] shadow-2xl overflow-hidden border border-orange-500/30 animate-zoomIn max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-gradient-to-b from-orange-600/20 to-transparent blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="p-6 md:p-7 pb-4 border-b border-white/5 relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 p-0.5 shadow-lg shadow-orange-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#101014] rounded-[14px] flex items-center justify-center">
                <Trophy size={26} className="text-amber-400 fill-amber-500/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white tracking-tight">Streak Rewards</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  {unlockedCount}/{STREAK_BADGES.length} Unlocked
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Reach streak milestones to unlock and equip prestigious profile badges.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 md:p-7 space-y-6 overflow-y-auto custom-scrollbar flex-1 relative z-10">

          {/* --- PROFILE BADGE SHOWCASE PREVIEW --- */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1c1a24] via-[#1a1722] to-[#20181e] p-4 md:p-5 border border-white/10 shadow-lg">
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                {/* Avatar with Equipped Badge Overlay */}
                <div className="relative shrink-0">
                  <img 
                    src="https://picsum.photos/100/100?random=88" 
                    alt="Player Profile" 
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-orange-500/50 shadow-md"
                  />
                  {/* Equipped Badge Medallion on Avatar */}
                  <div className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-xl bg-[#121216] border ${equippedBadge.borderColor} flex items-center justify-center shadow-lg`}>
                    <equippedBadge.icon size={15} className={equippedBadge.rarityColor} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Currently Equipped Badge</span>
                    <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-green-500/20 text-green-400">Active</span>
                  </div>
                  <h4 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
                    <equippedBadge.icon size={18} className={equippedBadge.rarityColor} />
                    <span>{equippedBadge.title}</span>
                  </h4>
                  <p className="text-xs text-slate-400 italic">"{equippedBadge.subtitle}"</p>
                </div>
              </div>

              {/* Current Streak pill on showcase */}
              <div className="flex items-center sm:flex-col sm:items-end justify-between border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Streak</span>
                <div className="flex items-center gap-1.5 text-2xl font-black text-orange-400">
                  <Flame size={20} className="fill-orange-500" />
                  <span>{currentStreak} Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
            <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5">
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filter === 'all' 
                    ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Milestones ({STREAK_BADGES.length})
              </button>
              <button 
                onClick={() => setFilter('unlocked')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filter === 'unlocked' 
                    ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Unlocked ({unlockedCount})
              </button>
              <button 
                onClick={() => setFilter('locked')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filter === 'locked' 
                    ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Locked ({STREAK_BADGES.length - unlockedCount})
              </button>
            </div>

            <span className="text-xs text-slate-500 hidden sm:inline font-medium">
              Click an unlocked badge to equip
            </span>
          </div>

          {/* --- BADGES LIST --- */}
          <div className="space-y-4">
            {filteredBadges.map((badge) => {
              const isUnlocked = currentStreak >= badge.milestoneDays;
              const isEquipped = equippedBadgeId === badge.id;
              const progressPct = Math.min(100, Math.round((currentStreak / badge.milestoneDays) * 100));
              const BadgeIcon = badge.icon;
              const isJustEquipped = justEquippedId === badge.id;

              return (
                <div 
                  key={badge.id}
                  className={`relative overflow-hidden rounded-2xl p-4 md:p-5 border transition-all duration-300 ${
                    isEquipped 
                      ? 'bg-gradient-to-r from-orange-950/40 via-[#1d1b24] to-[#17161c] border-orange-500/60 shadow-lg shadow-orange-500/15'
                      : isUnlocked 
                        ? 'bg-[#18181d] hover:bg-[#1f1e24] border-white/10 hover:border-white/20' 
                        : 'bg-[#121215]/80 border-white/5 opacity-75'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Left: Badge Emblem & Lore */}
                    <div className="flex items-start gap-4">
                      {/* Badge Icon Emblem */}
                      <div className="relative shrink-0 mt-0.5">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${badge.badgeBg} p-0.5 border ${badge.borderColor} flex items-center justify-center shadow-lg ${badge.glowClass}`}>
                          <div className="w-full h-full bg-[#101014]/90 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                            {isUnlocked ? (
                              <BadgeIcon size={26} className={`${badge.rarityColor} transition-transform group-hover:scale-110 drop-shadow`} />
                            ) : (
                              <div className="relative">
                                <BadgeIcon size={24} className="text-slate-600" />
                                <Lock size={14} className="absolute -bottom-1 -right-1 text-slate-400" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Milestone Tag */}
                        <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-black px-1.5 py-0.2 rounded-md uppercase border ${
                          isUnlocked 
                            ? 'bg-orange-500 text-black border-orange-400' 
                            : 'bg-black/80 text-slate-400 border-white/10'
                        }`}>
                          {badge.milestoneDays}D
                        </span>
                      </div>

                      {/* Badge Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-black text-white">{badge.title}</h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            badge.tier === 'mythic' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            badge.tier === 'solar' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                            badge.tier === 'amethyst' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            badge.tier === 'gold' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            badge.tier === 'silver' ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {badge.tier}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 font-medium mt-0.5">{badge.description}</p>

                        {/* Unlocked Perks List */}
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {badge.rewards.map((reward, rIdx) => (
                            <span 
                              key={rIdx} 
                              className="text-[11px] font-semibold text-slate-400 bg-white/5 border border-white/5 rounded-md px-2 py-0.5 flex items-center gap-1"
                            >
                              <Gift size={11} className="text-orange-400" />
                              {reward}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions / Lock Status */}
                    <div className="shrink-0 flex flex-col sm:items-end justify-center pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      {isUnlocked ? (
                        <div>
                          {isEquipped ? (
                            <button 
                              disabled
                              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Check size={14} className="stroke-[3]" />
                              <span>Equipped on Profile</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleEquipBadge(badge)}
                              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                                isJustEquipped 
                                  ? 'bg-green-500 text-black' 
                                  : 'bg-white hover:bg-orange-400 text-black hover:shadow-orange-500/20'
                              }`}
                            >
                              <Zap size={14} className="fill-black" />
                              <span>{isJustEquipped ? 'Equipped! ✓' : 'Equip Badge'}</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="w-full sm:w-44 space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Lock size={12} /> Locked
                            </span>
                            <span className="text-orange-400">{currentStreak}/{badge.milestoneDays} Days</span>
                          </div>
                          
                          {/* Progress Rail */}
                          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/10">
                            <div 
                              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500" 
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>

                          <p className="text-[10px] text-slate-500 text-right">
                            {badge.milestoneDays - currentStreak} more consecutive days needed
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* --- MILESTONE SIMULATION / TESTING SUITE --- */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles size={14} className="text-orange-400" />
                Streak Milestone Tester (Preview Badges)
              </span>
              <span className="text-[10px] text-slate-500">Quickly test 7, 30, 100 days</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => onSetStreak(7)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-orange-500/20 hover:text-orange-300 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
              >
                Set 7 Days (Blaze Vanguard)
              </button>
              <button 
                onClick={() => onSetStreak(30)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-orange-500/20 hover:text-orange-300 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
              >
                Set 30 Days (Hellfire Legend)
              </button>
              <button 
                onClick={() => onSetStreak(100)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-orange-500/20 hover:text-orange-300 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
              >
                Set 100 Days (Eternal Phoenix)
              </button>
              <button 
                onClick={() => onSetStreak(currentStreak + 1)}
                className="px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/20 transition-colors"
              >
                +1 Day
              </button>
              <button 
                onClick={() => onSetStreak(1)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-slate-400 text-xs font-medium transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 md:p-5 bg-black/40 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Equipped badge appears on your profile card, live voice calls, and chat channels.
          </p>
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

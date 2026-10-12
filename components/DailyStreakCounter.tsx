import React, { useState, useEffect, useRef } from 'react';
import { Flame, Sparkles, Trophy, Calendar, Gift, Zap, Shield, Check, ChevronRight, X, Clock } from 'lucide-react';
import { StreakRewardsModal, STREAK_BADGES, StreakBadge } from './StreakRewardsModal';
import { hapticStreakClaim, hapticStreakIncrement } from '../services/haptics';
import { playCategorizedAudio } from '../services/audioManager';
import { SoundEffectEngine } from '../services/SoundEffectEngine';

export interface StreakInfo {
  count: number;
  lastLoginDate: string; // YYYY-MM-DD
  claimedToday: boolean;
  totalXPEarned: number;
  freezesRemaining: number;
  history: { day: string; date: string; completed: boolean; isToday: boolean }[];
}

const STORAGE_KEY = 'nexus_daily_login_streak';

export const DailyStreakCounter: React.FC = () => {
  const [streakData, setStreakData] = useState<StreakInfo | null>(null);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState('');
  const celebrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [equippedBadgeId, setEquippedBadgeId] = useState<string>(() => {
    return localStorage.getItem('nexus_equipped_badge') || 'badge-3';
  });

  // Calculate midnight countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeUntilReset(`${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // Helper to get formatted date string (YYYY-MM-DD)
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Helper to generate current 7-day view
  const generateWeekHistory = (streakCount: number, claimedToday: boolean) => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    // Monday is index 0
    const currentDayOfWeek = (today.getDay() + 6) % 7;

    return dayNames.map((dayName, idx) => {
      const diff = idx - currentDayOfWeek;
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + diff);
      const isPast = idx < currentDayOfWeek;
      const isToday = idx === currentDayOfWeek;
      
      let completed = false;
      if (isPast) {
        const daysAgo = currentDayOfWeek - idx;
        completed = streakCount >= (claimedToday ? daysAgo + 1 : daysAgo);
      } else if (isToday) {
        completed = claimedToday;
      }

      return {
        day: dayName,
        date: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed,
        isToday,
      };
    });
  };

  // Load and sync streak on mount
  useEffect(() => {
    const todayStr = getTodayDateString();
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const lastDate = parsed.lastLoginDate;
        
        // Calculate days difference
        const last = new Date(lastDate);
        const current = new Date(todayStr);
        const diffTime = current.getTime() - last.getTime();
        const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

        let currentStreak = parsed.count || 1;
        let claimedToday = parsed.claimedToday;
        let freezes = parsed.freezesRemaining ?? 1;

        if (diffDays === 0) {
          claimedToday = parsed.claimedToday ?? false;
        } else if (diffDays === 1) {
          claimedToday = false;
        } else if (diffDays > 1) {
          if (freezes > 0) {
            freezes -= 1;
            claimedToday = false;
          } else {
            currentStreak = 1;
            claimedToday = false;
          }
        }

        const updated: StreakInfo = {
          count: currentStreak,
          lastLoginDate: todayStr,
          claimedToday,
          totalXPEarned: parsed.totalXPEarned || 350,
          freezesRemaining: freezes,
          history: generateWeekHistory(currentStreak, claimedToday),
        };

        setStreakData(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return;
      } catch (err) {
        console.error('Failed to parse streak data', err);
      }
    }

    // Default starting state
    const initialStreak = 6;
    const initialClaimed = false;
    const initialData: StreakInfo = {
      count: initialStreak,
      lastLoginDate: todayStr,
      claimedToday: initialClaimed,
      totalXPEarned: 450,
      freezesRemaining: 1,
      history: generateWeekHistory(initialStreak, initialClaimed),
    };

    setStreakData(initialData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  }, []);

  // Listen for badge changes & storage sync
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
      if (celebrationTimeoutRef.current) clearTimeout(celebrationTimeoutRef.current);
    };
  }, []);

  const handleClaim = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!streakData || streakData.claimedToday) return;

    SoundEffectEngine.play('streak-burst');
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-positive-notification-266.mp3', 'system', 0.5);

    // Physical haptic feedback on supported mobile devices
    hapticStreakClaim();

    const todayStr = getTodayDateString();
    const newCount = streakData.count + 1;
    const newXP = (streakData.totalXPEarned || 0) + 75;

    const updated: StreakInfo = {
      ...streakData,
      count: newCount,
      lastLoginDate: todayStr,
      claimedToday: true,
      totalXPEarned: newXP,
      history: generateWeekHistory(newCount, true),
    };

    setStreakData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('nexus_streak_burst'));
    window.dispatchEvent(new CustomEvent('nexus_xp_gained', { detail: { amount: 75, source: 'Daily Streak' } }));

    setShowCelebration(true);
    if (celebrationTimeoutRef.current) clearTimeout(celebrationTimeoutRef.current);
    celebrationTimeoutRef.current = setTimeout(() => {
      setShowCelebration(false);
      celebrationTimeoutRef.current = null;
    }, 3500);
  };

  const handleSetStreak = (newStreak: number) => {
    if (!streakData) return;
    const todayStr = getTodayDateString();
    const updated: StreakInfo = {
      ...streakData,
      count: newStreak,
      lastLoginDate: todayStr,
      history: generateWeekHistory(newStreak, streakData.claimedToday),
    };
    setStreakData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    if (newStreak > streakData.count) {
      hapticStreakIncrement();
      window.dispatchEvent(new Event('nexus_streak_burst'));
    }
  };

  if (!streakData) return null;

  const multiplier = Math.min(2.5, 1 + streakData.count * 0.05).toFixed(2);
  const nextMilestoneBadge = STREAK_BADGES.find(b => b.milestoneDays > streakData.count) || STREAK_BADGES[STREAK_BADGES.length - 1];
  const daysToMilestone = Math.max(0, nextMilestoneBadge.milestoneDays - streakData.count);

  const equippedBadge = STREAK_BADGES.find(b => b.id === equippedBadgeId) || STREAK_BADGES[0];
  const EquippedIcon = equippedBadge.icon;

  return (
    <>
      {/* --- STREAK COUNTER WIDGET BANNER --- */}
      <div 
        onClick={() => setShowRewardsModal(true)}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#18181c] via-[#1f1a24] to-[#1a1520] border border-orange-500/25 shadow-xl shadow-orange-500/5 hover:border-orange-500/40 transition-all duration-300 group cursor-pointer"
      >
        {/* Ambient Glowing Highlights */}
        <div className="absolute -top-16 -left-16 w-44 h-44 bg-gradient-to-br from-amber-500/20 via-orange-600/15 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
        <div className="absolute top-1/2 -right-12 w-40 h-40 bg-gradient-to-bl from-red-600/15 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        {/* Content Container */}
        <div className="relative z-10 p-5 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left Column: Fire Badge, Streak Count & Active Profile Badge */}
          <div className="flex items-center gap-4">
            {/* Animated Fire Icon Container */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 md:w-18 md:h-18 rounded-2xl bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 p-[2px] shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-shadow">
                <div className="w-full h-full rounded-[14px] bg-[#121118] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-600/30 to-amber-500/10 animate-pulse"></div>
                  
                  <Flame 
                    size={34} 
                    className="text-amber-400 fill-orange-500 animate-flamePulse transition-transform group-hover:scale-110 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]" 
                  />
                </div>
              </div>

              {/* Spark badge */}
              <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-black shadow">
                HOT
              </span>
            </div>

            {/* Streak Header, Count, and Equipped Badge */}
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-black tracking-widest uppercase text-orange-400 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400 animate-spin-slow" />
                  Daily Login Streak
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {multiplier}x XP Boost
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>{streakData.count}</span>
                  <span className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200">
                    Day Streak
                  </span>
                </h3>
              </div>

              {/* Active Profile Badge Tag */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs text-slate-400">
                  {streakData.claimedToday 
                    ? `Streak secured! Next check-in in ${timeUntilReset}.`
                    : `Claim today to progress towards ${nextMilestoneBadge.title} (${daysToMilestone}d left).`}
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRewardsModal(true);
                  }}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 hover:text-white bg-black/40 px-2.5 py-0.5 rounded-lg border border-white/5 hover:border-orange-500/30 transition-colors"
                >
                  <EquippedIcon size={12} className={equippedBadge.rarityColor} />
                  <span>{equippedBadge.title}</span>
                  <span className="text-[10px] text-orange-400 font-normal underline ml-0.5">Badges</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle: 7-Day Week Dots / Rail */}
          <div className="flex items-center gap-2 sm:gap-3 py-1 px-3 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md self-start lg:self-center overflow-x-auto no-scrollbar max-w-full">
            {streakData.history.map((item, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col items-center gap-1.5 px-2 py-1.5 rounded-xl transition-all ${
                  item.isToday 
                    ? 'bg-orange-500/15 border border-orange-500/40 ring-1 ring-orange-500/30' 
                    : item.completed 
                      ? 'bg-white/5 border border-white/5' 
                      : 'opacity-40'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.day}</span>
                <div 
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    item.completed 
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/20' 
                      : item.isToday 
                        ? 'bg-orange-500/20 text-orange-400 border border-dashed border-orange-400/50 animate-pulse'
                        : 'bg-white/5 text-slate-500'
                  }`}
                >
                  {item.completed ? (
                    <Flame size={14} className="fill-white text-white" />
                  ) : item.isToday ? (
                    <Sparkles size={13} className="text-amber-400" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span className="text-[9px] font-medium text-slate-400">{item.isToday ? 'Today' : item.date.split(' ')[1]}</span>
              </div>
            ))}
          </div>

          {/* Right Column: Claim Button & Dedicated Rewards Button */}
          <div className="flex items-center gap-2.5 shrink-0 self-stretch sm:self-auto justify-end">
            {!streakData.claimedToday ? (
              <button 
                onClick={handleClaim}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-black font-black text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Flame size={16} className="fill-black text-black animate-bounce" />
                <span>CLAIM TODAY (+75 XP)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-xs">
                <Check size={15} className="text-green-400 stroke-[3]" />
                <span>Claimed</span>
              </div>
            )}

            {/* Dedicated Rewards Modal Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowRewardsModal(true);
              }}
              title="Open Streak Rewards and Profile Badges"
              className="px-4 py-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 hover:border-orange-500/50 text-orange-300 hover:text-white font-black text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-md shadow-orange-500/5"
            >
              <Trophy size={16} className="text-amber-400" />
              <span>REWARDS</span>
            </button>
          </div>
        </div>

        {/* Celebration Toast/Banner overlay */}
        {showCelebration && (
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/90 via-orange-600/90 to-red-600/90 backdrop-blur-md z-30 flex items-center justify-center p-4 animate-fadeIn">
            <div className="flex items-center gap-4 text-white text-center">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-amber-200">
                <Flame size={28} className="fill-amber-300 text-white animate-bounce" />
              </div>
              <div className="text-left">
                <p className="text-xl font-black tracking-tight">STREAK EXTENDED! 🔥</p>
                <p className="text-xs font-semibold text-amber-100">You earned +75 XP and maintained your {streakData.count} day streak!</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- STREAK REWARDS & BADGES MODAL --- */}
      <StreakRewardsModal 
        isOpen={showRewardsModal}
        onClose={() => setShowRewardsModal(false)}
        currentStreak={streakData.count}
        onSetStreak={handleSetStreak}
      />

      {/* Embedded Animations */}
      <style>{`
        @keyframes flamePulse {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 0 6px rgba(249, 115, 22, 0.6));
          }
          50% {
            transform: scale(1.1) rotate(2deg);
            filter: drop-shadow(0 0 14px rgba(249, 115, 22, 0.9));
          }
        }
        .animate-flamePulse {
          animation: flamePulse 2.5s ease-in-out infinite;
        }

        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 8s linear infinite;
        }
      `}</style>
    </>
  );
};

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Heart, 
  Trophy, 
  CheckCircle2, 
  MessageSquare, 
  Flame, 
  Star, 
  Crown, 
  Music, 
  Coffee,
  RotateCcw
} from 'lucide-react';
import { hapticMascotPoke, hapticMascotFeed, hapticMascotCelebration } from '../services/haptics';
import { SoundEffectEngine } from '../services/SoundEffectEngine';
import { playCategorizedAudio } from '../services/audioManager';

export type MascotMood = 'idle' | 'chirping' | 'celebrating' | 'victory' | 'eating' | 'poked';

interface InteractiveMascotProps {
  onGainXP?: (amount: number) => void;
  className?: string;
}

// Visual tier configuration determined by login streak count
interface StreakTierConfig {
  tier: number;
  name: string;
  badge: string;
  minStreak: number;
  // Color palette
  bgGradient: string;
  borderClass: string;
  glowColor: string;
  primaryFeather: string;
  secondaryFeather: string;
  accentColor: string;
  eyeRingColor: string;
  auraClass: string;
  headgear: 'sprout' | 'spark' | 'flame-crown' | 'inferno' | 'celestial';
}

const STREAK_TIERS: StreakTierConfig[] = [
  {
    tier: 1,
    name: 'Fledgling Scout',
    badge: 'Tier 1 • Fledgling',
    minStreak: 0,
    bgGradient: 'from-[#0b1b2b] via-[#0f2438] to-[#0a1826]',
    borderClass: 'border-cyan-500/30 shadow-cyan-900/20',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    primaryFeather: '#0284c7', // Sky Blue
    secondaryFeather: '#38bdf8', // Light Cyan
    accentColor: '#06b6d4',
    eyeRingColor: '#38bdf8',
    auraClass: 'bg-cyan-500/20',
    headgear: 'sprout',
  },
  {
    tier: 2,
    name: 'Spark Initiate',
    badge: 'Tier 2 • Spark Adept',
    minStreak: 3,
    bgGradient: 'from-[#17112c] via-[#1c1438] to-[#120d24]',
    borderClass: 'border-purple-500/30 shadow-purple-900/20',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    primaryFeather: '#7e22ce', // Purple
    secondaryFeather: '#c084fc', // Lilac
    accentColor: '#a855f7',
    eyeRingColor: '#e9d5ff',
    auraClass: 'bg-purple-600/25',
    headgear: 'spark',
  },
  {
    tier: 3,
    name: 'Blazing Champion',
    badge: 'Tier 3 • Blazing Flame 🔥',
    minStreak: 7,
    bgGradient: 'from-[#261508] via-[#2f1c0d] to-[#1e0f06]',
    borderClass: 'border-amber-500/40 shadow-amber-900/25',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    primaryFeather: '#d97706', // Amber
    secondaryFeather: '#fbbf24', // Warm Gold
    accentColor: '#f59e0b',
    eyeRingColor: '#fde047',
    auraClass: 'bg-amber-500/30',
    headgear: 'flame-crown',
  },
  {
    tier: 4,
    name: 'Inferno Legend',
    badge: 'Tier 4 • Inferno Core 🔥🔥',
    minStreak: 14,
    bgGradient: 'from-[#2b0c0c] via-[#351010] to-[#1f0808]',
    borderClass: 'border-rose-500/40 shadow-rose-900/30',
    glowColor: 'rgba(244, 63, 94, 0.45)',
    primaryFeather: '#be123c', // Deep Crimson
    secondaryFeather: '#fb7185', // Fiery Rose
    accentColor: '#f43f5e',
    eyeRingColor: '#fda4af',
    auraClass: 'bg-rose-500/35',
    headgear: 'inferno',
  },
  {
    tier: 5,
    name: 'Mythic Ascendant',
    badge: 'Tier 5 • Mythic Celestial 👑✨',
    minStreak: 30,
    bgGradient: 'from-[#1f0d36] via-[#281146] to-[#190a2d]',
    borderClass: 'border-fuchsia-400/50 shadow-fuchsia-900/35',
    glowColor: 'rgba(217, 70, 239, 0.5)',
    primaryFeather: '#a21caf', // Cosmic Magenta
    secondaryFeather: '#f0abfc', // Prismatic Violet
    accentColor: '#e879f9',
    eyeRingColor: '#fef08a',
    auraClass: 'bg-gradient-to-tr from-fuchsia-500/30 via-purple-500/30 to-amber-400/30',
    headgear: 'celestial',
  },
];

export const InteractiveMascot: React.FC<InteractiveMascotProps> = ({ onGainXP, className = '' }) => {
  const [mood, setMood] = useState<MascotMood>('idle');
  const [speechText, setSpeechText] = useState("Hoot! Ready to dominate the leaderboards today?");
  const [chirpCount, setChirpCount] = useState(0);
  const [engagementScore, setEngagementScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nexus_mascot_engagement');
      return saved ? Math.min(100, Math.max(10, parseInt(saved, 10))) : 65;
    } catch (_) {
      return 65;
    }
  });

  // Current streak count from localStorage with live sync
  const [streakCount, setStreakCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nexus_daily_login_streak');
      if (saved) return JSON.parse(saved).count || 6;
    } catch (_) {}
    return 6;
  });

  const [overrideStreak, setOverrideStreak] = useState<number | null>(null);
  const activeStreak = overrideStreak !== null ? overrideStreak : streakCount;

  // 3D perspective tilt towards mouse cursor
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [floatingParticles, setFloatingParticles] = useState<
    Array<{ id: number; text: string; color: string; x: number }>
  >([]);
  const [recentEvent, setRecentEvent] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const moodTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync streak state from localStorage events
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('nexus_daily_login_streak');
        if (saved) {
          const parsed = JSON.parse(saved);
          setStreakCount(parsed.count || 6);
        }
      } catch (_) {}
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('nexus_streak_burst', handleStorageChange);
    window.addEventListener('nexus_streak_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('nexus_streak_burst', handleStorageChange);
      window.removeEventListener('nexus_streak_updated', handleStorageChange);
    };
  }, []);

  // Determine current streak tier
  const tierConfig = useMemo<StreakTierConfig>(() => {
    if (activeStreak >= 30) return STREAK_TIERS[4];
    if (activeStreak >= 14) return STREAK_TIERS[3];
    if (activeStreak >= 7) return STREAK_TIERS[2];
    if (activeStreak >= 3) return STREAK_TIERS[1];
    return STREAK_TIERS[0];
  }, [activeStreak]);

  // Determine Engagement category: 'drowsy' (0-34), 'active' (35-74), 'overcharged' (75-100)
  const engagementCategory = useMemo<'drowsy' | 'active' | 'overcharged'>(() => {
    if (engagementScore >= 75) return 'overcharged';
    if (engagementScore >= 35) return 'active';
    return 'drowsy';
  }, [engagementScore]);

  // Floating animation cycle speed based on engagement
  const floatDuration = useMemo(() => {
    if (engagementCategory === 'overcharged') return 2.2;
    if (engagementCategory === 'active') return 3.4;
    return 5.2; // Calm & drowsy
  }, [engagementCategory]);

  const floatAmplitude = useMemo(() => {
    if (engagementCategory === 'overcharged') return -16;
    if (engagementCategory === 'active') return -10;
    return -6;
  }, [engagementCategory]);

  // Track cursor position for smooth parallax head tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);
      setTilt({
        x: Math.max(-10, Math.min(10, -dy * 12)),
        y: Math.max(-14, Math.min(14, dx * 14)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // External event listeners (XP, task completion, streak burst)
  useEffect(() => {
    const handleXPGained = (e: any) => {
      const amount = e?.detail?.amount || 50;
      const source = e?.detail?.source || 'Activity';
      hapticMascotCelebration();
      setRecentEvent(`+${amount} XP from ${source}`);
      triggerReaction('celebrating', `Hooray! +${amount} XP gained! Your aura burns brighter! ✨`, `+${amount} XP`, tierConfig.accentColor);
      boostEngagement(10);
    };

    const handleTaskCompleted = (e: any) => {
      const title = e?.detail?.taskTitle || 'Mission';
      const xp = e?.detail?.xp || 100;
      SoundEffectEngine.play('task-complete');
      hapticMascotCelebration();
      setRecentEvent(`Cleared: ${title}`);
      triggerReaction('victory', `MISSION COMPLETE! You crushed "${title}"! 🏆`, `+${xp} XP`, '#10b981');
      boostEngagement(18);
    };

    const handleStreakClaim = () => {
      SoundEffectEngine.play('streak-burst');
      hapticMascotCelebration();
      setRecentEvent('Daily Streak Claimed 🔥');
      triggerReaction('celebrating', "Streak secured! The nexus flame is roaring at maximum heat!", "STREAK! 🔥", '#f97316');
      boostEngagement(25);
    };

    window.addEventListener('nexus_xp_gained', handleXPGained);
    window.addEventListener('nexus_task_completed', handleTaskCompleted);
    window.addEventListener('nexus_streak_burst', handleStreakClaim);

    return () => {
      window.removeEventListener('nexus_xp_gained', handleXPGained);
      window.removeEventListener('nexus_task_completed', handleTaskCompleted);
      window.removeEventListener('nexus_streak_burst', handleStreakClaim);
      if (moodTimeoutRef.current) clearTimeout(moodTimeoutRef.current);
    };
  }, [tierConfig]);

  // Adjust engagement score
  const boostEngagement = (amount: number) => {
    setEngagementScore(prev => {
      const next = Math.min(100, prev + amount);
      try {
        localStorage.setItem('nexus_mascot_engagement', next.toString());
      } catch (_) {}
      return next;
    });
  };

  // Trigger temporary reaction
  const triggerReaction = (
    newMood: MascotMood, 
    text: string, 
    particleText?: string, 
    particleColor: string = '#fbbf24'
  ) => {
    setMood(newMood);
    setSpeechText(text);

    if (particleText) {
      const newParticle = {
        id: Math.random(),
        text: particleText,
        color: particleColor,
        x: Math.random() * 50 - 25,
      };
      setFloatingParticles(prev => [...prev.slice(-3), newParticle]);
      setTimeout(() => {
        setFloatingParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, 1600);
    }

    if (moodTimeoutRef.current) clearTimeout(moodTimeoutRef.current);
    moodTimeoutRef.current = setTimeout(() => {
      setMood('idle');
      setRecentEvent(null);
    }, 2800);
  };

  // Primary click handler: triggers randomized cheerful chirps from SoundEffectEngine
  const handleMascotClick = () => {
    // 1. Trigger randomized Web Audio synthesized cheerful chirp via SoundEffectEngine
    const nextChirp = chirpCount + 1;
    setChirpCount(nextChirp);
    const chirpVariant = nextChirp % 4; // Cycle across 4 unique cheerful audio variations
    SoundEffectEngine.playMascotChirp(chirpVariant);

    // 2. Playful mobile haptic double-tap
    hapticMascotPoke();

    // 3. Cheerful companion dialogue quotes tailored to streak tier
    const quotes = [
      `*Chirp chirp!* Hoot! That tickles! Looking sharp at ${activeStreak} days streak!`,
      `*Tweet!* My feathers are humming with ${tierConfig.name} energy! Ready for a match?`,
      `*Trill-pip!* Your gamer stats are looking fire! Keep that streak roaring! 🔥`,
      `*Hoot hoot!* I'm tuned to your wavelength! Let's lock in and win today!`,
      `*Cheep!* Synergy level is ${engagementScore}%! We are virtually unstoppable!`,
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    const particleSymbols = ['🎶 Tweet!', '❤️ Hoot!', '✨ Chirp!', '🔥 Flame!'];
    const randomSymbol = particleSymbols[Math.floor(Math.random() * particleSymbols.length)];

    triggerReaction('chirping', quote, randomSymbol, tierConfig.accentColor);
    boostEngagement(6);
    if (onGainXP) onGainXP(5);
  };

  // Feed Power Berry action
  const handleFeedSnack = () => {
    SoundEffectEngine.play('button-click');
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-video-game-treasure-2066.mp3', 'system', 0.4);
    hapticMascotFeed();
    triggerReaction('eating', "Nom nom nom! Delicious power berry! Energy boosted to maximum! 🍓✨", "+15 Energy", '#a855f7');
    boostEngagement(18);
    if (onGainXP) onGainXP(15);
    window.dispatchEvent(new CustomEvent('nexus_xp_gained', { detail: { amount: 15, source: 'Power Berry' } }));
  };

  // Cheer drill action
  const handleCheerDrill = () => {
    SoundEffectEngine.play('button-click');
    const drills = ['Warmup Aim Lab Drill', 'Reflex Clutch Session', 'Tactical Intel Brief'];
    const chosen = drills[Math.floor(Math.random() * drills.length)];
    window.dispatchEvent(new CustomEvent('nexus_task_completed', { 
      detail: { taskTitle: chosen, xp: 120 } 
    }));
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br ${tierConfig.bgGradient} border ${tierConfig.borderClass} p-5 md:p-6 shadow-2xl transition-all duration-700 ${className}`}
    >
      {/* Dynamic Background Atmospheric Glow Radiance */}
      <div 
        className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-colors duration-700"
        style={{ background: tierConfig.glowColor }}
      />
      <div 
        className="absolute bottom-0 left-0 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-40 transition-colors duration-700"
        style={{ background: tierConfig.accentColor }}
      />

      {/* Header Bar: Companion Info, Streak Tier & Engagement Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
        
        {/* Left: Mascot Identity & Tier Badge */}
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-md transition-colors duration-500"
            style={{ 
              backgroundColor: `${tierConfig.accentColor}22`,
              borderColor: `${tierConfig.accentColor}55`,
              color: tierConfig.accentColor 
            }}
          >
            {tierConfig.headgear === 'celestial' ? (
              <Crown size={20} className="animate-pulse" />
            ) : tierConfig.headgear === 'inferno' || tierConfig.headgear === 'flame-crown' ? (
              <Flame size={20} className="animate-bounce" />
            ) : (
              <Sparkles size={20} className="animate-spin-slow" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white tracking-wide">Barnaby the Nexus Owl</h3>
              <span 
                className="text-[10px] font-black px-2.5 py-0.5 rounded-full border transition-all duration-500"
                style={{
                  backgroundColor: `${tierConfig.accentColor}25`,
                  borderColor: `${tierConfig.accentColor}60`,
                  color: '#ffffff'
                }}
              >
                {tierConfig.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <span>Dynamic Companion Mascot</span>
              <span>•</span>
              <span className="font-bold text-slate-300">Streak: {activeStreak} Days</span>
            </p>
          </div>
        </div>

        {/* Right: Engagement Level Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs font-bold backdrop-blur-md">
            <span 
              className={`w-2.5 h-2.5 rounded-full ${
                engagementCategory === 'overcharged' ? 'bg-amber-400 animate-ping' :
                engagementCategory === 'active' ? 'bg-emerald-400 animate-pulse' :
                'bg-sky-400'
              }`}
            />
            <span className="text-[11px] text-slate-300 capitalize font-black">
              {engagementCategory === 'overcharged' ? '⚡ OVERCHARGED' :
               engagementCategory === 'active' ? '✨ Attentive' :
               '💤 Rest Mode'} ({engagementScore}%)
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Mascot Interactive Stage + Speech & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* Mascot Character Interactive Stage (md:col-span-5) */}
        <div 
          ref={containerRef}
          onClick={handleMascotClick}
          className="md:col-span-5 flex flex-col items-center justify-center relative cursor-pointer select-none py-2 group"
          title="Click Barnaby to trigger cheerful chirps!"
        >
          {/* Reaction Aura Halo behind mascot */}
          <div 
            className={`absolute w-44 h-44 rounded-full blur-2xl pointer-events-none transition-all duration-500 ${
              mood === 'celebrating' || mood === 'victory'
                ? 'scale-125 opacity-90'
                : 'opacity-40 group-hover:opacity-75 group-hover:scale-110'
            }`}
            style={{ 
              backgroundColor: tierConfig.accentColor,
            }}
          />

          {/* Floating Particle Text on Click / Events */}
          <AnimatePresence>
            {floatingParticles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -45, scale: 1.15 }}
                exit={{ opacity: 0, y: -65 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute -top-3 z-30 font-black text-sm drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] pointer-events-none flex items-center gap-1"
                style={{ color: p.color, transform: `translateX(${p.x}px)` }}
              >
                {p.text}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* FRAMER MOTION: Floating Animated Character with Simple Hover & Click Physics */}
          <motion.div
            className="relative w-40 h-40 flex items-center justify-center"
            // Continuous Floating Animation adjusted by engagement level
            animate={{
              y: [0, floatAmplitude, 0],
              rotate: [0, 1.8, -1.8, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: floatDuration,
              ease: "easeInOut",
            }}
            // Simple Hover interactions using Framer Motion
            whileHover={{ 
              scale: 1.10, 
              y: floatAmplitude - 4,
              rotate: [0, -3, 3, 0],
              transition: { duration: 0.25 } 
            }}
            // Tap / Click physics
            whileTap={{ 
              scale: 0.90, 
              rotate: -5,
              transition: { duration: 0.1 } 
            }}
            style={{
              transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* SVG Interactive Mascot Character with Dynamic Colors & Headgear based on Streak & Engagement */}
            <svg viewBox="0 0 140 140" className="w-full h-full filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]">
              <defs>
                {/* Dynamic Feather Gradient */}
                <linearGradient id={`featherGrad-${tierConfig.tier}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={tierConfig.secondaryFeather} />
                  <stop offset="100%" stopColor={tierConfig.primaryFeather} />
                </linearGradient>
                {/* Belly Soft Gradient */}
                <linearGradient id="bellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef3c7" />
                  <stop offset="100%" stopColor="#fde68a" />
                </linearGradient>
                {/* Cosmic Halo Glow */}
                <radialGradient id="haloGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={tierConfig.accentColor} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={tierConfig.accentColor} stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Tier 5 / High Streak Celestial Halo Ring */}
              {tierConfig.tier >= 4 && (
                <ellipse 
                  cx="70" 
                  cy="26" 
                  rx="34" 
                  ry="9" 
                  fill="none" 
                  stroke={tierConfig.accentColor} 
                  strokeWidth="3.5" 
                  strokeDasharray={tierConfig.tier === 5 ? "4 3" : undefined}
                  className="animate-spin-slow opacity-90 filter drop-shadow-[0_0_8px_currentColor]"
                />
              )}

              {/* Wings (Flaps gently upon hover/chirp) */}
              {/* Left Wing */}
              <motion.path
                d="M32 72 C18 78 14 96 28 108 C34 100 38 88 40 76 Z"
                fill={`url(#featherGrad-${tierConfig.tier})`}
                stroke={tierConfig.primaryFeather}
                strokeWidth="1.5"
                animate={mood === 'chirping' ? { rotate: [0, -18, 0], x: [0, -4, 0] } : {}}
                transition={{ duration: 0.3 }}
              />
              {/* Right Wing */}
              <motion.path
                d="M108 72 C122 78 126 96 112 108 C106 100 102 88 100 76 Z"
                fill={`url(#featherGrad-${tierConfig.tier})`}
                stroke={tierConfig.primaryFeather}
                strokeWidth="1.5"
                animate={mood === 'chirping' ? { rotate: [0, 18, 0], x: [0, 4, 0] } : {}}
                transition={{ duration: 0.3 }}
              />

              {/* Mascot Body */}
              <ellipse 
                cx="70" 
                cy="82" 
                rx="42" 
                ry="44" 
                fill={`url(#featherGrad-${tierConfig.tier})`} 
                stroke={tierConfig.primaryFeather}
                strokeWidth="2"
              />

              {/* Belly Patch */}
              <ellipse cx="70" cy="88" rx="28" ry="32" fill="url(#bellyGrad)" />
              
              {/* Belly Feather Chevrons */}
              <path d="M62 82 Q70 88 78 82" stroke="#d97706" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M58 92 Q70 99 82 92" stroke="#d97706" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M64 102 Q70 107 76 102" stroke="#d97706" strokeWidth="2" fill="none" strokeLinecap="round" />

              {/* Head Feathery Ears / Tufts */}
              <polygon points="40,36 26,58 52,50" fill={tierConfig.primaryFeather} />
              <polygon points="100,36 88,50 114,58" fill={tierConfig.primaryFeather} />

              {/* Head Shape */}
              <ellipse 
                cx="70" 
                cy="58" 
                rx="36" 
                ry="32" 
                fill={`url(#featherGrad-${tierConfig.tier})`} 
                stroke={tierConfig.primaryFeather}
                strokeWidth="2"
              />

              {/* Dynamic Headgear Accessory based on Streak Tier */}
              {tierConfig.headgear === 'sprout' && (
                <g className="animate-bounce" style={{ transformOrigin: '70px 30px' }}>
                  <path d="M70 32 Q62 20 60 26 Q66 30 70 32" fill="#22c55e" />
                  <path d="M70 32 Q78 18 80 24 Q74 28 70 32" fill="#4ade80" />
                </g>
              )}

              {tierConfig.headgear === 'spark' && (
                <g className="animate-pulse" style={{ transformOrigin: '70px 24px' }}>
                  <polygon points="70,16 75,25 68,26 73,34 66,27 72,25" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
                </g>
              )}

              {tierConfig.headgear === 'flame-crown' && (
                <g style={{ transformOrigin: '70px 24px' }}>
                  <path d="M56 34 L62 18 L70 28 L78 16 L84 34 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
                  <circle cx="70" cy="20" r="3.5" fill="#ef4444" />
                </g>
              )}

              {tierConfig.headgear === 'inferno' && (
                <g style={{ transformOrigin: '70px 22px' }}>
                  <path d="M52 36 Q46 16 54 18 Q58 26 62 34 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
                  <path d="M88 36 Q94 16 86 18 Q82 26 78 34 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
                  <polygon points="62,34 70,14 78,34" fill="#f97316" />
                </g>
              )}

              {tierConfig.headgear === 'celestial' && (
                <g className="animate-pulse" style={{ transformOrigin: '70px 18px' }}>
                  <polygon points="54,30 62,14 70,24 78,12 86,30" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                  <circle cx="70" cy="14" r="3.5" fill="#e879f9" className="animate-ping" />
                  <circle cx="62" cy="16" r="2" fill="#38bdf8" />
                  <circle cx="78" cy="16" r="2" fill="#38bdf8" />
                </g>
              )}

              {/* Eye Discs with Tier Glow Outline */}
              <circle cx="54" cy="56" r="16" fill="#fef08a" stroke={tierConfig.eyeRingColor} strokeWidth="3" />
              <circle cx="86" cy="56" r="16" fill="#fef08a" stroke={tierConfig.eyeRingColor} strokeWidth="3" />

              {/* Animated Expressive Pupils (with smooth 3D tilt tracking) */}
              <circle 
                cx={54 + Math.max(-4, Math.min(4, tilt.y * 0.35))} 
                cy={56 - Math.max(-4, Math.min(4, tilt.x * 0.35))} 
                r={engagementCategory === 'overcharged' ? 8.5 : engagementCategory === 'active' ? 7.5 : 6} 
                fill="#0f172a" 
              />
              <circle 
                cx={86 + Math.max(-4, Math.min(4, tilt.y * 0.35))} 
                cy={56 - Math.max(-4, Math.min(4, tilt.x * 0.35))} 
                r={engagementCategory === 'overcharged' ? 8.5 : engagementCategory === 'active' ? 7.5 : 6} 
                fill="#0f172a" 
              />

              {/* Catchlight Highlights */}
              <circle 
                cx={52 + Math.max(-4, Math.min(4, tilt.y * 0.35))} 
                cy={53 - Math.max(-4, Math.min(4, tilt.x * 0.35))} 
                r="3" 
                fill="#ffffff" 
              />
              <circle 
                cx={84 + Math.max(-4, Math.min(4, tilt.y * 0.35))} 
                cy={53 - Math.max(-4, Math.min(4, tilt.x * 0.35))} 
                r="3" 
                fill="#ffffff" 
              />

              {/* Owl Beak (Opens when chirping) */}
              <motion.polygon 
                points={mood === 'chirping' ? "70,62 61,76 79,76" : "70,62 63,73 77,73"}
                fill="#f59e0b" 
                stroke="#b45309"
                strokeWidth="1.5"
                animate={mood === 'chirping' ? { scale: [1, 1.25, 1], y: [0, 2, 0] } : {}}
                transition={{ duration: 0.2 }}
              />

              {/* Owl Claws */}
              <ellipse cx="58" cy="122" rx="6" ry="3.5" fill="#f59e0b" />
              <ellipse cx="82" cy="122" rx="6" ry="3.5" fill="#f59e0b" />
            </svg>
          </motion.div>

          {/* Interactive Hint Callout */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="mt-2 text-center"
          >
            <span 
              className="text-[11px] font-black transition-colors duration-300 flex items-center gap-1.5 justify-center"
              style={{ color: tierConfig.accentColor }}
            >
              <Music size={12} className="animate-bounce" />
              <span>Click Barnaby for Cheerful Chirps!</span>
            </span>
          </motion.div>
        </div>

        {/* Speech Dialogue & Interactive Controls (md:col-span-7) */}
        <div className="md:col-span-7 space-y-4">
          
          {/* Dynamic Dialogue Speech Bubble with Framer Motion */}
          <motion.div 
            key={speechText}
            initial={{ opacity: 0, scale: 0.94, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="relative p-4 rounded-2xl bg-[#161420]/90 border border-white/10 text-white shadow-xl backdrop-blur-md"
          >
            {/* Triangular pointer */}
            <div className="hidden md:block absolute -left-2 top-6 w-3 h-3 bg-[#161420] border-l border-b border-white/10 rotate-45" />

            <div className="flex items-start gap-3">
              <div 
                className="p-1.5 rounded-xl shrink-0 mt-0.5"
                style={{ backgroundColor: `${tierConfig.accentColor}25`, color: tierConfig.accentColor }}
              >
                <MessageSquare size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-100 leading-snug">
                  "{speechText}"
                </p>

                {recentEvent && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                    <Zap size={12} className="fill-amber-400 shrink-0" />
                    <span className="truncate">Intel: {recentEvent}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Companion Engagement Progress Bar */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2 backdrop-blur-md">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Flame size={14} style={{ color: tierConfig.accentColor }} />
                <span>Companion Synergy</span>
              </span>
              <span className="font-extrabold text-white">
                {engagementScore}% • <span style={{ color: tierConfig.accentColor }}>{tierConfig.name}</span>
              </span>
            </div>
            
            {/* Energy Track */}
            <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/5">
              <motion.div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${engagementScore}%`,
                  background: `linear-gradient(90deg, ${tierConfig.primaryFeather}, ${tierConfig.accentColor}, #fde047)`
                }}
              />
            </div>
          </div>

          {/* Action Triggers Grid */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            
            {/* Pet / Chirp button */}
            <motion.button 
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleMascotClick}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/40 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <Heart size={14} className="text-pink-400 fill-pink-400/30" />
              <span>Pet & Chirp</span>
            </motion.button>

            {/* Feed Berry button */}
            <motion.button 
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleFeedSnack}
              className="px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/60 text-purple-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <Zap size={14} className="text-purple-400 fill-purple-400/30" />
              <span>Feed Berry (+18% Synergy)</span>
            </motion.button>

            {/* Cheer Drill */}
            <motion.button 
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleCheerDrill}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>Trigger Cheer Drill</span>
            </motion.button>

          </div>

          {/* Streak Tier Demo Switcher: Instantly test all 5 visual states & animations */}
          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 font-bold mr-1">Preview Streak Tier:</span>
            {[
              { days: 1, label: '1d (T1)' },
              { days: 5, label: '5d (T2)' },
              { days: 7, label: '7d (T3)' },
              { days: 15, label: '15d (T4)' },
              { days: 30, label: '30d (T5)' },
            ].map(({ days, label }) => (
              <button
                key={days}
                onClick={() => {
                  SoundEffectEngine.play('button-click');
                  setOverrideStreak(days);
                  triggerReaction(
                    'celebrating', 
                    `Visual state shifted to ${label}! Notice plumage, crown accessories and color gradients!`, 
                    `Tier Preview!`, 
                    '#fbbf24'
                  );
                }}
                className={`px-2 py-0.5 rounded-lg font-bold border transition-all ${
                  activeStreak === days || (overrideStreak === null && tierConfig.minStreak === days)
                    ? 'bg-white/20 text-white border-white/40 shadow-sm'
                    : 'bg-black/30 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}

            {overrideStreak !== null && (
              <button
                onClick={() => {
                  SoundEffectEngine.play('button-click');
                  setOverrideStreak(null);
                }}
                className="px-2 py-0.5 rounded-lg text-slate-400 hover:text-white flex items-center gap-1 font-bold ml-1"
                title="Reset to current actual streak"
              >
                <RotateCcw size={11} /> Reset
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default InteractiveMascot;

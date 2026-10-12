import React, { useState, useEffect, useRef } from 'react';
import { Flame, Sparkles } from 'lucide-react';
import { hapticStreakIncrement } from '../services/haptics';
import { playCategorizedAudio } from '../services/audioManager';
import { SoundEffectEngine } from '../services/SoundEffectEngine';

interface HeaderStreakPillProps {
  streakCount: number;
  onClick: () => void;
}

interface Particle {
  id: number;
  dx: number; // translation in px
  dy: number;
  size: number;
  color: string;
  delay: number;
}

export const HeaderStreakPill: React.FC<HeaderStreakPillProps> = ({ streakCount, onClick }) => {
  const [isBursting, setIsBursting] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const prevCountRef = useRef(streakCount);
  const burstTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerBurst = () => {
    // Generate radial flame spark particles
    const particleColors = ['#fbbf24', '#f59e0b', '#f97316', '#ef4444', '#fde047'];
    const count = 9;
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (i * (360 / count) + (Math.random() * 20 - 10)) * (Math.PI / 180);
      const distance = 22 + Math.random() * 16; // 22px to 38px
      newParticles.push({
        id: Math.random(),
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        size: 3.5 + Math.random() * 3, // 3.5px to 6.5px
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        delay: Math.random() * 0.08,
      });
    }

    setParticles(newParticles);
    setIsBursting(true);

    // Physical haptic vibration feedback for mobile devices
    hapticStreakIncrement();

    // Centralized Web Audio API streak-burst sound effect
    SoundEffectEngine.play('streak-burst');
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'system', 0.4);

    if (burstTimeoutRef.current) clearTimeout(burstTimeoutRef.current);
    // Reset after animation ends
    burstTimeoutRef.current = setTimeout(() => {
      setIsBursting(false);
      setParticles([]);
      burstTimeoutRef.current = null;
    }, 1200);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (burstTimeoutRef.current) clearTimeout(burstTimeoutRef.current);
    };
  }, []);

  // Detect when streak count increments
  useEffect(() => {
    if (streakCount > prevCountRef.current) {
      triggerBurst();
    }
    prevCountRef.current = streakCount;
  }, [streakCount]);

  // Listen to global streak burst event (e.g. from check-in claim button)
  useEffect(() => {
    const handleBurstEvent = () => {
      triggerBurst();
    };
    window.addEventListener('nexus_streak_burst', handleBurstEvent);
    return () => {
      window.removeEventListener('nexus_streak_burst', handleBurstEvent);
    };
  }, []);

  return (
    <button 
      onClick={onClick}
      title={`Current Daily Login Streak: ${streakCount} days (Click to view Rewards & Milestones)`}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-300 active:scale-95 group overflow-visible ${
        isBursting 
          ? 'bg-gradient-to-r from-orange-500/30 via-amber-500/25 to-red-500/20 border-orange-400 text-amber-300 shadow-[0_0_20px_rgba(249,115,22,0.6)] ring-2 ring-orange-500/40 scale-105' 
          : 'bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent border-orange-500/30 hover:border-orange-500/50 text-orange-400 hover:text-orange-300 shadow-sm shadow-orange-500/10'
      }`}
    >
      {/* Flame Icon Container with Burst Effects */}
      <div className="relative flex items-center justify-center shrink-0">
        
        {/* Shockwave Radial Wave on Burst */}
        {isBursting && (
          <span className="absolute w-7 h-7 rounded-full bg-gradient-to-r from-orange-500/50 to-amber-400/50 pointer-events-none animate-flameShockwave -z-10"></span>
        )}

        {/* Emitted Fire Embers / Particles */}
        {isBursting && particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full pointer-events-none animate-emberBurst z-20"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 8px ${p.color}`,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              animationDelay: `${p.delay}s`,
            } as React.CSSProperties}
          />
        ))}

        {/* Floating +1 Text Bubble on Burst */}
        {isBursting && (
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-black text-[11px] text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.9)] pointer-events-none animate-floatUp z-30 select-none">
            +1🔥
          </span>
        )}

        {/* Main Flame Icon with Burst Animation */}
        <Flame 
          size={16} 
          className={`transition-all duration-300 ${
            isBursting 
              ? 'text-amber-200 fill-amber-400 scale-135 drop-shadow-[0_0_12px_rgba(245,158,11,1)] animate-flameBurst' 
              : 'text-amber-400 fill-orange-500 group-hover:scale-110 animate-pulse'
          }`} 
        />
      </div>

      {/* Streak Number with Glow on Increment */}
      <span className={`text-xs font-black tracking-tight transition-all duration-300 ${
        isBursting 
          ? 'text-amber-200 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]' 
          : 'text-orange-400 group-hover:text-orange-300'
      }`}>
        {streakCount}d
      </span>

      {/* Embedded CSS for Flame Micro-Interaction */}
      <style>{`
        @keyframes flameBurst {
          0% {
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 0 4px rgba(249, 115, 22, 0.6));
          }
          30% {
            transform: scale(1.45) rotate(-8deg);
            filter: drop-shadow(0 0 16px rgba(251, 191, 36, 1));
          }
          60% {
            transform: scale(1.25) rotate(6deg);
            filter: drop-shadow(0 0 12px rgba(249, 115, 22, 0.9));
          }
          100% {
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 0 6px rgba(249, 115, 22, 0.7));
          }
        }
        .animate-flameBurst {
          animation: flameBurst 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes emberBurst {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          70% {
            opacity: 0.9;
          }
          100% {
            transform: translate(var(--dx), var(--dy)) scale(0.1);
            opacity: 0;
          }
        }
        .animate-emberBurst {
          animation: emberBurst 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes flameShockwave {
          0% {
            transform: scale(0.6);
            opacity: 0.9;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
        .animate-flameShockwave {
          animation: flameShockwave 0.7s ease-out forwards;
        }

        @keyframes floatUp {
          0% {
            transform: translate(-50%, 0) scale(0.8);
            opacity: 0;
          }
          25% {
            transform: translate(-50%, -4px) scale(1.15);
            opacity: 1;
          }
          75% {
            transform: translate(-50%, -12px) scale(1);
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -18px) scale(0.9);
            opacity: 0;
          }
        }
        .animate-floatUp {
          animation: floatUp 0.9s ease-out forwards;
        }
      `}</style>
    </button>
  );
};

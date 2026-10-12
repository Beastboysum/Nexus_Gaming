import React from 'react';
import { MicOff, Headphones } from 'lucide-react';

export interface VoiceAvatarWithGlowingRingProps {
  avatar: string;
  username: string;
  isSpeaking: boolean;
  volumeLevel?: number; // 0 to 100
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'rounded' | 'circle';
  isMuted?: boolean;
  isDeafened?: boolean;
  ringColor?: string; // default emerald green #22c55e
  showAuraWaves?: boolean;
  className?: string;
  statusBadge?: 'online' | 'idle' | 'dnd' | 'offline';
}

const SIZE_MAP = {
  xs: { box: 'w-6 h-6', img: 'w-6 h-6', badge: 'w-2 h-2', radius: 'rounded-lg' },
  sm: { box: 'w-8 h-8', img: 'w-8 h-8', badge: 'w-2.5 h-2.5', radius: 'rounded-xl' },
  md: { box: 'w-11 h-11', img: 'w-11 h-11', badge: 'w-3 h-3', radius: 'rounded-2xl' },
  lg: { box: 'w-16 h-16', img: 'w-16 h-16', badge: 'w-3.5 h-3.5', radius: 'rounded-2xl' },
  xl: { box: 'w-24 h-24', img: 'w-24 h-24', badge: 'w-5 h-5', radius: 'rounded-3xl' },
  '2xl': { box: 'w-32 h-32', img: 'w-32 h-32', badge: 'w-6 h-6', radius: 'rounded-3xl' },
};

export const VoiceAvatarWithGlowingRing: React.FC<VoiceAvatarWithGlowingRingProps> = ({
  avatar,
  username,
  isSpeaking,
  volumeLevel = 0,
  size = 'md',
  shape = 'rounded',
  isMuted = false,
  isDeafened = false,
  ringColor = '#22c55e', // Discord signature speaking green
  showAuraWaves = true,
  className = '',
  statusBadge,
}) => {
  // If muted, speaking is completely suppressed
  const activelySpeaking = isSpeaking && !isMuted && volumeLevel > 2;

  // Normalized volume ratio from 0 to 1
  const rawVol = Math.min(100, Math.max(0, volumeLevel));
  const volRatio = activelySpeaking ? Math.min(1, Math.max(0.12, rawVol / 100)) : 0;

  const currentSize = SIZE_MAP[size] || SIZE_MAP.md;
  const borderRadius = shape === 'circle' ? 'rounded-full' : currentSize.radius;

  // Dynamic calculations reacting to volume levels:
  // Higher volume = wider spread, brighter blur, slight avatar scale expansion
  const glowBlur = Math.round(6 + volRatio * 20); // 6px to 26px
  const glowSpread = Math.round(2 + volRatio * 10); // 2px to 12px
  const glowAlpha = 0.4 + volRatio * 0.55; // 0.40 to 0.95
  const ringScale = 1 + volRatio * 0.06; // 1.00 to 1.06

  // Dynamic outer aura waves expanding on loud volume
  const wave1Scale = 1 + volRatio * 0.22;
  const wave1Opacity = volRatio * 0.55;
  const wave2Scale = 1 + volRatio * 0.45;
  const wave2Opacity = volRatio * 0.32;

  // Box shadow glow
  const dynamicBoxShadow = activelySpeaking
    ? `0 0 ${glowBlur}px ${glowSpread}px rgba(34, 197, 94, ${glowAlpha.toFixed(2)}), 0 0 ${Math.round(glowBlur * 1.5)}px ${Math.round(glowSpread * 0.7)}px rgba(16, 185, 129, ${(glowAlpha * 0.6).toFixed(2)})`
    : 'none';

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      
      {/* Dynamic Outer Aura Wave 2 (Expands furthest on peaks) */}
      {showAuraWaves && activelySpeaking && volRatio > 0.35 && (
        <div
          className={`absolute inset-0 pointer-events-none transition-all duration-150 ease-out border-2 ${borderRadius}`}
          style={{
            transform: `scale(${wave2Scale})`,
            opacity: wave2Opacity,
            borderColor: ringColor,
            filter: 'blur(2px)',
          }}
        />
      )}

      {/* Dynamic Outer Aura Wave 1 (Active during speaking) */}
      {showAuraWaves && activelySpeaking && (
        <div
          className={`absolute inset-0 pointer-events-none transition-all duration-100 ease-out border-2 ${borderRadius}`}
          style={{
            transform: `scale(${wave1Scale})`,
            opacity: wave1Opacity,
            borderColor: ringColor,
            boxShadow: `0 0 12px 2px ${ringColor}60`,
          }}
        />
      )}

      {/* Core Glowing Ring Container around Avatar */}
      <div
        className={`relative ${currentSize.box} transition-all duration-100 ease-out ${borderRadius} flex items-center justify-center`}
        style={{
          transform: `scale(${ringScale})`,
          boxShadow: dynamicBoxShadow,
        }}
      >
        {/* Border Ring (Glowing when speaking) */}
        <div
          className={`absolute -inset-[3px] pointer-events-none transition-all duration-100 ${borderRadius}`}
          style={{
            borderWidth: activelySpeaking ? (volRatio > 0.6 ? '3px' : '2.5px') : '1.5px',
            borderColor: activelySpeaking ? ringColor : 'rgba(255, 255, 255, 0.12)',
            backgroundColor: activelySpeaking ? `${ringColor}12` : 'transparent',
          }}
        />

        {/* Avatar Image */}
        <img
          src={avatar}
          alt={username}
          className={`w-full h-full object-cover ${borderRadius} relative z-10 transition-transform duration-100`}
        />

        {/* Status Indicator Badge (online/idle/dnd) */}
        {statusBadge && (
          <div
            className={`absolute bottom-0 right-0 z-20 ${currentSize.badge} rounded-full border-2 border-[#121218] ${
              statusBadge === 'online'
                ? 'bg-emerald-500'
                : statusBadge === 'idle'
                ? 'bg-amber-500'
                : statusBadge === 'dnd'
                ? 'bg-rose-500'
                : 'bg-slate-500'
            }`}
          />
        )}

        {/* Microphone Mute Overlay Badge */}
        {isMuted && (
          <div
            title="Muted"
            className="absolute -bottom-1 -right-1 z-20 p-0.5 rounded-full bg-rose-600 text-white border-2 border-[#121218] shadow-md flex items-center justify-center animate-fadeIn"
          >
            <MicOff size={size === 'xs' || size === 'sm' ? 10 : size === 'md' ? 12 : 14} />
          </div>
        )}

        {/* Deafen Overlay Badge */}
        {isDeafened && (
          <div
            title="Deafened"
            className="absolute -top-1 -right-1 z-20 p-0.5 rounded-full bg-rose-600 text-white border-2 border-[#121218] shadow-md flex items-center justify-center animate-fadeIn"
          >
            <Headphones size={size === 'xs' || size === 'sm' ? 10 : size === 'md' ? 12 : 14} />
          </div>
        )}
      </div>

    </div>
  );
};

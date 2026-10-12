import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Volume1, Play, Pause, Activity } from 'lucide-react';
import { playCategorizedAudio } from '../services/audioManager';
import { Slider } from './Slider';

interface AudioVolumeSliderProps {
  label: string;
  category: 'notifications' | 'calls' | 'system';
  value: number; // 0 to 100
  onChange: (newValue: number) => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor?: 'purple' | 'amber' | 'emerald' | 'blue' | 'rose';
  previewSoundUrl?: string;
  description?: string;
  disabled?: boolean;
}

export const AudioVolumeSlider: React.FC<AudioVolumeSliderProps> = ({
  label,
  category,
  value,
  onChange,
  icon: Icon,
  accentColor = 'purple',
  previewSoundUrl,
  description,
  disabled = false,
}) => {
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const audioInstanceRef = useRef<HTMLAudioElement | null>(null);

  // Color schemes for badge & icons
  const colorMap = {
    purple: {
      text: 'text-purple-400',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    amber: {
      text: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    emerald: {
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    blue: {
      text: 'text-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    rose: {
      text: 'text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
  }[accentColor];

  const toggleMute = () => {
    if (disabled) return;
    if (value > 0) {
      onChange(0);
    } else {
      onChange(70);
    }
  };

  const handleTestSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!previewSoundUrl || disabled) return;

    if (audioInstanceRef.current) {
      audioInstanceRef.current.pause();
      audioInstanceRef.current = null;
      setIsPlayingTest(false);
      return;
    }

    setIsPlayingTest(true);
    const audio = playCategorizedAudio(previewSoundUrl, category, 1.0);
    if (audio) {
      audioInstanceRef.current = audio;
      audio.onended = () => {
        setIsPlayingTest(false);
        audioInstanceRef.current = null;
      };
      audio.onerror = () => {
        setIsPlayingTest(false);
        audioInstanceRef.current = null;
      };
    } else {
      setIsPlayingTest(false);
    }
  };

  const VolumeStatusIcon = value === 0 ? VolumeX : value < 50 ? Volume1 : Volume2;

  return (
    <div className={`p-4 rounded-2xl bg-black/30 border border-white/5 transition-all duration-200 ${disabled ? 'opacity-40 pointer-events-none' : 'hover:border-white/10'}`}>
      {/* Header Info Row */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 ${colorMap.text}`}>
            <Icon size={16} />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white truncate flex items-center gap-2">
              <span>{label}</span>
            </h4>
            {description && (
              <p className="text-[11px] text-slate-400 truncate">{description}</p>
            )}
          </div>
        </div>

        {/* Right Action Cluster: Percentage Badge, Mute Button, Test Audio */}
        <div className="flex items-center gap-1.5 shrink-0">
          {previewSoundUrl && (
            <button
              type="button"
              onClick={handleTestSound}
              title="Test volume audio preview"
              className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 active:scale-95 ${
                isPlayingTest
                  ? 'bg-purple-600 text-white border-purple-400 animate-pulse'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
              }`}
            >
              {isPlayingTest ? (
                <>
                  <Activity size={12} className="animate-spin-slow" />
                  <span className="text-[10px]">Playing</span>
                </>
              ) : (
                <>
                  <Play size={10} fill="currentColor" />
                  <span className="text-[10px]">Test</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={toggleMute}
            title={value === 0 ? 'Unmute' : 'Mute'}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <VolumeStatusIcon size={15} className={value === 0 ? 'text-red-400' : ''} />
          </button>

          <span className={`px-2 py-0.5 rounded-md text-xs font-black tracking-tight border min-w-[42px] text-center ${colorMap.badge}`}>
            {value}%
          </span>
        </div>
      </div>

      {/* Reusable Custom Slider Component */}
      <Slider
        value={value}
        onChange={onChange}
        min={0}
        max={100}
        step={1}
        disabled={disabled}
        accentColor={accentColor}
        showTicks={true}
        aria-label={`${label} level`}
      />
    </div>
  );
};
export default AudioVolumeSlider;

import React, { useRef, useState, useCallback, useEffect } from 'react';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  label?: string;
  description?: string;
  showValue?: boolean;
  showTicks?: boolean;
  tickSteps?: number[];
  unit?: string;
  accentColor?: 'purple' | 'amber' | 'emerald' | 'blue' | 'rose';
  className?: string;
  'aria-label'?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  onChangeEnd,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  label,
  description,
  showValue = false,
  showTicks = true,
  tickSteps,
  unit = '%',
  accentColor = 'purple',
  className = '',
  'aria-label': ariaLabel,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);

  // Clamped percentage 0 - 100%
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const colorStyles = {
    purple: {
      track: 'from-purple-600 to-indigo-500',
      glow: 'shadow-purple-500/40',
      thumb: 'border-purple-400 bg-purple-500',
      text: 'text-purple-400',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      focus: 'focus:ring-purple-500/50',
    },
    amber: {
      track: 'from-amber-500 to-orange-500',
      glow: 'shadow-amber-500/40',
      thumb: 'border-amber-400 bg-amber-500',
      text: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      focus: 'focus:ring-amber-500/50',
    },
    emerald: {
      track: 'from-emerald-500 to-teal-400',
      glow: 'shadow-emerald-500/40',
      thumb: 'border-emerald-400 bg-emerald-500',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      focus: 'focus:ring-emerald-500/50',
    },
    blue: {
      track: 'from-cyan-500 to-blue-500',
      glow: 'shadow-cyan-500/40',
      thumb: 'border-cyan-400 bg-cyan-500',
      text: 'text-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      focus: 'focus:ring-cyan-500/50',
    },
    rose: {
      track: 'from-rose-500 to-pink-500',
      glow: 'shadow-rose-500/40',
      thumb: 'border-rose-400 bg-rose-500',
      text: 'text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      focus: 'focus:ring-rose-500/50',
    },
  }[accentColor];

  const updateFromPointer = useCallback((clientX: number) => {
    if (!trackRef.current || disabled) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawVal = min + ratio * (max - min);
    
    // Snap to step
    const steppedVal = Math.round((rawVal - min) / step) * step + min;
    const finalVal = Math.max(min, Math.min(max, steppedVal));
    
    onChange(finalVal);
  }, [min, max, step, disabled, onChange]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current && !disabled) {
      updateFromPointer(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
      if (onChangeEnd) {
        onChangeEnd(value);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    let nextVal = value;
    const largeStep = (max - min) / 10;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        nextVal = Math.min(max, value + step);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        nextVal = Math.max(min, value - step);
        break;
      case 'PageUp':
        nextVal = Math.min(max, value + largeStep);
        break;
      case 'PageDown':
        nextVal = Math.max(min, value - largeStep);
        break;
      case 'Home':
        nextVal = min;
        break;
      case 'End':
        nextVal = max;
        break;
      default:
        return;
    }

    e.preventDefault();
    onChange(Math.round(nextVal));
    if (onChangeEnd) onChangeEnd(Math.round(nextVal));
  };

  const defaultTicks = [0, 25, 50, 75, 100];
  const ticksToRender = tickSteps || defaultTicks;

  return (
    <div className={`w-full select-none ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}>
      {/* Optional Top Label & Value Display */}
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs mb-1.5">
          {label && (
            <div className="font-semibold text-slate-300">
              {label}
              {description && <span className="block text-[11px] text-slate-400 font-normal">{description}</span>}
            </div>
          )}
          {showValue && (
            <span className={`px-2 py-0.5 rounded-md text-xs font-black tracking-tight border min-w-[40px] text-center ${colorStyles.badge}`}>
              {value}{unit}
            </span>
          )}
        </div>
      )}

      {/* Interactive Slider Track Container */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={ariaLabel || label || 'Volume slider'}
        aria-disabled={disabled}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative h-8 flex items-center cursor-pointer touch-none outline-none group ${disabled ? 'pointer-events-none' : ''}`}
      >
        {/* Background Track Rail */}
        <div className="w-full h-2.5 rounded-full bg-slate-800/90 border border-white/5 overflow-hidden relative shadow-inner">
          {/* Active Gradient Fill */}
          <div
            className={`h-full rounded-full bg-gradient-to-r ${colorStyles.track} transition-[width] duration-75`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Custom Draggable Thumb Handle */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 ${colorStyles.thumb} shadow-lg ${colorStyles.glow} transition-transform duration-75 ${
            isDragging ? 'scale-125' : 'group-hover:scale-110'
          } flex items-center justify-center pointer-events-none`}
          style={{ left: `${percentage}%` }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
        </div>
      </div>

      {/* Optional Discrete Tick Marks */}
      {showTicks && (
        <div className="flex justify-between items-center px-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider select-none">
          {ticksToRender.map((tick) => (
            <span
              key={tick}
              onClick={() => !disabled && onChange(tick)}
              className={`cursor-pointer transition-colors ${
                Math.abs(value - tick) < 5 ? 'text-white font-extrabold' : 'hover:text-slate-300'
              }`}
            >
              {tick}{unit}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Slider;

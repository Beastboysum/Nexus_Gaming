import React, { useState, useEffect } from 'react';
import { Sparkles, Baby, ShieldCheck, Gamepad2, Rocket, Star } from 'lucide-react';
import { isJuniorModeEnabled, setJuniorMode } from '../services/juniorModeContext';

interface JuniorModeToggleProps {
  className?: string;
  showHelpTooltip?: boolean;
}

export const JuniorModeToggle: React.FC<JuniorModeToggleProps> = ({ className = '', showHelpTooltip = false }) => {
  const [enabled, setEnabled] = useState<boolean>(isJuniorModeEnabled());
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.enabled !== undefined) {
        setEnabled(e.detail.enabled);
      } else {
        setEnabled(isJuniorModeEnabled());
      }
    };
    window.addEventListener('nexus_junior_mode_changed', handleUpdate);
    return () => window.removeEventListener('nexus_junior_mode_changed', handleUpdate);
  }, []);

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    setJuniorMode(next);
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        onClick={handleToggle}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        type="button"
        title="Toggle 10-Year-Old Friendly Junior Mode"
        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs transition-all duration-300 shadow-md select-none active:scale-95 ${
          enabled
            ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-white shadow-orange-500/30 ring-2 ring-amber-300/60 animate-pulse-gentle'
            : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-purple-500/40'
        }`}
      >
        {/* Playful Icon */}
        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform ${
          enabled ? 'bg-white/20 scale-110 text-amber-200 animate-spin-slow' : 'text-slate-400 group-hover:text-amber-400'
        }`}>
          {enabled ? <Rocket size={13} className="text-white fill-white" /> : <Star size={13} />}
        </div>

        {/* Text */}
        <span className="tracking-wide">
          Junior Mode
        </span>

        {/* Status Pill Badge */}
        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
          enabled
            ? 'bg-white text-orange-600 shadow-sm'
            : 'bg-white/10 text-slate-400'
        }`}>
          {enabled ? 'ON ✨' : 'OFF'}
        </span>
      </button>

      {/* Friendly Tooltip */}
      {(showTooltip || showHelpTooltip) && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-2.5 rounded-2xl bg-[#1e1b2e] border border-amber-400/40 shadow-2xl text-[11px] text-slate-200 z-50 pointer-events-none animate-fadeIn backdrop-blur-md">
          <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
            <Sparkles size={13} />
            <span>10-Year-Old Friendly UI</span>
          </div>
          <p className="leading-snug text-slate-300">
            {enabled
              ? 'Active! Big kid-friendly buttons, safe gaming videos, and simplified controls.'
              : 'Turn on for extra-large buttons, easy navigation, and curated family games.'}
          </p>
        </div>
      )}

      <style>{`
        @keyframes pulseGentle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-pulse-gentle {
          animation: pulseGentle 3s infinite ease-in-out;
        }
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

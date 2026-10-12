import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { playCategorizedAudio } from '../services/audioManager';

interface LampSwitchProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export const LampSwitch: React.FC<LampSwitchProps> = ({ isDark, toggleTheme }) => {
  const [isPulling, setIsPulling] = useState(false);

  const handlePull = () => {
    setIsPulling(true);
    // Play light switch pull sound
    playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-light-switch-pull-2579.mp3', 'system', 0.5);

    setTimeout(() => {
      toggleTheme();
      setIsPulling(false);
    }, 300);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-inner transition-colors duration-500">
      <h3 className="mb-4 text-xl font-bold text-slate-700 dark:text-slate-200">Ambient Lighting</h3>
      <div className="relative h-64 w-32 flex justify-center">
        {/* Lamp Cord Base */}
        <div className="absolute top-0 w-1 h-32 bg-gray-400 dark:bg-gray-600 origin-top transition-transform duration-300"
             style={{ transform: isPulling ? 'scaleY(1.1)' : 'scaleY(1)' }}></div>
        
        {/* Pull Handle */}
        <button
          onClick={handlePull}
          className={`absolute top-32 -ml-[2px] w-8 h-8 rounded-full shadow-lg flex items-center justify-center
            transition-all duration-300 z-10 hover:scale-110 active:scale-90
            ${isDark ? 'bg-yellow-400 shadow-yellow-400/50' : 'bg-slate-700 shadow-slate-900/50'}
            ${isPulling ? 'translate-y-4' : 'translate-y-0'}
          `}
        >
          {isDark ? <Moon size={16} className="text-white" /> : <Sun size={16} className="text-yellow-300" />}
        </button>

        {/* Light Cone Effect (CSS) */}
        {isDark ? null : (
             <div className="absolute top-10 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
        )}
      </div>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Pull to switch mode</p>
    </div>
  );
};

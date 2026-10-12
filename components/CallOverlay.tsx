import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { User } from '../types';
import { playCallAcceptedSound, playCallDeclinedSound } from '../services/audioManager';

interface CallOverlayProps {
  status: 'incoming' | 'outgoing';
  user: User | null;
  onAccept?: () => void;
  onDecline: () => void;
}

export const CallOverlay: React.FC<CallOverlayProps> = ({ status, user, onAccept, onDecline }) => {
  const [isEnding, setIsEnding] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (status === 'incoming' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 800]);
        const vibInterval = setInterval(() => {
          navigator.vibrate([200, 100, 200, 800]);
        }, 2000);
        return () => {
          clearInterval(vibInterval);
          navigator.vibrate(0);
        };
      } catch (_) {}
    }
  }, [status]);

  if (!user) return null;

  const handleDecline = () => {
    setIsEnding(true);
    playCallDeclinedSound();
    // Wait for animation to finish before triggering the actual logic
    setTimeout(() => {
        onDecline();
    }, 400); 
  };

  const handleAccept = () => {
    if (onAccept) {
        setIsAccepting(true);
        playCallAcceptedSound();
        setTimeout(() => {
            onAccept();
        }, 400);
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl transition-all duration-500 ${isEnding ? 'opacity-0 pointer-events-none' : 'animate-fadeIn opacity-100'}`}>
      {/* Background Pulse Effect */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-300 ${isEnding || isAccepting ? 'opacity-0' : 'opacity-100'}`}>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className={`flex flex-col items-center z-10 w-full max-w-md p-6 transition-all duration-500 ease-in-out transform ${isEnding ? 'scale-75 opacity-0 translate-y-10' : isAccepting ? 'scale-150 opacity-0' : 'scale-100'}`}>
        
        {/* Avatar Area */}
        <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-purple-500 to-pink-500 shadow-[0_0_50px_rgba(168,85,247,0.4)] relative">
                <img src={user.avatar} className="w-full h-full rounded-full object-cover border-4 border-black" alt={user.username} />
                
                {/* Ripples - Only animate if not interacting */}
                {!isEnding && !isAccepting && (
                    <>
                        <div className="absolute inset-0 rounded-full border-2 border-purple-500/50 animate-ping"></div>
                        <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-ping animation-delay-500"></div>
                    </>
                )}
            </div>
        </div>

        {/* Text Info */}
        <h2 className="text-3xl font-black text-white mb-2">{user.username}</h2>
        <p className={`text-purple-300 font-medium text-lg mb-12 ${!isEnding && !isAccepting ? 'animate-pulse' : ''}`}>
            {status === 'incoming' ? 'Incoming Call...' : 'Calling...'}
        </p>

        {/* Controls */}
        <div className="flex items-center gap-12">
            {status === 'incoming' ? (
                <>
                    {/* Decline */}
                    <button 
                        onClick={handleDecline}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg shadow-red-500/30 group-active:scale-95">
                            <PhoneOff size={32} fill="currentColor" className="text-white" />
                        </div>
                        <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">Decline</span>
                    </button>

                    {/* Accept */}
                    <button 
                        onClick={handleAccept}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg shadow-green-500/30 animate-bounce group-active:scale-95 group-hover:animate-none">
                            <Phone size={32} fill="currentColor" className="text-white" />
                        </div>
                        <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">Accept</span>
                    </button>
                </>
            ) : (
                <>
                    {/* Cancel Outgoing */}
                    <button 
                        onClick={handleDecline}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg shadow-red-500/30 group-active:scale-95">
                            <PhoneOff size={32} fill="currentColor" className="text-white" />
                        </div>
                        <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">End Call</span>
                    </button>
                </>
            )}
        </div>
      </div>
      
      <style>{`
        .animation-delay-500 {
            animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
};
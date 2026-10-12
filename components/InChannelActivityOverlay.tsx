import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Wifi, 
  Mic, 
  MicOff, 
  Radio, 
  Activity, 
  ChevronUp, 
  ChevronDown, 
  Gamepad2, 
  Sparkles, 
  ShieldCheck,
  Zap,
  VolumeX
} from 'lucide-react';
import { ServerChannel, ServerMember, User } from '../types';
import { SoundEffectEngine } from '../services/SoundEffectEngine';
import { VoiceAvatarWithGlowingRing } from './VoiceAvatarWithGlowingRing';

interface InChannelActivityOverlayProps {
  channel: ServerChannel;
  members: ServerMember[];
  currentUser: User;
  isVoiceConnected?: boolean;
  onToggleMute?: () => void;
  isMuted?: boolean;
  className?: string;
}

interface SpeakerState {
  userId: string;
  isSpeaking: boolean;
  volumeLevel: number; // 0 to 100
  pingMs: number;
  activityText: string;
}

export const InChannelActivityOverlay: React.FC<InChannelActivityOverlayProps> = ({
  channel,
  members,
  currentUser,
  isVoiceConnected = false,
  onToggleMute,
  isMuted = false,
  className = '',
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeSpeakers, setActiveSpeakers] = useState<Record<string, SpeakerState>>({});
  const [simulationActive, setSimulationActive] = useState(true);

  // Initialize speakers simulation
  useEffect(() => {
    // Default speaker states for present members
    const initial: Record<string, SpeakerState> = {};
    const activities = [
      'Valorant • Ascent Ranked',
      'Apex Legends • Diamond Lobby',
      'Minecraft • Building Megabase',
      'Lo-Fi Radio Stage • Listening',
      'In Match • Clutch Round',
    ];

    members.forEach((m, idx) => {
      initial[m.userId] = {
        userId: m.userId,
        isSpeaking: idx === 1, // Member 2 speaking initially
        volumeLevel: idx === 1 ? 75 : 0,
        pingMs: 14 + Math.floor(Math.random() * 18),
        activityText: activities[idx % activities.length],
      };
    });

    setActiveSpeakers(initial);
  }, [members]);

  // Real-time speaking simulation loop (cycles realistic squad comms)
  useEffect(() => {
    if (!simulationActive) return;

    const interval = setInterval(() => {
      setActiveSpeakers(prev => {
        const next = { ...prev };
        const memberIds = Object.keys(next);
        if (memberIds.length === 0) return prev;

        // Randomly pick 1 or 2 users speaking
        memberIds.forEach((id) => {
          if (id === currentUser.id) return; // user controlled
          const shouldSpeak = Math.random() > 0.65;
          const current = next[id] || {
            userId: id,
            isSpeaking: false,
            volumeLevel: 0,
            pingMs: 18,
            activityText: 'Gaming',
          };

          next[id] = {
            ...current,
            isSpeaking: shouldSpeak,
            volumeLevel: shouldSpeak ? Math.floor(40 + Math.random() * 55) : 0,
            pingMs: Math.max(12, Math.min(48, current.pingMs + Math.floor(Math.random() * 5 - 2))),
          };
        });

        return next;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [simulationActive, currentUser.id]);

  // Toggle user speaking test
  const handleToggleSelfSpeaking = () => {
    SoundEffectEngine.play('button-click');
    setActiveSpeakers(prev => {
      const userState = prev[currentUser.id] || {
        userId: currentUser.id,
        isSpeaking: false,
        volumeLevel: 0,
        pingMs: 16,
        activityText: 'Streaming Screen 1080p60',
      };

      const willSpeak = !userState.isSpeaking;
      return {
        ...prev,
        [currentUser.id]: {
          ...userState,
          isSpeaking: willSpeak,
          volumeLevel: willSpeak ? 85 : 0,
        },
      };
    });
  };

  // Find users currently speaking
  const currentSpeakingMembers = members.filter(m => activeSpeakers[m.userId]?.isSpeaking);

  // Overall channel connection stats
  const averagePing = Math.round(
    (Object.values(activeSpeakers) as SpeakerState[]).reduce((acc: number, s: SpeakerState) => acc + s.pingMs, 0) /
      Math.max(1, Object.keys(activeSpeakers).length)
  );

  return (
    <div 
      className={`rounded-2xl border transition-all duration-300 shadow-xl backdrop-blur-md ${
        isVoiceConnected 
          ? 'bg-[#0f171c]/90 border-emerald-500/30 shadow-emerald-950/20' 
          : 'bg-[#14141e]/90 border-purple-500/20 shadow-purple-950/20'
      } ${className}`}
    >
      {/* Top Header Bar */}
      <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${isVoiceConnected ? 'bg-emerald-400 animate-ping' : 'bg-purple-400 animate-pulse'}`} />
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white tracking-wide flex items-center gap-1.5">
              {isVoiceConnected ? (
                <>
                  <Volume2 size={14} className="text-emerald-400" />
                  <span>VOICE COMMS LIVE</span>
                </>
              ) : (
                <>
                  <Radio size={14} className="text-purple-400" />
                  <span>CHANNEL RADAR</span>
                </>
              )}
            </span>

            <span className="text-[10px] text-slate-400 font-mono">
              #{channel.name}
            </span>
          </div>
        </div>

        {/* Right Quality Badge & Collapse Button */}
        <div className="flex items-center gap-2">
          {/* WebRTC ICE & Ping Quality Indicator */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/40 border border-white/5 text-[10px] font-mono font-bold text-emerald-400">
            <Wifi size={11} className="text-emerald-400" />
            <span>{averagePing || 18}ms</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 hidden sm:inline">0% LOSS</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-emerald-300 hidden sm:inline">96kbps</span>
          </div>

          <button
            onClick={() => {
              SoundEffectEngine.play('button-click');
              setIsMinimized(!isMinimized);
            }}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title={isMinimized ? 'Expand Activity Overlay' : 'Minimize Overlay'}
          >
            {isMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded Real-Time Activity Details */}
      {!isMinimized && (
        <div className="p-3 space-y-3">
          
          {/* Speaking Indicator Feed */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
              <span>REAL-TIME VOICE ACTIVITY</span>
              <span className="text-emerald-400">
                {currentSpeakingMembers.length > 0
                  ? `${currentSpeakingMembers.length} Speaking Now`
                  : 'Channel Silent (Listening)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {members.map((member) => {
                const speaker = activeSpeakers[member.userId] || {
                  isSpeaking: false,
                  volumeLevel: 0,
                  pingMs: 18,
                  activityText: 'Online',
                };
                const isCurrent = member.userId === currentUser.id;

                return (
                  <div
                    key={member.userId}
                    className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                      speaker.isSpeaking
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                        : 'bg-black/30 border-white/5 opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Avatar with speaking glowing ring reacting to volume levels */}
                      <VoiceAvatarWithGlowingRing
                        avatar={member.user.avatar}
                        username={member.user.username}
                        isSpeaking={speaker.isSpeaking}
                        volumeLevel={speaker.volumeLevel}
                        size="sm"
                        isMuted={isCurrent ? isMuted : false}
                        statusBadge={member.user.status || 'online'}
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white truncate">
                            {member.user.username}
                          </p>
                          {isCurrent && (
                            <span className="text-[9px] font-black px-1 rounded bg-purple-500/20 text-purple-300">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                          <Gamepad2 size={10} className="text-slate-500" />
                          <span>{speaker.activityText}</span>
                        </p>
                      </div>
                    </div>

                    {/* Audio Wave Meter & Ping */}
                    <div className="flex items-center gap-2 shrink-0">
                      {speaker.isSpeaking ? (
                        <div className="flex items-end gap-0.5 h-4 w-5">
                          <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2" />
                          <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-4" style={{ animationDelay: '0.15s' }} />
                          <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3" style={{ animationDelay: '0.3s' }} />
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {speaker.pingMs}ms
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Audio & Simulation Action Bar */}
          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Mic Test Button */}
              <button
                onClick={handleToggleSelfSpeaking}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                  activeSpeakers[currentUser.id]?.isSpeaking
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                }`}
              >
                <Mic size={13} />
                <span>
                  {activeSpeakers[currentUser.id]?.isSpeaking ? 'Speaking (Live)' : 'Test Speak (Mic)'}
                </span>
              </button>

              {/* Volume Reactivity Slider for current user */}
              {activeSpeakers[currentUser.id]?.isSpeaking && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 animate-fadeIn">
                  <span className="text-[10px] text-slate-400 font-bold">Ring Reactivity:</span>
                  <input
                    type="range"
                    min="15"
                    max="100"
                    value={activeSpeakers[currentUser.id]?.volumeLevel || 75}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setActiveSpeakers(prev => ({
                        ...prev,
                        [currentUser.id]: {
                          ...prev[currentUser.id],
                          volumeLevel: v,
                          isSpeaking: v > 5,
                        }
                      }));
                    }}
                    className="w-16 accent-emerald-500 h-1 bg-white/20 rounded cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {activeSpeakers[currentUser.id]?.volumeLevel}%
                  </span>
                </div>
              )}

              {/* Mute Toggle */}
              {onToggleMute && (
                <button
                  onClick={() => {
                    SoundEffectEngine.play('button-click');
                    onToggleMute();
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isMuted
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                  }`}
                >
                  {isMuted ? <MicOff size={13} /> : <Mic size={13} />}
                  <span>{isMuted ? 'Muted' : 'Mute'}</span>
                </button>
              )}
            </div>

            {/* Comms Simulation Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase hidden sm:inline">
                Live Comms Simulator
              </span>
              <button
                onClick={() => {
                  SoundEffectEngine.play('button-click');
                  setSimulationActive(!simulationActive);
                }}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                  simulationActive
                    ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                    : 'bg-black/30 border-white/10 text-slate-500'
                }`}
              >
                {simulationActive ? 'Active Comms ●' : 'Paused ○'}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default InChannelActivityOverlay;

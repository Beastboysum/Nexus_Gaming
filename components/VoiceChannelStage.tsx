import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Mic, 
  MicOff, 
  Headphones, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Monitor, 
  Sparkles, 
  Wifi, 
  Radio, 
  MessageSquare, 
  Sliders, 
  ShieldCheck, 
  Crown,
  VolumeX,
  Volume1,
  Zap,
  Activity
} from 'lucide-react';
import { ServerChannel, ServerMember, User } from '../types';
import { VoiceAvatarWithGlowingRing } from './VoiceAvatarWithGlowingRing';
import { VoiceActivityService, MemberVoiceState } from '../services/voiceActivityService';
import { SoundEffectEngine } from '../services/SoundEffectEngine';
import { playCategorizedAudio } from '../services/audioManager';

interface VoiceChannelStageProps {
  channel: ServerChannel;
  members: ServerMember[];
  currentUser: User;
  isVoiceConnected: boolean;
  onConnectVoice: () => void;
  onDisconnectVoice: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isDeafened: boolean;
  onToggleDeafen: () => void;
  onOpenTextChat?: () => void;
}

export const VoiceChannelStage: React.FC<VoiceChannelStageProps> = ({
  channel,
  members,
  currentUser,
  isVoiceConnected,
  onConnectVoice,
  onDisconnectVoice,
  isMuted,
  onToggleMute,
  isDeafened,
  onToggleDeafen,
  onOpenTextChat,
}) => {
  const [voiceStates, setVoiceStates] = useState<Record<string, MemberVoiceState>>(() => VoiceActivityService.getStates());
  const [isSelfSpeaking, setIsSelfSpeaking] = useState(false);
  const [testVolume, setTestVolume] = useState(80);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [usingRealMic, setUsingRealMic] = useState(false);

  // Subscribe to real-time voice and volume updates
  useEffect(() => {
    const unsubscribe = VoiceActivityService.subscribe((states) => {
      setVoiceStates({ ...states });
    });
    return () => unsubscribe();
  }, []);

  // Sync mute state to VoiceActivityService
  useEffect(() => {
    VoiceActivityService.setMemberState(currentUser.id, {
      isMuted,
      isDeafened,
      volumeLevel: isMuted ? 0 : voiceStates[currentUser.id]?.volumeLevel || 0,
      isSpeaking: isMuted ? false : voiceStates[currentUser.id]?.isSpeaking || false,
    });
  }, [isMuted, isDeafened, currentUser.id]);

  // Handle manual speaking toggle for interactive testing
  const handleToggleSpeak = () => {
    if (isMuted) return;
    SoundEffectEngine.play('button-click');
    const next = !isSelfSpeaking;
    setIsSelfSpeaking(next);
    VoiceActivityService.toggleManualSpeaking(currentUser.id, next);
  };

  // Handle test volume slider change
  const handleVolumeChange = (newVol: number) => {
    setTestVolume(newVol);
    VoiceActivityService.setManualVolume(newVol);
  };

  // Toggle real microphone capture
  const handleToggleRealMic = async () => {
    SoundEffectEngine.play('button-click');
    if (usingRealMic) {
      VoiceActivityService.disableRealMicrophone();
      setUsingRealMic(false);
    } else {
      const success = await VoiceActivityService.enableRealMicrophone();
      setUsingRealMic(success);
      if (success) {
        setIsSelfSpeaking(true);
      }
    }
  };

  const currentUserState = voiceStates[currentUser.id] || {
    userId: currentUser.id,
    isSpeaking: isSelfSpeaking,
    volumeLevel: isSelfSpeaking ? testVolume : 0,
  };

  const effectiveUserSpeaking = !isMuted && (currentUserState.isSpeaking || isSelfSpeaking);
  const effectiveUserVolume = isMuted ? 0 : (currentUserState.volumeLevel || (isSelfSpeaking ? testVolume : 0));

  return (
    <div className="flex-1 flex flex-col bg-[#0b0b12] relative overflow-hidden select-none">
      
      {/* Background Ambient Glow when anyone is speaking */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[140px] transition-all duration-300"
          style={{
            backgroundColor: effectiveUserSpeaking ? 'rgba(34, 197, 94, 0.12)' : 'rgba(147, 51, 234, 0.08)',
            transform: `scale(${1 + (effectiveUserVolume / 100) * 0.3})`,
          }}
        />
      </div>

      {/* Top Voice Room Header Info */}
      <div className="h-14 px-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#0d0d16]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Volume2 size={18} className={isVoiceConnected ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-sm md:text-base text-white truncate">
                {channel.name}
              </h2>
              {isVoiceConnected ? (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>VOICE CONNECTED</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                  VOICE ROOM
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {channel.topic || 'High-fidelity Opus voice comms with reactive audio rings.'}
            </p>
          </div>
        </div>

        {/* Top Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quality badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-emerald-400 font-bold">
            <Wifi size={12} className="text-emerald-400" />
            <span>22ms</span>
            <span className="text-slate-500">•</span>
            <span>96kbps</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Opus</span>
          </div>

          {/* Toggle Text Chat */}
          {onOpenTextChat && (
            <button
              onClick={() => {
                SoundEffectEngine.play('button-click');
                onOpenTextChat();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Open In-Room Text Chat"
            >
              <MessageSquare size={16} />
              <span className="hidden md:inline">Text Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Stage Grid of Voice Participants */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar flex flex-col items-center justify-center">
        
        {!isVoiceConnected ? (
          /* Not Connected Preview State */
          <div className="text-center max-w-md space-y-4 p-8 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-md animate-fadeIn">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl">
              <Volume2 size={36} className="animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Join Voice Channel</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your headset and microphone to start speaking with fellow members in #{channel.name}.
              </p>
            </div>
            <button
              onClick={() => {
                SoundEffectEngine.play('button-click');
                onConnectVoice();
              }}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-emerald-600/30 active:scale-95 flex items-center gap-2 mx-auto"
            >
              <Volume2 size={18} />
              <span>Connect to Voice</span>
            </button>
          </div>
        ) : (
          /* Connected: Multi-User Stage Grid with Large Avatar Cards */
          <div className="w-full max-w-5xl space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              
              {/* CURRENT USER TILE */}
              <div 
                className={`p-6 rounded-3xl border flex flex-col items-center justify-between text-center relative overflow-hidden transition-all duration-200 ${
                  effectiveUserSpeaking
                    ? 'bg-[#121c17] border-emerald-500/50 shadow-2xl shadow-emerald-950/40'
                    : 'bg-[#11111a]/90 border-white/5'
                }`}
              >
                {/* Screen Share / Webcam Preview Badge */}
                {isScreenSharing && (
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Monitor size={11} />
                    <span>STREAMING 1080p</span>
                  </div>
                )}

                {/* Ping badge top right */}
                <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>18ms</span>
                </div>

                {/* Avatar with Responsive Glowing Ring Animation */}
                <div className="my-3 relative">
                  <VoiceAvatarWithGlowingRing
                    avatar={currentUser.avatar}
                    username={currentUser.username}
                    isSpeaking={effectiveUserSpeaking}
                    volumeLevel={effectiveUserVolume}
                    size="xl"
                    shape="circle"
                    isMuted={isMuted}
                    isDeafened={isDeafened}
                    statusBadge="online"
                  />
                </div>

                {/* User Info & Live Volume Equalizer */}
                <div className="space-y-1 w-full mt-2">
                  <div className="flex items-center justify-center gap-1.5">
                    <h4 className="font-extrabold text-base text-white truncate max-w-[150px]">
                      {currentUser.username}
                    </h4>
                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      YOU
                    </span>
                  </div>

                  {/* Speaking Status Pill */}
                  <div className="h-5 flex items-center justify-center">
                    {isMuted ? (
                      <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                        <MicOff size={12} />
                        <span>Muted</span>
                      </span>
                    ) : effectiveUserSpeaking ? (
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-400">
                        {/* Audio waveform meter */}
                        <div className="flex items-end gap-0.5 h-3.5">
                          <span 
                            className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                            style={{ height: `${Math.max(4, (effectiveUserVolume / 100) * 14)}px` }}
                          />
                          <span 
                            className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                            style={{ height: `${Math.max(6, (effectiveUserVolume / 100) * 18)}px` }}
                          />
                          <span 
                            className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                            style={{ height: `${Math.max(3, (effectiveUserVolume / 100) * 12)}px` }}
                          />
                        </div>
                        <span>Speaking ({effectiveUserVolume}%)</span>
                      </div>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-500">
                        Listening
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Toggle Speak Button on Card */}
                <div className="mt-4 pt-3 border-t border-white/5 w-full flex items-center justify-center gap-2">
                  <button
                    onClick={handleToggleSpeak}
                    disabled={isMuted}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 ${
                      effectiveUserSpeaking
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : isMuted
                        ? 'bg-white/5 text-slate-500 opacity-50 cursor-not-allowed'
                        : 'bg-white/10 hover:bg-white/20 text-slate-200'
                    }`}
                  >
                    <Mic size={13} />
                    <span>{effectiveUserSpeaking ? 'Stop Speaking' : 'Push to Talk'}</span>
                  </button>
                </div>
              </div>

              {/* SQUAD MEMBERS TILES */}
              {members
                .filter(m => m.userId !== currentUser.id)
                .slice(0, 5)
                .map((member) => {
                  const state = voiceStates[member.userId] || {
                    userId: member.userId,
                    isSpeaking: false,
                    volumeLevel: 0,
                  };

                  const role = member.roleIds?.[0] ? 'Radiant Member' : 'Member';

                  return (
                    <div
                      key={member.userId}
                      className={`p-6 rounded-3xl border flex flex-col items-center justify-between text-center relative overflow-hidden transition-all duration-200 ${
                        state.isSpeaking
                          ? 'bg-[#121c17] border-emerald-500/50 shadow-2xl shadow-emerald-950/40'
                          : 'bg-[#11111a]/90 border-white/5'
                      }`}
                    >
                      {/* Status top right */}
                      <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${state.isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                        <span>{20 + parseInt(member.userId, 10) * 3}ms</span>
                      </div>

                      {/* Avatar with Volume-Reactive Glowing Ring */}
                      <div className="my-3 relative">
                        <VoiceAvatarWithGlowingRing
                          avatar={member.user.avatar}
                          username={member.user.username}
                          isSpeaking={state.isSpeaking}
                          volumeLevel={state.volumeLevel}
                          size="xl"
                          shape="circle"
                          isMuted={state.isMuted}
                          isDeafened={state.isDeafened}
                          statusBadge={member.user.status || 'online'}
                        />
                      </div>

                      {/* User Info & Status */}
                      <div className="space-y-1 w-full mt-2">
                        <div className="flex items-center justify-center gap-1.5">
                          <h4 className="font-extrabold text-base text-white truncate max-w-[150px]">
                            {member.user.username}
                          </h4>
                          {member.isOwner && (
                            <Crown size={14} className="text-amber-400 shrink-0" />
                          )}
                        </div>

                        {/* Speaking Status Pill */}
                        <div className="h-5 flex items-center justify-center">
                          {state.isSpeaking ? (
                            <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-400">
                              <div className="flex items-end gap-0.5 h-3.5">
                                <span 
                                  className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                                  style={{ height: `${Math.max(4, (state.volumeLevel / 100) * 14)}px` }}
                                />
                                <span 
                                  className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                                  style={{ height: `${Math.max(6, (state.volumeLevel / 100) * 18)}px` }}
                                />
                                <span 
                                  className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                                  style={{ height: `${Math.max(3, (state.volumeLevel / 100) * 12)}px` }}
                                />
                              </div>
                              <span>Speaking ({state.volumeLevel}%)</span>
                            </div>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-500">
                              Listening
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Activity Subtitle */}
                      <div className="mt-4 pt-3 border-t border-white/5 w-full text-[11px] text-slate-400 flex items-center justify-center gap-1">
                        <Activity size={12} className="text-slate-500" />
                        <span className="truncate max-w-[160px]">Valorant Competitive Comms</span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* REAL-TIME VOLUME REACTIVITY TESTING & AUDIO TOOLS BAR */}
            <div className="p-4 rounded-3xl bg-[#141420]/90 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Volume Slider for Immediate Visual Testing */}
              <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-md">
                <Volume2 size={16} className="text-emerald-400 shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>Test Volume Reactivity</span>
                    <span className="font-mono text-emerald-400">{testVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={testVolume}
                    onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 h-1.5 bg-black/50 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons for Microphone */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Push to talk / Speaking toggle */}
                <button
                  onClick={handleToggleSpeak}
                  disabled={isMuted}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 ${
                    effectiveUserSpeaking
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  <Zap size={14} className={effectiveUserSpeaking ? 'animate-pulse' : ''} />
                  <span>{effectiveUserSpeaking ? 'Voice Active ●' : 'Push to Talk'}</span>
                </button>

                {/* Real Microphone toggle */}
                <button
                  onClick={handleToggleRealMic}
                  className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    usingRealMic
                      ? 'bg-purple-600 text-white shadow-purple-600/30'
                      : 'bg-black/40 hover:bg-black/60 text-slate-400 hover:text-white border border-white/10'
                  }`}
                  title="Use live microphone audio from your headset or laptop"
                >
                  <Mic size={14} />
                  <span>{usingRealMic ? 'Mic Capturing Live' : 'Enable Real Mic'}</span>
                </button>

                {/* Krisp Noise Suppression */}
                <button
                  onClick={() => {
                    SoundEffectEngine.play('button-click');
                    setNoiseSuppression(!noiseSuppression);
                  }}
                  className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    noiseSuppression
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-black/40 text-slate-500 border border-white/10'
                  }`}
                  title="Krisp AI Noise Suppression"
                >
                  <Sparkles size={14} />
                  <span>Krisp AI {noiseSuppression ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Persistent Bottom Floating Voice Stage Bar (Discord Voice Control Bar) */}
      {isVoiceConnected && (
        <div className="p-4 bg-[#0d0d16] border-t border-white/5 flex items-center justify-between shrink-0 z-20">
          
          {/* User mini status */}
          <div className="flex items-center gap-3">
            <VoiceAvatarWithGlowingRing
              avatar={currentUser.avatar}
              username={currentUser.username}
              isSpeaking={effectiveUserSpeaking}
              volumeLevel={effectiveUserVolume}
              size="sm"
              shape="rounded"
              isMuted={isMuted}
              isDeafened={isDeafened}
            />
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-white flex items-center gap-1">
                <span>{currentUser.username}</span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {effectiveUserSpeaking ? `${effectiveUserVolume}% vol` : 'connected'}
                </span>
              </p>
              <p className="text-[10px] text-slate-500">
                {isMuted ? 'Muted' : isDeafened ? 'Deafened' : 'Ready to Speak'}
              </p>
            </div>
          </div>

          {/* Central Controls */}
          <div className="flex items-center gap-2">
            {/* Mute Button */}
            <button
              onClick={() => {
                SoundEffectEngine.play('button-click');
                onToggleMute();
              }}
              className={`p-3 rounded-2xl border transition-all active:scale-95 ${
                isMuted
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-md shadow-rose-950/40'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
              }`}
              title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Deafen Button */}
            <button
              onClick={() => {
                SoundEffectEngine.play('button-click');
                onToggleDeafen();
              }}
              className={`p-3 rounded-2xl border transition-all active:scale-95 ${
                isDeafened
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-md shadow-rose-950/40'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
              }`}
              title={isDeafened ? 'Undeafen Audio' : 'Deafen Audio'}
            >
              <Headphones size={18} />
            </button>

            {/* Camera / Video */}
            <button
              onClick={() => {
                SoundEffectEngine.play('button-click');
                setIsWebcamActive(!isWebcamActive);
              }}
              className={`p-3 rounded-2xl border transition-all active:scale-95 ${
                isWebcamActive
                  ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
              }`}
              title="Toggle Camera"
            >
              {isWebcamActive ? <Video size={18} /> : <VideoOff size={18} />}
            </button>

            {/* Screen Share */}
            <button
              onClick={() => {
                SoundEffectEngine.play('button-click');
                setIsScreenSharing(!isScreenSharing);
              }}
              className={`p-3 rounded-2xl border transition-all active:scale-95 ${
                isScreenSharing
                  ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
              }`}
              title="Share Your Screen"
            >
              <Monitor size={18} />
            </button>

            {/* Disconnect Button */}
            <button
              onClick={() => {
                SoundEffectEngine.play('button-click');
                playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-simple-game-countdown-921.mp3', 'calls', 0.4);
                onDisconnectVoice();
              }}
              className="p-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-600/30 active:scale-95"
              title="Disconnect from Voice"
            >
              <PhoneOff size={18} />
            </button>
          </div>

          {/* Right Info */}
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>RTC Connected</span>
          </div>

        </div>
      )}

    </div>
  );
};

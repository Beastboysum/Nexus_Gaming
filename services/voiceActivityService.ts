// Voice Activity and Volume Detection Service
// Supports both Web Audio API microphone capture and simulated voice cadence

export interface MemberVoiceState {
  userId: string;
  isSpeaking: boolean;
  volumeLevel: number; // 0 to 100
  isMuted?: boolean;
  isDeafened?: boolean;
}

type VolumeListener = (states: Record<string, MemberVoiceState>) => void;

class VoiceActivityManager {
  private listeners: Set<VolumeListener> = new Set();
  private states: Record<string, MemberVoiceState> = {};
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private isMicActive = false;
  private animationFrameId: number | null = null;
  private simulationTimer: any = null;
  private currentUserId = '1';
  private isUserSpeakingManual = false;
  private manualVolume = 75;

  constructor() {
    this.startSimulationLoop();
  }

  public subscribe(listener: VolumeListener): () => void {
    this.listeners.add(listener);
    listener(this.states);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getStates(): Record<string, MemberVoiceState> {
    return this.states;
  }

  public getState(userId: string): MemberVoiceState {
    return (
      this.states[userId] || {
        userId,
        isSpeaking: false,
        volumeLevel: 0,
      }
    );
  }

  public setMemberState(userId: string, partial: Partial<MemberVoiceState>): void {
    this.states[userId] = {
      ...(this.states[userId] || { userId, isSpeaking: false, volumeLevel: 0 }),
      ...partial,
    };
    this.notify();
  }

  public toggleManualSpeaking(userId: string, isSpeaking?: boolean): boolean {
    const current = this.getState(userId);
    const nextSpeaking = isSpeaking !== undefined ? isSpeaking : !current.isSpeaking;
    this.isUserSpeakingManual = nextSpeaking;

    this.setMemberState(userId, {
      isSpeaking: nextSpeaking,
      volumeLevel: nextSpeaking ? this.manualVolume : 0,
    });

    return nextSpeaking;
  }

  public setManualVolume(volume: number): void {
    this.manualVolume = Math.min(100, Math.max(0, volume));
    if (this.isUserSpeakingManual) {
      this.setMemberState(this.currentUserId, {
        isSpeaking: this.manualVolume > 5,
        volumeLevel: this.manualVolume,
      });
    }
  }

  // Real Microphone Capture via Web Audio API
  public async enableRealMicrophone(): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return false;
    }

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      const source = this.audioContext.createMediaStreamSource(this.micStream);

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.5;
      source.connect(this.analyser);

      this.isMicActive = true;
      this.trackMicVolume();
      return true;
    } catch (err) {
      console.warn('Real microphone unavailable, falling back to simulated speech:', err);
      return false;
    }
  }

  public disableRealMicrophone(): void {
    this.isMicActive = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.setMemberState(this.currentUserId, {
      isSpeaking: false,
      volumeLevel: 0,
    });
  }

  public isRealMicActive(): boolean {
    return this.isMicActive;
  }

  private trackMicVolume(): void {
    if (!this.analyser || !this.isMicActive) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const updateLoop = () => {
      if (!this.analyser || !this.isMicActive) return;

      this.analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      // Scale to 0-100 range with sensitivity boost
      const scaledVol = Math.min(100, Math.round((average / 128) * 100 * 1.4));
      const speaking = scaledVol > 8;

      this.setMemberState(this.currentUserId, {
        isSpeaking: speaking,
        volumeLevel: speaking ? scaledVol : 0,
      });

      this.animationFrameId = requestAnimationFrame(updateLoop);
    };

    this.animationFrameId = requestAnimationFrame(updateLoop);
  }

  // Realistic background simulation of conversational squad banter
  private startSimulationLoop(): void {
    if (typeof window === 'undefined') return;

    // Fast modulation ticker (updates every 120ms to make volume pulse naturally during speech)
    setInterval(() => {
      let changed = false;

      // If user is manually speaking, fluctuate their volume naturally around base volume
      if (this.isUserSpeakingManual && !this.isMicActive) {
        const userState = this.states[this.currentUserId];
        if (userState?.isSpeaking && !userState.isMuted) {
          const wobble = Math.sin(Date.now() / 150) * 18 + (Math.random() * 10 - 5);
          const nextVol = Math.max(25, Math.min(100, Math.round(this.manualVolume + wobble)));
          this.states[this.currentUserId] = {
            ...userState,
            volumeLevel: nextVol,
          };
          changed = true;
        }
      }

      // Modulate volume for any squad members who are speaking
      Object.keys(this.states).forEach(id => {
        if (id === this.currentUserId) return;
        const s = this.states[id];
        if (s?.isSpeaking && !s.isMuted) {
          const wobble = Math.sin(Date.now() / 120 + parseInt(id, 10)) * 20 + (Math.random() * 8 - 4);
          const target = Math.max(30, Math.min(100, Math.round(s.volumeLevel + wobble)));
          this.states[id] = {
            ...s,
            volumeLevel: target,
          };
          changed = true;
        }
      });

      if (changed) {
        this.notify();
      }
    }, 120);

    // Conversational pacing cycle: turns members on/off speaking every 2-3 seconds
    this.simulationTimer = setInterval(() => {
      const squadIds = ['2', '3', '4', '6', '7'];
      
      squadIds.forEach(id => {
        const currentState = this.states[id];
        // 35% chance a squad member starts or stops speaking
        const willSpeak = Math.random() > 0.65;
        const baseVolume = willSpeak ? Math.floor(45 + Math.random() * 50) : 0;

        this.states[id] = {
          userId: id,
          isSpeaking: willSpeak,
          volumeLevel: baseVolume,
          isMuted: currentState?.isMuted || false,
          isDeafened: currentState?.isDeafened || false,
        };
      });

      this.notify();
    }, 2800);
  }

  private notify(): void {
    this.listeners.forEach(fn => fn(this.states));
  }
}

export const VoiceActivityService = new VoiceActivityManager();

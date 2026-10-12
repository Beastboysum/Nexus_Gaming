/**
 * Persistent Audio Settings Manager for Nexus Gaming Hub
 * Controls volume independently for:
 * - Notifications
 * - Incoming Calls
 * - System Interactions & Mascot SFX
 * Persists in localStorage and broadcasts real-time changes.
 */

export interface AudioVolumes {
  master: number;         // 0 to 100
  notifications: number;  // 0 to 100
  calls: number;          // 0 to 100
  system: number;         // 0 to 100
  isMuted: boolean;
}

const STORAGE_KEY = 'nexus_audio_volumes';

const DEFAULT_VOLUMES: AudioVolumes = {
  master: 85,
  notifications: 75,
  calls: 80,
  system: 70,
  isMuted: false,
};

export const getAudioVolumes = (): AudioVolumes => {
  if (typeof window === 'undefined') return DEFAULT_VOLUMES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        master: typeof parsed.master === 'number' ? Math.max(0, Math.min(100, parsed.master)) : DEFAULT_VOLUMES.master,
        notifications: typeof parsed.notifications === 'number' ? Math.max(0, Math.min(100, parsed.notifications)) : DEFAULT_VOLUMES.notifications,
        calls: typeof parsed.calls === 'number' ? Math.max(0, Math.min(100, parsed.calls)) : DEFAULT_VOLUMES.calls,
        system: typeof parsed.system === 'number' ? Math.max(0, Math.min(100, parsed.system)) : DEFAULT_VOLUMES.system,
        isMuted: typeof parsed.isMuted === 'boolean' ? parsed.isMuted : DEFAULT_VOLUMES.isMuted,
      };
    }
  } catch (_) {}
  return DEFAULT_VOLUMES;
};

export const saveAudioVolumes = (newVolumes: Partial<AudioVolumes>): AudioVolumes => {
  const current = getAudioVolumes();
  const updated: AudioVolumes = {
    ...current,
    ...newVolumes,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('nexus_audio_volumes_changed', { detail: updated }));
  } catch (_) {}
  return updated;
};

/**
 * Calculates effective volume between 0.0 and 1.0 based on master and category
 */
export const getEffectiveVolume = (category: 'notifications' | 'calls' | 'system', baseScalar: number = 1.0): number => {
  const settings = getAudioVolumes();
  if (settings.isMuted) return 0;
  
  const masterScalar = settings.master / 100;
  const categoryScalar = settings[category] / 100;
  
  const computed = masterScalar * categoryScalar * baseScalar;
  return Math.max(0, Math.min(1, computed));
};

/**
 * Plays an audio clip with the effective volume for its category
 */
export const playCategorizedAudio = (
  url: string,
  category: 'notifications' | 'calls' | 'system',
  baseScalar: number = 1.0
): HTMLAudioElement | null => {
  if (typeof window === 'undefined') return null;
  const effectiveVol = getEffectiveVolume(category, baseScalar);
  if (effectiveVol <= 0) return null;

  try {
    const audio = new Audio(url);
    audio.volume = effectiveVol;
    audio.play().catch(() => {});
    return audio;
  } catch (_) {
    return null;
  }
};

/**
 * Web Audio Context singleton for instant, zero-latency synthesizer sounds
 */
let sharedAudioCtx: AudioContext | null = null;
const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
};

/**
 * Plays the Call Accepted sound effect:
 * An uplifting, euphoric futuristic connection chime + harmonized Web Audio chord
 */
export const playCallAcceptedSound = (): void => {
  const vol = getEffectiveVolume('calls', 0.85);
  if (vol <= 0) return;

  // 1. Play high quality remote SFX
  playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', 'calls', 0.9);
  playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-2586.mp3', 'calls', 0.7);

  // 2. Synthesize a zero-latency futuristic pickup chime (C5 -> E5 -> G5 -> C6 sparkle)
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0.00, dur: 0.22 }, // C5
      { freq: 659.25, time: 0.06, dur: 0.22 }, // E5
      { freq: 783.99, time: 0.12, dur: 0.25 }, // G5
      { freq: 1046.5, time: 0.18, dur: 0.40 }, // C6
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(vol * 0.25, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } catch (_) {}
};

/**
 * Plays the Call Declined / Disconnected sound effect
 */
export const playCallDeclinedSound = (): void => {
  const vol = getEffectiveVolume('calls', 0.75);
  if (vol <= 0) return;

  playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-simple-game-countdown-921.mp3', 'calls', 0.8);

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Downward descending tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);

    gain.gain.setValueAtTime(vol * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (_) {}
};

export interface ActiveRingtoneHandle {
  stop: () => void;
}

/**
 * Starts playing a repeating incoming call ringtone
 * Plays both audio loop and rhythmic Web Audio ring tone cadence for crisp tactile presence
 */
export const startCallRingtone = (): ActiveRingtoneHandle => {
  const callVol = getEffectiveVolume('calls', 0.8);
  let isStopped = false;
  let audioElem: HTMLAudioElement | null = null;
  let intervalId: any = null;

  if (callVol > 0) {
    try {
      audioElem = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-classic-phone-ring-1611.mp3');
      audioElem.loop = true;
      audioElem.volume = callVol;
      audioElem.play().catch(() => {});
    } catch (_) {}

    // Rhythmic Web Audio synthesized ring burst (two 0.4s rings with 0.1s pause, then 1.5s silence)
    const playRingCycle = () => {
      if (isStopped) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const currentVol = getEffectiveVolume('calls', 0.25);
        if (currentVol <= 0) return;

        const ringPulse = (startTime: number, duration: number) => {
          // Dual frequency 440Hz + 480Hz classic telephone ring
          [440, 480].forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(currentVol * 0.2, startTime + 0.03);
            gain.gain.setValueAtTime(currentVol * 0.2, startTime + duration - 0.03);
            gain.gain.linearRampToValueAtTime(0.0001, startTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + duration);
          });
        };

        ringPulse(now, 0.4);
        ringPulse(now + 0.5, 0.4);
      } catch (_) {}
    };

    playRingCycle();
    intervalId = setInterval(playRingCycle, 2800);
  }

  return {
    stop: () => {
      isStopped = true;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      if (audioElem) {
        audioElem.pause();
        audioElem.currentTime = 0;
        audioElem = null;
      }
    }
  };
};

/**
 * Starts playing outgoing call dialing audio
 */
export const startCallDialingSound = (): ActiveRingtoneHandle => {
  const dialVol = getEffectiveVolume('calls', 0.5);
  let isStopped = false;
  let audioElem: HTMLAudioElement | null = null;

  if (dialVol > 0) {
    try {
      audioElem = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-dial-phone-tone-2864.mp3');
      audioElem.loop = true;
      audioElem.volume = dialVol;
      audioElem.play().catch(() => {});
    } catch (_) {}
  }

  return {
    stop: () => {
      isStopped = true;
      if (audioElem) {
        audioElem.pause();
        audioElem.currentTime = 0;
        audioElem = null;
      }
    }
  };
};

export { SoundEffectEngine, soundEffectEngine } from './SoundEffectEngine';
export type { SoundEffectType, SoundEffectOptions } from './SoundEffectEngine';

import { getEffectiveVolume } from './audioManager';
import { vibrate } from './haptics';

export type SoundEffectType = 
  | 'button-click'
  | 'notification-popup'
  | 'task-complete'
  | 'streak-burst'
  | 'mascot-chirp'
  | 'mascot-happy'
  | 'mascot-flutter';

export interface SoundEffectOptions {
  volume?: number; // Optional scalar 0.0 to 1.0 (defaults to 1.0)
  variant?: number; // Optional variant index (for random chirps)
}

/**
 * Centralized SoundEffectEngine using the Web Audio API
 * Provides low-latency, zero-dependency audio synthesis for UI interactions.
 */
class SoundEffectEngineImpl {
  private audioCtx: AudioContext | null = null;

  /**
   * Initializes or resumes the AudioContext safely upon user interaction
   */
  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Main dispatch method: play(type, options?)
   */
  public play(type: SoundEffectType, options?: SoundEffectOptions): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const userScalar = options?.volume ?? 1.0;

    switch (type) {
      case 'button-click':
        vibrate(12);
        this.synthesizeButtonClick(ctx, userScalar);
        break;
      case 'notification-popup':
        vibrate([25, 30]);
        this.synthesizeNotificationPopup(ctx, userScalar);
        break;
      case 'task-complete':
        vibrate([40, 50, 75]);
        this.synthesizeTaskComplete(ctx, userScalar);
        break;
      case 'streak-burst':
        vibrate([50, 40, 70, 40, 100]);
        this.synthesizeStreakBurst(ctx, userScalar);
        break;
      case 'mascot-chirp':
      case 'mascot-happy':
      case 'mascot-flutter':
        vibrate([20, 25, 35]);
        this.synthesizeMascotChirp(ctx, userScalar, options?.variant);
        break;
      default:
        console.warn(`[SoundEffectEngine] Unknown sound type: ${type}`);
    }
  }

  /**
   * Helper to trigger randomized cheerful chirps directly
   */
  public playMascotChirp(variant?: number): void {
    this.play('mascot-chirp', { variant });
  }

  /**
   * 'button-click' sound:
   * Crisp, mechanical tactile click with micro-frequency transient and low-end body
   */
  private synthesizeButtonClick(ctx: AudioContext, scalar: number): void {
    const effectiveVol = getEffectiveVolume('system', 0.35 * scalar);
    if (effectiveVol <= 0) return;

    const now = ctx.currentTime;

    // 1. High transient click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(1400, now);
    clickOsc.frequency.exponentialRampToValueAtTime(300, now + 0.025);

    clickGain.gain.setValueAtTime(0, now);
    clickGain.gain.linearRampToValueAtTime(effectiveVol * 0.45, now + 0.002);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);

    clickOsc.start(now);
    clickOsc.stop(now + 0.03);

    // 2. Body pop
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(240, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(90, now + 0.035);

    bodyGain.gain.setValueAtTime(0, now);
    bodyGain.gain.linearRampToValueAtTime(effectiveVol * 0.35, now + 0.003);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);

    bodyOsc.start(now);
    bodyOsc.stop(now + 0.045);
  }

  /**
   * 'notification-popup' sound:
   * Bright, modern harmonic chime with two rising tones (F5 -> Bb5) and gentle sparkle
   */
  private synthesizeNotificationPopup(ctx: AudioContext, scalar: number): void {
    const effectiveVol = getEffectiveVolume('notifications', 0.65 * scalar);
    if (effectiveVol <= 0) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 698.46, time: 0.00, dur: 0.28 }, // F5
      { freq: 932.33, time: 0.08, dur: 0.42 }, // Bb5
      { freq: 1396.9, time: 0.16, dur: 0.30 }, // F6 subtle overtone
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(effectiveVol * 0.4, now + time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  }

  /**
   * 'task-complete' sound:
   * Rewarding, celebratory ascending 4-note arpeggio (C5 -> E5 -> G5 -> C6) with warm bell decay
   */
  private synthesizeTaskComplete(ctx: AudioContext, scalar: number): void {
    const effectiveVol = getEffectiveVolume('system', 0.6 * scalar);
    if (effectiveVol <= 0) return;

    const now = ctx.currentTime;
    const arpeggio = [
      { freq: 523.25, time: 0.00, dur: 0.25 }, // C5
      { freq: 659.25, time: 0.08, dur: 0.28 }, // E5
      { freq: 783.99, time: 0.16, dur: 0.32 }, // G5
      { freq: 1046.50, time: 0.24, dur: 0.55 }, // C6
    ];

    arpeggio.forEach(({ freq, time, dur }) => {
      // Primary Tone (triangle for warmth)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(effectiveVol * 0.35, now + time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur);

      // Shimmer Harmonic (sine)
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(freq * 2, now + time);

      shimmerGain.gain.setValueAtTime(0, now + time);
      shimmerGain.gain.linearRampToValueAtTime(effectiveVol * 0.12, now + time + 0.02);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + time + (dur * 0.7));

      shimmer.connect(shimmerGain);
      shimmerGain.connect(ctx.destination);

      shimmer.start(now + time);
      shimmer.stop(now + time + dur);
    });
  }

  /**
   * 'streak-burst' sound:
   * Fiery ignition swell, rising harmonic flare and flame sizzle sweep
   */
  private synthesizeStreakBurst(ctx: AudioContext, scalar: number): void {
    const effectiveVol = getEffectiveVolume('system', 0.65 * scalar);
    if (effectiveVol <= 0) return;

    const now = ctx.currentTime;

    // 1. Resonant rising ignition swell (160Hz -> 480Hz)
    const swellOsc = ctx.createOscillator();
    const swellGain = ctx.createGain();
    swellOsc.type = 'sawtooth';
    swellOsc.frequency.setValueAtTime(160, now);
    swellOsc.frequency.exponentialRampToValueAtTime(540, now + 0.25);

    // Lowpass filter to shape the fire warmth
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(2200, now + 0.2);

    swellGain.gain.setValueAtTime(0, now);
    swellGain.gain.linearRampToValueAtTime(effectiveVol * 0.4, now + 0.04);
    swellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    swellOsc.connect(filter);
    filter.connect(swellGain);
    swellGain.connect(ctx.destination);

    swellOsc.start(now);
    swellOsc.stop(now + 0.38);

    // 2. Flame Burst Shimmer Chord (flame sparks)
    const sparks = [
      { freq: 440, time: 0.03, dur: 0.3 },
      { freq: 659.25, time: 0.07, dur: 0.35 },
      { freq: 880, time: 0.12, dur: 0.4 },
      { freq: 1174.66, time: 0.16, dur: 0.45 },
    ];

    sparks.forEach(({ freq, time, dur }) => {
      const sparkOsc = ctx.createOscillator();
      const sparkGain = ctx.createGain();
      sparkOsc.type = 'sine';
      sparkOsc.frequency.setValueAtTime(freq, now + time);
      sparkOsc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + time + dur);

      sparkGain.gain.setValueAtTime(0, now + time);
      sparkGain.gain.linearRampToValueAtTime(effectiveVol * 0.25, now + time + 0.02);
      sparkGain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      sparkOsc.connect(sparkGain);
      sparkGain.connect(ctx.destination);

      sparkOsc.start(now + time);
      sparkOsc.stop(now + time + dur);
    });

    // 3. Flame Sizzle (synthesized noise burst)
    try {
      const bufferSize = Math.floor(ctx.sampleRate * 0.25);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1000, now);
      bandpass.frequency.linearRampToValueAtTime(3200, now + 0.2);
      bandpass.Q.setValueAtTime(2.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(effectiveVol * 0.18, now + 0.03);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      whiteNoise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.25);
    } catch (_) {}
  }

  /**
   * 'mascot-chirp' / cheerful companion chirps:
   * Generates randomized playful, expressive avian/companion synthesized chirps
   * using fast micro-frequency sweeps, harmonics, and cheerful warbles.
   */
  private synthesizeMascotChirp(ctx: AudioContext, scalar: number, variantChoice?: number): void {
    const effectiveVol = getEffectiveVolume('system', 0.55 * scalar);
    if (effectiveVol <= 0) return;

    const now = ctx.currentTime;
    const variant = variantChoice !== undefined ? (variantChoice % 4) : Math.floor(Math.random() * 4);

    switch (variant) {
      case 0: {
        // Variant 0: Double Ascending Cheerful "Peep-Pip!"
        const chirps = [
          { startFreq: 1400, endFreq: 2400, time: 0.0, dur: 0.09, vol: 0.35 },
          { startFreq: 1900, endFreq: 3100, time: 0.11, dur: 0.12, vol: 0.42 },
        ];

        chirps.forEach(({ startFreq, endFreq, time, dur, vol }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(startFreq, now + time);
          osc.frequency.exponentialRampToValueAtTime(endFreq, now + time + dur * 0.7);

          gain.gain.setValueAtTime(0, now + time);
          gain.gain.linearRampToValueAtTime(effectiveVol * vol, now + time + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + time);
          osc.stop(now + time + dur);
        });
        break;
      }

      case 1: {
        // Variant 1: Cheerful Trill Flutter (3 rapid cascading notes)
        const trills = [
          { freq: 1760, time: 0.0, dur: 0.07 }, // A6
          { freq: 2093, time: 0.06, dur: 0.08 }, // C7
          { freq: 2637, time: 0.13, dur: 0.14 }, // E7
        ];

        trills.forEach(({ freq, time, dur }, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = i === 2 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now + time);
          osc.frequency.linearRampToValueAtTime(freq * 1.15, now + time + dur * 0.8);

          gain.gain.setValueAtTime(0, now + time);
          gain.gain.linearRampToValueAtTime(effectiveVol * 0.36, now + time + 0.008);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + time);
          osc.stop(now + time + dur);
        });
        break;
      }

      case 2: {
        // Variant 2: Warm Playful Hoot-Tweet (low pleasant fundamental + high sparkle)
        const warmOsc = ctx.createOscillator();
        const warmGain = ctx.createGain();
        warmOsc.type = 'sine';
        warmOsc.frequency.setValueAtTime(440, now);
        warmOsc.frequency.exponentialRampToValueAtTime(620, now + 0.12);

        warmGain.gain.setValueAtTime(0, now);
        warmGain.gain.linearRampToValueAtTime(effectiveVol * 0.45, now + 0.02);
        warmGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

        warmOsc.connect(warmGain);
        warmGain.connect(ctx.destination);
        warmOsc.start(now);
        warmOsc.stop(now + 0.15);

        // High response pip
        const pipOsc = ctx.createOscillator();
        const pipGain = ctx.createGain();
        pipOsc.type = 'sine';
        pipOsc.frequency.setValueAtTime(2200, now + 0.11);
        pipOsc.frequency.exponentialRampToValueAtTime(3200, now + 0.22);

        pipGain.gain.setValueAtTime(0, now + 0.11);
        pipGain.gain.linearRampToValueAtTime(effectiveVol * 0.38, now + 0.12);
        pipGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

        pipOsc.connect(pipGain);
        pipGain.connect(ctx.destination);
        pipOsc.start(now + 0.11);
        pipOsc.stop(now + 0.25);
        break;
      }

      case 3:
      default: {
        // Variant 3: Sparkly Vibrato Chirp Burst
        const osc = ctx.createOscillator();
        const vibrato = ctx.createOscillator();
        const vibratoGain = ctx.createGain();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.linearRampToValueAtTime(2600, now + 0.16);

        // Subtle 28Hz frequency vibrato
        vibrato.frequency.setValueAtTime(28, now);
        vibratoGain.gain.setValueAtTime(80, now);
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(effectiveVol * 0.42, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        vibrato.start(now);
        vibrato.stop(now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
    }
  }
}

// Export singleton instance and class definition
export const SoundEffectEngine = new SoundEffectEngineImpl();
export const soundEffectEngine = SoundEffectEngine;
export default SoundEffectEngine;

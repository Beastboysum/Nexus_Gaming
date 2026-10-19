import { playCategorizedAudio, SoundEffectEngine } from './audioManager';

const JUNIOR_MODE_KEY = 'nexus_junior_mode_enabled';

export const isJuniorModeEnabled = (): boolean => {
  try {
    const saved = localStorage.getItem(JUNIOR_MODE_KEY);
    return saved === 'true';
  } catch {
    return false;
  }
};

export const setJuniorMode = (enabled: boolean): void => {
  try {
    localStorage.setItem(JUNIOR_MODE_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('nexus_junior_mode_changed', { detail: { enabled } }));

    if (enabled) {
      // Play cheerful celebratory kid chime
      playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-magical-glitter-sparkle-2629.mp3', 'system', 0.6);
      SoundEffectEngine.play('streak-burst');
    } else {
      playCategorizedAudio('https://assets.mixkit.co/sfx/preview/mixkit-sci-fi-interface-click-901.mp3', 'system', 0.4);
    }
  } catch (e) {
    console.error('Failed to set junior mode:', e);
  }
};

export const toggleJuniorMode = (): boolean => {
  const current = isJuniorModeEnabled();
  const next = !current;
  setJuniorMode(next);
  return next;
};

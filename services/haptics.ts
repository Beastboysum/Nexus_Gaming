/**
 * Physical haptic feedback engine using navigator.vibrate()
 * for mascot companion interactions, daily streak increment animations,
 * and milestone badge rewards on supported mobile devices.
 */

export const isVibrationSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'vibrate' in navigator &&
    typeof navigator.vibrate === 'function'
  );
};

export const isHapticsEnabled = (): boolean => {
  try {
    const pref = localStorage.getItem('nexus_haptic_feedback');
    if (pref !== null) {
      return pref === 'true';
    }
  } catch (_) {}
  return true; // Default to enabled
};

export const setHapticsEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem('nexus_haptic_feedback', enabled ? 'true' : 'false');
    window.dispatchEvent(new Event('nexus_haptics_changed'));
  } catch (_) {}
};

/**
 * Safely invokes navigator.vibrate with pattern.
 * Pattern can be a single duration in ms, or an array of [vibrate, pause, vibrate, ...]
 */
export const vibrate = (pattern: number | number[]): boolean => {
  if (!isHapticsEnabled() || !isVibrationSupported()) {
    return false;
  }
  try {
    return navigator.vibrate(pattern);
  } catch (err) {
    // Graceful swallow for any browser permission or policy restrictions
    return false;
  }
};

// ==========================================
// 🦉 MASCOT COMPANION HAPTIC PATTERNS
// ==========================================

/**
 * Mascot Poke / Tickle:
 * Light, playful double-tap tactile sensation:
 * 30ms tap, 25ms pause, 45ms tap
 */
export const hapticMascotPoke = () => {
  vibrate([30, 25, 45]);
};

/**
 * Mascot Feed Snack (Power Berry):
 * Rhythmic snacking vibration simulating crunchy berry bites:
 * 35ms bite, 25ms pause, 45ms bite, 25ms pause, 60ms swallow
 */
export const hapticMascotFeed = () => {
  vibrate([35, 25, 45, 25, 60]);
};

/**
 * Mascot Bond Level-Up:
 * Ascending fanfare crescendo celebration vibration
 */
export const hapticMascotLevelUp = () => {
  vibrate([40, 30, 60, 30, 90, 40, 150]);
};

/**
 * Mascot Victory / High Spirits / XP Boost:
 * Energetic victory pulse
 */
export const hapticMascotCelebration = () => {
  vibrate([50, 40, 80, 40, 110]);
};

// ==========================================
// 🔥 STREAK INCREMENT & BURST HAPTIC PATTERNS
// ==========================================

/**
 * Header Streak Flame Burst & Increment:
 * Emulates flame ignition and spark shockwave:
 * Sharp initial spark (60ms), short pause (35ms), swelling flame roar (100ms), climax burn (140ms)
 */
export const hapticStreakIncrement = () => {
  vibrate([60, 35, 100, 35, 140]);
};

/**
 * Daily Check-in Claim & Celebration:
 * Big milestone achievement physical feedback:
 * Double heavy pulse followed by an extended celebration rumble
 */
export const hapticStreakClaim = () => {
  vibrate([80, 45, 90, 45, 180]);
};

/**
 * Streak Milestone Badge Unlock / Equip:
 * Crisp, tactile mechanical lock click
 */
export const hapticBadgeEquip = () => {
  vibrate([50, 30, 70]);
};

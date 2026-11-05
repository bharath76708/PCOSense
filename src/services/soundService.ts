/**
 * Sound Notification Service for PCOSense
 * Generates subtle, pleasant, harmonic audio chimes using the Web Audio API.
 * No external audio files or network dependencies required.
 */

const SOUND_PREF_KEY = 'pcosense_sound_enabled';
const VOLUME_PREF_KEY = 'pcosense_sound_volume';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (err) {
    console.warn('AudioContext initialization failed:', err);
    return null;
  }
}

/**
 * Check if sound notifications are enabled in user settings
 */
export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const pref = localStorage.getItem(SOUND_PREF_KEY);
    return pref === null ? true : pref === 'true';
  } catch {
    return true;
  }
}

/**
 * Enable or disable sound notifications
 */
export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SOUND_PREF_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('pcosense-sound-pref-changed', { detail: { enabled } }));
  } catch {
    // ignore
  }
}

/**
 * Get current volume multiplier (0.0 to 1.0)
 */
export function getSoundVolume(): number {
  if (typeof window === 'undefined') return 0.5;
  try {
    const vol = localStorage.getItem(VOLUME_PREF_KEY);
    return vol ? Math.max(0.1, Math.min(1.0, parseFloat(vol))) : 0.5;
  } catch {
    return 0.5;
  }
}

/**
 * Set sound volume multiplier (0.0 to 1.0)
 */
export function setSoundVolume(volume: number): void {
  if (typeof window === 'undefined') return;
  try {
    const clamped = Math.max(0.05, Math.min(1.0, volume));
    localStorage.setItem(VOLUME_PREF_KEY, clamped.toString());
  } catch {
    // ignore
  }
}

export type NotificationSoundType = 
  | 'ai-reply' 
  | 'symptom-logged' 
  | 'daily-reminder' 
  | 'emergency-alert' 
  | 'tap-click'
  | 'milestone-unlocked'
  | 'water-drank'
  | 'water-alert'
  | 'goal-achieved'
  | 'button-click';

/**
 * Play a subtle synthesized audio chime
 */
export function playNotificationSound(type: NotificationSoundType = 'ai-reply', force: boolean = false): void {
  if (!force && !isSoundEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const masterVol = getSoundVolume();
  const now = ctx.currentTime;

  try {
    if (type === 'button-click' || type === 'tap-click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.08 * masterVol, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'goal-achieved' || type === 'milestone-unlocked') {
      // Joyful celebratory ascending chime (C5 -> E5 -> G5 -> C6)
      const notes = [
        { freq: 523.25, delay: 0.0, dur: 0.25 },
        { freq: 659.25, delay: 0.09, dur: 0.25 },
        { freq: 783.99, delay: 0.18, dur: 0.3 },
        { freq: 1046.50, delay: 0.28, dur: 0.6 }
      ];

      notes.forEach(({ freq, delay, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);

        const startTime = now + delay;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.18 * masterVol, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.05);
      });
    } else if (type === 'water-drank') {
      // Refreshing crisp liquid bubble / water drop chime (sine with subtle frequency pitch glide)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.22 * masterVol, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);

      // Second harmonic drop
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(900, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(1500, now + 0.18);

      gain2.gain.setValueAtTime(0.0001, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.15 * masterVol, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.08);
      osc2.stop(now + 0.42);
    } else if (type === 'water-alert') {
      // Gentle two-pulse hydration reminder tone (E5 -> A5 gentle chime)
      const notes = [
        { freq: 659.25, delay: 0.0, dur: 0.3 },
        { freq: 880.0, delay: 0.16, dur: 0.4 }
      ];
      notes.forEach(({ freq, delay, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        const startTime = now + delay;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.18 * masterVol, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.05);
      });
    } else if (type === 'ai-reply') {
      // Gentle ascending 3-note harmonic triad (C5 -> E5 -> G5)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        const startTime = now + idx * 0.08;
        const duration = 0.28;

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.12 * masterVol, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
      });
    } else if (type === 'symptom-logged' || type === 'daily-reminder') {
      // Soft modern dual-chime (D5 -> A5)
      const notes = [
        { freq: 587.33, delay: 0.0, dur: 0.35 },
        { freq: 880.0, delay: 0.12, dur: 0.45 }
      ];

      notes.forEach(({ freq, delay, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);

        const startTime = now + delay;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.15 * masterVol, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.05);
      });
    } else if (type === 'emergency-alert') {
      // Soft dual clinical alert tone (A4 -> F4)
      const notes = [440, 349.23];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        const startTime = now + idx * 0.15;
        const duration = 0.3;

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.18 * masterVol, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
      });
    } else if (type === 'tap-click') {
      // Subtle micro-tap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.06 * masterVol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch (err) {
    console.warn('Could not play notification sound:', err);
  }
}

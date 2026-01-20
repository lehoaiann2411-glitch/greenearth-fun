import { useCallback, useRef } from 'react';

export function useLiveSounds() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [getAudioContext]);

  const playCountdownBeep = useCallback((count: number) => {
    // Higher pitch for last count (1), lower for others
    const frequency = count === 1 ? 1000 : 700;
    playTone(frequency, 0.15, 'sine', 0.4);
  }, [playTone]);

  const playGoLiveChime = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Play a pleasant chord: C-E-G (major chord)
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
      
      frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now);

        gainNode.gain.setValueAtTime(0.2, now + index * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8 + index * 0.1);

        oscillator.start(now + index * 0.1);
        oscillator.stop(now + 1);
      });
    } catch (error) {
      console.error('Error playing go live chime:', error);
    }
  }, [getAudioContext]);

  const playGiftSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Coin drop sound - descending tones
      const frequencies = [1200, 1000, 800, 1400];
      
      frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now + index * 0.08);

        gainNode.gain.setValueAtTime(0.25, now + index * 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15 + index * 0.08);

        oscillator.start(now + index * 0.08);
        oscillator.stop(now + 0.3 + index * 0.08);
      });
    } catch (error) {
      console.error('Error playing gift sound:', error);
    }
  }, [getAudioContext]);

  const playNewViewerSound = useCallback(() => {
    // Soft pop sound
    playTone(800, 0.1, 'sine', 0.15);
    setTimeout(() => playTone(1000, 0.08, 'sine', 0.1), 50);
  }, [playTone]);

  const playCommentSound = useCallback(() => {
    // Quick subtle notification
    playTone(600, 0.08, 'sine', 0.1);
  }, [playTone]);

  const playEndStreamSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Descending melody to signal end
      const frequencies = [523.25, 440, 349.23]; // C5, A4, F4
      
      frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now + index * 0.2);

        gainNode.gain.setValueAtTime(0.2, now + index * 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4 + index * 0.2);

        oscillator.start(now + index * 0.2);
        oscillator.stop(now + 0.6 + index * 0.2);
      });
    } catch (error) {
      console.error('Error playing end stream sound:', error);
    }
  }, [getAudioContext]);

  return {
    playCountdownBeep,
    playGoLiveChime,
    playGiftSound,
    playNewViewerSound,
    playCommentSound,
    playEndStreamSound,
  };
}

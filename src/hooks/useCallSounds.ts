import { useRef, useCallback, useEffect } from 'react';

interface UseCallSoundsReturn {
  playRingtone: () => void;
  playDialTone: () => void;
  stopAllSounds: () => void;
}

export function useCallSounds(): UseCallSoundsReturn {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(false);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const stopAllSounds = useCallback(() => {
    isPlayingRef.current = false;
    
    // Stop all oscillators
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Oscillator may already be stopped
      }
    });
    oscillatorsRef.current = [];
    
    // Disconnect gain nodes
    gainNodesRef.current.forEach(gain => {
      try {
        gain.disconnect();
      } catch (e) {
        // May already be disconnected
      }
    });
    gainNodesRef.current = [];
    
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Ringtone: Dual-tone similar to phone ringtone
  const playRingtone = useCallback(() => {
    stopAllSounds();
    isPlayingRef.current = true;

    const playBeep = () => {
      if (!isPlayingRef.current) return;

      const ctx = getAudioContext();
      
      // Create oscillators for dual-tone (440Hz + 480Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, ctx.currentTime);
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(480, ctx.currentTime);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Volume envelope
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.4);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.5);
      osc2.stop(ctx.currentTime + 0.5);

      oscillatorsRef.current.push(osc1, osc2);
      gainNodesRef.current.push(gainNode);

      // Second beep after short pause
      setTimeout(() => {
        if (!isPlayingRef.current) return;

        const osc3 = ctx.createOscillator();
        const osc4 = ctx.createOscillator();
        const gainNode2 = ctx.createGain();

        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(440, ctx.currentTime);
        
        osc4.type = 'sine';
        osc4.frequency.setValueAtTime(480, ctx.currentTime);

        osc3.connect(gainNode2);
        osc4.connect(gainNode2);
        gainNode2.connect(ctx.destination);

        gainNode2.gain.setValueAtTime(0, ctx.currentTime);
        gainNode2.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        gainNode2.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.4);
        gainNode2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

        osc3.start(ctx.currentTime);
        osc4.start(ctx.currentTime);
        osc3.stop(ctx.currentTime + 0.5);
        osc4.stop(ctx.currentTime + 0.5);

        oscillatorsRef.current.push(osc3, osc4);
        gainNodesRef.current.push(gainNode2);
      }, 600);
    };

    // Play immediately
    playBeep();
    
    // Repeat every 3 seconds
    intervalRef.current = setInterval(playBeep, 3000);
  }, [getAudioContext, stopAllSounds]);

  // Dial tone: Single tone with pattern (ringing back tone)
  const playDialTone = useCallback(() => {
    stopAllSounds();
    isPlayingRef.current = true;

    const playTone = () => {
      if (!isPlayingRef.current) return;

      const ctx = getAudioContext();
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      // 1.5 seconds on
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1.4);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);

      oscillatorsRef.current.push(osc);
      gainNodesRef.current.push(gainNode);
    };

    // Play immediately
    playTone();
    
    // Repeat every 4 seconds (1.5s on, 2.5s off)
    intervalRef.current = setInterval(playTone, 4000);
  }, [getAudioContext, stopAllSounds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllSounds();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAllSounds]);

  return { playRingtone, playDialTone, stopAllSounds };
}

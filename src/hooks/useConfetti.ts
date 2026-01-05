import confetti from 'canvas-confetti';
import { useCallback } from 'react';

type ConfettiIntensity = 'small' | 'medium' | 'large';

export function useConfetti() {
  const triggerConfetti = useCallback((intensity: ConfettiIntensity = 'medium') => {
    const configs: Record<ConfettiIntensity, confetti.Options> = {
      small: {
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#22c55e', '#16a34a', '#86efac'],
      },
      medium: {
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#16a34a', '#86efac', '#fbbf24', '#f59e0b'],
      },
      large: {
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#22c55e', '#16a34a', '#86efac', '#fbbf24', '#f59e0b', '#a855f7'],
      },
    };

    confetti(configs[intensity]);

    // For large intensity, add extra bursts
    if (intensity === 'large') {
      setTimeout(() => {
        confetti({
          ...configs.large,
          origin: { x: 0.25, y: 0.6 },
        });
      }, 200);
      setTimeout(() => {
        confetti({
          ...configs.large,
          origin: { x: 0.75, y: 0.6 },
        });
      }, 400);
    }
  }, []);

  const triggerCoinRain = useCallback(() => {
    // Green coin rain effect
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22c55e', '#16a34a'],
        shapes: ['circle'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#22c55e', '#16a34a'],
        shapes: ['circle'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return { triggerConfetti, triggerCoinRain };
}

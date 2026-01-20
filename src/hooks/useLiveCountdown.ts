import { useState, useEffect, useCallback } from 'react';

export function useLiveCountdown() {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);

  const startCountdown = useCallback((seconds: number = 3): Promise<void> => {
    return new Promise((resolve) => {
      setCountdown(seconds);
      setIsActive(true);

      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            setIsActive(false);
            setCountdown(null);
            resolve();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    });
  }, []);

  const cancelCountdown = useCallback(() => {
    setIsActive(false);
    setCountdown(null);
  }, []);

  return { 
    countdown, 
    isActive, 
    startCountdown, 
    cancelCountdown 
  };
}

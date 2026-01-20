import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, VolumeX, Image as ImageIcon } from 'lucide-react';

interface ReelPlayerProps {
  videoUrl: string | null;
  imageUrl?: string | null;
  mediaType?: 'video' | 'image';
  isActive: boolean;
  onVideoEnd?: () => void;
  onDoubleTap?: () => void;
}

export function ReelPlayer({ 
  videoUrl, 
  imageUrl, 
  mediaType = 'video', 
  isActive, 
  onVideoEnd, 
  onDoubleTap 
}: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [lastTap, setLastTap] = useState(0);

  // For image type, auto-progress simulation
  useEffect(() => {
    if (mediaType === 'image' && isActive) {
      const duration = 10000; // 10 seconds for image display
      const interval = 100;
      let elapsed = 0;

      const timer = setInterval(() => {
        elapsed += interval;
        setProgress((elapsed / duration) * 100);
        if (elapsed >= duration) {
          clearInterval(timer);
          onVideoEnd?.();
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [mediaType, isActive, onVideoEnd]);

  useEffect(() => {
    if (mediaType === 'video' && videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
        setProgress(0);
      }
    }
  }, [isActive, mediaType]);

  // Update progress bar for video
  useEffect(() => {
    if (mediaType !== 'video') return;
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const percentage = (video.currentTime / video.duration) * 100;
      setProgress(percentage);
    };

    video.addEventListener('timeupdate', updateProgress);
    return () => video.removeEventListener('timeupdate', updateProgress);
  }, [mediaType]);

  const handleTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Mute button area (top-right corner)
    if (x > rect.width - 60 && y < 60) return;

    const now = Date.now();
    if (now - lastTap < 300) {
      onDoubleTap?.();
    } else {
      if (mediaType === 'video' && videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          videoRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      }
    }
    setLastTap(now);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const mediaUrl = mediaType === 'image' ? imageUrl : videoUrl;

  return (
    <div 
      className="absolute inset-0 bg-black"
      onClick={handleTap}
    >
      {mediaType === 'video' && videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          onEnded={onVideoEnd}
        />
      ) : (
        <img
          src={imageUrl || videoUrl || ''}
          alt="Reel"
          className="w-full h-full object-contain"
        />
      )}

      {/* Play/Pause Overlay */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-20 h-20 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <Play className="h-10 w-10 text-white fill-white ml-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mute Button - Only for video */}
      {mediaType === 'video' && (
        <motion.button
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white z-20"
          onClick={toggleMute}
          whileTap={{ scale: 0.9 }}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </motion.button>
      )}

      {/* Image indicator */}
      {mediaType === 'image' && (
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-emerald-500/80 backdrop-blur-sm flex items-center gap-1 z-20">
          <ImageIcon className="h-4 w-4 text-white" />
          <span className="text-white text-xs">Ảnh</span>
        </div>
      )}

      {/* Unmute hint - Only for video */}
      <AnimatePresence>
        {mediaType === 'video' && isMuted && isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute top-16 right-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 z-20"
          >
            <span className="text-white text-xs">Tap to unmute</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
        <motion.div
          className="h-full bg-white"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  );
}

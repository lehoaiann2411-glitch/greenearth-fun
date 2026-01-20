import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Play, Pause, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoTrimmerProps {
  videoUrl: string;
  videoDuration: number;
  onTrim: (startTime: number, endTime: number) => void;
  onClose: () => void;
}

const MIN_DURATION = 5; // seconds
const MAX_DURATION = 120; // seconds
const THUMBNAIL_COUNT = 10;

export function VideoTrimmer({
  videoUrl,
  videoDuration,
  onTrim,
  onClose,
}: VideoTrimmerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(Math.min(videoDuration, MAX_DURATION));
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const selectedDuration = endTime - startTime;

  // Generate video thumbnails
  useEffect(() => {
    const generateThumbnails = async () => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 80;
      canvas.height = 60;

      const thumbs: string[] = [];
      const interval = videoDuration / THUMBNAIL_COUNT;

      for (let i = 0; i < THUMBNAIL_COUNT; i++) {
        video.currentTime = i * interval;
        await new Promise((resolve) => {
          video.onseeked = resolve;
        });
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        thumbs.push(canvas.toDataURL('image/jpeg', 0.5));
      }

      setThumbnails(thumbs);
    };

    generateThumbnails().catch(console.error);
  }, [videoUrl, videoDuration]);

  // Update video time when handles move
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
      setCurrentTime(startTime);
    }
  }, [startTime]);

  // Handle video time update
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      
      // Loop within selected range
      if (time >= endTime) {
        videoRef.current.currentTime = startTime;
      }
    }
  }, [startTime, endTime]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        if (videoRef.current.currentTime < startTime || videoRef.current.currentTime >= endTime) {
          videoRef.current.currentTime = startTime;
        }
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current || isDragging) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * videoDuration;
    
    if (time >= startTime && time <= endTime) {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        setCurrentTime(time);
      }
    }
  };

  const handleDragStart = (handle: 'start' | 'end') => (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(handle);
  };

  const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const time = (x / rect.width) * videoDuration;

    if (isDragging === 'start') {
      const newStart = Math.max(0, Math.min(time, endTime - MIN_DURATION));
      setStartTime(newStart);
    } else {
      const newEnd = Math.min(videoDuration, Math.max(time, startTime + MIN_DURATION));
      // Ensure max duration
      if (newEnd - startTime <= MAX_DURATION) {
        setEndTime(newEnd);
      }
    }
  }, [isDragging, videoDuration, startTime, endTime]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDrag);
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDrag, handleDragEnd]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirm = () => {
    onTrim(startTime, endTime);
    onClose();
  };

  const startPercent = (startTime / videoDuration) * 100;
  const endPercent = (endTime / videoDuration) * 100;
  const currentPercent = (currentTime / videoDuration) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onClose} className="text-white p-2">
          <X className="h-6 w-6" />
        </button>
        <h1 className="text-white font-bold text-lg flex items-center gap-2">
          <Scissors className="h-5 w-5" />
          Cắt Video
        </h1>
        <Button
          onClick={handleConfirm}
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6"
        >
          <Check className="h-4 w-4 mr-1" />
          Xong
        </Button>
      </div>

      {/* Video Preview */}
      <div className="flex items-center justify-center px-4" style={{ height: 'calc(100vh - 280px)' }}>
        <div className="relative w-full max-w-md aspect-[9/16] mx-auto rounded-2xl overflow-hidden bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onClick={togglePlayPause}
          />
          
          {/* Play/Pause overlay */}
          <button
            onClick={togglePlayPause}
            className="absolute inset-0 flex items-center justify-center"
          >
            {!isPlaying && (
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play className="h-8 w-8 text-white fill-white ml-1" />
              </div>
            )}
          </button>

          {/* Current time badge */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm">
            {formatTime(currentTime)} / {formatTime(selectedDuration)}
          </div>
        </div>
      </div>

      {/* Timeline Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-8 pb-8 px-4">
        {/* Duration info */}
        <div className="flex justify-between items-center mb-4 text-white text-sm">
          <span className="text-emerald-400 font-medium">
            Đoạn đã chọn: {formatTime(selectedDuration)}
          </span>
          <span className="text-white/60">
            {formatTime(startTime)} - {formatTime(endTime)}
          </span>
        </div>

        {/* Timeline */}
        <div
          ref={timelineRef}
          className="relative h-14 rounded-lg overflow-hidden cursor-pointer"
          onClick={handleTimelineClick}
        >
          {/* Thumbnails */}
          <div className="absolute inset-0 flex">
            {thumbnails.length > 0 ? (
              thumbnails.map((thumb, i) => (
                <div key={i} className="flex-1 h-full">
                  <img src={thumb} alt="" className="w-full h-full object-cover" />
                </div>
              ))
            ) : (
              <div className="w-full h-full bg-gray-800 animate-pulse" />
            )}
          </div>

          {/* Overlay for non-selected areas */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-black/70"
            style={{ width: `${startPercent}%` }}
          />
          <div
            className="absolute top-0 bottom-0 right-0 bg-black/70"
            style={{ width: `${100 - endPercent}%` }}
          />

          {/* Selected range border */}
          <div
            className="absolute top-0 bottom-0 border-2 border-emerald-500 pointer-events-none"
            style={{
              left: `${startPercent}%`,
              width: `${endPercent - startPercent}%`,
            }}
          />

          {/* Start handle */}
          <div
            className="absolute top-0 bottom-0 w-4 bg-emerald-500 cursor-ew-resize flex items-center justify-center touch-none"
            style={{ left: `${startPercent}%`, marginLeft: '-8px' }}
            onMouseDown={handleDragStart('start')}
            onTouchStart={handleDragStart('start')}
          >
            <div className="w-1 h-8 bg-white rounded-full" />
          </div>

          {/* End handle */}
          <div
            className="absolute top-0 bottom-0 w-4 bg-emerald-500 cursor-ew-resize flex items-center justify-center touch-none"
            style={{ left: `${endPercent}%`, marginLeft: '-8px' }}
            onMouseDown={handleDragStart('end')}
            onTouchStart={handleDragStart('end')}
          >
            <div className="w-1 h-8 bg-white rounded-full" />
          </div>

          {/* Current time indicator */}
          {isPlaying && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none"
              style={{ left: `${currentPercent}%` }}
            />
          )}
        </div>

        {/* Time labels */}
        <div className="flex justify-between mt-2 text-white/60 text-xs">
          <span>0:00</span>
          <span>{formatTime(videoDuration)}</span>
        </div>

        {/* Instructions */}
        <p className="text-center text-white/50 text-xs mt-4">
          Kéo các thanh màu xanh để chọn đoạn video (5s - 2 phút)
        </p>
      </div>
    </motion.div>
  );
}

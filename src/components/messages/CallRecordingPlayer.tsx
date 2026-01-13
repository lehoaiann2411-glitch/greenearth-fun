import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Download, Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDuration } from '@/lib/webrtc';

interface CallRecordingPlayerProps {
  recordingUrl: string;
  duration: number;
  createdAt: string;
}

export function CallRecordingPlayer({ 
  recordingUrl, 
  duration, 
  createdAt 
}: CallRecordingPlayerProps) {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration || duration;
    setCurrentTime(current);
    setProgress((current / total) * 100);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * (audioRef.current.duration || duration);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(clickPosition * 100);
  };

  return (
    <div className="flex items-center gap-3 bg-muted rounded-lg p-3 max-w-xs">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Mic className="h-5 w-5 text-primary" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-full"
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          
          <div 
            className="flex-1 cursor-pointer"
            onClick={handleProgressClick}
          >
            <Progress value={progress} className="h-1" />
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>{formatDuration(Math.floor(currentTime))}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>
      
      <Button 
        size="sm" 
        variant="ghost" 
        className="h-8 w-8 p-0 flex-shrink-0"
        asChild
      >
        <a href={recordingUrl} download={`recording_${createdAt}.webm`}>
          <Download className="h-4 w-4" />
        </a>
      </Button>
      
      <audio
        ref={audioRef}
        src={recordingUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
      />
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Mic, Square, Send, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onSendVoice: (blob: Blob, duration: number) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onSendVoice, onCancel }: VoiceRecorderProps) {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSendVoice(audioBlob, duration);
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    setAudioBlob(null);
    setDuration(0);
    onCancel();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
      {/* Cancel Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCancel}
        className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Recording Indicator */}
      <div className="flex-1 flex items-center gap-3">
        {isRecording ? (
          <>
            <div className="relative">
              <Mic className="h-5 w-5 text-destructive" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full animate-pulse" />
            </div>
            {/* Waveform Animation */}
            <div className="flex items-center gap-0.5">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 20 + 8}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </>
        ) : audioBlob ? (
          <div className="flex items-center gap-2 text-primary">
            <Mic className="h-5 w-5" />
            <span className="text-sm font-medium">{t('messages.voice.ready')}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">{t('messages.voice.tapToRecord')}</span>
        )}

        {/* Duration */}
        <span className={cn(
          'text-sm font-mono tabular-nums',
          isRecording ? 'text-destructive' : 'text-muted-foreground'
        )}>
          {formatDuration(duration)}
        </span>
      </div>

      {/* Record/Stop/Send Button */}
      {!audioBlob ? (
        <Button
          size="icon"
          variant={isRecording ? 'destructive' : 'default'}
          onClick={isRecording ? stopRecording : startRecording}
          className={cn(
            'shrink-0 transition-all duration-200',
            isRecording && 'animate-pulse'
          )}
        >
          {isRecording ? (
            <Square className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      ) : (
        <Button
          size="icon"
          onClick={handleSend}
          className="shrink-0 bg-primary hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

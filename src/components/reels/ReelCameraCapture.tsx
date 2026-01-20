import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Camera, Video, RefreshCcw, Circle, Square, 
  Check, RotateCcw, Play, Pause, StopCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ReelCameraCaptureProps {
  mode: 'video' | 'photo';
  onCapture: (file: File, mediaType: 'video' | 'image') => void;
  onClose: () => void;
}

export function ReelCameraCapture({ mode, onCapture, onClose }: ReelCameraCaptureProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [capturedMedia, setCapturedMedia] = useState<{ url: string; file: File; type: 'video' | 'image' } | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MIN_DURATION = 5;
  const MAX_DURATION = 120;

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
          aspectRatio: { ideal: 9/16 },
        },
        audio: mode === 'video',
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Không thể truy cập camera. Vui lòng cho phép quyền truy cập.');
      setIsLoading(false);
    }
  }, [facingMode, mode]);

  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startCamera]);

  const switchCamera = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    
    try {
      const options = { mimeType: 'video/webm;codecs=vp8,opus' };
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const file = new File([blob], `reel-${Date.now()}.webm`, { type: 'video/webm' });
        setCapturedMedia({ url, file, type: 'video' });
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_DURATION) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Recording error:', err);
      toast({
        title: 'Lỗi',
        description: 'Không thể bắt đầu quay video',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      if (recordingTime < MIN_DURATION) {
        toast({
          title: 'Video quá ngắn',
          description: `Video phải dài ít nhất ${MIN_DURATION} giây`,
          variant: 'destructive',
        });
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setRecordingTime(0);
        chunksRef.current = [];
        return;
      }
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const file = new File([blob], `reel-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setCapturedMedia({ url, file, type: 'image' });
    }, 'image/jpeg', 0.9);
  };

  const handleRetake = () => {
    if (capturedMedia) {
      URL.revokeObjectURL(capturedMedia.url);
    }
    setCapturedMedia(null);
    setIsPreviewPlaying(false);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedMedia) {
      onCapture(capturedMedia.file, capturedMedia.type);
    }
  };

  const togglePreviewPlayback = () => {
    if (previewVideoRef.current) {
      if (isPreviewPlaying) {
        previewVideoRef.current.pause();
      } else {
        previewVideoRef.current.play();
      }
      setIsPreviewPlaying(!isPreviewPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Preview captured media
  if (capturedMedia) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
          <button onClick={handleRetake} className="text-white p-2">
            <RotateCcw className="h-6 w-6" />
          </button>
          <span className="text-white font-bold">
            {capturedMedia.type === 'video' ? 'Xem trước video' : 'Xem trước ảnh'}
          </span>
          <Button
            onClick={handleConfirm}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4"
          >
            <Check className="h-5 w-5 mr-1" />
            Dùng
          </Button>
        </div>

        {/* Preview */}
        <div className="flex-1 flex items-center justify-center">
          {capturedMedia.type === 'video' ? (
            <div className="relative w-full h-full" onClick={togglePreviewPlayback}>
              <video
                ref={previewVideoRef}
                src={capturedMedia.url}
                className="w-full h-full object-contain"
                loop
                playsInline
              />
              <AnimatePresence>
                {!isPreviewPlaying && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="h-10 w-10 text-white fill-white ml-1" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <img
              src={capturedMedia.url}
              alt="Captured"
              className="w-full h-full object-contain"
            />
          )}
        </div>
      </div>
    );
  }

  // Camera view
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 pt-safe bg-black/80 relative z-10">
        <button onClick={onClose} className="text-white p-2 -ml-2">
          <X className="h-6 w-6" />
        </button>
        <span className="text-white font-bold text-lg">
          {mode === 'video' ? 'Quay Video' : 'Chụp Ảnh'}
        </span>
        <div className="w-10" />
      </div>

      {/* Camera Preview - Fixed aspect ratio container */}
      <div className="flex-1 flex items-center justify-center overflow-hidden bg-black relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
            <div className="text-center p-6">
              <Camera className="h-16 w-16 text-white/50 mx-auto mb-4" />
              <p className="text-white/70 mb-4">{error}</p>
              <Button onClick={startCamera} variant="outline">
                Thử lại
              </Button>
            </div>
          </div>
        )}

        {/* Video container with proper aspect ratio */}
        <div className="relative w-full h-full max-h-[70vh] flex items-center justify-center">
          <video
            ref={videoRef}
            className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
            autoPlay
            playsInline
            muted
            style={{ 
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
              maxHeight: 'calc(100vh - 200px)'
            }}
          />
        </div>
        <canvas ref={canvasRef} className="hidden" />

        {/* Recording Timer */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 px-4 py-2 rounded-full flex items-center gap-2 z-10"
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-3 h-3 rounded-full bg-white"
            />
            <span className="text-white font-bold">{formatTime(recordingTime)}</span>
          </motion.div>
        )}

        {/* Min duration hint */}
        {isRecording && recordingTime < MIN_DURATION && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full z-10">
            <span className="text-white text-sm">Tối thiểu {MIN_DURATION}s</span>
          </div>
        )}
      </div>

      {/* Controls - Always visible at bottom */}
      <div className="flex-shrink-0 bg-black py-6 px-4 pb-safe">
        <div className="flex items-center justify-center gap-6 sm:gap-10">
          {/* Switch Camera Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={switchCamera}
            disabled={isRecording}
            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center disabled:opacity-50 border-2 border-white/30"
          >
            <RefreshCcw className="h-6 w-6 text-white" />
          </motion.button>

          {/* Main Capture Button */}
          {mode === 'video' ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isRecording 
                  ? 'bg-red-500 ring-4 ring-red-300/50' 
                  : 'bg-white ring-4 ring-white/30'
              }`}
            >
              {isRecording ? (
                <Square className="h-10 w-10 text-white fill-white" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center">
                  <Circle className="h-16 w-16 text-white fill-red-500" />
                </div>
              )}
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={capturePhoto}
              className="w-24 h-24 rounded-full bg-white ring-4 ring-white/30 flex items-center justify-center shadow-lg"
            >
              <div className="w-20 h-20 rounded-full border-4 border-gray-300 bg-white" />
            </motion.button>
          )}

          {/* Mode indicator */}
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/20">
            {mode === 'video' ? (
              <Video className="h-6 w-6 text-red-400" />
            ) : (
              <Camera className="h-6 w-6 text-white" />
            )}
          </div>
        </div>

        {/* Duration hint for video */}
        {mode === 'video' && !isRecording && (
          <p className="text-center text-white/60 text-sm mt-4">
            Nhấn để quay • {MIN_DURATION}s - {MAX_DURATION / 60} phút
          </p>
        )}
        
        {/* Hint for photo */}
        {mode === 'photo' && (
          <p className="text-center text-white/60 text-sm mt-4">
            Nhấn để chụp ảnh
          </p>
        )}
      </div>
    </div>
  );
}
import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Volume2,
  VolumeX,
  SwitchCamera,
  Maximize2,
  Minimize2,
  Signal,
  SignalLow,
  SignalZero,
  Circle,
  StopCircle,
  ScreenShare,
  ScreenShareOff,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  toggleAudio, 
  toggleVideo, 
  formatDuration, 
  switchCamera, 
  hasMultipleCameras,
  getScreenShareStream,
  replaceVideoTrack,
} from '@/lib/webrtc';
import type { Call } from '@/hooks/useCalls';
import { cn } from '@/lib/utils';
import { useCallRecording } from '@/hooks/useCallRecording';
import { toast } from 'sonner';

interface CallScreenProps {
  call: Call | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState;
  onEndCall: () => void;
  remoteName?: string;
  remoteAvatar?: string;
  peerConnection?: RTCPeerConnection | null;
}

export function CallScreen({
  call,
  localStream,
  remoteStream,
  connectionState,
  onEndCall,
  remoteName,
  remoteAvatar,
  peerConnection,
}: CallScreenProps) {
  const { t } = useTranslation();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const [hasMultipleCams, setHasMultipleCams] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioPlaybackBlocked, setAudioPlaybackBlocked] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  const originalVideoTrackRef = useRef<MediaStreamTrack | null>(null);

  const { 
    isRecording, 
    recordingDuration, 
    startRecording, 
    stopRecording, 
    uploadRecording 
  } = useCallRecording();

  const isVideoCall = call?.call_type === 'video';

  // Check for multiple cameras
  useEffect(() => {
    if (isVideoCall) {
      hasMultipleCameras().then(setHasMultipleCams);
    }
  }, [isVideoCall]);

  // Set up local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      console.log('CallScreen: Set local video srcObject');
    }
  }, [localStream]);

  // Set up remote video and audio
  useEffect(() => {
    if (remoteStream) {
      console.log('CallScreen: Setting up remote stream', {
        audioTracks: remoteStream.getAudioTracks().length,
        videoTracks: remoteStream.getVideoTracks().length,
      });

      // Set up video element (muted for autoplay compatibility)
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.muted = true; // Always muted for autoplay
        console.log('CallScreen: Set remote video srcObject (muted for autoplay)');
      }

      // Set up audio element for reliable audio playback
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
        
        // Try to play audio
        const playAudio = async () => {
          try {
            await remoteAudioRef.current?.play();
            console.log('CallScreen: Remote audio playing');
            setAudioPlaybackBlocked(false);
          } catch (err) {
            console.warn('CallScreen: Audio autoplay blocked', err);
            setAudioPlaybackBlocked(true);
          }
        };
        
        playAudio();
      }
    }
  }, [remoteStream]);

  // Duration timer
  useEffect(() => {
    if (call?.status !== 'accepted') return;

    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [call?.status]);

  // Cleanup screen share on unmount
  useEffect(() => {
    return () => {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [screenStream]);

  const handleToggleMute = () => {
    if (localStream) {
      toggleAudio(localStream, isMuted);
      setIsMuted(!isMuted);
    }
  };

  const handleToggleVideo = () => {
    if (localStream) {
      const newVideoOff = !isVideoOff;
      toggleVideo(localStream, !newVideoOff); // enabled = true khi bật camera
      setIsVideoOff(newVideoOff);
      
      // Refresh video element khi bật lại camera
      if (!newVideoOff && localVideoRef.current) {
        const currentSrc = localVideoRef.current.srcObject;
        localVideoRef.current.srcObject = null;
        requestAnimationFrame(() => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = currentSrc;
          }
        });
      }
    }
  };

  const handleToggleSpeaker = () => {
    const newMuted = !isSpeakerOff;
    // Mute/unmute audio element
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = newMuted;
    }
    setIsSpeakerOff(newMuted);
  };

  const handleUnblockAudio = async () => {
    if (remoteAudioRef.current) {
      try {
        await remoteAudioRef.current.play();
        setAudioPlaybackBlocked(false);
      } catch (err) {
        console.error('Failed to play audio:', err);
      }
    }
  };

  const handleSwitchCamera = async () => {
    if (localStream && peerConnection) {
      try {
        await switchCamera(localStream, peerConnection);
      } catch (error) {
        console.error('Failed to switch camera:', error);
      }
    }
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      const result = await stopRecording();
      if (result && call) {
        await uploadRecording(call.id, result.blob);
      }
    } else if (localStream) {
      startRecording(localStream, remoteStream);
    }
  };

  const handleToggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screen = await getScreenShareStream();
        const screenTrack = screen.getVideoTracks()[0];
        
        // Save original video track
        originalVideoTrackRef.current = localStream?.getVideoTracks()[0] || null;
        
        // Replace with screen track
        if (peerConnection) {
          await replaceVideoTrack(peerConnection, screenTrack);
        }
        
        setScreenStream(screen);
        setIsScreenSharing(true);
        
        // Auto-stop when user stops share from browser
        screenTrack.onended = () => handleStopScreenShare();
        
        toast.success(t('calls.screenShareStarted'));
      } catch (error) {
        console.error('Screen share failed:', error);
        toast.error(t('calls.screenShareError'));
      }
    } else {
      handleStopScreenShare();
    }
  };

  const handleStopScreenShare = async () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    
    // Restore camera
    if (originalVideoTrackRef.current && peerConnection) {
      await replaceVideoTrack(peerConnection, originalVideoTrackRef.current);
    }
    
    setIsScreenSharing(false);
    setScreenStream(null);
    toast.info(t('calls.screenShareStopped'));
  };

  if (!call) return null;

  const getStatusText = () => {
    switch (connectionState) {
      case 'connecting':
        return t('calls.connecting');
      case 'connected':
        return formatDuration(duration);
      case 'disconnected':
      case 'failed':
        return t('calls.callEnded');
      default:
        if (call.status === 'calling') {
          return t('calls.ringing');
        }
        return t('calls.calling');
    }
  };

  const getConnectionIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <Signal className="h-4 w-4 text-green-400" />;
      case 'connecting':
        return <SignalLow className="h-4 w-4 text-yellow-400" />;
      default:
        return <SignalZero className="h-4 w-4 text-red-400" />;
    }
  };

  return (
    <Dialog open={!!call}>
      <DialogContent 
        className={cn(
          "p-0 overflow-hidden",
          isFullscreen ? "w-screen h-screen max-w-none max-h-none rounded-none" : "sm:max-w-2xl"
        )} 
        hideClose
      >
        <div className="relative bg-gray-900 min-h-[500px] flex flex-col">
          {/* Hidden audio element for reliable audio playback */}
          <audio
            ref={remoteAudioRef}
            autoPlay
            playsInline
            className="hidden"
          />

          {/* Audio blocked warning */}
          {audioPlaybackBlocked && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleUnblockAudio}
                className="bg-yellow-500/90 hover:bg-yellow-500 text-black"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Chạm để bật âm thanh
              </Button>
            </div>
          )}

          {/* Remote video / avatar */}
          {isVideoCall && remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted // Video always muted, audio comes from audio element
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Avatar className="h-32 w-32 mx-auto mb-4">
                  <AvatarImage src={remoteAvatar} />
                  <AvatarFallback className="text-4xl bg-primary/20">
                    {remoteName?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-2xl font-semibold text-white">{remoteName}</h3>
                <p className="text-gray-400 mt-2">{getStatusText()}</p>
              </div>
            </div>
          )}

          {/* Local video (picture-in-picture) */}
          {isVideoCall && localStream && !isVideoOff && (
            <div className="absolute top-4 right-4 w-32 h-48 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              {isScreenSharing && (
                <div className="absolute bottom-1 left-1 right-1 bg-primary/80 text-white text-xs text-center py-0.5 rounded">
                  {t('calls.sharingScreen')}
                </div>
              )}
            </div>
          )}

          {/* Status overlay for video calls */}
          {isVideoCall && remoteStream && (
            <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full flex items-center gap-2">
              {getConnectionIcon()}
              <span className="text-white text-sm">{getStatusText()}</span>
            </div>
          )}

          {/* Debug info (hidden in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="absolute bottom-24 left-4 bg-black/70 px-2 py-1 rounded text-xs text-white/70">
              <div>Connection: {connectionState}</div>
              <div>Local tracks: {localStream?.getTracks().length || 0}</div>
              <div>Remote tracks: {remoteStream?.getTracks().length || 0}</div>
            </div>
          )}

          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-4 right-40 bg-red-500/90 px-3 py-1 rounded-full flex items-center gap-2 z-10">
              <Circle className="h-3 w-3 fill-white text-white animate-pulse" />
              <span className="text-white text-sm font-medium">
                REC {formatDuration(recordingDuration)}
              </span>
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex justify-center items-center gap-3 flex-wrap">
              {/* Recording button */}
              <Button
                size="lg"
                variant={isRecording ? 'destructive' : 'secondary'}
                className="h-14 w-14 rounded-full relative"
                onClick={handleToggleRecording}
                title={isRecording ? t('calls.stopRecording') : t('calls.startRecording')}
              >
                {isRecording ? (
                  <StopCircle className="h-6 w-6" />
                ) : (
                  <Circle className="h-6 w-6 text-red-500" />
                )}
              </Button>

              {/* Screen Share button (only for video calls) */}
              {isVideoCall && (
                <Button
                  size="lg"
                  variant={isScreenSharing ? 'default' : 'secondary'}
                  className="h-14 w-14 rounded-full"
                  onClick={handleToggleScreenShare}
                  title={isScreenSharing ? t('calls.stopScreenShare') : t('calls.startScreenShare')}
                >
                  {isScreenSharing ? (
                    <ScreenShareOff className="h-6 w-6" />
                  ) : (
                    <ScreenShare className="h-6 w-6" />
                  )}
                </Button>
              )}

              {/* Mute button */}
              <Button
                size="lg"
                variant={isMuted ? 'destructive' : 'secondary'}
                className="h-14 w-14 rounded-full"
                onClick={handleToggleMute}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>

              {/* Speaker */}
              <Button
                size="lg"
                variant={isSpeakerOff ? 'destructive' : 'secondary'}
                className="h-14 w-14 rounded-full"
                onClick={handleToggleSpeaker}
              >
                {isSpeakerOff ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </Button>

              {/* Video toggle (only for video calls) */}
              {isVideoCall && (
                <Button
                  size="lg"
                  variant={isVideoOff ? 'destructive' : 'secondary'}
                  className="h-14 w-14 rounded-full"
                  onClick={handleToggleVideo}
                >
                  {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </Button>
              )}

              {/* Switch camera (only for video calls on devices with multiple cameras) */}
              {isVideoCall && hasMultipleCams && (
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-14 w-14 rounded-full"
                  onClick={handleSwitchCamera}
                >
                  <SwitchCamera className="h-6 w-6" />
                </Button>
              )}

              {/* Fullscreen toggle */}
              {isVideoCall && (
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-14 w-14 rounded-full"
                  onClick={handleToggleFullscreen}
                >
                  {isFullscreen ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6" />}
                </Button>
              )}

              {/* End call */}
              <Button
                size="lg"
                variant="destructive"
                className="h-14 w-14 rounded-full"
                onClick={onEndCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

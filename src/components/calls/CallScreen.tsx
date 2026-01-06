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
  SignalZero
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toggleAudio, toggleVideo, formatDuration, switchCamera, hasMultipleCameras } from '@/lib/webrtc';
import type { Call } from '@/hooks/useCalls';
import { cn } from '@/lib/utils';

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

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const [hasMultipleCams, setHasMultipleCams] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    }
  }, [localStream]);

  // Set up remote video
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
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

  const handleToggleMute = () => {
    if (localStream) {
      toggleAudio(localStream, isMuted);
      setIsMuted(!isMuted);
    }
  };

  const handleToggleVideo = () => {
    if (localStream) {
      toggleVideo(localStream, isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleToggleSpeaker = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !isSpeakerOff;
      setIsSpeakerOff(!isSpeakerOff);
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
          {/* Remote video / avatar */}
          {isVideoCall && remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
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
            </div>
          )}

          {/* Status overlay for video calls */}
          {isVideoCall && remoteStream && (
            <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full flex items-center gap-2">
              {getConnectionIcon()}
              <span className="text-white text-sm">{getStatusText()}</span>
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {/* Mute */}
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

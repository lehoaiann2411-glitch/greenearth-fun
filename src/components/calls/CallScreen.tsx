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
  VolumeX 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toggleAudio, toggleVideo, formatDuration } from '@/lib/webrtc';
import type { Call } from '@/hooks/useCalls';

interface CallScreenProps {
  call: Call | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState;
  onEndCall: () => void;
  remoteName?: string;
  remoteAvatar?: string;
}

export function CallScreen({
  call,
  localStream,
  remoteStream,
  connectionState,
  onEndCall,
  remoteName,
  remoteAvatar,
}: CallScreenProps) {
  const { t } = useTranslation();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [duration, setDuration] = useState(0);

  const isVideoCall = call?.call_type === 'video';

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
        return t('calls.calling');
    }
  };

  return (
    <Dialog open={!!call}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden" hideClose>
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
            <div className="absolute top-4 right-4 w-32 h-48 rounded-lg overflow-hidden border-2 border-white/20">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            </div>
          )}

          {/* Status overlay for video calls */}
          {isVideoCall && remoteStream && (
            <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full">
              <span className="text-white text-sm">{getStatusText()}</span>
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-center gap-4">
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

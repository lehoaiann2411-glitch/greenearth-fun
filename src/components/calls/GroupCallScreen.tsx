import { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Users,
  Circle,
  StopCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/webrtc';
import { useCallRecording } from '@/hooks/useCallRecording';
import type { GroupCallParticipant, GroupCall } from '@/hooks/useGroupCall';

interface GroupCallScreenProps {
  groupCall: GroupCall;
  participants: GroupCallParticipant[];
  localStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  onLeave: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

export function GroupCallScreen({
  groupCall,
  participants,
  localStream,
  isMuted,
  isVideoOff,
  onLeave,
  onToggleMute,
  onToggleVideo,
}: GroupCallScreenProps) {
  const { t } = useTranslation();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  
  const { 
    isRecording, 
    recordingDuration, 
    startRecording, 
    stopRecording, 
    uploadRecording 
  } = useCallRecording();

  const isVideoCall = groupCall.call_type === 'video';
  const participantCount = participants.length + 1;

  // Set up local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Duration timer
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getGridClass = () => {
    if (participantCount <= 2) return 'grid-cols-1 md:grid-cols-2';
    if (participantCount <= 4) return 'grid-cols-2';
    if (participantCount <= 6) return 'grid-cols-2 md:grid-cols-3';
    return 'grid-cols-3 md:grid-cols-4';
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      const result = await stopRecording();
      if (result) {
        await uploadRecording(groupCall.id, result.blob, true);
      }
    } else if (localStream) {
      // Combine all remote streams with local
      const combinedTracks: MediaStreamTrack[] = [...localStream.getAudioTracks()];
      participants.forEach(p => {
        if (p.stream) {
          combinedTracks.push(...p.stream.getAudioTracks());
        }
      });
      
      const combinedStream = new MediaStream(combinedTracks);
      startRecording(localStream, combinedStream);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent 
        className={cn(
          "p-0 overflow-hidden",
          isFullscreen ? "w-screen h-screen max-w-none max-h-none rounded-none" : "max-w-[95vw] max-h-[95vh]"
        )} 
        hideClose
      >
        <div className="relative bg-gray-900 min-h-[600px] flex flex-col p-4">
          {/* Header with info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full text-white">
              <Users className="h-4 w-4" />
              <span className="text-sm">{participantCount} {t('calls.participants')}</span>
            </div>
            
            <div className="bg-black/50 px-3 py-1 rounded-full text-white text-sm">
              {formatDuration(duration)}
            </div>
          </div>

          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-16 right-4 bg-red-500/90 px-3 py-1 rounded-full flex items-center gap-2 z-10">
              <Circle className="h-3 w-3 fill-white text-white animate-pulse" />
              <span className="text-white text-sm font-medium">
                REC {formatDuration(recordingDuration)}
              </span>
            </div>
          )}

          {/* Participants grid */}
          <div className={cn("grid gap-2 flex-1", getGridClass())}>
            {/* Local video (self) */}
            <div className="relative rounded-lg overflow-hidden bg-gray-800 min-h-[200px]">
              {isVideoCall && localStream && !isVideoOff ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-2xl">You</AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded flex items-center gap-2">
                <span className="text-white text-sm">{t('calls.you')}</span>
                {isMuted && <MicOff className="h-3 w-3 text-red-400" />}
              </div>
            </div>
            
            {/* Remote participants */}
            {participants.map((participant) => (
              <ParticipantVideo
                key={participant.userId}
                participant={participant}
                isVideoCall={isVideoCall}
              />
            ))}
          </div>
          
          {/* Controls */}
          <div className="mt-4 flex items-center justify-center gap-3">
            {/* Mute */}
            <Button
              size="lg"
              variant={isMuted ? 'destructive' : 'secondary'}
              className="h-14 w-14 rounded-full"
              onClick={onToggleMute}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            {/* Video toggle */}
            {isVideoCall && (
              <Button
                size="lg"
                variant={isVideoOff ? 'destructive' : 'secondary'}
                className="h-14 w-14 rounded-full"
                onClick={onToggleVideo}
              >
                {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
              </Button>
            )}

            {/* Record */}
            <Button
              size="lg"
              variant={isRecording ? 'destructive' : 'secondary'}
              className="h-14 w-14 rounded-full relative"
              onClick={handleToggleRecording}
            >
              {isRecording ? (
                <>
                  <StopCircle className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                </>
              ) : (
                <Circle className="h-6 w-6 text-red-500" />
              )}
            </Button>

            {/* Fullscreen */}
            <Button
              size="lg"
              variant="secondary"
              className="h-14 w-14 rounded-full"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6" />}
            </Button>

            {/* Leave call */}
            <Button
              size="lg"
              variant="destructive"
              className="h-14 w-14 rounded-full"
              onClick={onLeave}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Separate component for participant video
function ParticipantVideo({ 
  participant, 
  isVideoCall 
}: { 
  participant: GroupCallParticipant;
  isVideoCall: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  return (
    <div className="relative rounded-lg overflow-hidden bg-gray-800 min-h-[200px]">
      {isVideoCall && participant.stream && !participant.isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <Avatar className="h-20 w-20">
            <AvatarImage src={participant.userAvatar} />
            <AvatarFallback className="text-2xl">
              {participant.userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      
      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded flex items-center gap-2">
        <span className="text-white text-sm">{participant.userName}</span>
        {participant.isMuted && <MicOff className="h-3 w-3 text-red-400" />}
      </div>
    </div>
  );
}

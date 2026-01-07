import { Phone, PhoneIncoming, PhoneMissed, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

interface CallLogPayload {
  call_id: string;
  call_type: 'voice' | 'video';
  call_status: 'ended' | 'missed' | 'rejected';
  duration_seconds: number | null;
  caller_id: string;
  callee_id: string;
}

interface CallLogMessageProps {
  payload: CallLogPayload;
  timestamp: string;
  isCurrentUserCaller: boolean;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const CallLogMessage = ({ payload, timestamp, isCurrentUserCaller }: CallLogMessageProps) => {
  const { t, i18n } = useTranslation();
  const isVietnamese = i18n.language === 'vi';
  const dateLocale = isVietnamese ? vi : enUS;

  const isMissedOrRejected = payload.call_status === 'missed' || payload.call_status === 'rejected';
  const isVideoCall = payload.call_type === 'video';

  const getCallIcon = () => {
    if (isMissedOrRejected) {
      return isVideoCall ? (
        <VideoOff className="h-5 w-5" />
      ) : (
        <PhoneMissed className="h-5 w-5" />
      );
    }
    return isVideoCall ? (
      <Video className="h-5 w-5" />
    ) : (
      <Phone className="h-5 w-5" />
    );
  };

  const getCallText = () => {
    if (isMissedOrRejected) {
      if (isCurrentUserCaller) {
        return isVietnamese ? 'Không trả lời' : 'No answer';
      }
      return isVietnamese ? 'Cuộc gọi nhỡ' : 'Missed call';
    }
    return isVideoCall
      ? (isVietnamese ? 'Cuộc gọi video' : 'Video call')
      : (isVietnamese ? 'Cuộc gọi thoại' : 'Voice call');
  };

  const getDirectionText = () => {
    if (isCurrentUserCaller) {
      return isVietnamese ? 'Cuộc gọi đi' : 'Outgoing';
    }
    return isVietnamese ? 'Cuộc gọi đến' : 'Incoming';
  };

  return (
    <div className="flex justify-center my-4">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${
        isMissedOrRejected 
          ? 'bg-destructive/10 text-destructive' 
          : 'bg-muted text-muted-foreground'
      }`}>
        <div className={`p-2 rounded-full ${
          isMissedOrRejected 
            ? 'bg-destructive/20' 
            : 'bg-primary/20 text-primary'
        }`}>
          {getCallIcon()}
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {getCallText()}
            </span>
            <span className="text-xs opacity-70">
              • {getDirectionText()}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs opacity-70">
            {!isMissedOrRejected && payload.duration_seconds != null && payload.duration_seconds > 0 && (
              <>
                <span>{formatDuration(payload.duration_seconds)}</span>
                <span>•</span>
              </>
            )}
            <span>
              {format(new Date(timestamp), 'HH:mm', { locale: dateLocale })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

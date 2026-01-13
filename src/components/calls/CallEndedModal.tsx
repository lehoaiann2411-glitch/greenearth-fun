import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Video, PhoneMissed, PhoneOff, X } from 'lucide-react';
import { formatDuration } from '@/lib/webrtc';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CallEndedModalProps {
  isOpen: boolean;
  onClose: () => void;
  callType: 'voice' | 'video';
  callStatus: 'ended' | 'missed' | 'rejected' | 'no_answer';
  duration: number;
  remoteName?: string;
  remoteAvatar?: string;
  onCallback?: () => void;
}

export function CallEndedModal({
  isOpen,
  onClose,
  callType,
  callStatus,
  duration,
  remoteName,
  remoteAvatar,
  onCallback,
}: CallEndedModalProps) {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(5);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onClose();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onClose]);

  const isSuccessfulCall = callStatus === 'ended' && duration > 0;
  const isMissedOrRejected = callStatus === 'missed' || callStatus === 'rejected' || callStatus === 'no_answer';

  const getStatusText = () => {
    switch (callStatus) {
      case 'ended':
        return t('calls.callEnded', 'Cuộc gọi đã kết thúc');
      case 'missed':
        return t('calls.missedCall', 'Cuộc gọi nhỡ');
      case 'rejected':
        return t('calls.callRejected', 'Cuộc gọi bị từ chối');
      case 'no_answer':
        return t('calls.noAnswer', 'Không trả lời');
      default:
        return t('calls.callEnded', 'Cuộc gọi đã kết thúc');
    }
  };

  const getStatusIcon = () => {
    if (isMissedOrRejected) {
      return <PhoneMissed className="h-8 w-8" />;
    }
    return callType === 'video' ? <Video className="h-8 w-8" /> : <Phone className="h-8 w-8" />;
  };

  const formatDetailedDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (mins === 0) {
      return `${secs} ${t('calls.second', 'giây')}`;
    }
    
    if (secs === 0) {
      return `${mins} ${t('calls.minute', 'phút')}`;
    }
    
    return `${mins} ${t('calls.minute', 'phút')} ${secs} ${t('calls.second', 'giây')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[360px] p-0 overflow-hidden border-0 bg-transparent shadow-2xl">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`relative rounded-2xl overflow-hidden ${
                isMissedOrRejected 
                  ? 'bg-gradient-to-b from-red-500/10 to-red-600/20 dark:from-red-900/30 dark:to-red-950/40' 
                  : 'bg-gradient-to-b from-emerald-500/10 to-emerald-600/20 dark:from-emerald-900/30 dark:to-emerald-950/40'
              }`}
            >
              {/* Background blur overlay */}
              <div className="absolute inset-0 backdrop-blur-xl bg-background/80" />
              
              {/* Content */}
              <div className="relative p-6 flex flex-col items-center">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted/50 transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>

                {/* Countdown indicator */}
                <div className="absolute top-3 left-3">
                  <div className="relative h-6 w-6">
                    <svg className="h-6 w-6 -rotate-90">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-muted/30"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={62.83}
                        strokeDashoffset={62.83 * (1 - countdown / 5)}
                        className={`transition-all duration-1000 ${
                          isMissedOrRejected ? 'text-red-500' : 'text-emerald-500'
                        }`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground">
                      {countdown}
                    </span>
                  </div>
                </div>

                {/* Avatar */}
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage src={remoteAvatar} alt={remoteName} />
                    <AvatarFallback className="text-2xl bg-muted">
                      {remoteName?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Status icon badge */}
                  <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 p-2 rounded-full shadow-lg ${
                    isMissedOrRejected 
                      ? 'bg-red-500 text-white' 
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {getStatusIcon()}
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-lg font-semibold mt-4 text-foreground">
                  {remoteName || t('common.user', 'Người dùng')}
                </h3>

                {/* Status text */}
                <p className={`text-sm mt-1 ${
                  isMissedOrRejected ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {getStatusText()}
                </p>

                {/* Duration display for successful calls */}
                {isSuccessfulCall && (
                  <div className="mt-4 text-center">
                    <p className="text-3xl font-bold text-foreground">
                      {formatDuration(duration)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDetailedDuration(duration)}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-6 w-full">
                  {isMissedOrRejected && onCallback && (
                    <Button
                      onClick={() => {
                        onCallback();
                        onClose();
                      }}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {t('calls.callback', 'Gọi lại')}
                    </Button>
                  )}
                  
                  <Button
                    onClick={onClose}
                    variant={isMissedOrRejected ? 'outline' : 'default'}
                    className={`flex-1 ${
                      !isMissedOrRejected 
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                        : ''
                    }`}
                  >
                    {t('common.done', 'Đóng')}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

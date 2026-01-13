import { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { Call } from '@/hooks/useCalls';
import { useCallSounds } from '@/hooks/useCallSounds';

interface IncomingCallModalProps {
  call: Call | null;
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCallModal({ call, onAccept, onReject }: IncomingCallModalProps) {
  const { t } = useTranslation();
  const { playRingtone, stopAllSounds } = useCallSounds();

  // Play ringtone when call comes in
  useEffect(() => {
    if (call) {
      playRingtone();
    }
    return () => stopAllSounds();
  }, [call, playRingtone, stopAllSounds]);

  const handleAccept = () => {
    stopAllSounds();
    onAccept();
  };

  const handleReject = () => {
    stopAllSounds();
    onReject();
  };

  if (!call) return null;

  const caller = call.caller;
  const isVideoCall = call.call_type === 'video';

  return (
    <Dialog open={!!call}>
      <DialogContent className="sm:max-w-md text-center" hideClose>
        <div className="flex flex-col items-center gap-6 py-6">
          {/* Animated avatar ring */}
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/30"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.2,
              }}
            />
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarImage src={caller?.avatar_url || ''} />
              <AvatarFallback className="text-2xl">
                {caller?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Caller name */}
          <div>
            <h3 className="text-xl font-semibold">{caller?.full_name || t('common.unknown')}</h3>
            <p className="text-muted-foreground mt-1">
              {isVideoCall ? t('calls.incomingVideoCall') : t('calls.incomingCall')}
            </p>
          </div>

          {/* Call icon */}
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {isVideoCall ? (
              <Video className="h-8 w-8 text-primary" />
            ) : (
              <Phone className="h-8 w-8 text-primary" />
            )}
          </motion.div>

          {/* Action buttons */}
          <div className="flex gap-6">
            <Button
              size="lg"
              variant="destructive"
              className="h-16 w-16 rounded-full"
              onClick={handleReject}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
            <Button
              size="lg"
              className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600"
              onClick={handleAccept}
            >
              {isVideoCall ? <Video className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
            </Button>
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{t('calls.decline')}</span>
            <span>{t('calls.accept')}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

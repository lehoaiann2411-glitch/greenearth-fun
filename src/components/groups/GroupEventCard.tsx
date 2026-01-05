import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, MapPin, Users, Check, Star, Coins } from 'lucide-react';
import { GroupEvent, useRSVPEvent, useCancelRSVP } from '@/hooks/useGroupEvents';
import { useAuth } from '@/contexts/AuthContext';
import { CAMLY_REWARDS } from '@/lib/camlyCoin';
import { motion } from 'framer-motion';
import { CamlyCoinInline } from '@/components/rewards/CamlyCoinIcon';

interface GroupEventCardProps {
  event: GroupEvent;
  groupId: string;
}

export function GroupEventCard({ event, groupId }: GroupEventCardProps) {
  const { user } = useAuth();
  const rsvpEvent = useRSVPEvent();
  const cancelRSVP = useCancelRSVP();

  const userStatus = event.user_rsvp?.status;
  const isGoing = userStatus === 'going';
  const isInterested = userStatus === 'interested';
  const hasRSVP = !!userStatus;

  const handleRSVP = (status: 'going' | 'interested') => {
    if (!user) return;
    rsvpEvent.mutate({ eventId: event.id, groupId, status });
  };

  const handleCancel = () => {
    if (!user) return;
    cancelRSVP.mutate({ eventId: event.id, groupId });
  };

  const eventDate = new Date(event.event_date);
  const is50Plus = event.rsvp_count >= 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-white/20 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
        {/* Cover Image */}
        <div className="relative h-32 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10">
          {event.cover_image_url ? (
            <img
              src={event.cover_image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="h-12 w-12 text-primary/50" />
            </div>
          )}

          {/* Date Badge */}
          <div className="absolute top-3 left-3 bg-white rounded-lg shadow-md p-2 text-center min-w-[60px]">
            <div className="text-xs text-muted-foreground uppercase">
              {format(eventDate, 'MMM', { locale: vi })}
            </div>
            <div className="text-xl font-bold text-foreground">
              {format(eventDate, 'd')}
            </div>
          </div>

          {/* 50+ RSVP Badge */}
          {is50Plus && (
            <Badge className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center gap-1">
              <Coins className="h-3 w-3" />
              +{CAMLY_REWARDS.GROUP_EVENT_50_RSVP.toLocaleString()} <CamlyCoinInline />
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg text-foreground mb-2">
            {event.title}
          </h3>

          {/* Details */}
          <div className="space-y-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {event.start_time && format(new Date(`2000-01-01T${event.start_time}`), 'HH:mm')}
                {event.end_time && ` - ${format(new Date(`2000-01-01T${event.end_time}`), 'HH:mm')}`}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {event.rsvp_count} người tham gia
                {event.max_attendees && ` / ${event.max_attendees}`}
              </span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {event.description}
            </p>
          )}

          {/* Creator */}
          {event.creator && (
            <div className="flex items-center gap-2 mb-4 text-sm">
              <Avatar className="h-6 w-6">
                <AvatarImage src={event.creator.avatar_url || ''} />
                <AvatarFallback className="text-xs">
                  {event.creator.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground">
                Tổ chức bởi <strong>{event.creator.full_name}</strong>
              </span>
            </div>
          )}

          {/* RSVP Buttons */}
          {user && (
            <div className="flex gap-2">
              {hasRSVP ? (
                <>
                  <Button
                    variant={isGoing ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => isGoing ? handleCancel() : handleRSVP('going')}
                    className={isGoing ? 'bg-primary' : ''}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {isGoing ? 'Sẽ tham gia' : 'Tham gia'}
                  </Button>
                  <Button
                    variant={isInterested ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => isInterested ? handleCancel() : handleRSVP('interested')}
                  >
                    <Star className={`h-4 w-4 mr-1 ${isInterested ? 'fill-current' : ''}`} />
                    Quan tâm
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleRSVP('going')}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Tham gia
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRSVP('interested')}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Quan tâm
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

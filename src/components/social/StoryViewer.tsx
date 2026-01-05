import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Eye, MapPin } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useViewStory, useReactToStory, useReplyToStory, useStoryViewers, Story } from '@/hooks/useStories';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { StoryReactionsBar } from '@/components/stories/StoryReactionsBar';
import { StoryReplyInput } from '@/components/stories/StoryReplyInput';
import { StoryViewersList } from '@/components/stories/StoryViewersList';

interface StoryViewerProps {
  stories: Story[];
  user: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  initialIndex?: number;
  onClose: () => void;
  onNextUser: () => void;
  onPrevUser: () => void;
}

const STORY_DURATION = 5000;

export function StoryViewer({ 
  stories, 
  user, 
  initialIndex = 0, 
  onClose, 
  onNextUser, 
  onPrevUser 
}: StoryViewerProps) {
  const { user: currentUser } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<string | null>(null);
  
  const viewStory = useViewStory();
  const reactToStory = useReactToStory();
  const replyToStory = useReplyToStory();

  const currentStory = stories[currentIndex];
  const isOwnStory = currentUser?.id === user.id;

  const { data: viewers } = useStoryViewers(isOwnStory ? currentStory?.id : '');

  // Mark story as viewed
  useEffect(() => {
    if (currentStory && !isOwnStory) {
      viewStory.mutate(currentStory.id);
    }
  }, [currentStory?.id, isOwnStory]);

  // Auto-advance stories
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(i => i + 1);
            return 0;
          } else {
            onNextUser();
            return 0;
          }
        }
        return prev + (100 / (STORY_DURATION / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, stories.length, isPaused, onNextUser]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
    setCurrentReaction(null);
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(i => i + 1);
      setProgress(0);
    } else {
      onNextUser();
    }
  }, [currentIndex, stories.length, onNextUser]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setProgress(0);
    } else {
      onPrevUser();
    }
  }, [currentIndex, onPrevUser]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') setIsPaused(p => !p);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  const handleReact = async (reaction: string) => {
    if (!currentStory || isOwnStory) return;
    
    setCurrentReaction(reaction);
    try {
      await reactToStory.mutateAsync({ 
        storyId: currentStory.id, 
        reactionType: reaction 
      });
      toast.success(
        <div className="flex items-center gap-2">
          <span>{reaction}</span>
          <span className="flex items-center gap-1 text-camly-gold">
            +50 <CamlyCoinIcon size="sm" />
          </span>
        </div>
      );
    } catch (error) {
      setCurrentReaction(null);
    }
  };

  const handleReply = async (message: string, isGreen: boolean) => {
    if (!currentStory) return;
    
    try {
      const result = await replyToStory.mutateAsync({ 
        storyId: currentStory.id, 
        content: message 
      });
      
      toast.success(
        <div className="flex items-center gap-2">
          <span>{isGreen ? '🌱 Green reply sent!' : 'Reply sent!'}</span>
          <span className="flex items-center gap-1 text-camly-gold">
            +{result.camlyAmount} <CamlyCoinIcon size="sm" />
          </span>
        </div>
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reply');
    }
  };

  if (!currentStory) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
        {stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ 
                width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%' 
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-white">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback>{user.full_name?.[0] || '🌱'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-semibold text-sm">{user.full_name || 'User'}</p>
            <div className="flex items-center gap-2 text-white/70 text-xs">
              <span>{formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true })}</span>
              {currentStory.location_name && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {currentStory.location_name}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Story content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStory.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          className="w-full max-w-lg aspect-[9/16] relative"
        >
          {currentStory.media_type === 'video' ? (
            <video
              src={currentStory.media_url}
              className="w-full h-full object-cover rounded-lg"
              autoPlay
              muted
              playsInline
            />
          ) : (
            <img
              src={currentStory.media_url}
              alt="Story"
              className="w-full h-full object-cover rounded-lg"
            />
          )}

          {/* Text Overlays */}
          {Array.isArray(currentStory.text_overlays) && currentStory.text_overlays.map((overlay: any) => (
            <div
              key={overlay.id}
              className="absolute select-none pointer-events-none"
              style={{
                left: `${overlay.x}%`,
                top: `${overlay.y}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: overlay.fontSize,
                color: overlay.color,
                fontFamily: overlay.fontFamily === 'serif' ? 'serif' : overlay.fontFamily === 'mono' ? 'monospace' : 'sans-serif',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {overlay.text}
            </div>
          ))}

          {/* Sticker Overlays */}
          {Array.isArray(currentStory.stickers) && currentStory.stickers.map((sticker: any) => (
            <div
              key={sticker.id}
              className="absolute select-none pointer-events-none"
              style={{
                left: `${sticker.x}%`,
                top: `${sticker.y}%`,
                transform: `translate(-50%, -50%) scale(${sticker.scale})`,
              }}
            >
              {sticker.text ? (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/80 rounded-full text-white text-sm font-bold">
                  <span className="text-lg">{sticker.emoji}</span>
                  <span>{sticker.text}</span>
                </div>
              ) : (
                <span className="text-4xl drop-shadow-lg">{sticker.emoji}</span>
              )}
            </div>
          ))}

          {/* Caption */}
          {currentStory.caption && (
            <div className="absolute bottom-32 left-4 right-4 text-center">
              <p className="text-white text-lg font-medium drop-shadow-lg">
                {currentStory.caption}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom section */}
      <div className="absolute bottom-4 left-4 right-4 z-10 space-y-3">
        {/* Views count - for own stories */}
        {isOwnStory && (
          <button 
            onClick={() => setShowViewers(true)}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <Eye className="w-5 h-5" />
            <span className="text-sm">{currentStory.views_count} views</span>
          </button>
        )}

        {/* Reactions bar - for other's stories */}
        {!isOwnStory && (
          <div className="flex justify-center">
            <StoryReactionsBar 
              onReact={handleReact} 
              currentReaction={currentReaction || undefined}
            />
          </div>
        )}

        {/* Reply input - for other's stories */}
        {!isOwnStory && (
          <StoryReplyInput 
            onSendReply={handleReply}
            disabled={replyToStory.isPending}
          />
        )}
      </div>

      {/* Navigation buttons */}
      <button
        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleNext(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Click areas for navigation */}
      <div className="absolute inset-0 flex pointer-events-none">
        <div className="w-1/3 h-full cursor-pointer pointer-events-auto" onClick={handlePrev} />
        <div className="w-1/3 h-full" />
        <div className="w-1/3 h-full cursor-pointer pointer-events-auto" onClick={handleNext} />
      </div>

      {/* Viewers List Modal */}
      <AnimatePresence>
        {showViewers && viewers && (
          <StoryViewersList 
            viewers={viewers} 
            onClose={() => setShowViewers(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

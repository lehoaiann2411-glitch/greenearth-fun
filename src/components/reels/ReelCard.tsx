import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Gift, Music, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ReelPlayer } from './ReelPlayer';
import { ReelComments } from './ReelComments';
import { ReelGiftModal } from './ReelGiftModal';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { useLikeReel, useShareReel, useRecordReelView, type Reel } from '@/hooks/useReels';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ReelCardProps {
  reel: Reel;
  isActive: boolean;
}

export function ReelCard({ reel, isActive }: ReelCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [localLiked, setLocalLiked] = useState(reel.user_has_liked || false);
  const [localLikesCount, setLocalLikesCount] = useState(reel.likes_count);
  const hasRecordedView = useRef(false);

  const likeMutation = useLikeReel();
  const shareMutation = useShareReel();
  const recordView = useRecordReelView();

  // Record view when active - use useEffect to prevent infinite loops
  useEffect(() => {
    if (isActive && user && !hasRecordedView.current) {
      hasRecordedView.current = true;
      recordView.mutate({ reelId: reel.id, watchedSeconds: 5 });
    }
    if (!isActive) {
      hasRecordedView.current = false;
    }
  }, [isActive, user, reel.id]);

  const handleLike = () => {
    if (!user) return;
    
    const wasLiked = localLiked;
    setLocalLiked(!wasLiked);
    setLocalLikesCount(prev => wasLiked ? prev - 1 : prev + 1);
    
    if (!wasLiked) {
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 1000);
    }

    likeMutation.mutate({ reelId: reel.id, isLiked: wasLiked });
  };

  const handleDoubleTap = () => {
    if (!localLiked) {
      handleLike();
    } else {
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 1000);
    }
  };

  const handleShare = () => {
    if (!user) return;
    shareMutation.mutate({ reelId: reel.id });
    
    // Copy link to clipboard
    navigator.clipboard.writeText(`${window.location.origin}/reels/${reel.id}`);
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="relative w-full h-full snap-start snap-always">
      {/* Video Player */}
      <ReelPlayer
        videoUrl={reel.video_url}
        isActive={isActive}
        onDoubleTap={handleDoubleTap}
      />

      {/* Double-tap Heart Animation */}
      <AnimatePresence>
        {showHeartAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            <Heart className="h-32 w-32 text-red-500 fill-red-500 drop-shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* Right Side Actions */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-10">
        {/* Creator Avatar */}
        <Link to={`/profile/${reel.user_id}`}>
          <div className="relative">
            <Avatar className="h-12 w-12 ring-2 ring-white shadow-lg">
              <AvatarImage src={reel.profiles?.avatar_url || ''} />
              <AvatarFallback className="bg-emerald-500 text-white">
                {reel.profiles?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="text-white text-xs">+</span>
            </div>
          </div>
        </Link>

        {/* Like Button */}
        <motion.button
          onClick={handleLike}
          whileTap={{ scale: 1.2 }}
          className="flex flex-col items-center gap-1"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            localLiked ? 'bg-red-500/20' : 'bg-white/10'
          }`}>
            <Heart className={`h-7 w-7 ${localLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
          </div>
          <span className="text-white text-xs font-medium">{formatCount(localLikesCount)}</span>
        </motion.button>

        {/* Comment Button */}
        <motion.button
          onClick={() => setShowComments(true)}
          whileTap={{ scale: 1.1 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <MessageCircle className="h-7 w-7 text-white" />
          </div>
          <span className="text-white text-xs font-medium">{formatCount(reel.comments_count)}</span>
        </motion.button>

        {/* Share Button */}
        <motion.button
          onClick={handleShare}
          whileTap={{ scale: 1.1 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <Share2 className="h-7 w-7 text-white" />
          </div>
          <span className="text-white text-xs font-medium">{formatCount(reel.shares_count || 0)}</span>
        </motion.button>

        {/* Gift Camly Button */}
        {user && user.id !== reel.user_id && (
          <motion.button
            onClick={() => setShowGiftModal(true)}
            whileTap={{ scale: 1.1 }}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <CamlyCoinIcon size="sm" />
            </div>
            <span className="text-yellow-400 text-xs font-medium">Tặng</span>
          </motion.button>
        )}
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-4 left-3 right-20 z-10">
        {/* Creator Info */}
        <Link to={`/profile/${reel.user_id}`} className="flex items-center gap-2 mb-2">
          <span className="text-white font-bold text-base">
            @{reel.profiles?.full_name || 'User'}
          </span>
          <span className="text-white/60 text-sm">
            · {formatDistanceToNow(new Date(reel.created_at), { addSuffix: true, locale: vi })}
          </span>
        </Link>

        {/* Caption */}
        {reel.caption && (
          <p className="text-white text-sm leading-relaxed mb-2 line-clamp-2">
            {reel.caption}
          </p>
        )}

        {/* Hashtags */}
        {reel.hashtags && reel.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {reel.hashtags.slice(0, 5).map((tag, idx) => (
              <span key={idx} className="text-emerald-400 text-sm font-medium">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}

        {/* Location */}
        {reel.location_name && (
          <div className="flex items-center gap-1 text-white/70 text-sm mb-2">
            <MapPin className="h-3 w-3" />
            <span>{reel.location_name}</span>
          </div>
        )}

        {/* Music */}
        {reel.music_name && (
          <div className="flex items-center gap-2 bg-black/30 rounded-full px-3 py-1.5 w-fit">
            <Music className="h-3 w-3 text-white animate-spin" style={{ animationDuration: '3s' }} />
            <span className="text-white text-xs truncate max-w-[150px]">{reel.music_name}</span>
          </div>
        )}
      </div>

      {/* Comments Sheet */}
      <ReelComments
        reelId={reel.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />

      {/* Gift Modal */}
      <ReelGiftModal
        reelId={reel.id}
        receiverId={reel.user_id}
        receiverName={reel.profiles?.full_name || 'User'}
        isOpen={showGiftModal}
        onClose={() => setShowGiftModal(false)}
      />
    </div>
  );
}

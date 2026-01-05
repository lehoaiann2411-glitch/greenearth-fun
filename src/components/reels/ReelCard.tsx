import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Music, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReelPlayer } from './ReelPlayer';
import { ReelComments } from './ReelComments';
import { ReelGiftModal } from './ReelGiftModal';
import { ShareReelModal } from './ShareReelModal';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { useLikeReel, useRecordReelView, REEL_REWARDS, type Reel } from '@/hooks/useReels';
import { useAuth } from '@/contexts/AuthContext';

interface ReelCardProps {
  reel: Reel;
  isActive: boolean;
}

export function ReelCard({ reel, isActive }: ReelCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [localLiked, setLocalLiked] = useState(reel.user_has_liked || false);
  const [localLikesCount, setLocalLikesCount] = useState(reel.likes_count);
  const [isSaved, setIsSaved] = useState(false);
  const hasRecordedView = useRef(false);

  const likeMutation = useLikeReel();
  const recordView = useRecordReelView();

  // Record view when active
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

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="relative w-full h-full">
      {/* Video Player - Full Screen */}
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
            <Heart className="h-32 w-32 text-emerald-500 fill-emerald-500 drop-shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Side Actions - TikTok Style */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-10">
        {/* Creator Avatar with Follow */}
        <div className="relative mb-2">
          <Link to={`/profile/${reel.user_id}`}>
            <Avatar className="h-12 w-12 ring-2 ring-white shadow-lg">
              <AvatarImage src={reel.profiles?.avatar_url || ''} />
              <AvatarFallback className="bg-emerald-500 text-white font-bold">
                {reel.profiles?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
          {user && user.id !== reel.user_id && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg"
            >
              <UserPlus className="h-3 w-3 text-white" />
            </motion.button>
          )}
        </div>

        {/* Like Button - Leaf Heart Style */}
        <motion.button
          onClick={handleLike}
          whileTap={{ scale: 1.3 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={localLiked ? { scale: [1, 1.2, 1] } : {}}
            className="relative"
          >
            <Heart 
              className={`h-8 w-8 transition-colors ${
                localLiked 
                  ? 'text-emerald-500 fill-emerald-500' 
                  : 'text-white'
              }`} 
            />
            {localLiked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 text-xs"
              >
                🌿
              </motion.div>
            )}
          </motion.div>
          <span className="text-white text-xs font-semibold mt-1">{formatCount(localLikesCount)}</span>
        </motion.button>

        {/* Comment Button */}
        <motion.button
          onClick={() => setShowComments(true)}
          whileTap={{ scale: 1.1 }}
          className="flex flex-col items-center"
        >
          <MessageCircle className="h-8 w-8 text-white" />
          <span className="text-white text-xs font-semibold mt-1">{formatCount(reel.comments_count)}</span>
        </motion.button>

        {/* Share Button - Prominent with Reward */}
        <motion.button
          onClick={() => setShowShareModal(true)}
          whileTap={{ scale: 1.1 }}
          className="flex flex-col items-center relative"
        >
          <div className="relative">
            <svg 
              className="h-8 w-8 text-white" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2"
            >
              <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center">
                <span className="text-[8px] text-black font-bold">+</span>
              </div>
            </motion.div>
          </div>
          <span className="text-white text-xs font-semibold mt-1">{formatCount(reel.shares_count || 0)}</span>
        </motion.button>

        {/* Bookmark Button */}
        <motion.button
          onClick={handleSave}
          whileTap={{ scale: 1.1 }}
          className="flex flex-col items-center"
        >
          <Bookmark 
            className={`h-8 w-8 transition-colors ${
              isSaved ? 'text-yellow-500 fill-yellow-500' : 'text-white'
            }`} 
          />
        </motion.button>

        {/* Gift Camly Button */}
        {user && user.id !== reel.user_id && (
          <motion.button
            onClick={() => setShowGiftModal(true)}
            whileTap={{ scale: 1.1 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30"
            >
              <CamlyCoinIcon size="sm" />
            </motion.div>
          </motion.button>
        )}
      </div>

      {/* Bottom Left Info - Caption, Hashtags, Music */}
      <div className="absolute bottom-20 left-4 right-20 z-10">
        {/* Creator Name */}
        <Link to={`/profile/${reel.user_id}`}>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-white font-bold text-base mb-2"
          >
            @{reel.profiles?.full_name || 'User'}
          </motion.p>
        </Link>

        {/* Caption */}
        {reel.caption && (
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white text-sm leading-relaxed mb-2 line-clamp-2"
          >
            {reel.caption}
          </motion.p>
        )}

        {/* Hashtags */}
        {reel.hashtags && reel.hashtags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-1 mb-3"
          >
            {reel.hashtags.slice(0, 4).map((tag, idx) => (
              <span key={idx} className="text-emerald-400 text-sm font-medium">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </motion.div>
        )}

        {/* Music - Scrolling */}
        {reel.music_name && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center ring-2 ring-gray-600"
            >
              <Music className="h-4 w-4 text-white" />
            </motion.div>
            <div className="overflow-hidden max-w-[180px]">
              <motion.p
                animate={{ x: [0, -100, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="text-white text-xs whitespace-nowrap"
              >
                {reel.music_name} • {reel.music_name}
              </motion.p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

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

      {/* Share Modal */}
      <ShareReelModal
        reelId={reel.id}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
}

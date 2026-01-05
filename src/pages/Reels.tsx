import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronUp, X } from 'lucide-react';
import { ReelCard } from '@/components/reels/ReelCard';
import { ReelCreateButton } from '@/components/reels/ReelCreateButton';
import { useReelsFeed, REEL_REWARDS } from '@/hooks/useReels';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
export default function Reels() {
  const { reelId } = useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    navigate(-1);
  };

  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isLoading,
    isFetchingNextPage 
  } = useReelsFeed();

  const reels = data?.pages.flat() || [];

  // Handle scroll snap
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / itemHeight);
      
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }

      // Load more when near the end
      if (newIndex >= reels.length - 3 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex, reels.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Navigate to specific reel if reelId is provided
  useEffect(() => {
    if (reelId && reels.length > 0) {
      const index = reels.findIndex(r => r.id === reelId);
      if (index !== -1) {
        setCurrentIndex(index);
        containerRef.current?.scrollTo({
          top: index * (containerRef.current?.clientHeight || 0),
          behavior: 'smooth'
        });
      }
    }
  }, [reelId, reels]);

  return (
    <div className="fixed inset-0 bg-black">
      {/* Close Button - Top Left */}
      <button
        onClick={handleClose}
        className="absolute top-4 left-4 z-40 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Top Tabs - Small Pills */}
      <div className="absolute top-0 left-0 right-0 z-30 flex justify-center pt-4 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button
            onClick={() => setActiveTab('for-you')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
              activeTab === 'for-you' 
                ? 'text-white' 
                : 'text-white/50'
            }`}
          >
            For You
            {activeTab === 'for-you' && (
              <motion.div 
                layoutId="activeTab"
                className="h-0.5 bg-white mt-1 rounded-full"
              />
            )}
          </button>
          <span className="text-white/30">|</span>
          <button
            onClick={() => setActiveTab('following')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
              activeTab === 'following' 
                ? 'text-white' 
                : 'text-white/50'
            }`}
          >
            Following
            {activeTab === 'following' && (
              <motion.div 
                layoutId="activeTab"
                className="h-0.5 bg-white mt-1 rounded-full"
              />
            )}
          </button>
        </div>
      </div>

      {/* Reels Feed - Full Screen Vertical Scroll */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-white/70">Loading reels...</p>
            </div>
          </div>
        ) : reels.length > 0 ? (
          reels.map((reel, index) => (
            <div key={reel.id} className="h-full w-full snap-start snap-always">
              <ReelCard reel={reel} isActive={index === currentIndex} />
            </div>
          ))
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center px-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-7xl mb-6"
              >
                🌱
              </motion.div>
              <h2 className="text-white text-2xl font-bold mb-3">No Reels Yet</h2>
              <p className="text-white/60 mb-6 max-w-xs mx-auto">
                Be the first to share your green journey with the community!
              </p>
              <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm bg-yellow-500/10 rounded-full px-4 py-2 w-fit mx-auto">
                <CamlyCoinIcon size="sm" />
                <span>+{REEL_REWARDS.CREATE.toLocaleString()} for posting</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading more indicator */}
        {isFetchingNextPage && (
          <div className="h-20 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Create Button - Bottom Center */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <ReelCreateButton />
      </div>

      {/* Swipe Up Hint - First reel only */}
      <AnimatePresence>
        {reels.length > 1 && currentIndex === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2 }}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex flex-col items-center text-white/60 text-xs"
            >
              <ChevronUp className="h-5 w-5" />
              <span>Swipe up</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

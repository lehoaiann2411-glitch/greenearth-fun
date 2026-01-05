import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { ChevronUp, ChevronDown, Compass, Sparkles } from 'lucide-react';
import { ReelCard } from '@/components/reels/ReelCard';
import { ReelCreateButton } from '@/components/reels/ReelCreateButton';
import { TrendingHashtags } from '@/components/reels/TrendingHashtags';
import { useReelsFeed, useDiscoverReels, REEL_REWARDS } from '@/hooks/useReels';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function Reels() {
  const { reelId } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'for-you' | 'discover'>('for-you');
  const containerRef = useRef<HTMLDivElement>(null);

  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isLoading,
    isFetchingNextPage 
  } = useReelsFeed();

  const { data: discoverReels } = useDiscoverReels();

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

  const scrollToNext = () => {
    if (currentIndex < reels.length - 1) {
      containerRef.current?.scrollTo({
        top: (currentIndex + 1) * (containerRef.current?.clientHeight || 0),
        behavior: 'smooth'
      });
    }
  };

  const scrollToPrev = () => {
    if (currentIndex > 0) {
      containerRef.current?.scrollTo({
        top: (currentIndex - 1) * (containerRef.current?.clientHeight || 0),
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/50 to-transparent">
        <h1 className="text-white font-bold text-xl flex items-center gap-2">
          <span className="text-2xl">🎬</span> Reels
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('for-you')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'for-you' 
                ? 'bg-white text-black' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            Dành cho bạn
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'discover' 
                ? 'bg-white text-black' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Compass className="h-4 w-4 inline mr-1" />
            Khám phá
          </button>
        </div>
      </div>

      {activeTab === 'for-you' ? (
        <>
          {/* Reels Feed */}
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
                  <p className="text-white/70">Đang tải reels...</p>
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
                    className="text-6xl mb-4"
                  >
                    🎬
                  </motion.div>
                  <h2 className="text-white text-xl font-bold mb-2">Chưa có Reel nào</h2>
                  <p className="text-white/60 mb-6">
                    Hãy là người đầu tiên chia sẻ video xanh của bạn!
                  </p>
                  <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm">
                    <CamlyCoinIcon size="sm" />
                    <span>Nhận +{REEL_REWARDS.CREATE.toLocaleString()} Camly khi đăng reel</span>
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

          {/* Navigation Arrows (Desktop) */}
          <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 flex-col gap-2 z-20">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToPrev}
              disabled={currentIndex === 0}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-30"
            >
              <ChevronUp className="h-6 w-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToNext}
              disabled={currentIndex === reels.length - 1}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-30"
            >
              <ChevronDown className="h-6 w-6" />
            </motion.button>
          </div>
        </>
      ) : (
        /* Discover Tab */
        <div className="h-full pt-16 pb-20 overflow-y-auto bg-gradient-to-b from-gray-900 to-black">
          <TrendingHashtags />

          <div className="px-4 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <h3 className="font-bold text-lg text-white">Reels nổi bật</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {discoverReels?.slice(0, 10).map((reel) => (
                <motion.div
                  key={reel.id}
                  whileHover={{ scale: 1.02 }}
                  className="relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-800"
                  onClick={() => {
                    setActiveTab('for-you');
                    // Navigate to reel
                  }}
                >
                  <video
                    src={reel.video_url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-xs line-clamp-2">{reel.caption}</p>
                    <div className="flex items-center gap-2 mt-1 text-white/70 text-xs">
                      <span>❤️ {reel.likes_count}</span>
                      <span>👁️ {reel.views_count}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Button */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
        <ReelCreateButton />
      </div>

      {/* Swipe Hint */}
      {reels.length > 0 && currentIndex === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center text-white/50 text-sm"
          >
            <ChevronUp className="h-5 w-5" />
            <span>Vuốt lên để xem tiếp</span>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

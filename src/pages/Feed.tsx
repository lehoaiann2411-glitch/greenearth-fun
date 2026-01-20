import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Radio, ChevronRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { StoriesBar } from '@/components/social/StoriesBar';
import { CreatePostEnhanced } from '@/components/social/CreatePostEnhanced';
import { PostCardEnhanced } from '@/components/social/PostCardEnhanced';
import { FeedFilters } from '@/components/feed/FeedFilters';
import { SuggestedUsers } from '@/components/feed/SuggestedUsers';
import { TopRankingWidget } from '@/components/feed/TopRankingWidget';
import { FeedSearchBar } from '@/components/feed/FeedSearchBar';
import { useFeed } from '@/hooks/useFeed';
import { useAuth } from '@/contexts/AuthContext';
import { useLiveStreams } from '@/hooks/useLiveStream';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type FeedFilter = 'all' | 'following' | 'popular' | 'campaigns';

export default function Feed() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState<FeedFilter>('all');
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeed(filter);
  const { data: liveStreams } = useLiveStreams();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });
    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  const allPosts = data?.pages.flatMap(page => page.posts) || [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Top Ranking */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <TopRankingWidget />
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4">
            {/* Live Now Section */}
            {liveStreams && liveStreams.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500/10 via-pink-500/10 to-red-500/10 border border-red-500/20 p-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 animate-pulse" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Radio className="h-5 w-5 text-red-500 animate-pulse" />
                      <span className="font-semibold text-foreground">Đang phát trực tiếp</span>
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">
                        {liveStreams.length}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate('/live')}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      Xem tất cả
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                    {liveStreams.slice(0, 5).map((stream) => (
                      <motion.button
                        key={stream.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/live/${stream.id}`)}
                        className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-gray-800/80 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors border border-red-500/20"
                      >
                        <div className="relative">
                          <Avatar className="h-8 w-8 ring-2 ring-red-500 ring-offset-2 ring-offset-background">
                            <AvatarImage src={stream.profiles?.avatar_url || ''} />
                            <AvatarFallback>{stream.profiles?.full_name?.[0] || '?'}</AvatarFallback>
                          </Avatar>
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-medium text-foreground line-clamp-1 max-w-[100px]">
                            {stream.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {stream.viewer_count || 0} người xem
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Stories Bar */}
            <Card className="overflow-hidden bg-white dark:bg-gray-900 border-white/50 dark:border-gray-700 shadow-md">
              <StoriesBar />
            </Card>

            {/* Create Post */}
            {user && <CreatePostEnhanced />}

            {/* Feed Filters */}
            <FeedFilters activeFilter={filter} onFilterChange={setFilter} />

            {/* Posts Feed */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4 space-y-4 bg-white dark:bg-gray-900 shadow-md border-white/50 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                  </Card>
                ))}
              </div>
            ) : allPosts.length === 0 ? (
              <Card className="p-8 text-center bg-white dark:bg-gray-900 shadow-md border-white/50 dark:border-gray-700">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{t('feed.noPostsYet')}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {filter === 'following' 
                    ? t('feed.followToSee')
                    : t('feed.beFirst')}
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {allPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                  >
                    <PostCardEnhanced post={post} />
                  </motion.div>
                ))}

                {/* Load more trigger */}
                <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
                  {isFetchingNextPage && (
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <FeedSearchBar />
              <SuggestedUsers />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

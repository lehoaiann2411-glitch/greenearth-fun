import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { StoriesBar } from '@/components/social/StoriesBar';
import { CreatePostEnhanced } from '@/components/social/CreatePostEnhanced';
import { PostCardEnhanced } from '@/components/social/PostCardEnhanced';
import { FeedFilters } from '@/components/feed/FeedFilters';
import { SuggestedUsers } from '@/components/feed/SuggestedUsers';
import { useFeed } from '@/hooks/useFeed';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

type FeedFilter = 'all' | 'following' | 'popular' | 'campaigns';

export default function Feed() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FeedFilter>('all');
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeed(filter);
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
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4">
            {/* Stories Bar */}
            <Card className="overflow-hidden">
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
                  <Card key={i} className="p-4 space-y-4">
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
              <Card className="p-8 text-center">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  {filter === 'following' 
                    ? 'Follow some green warriors to see their posts here!'
                    : 'Be the first to share your eco-journey!'}
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

          {/* Sidebar */}
          <div className="hidden lg:block space-y-4">
            <SuggestedUsers />
          </div>
        </div>
      </div>
    </Layout>
  );
}

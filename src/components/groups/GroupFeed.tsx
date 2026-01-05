import { useGroupPosts } from '@/hooks/useGroupPosts';
import { useGroupMembership } from '@/hooks/useGroups';
import { GroupPostCard } from './GroupPostCard';
import { CreateGroupPost } from './CreateGroupPost';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

interface GroupFeedProps {
  groupId: string;
}

export function GroupFeed({ groupId }: GroupFeedProps) {
  const { user } = useAuth();
  const { data: membership } = useGroupMembership(groupId);
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGroupPosts(groupId);

  const { ref, inView } = useInView();

  const isMember = membership?.status === 'approved';
  const isAdmin = membership?.role === 'admin';

  // Auto-load more when scrolling
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flat() || [];

  return (
    <div className="space-y-4">
      {/* Create Post */}
      {isMember && (
        <CreateGroupPost groupId={groupId} isAdmin={isAdmin} />
      )}

      {/* Posts */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Chưa có bài viết nào
          </h3>
          <p className="text-muted-foreground">
            {isMember
              ? 'Hãy là người đầu tiên đăng bài trong nhóm!'
              : 'Tham gia nhóm để xem và đăng bài viết.'}
          </p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <GroupPostCard
              key={post.id}
              post={post}
              groupId={groupId}
              isAdmin={isAdmin}
            />
          ))}

          {/* Load More Trigger */}
          <div ref={ref} className="py-4 flex justify-center">
            {isFetchingNextPage && (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            )}
            {hasNextPage && !isFetchingNextPage && (
              <Button variant="outline" onClick={() => fetchNextPage()}>
                Tải thêm
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

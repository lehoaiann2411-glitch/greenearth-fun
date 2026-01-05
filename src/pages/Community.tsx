import { Layout } from '@/components/layout/Layout';
import { usePosts } from '@/hooks/usePosts';
import { CreatePost } from '@/components/social/CreatePost';
import { PostCard } from '@/components/social/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Leaf } from 'lucide-react';

export default function Community() {
  const { data: posts, isLoading } = usePosts();

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Cộng đồng <span className="text-gradient-forest">Xanh</span>
          </h1>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Chia sẻ hoạt động xanh và kết nối với những người bạn cùng chí hướng
          </p>
        </div>

        <div className="mx-auto max-w-2xl space-y-6">
          {/* Create Post */}
          <CreatePost />

          {/* Posts Feed */}
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="mt-1 h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="mt-4 h-20 w-full" />
                  <div className="mt-4 flex gap-4">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed p-12 text-center">
              <Leaf className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-medium">Chưa có bài viết nào</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Hãy là người đầu tiên chia sẻ hoạt động xanh!
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

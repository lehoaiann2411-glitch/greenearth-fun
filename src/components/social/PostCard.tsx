import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Post, useLikePost, useDeletePost, useSharePost } from '@/hooks/usePosts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CommentSection } from './CommentSection';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, TreePine, Copy, Twitter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getRankByPoints } from '@/lib/greenRanks';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CamlyCoinInline } from '@/components/rewards/CamlyCoinIcon';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const likePost = useLikePost();
  const deletePost = useDeletePost();
  const sharePost = useSharePost();

  const isOwner = user?.id === post.user_id;
  const rank = post.profile ? getRankByPoints(post.profile.green_points) : null;

  const handleLike = async () => {
    if (!user || isLiking) return;
    setIsLiking(true);
    await likePost.mutateAsync({
      postId: post.id,
      isLiked: post.user_liked || false,
    });
    setIsLiking(false);
  };

  const handleDelete = async () => {
    if (confirm('Xóa bài viết này?')) {
      await deletePost.mutateAsync(post.id);
    }
  };

  const handleShare = async (type: 'copy' | 'twitter' = 'copy') => {
    const url = window.location.origin + `/community?post=${post.id}`;
    
    if (type === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content.substring(0, 100))}&url=${encodeURIComponent(url)}`,
        '_blank'
      );
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: 'Green Earth Post',
          text: post.content.substring(0, 100),
          url,
        });
      } catch {
        // User cancelled share
        return;
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }

    // Track share and award Camly Coin
    if (user) {
      await sharePost.mutateAsync({ postId: post.id, shareType: type });
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <Link to={`/profile?id=${post.user_id}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.profile?.avatar_url || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {post.profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/profile?id=${post.user_id}`}
                  className="font-medium hover:underline"
                >
                  {post.profile?.full_name || 'Người dùng'}
                </Link>
                {rank && (
                  <Badge variant="secondary" className={cn('text-xs', rank.colorClass)}>
                    {rank.name}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: vi,
                })}
              </p>
            </div>
          </div>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa bài viết
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <div className="mt-3">
          <p className="whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Campaign Badge */}
        {post.campaign && (
          <Link to={`/campaigns/${post.campaign.id}`}>
            <Badge variant="outline" className="mt-3 gap-1">
              <TreePine className="h-3 w-3" />
              {post.campaign.title}
            </Badge>
          </Link>
        )}

        {/* Image */}
        {post.image_url && (
          <div className="mt-3 overflow-hidden rounded-lg">
            <img
              src={post.image_url}
              alt="Post image"
              className="w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={!user || isLiking}
              className={cn(
                'gap-1',
                post.user_liked && 'text-red-500 hover:text-red-600'
              )}
            >
              <Heart
                className={cn('h-4 w-4', post.user_liked && 'fill-current')}
              />
              {post.likes_count > 0 && post.likes_count}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="gap-1"
            >
              <MessageCircle className="h-4 w-4" />
              {post.comments_count > 0 && post.comments_count}
            </Button>

            {/* Share Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Share2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleShare('copy')}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy link (+1,500 <CamlyCoinInline />)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('twitter')}>
                  <Twitter className="mr-2 h-4 w-4" />
                  Share on X (+1,500 <CamlyCoinInline />)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-3">
            <CommentSection postId={post.id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, MoreHorizontal, Pin, Trash2, Megaphone, Coins } from 'lucide-react';
import { GroupPost, useLikeGroupPost, useUnlikeGroupPost, usePinGroupPost, useDeleteGroupPost } from '@/hooks/useGroupPosts';
import { useAuth } from '@/contexts/AuthContext';
import { FEELINGS } from '@/lib/camlyCoin';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

interface GroupPostCardProps {
  post: GroupPost;
  groupId: string;
  isAdmin?: boolean;
}

export function GroupPostCard({ post, groupId, isAdmin = false }: GroupPostCardProps) {
  const { user } = useAuth();
  const likePost = useLikeGroupPost();
  const unlikePost = useUnlikeGroupPost();
  const pinPost = usePinGroupPost();
  const deletePost = useDeleteGroupPost();
  
  const [showComments, setShowComments] = useState(false);

  const isAuthor = user?.id === post.user_id;
  const feeling = post.feeling ? FEELINGS.find(f => f.id === post.feeling) : null;

  const handleLike = () => {
    if (!user) return;
    
    if (post.is_liked) {
      unlikePost.mutate({ postId: post.id, groupId });
    } else {
      likePost.mutate({ postId: post.id, groupId });
    }
  };

  const handlePin = () => {
    pinPost.mutate({ postId: post.id, groupId, isPinned: !post.is_pinned });
  };

  const handleDelete = () => {
    if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
      deletePost.mutate({ postId: post.id, groupId });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border-white/20 bg-white/80 backdrop-blur-sm ${post.is_pinned ? 'ring-2 ring-primary/30' : ''}`}>
        <CardContent className="p-4">
          {/* Pinned Badge */}
          {post.is_pinned && (
            <div className="flex items-center gap-1 text-xs text-primary mb-3">
              <Pin className="h-3 w-3" />
              Bài viết được ghim
            </div>
          )}

          {/* Announcement Badge */}
          {post.is_announcement && (
            <div className="flex items-center gap-1 text-xs text-amber-600 mb-3 bg-amber-50 px-2 py-1 rounded-full w-fit">
              <Megaphone className="h-3 w-3" />
              Thông báo quan trọng
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author?.avatar_url || ''} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {post.author?.full_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {post.author?.full_name || 'Người dùng'}
                  </span>
                  {feeling && (
                    <span className="text-sm text-muted-foreground">
                      - đang cảm thấy {feeling.emoji} {feeling.label_vi}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: vi })}</span>
                  {post.camly_earned > 0 && (
                    <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                      <Coins className="h-3 w-3 mr-1" />
                      +{post.camly_earned.toLocaleString()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Menu */}
            {(isAuthor || isAdmin) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAdmin && (
                    <DropdownMenuItem onClick={handlePin}>
                      <Pin className="h-4 w-4 mr-2" />
                      {post.is_pinned ? 'Bỏ ghim' : 'Ghim bài'}
                    </DropdownMenuItem>
                  )}
                  {(isAuthor || isAdmin) && (
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa bài viết
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Content */}
          <div className="mt-3">
            <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Images */}
          {post.media_urls && post.media_urls.length > 0 && (
            <div className={`mt-3 grid gap-2 ${
              post.media_urls.length === 1 ? 'grid-cols-1' :
              post.media_urls.length === 2 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}>
              {post.media_urls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt=""
                  className={`rounded-lg object-cover w-full ${
                    post.media_urls.length === 1 ? 'max-h-96' : 'h-48'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Stats & Actions */}
          <div className="mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{post.likes_count} lượt thích</span>
                <span>{post.comments_count} bình luận</span>
              </div>
            </div>

            <div className="flex items-center justify-around mt-3 pt-3 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={post.is_liked ? 'text-red-500' : ''}
              >
                <Heart className={`h-4 w-4 mr-2 ${post.is_liked ? 'fill-current' : ''}`} />
                Thích
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Bình luận
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Chia sẻ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

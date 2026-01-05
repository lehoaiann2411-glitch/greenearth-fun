import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, MapPin, 
  TreePine, Trash2, Bookmark, Flag, Leaf
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useLikePost, useSharePost, useDeletePost } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { CommentSection } from './CommentSection';
import { toast } from 'sonner';

interface PostCardEnhancedProps {
  post: {
    id: string;
    content: string;
    image_url: string | null;
    media_urls?: string[] | null;
    post_type?: string;
    location_name?: string | null;
    likes_count: number;
    comments_count: number;
    shares_count?: number;
    created_at: string;
    campaign_id: string | null;
    user_id: string;
    user: {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
    };
    campaign?: {
      id: string;
      title: string;
      category?: string;
    } | null;
    has_liked?: boolean;
  };
  showComments?: boolean;
}

export function PostCardEnhanced({ post, showComments = false }: PostCardEnhancedProps) {
  const { user } = useAuth();
  const likePost = useLikePost();
  const sharePost = useSharePost();
  const deletePost = useDeletePost();
  
  const [isLiked, setIsLiked] = useState(post.has_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [sharesCount, setSharesCount] = useState(post.shares_count || 0);
  const [showCommentsSection, setShowCommentsSection] = useState(showComments);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const isOwner = user?.id === post.user_id;

  const handleLike = async () => {
    if (!user) {
      toast.error('Please log in to like posts');
      return;
    }

    // Optimistic update
    const wasLiked = isLiked;
    setIsLiked(!isLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 500);

    try {
      const result = await likePost.mutateAsync({ postId: post.id, isLiked });
      // Toast is handled by the hook via showReward
    } catch (error) {
      // Revert on error
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
    }
  };

  const handleShare = async () => {
    if (!user) {
      toast.error('Please log in to share posts');
      return;
    }

    try {
      await sharePost.mutateAsync({ postId: post.id, shareType: 'copy' });
      setSharesCount(prev => prev + 1);
      
      // Copy link to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      // Toast is handled by the hook via showReward
    } catch (error: any) {
      toast.error(error.message || 'Failed to share');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await deletePost.mutateAsync(post.id);
      toast.success('Post deleted');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <Link to={`/profile?id=${post.user.id}`}>
          <Avatar className="w-10 h-10 ring-2 ring-primary/10 hover:ring-primary/30 transition-all">
            <AvatarImage src={post.user.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {post.user.full_name?.[0] || '🌱'}
            </AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link 
              to={`/profile?id=${post.user.id}`}
              className="font-semibold text-foreground hover:underline"
            >
              {post.user.full_name || 'Green Warrior'}
            </Link>
            {post.campaign && (
              <span className="text-muted-foreground text-sm">
                is at{' '}
                <Link 
                  to={`/campaigns/${post.campaign.id}`}
                  className="text-primary hover:underline font-medium"
                >
                  {post.campaign.title}
                </Link>
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{timeAgo}</span>
            {post.location_name && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {post.location_name}
                </span>
              </>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Bookmark className="w-4 h-4 mr-2" />
              Save Post
            </DropdownMenuItem>
            {isOwner ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem>
                <Flag className="w-4 h-4 mr-2" />
                Report
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-foreground whitespace-pre-wrap break-words">
          {post.content}
        </p>
      </div>

      {/* Campaign badge */}
      {post.campaign && (
        <div className="px-4 pb-3">
          <Link to={`/campaigns/${post.campaign.id}`}>
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
              <TreePine className="w-3 h-3 mr-1" />
              {post.campaign.title}
            </Badge>
          </Link>
        </div>
      )}

      {/* Image */}
      {post.image_url && (
        <Link to={`/post/${post.id}`}>
          <div className="relative bg-muted">
            <img
              src={post.image_url}
              alt="Post image"
              className="w-full max-h-[500px] object-cover"
              loading="lazy"
            />
          </div>
        </Link>
      )}

      {/* Stats bar */}
      <div className="px-4 py-2 flex items-center justify-between text-sm text-muted-foreground border-b">
        <div className="flex items-center gap-4">
          {likesCount > 0 && (
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                <Leaf className="w-2.5 h-2.5 text-primary" />
              </div>
              {likesCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {post.comments_count > 0 && (
            <button 
              onClick={() => setShowCommentsSection(true)}
              className="hover:underline"
            >
              {post.comments_count} comments
            </button>
          )}
          {sharesCount > 0 && (
            <span>{sharesCount} shares</span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 py-1 flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 gap-2 ${isLiked ? 'text-primary' : 'text-muted-foreground'}`}
          onClick={handleLike}
        >
          <motion.div
            animate={isLikeAnimating ? { scale: [1, 1.3, 1], rotate: [0, -15, 15, 0] } : {}}
            transition={{ duration: 0.3 }}
          >
            {isLiked ? (
              <Leaf className="w-5 h-5 fill-current" />
            ) : (
              <Heart className="w-5 h-5" />
            )}
          </motion.div>
          Like
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 gap-2 text-muted-foreground"
          onClick={() => setShowCommentsSection(prev => !prev)}
        >
          <MessageCircle className="w-5 h-5" />
          Comment
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 gap-2 text-muted-foreground"
          onClick={handleShare}
        >
          <Share2 className="w-5 h-5" />
          Share
        </Button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showCommentsSection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t"
          >
            <CommentSection postId={post.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

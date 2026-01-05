import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, Share2, MoreHorizontal, MapPin, 
  TreePine, Trash2, Bookmark, Flag
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
import { useAddReaction, useUserReaction } from '@/hooks/useReactions';
import { useAuth } from '@/contexts/AuthContext';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { CommentSection } from './CommentSection';
import { ReactionPicker, ReactionSummary } from './ReactionPicker';
import { ImageCarousel } from './ImageCarousel';
import { PollDisplay } from './PollDisplay';
import { REACTION_EMOJIS } from '@/lib/camlyCoin';
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
    poll_id?: string | null;
    feeling?: string | null;
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
  const addReaction = useAddReaction();
  const { data: userReaction } = useUserReaction(post.id);
  
  const [isLiked, setIsLiked] = useState(post.has_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [sharesCount, setSharesCount] = useState(post.shares_count || 0);
  const [showCommentsSection, setShowCommentsSection] = useState(showComments);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const isOwner = user?.id === post.user_id;
  const currentReaction = userReaction?.reaction_type || (isLiked ? 'leaf' : null);

  // Get all images (combine image_url and media_urls)
  const allImages = [
    ...(post.image_url ? [post.image_url] : []),
    ...(post.media_urls || []),
  ].filter(Boolean);

  const handleReaction = async (reactionType: string) => {
    if (!user) {
      toast.error('Please log in to react to posts');
      return;
    }

    // Optimistic update
    const wasLiked = isLiked;
    const isSameReaction = currentReaction === reactionType;
    
    if (isSameReaction) {
      setIsLiked(false);
      setLikesCount(prev => Math.max(0, prev - 1));
    } else if (!wasLiked) {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
    }
    
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 500);

    try {
      await addReaction.mutateAsync({ postId: post.id, reactionType });
    } catch (error) {
      // Revert on error
      setIsLiked(wasLiked);
      setLikesCount(post.likes_count);
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

  // Parse feeling from post
  const getFeelingDisplay = () => {
    if (!post.feeling) return null;
    // Format: "grateful:🌱" or just "grateful"
    const [id, emoji] = post.feeling.includes(':') 
      ? post.feeling.split(':') 
      : [post.feeling, '😊'];
    return { id, emoji };
  };
  const feeling = getFeelingDisplay();

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <Link to={`/profile/${post.user.id}`} className="group">
          <Avatar className="w-10 h-10 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
            <AvatarImage src={post.user.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {post.user.full_name?.[0] || '🌱'}
            </AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link 
              to={`/profile/${post.user.id}`}
              className="font-semibold text-foreground hover:underline"
            >
              {post.user.full_name || 'Green Warrior'}
            </Link>
            <Link 
              to={`/profile/${post.user.id}`}
              className="text-xs text-primary hover:underline hidden sm:inline"
            >
              Xem hồ sơ
            </Link>
            {feeling && (
              <span className="text-muted-foreground text-sm">
                is feeling {feeling.emoji} {feeling.id}
              </span>
            )}
            {post.campaign && (
              <span className="text-muted-foreground text-sm">
                at{' '}
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

      {/* Images with carousel */}
      {allImages.length > 0 && (
        <div className="px-4 pb-3">
          <ImageCarousel images={allImages} />
        </div>
      )}

      {/* Poll display */}
      {post.poll_id && (
        <div className="px-4 pb-3">
          <PollDisplay pollId={post.poll_id} />
        </div>
      )}

      {/* Stats bar */}
      <div className="px-4 py-2 flex items-center justify-between text-sm text-muted-foreground border-b">
        <div className="flex items-center gap-4">
          {likesCount > 0 && (
            <ReactionSummary
              reactions={[{ type: currentReaction || 'leaf', count: likesCount }]}
              totalCount={likesCount}
            />
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
        {/* Reaction Picker */}
        <div className="flex-1">
          <ReactionPicker
            currentReaction={currentReaction}
            onReact={handleReaction}
            disabled={!user}
          />
        </div>
        
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

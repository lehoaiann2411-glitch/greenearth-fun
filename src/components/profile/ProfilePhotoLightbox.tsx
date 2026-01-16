import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Share2, Send, Trash2, Copy, Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useProfilePhotoLikes, 
  useProfilePhotoComments, 
  useLikeProfilePhoto, 
  useCreateProfilePhotoComment, 
  useDeleteProfilePhotoComment,
  useHasLikedProfilePhoto
} from '@/hooks/useProfilePhotoInteractions';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

interface ProfilePhotoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  photoType: 'avatar' | 'cover';
  profileId: string;
  profileName: string;
  profileAvatar?: string;
}

export function ProfilePhotoLightbox({
  isOpen,
  onClose,
  photoUrl,
  photoType,
  profileId,
  profileName,
  profileAvatar,
}: ProfilePhotoLightboxProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  const { data: likes = [], isLoading: likesLoading } = useProfilePhotoLikes(profileId, photoType);
  const { data: comments = [], isLoading: commentsLoading } = useProfilePhotoComments(profileId, photoType);
  const { data: hasLiked } = useHasLikedProfilePhoto(profileId, photoType);
  
  const likeMutation = useLikeProfilePhoto();
  const createCommentMutation = useCreateProfilePhotoComment();
  const deleteCommentMutation = useDeleteProfilePhotoComment();

  const handleLike = () => {
    if (!user) {
      toast({
        title: 'Đăng nhập',
        description: 'Vui lòng đăng nhập để thích ảnh.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!hasLiked) {
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 1000);
    }
    
    likeMutation.mutate({ profileId, photoType });
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    if (!user) {
      toast({
        title: 'Đăng nhập',
        description: 'Vui lòng đăng nhập để bình luận.',
        variant: 'destructive',
      });
      return;
    }
    
    createCommentMutation.mutate(
      { profileId, photoType, content: newComment.trim() },
      { onSuccess: () => setNewComment('') }
    );
  };

  const handleDeleteComment = (commentId: string) => {
    deleteCommentMutation.mutate({ commentId, profileId, photoType });
  };

  const handleShare = (platform: 'copy' | 'facebook' | 'twitter') => {
    const shareUrl = photoUrl;
    
    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Đã sao chép',
          description: 'Link ảnh đã được sao chép vào clipboard.',
        });
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
    }
  };

  const isVietnamese = i18n.language === 'vi';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/20 z-50"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Main content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="flex flex-col lg:flex-row w-full max-w-6xl h-[90vh] lg:h-[85vh] mx-4 bg-background rounded-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left: Photo */}
          <div className="relative flex-1 bg-black flex items-center justify-center min-h-[40vh] lg:min-h-0">
            <img
              src={photoUrl}
              alt={photoType === 'avatar' ? 'Ảnh đại diện' : 'Ảnh bìa'}
              className={`max-w-full max-h-full object-contain ${
                photoType === 'avatar' ? 'rounded-full max-w-[80%] max-h-[80%]' : ''
              }`}
            />
            
            {/* Heart animation on like */}
            <AnimatePresence>
              {showHeartAnimation && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <Heart className="h-24 w-24 text-red-500 fill-red-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Interaction panel */}
          <div className="w-full lg:w-96 flex flex-col border-l border-border bg-background">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profileAvatar} />
                <AvatarFallback>{profileName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{profileName}</p>
                <p className="text-xs text-muted-foreground">
                  {photoType === 'avatar' ? 'Ảnh đại diện' : 'Ảnh bìa'}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="p-4 border-b border-border flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 ${hasLiked ? 'text-red-500' : ''}`}
                onClick={handleLike}
                disabled={likeMutation.isPending}
              >
                <Heart className={`h-5 w-5 ${hasLiked ? 'fill-current' : ''}`} />
                <span>{likes.length}</span>
              </Button>

              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span>{comments.length}</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleShare('copy')}>
                    <Copy className="h-4 w-4 mr-2" />
                    Sao chép link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('facebook')}>
                    <Facebook className="h-4 w-4 mr-2" />
                    Chia sẻ Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('twitter')}>
                    <Twitter className="h-4 w-4 mr-2" />
                    Chia sẻ Twitter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Comments list */}
            <ScrollArea className="flex-1 p-4">
              {commentsLoading ? (
                <div className="text-center text-muted-foreground py-8">
                  Đang tải bình luận...
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chưa có bình luận nào.</p>
                  <p className="text-sm">Hãy là người đầu tiên bình luận!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 group">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                        <AvatarFallback>
                          {comment.profiles?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="bg-muted rounded-2xl px-3 py-2">
                          <p className="font-semibold text-sm">
                            {comment.profiles?.full_name || 'Người dùng'}
                          </p>
                          <p className="text-sm break-words">{comment.content}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-1 px-3">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), {
                              addSuffix: true,
                              locale: isVietnamese ? vi : undefined,
                            })}
                          </span>
                          {user?.id === comment.user_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteComment(comment.id)}
                              disabled={deleteCommentMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Xóa
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Comment input */}
            <form onSubmit={handleSubmitComment} className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Viết bình luận..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={!user || createCommentMutation.isPending}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={!newComment.trim() || !user || createCommentMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {!user && (
                <p className="text-xs text-muted-foreground mt-2">
                  Vui lòng đăng nhập để bình luận.
                </p>
              )}
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

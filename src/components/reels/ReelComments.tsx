import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReelComments, useCommentOnReel, REEL_REWARDS } from '@/hooks/useReels';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ReelCommentsProps {
  reelId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReelComments({ reelId, isOpen, onClose }: ReelCommentsProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const { data: comments, isLoading } = useReelComments(reelId);
  const commentMutation = useCommentOnReel();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    commentMutation.mutate(
      { reelId, content: newComment.trim() },
      {
        onSuccess: () => setNewComment(''),
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Comments Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-50 max-h-[70vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">
                Bình luận ({comments?.length || 0})
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Comments List */}
            <ScrollArea className="flex-1 p-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : comments && comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={comment.profiles?.avatar_url || ''} />
                        <AvatarFallback className="bg-emerald-500 text-white text-sm">
                          {comment.profiles?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {comment.profiles?.full_name || 'User'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { 
                              addSuffix: true, 
                              locale: vi 
                            })}
                          </span>
                        </div>
                        <p className="text-sm mt-0.5">{comment.content}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {comment.likes_count > 0 && comment.likes_count}
                          </button>
                          <button className="text-xs text-muted-foreground hover:text-foreground">
                            Trả lời
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Chưa có bình luận nào</p>
                  <p className="text-sm mt-1">Hãy là người đầu tiên bình luận!</p>
                </div>
              )}
            </ScrollArea>

            {/* Comment Input */}
            {user ? (
              <form onSubmit={handleSubmit} className="p-4 border-t flex items-center gap-2">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-emerald-500 text-white text-xs">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Thêm bình luận..."
                    className="pr-12 rounded-full"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    disabled={!newComment.trim() || commentMutation.isPending}
                  >
                    <Send className="h-4 w-4 text-emerald-500" />
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-4 border-t text-center text-sm text-muted-foreground">
                <a href="/auth" className="text-emerald-500 hover:underline">Đăng nhập</a> để bình luận
              </div>
            )}

            {/* Reward Hint */}
            <div className="px-4 pb-4 text-center">
              <p className="text-xs text-muted-foreground">
                Bình luận để nhận <span className="text-yellow-500 font-semibold">+{REEL_REWARDS.COMMENT} Camly 🪙</span>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

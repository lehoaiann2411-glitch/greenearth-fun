import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useComments, useCreateComment, useDeleteComment, PostComment } from '@/hooks/usePosts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Trash2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');

  const { data: comments, isLoading } = useComments(postId);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await createComment.mutateAsync({
      postId,
      content: newComment.trim(),
    });

    setNewComment('');
  };

  const handleDelete = async (commentId: string) => {
    if (confirm('Xóa bình luận này?')) {
      await deleteComment.mutateAsync({ commentId, postId });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 border-t pt-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-1 h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t pt-3">
      {/* Comments List */}
      {comments && comments.length > 0 && (
        <div className="max-h-60 space-y-3 overflow-y-auto">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isOwner={user?.id === comment.user_id}
              onDelete={() => handleDelete(comment.id)}
              isDeleting={deleteComment.isPending}
            />
          ))}
        </div>
      )}

      {/* New Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận..."
              className="h-8 text-sm"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newComment.trim() || createComment.isPending}
              className="h-8"
            >
              {createComment.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          <Link to="/auth" className="text-primary hover:underline">
            Đăng nhập
          </Link>{' '}
          để bình luận
        </p>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: PostComment;
  isOwner: boolean;
  onDelete: () => void;
  isDeleting: boolean;
}

function CommentItem({ comment, isOwner, onDelete, isDeleting }: CommentItemProps) {
  return (
    <div className="group flex gap-2">
      <Link to={`/profile?id=${comment.user_id}`}>
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={comment.profile?.avatar_url || ''} />
          <AvatarFallback className="bg-muted text-xs">
            {comment.profile?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1">
        <div className="rounded-lg bg-muted px-3 py-2">
          <Link
            to={`/profile?id=${comment.user_id}`}
            className="text-sm font-medium hover:underline"
          >
            {comment.profile?.full_name || 'Người dùng'}
          </Link>
          <p className="text-sm">{comment.content}</p>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
              locale: vi,
            })}
          </span>
          {isOwner && (
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="text-destructive opacity-0 transition-opacity hover:underline group-hover:opacity-100"
            >
              {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

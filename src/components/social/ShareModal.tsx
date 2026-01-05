import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Share2, Send, Link, Copy, Loader2 } from 'lucide-react';
import { useSharePost } from '@/hooks/usePostShares';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { CamlyCoinInline } from '@/components/rewards/CamlyCoinIcon';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: {
    id: string;
    content: string;
    user: {
      full_name: string | null;
      avatar_url: string | null;
    };
  };
}

export function ShareModal({ open, onOpenChange, post }: ShareModalProps) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { toast } = useToast();
  const sharePost = useSharePost();
  const [caption, setCaption] = useState('');
  const [showCaption, setShowCaption] = useState(false);

  const handleShareNow = async () => {
    try {
      await sharePost.mutateAsync({ postId: post.id });
      toast({
        title: 'Shared!',
        description: 'Post shared to your timeline. +2,000 Camly earned!',
      });
      onOpenChange(false);
      setCaption('');
      setShowCaption(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to share post',
      });
    }
  };

  const handleShareWithCaption = async () => {
    try {
      await sharePost.mutateAsync({ postId: post.id, caption });
      toast({
        title: 'Shared!',
        description: 'Post shared with your thoughts. +2,000 Camly earned!',
      });
      onOpenChange(false);
      setCaption('');
      setShowCaption(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to share post',
      });
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link copied!',
      description: 'Post link copied to clipboard',
    });
  };

  if (!user || !profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Reward Info */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
            <CamlyCoinInline size={20} />
            <span className="text-sm font-medium">Earn +2,000 Camly for sharing!</span>
          </div>

          {/* Original Post Preview */}
          <div className="p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.user.avatar_url || ''} />
                <AvatarFallback>{post.user.full_name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{post.user.full_name}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
          </div>

          {/* Caption Input */}
          {showCaption && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.avatar_url || ''} />
                  <AvatarFallback>{profile.full_name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{profile.full_name}</span>
              </div>
              <Textarea
                placeholder="Say something about this..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleShareWithCaption}
                disabled={sharePost.isPending}
                className="w-full"
              >
                {sharePost.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Share to Timeline
              </Button>
            </div>
          )}

          {/* Quick Actions */}
          {!showCaption && (
            <div className="space-y-2">
              <Button
                variant="default"
                className="w-full justify-start gap-3"
                onClick={handleShareNow}
                disabled={sharePost.isPending}
              >
                {sharePost.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Share Now
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => setShowCaption(true)}
              >
                <Share2 className="h-4 w-4" />
                Share with Caption
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={handleCopyLink}
              >
                <Link className="h-4 w-4" />
                Copy Link
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

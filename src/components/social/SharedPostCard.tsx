import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Share2, MessageCircle, Heart, MoreHorizontal } from 'lucide-react';

interface SharedPostCardProps {
  share: {
    id: string;
    share_caption: string | null;
    created_at: string;
    original_post?: {
      id: string;
      content: string;
      image_url: string | null;
      media_urls: string[] | null;
      created_at: string;
    };
    original_author?: {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  };
  sharer?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function SharedPostCard({ share, sharer }: SharedPostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(share.created_at), { addSuffix: true });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${sharer?.id}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={sharer?.avatar_url || ''} />
                <AvatarFallback>{sharer?.full_name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link to={`/profile/${sharer?.id}`} className="font-medium hover:underline">
                  {sharer?.full_name || 'User'}
                </Link>
                <span className="text-muted-foreground">shared a post</span>
              </div>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Share Caption */}
        {share.share_caption && (
          <p className="text-sm">{share.share_caption}</p>
        )}

        {/* Embedded Original Post */}
        {share.original_post && (
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <Link to={`/profile/${share.original_author?.id}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={share.original_author?.avatar_url || ''} />
                  <AvatarFallback>{share.original_author?.full_name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link to={`/profile/${share.original_author?.id}`} className="text-sm font-medium hover:underline">
                  {share.original_author?.full_name || 'User'}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(share.original_post.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>

            <p className="text-sm whitespace-pre-wrap">{share.original_post.content}</p>

            {/* Original Post Image */}
            {share.original_post.image_url && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <img
                  src={share.original_post.image_url}
                  alt=""
                  className="w-full max-h-64 object-cover"
                />
              </div>
            )}

            {/* Original Post Media Gallery */}
            {share.original_post.media_urls && share.original_post.media_urls.length > 0 && (
              <div className={`mt-3 grid gap-2 ${
                share.original_post.media_urls.length === 1 ? 'grid-cols-1' :
                share.original_post.media_urls.length === 2 ? 'grid-cols-2' :
                'grid-cols-2'
              }`}>
                {share.original_post.media_urls.slice(0, 4).map((url, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden aspect-square">
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {i === 3 && share.original_post!.media_urls!.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xl font-bold">
                        +{share.original_post!.media_urls!.length - 4}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button variant="ghost" size="sm" className="flex-1 gap-2">
            <Heart className="h-4 w-4" />
            Like
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 gap-2">
            <MessageCircle className="h-4 w-4" />
            Comment
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

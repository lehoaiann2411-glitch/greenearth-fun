import { Link } from 'react-router-dom';
import { useFriends } from '@/hooks/useFriendships';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, TreePine } from 'lucide-react';

interface ProfileFriendsProps {
  userId: string;
}

export function ProfileFriends({ userId }: ProfileFriendsProps) {
  const { data: friends, isLoading } = useFriends(userId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No friends yet</h3>
        <p className="text-muted-foreground">Connect with other green warriors!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {friends.map((friend) => (
        <Card key={friend.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <Link to={`/profile/${friend.id}`} className="block">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-3">
                  <AvatarImage src={friend.avatar_url || ''} alt={friend.full_name || ''} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {friend.full_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="font-medium truncate w-full">
                  {friend.full_name || 'Green User'}
                </h3>
                
                {friend.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {friend.bio}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <TreePine className="h-3 w-3" />
                  <span>{friend.trees_planted} trees</span>
                </div>
              </div>
            </Link>

            <div className="mt-3 flex gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link to={`/profile/${friend.id}`}>View</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

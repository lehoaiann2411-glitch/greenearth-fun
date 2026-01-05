import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Check, TreePine } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useSuggestedUsers, useFollowUser, useIsFollowing } from '@/hooks/useFollow';
import { Skeleton } from '@/components/ui/skeleton';

interface SuggestedUserCardProps {
  user: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    trees_planted: number;
    followers_count: number;
  };
}

function SuggestedUserCard({ user }: SuggestedUserCardProps) {
  const followUser = useFollowUser();
  const { data: isFollowing } = useIsFollowing(user.id);

  const handleFollow = async () => {
    await followUser.mutateAsync(user.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3"
    >
      <Link to={`/profile?id=${user.id}`}>
        <Avatar className="w-10 h-10 ring-2 ring-primary/10 hover:ring-primary/30 transition-all">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {user.full_name?.[0] || '🌱'}
          </AvatarFallback>
        </Avatar>
      </Link>
      
      <div className="flex-1 min-w-0">
        <Link 
          to={`/profile?id=${user.id}`}
          className="font-semibold text-sm hover:underline truncate block text-gray-900 dark:text-white"
        >
          {user.full_name || 'Green Warrior'}
        </Link>
        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 font-medium">
          <TreePine className="w-3 h-3" />
          {user.trees_planted} trees planted
        </p>
      </div>
      
      <Button
        variant={isFollowing ? 'secondary' : 'outline'}
        size="sm"
        className="h-8 text-xs"
        onClick={handleFollow}
        disabled={followUser.isPending || isFollowing}
      >
        {isFollowing ? (
          <>
            <Check className="w-3 h-3 mr-1" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="w-3 h-3 mr-1" />
            Follow
          </>
        )}
      </Button>
    </motion.div>
  );
}

export function SuggestedUsers() {
  const { data: users, isLoading } = useSuggestedUsers();

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-900 shadow-md border-2 border-white/50 dark:border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">Suggested for you</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!users || users.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white dark:bg-gray-900 shadow-md border-2 border-white/50 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          🌱 Suggested for you
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <SuggestedUserCard user={user} />
          </motion.div>
        ))}
        
        <Link to="/leaderboard" className="block">
          <Button variant="link" className="w-full text-primary p-0 h-auto text-xs">
            See all suggestions
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

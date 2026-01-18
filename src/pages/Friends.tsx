import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useFriends, useFriendRequests, useFriendSuggestions, useAcceptFriendRequest, useRejectFriendRequest } from '@/hooks/useFriendships';
import { useFollowers, useFollowUser, useIsFollowing } from '@/hooks/useFollow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Users, UserPlus, Search, Check, X, TreePine, Loader2, Heart } from 'lucide-react';
import { AddFriendButton } from '@/components/profile/AddFriendButton';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { CamlyCoinInline } from '@/components/rewards/CamlyCoinIcon';

// FollowerCard component
function FollowerCard({ follower, dateLocale, t, followUser }: { 
  follower: any; 
  dateLocale: any; 
  t: any;
  followUser: any;
}) {
  const followerProfile = follower.follower;
  const { data: isFollowingBack } = useIsFollowing(followerProfile?.id);
  
  const handleFollowBack = () => {
    if (followerProfile?.id) {
      followUser.mutate(followerProfile.id);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Link to={`/profile/${followerProfile?.id}`}>
            <Avatar className="h-16 w-16 ring-2 ring-blue-100 dark:ring-blue-900">
              <AvatarImage src={followerProfile?.avatar_url || ''} />
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                {followerProfile?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/profile/${followerProfile?.id}`} className="font-medium hover:underline">
              {followerProfile?.full_name || t('common.user')}
            </Link>
            <p className="text-sm text-muted-foreground">
              {t('friends.startedFollowing')} {formatDistanceToNow(new Date(follower.created_at), { 
                addSuffix: true, 
                locale: dateLocale 
              })}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <TreePine className="h-3 w-3" />
              {followerProfile?.trees_planted || 0} {t('friends.trees')}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {!isFollowingBack && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950"
                onClick={handleFollowBack}
                disabled={followUser.isPending}
              >
                {followUser.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className="h-4 w-4" />
                )}
                {t('friends.followBack')}
              </Button>
            )}
            <AddFriendButton targetUserId={followerProfile?.id} variant="compact" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Friends() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: friends, isLoading: friendsLoading } = useFriends(user?.id || '');
  const { data: requests, isLoading: requestsLoading } = useFriendRequests();
  const { data: suggestions, isLoading: suggestionsLoading } = useFriendSuggestions();
  const { data: followers, isLoading: followersLoading } = useFollowers(user?.id || '');
  const followUser = useFollowUser();

  const acceptRequest = useAcceptFriendRequest();
  const rejectRequest = useRejectFriendRequest();

  const dateLocale = i18n.language === 'vi' ? vi : enUS;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-[600px] w-full" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const filteredFriends = friends?.filter(friend =>
    friend.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="h-6 w-6" />
            {t('friends.title')}
          </h1>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="flex-wrap">
              <TabsTrigger value="all">
                {t('friends.allFriends')} ({friends?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="requests" className="relative">
                {t('friends.requests')}
                {requests && requests.length > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2">
                    {requests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="followers" className="relative">
                {t('friends.followers')}
                {followers && followers.length > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2">
                    {followers.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="suggestions">{t('friends.suggestions')}</TabsTrigger>
            </TabsList>

            {/* All Friends */}
            <TabsContent value="all" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('friends.searchFriends')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {friendsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : filteredFriends && filteredFriends.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredFriends.map((friend) => (
                    <Card key={friend.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Link to={`/profile/${friend.id}`}>
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={friend.avatar_url || ''} />
                              <AvatarFallback>{friend.full_name?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/profile/${friend.id}`} className="font-medium hover:underline">
                              {friend.full_name || t('common.user')}
                            </Link>
                            {friend.bio && (
                              <p className="text-sm text-muted-foreground truncate">{friend.bio}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <TreePine className="h-3 w-3" />
                              {friend.trees_planted} {t('friends.trees')}
                            </div>
                          </div>
                          <AddFriendButton targetUserId={friend.id} variant="compact" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">{t('friends.noFriends')}</h3>
                  <p className="text-muted-foreground">{t('friends.addToSee')}</p>
                </div>
              )}
            </TabsContent>

            {/* Friend Requests */}
            <TabsContent value="requests" className="space-y-4">
              {requestsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : requests && requests.length > 0 ? (
                <div className="space-y-4">
                  {/* Reward Info */}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
                    <CamlyCoinInline size={20} />
                    <span className="text-sm font-medium">{t('friends.earnOnAccept')}</span>
                  </div>

                  {requests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Link to={`/profile/${request.requester?.id}`}>
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={request.requester?.avatar_url || ''} />
                              <AvatarFallback>{request.requester?.full_name?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/profile/${request.requester?.id}`} className="font-medium hover:underline">
                              {request.requester?.full_name || t('common.user')}
                            </Link>
                            {request.requester?.bio && (
                              <p className="text-sm text-muted-foreground truncate">{request.requester.bio}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => acceptRequest.mutate(request.id)}
                              disabled={acceptRequest.isPending}
                              size="sm"
                              className="gap-1"
                            >
                              {acceptRequest.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                              {t('friends.accept')}
                            </Button>
                            <Button
                              onClick={() => rejectRequest.mutate(request.id)}
                              disabled={rejectRequest.isPending}
                              variant="outline"
                              size="sm"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserPlus className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">{t('friends.noRequests')}</h3>
                  <p className="text-muted-foreground">{t('friends.requestsWillAppear')}</p>
                </div>
              )}
            </TabsContent>

            {/* Followers */}
            <TabsContent value="followers" className="space-y-4">
              {followersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : followers && followers.length > 0 ? (
                <div className="space-y-4">
                  {followers.map((follower: any) => (
                    <FollowerCard 
                      key={follower.follower_id} 
                      follower={follower} 
                      dateLocale={dateLocale}
                      t={t}
                      followUser={followUser}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">{t('friends.noFollowers')}</h3>
                  <p className="text-muted-foreground">{t('friends.followersWillAppear')}</p>
                </div>
              )}
            </TabsContent>

            {/* Suggestions */}
            <TabsContent value="suggestions" className="space-y-4">
              <p className="text-muted-foreground">{t('friends.peopleYouMayKnow')}</p>

              {suggestionsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : suggestions && suggestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestions.map((suggestion) => (
                    <Card key={suggestion.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Link to={`/profile/${suggestion.id}`}>
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={suggestion.avatar_url || ''} />
                              <AvatarFallback>{suggestion.full_name?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/profile/${suggestion.id}`} className="font-medium hover:underline">
                              {suggestion.full_name || t('common.user')}
                            </Link>
                            {suggestion.bio && (
                              <p className="text-sm text-muted-foreground truncate">{suggestion.bio}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <TreePine className="h-3 w-3" />
                              {suggestion.trees_planted} {t('friends.trees')}
                            </div>
                          </div>
                          <AddFriendButton targetUserId={suggestion.id} variant="compact" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">{t('friends.noSuggestions')}</h3>
                  <p className="text-muted-foreground">{t('friends.checkLater')}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

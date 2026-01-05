import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useFriends, useFriendRequests, useFriendSuggestions, useAcceptFriendRequest, useRejectFriendRequest } from '@/hooks/useFriendships';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Users, UserPlus, Search, Check, X, TreePine, Loader2 } from 'lucide-react';
import { AddFriendButton } from '@/components/profile/AddFriendButton';
import { CamlyCoinInline } from '@/components/rewards/CamlyCoinIcon';

export default function Friends() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: friends, isLoading: friendsLoading } = useFriends(user?.id || '');
  const { data: requests, isLoading: requestsLoading } = useFriendRequests();
  const { data: suggestions, isLoading: suggestionsLoading } = useFriendSuggestions();

  const acceptRequest = useAcceptFriendRequest();
  const rejectRequest = useRejectFriendRequest();

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
            Friends
          </h1>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">
                All Friends ({friends?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="requests" className="relative">
                Requests
                {requests && requests.length > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2">
                    {requests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            </TabsList>

            {/* All Friends */}
            <TabsContent value="all" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search friends..."
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
                              {friend.full_name || 'User'}
                            </Link>
                            {friend.bio && (
                              <p className="text-sm text-muted-foreground truncate">{friend.bio}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <TreePine className="h-3 w-3" />
                              {friend.trees_planted} trees
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
                  <h3 className="mt-4 text-lg font-medium">No friends yet</h3>
                  <p className="text-muted-foreground">Add friends to see them here!</p>
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
                    <span className="text-sm font-medium">Accept a friend request to earn +2,000 Camly each!</span>
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
                              {request.requester?.full_name || 'User'}
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
                              Accept
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
                  <h3 className="mt-4 text-lg font-medium">No pending requests</h3>
                  <p className="text-muted-foreground">When someone sends you a friend request, it'll appear here.</p>
                </div>
              )}
            </TabsContent>

            {/* Suggestions */}
            <TabsContent value="suggestions" className="space-y-4">
              <p className="text-muted-foreground">People you may know</p>

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
                              {suggestion.full_name || 'User'}
                            </Link>
                            {suggestion.bio && (
                              <p className="text-sm text-muted-foreground truncate">{suggestion.bio}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <TreePine className="h-3 w-3" />
                              {suggestion.trees_planted} trees
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
                  <h3 className="mt-4 text-lg font-medium">No suggestions</h3>
                  <p className="text-muted-foreground">Check back later for more suggestions!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

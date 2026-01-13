import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bookmark, FileText, Film, Camera, Trash2, Play, Heart, MessageCircle, Eye } from 'lucide-react';
import { useSavedPosts, useSavedStories, useSavedReels, useSavePost, useSaveStory, useSaveReel } from '@/hooks/useSavedItems';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { PostCardEnhanced } from '@/components/social/PostCardEnhanced';

export default function SavedItems() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  
  const { data: savedPosts, isLoading: loadingPosts } = useSavedPosts();
  const { data: savedStories, isLoading: loadingStories } = useSavedStories();
  const { data: savedReels, isLoading: loadingReels } = useSavedReels();
  
  const savePostMutation = useSavePost();
  const saveStoryMutation = useSaveStory();
  const saveReelMutation = useSaveReel();

  const locale = i18n.language === 'vi' ? vi : enUS;

  if (!user) {
    return (
      <Layout>
        <div className="container py-8">
          <Card className="p-8 text-center">
            <Bookmark className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('common.loginRequired')}</h2>
            <Button onClick={() => navigate('/auth')}>{t('common.login')}</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const handleRemovePost = (postId: string) => {
    savePostMutation.mutate({ postId, save: false });
  };

  const handleRemoveStory = (storyId: string) => {
    saveStoryMutation.mutate({ storyId, save: false });
  };

  const handleRemoveReel = (reelId: string) => {
    saveReelMutation.mutate({ reelId, save: false });
  };

  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale });
  };

  return (
    <Layout>
      <div className="container py-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-primary/10">
            <Bookmark className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('saved.title')}</h1>
            <p className="text-muted-foreground text-sm">{t('saved.description')}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('saved.posts')}
              {savedPosts && savedPosts.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/20 text-xs">
                  {savedPosts.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              {t('saved.stories')}
              {savedStories && savedStories.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/20 text-xs">
                  {savedStories.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="reels" className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              {t('saved.reels')}
              {savedReels && savedReels.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/20 text-xs">
                  {savedReels.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            {loadingPosts ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('common.loading')}
              </div>
            ) : savedPosts && savedPosts.length > 0 ? (
              savedPosts.map((item: any) => {
                const post = item.posts;
                if (!post) return null;
                
                return (
                  <div key={item.id} className="relative">
                    <PostCardEnhanced
                      post={{
                        id: post.id,
                        content: post.content,
                        image_url: post.image_url,
                        media_urls: post.media_urls,
                        post_type: post.post_type || 'text',
                        location_name: post.location_name,
                        likes_count: post.likes_count,
                        comments_count: post.comments_count,
                        shares_count: post.shares_count || 0,
                        created_at: post.created_at,
                        campaign_id: post.campaign_id,
                        user_id: post.user_id,
                        user: post.profiles || { id: post.user_id, full_name: null, avatar_url: null },
                        campaign: post.campaigns || null,
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-80 hover:opacity-100"
                      onClick={() => handleRemovePost(post.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {t('saved.removeFromSaved')}
                    </Button>
                  </div>
                );
              })
            ) : (
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('saved.emptyPosts')}</p>
              </Card>
            )}
          </TabsContent>

          {/* Stories Tab */}
          <TabsContent value="stories">
            {loadingStories ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('common.loading')}
              </div>
            ) : savedStories && savedStories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {savedStories.map((item: any) => {
                  const story = item.stories;
                  if (!story) return null;
                  
                  return (
                    <Card key={item.id} className="overflow-hidden group relative">
                      <div className="aspect-[9/16] relative">
                        {story.media_type === 'video' ? (
                          <video
                            src={story.media_url}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <img
                            src={story.media_url}
                            alt="Story"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        
                        {/* User Info */}
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 border-2 border-white">
                              <AvatarImage src={story.profiles?.avatar_url || ''} />
                              <AvatarFallback className="text-xs">
                                {story.profiles?.full_name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-white text-xs font-medium truncate">
                              {story.profiles?.full_name || t('common.anonymous')}
                            </span>
                          </div>
                          {story.caption && (
                            <p className="text-white/80 text-xs mt-1 line-clamp-2">
                              {story.caption}
                            </p>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 text-white text-xs">
                          <Eye className="h-3 w-3" />
                          {story.views_count || 0}
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 left-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveStory(story.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <CardContent className="p-2">
                        <p className="text-xs text-muted-foreground">
                          {formatTime(item.created_at)}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('saved.emptyStories')}</p>
              </Card>
            )}
          </TabsContent>

          {/* Reels Tab */}
          <TabsContent value="reels">
            {loadingReels ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('common.loading')}
              </div>
            ) : savedReels && savedReels.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {savedReels.map((item: any) => {
                  const reel = item.reels;
                  if (!reel) return null;
                  
                  return (
                    <Card 
                      key={item.id} 
                      className="overflow-hidden group relative cursor-pointer"
                      onClick={() => navigate(`/reels/${reel.id}`)}
                    >
                      <div className="aspect-[9/16] relative">
                        {reel.thumbnail_url ? (
                          <img
                            src={reel.thumbnail_url}
                            alt="Reel thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={reel.video_url}
                            className="w-full h-full object-cover"
                            muted
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        
                        {/* Play Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                            <Play className="h-6 w-6 text-white" fill="white" />
                          </div>
                        </div>

                        {/* User Info */}
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 border-2 border-white">
                              <AvatarImage src={reel.profiles?.avatar_url || ''} />
                              <AvatarFallback className="text-xs">
                                {reel.profiles?.full_name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-white text-xs font-medium truncate">
                              {reel.profiles?.full_name || t('common.anonymous')}
                            </span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-white text-xs bg-black/30 rounded px-1">
                            <Heart className="h-3 w-3" />
                            {reel.likes_count || 0}
                          </div>
                          <div className="flex items-center gap-1 text-white text-xs bg-black/30 rounded px-1">
                            <MessageCircle className="h-3 w-3" />
                            {reel.comments_count || 0}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 left-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveReel(reel.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <CardContent className="p-2">
                        <p className="text-xs text-muted-foreground">
                          {formatTime(item.created_at)}
                        </p>
                        {reel.caption && (
                          <p className="text-xs line-clamp-1 mt-1">{reel.caption}</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('saved.emptyReels')}</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

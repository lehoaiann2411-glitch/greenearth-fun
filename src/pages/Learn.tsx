import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Video, Image, HelpCircle, Users, Trophy, Coins } from 'lucide-react';
import { CategoryFilter } from '@/components/learn/CategoryFilter';
import { VideoCard } from '@/components/learn/VideoCard';
import { InfographicCard } from '@/components/learn/InfographicCard';
import { QuizCard } from '@/components/learn/QuizCard';
import { InfluencerCard } from '@/components/learn/InfluencerCard';
import { VideoPlayerModal } from '@/components/learn/VideoPlayerModal';
import { InfographicModal } from '@/components/learn/InfographicModal';
import { QuizPlayer } from '@/components/learn/QuizPlayer';
import { 
  useEducationalContent, 
  useContentViews, 
  useRecordContentView, 
  useInfluencers,
  EducationalContent 
} from '@/hooks/useEducationalContent';
import { useQuizzes, useUserQuizAttempts, Quiz } from '@/hooks/useQuizzes';
import { useAuth } from '@/contexts/AuthContext';

export default function Learn() {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language === 'vi';
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('videos');
  const [category, setCategory] = useState('all');
  
  // Modal states
  const [selectedVideo, setSelectedVideo] = useState<EducationalContent | null>(null);
  const [selectedInfographic, setSelectedInfographic] = useState<EducationalContent | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  // Data hooks
  const { data: videos = [], isLoading: loadingVideos } = useEducationalContent('video', category);
  const { data: infographics = [], isLoading: loadingInfographics } = useEducationalContent('infographic', category);
  const { data: quizzes = [], isLoading: loadingQuizzes } = useQuizzes(category);
  const { data: influencers = [], isLoading: loadingInfluencers } = useInfluencers();
  const { data: contentViews = [] } = useContentViews();
  const { data: quizAttempts = [] } = useUserQuizAttempts();
  
  const recordView = useRecordContentView();

  const isContentViewed = (contentId: string) => {
    return contentViews.some(v => v.content_id === contentId);
  };

  const getQuizBestAttempt = (quizId: string) => {
    const attempts = quizAttempts.filter(a => a.quiz_id === quizId);
    if (attempts.length === 0) return null;
    return attempts.reduce((best, current) => 
      current.score > best.score ? current : best
    , attempts[0]);
  };

  const handleRecordView = (content: EducationalContent) => {
    if (user) {
      recordView.mutate({
        contentId: content.id,
        pointsReward: content.points_reward
      });
    }
  };

  // Stats
  const totalVideosWatched = contentViews.filter(v => 
    videos.some(vid => vid.id === v.content_id)
  ).length;
  const totalQuizzesCompleted = [...new Set(quizAttempts.map(a => a.quiz_id))].length;
  const totalPointsEarned = contentViews.reduce((sum, v) => sum + (v.points_earned || 0), 0) +
    quizAttempts.reduce((sum, a) => sum + (a.points_earned || 0), 0);

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {isVi ? 'Học & Kiếm điểm' : 'Learn & Earn'}
              </h1>
              <p className="text-muted-foreground">
                {isVi 
                  ? 'Khám phá video, infographics và quiz về sống xanh' 
                  : 'Explore videos, infographics, and quizzes about green living'}
              </p>
            </div>
          </div>

          {/* Stats */}
          {user && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Video className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{totalVideosWatched}</div>
                    <div className="text-xs text-muted-foreground">{isVi ? 'Video đã xem' : 'Videos Watched'}</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{totalQuizzesCompleted}</div>
                    <div className="text-xs text-muted-foreground">{isVi ? 'Quiz hoàn thành' : 'Quizzes Done'}</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{totalPointsEarned}</div>
                    <div className="text-xs text-muted-foreground">{isVi ? 'Điểm kiếm được' : 'Points Earned'}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="videos" className="gap-2">
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">{isVi ? 'Video' : 'Videos'}</span>
              </TabsTrigger>
              <TabsTrigger value="infographics" className="gap-2">
                <Image className="w-4 h-4" />
                <span className="hidden sm:inline">{isVi ? 'Infographic' : 'Infographics'}</span>
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="gap-2">
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{isVi ? 'Quiz' : 'Quizzes'}</span>
              </TabsTrigger>
              <TabsTrigger value="influencers" className="gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">{isVi ? 'Influencers' : 'Influencers'}</span>
              </TabsTrigger>
            </TabsList>

            {activeTab !== 'influencers' && (
              <CategoryFilter selected={category} onChange={setCategory} />
            )}
          </div>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            {loadingVideos ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i}>
                    <Skeleton className="aspect-video" />
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {isVi ? 'Chưa có video' : 'No Videos Yet'}
                </h3>
                <p className="text-muted-foreground">
                  {isVi ? 'Các video giáo dục sẽ sớm được thêm vào!' : 'Educational videos coming soon!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(video => (
                  <VideoCard 
                    key={video.id} 
                    content={video}
                    onClick={() => setSelectedVideo(video)}
                    isViewed={isContentViewed(video.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Infographics Tab */}
          <TabsContent value="infographics" className="space-y-6">
            {loadingInfographics ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <Card key={i}>
                    <Skeleton className="aspect-[3/4]" />
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : infographics.length === 0 ? (
              <div className="text-center py-12">
                <Image className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {isVi ? 'Chưa có infographic' : 'No Infographics Yet'}
                </h3>
                <p className="text-muted-foreground">
                  {isVi ? 'Các infographic sẽ sớm được thêm vào!' : 'Infographics coming soon!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {infographics.map(info => (
                  <InfographicCard 
                    key={info.id} 
                    content={info}
                    onClick={() => setSelectedInfographic(info)}
                    isViewed={isContentViewed(info.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6">
            {loadingQuizzes ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i}>
                    <Skeleton className="h-32" />
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-full mt-4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {isVi ? 'Chưa có quiz' : 'No Quizzes Yet'}
                </h3>
                <p className="text-muted-foreground">
                  {isVi ? 'Các bài quiz sẽ sớm được thêm vào!' : 'Quizzes coming soon!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map(quiz => (
                  <QuizCard 
                    key={quiz.id} 
                    quiz={quiz}
                    bestAttempt={getQuizBestAttempt(quiz.id)}
                    onStart={() => setSelectedQuiz(quiz)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Influencers Tab */}
          <TabsContent value="influencers" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">
                {isVi ? 'Những người truyền cảm hứng xanh' : 'Green Influencers'}
              </h2>
              <p className="text-muted-foreground">
                {isVi 
                  ? 'Theo dõi các influencer để học thêm về lối sống bền vững'
                  : 'Follow these influencers to learn more about sustainable living'}
              </p>
            </div>

            {loadingInfluencers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i}>
                    <Skeleton className="h-24" />
                    <CardContent className="p-4 -mt-8 space-y-2">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-full mt-4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : influencers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {isVi ? 'Chưa có influencer' : 'No Influencers Yet'}
                </h3>
                <p className="text-muted-foreground">
                  {isVi ? 'Danh sách influencer sẽ sớm được cập nhật!' : 'Influencer profiles coming soon!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {influencers.map(influencer => (
                  <InfluencerCard key={influencer.id} influencer={influencer} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <VideoPlayerModal
        content={selectedVideo}
        open={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        onView={() => selectedVideo && handleRecordView(selectedVideo)}
      />

      <InfographicModal
        content={selectedInfographic}
        open={!!selectedInfographic}
        onClose={() => setSelectedInfographic(null)}
        onView={() => selectedInfographic && handleRecordView(selectedInfographic)}
      />

      <QuizPlayer
        quiz={selectedQuiz}
        open={!!selectedQuiz}
        onClose={() => setSelectedQuiz(null)}
      />
    </Layout>
  );
}

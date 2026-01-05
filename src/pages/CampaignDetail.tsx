import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ParticipantList } from '@/components/campaigns/ParticipantList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useCampaign, 
  useCampaignParticipants, 
  useUserParticipation,
  useJoinCampaign,
  useLeaveCampaign,
  useCheckIn,
  CATEGORY_LABELS,
  STATUS_LABELS
} from '@/hooks/useCampaigns';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Leaf, 
  Award,
  ArrowLeft,
  Share2,
  Settings,
  LogIn,
  LogOut,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: campaign, isLoading } = useCampaign(id || '');
  const { data: participants } = useCampaignParticipants(id || '');
  const { data: userParticipation } = useUserParticipation(id || '');
  
  const joinMutation = useJoinCampaign();
  const leaveMutation = useLeaveCampaign();
  const checkInMutation = useCheckIn();

  const handleJoin = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (id) {
      joinMutation.mutate(id);
    }
  };

  const handleLeave = () => {
    if (id) {
      leaveMutation.mutate(id);
    }
  };

  const handleCheckIn = () => {
    if (id) {
      checkInMutation.mutate(id);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép link!');
    } catch {
      toast.error('Không thể sao chép link');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-64 w-full rounded-xl mb-6" />
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </Layout>
    );
  }

  if (!campaign) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Leaf className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Không tìm thấy chiến dịch</h2>
          <Button asChild variant="outline">
            <Link to="/campaigns">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const progress = Math.min(
    ((campaign.participants_count || 0) / campaign.target_participants) * 100,
    100
  );
  
  const isCreator = user?.id === campaign.creator_id;
  const isJoined = !!userParticipation && userParticipation.status !== 'cancelled';
  const canCheckIn = isJoined && userParticipation?.status === 'registered';
  const isCheckedIn = userParticipation?.status === 'checked_in' || userParticipation?.status === 'completed';

  return (
    <Layout>
      <div className="container py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/campaigns">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tất cả chiến dịch
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden">
              {campaign.image_url ? (
                <img
                  src={campaign.image_url}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                  <Leaf className="h-24 w-24 text-primary/50" />
                </div>
              )}
              
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge>{CATEGORY_LABELS[campaign.category]}</Badge>
                <Badge variant="outline" className="bg-background/80">
                  {STATUS_LABELS[campaign.status]}
                </Badge>
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{campaign.title}</h1>
              
              {campaign.description && (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {campaign.description}
                </p>
              )}
            </div>

            <Separator />

            {/* Details Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Thời gian</p>
                    <p className="font-medium">
                      {format(new Date(campaign.start_date), 'dd/MM/yyyy', { locale: vi })}
                      {' - '}
                      {format(new Date(campaign.end_date), 'dd/MM/yyyy', { locale: vi })}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Địa điểm</p>
                    <p className="font-medium">{campaign.location || 'Chưa xác định'}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Điểm thưởng</p>
                    <p className="font-medium text-primary">+{campaign.green_points_reward} điểm xanh</p>
                  </div>
                </CardContent>
              </Card>
              
              {campaign.target_trees && campaign.target_trees > 0 && (
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Leaf className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Mục tiêu cây trồng</p>
                      <p className="font-medium">{campaign.target_trees} cây</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Người tham gia ({participants?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ParticipantList participants={participants || []} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Người tổ chức</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={campaign.creator?.avatar_url || undefined} />
                    <AvatarFallback>
                      {campaign.creator?.full_name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{campaign.creator?.full_name || 'Ẩn danh'}</p>
                    <p className="text-sm text-muted-foreground">Người tạo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tiến độ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Người tham gia</span>
                  <span className="font-medium">
                    {campaign.participants_count || 0}/{campaign.target_participants}
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-muted-foreground text-center">
                  {Math.round(progress)}% hoàn thành
                </p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isCreator && (
                <>
                  {!isJoined ? (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleJoin}
                      disabled={joinMutation.isPending}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      {joinMutation.isPending ? 'Đang xử lý...' : 'Tham gia ngay'}
                    </Button>
                  ) : (
                    <>
                      {canCheckIn && (
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={handleCheckIn}
                          disabled={checkInMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {checkInMutation.isPending ? 'Đang xử lý...' : 'Check-in'}
                        </Button>
                      )}
                      
                      {isCheckedIn && (
                        <Button className="w-full" size="lg" variant="secondary" disabled>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Đã check-in
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleLeave}
                        disabled={leaveMutation.isPending}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {leaveMutation.isPending ? 'Đang xử lý...' : 'Hủy đăng ký'}
                      </Button>
                    </>
                  )}
                </>
              )}
              
              {isCreator && (
                <Button variant="secondary" className="w-full" asChild>
                  <Link to={`/campaigns/${campaign.id}/manage`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Quản lý chiến dịch
                  </Link>
                </Button>
              )}
              
              <Button variant="outline" className="w-full" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Chia sẻ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

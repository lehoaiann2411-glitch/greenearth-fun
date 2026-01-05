import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Users, Calendar, Image, Info, Plus, ArrowLeft } from 'lucide-react';
import { useGroup, useGroupMembership } from '@/hooks/useGroups';
import { useGroupEvents } from '@/hooks/useGroupEvents';
import { useAuth } from '@/contexts/AuthContext';
import { GroupHeader } from '@/components/groups/GroupHeader';
import { GroupFeed } from '@/components/groups/GroupFeed';
import { GroupMembersList } from '@/components/groups/GroupMembersList';
import { GroupEventCard } from '@/components/groups/GroupEventCard';

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('discussion');

  const { data: group, isLoading: isLoadingGroup } = useGroup(id!);
  const { data: membership } = useGroupMembership(id!);
  const { data: events } = useGroupEvents(id!);

  const isMember = membership?.status === 'approved';
  const isAdmin = membership?.role === 'admin';

  if (isLoadingGroup) {
    return (
      <Layout>
        <Skeleton className="h-64 w-full" />
        <div className="container py-6">
          <Skeleton className="h-32 rounded-lg" />
        </div>
      </Layout>
    );
  }

  if (!group) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy nhóm</h1>
          <Button asChild>
            <Link to="/groups">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách nhóm
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <GroupHeader group={group} />

      <div className="container py-6 max-w-4xl">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="discussion" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Thảo luận</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Thành viên</span>
              <span className="text-xs bg-muted rounded-full px-1.5">
                {group.members_count}
              </span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Sự kiện</span>
              {events && events.length > 0 && (
                <span className="text-xs bg-primary/20 text-primary rounded-full px-1.5">
                  {events.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Ảnh</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Giới thiệu</span>
            </TabsTrigger>
          </TabsList>

          {/* Discussion Tab */}
          <TabsContent value="discussion">
            <GroupFeed groupId={group.id} />
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <GroupMembersList groupId={group.id} isAdmin={isAdmin} />
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <div className="space-y-4">
              {isAdmin && (
                <Button asChild className="w-full sm:w-auto">
                  <Link to={`/groups/${group.id}/events/create`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo sự kiện mới
                  </Link>
                </Button>
              )}

              {events && events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((event) => (
                    <GroupEventCard key={event.id} event={event} groupId={group.id} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Chưa có sự kiện nào
                  </h3>
                  <p className="text-muted-foreground">
                    {isAdmin 
                      ? 'Tạo sự kiện đầu tiên cho nhóm!' 
                      : 'Khi có sự kiện mới, chúng sẽ xuất hiện ở đây.'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos">
            <div className="text-center py-12">
              <Image className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Chưa có ảnh nào
              </h3>
              <p className="text-muted-foreground">
                Ảnh từ các bài viết sẽ xuất hiện ở đây
              </p>
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4">Giới thiệu về nhóm</h3>
              
              {group.description ? (
                <p className="text-muted-foreground mb-6">{group.description}</p>
              ) : (
                <p className="text-muted-foreground italic mb-6">Chưa có mô tả</p>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground w-24">Loại nhóm:</span>
                  <span>{group.privacy === 'public' ? '🌐 Công khai' : '🔒 Riêng tư'}</span>
                </div>
                {group.location && (
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground w-24">Địa điểm:</span>
                    <span>📍 {group.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground w-24">Thành viên:</span>
                  <span>{group.members_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground w-24">Bài viết:</span>
                  <span>{group.posts_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground w-24">Ngày tạo:</span>
                  <span>{new Date(group.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

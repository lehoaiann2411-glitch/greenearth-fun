import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { ProfileTimeline } from '@/components/profile/ProfileTimeline';
import { ProfileAbout } from '@/components/profile/ProfileAbout';
import { ProfileFriends } from '@/components/profile/ProfileFriends';
import { ProfilePhotos } from '@/components/profile/ProfilePhotos';
import { ClaimModal } from '@/components/rewards/ClaimModal';

export default function Profile() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  
  // Support both /profile/:userId and /profile?id=userId
  const urlUserId = params.userId || searchParams.get('id');
  const targetUserId = urlUserId || user?.id;
  const isOwnProfile = !urlUserId || urlUserId === user?.id;

  const { data: profile, isLoading: profileLoading } = useProfile(targetUserId);
  const [activeTab, setActiveTab] = useState('timeline');
  const [claimModalOpen, setClaimModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user && isOwnProfile) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate, isOwnProfile]);

  if (authLoading || profileLoading) {
    return (
      <Layout>
        <div className="container py-8 md:py-12">
          <div className="mx-auto max-w-4xl space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container py-8 md:py-12 text-center">
          <h1 className="text-2xl font-bold">User not found</h1>
          <p className="text-muted-foreground">This profile doesn't exist or has been removed.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4 md:py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Profile Header with Cover Photo */}
          <Card className="overflow-hidden">
            <ProfileHeader 
              profile={profile} 
              isOwnProfile={isOwnProfile} 
            />
          </Card>

          {/* Tabs */}
          <ProfileTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'timeline' && (
              <ProfileTimeline userId={profile.id} />
            )}

            {activeTab === 'about' && (
              <ProfileAbout profile={profile} />
            )}

            {activeTab === 'friends' && (
              <ProfileFriends userId={profile.id} />
            )}

            {activeTab === 'photos' && (
              <ProfilePhotos userId={profile.id} isOwnProfile={isOwnProfile} />
            )}

            {activeTab === 'campaigns' && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <p>Campaigns feature coming soon!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {isOwnProfile && user && (
        <ClaimModal
          open={claimModalOpen}
          onOpenChange={setClaimModalOpen}
          greenPoints={profile.green_points}
          walletAddress={profile.wallet_address || ''}
        />
      )}
    </Layout>
  );
}

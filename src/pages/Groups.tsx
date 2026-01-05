import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Compass, Users, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGroups, useMyGroups, GroupFilters as GroupFiltersType } from '@/hooks/useGroups';
import { useAuth } from '@/contexts/AuthContext';
import { GroupCard } from '@/components/groups/GroupCard';
import { GroupFilters } from '@/components/groups/GroupFilters';
import { FeaturedGroups } from '@/components/groups/FeaturedGroups';
import { CAMLY_REWARDS } from '@/lib/camlyCoin';
import { CamlyCoinInline } from '@/components/rewards/CamlyCoinIcon';

export default function Groups() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('discover');
  const [filters, setFilters] = useState<GroupFiltersType>({
    search: '',
    category: 'all',
    location: '',
  });

  const { data: allGroups, isLoading: isLoadingAll } = useGroups(filters);
  const { data: myGroups, isLoading: isLoadingMy } = useMyGroups();

  return (
    <Layout>
      <div className="container py-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl p-4 shadow-md border border-white/50 dark:border-gray-700">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 drop-shadow-sm">
              🌍 Cộng đồng
            </h1>
            <p className="text-gray-700 dark:text-gray-300 mt-1 font-medium">
              Tham gia các nhóm môi trường và kiếm Camly Coin
            </p>
          </div>
          
          {user && (
            <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-md">
              <Link to="/groups/create" className="inline-flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Tạo nhóm (+{CAMLY_REWARDS.GROUP_CREATE.toLocaleString()} <CamlyCoinInline />)
              </Link>
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-900 shadow-md border border-white/50 dark:border-gray-700">
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Compass className="h-4 w-4" />
              Khám phá
            </TabsTrigger>
            <TabsTrigger value="my-groups" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Nhóm của tôi
              {myGroups && myGroups.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                  {myGroups.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="invites" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Lời mời
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            {/* Filters */}
            <GroupFilters
              search={filters.search || ''}
              onSearchChange={(search) => setFilters({ ...filters, search })}
              category={filters.category || 'all'}
              onCategoryChange={(category) => setFilters({ ...filters, category })}
              location={filters.location || ''}
              onLocationChange={(location) => setFilters({ ...filters, location })}
            />

            {/* Featured Groups */}
            {!filters.search && filters.category === 'all' && !filters.location && (
              <FeaturedGroups />
            )}

            {/* All Groups */}
            <div>
              <h2 className="text-lg font-bold mb-4 bg-white dark:bg-gray-900 rounded-lg px-4 py-2 inline-block shadow-md border border-white/50 dark:border-gray-700 text-gray-900 dark:text-white">
                {filters.search || filters.category !== 'all' || filters.location
                  ? 'Kết quả tìm kiếm'
                  : 'Tất cả nhóm'}
              </h2>
              
              {isLoadingAll ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-64 rounded-lg" />
                  ))}
                </div>
              ) : allGroups && allGroups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allGroups.map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Không tìm thấy nhóm nào
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Hãy thử thay đổi bộ lọc hoặc tạo nhóm mới
                  </p>
                  {user && (
                    <Button asChild>
                      <Link to="/groups/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo nhóm mới
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* My Groups Tab */}
          <TabsContent value="my-groups" className="space-y-6">
            {!user ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Đăng nhập để xem nhóm của bạn
                </h3>
                <Button asChild>
                  <Link to="/auth">Đăng nhập</Link>
                </Button>
              </div>
            ) : isLoadingMy ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            ) : myGroups && myGroups.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myGroups.map((group) => (
                  <GroupCard key={group.id} group={group} showJoinButton={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Bạn chưa tham gia nhóm nào
                </h3>
                <p className="text-muted-foreground mb-4">
                  Khám phá và tham gia các nhóm để kết nối với cộng đồng
                </p>
                <Button onClick={() => setActiveTab('discover')}>
                  Khám phá nhóm
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Invites Tab */}
          <TabsContent value="invites" className="space-y-6">
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Không có lời mời nào
              </h3>
              <p className="text-muted-foreground">
                Khi có người mời bạn tham gia nhóm, lời mời sẽ xuất hiện ở đây
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

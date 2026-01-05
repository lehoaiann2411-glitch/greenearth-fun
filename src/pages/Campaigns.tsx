import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { CampaignFilters } from '@/components/campaigns/CampaignFilters';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCampaigns, CampaignFilters as FiltersType } from '@/hooks/useCampaigns';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Leaf } from 'lucide-react';

export default function Campaigns() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [filters, setFilters] = useState<FiltersType>({});
  const { data: campaigns, isLoading } = useCampaigns(filters);

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white/95 dark:bg-gray-900/95 rounded-xl p-4 shadow-md border border-white/50 dark:border-gray-700">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('campaigns.title')}</h1>
            <p className="text-gray-700 dark:text-gray-300 mt-1 font-medium">
              {t('campaigns.description')}
            </p>
          </div>
          
          {user && (
            <Button asChild>
              <Link to="/campaigns/create">
                <Plus className="h-4 w-4 mr-2" />
                {t('campaigns.createCampaign')}
              </Link>
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white/95 dark:bg-gray-900/95 rounded-xl p-4 shadow-md border border-white/50 dark:border-gray-700">
          <CampaignFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Campaign Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/95 dark:bg-gray-900/95 rounded-xl shadow-md border border-white/50 dark:border-gray-700">
            <Leaf className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{t('campaigns.noCampaigns')}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 font-medium">
              {filters.search || filters.category || filters.location
                ? t('campaigns.noMatch')
                : t('campaigns.beFirstCreate')}
            </p>
            {user && (
              <Button asChild>
                <Link to="/campaigns/create">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('campaigns.createFirst')}
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

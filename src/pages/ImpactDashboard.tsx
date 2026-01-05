import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TreePine, Leaf, Map as MapIcon, Calculator, Globe, User, Award, TrendingUp } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGlobalStats, usePersonalStats } from '@/hooks/useImpactStats';
import { useAuth } from '@/contexts/AuthContext';
import { formatCO2, formatArea } from '@/lib/carbonCalculations';
import { GlobalStats } from '@/components/impact/GlobalStats';
import { PersonalImpact } from '@/components/impact/PersonalImpact';
import { CarbonCalculator } from '@/components/impact/CarbonCalculator';
import { TreeMap } from '@/components/impact/TreeMap';

export default function ImpactDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: globalStats, isLoading: globalLoading } = useGlobalStats();
  const { data: personalStats, isLoading: personalLoading } = usePersonalStats();
  const [activeTab, setActiveTab] = useState('global');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            {t('impact.globalTitle')}
          </h1>
          <p className="text-muted-foreground mt-2">
            Theo dõi tác động môi trường của cộng đồng Green Earth
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="global" className="gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Toàn cầu</span>
            </TabsTrigger>
            <TabsTrigger value="personal" className="gap-2" disabled={!user}>
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Cá nhân</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <MapIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Bản đồ</span>
            </TabsTrigger>
            <TabsTrigger value="calculator" className="gap-2">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Tính CO₂</span>
            </TabsTrigger>
          </TabsList>

          {/* Global Stats Tab */}
          <TabsContent value="global">
            <GlobalStats stats={globalStats} isLoading={globalLoading} />
          </TabsContent>

          {/* Personal Impact Tab */}
          <TabsContent value="personal">
            {user ? (
              <PersonalImpact stats={personalStats} isLoading={personalLoading} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Đăng nhập để xem tác động cá nhân của bạn
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map">
            <TreeMap />
          </TabsContent>

          {/* Carbon Calculator Tab */}
          <TabsContent value="calculator">
            <CarbonCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

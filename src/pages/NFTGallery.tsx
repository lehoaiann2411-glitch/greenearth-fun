import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGreenNfts } from '@/hooks/useGreenNfts';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TreePine, Leaf } from 'lucide-react';
import { NftCard } from '@/components/nft/NftCard';
import { NftFilters } from '@/components/nft/NftFilters';
import { CreateNftDialog } from '@/components/nft/CreateNftDialog';

export default function NFTGallery() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: nfts, isLoading } = useGreenNfts();

  // Filters
  const [treeType, setTreeType] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('newest');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Filtered and sorted NFTs
  const filteredNfts = useMemo(() => {
    if (!nfts) return [];

    let result = [...nfts];

    // Filter by tree type
    if (treeType !== 'Tất cả') {
      result = result.filter((nft) => nft.tree_type === treeType);
    }

    // Filter by verified status
    if (verifiedOnly) {
      result = result.filter((nft) => nft.verified);
    }

    // Sort
    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => new Date(a.planted_at).getTime() - new Date(b.planted_at).getTime());
        break;
      case 'co2_high':
        result.sort((a, b) => (b.co2_absorbed || 0) - (a.co2_absorbed || 0));
        break;
      case 'co2_low':
        result.sort((a, b) => (a.co2_absorbed || 0) - (b.co2_absorbed || 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.planted_at).getTime() - new Date(a.planted_at).getTime());
        break;
    }

    return result;
  }, [nfts, treeType, sortBy, verifiedOnly]);

  // Stats
  const stats = useMemo(() => {
    if (!nfts) return { total: 0, verified: 0, totalCo2: 0 };
    return {
      total: nfts.length,
      verified: nfts.filter((n) => n.verified).length,
      totalCo2: nfts.reduce((sum, n) => sum + (n.co2_absorbed || 0), 0),
    };
  }, [nfts]);

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8 md:py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[340px] w-full rounded-xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-leaf">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Bộ Sưu Tập Green NFT
          </h1>
          <p className="mt-2 text-muted-foreground">
            Chứng nhận số cho mỗi cây xanh bạn đã trồng hoặc tài trợ
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 flex justify-center gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Tổng NFT</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-accent">{stats.verified}</p>
            <p className="text-sm text-muted-foreground">Đã xác nhận</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{stats.totalCo2}</p>
            <p className="text-sm text-muted-foreground">kg CO₂</p>
          </div>
        </div>

        {/* Actions & Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <NftFilters
            treeType={treeType}
            onTreeTypeChange={setTreeType}
            sortBy={sortBy}
            onSortChange={setSortBy}
            verifiedOnly={verifiedOnly}
            onVerifiedOnlyChange={setVerifiedOnly}
          />
          <CreateNftDialog />
        </div>

        {/* NFT Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[340px] w-full rounded-xl" />
            ))}
          </div>
        ) : filteredNfts.length === 0 ? (
          <Card className="py-16 text-center">
            <CardContent>
              <TreePine className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">
                {nfts?.length === 0 ? 'Chưa có NFT nào' : 'Không tìm thấy NFT'}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {nfts?.length === 0
                  ? 'Nhấn "Mint NFT Mới" để tạo chứng nhận cây xanh đầu tiên!'
                  : 'Thử thay đổi bộ lọc để xem thêm NFT'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredNfts.map((nft, index) => (
              <NftCard key={nft.id} nft={nft} index={index} />
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-12 rounded-2xl border bg-muted/30 p-6 text-center">
          <h3 className="font-display text-lg font-semibold">Green NFT là gì?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Green NFT là chứng nhận số xác nhận đóng góp của bạn cho môi trường.
            Mỗi khi bạn trồng hoặc tài trợ một cây xanh, bạn sẽ nhận được một Green NFT
            làm bằng chứng cho hành động xanh của mình. Mỗi NFT mới sẽ thưởng 5,000 Camly Coin! 🪙
          </p>
        </div>
      </div>
    </Layout>
  );
}

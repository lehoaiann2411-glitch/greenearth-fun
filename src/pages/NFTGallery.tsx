import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGreenNfts } from '@/hooks/useGreenNfts';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TreePine, MapPin, Calendar, CheckCircle, Leaf } from 'lucide-react';

// Mock tree images for demo
const TREE_IMAGES = [
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&h=400&fit=crop',
];

// Mock data for demo if no NFTs exist
const MOCK_NFTS = [
  {
    id: '1',
    tree_type: 'Cây Bằng Lăng',
    location: 'Sóc Sơn, Hà Nội',
    planted_at: '2025-12-15T00:00:00Z',
    certificate_number: 'GE-2025-001',
    verified: true,
  },
  {
    id: '2',
    tree_type: 'Cây Phượng',
    location: 'Đà Nẵng',
    planted_at: '2025-11-20T00:00:00Z',
    certificate_number: 'GE-2025-002',
    verified: true,
  },
  {
    id: '3',
    tree_type: 'Cây Sấu',
    location: 'Hồ Chí Minh',
    planted_at: '2025-10-10T00:00:00Z',
    certificate_number: 'GE-2025-003',
    verified: false,
  },
];

interface NFTCardProps {
  nft: {
    id: string;
    tree_type: string;
    location?: string | null;
    planted_at: string;
    certificate_number?: string | null;
    verified: boolean;
  };
  index: number;
}

function NFTCard({ nft, index }: NFTCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="group perspective-1000 h-[380px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative h-full w-full transition-transform duration-700 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <Card
          className="absolute inset-0 overflow-hidden backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="relative h-48 overflow-hidden">
            <img
              src={TREE_IMAGES[index % TREE_IMAGES.length]}
              alt={nft.tree_type}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {nft.verified && (
              <Badge className="absolute right-2 top-2 gap-1 bg-primary">
                <CheckCircle className="h-3 w-3" />
                Đã xác nhận
              </Badge>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <p className="font-display text-lg font-bold text-white">
                {nft.tree_type}
              </p>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              {nft.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{nft.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{new Date(nft.planted_at).toLocaleDateString('vi-VN')}</span>
              </div>
              {nft.certificate_number && (
                <div className="flex items-center gap-2">
                  <TreePine className="h-4 w-4 text-primary" />
                  <span className="font-mono text-xs">{nft.certificate_number}</span>
                </div>
              )}
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Click để xem chi tiết
            </p>
          </CardContent>
        </Card>

        {/* Back */}
        <Card
          className="absolute inset-0 overflow-hidden backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6 text-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full gradient-forest">
            <TreePine className="h-10 w-10 text-primary-foreground" />
          </div>
          <h3 className="font-display text-xl font-bold">{nft.tree_type}</h3>
          {nft.certificate_number && (
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              {nft.certificate_number}
            </p>
          )}
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            {nft.location && <p>📍 {nft.location}</p>}
            <p>📅 {new Date(nft.planted_at).toLocaleDateString('vi-VN')}</p>
          </div>
          {nft.verified ? (
            <Badge className="mt-4 gap-1 bg-primary">
              <CheckCircle className="h-3 w-3" />
              Chứng nhận chính thức
            </Badge>
          ) : (
            <Badge variant="secondary" className="mt-4">
              Đang xác minh
            </Badge>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Click để quay lại
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function NFTGallery() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: nfts, isLoading } = useGreenNfts();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Use mock data if no real NFTs exist
  const displayNfts = nfts?.length ? nfts : MOCK_NFTS;

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8 md:py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[380px] w-full rounded-xl" />
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
            <p className="text-3xl font-bold text-primary">{displayNfts.length}</p>
            <p className="text-sm text-muted-foreground">Tổng NFT</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-accent">
              {displayNfts.filter((n) => n.verified).length}
            </p>
            <p className="text-sm text-muted-foreground">Đã xác nhận</p>
          </div>
        </div>

        {/* NFT Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[380px] w-full rounded-xl" />
            ))}
          </div>
        ) : displayNfts.length === 0 ? (
          <Card className="py-16 text-center">
            <CardContent>
              <TreePine className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Chưa có NFT nào</h3>
              <p className="mt-2 text-muted-foreground">
                Tham gia các chiến dịch trồng cây để nhận chứng nhận Green NFT
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayNfts.map((nft, index) => (
              <NFTCard key={nft.id} nft={nft} index={index} />
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-12 rounded-2xl border bg-muted/30 p-6 text-center">
          <h3 className="font-display text-lg font-semibold">Green NFT là gì?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Green NFT là chứng nhận số xác nhận đóng góp của bạn cho môi trường. 
            Mỗi khi bạn trồng hoặc tài trợ một cây xanh, bạn sẽ nhận được một Green NFT 
            làm bằng chứng cho hành động xanh của mình.
          </p>
        </div>
      </div>
    </Layout>
  );
}

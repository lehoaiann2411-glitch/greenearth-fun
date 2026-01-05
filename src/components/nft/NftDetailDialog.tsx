import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TreePine, MapPin, Calendar, CheckCircle, ExternalLink, Share2, Copy } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type GreenNft = Tables<'green_nfts'>;

const TREE_IMAGES = [
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&h=400&fit=crop',
];

interface NftDetailDialogProps {
  nft: GreenNft;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NftDetailDialog({ nft, open, onOpenChange }: NftDetailDialogProps) {
  const imageUrl = nft.image_url || TREE_IMAGES[Math.floor(Math.random() * TREE_IMAGES.length)];

  const handleShare = async () => {
    const shareData = {
      title: `Green NFT: ${nft.tree_type}`,
      text: `Tôi đã trồng ${nft.tree_type} tại ${nft.location || 'Việt Nam'}! 🌳`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      toast.success('Đã sao chép link!');
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(nft.id);
    toast.success('Đã sao chép NFT ID!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TreePine className="h-5 w-5 text-primary" />
            Chi Tiết Green NFT
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image */}
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <img
              src={imageUrl}
              alt={nft.tree_type}
              className="h-full w-full object-cover"
            />
            {nft.verified && (
              <Badge className="absolute right-2 top-2 gap-1 bg-primary">
                <CheckCircle className="h-3 w-3" />
                Đã xác nhận
              </Badge>
            )}
          </div>

          {/* Main Info */}
          <div className="text-center">
            <h3 className="font-display text-2xl font-bold">{nft.tree_type}</h3>
            {nft.certificate_number && (
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                {nft.certificate_number}
              </p>
            )}
          </div>

          <Separator />

          {/* Details */}
          <div className="grid gap-3 text-sm">
            {nft.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{nft.location}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Trồng ngày: {new Date(nft.planted_at).toLocaleDateString('vi-VN')}</span>
            </div>
            {nft.co2_absorbed && (
              <div className="flex items-center gap-3">
                <span className="text-lg">🌿</span>
                <span>{nft.co2_absorbed} kg CO₂ đã hấp thụ</span>
              </div>
            )}
            {nft.latitude && nft.longitude && (
              <div className="flex items-center gap-3">
                <span className="text-lg">📍</span>
                <span className="font-mono text-xs">
                  {nft.latitude.toFixed(6)}, {nft.longitude.toFixed(6)}
                </span>
              </div>
            )}
          </div>

          {/* Blockchain Info */}
          {(nft.token_id || nft.contract_address || nft.transaction_hash) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Thông tin Blockchain</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {nft.token_id && (
                    <p>Token ID: <span className="font-mono">{nft.token_id}</span></p>
                  )}
                  {nft.contract_address && (
                    <p className="truncate">
                      Contract: <span className="font-mono">{nft.contract_address}</span>
                    </p>
                  )}
                  {nft.transaction_hash && (
                    <a
                      href={`https://etherscan.io/tx/${nft.transaction_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      Xem giao dịch <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleCopyId}
            >
              <Copy className="h-4 w-4" />
              Sao chép ID
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              Chia sẻ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

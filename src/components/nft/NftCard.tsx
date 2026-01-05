import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TreePine, MapPin, Calendar, CheckCircle, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { EditNftDialog } from './EditNftDialog';
import { DeleteNftDialog } from './DeleteNftDialog';
import { NftDetailDialog } from './NftDetailDialog';

type GreenNft = Tables<'green_nfts'>;

const TREE_IMAGES = [
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&h=400&fit=crop',
];

interface NftCardProps {
  nft: GreenNft;
  index: number;
}

export function NftCard({ nft, index }: NftCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const imageUrl = nft.image_url || TREE_IMAGES[index % TREE_IMAGES.length];

  return (
    <>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
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
          <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
            <p className="font-display text-lg font-bold text-white">
              {nft.tree_type}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-black/30 text-white hover:bg-black/50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDetailOpen(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            {nft.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="truncate">{nft.location}</span>
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
            {nft.co2_absorbed && (
              <div className="mt-2 rounded-full bg-primary/10 px-2 py-1 text-center text-xs font-medium text-primary">
                🌿 {nft.co2_absorbed} kg CO₂ hấp thụ
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditNftDialog nft={nft} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteNftDialog nft={nft} open={deleteOpen} onOpenChange={setDeleteOpen} />
      <NftDetailDialog nft={nft} open={detailOpen} onOpenChange={setDetailOpen} />
    </>
  );
}

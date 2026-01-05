import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateGreenNft } from '@/hooks/useGreenNfts';
import { Pencil, MapPin, Loader2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type GreenNft = Tables<'green_nfts'>;

const TREE_TYPES = [
  'Cây Bằng Lăng',
  'Cây Phượng',
  'Cây Sấu',
  'Cây Xà Cừ',
  'Cây Bàng',
  'Cây Dừa',
  'Cây Tre',
  'Cây Thông',
  'Cây Sồi',
  'Cây Cau',
  'Khác',
];

interface EditNftDialogProps {
  nft: GreenNft;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditNftDialog({ nft, open, onOpenChange }: EditNftDialogProps) {
  const [treeType, setTreeType] = useState(nft.tree_type);
  const [isCustomType, setIsCustomType] = useState(false);
  const [location, setLocation] = useState(nft.location || '');
  const [latitude, setLatitude] = useState(nft.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(nft.longitude?.toString() || '');
  const [certificateNumber, setCertificateNumber] = useState(nft.certificate_number || '');

  const updateNft = useUpdateGreenNft();

  useEffect(() => {
    if (open) {
      const isKnownType = TREE_TYPES.includes(nft.tree_type);
      setIsCustomType(!isKnownType);
      setTreeType(isKnownType ? nft.tree_type : 'Khác');
      setLocation(nft.location || '');
      setLatitude(nft.latitude?.toString() || '');
      setLongitude(nft.longitude?.toString() || '');
      setCertificateNumber(nft.certificate_number || '');
    }
  }, [open, nft]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalTreeType = isCustomType ? treeType : treeType;

    await updateNft.mutateAsync({
      id: nft.id,
      tree_type: finalTreeType,
      location: location || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      certificate_number: certificateNumber || null,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Chỉnh Sửa NFT
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="treeType">Loại cây *</Label>
            {!isCustomType ? (
              <Select value={treeType} onValueChange={(val) => {
                if (val === 'Khác') {
                  setIsCustomType(true);
                  setTreeType(nft.tree_type);
                } else {
                  setTreeType(val);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại cây" />
                </SelectTrigger>
                <SelectContent>
                  {TREE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập tên loại cây"
                  value={treeType}
                  onChange={(e) => setTreeType(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCustomType(false);
                    setTreeType(TREE_TYPES[0]);
                  }}
                >
                  Danh sách
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Địa điểm</Label>
            <Input
              id="location"
              placeholder="VD: Sóc Sơn, Hà Nội"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tọa độ GPS</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleGetLocation}
                className="gap-1 text-xs"
              >
                <MapPin className="h-3 w-3" />
                Lấy vị trí
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                type="number"
                step="any"
              />
              <Input
                placeholder="Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                type="number"
                step="any"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificate">Số chứng nhận</Label>
            <Input
              id="certificate"
              placeholder="VD: GE-2025-001"
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
            />
          </div>

          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <p>📅 Ngày tạo: {new Date(nft.planted_at).toLocaleDateString('vi-VN')}</p>
            <p>✓ Trạng thái: {nft.verified ? 'Đã xác nhận' : 'Đang chờ xác minh'}</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={updateNft.isPending || !treeType}
            >
              {updateNft.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

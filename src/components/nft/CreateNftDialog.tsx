import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateGreenNft } from '@/hooks/useGreenNfts';
import { Plus, TreePine, MapPin, Loader2 } from 'lucide-react';

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

interface CreateNftDialogProps {
  children?: React.ReactNode;
}

export function CreateNftDialog({ children }: CreateNftDialogProps) {
  const [open, setOpen] = useState(false);
  const [treeType, setTreeType] = useState('');
  const [customTreeType, setCustomTreeType] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');

  const createNft = useCreateGreenNft();

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
    
    const finalTreeType = treeType === 'Khác' ? customTreeType : treeType;
    
    if (!finalTreeType) return;

    await createNft.mutateAsync({
      tree_type: finalTreeType,
      location: location || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      certificate_number: certificateNumber || null,
      planted_at: new Date().toISOString(),
      verified: false,
    });

    // Reset form
    setTreeType('');
    setCustomTreeType('');
    setLocation('');
    setLatitude('');
    setLongitude('');
    setCertificateNumber('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Mint NFT Mới
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TreePine className="h-5 w-5 text-primary" />
            Tạo Green NFT Mới
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="treeType">Loại cây *</Label>
            <Select value={treeType} onValueChange={setTreeType}>
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
            {treeType === 'Khác' && (
              <Input
                placeholder="Nhập tên loại cây"
                value={customTreeType}
                onChange={(e) => setCustomTreeType(e.target.value)}
              />
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
            <Label htmlFor="certificate">Số chứng nhận (nếu có)</Label>
            <Input
              id="certificate"
              placeholder="VD: GE-2025-001"
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
            />
          </div>

          <div className="rounded-lg bg-primary/10 p-3 text-sm">
            <p className="font-medium text-primary">🪙 Phần thưởng: +5,000 Camly Coin</p>
            <p className="text-muted-foreground">Bạn sẽ nhận được Camly Coin khi tạo NFT thành công!</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={createNft.isPending || (!treeType || (treeType === 'Khác' && !customTreeType))}
            >
              {createNft.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <TreePine className="h-4 w-4" />
                  Mint NFT
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

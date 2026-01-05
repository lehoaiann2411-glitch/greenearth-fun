import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const TREE_TYPES = [
  'Tất cả',
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
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'co2_high', label: 'CO₂ cao nhất' },
  { value: 'co2_low', label: 'CO₂ thấp nhất' },
];

interface NftFiltersProps {
  treeType: string;
  onTreeTypeChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  verifiedOnly: boolean;
  onVerifiedOnlyChange: (value: boolean) => void;
}

export function NftFilters({
  treeType,
  onTreeTypeChange,
  sortBy,
  onSortChange,
  verifiedOnly,
  onVerifiedOnlyChange,
}: NftFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Select value={treeType} onValueChange={onTreeTypeChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Loại cây" />
        </SelectTrigger>
        <SelectContent>
          {TREE_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="verified"
          checked={verifiedOnly}
          onCheckedChange={(checked) => onVerifiedOnlyChange(checked as boolean)}
        />
        <Label htmlFor="verified" className="text-sm cursor-pointer">
          Chỉ đã xác nhận
        </Label>
      </div>
    </div>
  );
}

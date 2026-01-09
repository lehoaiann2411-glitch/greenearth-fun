import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface CategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
}

const categories = [
  { id: 'all', label: 'All', labelVi: 'Tất cả', icon: '🌍' },
  { id: 'zero_waste', label: 'Zero Waste', labelVi: 'Không rác thải', icon: '♻️' },
  { id: 'circular_economy', label: 'Circular Economy', labelVi: 'Kinh tế tuần hoàn', icon: '🔄' },
  { id: 'carbon', label: 'Carbon Footprint', labelVi: 'Dấu chân carbon', icon: '👣' },
  { id: 'recycling', label: 'Recycling', labelVi: 'Tái chế', icon: '🗑️' },
  { id: 'composting', label: 'Composting', labelVi: 'Ủ phân', icon: '🌱' },
  { id: 'sustainable_living', label: 'Sustainable Living', labelVi: 'Sống bền vững', icon: '🏡' },
];

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const { i18n } = useTranslation();
  const isVi = i18n.language === 'vi';

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={selected === cat.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(cat.id)}
          className="gap-1.5"
        >
          <span>{cat.icon}</span>
          <span>{isVi ? cat.labelVi : cat.label}</span>
        </Button>
      ))}
    </div>
  );
}

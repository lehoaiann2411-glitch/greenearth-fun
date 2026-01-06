import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FEELINGS } from '@/lib/camlyCoin';

interface FeelingPickerProps {
  selectedFeeling?: string | null;
  onSelect: (feeling: { id: string; emoji: string; label: string } | null) => void;
}

export function FeelingPicker({ selectedFeeling, onSelect }: FeelingPickerProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const isVietnamese = i18n.language === 'vi';

  const filteredFeelings = FEELINGS.filter(feeling => {
    const label = isVietnamese ? feeling.label_vi : feeling.label;
    return label.toLowerCase().includes(search.toLowerCase());
  });

  const selectedFeelingData = FEELINGS.find(f => f.id === selectedFeeling);

  const handleSelect = (feeling: typeof FEELINGS[number]) => {
    onSelect({ id: feeling.id, emoji: feeling.emoji, label: isVietnamese ? feeling.label_vi : feeling.label });
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onSelect(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "gap-2",
            selectedFeeling && "text-primary"
          )}
        >
          <span className="text-lg">😊</span>
          <span className="text-sm">
            {selectedFeelingData 
              ? `${selectedFeelingData.emoji} ${isVietnamese ? selectedFeelingData.label_vi : selectedFeelingData.label}`
              : t('post.feeling')
            }
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">😊</span>
            {t('post.howFeeling')}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('post.searchFeelings')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Selected Feeling */}
        {selectedFeelingData && (
          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedFeelingData.emoji}</span>
              <span className="font-medium">
                {isVietnamese ? selectedFeelingData.label_vi : selectedFeelingData.label}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Feelings Grid */}
        <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
          {filteredFeelings.map((feeling, index) => (
            <motion.button
              key={feeling.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => handleSelect(feeling)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all",
                "hover:bg-muted text-left",
                selectedFeeling === feeling.id && "bg-primary/10 border border-primary"
              )}
            >
              <span className="text-2xl">{feeling.emoji}</span>
              <span className="text-sm font-medium">
                {isVietnamese ? feeling.label_vi : feeling.label}
              </span>
            </motion.button>
          ))}
        </div>

        {filteredFeelings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {t('post.noFeelingsFound')}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Compact display for selected feeling
export function FeelingBadge({ 
  feeling, 
  onRemove 
}: { 
  feeling: { emoji: string; label: string }; 
  onRemove?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
        "bg-primary/10 text-primary text-sm"
      )}
    >
      <span>{feeling.emoji}</span>
      <span>{feeling.label}</span>
      {onRemove && (
        <button 
          onClick={onRemove}
          className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  );
}

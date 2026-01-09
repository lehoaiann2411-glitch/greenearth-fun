import { Button } from '@/components/ui/button';
import { Recycle, Leaf, Zap, TreeDeciduous } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
}

const prompts = [
  {
    icon: Recycle,
    key: 'recycling',
    vi: 'Hướng dẫn phân loại rác tại nhà',
    en: 'How to sort waste at home?',
  },
  {
    icon: Leaf,
    key: 'plastic',
    vi: 'Làm sao để giảm rác thải nhựa?',
    en: 'How to reduce plastic waste?',
  },
  {
    icon: Zap,
    key: 'energy',
    vi: 'Mẹo tiết kiệm điện nước',
    en: 'Tips for saving electricity and water',
  },
  {
    icon: TreeDeciduous,
    key: 'compost',
    vi: 'Cách làm compost đơn giản',
    en: 'How to make simple compost',
  },
];

export function QuickPrompts({ onSelect }: QuickPromptsProps) {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language === 'vi';

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground text-center">
        {t('chatbot.quickPrompts', 'Try asking:')}
      </p>
      <div className="grid grid-cols-1 gap-2">
        {prompts.map((prompt) => (
          <Button
            key={prompt.key}
            variant="outline"
            className="h-auto py-3 px-4 justify-start text-left gap-3 hover:bg-green-50 dark:hover:bg-green-950/30 hover:border-green-300 dark:hover:border-green-700"
            onClick={() => onSelect(isVi ? prompt.vi : prompt.en)}
          >
            <prompt.icon className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-sm">{isVi ? prompt.vi : prompt.en}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguageSync } from '@/hooks/useLanguageSync';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { changeLanguage, currentLanguage } = useLanguageSync();

  const handleChangeLanguage = async (lng: string) => {
    await changeLanguage(lng);
  };

  const currentLang = languages.find(l => l.code === currentLanguage) || languages.find(l => l.code === 'en')!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 hover:bg-primary/10 transition-colors"
        >
          <span className="text-lg">{currentLang.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <ScrollArea className="h-80">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleChangeLanguage(lang.code)}
              className={cn(
                'cursor-pointer flex items-center justify-between transition-colors',
                currentLanguage === lang.code && 'bg-primary/10 font-medium'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
              {currentLanguage === lang.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

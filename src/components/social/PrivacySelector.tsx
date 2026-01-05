import { useState } from 'react';
import { Globe, Users, Lock, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type PrivacyOption = 'public' | 'friends' | 'private';

interface PrivacySelectorProps {
  value: PrivacyOption;
  onChange: (value: PrivacyOption) => void;
  language?: 'en' | 'vi';
  size?: 'sm' | 'default';
}

const PRIVACY_OPTIONS = [
  {
    value: 'public' as const,
    icon: Globe,
    label: 'Public',
    label_vi: 'Công khai',
    description: 'Anyone can see this post',
    description_vi: 'Bất kỳ ai cũng có thể xem',
  },
  {
    value: 'friends' as const,
    icon: Users,
    label: 'Friends',
    label_vi: 'Bạn bè',
    description: 'Only your followers can see',
    description_vi: 'Chỉ người theo dõi mới xem được',
  },
  {
    value: 'private' as const,
    icon: Lock,
    label: 'Only me',
    label_vi: 'Chỉ mình tôi',
    description: 'Only you can see this post',
    description_vi: 'Chỉ bạn mới xem được',
  },
];

export function PrivacySelector({ 
  value, 
  onChange, 
  language = 'en',
  size = 'default' 
}: PrivacySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = PRIVACY_OPTIONS.find(opt => opt.value === value) || PRIVACY_OPTIONS[0];
  const Icon = selectedOption.icon;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size={size}
          className={cn(
            "gap-2",
            size === 'sm' && "h-8 px-2 text-xs"
          )}
        >
          <Icon className={cn("w-4 h-4", size === 'sm' && "w-3 h-3")} />
          <span>{language === 'vi' ? selectedOption.label_vi : selectedOption.label}</span>
          <ChevronDown className={cn("w-4 h-4", size === 'sm' && "w-3 h-3")} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        {PRIVACY_OPTIONS.map((option) => {
          const OptionIcon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "flex items-start gap-3 p-3 cursor-pointer",
                value === option.value && "bg-primary/10"
              )}
            >
              <div className={cn(
                "mt-0.5 p-1.5 rounded-full",
                value === option.value ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <OptionIcon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium">
                  {language === 'vi' ? option.label_vi : option.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {language === 'vi' ? option.description_vi : option.description}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

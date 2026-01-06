import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  size?: 'sm' | 'default';
}

const PRIVACY_OPTIONS = [
  {
    value: 'public' as const,
    icon: Globe,
  },
  {
    value: 'friends' as const,
    icon: Users,
  },
  {
    value: 'private' as const,
    icon: Lock,
  },
];

export function PrivacySelector({ 
  value, 
  onChange, 
  size = 'default' 
}: PrivacySelectorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = PRIVACY_OPTIONS.find(opt => opt.value === value) || PRIVACY_OPTIONS[0];
  const Icon = selectedOption.icon;

  const getLabel = (privacyValue: PrivacyOption) => t(`privacy.${privacyValue}`);
  const getDescription = (privacyValue: PrivacyOption) => t(`privacy.${privacyValue}Desc`);

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
          <span>{getLabel(selectedOption.value)}</span>
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
                  {getLabel(option.value)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getDescription(option.value)}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

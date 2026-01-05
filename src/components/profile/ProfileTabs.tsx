import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Info, Users, Image, Flag } from 'lucide-react';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: FileText },
    { id: 'about', label: 'About', icon: Info },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'photos', label: 'Photos', icon: Image },
    { id: 'campaigns', label: 'Campaigns', icon: Flag },
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-lg">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-background"
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Link as LinkIcon, 
  Calendar,
  TreePine,
  Target,
} from 'lucide-react';
import { CamlyCoinIcon } from '@/components/rewards/CamlyCoinIcon';
import { formatCamly } from '@/lib/camlyCoin';

interface ProfileAboutProps {
  profile: {
    id: string;
    full_name: string | null;
    bio: string | null;
    location: string | null;
    work?: string | null;
    education?: string | null;
    website?: string | null;
    trees_planted: number;
    campaigns_joined: number;
    camly_balance?: number;
    created_at: string;
  };
}

export function ProfileAbout({ profile }: ProfileAboutProps) {
  const treesPlanted = profile.trees_planted ?? 0;
  const campaignsJoined = profile.campaigns_joined ?? 0;
  const camlyBalance = profile.camly_balance ?? 0;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.bio && (
            <div>
              <p className="text-muted-foreground">{profile.bio}</p>
            </div>
          )}

          <div className="space-y-3">
            {profile.work && (
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Works at</p>
                  <p className="text-sm text-muted-foreground">{profile.work}</p>
                </div>
              </div>
            )}

            {profile.education && (
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Studied at</p>
                  <p className="text-sm text-muted-foreground">{profile.education}</p>
                </div>
              </div>
            )}

            {profile.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Lives in</p>
                  <p className="text-sm text-muted-foreground">{profile.location}</p>
                </div>
              </div>
            )}

            {profile.website && (
              <div className="flex items-center gap-3">
                <LinkIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Website</p>
                  <a 
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Joined</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(profile.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eco Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Eco Impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camly Balance */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-950/50 dark:to-amber-900/50 border border-yellow-200 dark:border-yellow-800">
            <CamlyCoinIcon size="lg" animated />
            <div>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{formatCamly(camlyBalance)}</p>
              <p className="text-sm text-muted-foreground">Camly Coin</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
              <TreePine className="h-6 w-6 mx-auto text-green-600" />
              <p className="mt-2 text-2xl font-bold text-green-600">{treesPlanted}</p>
              <p className="text-sm text-muted-foreground">Trees Planted</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
              <Target className="h-6 w-6 mx-auto text-blue-600" />
              <p className="mt-2 text-2xl font-bold text-blue-600">{campaignsJoined}</p>
              <p className="text-sm text-muted-foreground">Campaigns</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

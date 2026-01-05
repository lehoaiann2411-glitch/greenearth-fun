import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Link as LinkIcon, 
  Calendar,
  TreePine,
  Award,
  Target,
  Leaf,
} from 'lucide-react';
import { getRankByPoints } from '@/lib/greenRanks';

interface ProfileAboutProps {
  profile: {
    id: string;
    full_name: string | null;
    bio: string | null;
    location: string | null;
    work?: string | null;
    education?: string | null;
    website?: string | null;
    green_points: number;
    trees_planted: number;
    campaigns_joined: number;
    created_at: string;
  };
}

export function ProfileAbout({ profile }: ProfileAboutProps) {
  const currentRank = getRankByPoints(profile.green_points);
  const RankIcon = currentRank.icon;

  const achievements = [
    { 
      name: 'Pioneer', 
      icon: Award, 
      earned: profile.campaigns_joined >= 1,
      description: 'Joined first campaign'
    },
    { 
      name: 'Tree Guardian', 
      icon: TreePine, 
      earned: profile.trees_planted >= 5,
      description: 'Planted 5+ trees'
    },
    { 
      name: 'Green Warrior', 
      icon: Target, 
      earned: profile.green_points >= 500,
      description: 'Earned 500+ points'
    },
    { 
      name: 'Eco Leader', 
      icon: Leaf, 
      earned: profile.green_points >= 2000,
      description: 'Earned 2000+ points'
    },
  ];

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

      {/* Green Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Green Impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rank */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${currentRank.bgClass} ${currentRank.colorClass}`}>
              <RankIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">{currentRank.name}</p>
              <p className="text-sm text-muted-foreground">{profile.green_points.toLocaleString()} Green Points</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
              <TreePine className="h-6 w-6 mx-auto text-green-600" />
              <p className="mt-2 text-2xl font-bold text-green-600">{profile.trees_planted}</p>
              <p className="text-sm text-muted-foreground">Trees Planted</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
              <Target className="h-6 w-6 mx-auto text-blue-600" />
              <p className="mt-2 text-2xl font-bold text-blue-600">{profile.campaigns_joined}</p>
              <p className="text-sm text-muted-foreground">Campaigns</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.name}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                  achievement.earned
                    ? 'border-primary/30 bg-primary/5'
                    : 'opacity-40 grayscale'
                }`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  achievement.earned ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  <achievement.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">{achievement.name}</span>
                <span className="text-xs text-muted-foreground">{achievement.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

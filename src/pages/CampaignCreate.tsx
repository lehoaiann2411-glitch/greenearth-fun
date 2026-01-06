import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCampaign, uploadCampaignImage, CampaignCategory } from '@/hooks/useCampaigns';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES: { value: CampaignCategory; labelKey: string }[] = [
  { value: 'tree_planting', labelKey: 'categories.tree_planting' },
  { value: 'cleanup', labelKey: 'categories.cleanup' },
  { value: 'recycling', labelKey: 'categories.recycling' },
  { value: 'awareness', labelKey: 'categories.awareness' },
  { value: 'other', labelKey: 'categories.other' },
];

export default function CampaignCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const createMutation = useCreateCampaign();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'tree_planting' as CampaignCategory,
    location: '',
    start_date: '',
    end_date: '',
    target_participants: 10,
    target_trees: 0,
    green_points_reward: 10,
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.start_date || !formData.end_date) {
      toast.error(t('campaign.validation.fillRequired'));
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      toast.error(t('campaign.validation.endDateAfterStart'));
      return;
    }

    try {
      setIsUploading(true);
      let image_url: string | undefined;
      
      if (imageFile) {
        image_url = await uploadCampaignImage(imageFile);
      }

      await createMutation.mutateAsync({
        ...formData,
        image_url,
      });
      
      navigate('/campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h2 className="text-xl font-semibold mb-4">{t('campaign.loginRequired')}</h2>
          <Button asChild>
            <Link to="/auth">{t('nav.login')}</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/campaigns">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{t('campaign.createTitle')}</CardTitle>
            <CardDescription>
              {t('campaign.createDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>{t('campaign.image')}</Label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      {t('campaign.clickToUpload')}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">{t('campaign.name')} *</Label>
                <Input
                  id="title"
                  placeholder={t('campaign.namePlaceholder')}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t('campaign.descriptionLabel')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('campaign.descriptionPlaceholder')}
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>{t('campaign.category')} *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as CampaignCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {t(cat.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">{t('campaign.location')}</Label>
                <Input
                  id="location"
                  placeholder={t('campaign.locationPlaceholder')}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              {/* Date Range */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">{t('campaign.startDate')} *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">{t('campaign.endDate')} *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Targets */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_participants">{t('campaign.targetParticipants')} *</Label>
                  <Input
                    id="target_participants"
                    type="number"
                    min={1}
                    value={formData.target_participants}
                    onChange={(e) => setFormData({ ...formData, target_participants: parseInt(e.target.value) || 10 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_trees">{t('campaign.targetTrees')}</Label>
                  <Input
                    id="target_trees"
                    type="number"
                    min={0}
                    value={formData.target_trees}
                    onChange={(e) => setFormData({ ...formData, target_trees: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Green Points Reward */}
              <div className="space-y-2">
                <Label htmlFor="green_points_reward">{t('campaign.rewardPoints')}</Label>
                <Input
                  id="green_points_reward"
                  type="number"
                  min={1}
                  max={100}
                  value={formData.green_points_reward}
                  onChange={(e) => setFormData({ ...formData, green_points_reward: parseInt(e.target.value) || 10 })}
                />
                <p className="text-sm text-muted-foreground">
                  {t('campaign.rewardPointsDesc')}
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/campaigns')}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending || isUploading}
                >
                  {(createMutation.isPending || isUploading) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {t('campaign.create')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

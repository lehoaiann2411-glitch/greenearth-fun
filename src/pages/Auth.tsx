import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Leaf, User, Building2, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

export default function Auth() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const defaultMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  
  const [activeTab, setActiveTab] = useState(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [accountType, setAccountType] = useState<'individual' | 'organization'>('individual');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});
  
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const emailSchema = z.string().email(t('auth.validation.invalidEmail'));
  const passwordSchema = z.string().min(6, t('auth.validation.passwordMin'));

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateForm = (isSignup: boolean) => {
    const newErrors: typeof errors = {};
    
    try {
      emailSchema.parse(email);
    } catch {
      newErrors.email = t('auth.validation.invalidEmail');
    }
    
    try {
      passwordSchema.parse(password);
    } catch {
      newErrors.password = t('auth.validation.passwordMin');
    }
    
    if (isSignup && !fullName.trim()) {
      newErrors.fullName = t('auth.validation.nameRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;
    
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    
    if (error) {
      toast({
        variant: 'destructive',
        title: t('auth.loginFailed'),
        description: error.message === 'Invalid login credentials' 
          ? t('auth.invalidCredentials')
          : error.message,
      });
    } else {
      toast({
        title: t('auth.loginSuccess'),
        description: t('auth.welcomeBack'),
      });
      navigate('/dashboard');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    
    setLoading(true);
    const { error } = await signUp(email, password, fullName, accountType);
    
    if (error) {
      setLoading(false);
      let message = error.message;
      if (error.message.includes('already registered')) {
        message = t('auth.emailAlreadyRegistered');
      }
      toast({
        variant: 'destructive',
        title: t('auth.signupFailed'),
        description: message,
      });
    } else {
      // Auto login after signup
      const { error: signInError } = await signIn(email, password);
      setLoading(false);
      
      if (signInError) {
        toast({
          title: t('auth.signupSuccess'),
          description: t('auth.pleaseLogin'),
        });
        setActiveTab('login');
      } else {
        toast({
          title: t('auth.welcomeToGreenEarth'),
          description: t('auth.accountCreated'),
        });
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen gradient-earth">
      {/* Back button */}
      <div className="container pt-6">
        <Button variant="ghost" asChild className="gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            {t('auth.backToHome')}
          </Link>
        </Button>
      </div>

      <div className="container flex min-h-[calc(100vh-80px)] items-center justify-center py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-forest shadow-glow-primary">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold text-gradient-forest">
              Green Earth
            </h1>
            <p className="mt-1 text-muted-foreground">
              {t('auth.tagline')}
            </p>
          </div>

          <Card className="shadow-xl">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
                  <TabsTrigger value="signup">{t('auth.signup')}</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                {/* Login Tab */}
                <TabsContent value="login" className="mt-0">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t('auth.email')}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t('auth.password')}</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={errors.password ? 'border-destructive' : ''}
                      />
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full gradient-forest"
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('auth.login')}
                    </Button>
                  </form>
                </TabsContent>

                {/* Signup Tab */}
                <TabsContent value="signup" className="mt-0">
                  <form onSubmit={handleSignup} className="space-y-4">
                    {/* Account Type Selection */}
                    <div className="space-y-3">
                      <Label>{t('auth.accountType')}</Label>
                      <RadioGroup
                        value={accountType}
                        onValueChange={(value) => setAccountType(value as 'individual' | 'organization')}
                        className="grid grid-cols-2 gap-4"
                      >
                        <Label
                          htmlFor="individual"
                          className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                            accountType === 'individual'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value="individual" id="individual" className="sr-only" />
                          <User className={`h-8 w-8 ${accountType === 'individual' ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="font-medium">{t('auth.individual')}</span>
                        </Label>
                        <Label
                          htmlFor="organization"
                          className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                            accountType === 'organization'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value="organization" id="organization" className="sr-only" />
                          <Building2 className={`h-8 w-8 ${accountType === 'organization' ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="font-medium">{t('auth.organization')}</span>
                        </Label>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-name">
                        {accountType === 'individual' ? t('auth.fullName') : t('auth.orgName')}
                      </Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder={accountType === 'individual' ? t('auth.namePlaceholder') : t('auth.orgPlaceholder')}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={errors.fullName ? 'border-destructive' : ''}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-destructive">{errors.fullName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t('auth.email')}</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t('auth.password')}</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder={t('auth.passwordPlaceholder')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={errors.password ? 'border-destructive' : ''}
                      />
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full gradient-forest"
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('auth.createAccount')}
                    </Button>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}

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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Leaf, User, Building2, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  const [socialLoading, setSocialLoading] = useState<'google' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const { user, signIn, signUp, signInWithProvider } = useAuth();
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
    
    // Set session persistence based on "Remember me" checkbox
    if (!rememberMe) {
      // Clear any existing session from localStorage
      localStorage.removeItem('sb-mngorzlybgkahwkvyofd-auth-token');
    }
    
    const { error } = await signIn(email, password);
    setLoading(false);
    
    if (error) {
      let errorMessage = error.message;
      
      // Handle specific error cases
      if (error.message.includes('Email not confirmed')) {
        errorMessage = t('auth.emailNotConfirmed');
      } else if (error.message === 'Invalid login credentials') {
        errorMessage = t('auth.invalidCredentials');
      }
      
      toast({
        variant: 'destructive',
        title: t('auth.loginFailed'),
        description: errorMessage,
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
    setLoading(false);
    
    if (error) {
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
      // Show confirmation message - don't auto login since email confirmation is required
      toast({
        title: t('auth.signupSuccess'),
        description: t('auth.pleaseConfirmEmail'),
      });
      setActiveTab('login');
    }
  };

  const handleSocialLogin = async (provider: 'google') => {
    setSocialLoading(provider);
    const { error } = await signInWithProvider(provider);
    
    if (error) {
      setSocialLoading(null);
      toast({
        variant: 'destructive',
        title: t('auth.loginFailed'),
        description: error.message,
      });
    }
    // Note: OAuth redirects, so we don't need to setSocialLoading(null) on success
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      toast({
        variant: 'destructive',
        title: t('auth.error'),
        description: t('auth.validation.invalidEmail'),
      });
      return;
    }

    try {
      emailSchema.parse(forgotEmail);
    } catch {
      toast({
        variant: 'destructive',
        title: t('auth.error'),
        description: t('auth.validation.invalidEmail'),
      });
      return;
    }

    setForgotLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    setForgotLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: t('auth.error'),
        description: error.message,
      });
    } else {
      toast({
        title: t('auth.resetEmailSent'),
        description: t('auth.checkYourEmail'),
      });
      setShowForgotPassword(false);
      setForgotEmail('');
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
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember-me"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked === true)}
                        />
                        <Label htmlFor="remember-me" className="text-sm font-normal cursor-pointer">
                          {t('auth.rememberMe')}
                        </Label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-primary hover:underline"
                      >
                        {t('auth.forgotPassword')}
                      </button>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full gradient-forest"
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('auth.login')}
                    </Button>

                    {/* Social Login Divider */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          {t('auth.orContinueWith', 'Or continue with')}
                        </span>
                      </div>
                    </div>

                    {/* Social Login Buttons */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin('google')}
                      disabled={socialLoading !== null}
                      className="w-full gap-2"
                    >
                      {socialLoading === 'google' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      Google
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
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('auth.passwordPlaceholder')}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
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

                    {/* Social Login Divider */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          {t('auth.orContinueWith', 'Or continue with')}
                        </span>
                      </div>
                    </div>

                    {/* Social Login Buttons */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin('google')}
                      disabled={socialLoading !== null}
                      className="w-full gap-2"
                    >
                      {socialLoading === 'google' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      )}
                      Google
                    </Button>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('auth.forgotPassword')}</DialogTitle>
            <DialogDescription>
              {t('auth.forgotPasswordDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">{t('auth.email')}</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </div>
            <Button
              onClick={handleForgotPassword}
              disabled={forgotLoading}
              className="w-full gradient-forest"
            >
              {forgotLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth.sendResetLink')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

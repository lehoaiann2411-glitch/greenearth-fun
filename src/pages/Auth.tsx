import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Leaf, User, Building2, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email('Email không hợp lệ');
const passwordSchema = z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự');

export default function Auth() {
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
      newErrors.email = 'Email không hợp lệ';
    }
    
    try {
      passwordSchema.parse(password);
    } catch {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (isSignup && !fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
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
        title: 'Đăng nhập thất bại',
        description: error.message === 'Invalid login credentials' 
          ? 'Email hoặc mật khẩu không đúng'
          : error.message,
      });
    } else {
      toast({
        title: 'Đăng nhập thành công!',
        description: 'Chào mừng bạn quay trở lại Green Earth.',
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
        message = 'Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.';
      }
      toast({
        variant: 'destructive',
        title: 'Đăng ký thất bại',
        description: message,
      });
    } else {
      // Auto login after signup
      const { error: signInError } = await signIn(email, password);
      setLoading(false);
      
      if (signInError) {
        toast({
          title: 'Đăng ký thành công!',
          description: 'Vui lòng đăng nhập với tài khoản vừa tạo.',
        });
        setActiveTab('login');
      } else {
        toast({
          title: 'Chào mừng bạn đến Green Earth! 🌱',
          description: 'Tài khoản đã được tạo thành công.',
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
            Về trang chủ
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
              Cùng nhau xây dựng Trái Đất xanh
            </p>
          </div>

          <Card className="shadow-xl">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                  <TabsTrigger value="signup">Đăng ký</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                {/* Login Tab */}
                <TabsContent value="login" className="mt-0">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
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
                      <Label htmlFor="login-password">Mật khẩu</Label>
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
                      Đăng nhập
                    </Button>
                  </form>
                </TabsContent>

                {/* Signup Tab */}
                <TabsContent value="signup" className="mt-0">
                  <form onSubmit={handleSignup} className="space-y-4">
                    {/* Account Type Selection */}
                    <div className="space-y-3">
                      <Label>Loại tài khoản</Label>
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
                          <span className="font-medium">Cá nhân</span>
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
                          <span className="font-medium">Tổ chức</span>
                        </Label>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-name">
                        {accountType === 'individual' ? 'Họ và tên' : 'Tên tổ chức'}
                      </Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder={accountType === 'individual' ? 'Nguyễn Văn A' : 'Tên công ty/tổ chức'}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={errors.fullName ? 'border-destructive' : ''}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-destructive">{errors.fullName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
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
                      <Label htmlFor="signup-password">Mật khẩu</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Tối thiểu 6 ký tự"
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
                      Tạo tài khoản
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      Bằng việc đăng ký, bạn đồng ý với{' '}
                      <Link to="/terms" className="text-primary hover:underline">
                        Điều khoản sử dụng
                      </Link>{' '}
                      và{' '}
                      <Link to="/privacy" className="text-primary hover:underline">
                        Chính sách bảo mật
                      </Link>
                    </p>
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

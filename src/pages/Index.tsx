import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Leaf, 
  TreePine, 
  Users, 
  Award, 
  Globe, 
  ArrowRight,
  Sprout,
  Heart,
  TrendingUp,
  Shield
} from 'lucide-react';

export default function Index() {
  const stats = [
    { icon: TreePine, value: '10,000+', label: 'Cây đã trồng', color: 'text-primary' },
    { icon: Users, value: '5,000+', label: 'Thành viên', color: 'text-sky' },
    { icon: Globe, value: '50+', label: 'Chiến dịch', color: 'text-accent' },
    { icon: Award, value: '100K+', label: 'Điểm Xanh', color: 'text-sun' },
  ];

  const features = [
    {
      icon: Sprout,
      title: 'Điểm Xanh & Cấp Bậc',
      description: 'Tích lũy điểm từ hoạt động bảo vệ môi trường. Thăng hạng từ Mầm Xanh đến Đại Ngàn.',
    },
    {
      icon: TreePine,
      title: 'Green NFT',
      description: 'Mỗi cây bạn trồng = 1 NFT số với GPS, thời gian và đơn vị thực hiện.',
    },
    {
      icon: Users,
      title: 'Cộng Đồng Xanh',
      description: 'Kết nối với hàng nghìn người yêu môi trường. Chia sẻ câu chuyện xanh của bạn.',
    },
    {
      icon: TrendingUp,
      title: 'Điểm Uy Tín Xanh',
      description: 'Sử dụng cho học bổng, du học, việc làm ESG và các giải thưởng môi trường.',
    },
  ];

  const howItWorks = [
    { step: '01', title: 'Đăng ký tài khoản', description: 'Tạo hồ sơ xanh cá nhân hoặc tổ chức miễn phí' },
    { step: '02', title: 'Tham gia chiến dịch', description: 'Tìm và đăng ký các chiến dịch trồng cây, dọn rác...' },
    { step: '03', title: 'Tích lũy điểm', description: 'Nhận Điểm Xanh và Green NFT cho mỗi hoạt động' },
    { step: '04', title: 'Thăng hạng', description: 'Leo bảng xếp hạng và nhận các đặc quyền' },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-earth" />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        
        <div className="container relative py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Leaf className="h-4 w-4" />
              Nền tảng môi trường số #1 Việt Nam
            </div>
            
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
              Cùng nhau xây dựng
              <span className="block text-gradient-forest">Trái Đất Xanh</span>
            </h1>
            
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Tham gia cộng đồng Green Earth - nơi mỗi hành động nhỏ 
              đều được ghi nhận và tạo nên tác động lớn cho môi trường.
            </p>
            
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="gradient-forest gap-2 text-lg shadow-glow-primary">
                <Link to="/auth?mode=signup">
                  Tham gia ngay
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2 text-lg">
                <Link to="/campaigns">
                  Khám phá chiến dịch
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-card py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className={`mx-auto h-8 w-8 ${stat.color}`} />
                <div className="mt-3 font-display text-3xl font-bold md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Tính năng nổi bật
            </h2>
            <p className="mt-4 text-muted-foreground">
              Green Earth mang đến hệ sinh thái hoàn chỉnh để bạn tham gia bảo vệ môi trường
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="group transition-all hover:shadow-lg hover:shadow-primary/10">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-leaf text-primary-foreground">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-secondary/50 py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Bắt đầu như thế nào?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Chỉ 4 bước đơn giản để trở thành một phần của phong trào xanh
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((item, index) => (
              <div key={item.step} className="relative">
                {index < howItWorks.length - 1 && (
                  <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-border lg:block" />
                )}
                <div className="relative flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-forest font-display text-xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="mt-4 font-display font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <Card className="overflow-hidden">
            <div className="relative gradient-forest p-8 md:p-16">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              
              <div className="relative mx-auto max-w-2xl text-center text-primary-foreground">
                <Heart className="mx-auto h-12 w-12 animate-pulse-slow" />
                <h2 className="mt-6 font-display text-3xl font-bold md:text-4xl">
                  Mỗi hành động đều có ý nghĩa
                </h2>
                <p className="mt-4 opacity-90">
                  Dù bạn trồng một cây, nhặt một mảnh rác hay chia sẻ một bài viết - 
                  tất cả đều góp phần tạo nên tương lai xanh cho Việt Nam.
                </p>
                <Button 
                  size="lg" 
                  asChild 
                  className="mt-8 bg-white text-primary hover:bg-white/90"
                >
                  <Link to="/auth?mode=signup">
                    Bắt đầu hành trình xanh
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-t bg-muted/50 py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:gap-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Bảo mật dữ liệu</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-5 w-5" />
              <span className="text-sm">Minh bạch blockchain</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Award className="h-5 w-5" />
              <span className="text-sm">Chứng nhận ESG</span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

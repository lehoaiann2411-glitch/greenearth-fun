import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Leaf, Users, MessageSquare, Video, Map, Recycle, Calculator, 
  Award, BookOpen, Zap, Database, Code, Layers, Globe, 
  ChevronDown, ChevronRight, Smartphone, Shield, Coins,
  TreePine, Heart, Bell, Settings, Camera, Gift, Target,
  Calendar, TrendingUp, Bot, Wallet, Play, Radio, UserPlus,
  Share2, Image, Hash, Mic, Phone, VideoIcon, Lock, Search,
  BarChart3, FileText, Lightbulb, Rocket, CheckCircle2, Clock,
  AlertCircle, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const PlatformDocs = () => {
  const [openSections, setOpenSections] = useState<string[]>(["overview"]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-green-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Green Earth Platform
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tài liệu dự án - Phiên bản 1.0
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold">60+</div>
              <div className="text-sm opacity-90">Database Tables</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold">20+</div>
              <div className="text-sm opacity-90">Trang chính</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold">11</div>
              <div className="text-sm opacity-90">Ngôn ngữ</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold">85%</div>
              <div className="text-sm opacity-90">Hoàn thiện</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-2 bg-transparent p-0">
            <TabsTrigger value="overview" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <Layers className="w-4 h-4 mr-2" />
              Tính năng
            </TabsTrigger>
            <TabsTrigger value="tech" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <Code className="w-4 h-4 mr-2" />
              Công nghệ
            </TabsTrigger>
            <TabsTrigger value="database" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <Database className="w-4 h-4 mr-2" />
              Database
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <Rocket className="w-4 h-4 mr-2" />
              Lộ trình
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Leaf className="w-6 h-6" />
                  Giới thiệu Green Earth
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  <strong>Green Earth</strong> là một <strong>"Green Super-App"</strong> - nền tảng mạng xã hội xanh 
                  tích hợp đầy đủ các tính năng từ social network, cộng đồng, đến các công cụ bảo vệ môi trường 
                  và hệ thống phần thưởng Web3.
                </p>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">🎯 Mục tiêu dự án</h4>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Kết nối cộng đồng yêu môi trường trên toàn thế giới
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Gamify hành động xanh thông qua Camly Coin và phần thưởng
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Tổ chức chiến dịch trồng cây, bảo vệ môi trường quy mô lớn
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Giáo dục và nâng cao nhận thức về môi trường
                    </li>
                  </ul>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <Users className="w-8 h-8 text-blue-500 mb-2" />
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300">Mạng xã hội</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Feed, Story, Reels, Chat, Calls, Groups</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                    <TreePine className="w-8 h-8 text-purple-500 mb-2" />
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300">Môi trường</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Campaigns, Tree Map, Waste Scanner</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                    <Coins className="w-8 h-8 text-orange-500 mb-2" />
                    <h4 className="font-semibold text-orange-800 dark:text-orange-300">Web3 & Rewards</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Camly Coin, Leaderboard, Badges</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Architecture Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-6 h-6 text-blue-500" />
                  Kiến trúc hệ thống
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 font-mono text-sm">
                  <pre className="text-gray-700 dark:text-gray-300 overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────┐
│                    GREEN EARTH PLATFORM                      │
├─────────────────────────────────────────────────────────────┤
│  FRONTEND (React + Vite + TypeScript)                        │
│  ├── UI Components (shadcn/ui + Tailwind CSS)               │
│  ├── State Management (React Query + Context)               │
│  ├── Routing (React Router v6)                              │
│  ├── i18n (11 languages)                                    │
│  └── PWA Support                                            │
├─────────────────────────────────────────────────────────────┤
│  BACKEND (Supabase)                                          │
│  ├── PostgreSQL Database (60+ tables)                       │
│  ├── Authentication (Email, Social)                         │
│  ├── Storage (Images, Videos, Files)                        │
│  ├── Edge Functions (AI, External APIs)                     │
│  └── Realtime (Chat, Notifications)                         │
├─────────────────────────────────────────────────────────────┤
│  EXTERNAL INTEGRATIONS                                       │
│  ├── OpenAI (Waste Analysis, Green Buddy Chat)              │
│  ├── MapLibre (Interactive Maps)                            │
│  ├── Web3 (Wallet Connect, Token)                           │
│  └── Weather/AQI APIs                                       │
└─────────────────────────────────────────────────────────────┘`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FEATURES TAB */}
          <TabsContent value="features" className="space-y-6">
            {/* Completed Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-6 h-6" />
                  Tính năng đã hoàn thiện (100%)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Social Network */}
                <Collapsible open={openSections.includes("social")} onOpenChange={() => toggleSection("social")}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-blue-500" />
                      <span className="font-semibold text-blue-800 dark:text-blue-300">Mạng Xã Hội</span>
                      <Badge variant="secondary">15 tính năng</Badge>
                    </div>
                    {openSections.includes("social") ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-3 pl-4">
                      <FeatureItem icon={<FileText />} title="Feed / Bảng tin" file="Feed.tsx" desc="Đăng bài, like, comment, share" />
                      <FeatureItem icon={<Image />} title="Stories" file="StoriesBar.tsx" desc="Story 24h với stickers, text" />
                      <FeatureItem icon={<Play />} title="Reels" file="Reels.tsx" desc="Video ngắn với music, effects" />
                      <FeatureItem icon={<MessageSquare />} title="Nhắn tin" file="Messages.tsx" desc="Chat 1-1, group, stickers" />
                      <FeatureItem icon={<Phone />} title="Gọi thoại" file="CallScreen.tsx" desc="Voice call với recording" />
                      <FeatureItem icon={<VideoIcon />} title="Video call" file="CallScreen.tsx" desc="Video call HD" />
                      <FeatureItem icon={<Users />} title="Group call" file="GroupCallScreen.tsx" desc="Gọi nhóm nhiều người" />
                      <FeatureItem icon={<UserPlus />} title="Bạn bè" file="Friends.tsx" desc="Gửi/nhận lời mời kết bạn" />
                      <FeatureItem icon={<Heart />} title="Follow" file="useFollow.ts" desc="Follow/Unfollow users" />
                      <FeatureItem icon={<Lock />} title="Block" file="useBlocking.ts" desc="Chặn người dùng" />
                      <FeatureItem icon={<Share2 />} title="Share bài" file="ShareModal.tsx" desc="Chia sẻ bài viết" />
                      <FeatureItem icon={<Hash />} title="Hashtags" file="TrendingHashtags.tsx" desc="Hashtags trending" />
                      <FeatureItem icon={<Heart />} title="Reactions" file="ReactionPicker.tsx" desc="6 loại reactions" />
                      <FeatureItem icon={<BarChart3 />} title="Polls" file="PollDisplay.tsx" desc="Tạo bình chọn" />
                      <FeatureItem icon={<Mic />} title="Voice message" file="VoiceRecorder.tsx" desc="Gửi tin nhắn thoại" />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Groups */}
                <Collapsible open={openSections.includes("groups")} onOpenChange={() => toggleSection("groups")}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-purple-500" />
                      <span className="font-semibold text-purple-800 dark:text-purple-300">Nhóm Cộng Đồng</span>
                      <Badge variant="secondary">8 tính năng</Badge>
                    </div>
                    {openSections.includes("groups") ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-3 pl-4">
                      <FeatureItem icon={<Users />} title="Tạo nhóm" file="GroupCreate.tsx" desc="Public/Private groups" />
                      <FeatureItem icon={<Settings />} title="Quản lý nhóm" file="GroupMembersList.tsx" desc="Admin, moderator roles" />
                      <FeatureItem icon={<FileText />} title="Bài đăng nhóm" file="GroupFeed.tsx" desc="Post trong nhóm" />
                      <FeatureItem icon={<Calendar />} title="Sự kiện nhóm" file="GroupEventCard.tsx" desc="Tạo event, RSVP" />
                      <FeatureItem icon={<UserPlus />} title="Mời bạn" file="group_invites" desc="Invite friends + rewards" />
                      <FeatureItem icon={<Bell />} title="Thông báo nhóm" file="notifications" desc="Activity notifications" />
                      <FeatureItem icon={<Search />} title="Tìm nhóm" file="GroupFilters.tsx" desc="Search & filter groups" />
                      <FeatureItem icon={<Award />} title="Featured groups" file="FeaturedGroups.tsx" desc="Nhóm nổi bật" />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Campaigns */}
                <Collapsible open={openSections.includes("campaigns")} onOpenChange={() => toggleSection("campaigns")}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <TreePine className="w-6 h-6 text-green-500" />
                      <span className="font-semibold text-green-800 dark:text-green-300">Chiến Dịch Môi Trường</span>
                      <Badge variant="secondary">7 tính năng</Badge>
                    </div>
                    {openSections.includes("campaigns") ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-3 pl-4">
                      <FeatureItem icon={<Target />} title="Tạo chiến dịch" file="CampaignCreate.tsx" desc="Tree planting, cleanup..." />
                      <FeatureItem icon={<Settings />} title="Quản lý" file="CampaignManage.tsx" desc="Edit, manage participants" />
                      <FeatureItem icon={<Map />} title="Bản đồ" file="TreeMap.tsx" desc="Vị trí chiến dịch" />
                      <FeatureItem icon={<Users />} title="Tham gia" file="ParticipantList.tsx" desc="Join campaigns" />
                      <FeatureItem icon={<CheckCircle2 />} title="Check-in" file="useCheckIn" desc="Điểm danh tại địa điểm" />
                      <FeatureItem icon={<Award />} title="Điểm thưởng" file="green_points_reward" desc="Nhận Camly khi tham gia" />
                      <FeatureItem icon={<BarChart3 />} title="Thống kê" file="CampaignDetail.tsx" desc="Progress tracking" />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Impact Map */}
                <Collapsible open={openSections.includes("impact")} onOpenChange={() => toggleSection("impact")}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Map className="w-6 h-6 text-teal-500" />
                      <span className="font-semibold text-teal-800 dark:text-teal-300">Bản Đồ Tác Động</span>
                      <Badge variant="secondary">10 tính năng</Badge>
                    </div>
                    {openSections.includes("impact") ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-3 pl-4">
                      <FeatureItem icon={<Map />} title="Bản đồ cây" file="TreeMap.tsx" desc="MapLibre interactive map" />
                      <FeatureItem icon={<Layers />} title="Heat map" file="TreeMapHeatLayer.tsx" desc="Mật độ cây" />
                      <FeatureItem icon={<Globe />} title="Thời tiết" file="WeatherLayerControl.tsx" desc="Weather overlay" />
                      <FeatureItem icon={<Zap />} title="Chất lượng KK" file="AQILayerControl.tsx" desc="AQI stations" />
                      <FeatureItem icon={<TreePine />} title="Quần đảo VN" file="WorldArchipelagosLayer.tsx" desc="Vietnam islands" />
                      <FeatureItem icon={<Search />} title="Tìm kiếm" file="MapSearchBox.tsx" desc="Search locations" />
                      <FeatureItem icon={<Layers />} title="Vẽ vùng rừng" file="ForestPolygonDrawer.tsx" desc="Draw forest areas" />
                      <FeatureItem icon={<BarChart3 />} title="Thống kê" file="MapStatsCards.tsx" desc="Trees, CO2 stats" />
                      <FeatureItem icon={<Map />} title="Street View" file="StreetViewModal.tsx" desc="Google Street View" />
                      <FeatureItem icon={<Lightbulb />} title="Tour hướng dẫn" file="MapTour.tsx" desc="Interactive tour" />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Waste Scanner */}
                <Collapsible open={openSections.includes("scanner")} onOpenChange={() => toggleSection("scanner")}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Recycle className="w-6 h-6 text-orange-500" />
                      <span className="font-semibold text-orange-800 dark:text-orange-300">Quét Rác Thải</span>
                      <Badge variant="secondary">6 tính năng</Badge>
                    </div>
                    {openSections.includes("scanner") ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-3 pl-4">
                      <FeatureItem icon={<Camera />} title="Chụp ảnh" file="CameraCapture.tsx" desc="Camera capture" />
                      <FeatureItem icon={<Image />} title="Upload ảnh" file="ImageUpload.tsx" desc="Upload from gallery" />
                      <FeatureItem icon={<Bot />} title="AI nhận diện" file="analyze-waste" desc="OpenAI Vision API" />
                      <FeatureItem icon={<Recycle />} title="Màu thùng rác" file="BinColorGuide.tsx" desc="Hướng dẫn phân loại" />
                      <FeatureItem icon={<FileText />} title="Lịch sử quét" file="ScanHistory.tsx" desc="Scan history" />
                      <FeatureItem icon={<Coins />} title="Điểm thưởng" file="ScanResult.tsx" desc="Earn Camly" />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Rewards */}
                <Collapsible open={openSections.includes("rewards")} onOpenChange={() => toggleSection("rewards")}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Coins className="w-6 h-6 text-yellow-500" />
                      <span className="font-semibold text-yellow-800 dark:text-yellow-300">Phần Thưởng & Web3</span>
                      <Badge variant="secondary">10 tính năng</Badge>
                    </div>
                    {openSections.includes("rewards") ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-3 pl-4">
                      <FeatureItem icon={<Coins />} title="Camly Coin" file="CamlyCoinIcon.tsx" desc="Token thưởng" />
                      <FeatureItem icon={<Calendar />} title="Check-in hàng ngày" file="DailyCheckIn.tsx" desc="7-day streak" />
                      <FeatureItem icon={<TrendingUp />} title="Bảng xếp hạng" file="Leaderboard.tsx" desc="Weekly/monthly rankings" />
                      <FeatureItem icon={<Award />} title="Huy hiệu" file="badges" desc="Achievement badges" />
                      <FeatureItem icon={<Target />} title="Nhiệm vụ" file="useQuests.ts" desc="Daily quests" />
                      <FeatureItem icon={<FileText />} title="Lịch sử GD" file="TransactionHistory.tsx" desc="Transaction history" />
                      <FeatureItem icon={<Gift />} title="Đổi thưởng" file="ClaimModal.tsx" desc="Claim rewards" />
                      <FeatureItem icon={<Wallet />} title="Ví Web3" file="ConnectWallet.tsx" desc="WalletConnect" />
                      <FeatureItem icon={<Gift />} title="Tặng quà" file="CamlyGiftModal.tsx" desc="Gift Camly to friends" />
                      <FeatureItem icon={<BarChart3 />} title="Thu nhập" file="EarningsBreakdown.tsx" desc="Earnings analytics" />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Live Stream */}
                <Collapsible open={openSections.includes("live")} onOpenChange={() => toggleSection("live")}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Radio className="w-6 h-6 text-red-500" />
                      <span className="font-semibold text-red-800 dark:text-red-300">Live Stream</span>
                      <Badge variant="secondary">7 tính năng</Badge>
                    </div>
                    {openSections.includes("live") ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-3 pl-4">
                      <FeatureItem icon={<Radio />} title="Phát trực tiếp" file="LiveCreate.tsx" desc="Start live stream" />
                      <FeatureItem icon={<Play />} title="Xem live" file="LiveWatch.tsx" desc="Watch streams" />
                      <FeatureItem icon={<MessageSquare />} title="Chat live" file="live_stream_comments" desc="Realtime chat" />
                      <FeatureItem icon={<Gift />} title="Tặng quà" file="total_gifts" desc="Send gifts" />
                      <FeatureItem icon={<Camera />} title="Filter đẹp" file="LiveFilterPicker.tsx" desc="Beauty filters" />
                      <FeatureItem icon={<FileText />} title="Lưu live" file="SaveLiveModal.tsx" desc="Save as post" />
                      <FeatureItem icon={<Users />} title="Viewers" file="live_stream_viewers" desc="Viewer tracking" />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Education */}
                <Collapsible open={openSections.includes("education")} onOpenChange={() => toggleSection("education")}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-6 h-6 text-indigo-500" />
                      <span className="font-semibold text-indigo-800 dark:text-indigo-300">Giáo Dục & Gamification</span>
                      <Badge variant="secondary">6 tính năng</Badge>
                    </div>
                    {openSections.includes("education") ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-3 pl-4">
                      <FeatureItem icon={<BookOpen />} title="Nội dung GD" file="educational_content" desc="Articles, videos" />
                      <FeatureItem icon={<Target />} title="Quiz" file="useQuizzes.ts" desc="Interactive quizzes" />
                      <FeatureItem icon={<CheckCircle2 />} title="Thói quen xanh" file="DailyHabitsTracker.tsx" desc="Daily green habits" />
                      <FeatureItem icon={<Bot />} title="Green Buddy AI" file="GreenBuddyChatModal.tsx" desc="AI chatbot assistant" />
                      <FeatureItem icon={<Calculator />} title="Carbon Calculator" file="CarbonCalculator.tsx" desc="Calculate carbon footprint" />
                      <FeatureItem icon={<Award />} title="Streak rewards" file="HabitStreak.tsx" desc="Habit streaks" />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Platform Core */}
                <Collapsible open={openSections.includes("core")} onOpenChange={() => toggleSection("core")}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-gray-500" />
                      <span className="font-semibold text-gray-800 dark:text-gray-300">Nền Tảng Cơ Bản</span>
                      <Badge variant="secondary">8 tính năng</Badge>
                    </div>
                    {openSections.includes("core") ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-3 pl-4">
                      <FeatureItem icon={<Lock />} title="Authentication" file="Auth.tsx" desc="Email, social login" />
                      <FeatureItem icon={<Users />} title="Hồ sơ" file="Profile.tsx" desc="User profiles" />
                      <FeatureItem icon={<Bell />} title="Thông báo" file="NotificationBell.tsx" desc="In-app notifications" />
                      <FeatureItem icon={<Settings />} title="Cài đặt TB" file="NotificationSettings.tsx" desc="Notification preferences" />
                      <FeatureItem icon={<Smartphone />} title="PWA" file="vite.config.ts" desc="Install as app" />
                      <FeatureItem icon={<Globe />} title="Đa ngôn ngữ" file="src/i18n/" desc="11 languages" />
                      <FeatureItem icon={<Heart />} title="Lưu bài đăng" file="SavedItems.tsx" desc="Saved posts" />
                      <FeatureItem icon={<Users />} title="Organizations" file="organizations" desc="Org accounts" />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            {/* In Progress Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <Clock className="w-6 h-6" />
                  Tính năng đang phát triển (50-80%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <InProgressItem 
                    title="Camera LiveCreate" 
                    progress={70} 
                    desc="Đang fix lỗi camera đen trên mobile Safari. Đã thêm fallback mechanism."
                    file="LiveCreate.tsx"
                  />
                  <InProgressItem 
                    title="Multi-Guest Live" 
                    progress={30} 
                    desc="Chỉ có UI modal. Cần phát triển WebRTC multi-peer connection."
                    file="StartGroupCallModal.tsx"
                  />
                  <InProgressItem 
                    title="Live Analytics" 
                    progress={40} 
                    desc="Có data trong DB (peak_viewers, total_gifts). Cần dashboard UI."
                    file="live_streams table"
                  />
                  <InProgressItem 
                    title="Schedule Live" 
                    progress={20} 
                    desc="Chưa có UI. Cần thêm scheduled_at column và reminder system."
                    file="N/A"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Not Started Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-6 h-6" />
                  Tính năng chưa phát triển (0%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <NotStartedItem 
                    title="Green Marketplace" 
                    desc="Sàn thương mại sản phẩm xanh, thanh toán bằng Camly Coin"
                    priority="high"
                  />
                  <NotStartedItem 
                    title="Live Shopping" 
                    desc="Bán hàng trong live stream"
                    priority="medium"
                  />
                  <NotStartedItem 
                    title="Referral Program" 
                    desc="Hệ thống giới thiệu bạn bè với multi-level rewards"
                    priority="high"
                  />
                  <NotStartedItem 
                    title="Push Notifications" 
                    desc="Firebase Cloud Messaging cho notifications"
                    priority="medium"
                  />
                  <NotStartedItem 
                    title="Advanced Video Editor" 
                    desc="Edit video với text, stickers, transitions"
                    priority="low"
                  />
                  <NotStartedItem 
                    title="Advanced AI Features" 
                    desc="AI recommendation, content moderation, sentiment analysis"
                    priority="medium"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TECH TAB */}
          <TabsContent value="tech" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-6 h-6 text-blue-500" />
                  Technology Stack
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Frontend */}
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-green-500" />
                    Frontend
                  </h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    <TechCard name="React 18" desc="UI Library" color="blue" />
                    <TechCard name="Vite" desc="Build Tool" color="purple" />
                    <TechCard name="TypeScript" desc="Type Safety" color="blue" />
                    <TechCard name="Tailwind CSS" desc="Styling" color="teal" />
                    <TechCard name="shadcn/ui" desc="UI Components" color="gray" />
                    <TechCard name="Framer Motion" desc="Animations" color="pink" />
                    <TechCard name="React Query" desc="Data Fetching" color="red" />
                    <TechCard name="React Router v6" desc="Routing" color="orange" />
                    <TechCard name="i18next" desc="Internationalization" color="green" />
                  </div>
                </div>

                <Separator />

                {/* Backend */}
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-500" />
                    Backend (Supabase)
                  </h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    <TechCard name="PostgreSQL" desc="Database" color="blue" />
                    <TechCard name="Supabase Auth" desc="Authentication" color="green" />
                    <TechCard name="Supabase Storage" desc="File Storage" color="orange" />
                    <TechCard name="Edge Functions" desc="Serverless" color="purple" />
                    <TechCard name="Realtime" desc="WebSocket" color="pink" />
                    <TechCard name="Row Level Security" desc="Authorization" color="red" />
                  </div>
                </div>

                <Separator />

                {/* External APIs */}
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-orange-500" />
                    External Integrations
                  </h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    <TechCard name="OpenAI" desc="GPT-4 Vision" color="green" />
                    <TechCard name="MapLibre GL" desc="Maps" color="blue" />
                    <TechCard name="Web3Modal" desc="Wallet Connect" color="purple" />
                    <TechCard name="OpenWeather API" desc="Weather Data" color="orange" />
                    <TechCard name="WAQI API" desc="Air Quality" color="teal" />
                    <TechCard name="WebRTC" desc="Video Calls" color="red" />
                  </div>
                </div>

                <Separator />

                {/* Project Structure */}
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-teal-500" />
                    Cấu trúc dự án
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 font-mono text-sm overflow-x-auto">
                    <pre className="text-gray-700 dark:text-gray-300">
{`src/
├── components/          # React components
│   ├── ui/              # shadcn/ui base components
│   ├── social/          # Feed, Posts, Comments
│   ├── messages/        # Chat components
│   ├── calls/           # Voice/Video calls
│   ├── groups/          # Group features
│   ├── campaigns/       # Campaign components
│   ├── impact/          # Map & environment
│   ├── scanner/         # Waste scanner
│   ├── rewards/         # Camly coin & rewards
│   ├── reels/           # Short videos
│   ├── stories/         # Stories
│   ├── live/            # Live streaming
│   ├── habits/          # Daily habits
│   ├── chatbot/         # Green Buddy AI
│   └── ...
├── hooks/               # Custom React hooks (60+)
├── pages/               # Page components (20+)
├── contexts/            # React contexts (Auth, Call, Web3)
├── i18n/                # 11 language files
├── lib/                 # Utilities
├── integrations/        # Supabase client
└── assets/              # Images, icons

supabase/
├── functions/           # Edge functions
│   ├── analyze-waste/   # AI waste analysis
│   └── green-buddy-chat/# AI chatbot
└── config.toml          # Supabase config`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DATABASE TAB */}
          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-6 h-6 text-purple-500" />
                  Database Schema (60+ tables)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* User Management */}
                <DatabaseSection 
                  title="👤 User Management" 
                  tables={["profiles", "friendships", "user_badges", "user_habits"]}
                  color="blue"
                />

                {/* Social Network */}
                <DatabaseSection 
                  title="📱 Social Network" 
                  tables={["posts", "post_likes", "post_comments", "post_shares", "stories", "story_views", "polls", "poll_votes"]}
                  color="green"
                />

                {/* Messages & Calls */}
                <DatabaseSection 
                  title="💬 Messages & Calls" 
                  tables={["conversations", "conversation_participants", "messages", "message_reactions", "calls", "call_recordings", "group_calls", "group_call_participants"]}
                  color="purple"
                />

                {/* Groups */}
                <DatabaseSection 
                  title="👥 Groups" 
                  tables={["groups", "group_members", "group_posts", "group_post_likes", "group_post_comments", "group_events", "group_event_rsvps", "group_invites"]}
                  color="orange"
                />

                {/* Campaigns */}
                <DatabaseSection 
                  title="🌳 Campaigns & Impact" 
                  tables={["campaigns", "campaign_participants", "forest_areas", "events", "event_attendees", "waste_scans"]}
                  color="teal"
                />

                {/* Reels & Live */}
                <DatabaseSection 
                  title="🎬 Reels & Live" 
                  tables={["reels", "reel_likes", "reel_comments", "reel_shares", "live_streams", "live_stream_comments", "live_stream_viewers"]}
                  color="red"
                />

                {/* Rewards */}
                <DatabaseSection 
                  title="🏆 Rewards & Gamification" 
                  tables={["points_history", "camly_transactions", "claims_history", "daily_habits", "daily_limits", "daily_quests", "badges", "user_quiz_scores"]}
                  color="yellow"
                />

                {/* Education */}
                <DatabaseSection 
                  title="📚 Education" 
                  tables={["educational_content", "content_views", "chatbot_conversations", "quizzes", "quiz_questions"]}
                  color="indigo"
                />

                {/* Notifications */}
                <DatabaseSection 
                  title="🔔 Notifications" 
                  tables={["notifications", "notification_preferences"]}
                  color="pink"
                />

                {/* Organizations */}
                <DatabaseSection 
                  title="🏢 Organizations" 
                  tables={["organizations", "influencers"]}
                  color="gray"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ROADMAP TAB */}
          <TabsContent value="roadmap" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-6 h-6 text-purple-500" />
                  Lộ trình phát triển
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Phase 1 */}
                <RoadmapPhase 
                  phase="Phase 1"
                  title="Hoàn thiện Core Features"
                  timeline="1-2 tuần"
                  status="in-progress"
                  items={[
                    "Fix camera LiveCreate trên mobile Safari",
                    "Hoàn thiện Multi-Guest Live với WebRTC",
                    "Thêm Live Analytics Dashboard",
                    "Scheduled Live với reminder system"
                  ]}
                />

                {/* Phase 2 */}
                <RoadmapPhase 
                  phase="Phase 2"
                  title="Green Marketplace"
                  timeline="2-4 tuần"
                  status="planned"
                  items={[
                    "Thiết kế UI/UX cho marketplace",
                    "Tạo database tables cho products, orders",
                    "Tích hợp thanh toán Camly Coin",
                    "Seller dashboard & analytics",
                    "Live Shopping integration"
                  ]}
                />

                {/* Phase 3 */}
                <RoadmapPhase 
                  phase="Phase 3"
                  title="Growth & Engagement"
                  timeline="2-3 tuần"
                  status="planned"
                  items={[
                    "Referral Program với multi-level rewards",
                    "Push Notifications (Firebase)",
                    "Advanced AI recommendations",
                    "Content moderation với AI"
                  ]}
                />

                {/* Phase 4 */}
                <RoadmapPhase 
                  phase="Phase 4"
                  title="Scale & Optimize"
                  timeline="Ongoing"
                  status="future"
                  items={[
                    "Performance optimization",
                    "Advanced Video Editor",
                    "AR filters cho camera",
                    "Blockchain token launch",
                    "Mobile native app (React Native)"
                  ]}
                />
              </CardContent>
            </Card>

            {/* Priority Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-red-500" />
                  Ưu tiên phát triển ngay
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <PriorityTask 
                    priority={1}
                    title="Fix Camera LiveCreate"
                    desc="Camera preview đen trên mobile Safari/iOS. Đã có fallback mechanism, cần test thêm."
                  />
                  <PriorityTask 
                    priority={2}
                    title="Green Marketplace MVP"
                    desc="Tạo marketplace cơ bản với product listing, cart, checkout bằng Camly."
                  />
                  <PriorityTask 
                    priority={3}
                    title="Referral System"
                    desc="Invite friends → Both get Camly rewards. Track referral chain."
                  />
                  <PriorityTask 
                    priority={4}
                    title="Push Notifications"
                    desc="Firebase Cloud Messaging cho real-time notifications."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Team Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-yellow-500" />
                  Ghi chú cho team mới
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">📁 Cấu trúc code</h4>
                    <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                      <li>• Mỗi feature có folder riêng trong <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">src/components/</code></li>
                      <li>• Hooks logic trong <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">src/hooks/</code></li>
                      <li>• Pages trong <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">src/pages/</code></li>
                      <li>• Thêm mới text → update tất cả 11 file trong <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">src/i18n/</code></li>
                    </ul>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">🔑 Supabase</h4>
                    <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                      <li>• Project ID: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">mngorzlybgkahwkvyofd</code></li>
                      <li>• Database có 60+ tables với RLS policies</li>
                      <li>• Edge functions: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">analyze-waste</code>, <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">green-buddy-chat</code></li>
                      <li>• Storage buckets: avatars, posts, reels, campaigns...</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">💡 Best Practices</h4>
                    <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                      <li>• Dùng semantic tokens từ <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">index.css</code> cho colors</li>
                      <li>• React Query cho data fetching</li>
                      <li>• Framer Motion cho animations</li>
                      <li>• shadcn/ui components làm base</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">⚠️ Lưu ý quan trọng</h4>
                    <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                      <li>• KHÔNG sửa file <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">src/integrations/supabase/types.ts</code> (auto-generated)</li>
                      <li>• Test trên cả mobile Safari/Chrome</li>
                      <li>• Check dark mode cho mọi UI mới</li>
                      <li>• Luôn thêm translations cho text mới</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400 pb-8">
          <p>Green Earth Platform Documentation</p>
          <p>Last updated: January 2026</p>
        </footer>
      </div>
    </div>
  );
};

// Helper Components
const FeatureItem = ({ icon, title, file, desc }: { icon: React.ReactNode; title: string; file: string; desc: string }) => (
  <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
    <div className="text-green-500 mt-0.5">{icon}</div>
    <div className="flex-1 min-w-0">
      <div className="font-medium text-gray-900 dark:text-white">{title}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{desc}</div>
      <code className="text-xs text-blue-600 dark:text-blue-400">{file}</code>
    </div>
  </div>
);

const InProgressItem = ({ title, progress, desc, file }: { title: string; progress: number; desc: string; file: string }) => (
  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
    <div className="flex items-center justify-between mb-2">
      <span className="font-semibold text-yellow-800 dark:text-yellow-300">{title}</span>
      <Badge variant="outline" className="bg-yellow-100 text-yellow-700">{progress}%</Badge>
    </div>
    <div className="w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2 mb-2">
      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
    <code className="text-xs text-blue-600 dark:text-blue-400">{file}</code>
  </div>
);

const NotStartedItem = ({ title, desc, priority }: { title: string; desc: string; priority: "high" | "medium" | "low" }) => (
  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
    <div className="flex items-center justify-between mb-2">
      <span className="font-semibold text-red-800 dark:text-red-300">{title}</span>
      <Badge variant="outline" className={
        priority === "high" ? "bg-red-100 text-red-700" :
        priority === "medium" ? "bg-orange-100 text-orange-700" :
        "bg-gray-100 text-gray-700"
      }>
        {priority === "high" ? "Ưu tiên cao" : priority === "medium" ? "Trung bình" : "Thấp"}
      </Badge>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
  </div>
);

const TechCard = ({ name, desc, color }: { name: string; desc: string; color: string }) => (
  <div className={`p-3 rounded-lg border bg-${color}-50 dark:bg-${color}-900/20 border-${color}-200 dark:border-${color}-800`}>
    <div className="font-medium text-gray-900 dark:text-white">{name}</div>
    <div className="text-xs text-gray-500 dark:text-gray-400">{desc}</div>
  </div>
);

const DatabaseSection = ({ title, tables, color }: { title: string; tables: string[]; color: string }) => (
  <div className={`p-4 bg-${color}-50 dark:bg-${color}-900/20 rounded-xl border border-${color}-200 dark:border-${color}-800`}>
    <h4 className="font-semibold mb-2">{title}</h4>
    <div className="flex flex-wrap gap-2">
      {tables.map(table => (
        <code key={table} className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded border">{table}</code>
      ))}
    </div>
  </div>
);

const RoadmapPhase = ({ phase, title, timeline, status, items }: { 
  phase: string; 
  title: string; 
  timeline: string; 
  status: "in-progress" | "planned" | "future";
  items: string[];
}) => (
  <div className={`p-4 rounded-xl border ${
    status === "in-progress" ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" :
    status === "planned" ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" :
    "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
  }`}>
    <div className="flex items-center justify-between mb-3">
      <div>
        <Badge variant="outline" className="mb-1">{phase}</Badge>
        <h4 className="font-semibold text-lg">{title}</h4>
      </div>
      <div className="text-right">
        <Badge className={
          status === "in-progress" ? "bg-green-500" :
          status === "planned" ? "bg-blue-500" : "bg-gray-500"
        }>
          {status === "in-progress" ? "Đang làm" : status === "planned" ? "Lên kế hoạch" : "Tương lai"}
        </Badge>
        <div className="text-sm text-gray-500 mt-1">{timeline}</div>
      </div>
    </div>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <ArrowRight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const PriorityTask = ({ priority, title, desc }: { priority: number; title: string; desc: string }) => (
  <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
      priority === 1 ? "bg-red-500" :
      priority === 2 ? "bg-orange-500" :
      priority === 3 ? "bg-yellow-500" : "bg-blue-500"
    }`}>
      {priority}
    </div>
    <div>
      <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
    </div>
  </div>
);

export default PlatformDocs;

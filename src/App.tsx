import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Web3Provider } from "@/contexts/Web3Context";
import { CallProvider } from "@/contexts/CallContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import Leaderboard from "./pages/Leaderboard";
import Learn from "./pages/Learn";
import WasteScanner from "./pages/WasteScanner";

import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import CampaignCreate from "./pages/CampaignCreate";
import CampaignManage from "./pages/CampaignManage";
import Community from "./pages/Community";
import ImpactDashboard from "./pages/ImpactDashboard";
import Rewards from "./pages/Rewards";
import Feed from "./pages/Feed";
import Groups from "./pages/Groups";
import GroupCreate from "./pages/GroupCreate";
import GroupDetail from "./pages/GroupDetail";
import Messages from "./pages/Messages";
import Friends from "./pages/Friends";
import Reels from "./pages/Reels";
import ReelCreate from "./pages/ReelCreate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Web3Provider>
            <CallProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/profile/edit" element={<ProfileEdit />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/campaigns/create" element={<CampaignCreate />} />
                <Route path="/campaigns/:id" element={<CampaignDetail />} />
                <Route path="/campaigns/:id/manage" element={<CampaignManage />} />
                <Route path="/community" element={<Community />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/groups/create" element={<GroupCreate />} />
                <Route path="/groups/:id" element={<GroupDetail />} />
                <Route path="/impact" element={<ImpactDashboard />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/waste-scanner" element={<WasteScanner />} />
                
                {/* Social Network Routes */}
                <Route path="/messages" element={<Messages />} />
                <Route path="/messages/:conversationId" element={<Messages />} />
                <Route path="/friends" element={<Friends />} />
                
                {/* Reels Routes */}
                <Route path="/reels" element={<Reels />} />
                <Route path="/reels/create" element={<ReelCreate />} />
                <Route path="/reels/:reelId" element={<Reels />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CallProvider>
          </Web3Provider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

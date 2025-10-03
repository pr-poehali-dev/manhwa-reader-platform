
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Novels from "./pages/Novels";
import NovelDetails from "./pages/NovelDetails";
import NovelReader from "./pages/NovelReader";
import NovelCatalog from "./pages/NovelCatalog";
import UploadNovel from "./pages/UploadNovel";
import TranslatorGuide from "./pages/TranslatorGuide";
import DMCA from "./pages/DMCA";
import Terms from "./pages/Terms";
import Reader from "./pages/Reader";
import ManhwaDetails from "./pages/ManhwaDetails";
import Admin from "./pages/Admin";
import Teams from "./pages/Teams";
import CreateTeam from "./pages/CreateTeam";
import UploadManhwa from "./pages/UploadManhwa";
import Schedule from "./pages/Schedule";
import Catalog from "./pages/Catalog";
import Profile from "./pages/Profile";
import Achievements from "./pages/Achievements";
import Recommendations from "./pages/Recommendations";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import ModeratorPanel from "./pages/ModeratorPanel";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/novels" element={<Novels />} />
          <Route path="/novels/catalog" element={<NovelCatalog />} />
          <Route path="/novel/:id" element={<NovelDetails />} />
          <Route path="/novel-reader/:novelId/:chapterNumber" element={<NovelReader />} />
          <Route path="/upload-novel" element={<UploadNovel />} />
          <Route path="/translator-guide" element={<TranslatorGuide />} />
          <Route path="/dmca" element={<DMCA />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/manhwa/:id" element={<ManhwaDetails />} />
          <Route path="/reader/:id" element={<Reader />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/create-team" element={<CreateTeam />} />
          <Route path="/upload" element={<UploadManhwa />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/my-profile" element={<ProfilePage />} />
          <Route path="/moderator" element={<ModeratorPanel />} />
          <Route path="/admin" element={<AdminPanel />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
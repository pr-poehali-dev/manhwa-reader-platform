
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Reader from "./pages/Reader";
import Admin from "./pages/Admin";
import Teams from "./pages/Teams";
import CreateTeam from "./pages/CreateTeam";
import UploadManhwa from "./pages/UploadManhwa";
import Schedule from "./pages/Schedule";
import Catalog from "./pages/Catalog";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/reader/:id" element={<Reader />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/create-team" element={<CreateTeam />} />
          <Route path="/upload" element={<UploadManhwa />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
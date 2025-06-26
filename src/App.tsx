
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Missions from "./pages/Missions";
import SkillTree from "./pages/SkillTree";
import Store from "./pages/Store";
import AvatarCustomization from "./pages/AvatarCustomization";
import Guilds from "./pages/Guilds";
import Playbook from "./pages/Playbook";
import Academy from "./pages/Academy";
import ProfileSettings from "./pages/ProfileSettings";
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
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/skills" element={<SkillTree />} />
          <Route path="/store" element={<Store />} />
          <Route path="/avatar" element={<AvatarCustomization />} />
          <Route path="/guilds" element={<Guilds />} />
          <Route path="/playbook" element={<Playbook />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

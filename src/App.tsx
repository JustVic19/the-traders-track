
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
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
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Index />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/pricing" element={<Pricing />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/missions" element={
        <ProtectedRoute>
          <Missions />
        </ProtectedRoute>
      } />
      <Route path="/skills" element={
        <ProtectedRoute>
          <SkillTree />
        </ProtectedRoute>
      } />
      <Route path="/store" element={
        <ProtectedRoute>
          <Store />
        </ProtectedRoute>
      } />
      <Route path="/avatar" element={
        <ProtectedRoute>
          <AvatarCustomization />
        </ProtectedRoute>
      } />
      <Route path="/guilds" element={
        <ProtectedRoute>
          <Guilds />
        </ProtectedRoute>
      } />
      <Route path="/playbook" element={
        <ProtectedRoute>
          <Playbook />
        </ProtectedRoute>
      } />
      <Route path="/academy" element={
        <ProtectedRoute>
          <Academy />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfileSettings />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

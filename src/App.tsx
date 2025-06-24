
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Store from "./pages/Store";
import Missions from "./pages/Missions";
import SkillTree from "./pages/SkillTree";
import AvatarCustomization from "./pages/AvatarCustomization";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      {user ? (
        <>
          <Route path="/" element={<Dashboard />} />
          <Route path="/store" element={<Store />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/skills" element={<SkillTree />} />
          <Route path="/avatar" element={<AvatarCustomization />} />
        </>
      ) : (
        <Route path="/" element={<Index />} />
      )}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

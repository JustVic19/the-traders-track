
import React from 'react';
import { Calendar, Home, BarChart3, ShoppingCart, Trophy, Zap, User, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tables } from '@/integrations/supabase/types';
import AlphaCoinBalance from './AlphaCoinBalance';

type Profile = Tables<'profiles'>;

interface AppSidebarProps {
  profile: Profile | null;
}

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Store",
    url: "/store", 
    icon: ShoppingCart,
  },
  {
    title: "Missions",
    url: "/missions",
    icon: Trophy,
  },
  {
    title: "Skill Tree",
    url: "/skills",
    icon: Zap,
  },
  {
    title: "Avatar",
    url: "/avatar",
    icon: User,
  },
];

const AppSidebar: React.FC<AppSidebarProps> = ({ profile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const handleNavigation = (url: string) => {
    navigate(url);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Sidebar className="border-r border-gray-700" style={{ backgroundColor: '#101623' }}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white text-xl font-bold px-4 py-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              TT
            </div>
            <span>The Traders Track</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation(item.url)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      location.pathname === item.url 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-gray-700">
        {profile && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">{profile.display_name || 'Trader'}</div>
                <div className="text-gray-400 text-sm">Level {profile.level || 1}</div>
              </div>
            </div>
            
            <AlphaCoinBalance balance={profile.alpha_coins} />
            
            <SidebarMenuButton 
              onClick={handleSignOut}
              className="w-full text-left p-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

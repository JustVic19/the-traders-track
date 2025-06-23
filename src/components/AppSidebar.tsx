
import React from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { BarChart3, Target, Trophy, Store, LogOut, Coins, Star, Focus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tables } from '@/integrations/supabase/types';

interface AppSidebarProps {
  profile: Tables<'profiles'> | null;
}

const AppSidebar = ({ profile }: AppSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: Target, label: 'Missions', path: '/missions' },
    { icon: Store, label: 'Store', path: '/store' },
    { icon: Trophy, label: 'Skill Tree', path: '/skills' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Sidebar className="border-r border-gray-800 w-60" style={{ backgroundColor: '#1A1F2E' }}>
      <SidebarHeader className="p-4" style={{ backgroundColor: '#1A1F2E' }}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">TT</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-semibold text-sm truncate">The Traders</h1>
            <h2 className="text-white font-semibold text-sm truncate">Track</h2>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4" style={{ backgroundColor: '#1A1F2E' }}>
        <SidebarMenu className="space-y-1">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton 
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  location.pathname === item.path 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm truncate">{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-4" style={{ backgroundColor: '#1A1F2E' }}>
        {/* User Stats Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Level</span>
            <span className="text-xs font-medium text-white">{profile?.level || 1}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 flex items-center">
              <Coins className="w-3 h-3 mr-1" />
              Alpha Coins
            </span>
            <span className="text-xs font-medium text-yellow-400">{profile?.alpha_coins || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 flex items-center">
              <Star className="w-3 h-3 mr-1" />
              Skill Points
            </span>
            <span className="text-xs font-medium text-blue-400">{profile?.skill_points || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 flex items-center">
              <Focus className="w-3 h-3 mr-1" />
              Focus Points
            </span>
            <span className="text-xs font-medium text-purple-400">{profile?.focus_points || 0}</span>
          </div>
        </div>

        {/* User Info Section */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-medium">
                {profile?.username?.charAt(0).toUpperCase() || 'T'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {profile?.username || 'Trader'}
              </p>
              <p className="text-gray-400 text-xs">Level {profile?.level || 1}</p>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white h-9 p-3"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm ml-3">Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

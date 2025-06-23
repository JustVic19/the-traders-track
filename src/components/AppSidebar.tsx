
import React from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { BarChart3, Target, Trophy, Store, Settings, LogOut, Coins, Star, Focus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
    { icon: Target, label: 'Skills', path: '/skills' },
    { icon: Trophy, label: 'Missions', path: '/missions' },
    { icon: Store, label: 'Store', path: '/store' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Sidebar className="border-r border-sidebar-border" style={{ backgroundColor: '#101623' }}>
      <SidebarHeader className="p-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TT</span>
            </div>
            <h1 className="text-xl font-bold text-white">The Traders Track</h1>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4" style={{ backgroundColor: '#101623' }}>
        <SidebarMenu>
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
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4" style={{ backgroundColor: '#101623' }}>
        {/* User Information Section */}
        <div className="bg-gray-800 rounded-lg p-3 mb-4">
          <div className="text-center mb-3">
            <div className="text-sm text-gray-300">
              Welcome, {profile?.username || 'Trader'}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Level</span>
              <span className="text-sm font-medium text-white">{profile?.level || 1}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400 flex items-center">
                <Coins className="w-3 h-3 mr-1" />
                Alpha Coins
              </span>
              <span className="text-sm font-medium text-yellow-400">{profile?.alpha_coins || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400 flex items-center">
                <Star className="w-3 h-3 mr-1" />
                Skill Points
              </span>
              <span className="text-sm font-medium text-blue-400">{profile?.skill_points || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400 flex items-center">
                <Focus className="w-3 h-3 mr-1" />
                Focus Points
              </span>
              <span className="text-sm font-medium text-purple-400">{profile?.focus_points || 0}</span>
            </div>
          </div>
        </div>

        <Separator className="mb-4 bg-gray-600" />
        
        {/* Settings and Sign Out */}
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white"
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

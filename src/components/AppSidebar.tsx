
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Target, 
  ShoppingCart, 
  GitBranch, 
  User, 
  LogOut 
} from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface AppSidebarProps {
  profile: Profile | null;
}

const AppSidebar = ({ profile }: AppSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      title: "Missions",
      icon: Target,
      path: "/missions",
    },
    {
      title: "Store",
      icon: ShoppingCart,
      path: "/store",
    },
    {
      title: "Skill Tree",
      icon: GitBranch,
      path: "/skills",
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getDisplayName = () => {
    if (profile?.username) {
      return profile.username;
    }
    return 'Trader';
  };

  const getAvatarName = () => {
    if (!profile?.trader_avatar) return null;
    const avatarMap: Record<string, string> = {
      'scalper_sam': 'Scalper Sam',
      'swinging_sarah': 'Swinging Sarah',
      'day_trader_dave': 'Day Trader Dave',
      'swing_king_kyle': 'Swing King Kyle'
    };
    return avatarMap[profile.trader_avatar] || profile.trader_avatar;
  };

  return (
    <Sidebar className="bg-gray-900 border-gray-800">
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-lg font-bold text-white">TT</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">The Traders</h1>
            <h2 className="text-lg font-bold text-white">Track</h2>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                onClick={() => navigate(item.path)}
                isActive={location.pathname === item.path}
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-blue-600 data-[active=true]:text-white"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {getDisplayName().charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {getDisplayName()}
              </p>
              {getAvatarName() && (
                <p className="text-xs text-gray-400 truncate">
                  {getAvatarName()}
                </p>
              )}
              <p className="text-xs text-gray-400">Level {profile?.level || 1}</p>
            </div>
          </div>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
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

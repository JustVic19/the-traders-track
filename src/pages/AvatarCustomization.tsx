
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import AppSidebar from '@/components/AppSidebar';
import AvatarPreview from '@/components/AvatarPreview';
import AvatarInventory from '@/components/AvatarInventory';
import { Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Profile = Tables<'profiles'>;
type StoreItem = Tables<'store_items'>;
type UserInventoryItem = Tables<'user_inventory'> & {
  store_items: StoreItem;
};

const AvatarCustomization = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [inventory, setInventory] = useState<UserInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tempEquipped, setTempEquipped] = useState<{
    hat?: string | null;
    outfit?: string | null;
    aura?: string | null;
  }>({});

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
      
      // Initialize temp equipped state with current profile data
      setTempEquipped({
        hat: profileData.equipped_hat,
        outfit: profileData.equipped_outfit,
        aura: profileData.equipped_aura
      });

      // Fetch user's inventory with store items
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('user_inventory')
        .select(`
          *,
          store_items (*)
        `)
        .eq('user_id', user?.id);

      if (inventoryError) throw inventoryError;
      setInventory(inventoryData || []);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load avatar customization data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEquipItem = async (item: StoreItem) => {
    try {
      // Update temp equipped state immediately for preview
      const newTempEquipped = { ...tempEquipped };
      
      switch (item.category) {
        case 'avatar':
          newTempEquipped.hat = item.item_key;
          break;
        case 'theme':
          newTempEquipped.outfit = item.item_key;
          break;
        case 'cosmetic':
          newTempEquipped.aura = item.item_key;
          break;
      }
      
      setTempEquipped(newTempEquipped);
      
      // Update local inventory state to show equipped status
      setInventory(prev => prev.map(invItem => ({
        ...invItem,
        is_equipped: invItem.store_item_id === item.id ? true : 
                    (invItem.store_items.category === item.category ? false : invItem.is_equipped)
      })));

      toast({
        title: "Item Equipped",
        description: `${item.name} equipped! Click 'Save Changes' to persist.`,
      });
    } catch (error: any) {
      console.error('Error equipping item:', error);
      toast({
        title: "Error",
        description: "Failed to equip item",
        variant: "destructive",
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!user || !profile) return;

    try {
      setSaving(true);
      
      // Save all equipped items to database
      const { data, error } = await supabase
        .from('profiles')
        .update({
          equipped_hat: tempEquipped.hat,
          equipped_outfit: tempEquipped.outfit,
          equipped_aura: tempEquipped.aura,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local profile state
      setProfile(prev => prev ? {
        ...prev,
        equipped_hat: tempEquipped.hat,
        equipped_outfit: tempEquipped.outfit,
        equipped_aura: tempEquipped.aura,
      } : null);

      toast({
        title: "Changes Saved!",
        description: "Your avatar customization has been saved.",
      });
    } catch (error: any) {
      console.error('Error saving changes:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save avatar changes",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const hasUnsavedChanges = () => {
    return (
      tempEquipped.hat !== profile?.equipped_hat ||
      tempEquipped.outfit !== profile?.equipped_outfit ||
      tempEquipped.aura !== profile?.equipped_aura
    );
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full" style={{ backgroundColor: '#0B0F19' }}>
          <AppSidebar profile={profile} />
          <SidebarInset className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#0B0F19' }}>
            <div className="text-lg text-white">Loading avatar customization...</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{ backgroundColor: '#0B0F19' }}>
        <AppSidebar profile={profile} />
        <SidebarInset className="flex-1" style={{ backgroundColor: '#0B0F19' }}>
          {/* Header */}
          <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Avatar Customization</h1>
                  <p className="text-gray-400">Customize your trader avatar with owned items.</p>
                </div>
              </div>
              
              <Button
                onClick={handleSaveChanges}
                disabled={!hasUnsavedChanges() || saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </header>

          {/* Content */}
          <main className="container mx-auto px-6 py-8" style={{ backgroundColor: '#0B0F19' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
              {/* Left Panel - Avatar Preview */}
              <AvatarPreview
                equippedHat={tempEquipped.hat}
                equippedOutfit={tempEquipped.outfit}
                equippedAura={tempEquipped.aura}
              />
              
              {/* Right Panel - Inventory */}
              <AvatarInventory
                inventory={inventory}
                onEquipItem={handleEquipItem}
                loading={loading}
              />
            </div>
            
            {hasUnsavedChanges() && (
              <Card className="mt-6 bg-yellow-900/20 border-yellow-500/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-yellow-400">You have unsaved changes to your avatar.</p>
                    <Button
                      onClick={handleSaveChanges}
                      disabled={saving}
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Now'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AvatarCustomization;

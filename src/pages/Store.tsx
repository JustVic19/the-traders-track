
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Coins, Star, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';

type Profile = Tables<'profiles'>;
type StoreItem = Tables<'store_items'>;

const Store = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [userInventory, setUserInventory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch store items
      const { data: itemsData, error: itemsError } = await supabase
        .from('store_items')
        .select('*')
        .eq('is_available', true)
        .order('category', { ascending: true });

      if (itemsError) throw itemsError;
      setStoreItems(itemsData || []);

      // Fetch user's inventory
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('user_inventory')
        .select('store_item_id')
        .eq('user_id', user?.id);

      if (inventoryError) throw inventoryError;
      setUserInventory(inventoryData?.map(item => item.store_item_id) || []);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load store",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const purchaseItem = async (item: StoreItem) => {
    if (!user || !profile) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase items.",
        variant: "destructive",
      });
      return;
    }

    if (profile.alpha_coins < item.price) {
      toast({
        title: "Insufficient Alpha Coins",
        description: `You need ${item.price} Alpha Coins to purchase this item.`,
        variant: "destructive",
      });
      return;
    }

    if (userInventory.includes(item.id)) {
      toast({
        title: "Already Owned",
        description: "You already own this item.",
        variant: "destructive",
      });
      return;
    }

    setPurchasing(item.id);
    try {
      const { data, error } = await supabase.rpc('purchase_store_item', {
        item_id: item.id,
        user_profile_id: user.id
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string; remaining_coins?: number };

      if (result.success) {
        toast({
          title: "Purchase Successful!",
          description: `You purchased ${item.name}. Remaining balance: ${result.remaining_coins} AC`,
        });
        
        // Update local state
        setProfile(prev => prev ? { ...prev, alpha_coins: result.remaining_coins || 0 } : null);
        setUserInventory(prev => [...prev, item.id]);
      } else {
        toast({
          title: "Purchase Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error purchasing item:', error);
      toast({
        title: "Purchase Failed",
        description: "An error occurred while processing your purchase.",
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'premium':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'tools':
        return <Package className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'premium':
        return 'text-yellow-400 border-yellow-400';
      case 'tools':
        return 'text-blue-400 border-blue-400';
      case 'avatar':
        return 'text-green-400 border-green-400';
      case 'theme':
        return 'text-purple-400 border-purple-400';
      case 'cosmetic':
        return 'text-pink-400 border-pink-400';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full" style={{ backgroundColor: '#0B0F19' }}>
          <AppSidebar profile={profile} />
          <SidebarInset className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#0B0F19' }}>
            <div className="text-lg text-white">Loading store...</div>
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
              <div>
                <h1 className="text-2xl font-bold text-white">Alpha Store</h1>
                <p className="text-gray-400">Spend your Alpha Coins on premium features and upgrades.</p>
              </div>
              <div className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                <span className="text-xl font-bold text-yellow-400">{profile?.alpha_coins || 0} AC</span>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="container mx-auto px-6 py-8" style={{ backgroundColor: '#0B0F19' }}>
            {storeItems.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">Store Coming Soon</h3>
                  <p className="text-gray-400">Premium features and upgrades will be available here soon!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storeItems.map((item) => {
                  const isOwned = userInventory.includes(item.id);
                  const isPurchasing = purchasing === item.id;
                  const canAfford = profile && profile.alpha_coins >= item.price;

                  return (
                    <Card key={item.id} className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white">{item.name}</CardTitle>
                          {getCategoryIcon(item.category)}
                        </div>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className={getCategoryColor(item.category)}>
                              {item.category}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <Coins className="w-4 h-4 text-yellow-500" />
                              <span className="font-bold text-yellow-400">{item.price} AC</span>
                            </div>
                          </div>
                          
                          {isOwned ? (
                            <Button className="w-full" disabled>
                              <Package className="w-4 h-4 mr-2" />
                              Owned
                            </Button>
                          ) : (
                            <Button 
                              className="w-full"
                              onClick={() => purchaseItem(item)}
                              disabled={!canAfford || isPurchasing || !user}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              {isPurchasing ? 'Purchasing...' : 'Purchase'}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Store;

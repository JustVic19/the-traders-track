
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

// Placeholder store items until database table is created
interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_available: boolean;
}

const Store = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Placeholder store items
  const storeItems: StoreItem[] = [
    {
      id: '1',
      name: 'Advanced Analytics',
      description: 'Unlock detailed performance analytics and insights',
      price: 500,
      category: 'premium',
      is_available: true
    },
    {
      id: '2',
      name: 'Trade Journal Pro',
      description: 'Enhanced journaling features with AI insights',
      price: 300,
      category: 'premium',
      is_available: true
    },
    {
      id: '3',
      name: 'Risk Calculator',
      description: 'Advanced risk management tools',
      price: 200,
      category: 'tools',
      is_available: true
    }
  ];

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
    if (!profile || profile.alpha_coins < item.price) {
      toast({
        title: "Insufficient Alpha Coins",
        description: `You need ${item.price} Alpha Coins to purchase this item.`,
        variant: "destructive",
      });
      return;
    }

    // For now, just show a message that this is a placeholder
    toast({
      title: "Store Coming Soon",
      description: "The store functionality will be available soon!",
      variant: "default",
    });
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-900">
          <AppSidebar profile={profile} />
          <SidebarInset className="flex-1 flex items-center justify-center">
            <div className="text-lg text-white">Loading store...</div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-900">
        <AppSidebar profile={profile} />
        <SidebarInset className="flex-1">
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
          <main className="container mx-auto px-6 py-8">
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
                {storeItems.map((item) => (
                  <Card key={item.id} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{item.name}</CardTitle>
                        {item.category === 'premium' && (
                          <Star className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{item.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            {item.category}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Coins className="w-4 h-4 text-yellow-500" />
                            <span className="font-bold text-yellow-400">{item.price} AC</span>
                          </div>
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => purchaseItem(item)}
                          disabled={!profile || profile.alpha_coins < item.price}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Purchase
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Store;
